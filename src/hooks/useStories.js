import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, deleteField } from 'firebase/firestore'

const norm = (str) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export const parseStoryTimeMs = (val) => {
  if (!val) return 0
  if (typeof val === 'number') return val
  if (typeof val?.toMillis === 'function') return val.toMillis()
  if (typeof val?.seconds === 'number') return val.seconds * 1000
  const parsed = new Date(val).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

export const getStoryExpirationMs = (data) => {
  if (!data) return 0
  const expMs = parseStoryTimeMs(data.expiresAt)
  const createdMs = parseStoryTimeMs(data.createdAt || data.timestamp || data.date)
  if (createdMs > 0) {
    // Nunca permitir que una historia dure más de 24h desde su creación
    const maxExpFromCreated = createdMs + TWENTY_FOUR_HOURS_MS
    return expMs > 0 ? Math.min(expMs, maxExpFromCreated) : maxExpFromCreated
  }
  return expMs
}

export const deleteExpiredStoryFromDb = async (storyId) => {
  if (!storyId) return
  const storyRef = doc(db, 'historias', storyId)
  try {
    await deleteDoc(storyRef)
  } catch (err) {
    // Fallback: borrar campos pesados de imagen/video si deleteDoc falla por caché
    try {
      await updateDoc(storyRef, {
        imageUrl: deleteField(),
        videoUrl: deleteField(),
        status: 'expired'
      })
      await deleteDoc(storyRef)
    } catch (_) {}
  }
}

export function useStories() {
  const [stories, setStories] = useState([])
  const [seenStories, setSeenStories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('listo_seen_stories') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    const qStories = query(collection(db, 'historias'))
    const unsubscribe = onSnapshot(qStories, (snapshot) => {
      const fetched = []
      const now = Date.now()

      snapshot.forEach(docSnap => {
        const data = docSnap.data()
        const isExpiredOrDeleted = data.status === 'expired' || data.status === 'deleted'
        const isRejected = data.status === 'rejected' || data.moderated === 'rejected' || data.approved === false || data.rejected === true
        const isApproved = (data.status === 'approved' || data.approved === true || (data.moderated === true && data.status !== 'rejected')) && !isRejected

        const expiresTime = getStoryExpirationMs(data)

        // Si ya pasaron las 24 horas (o no tiene fecha válida / está marcada expirada), borrar imagen y documento de Firestore
        if (isExpiredOrDeleted || expiresTime <= 0 || expiresTime <= now) {
          deleteExpiredStoryFromDb(docSnap.id)
          return
        }

        if (isApproved && !isRejected && expiresTime > now) {
          fetched.push({ id: docSnap.id, ...data })
        }
      })

      fetched.sort((a, b) => parseStoryTimeMs(b.createdAt) - parseStoryTimeMs(a.createdAt))
      setStories(fetched)
    }, (error) => {
      console.log('Error reading historias snapshot:', error)
    })

    // Revisión periódica cada 60s para borrar historias cuya imagen cumpla 24h
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setStories(prev => prev.filter(s => {
        const exp = getStoryExpirationMs(s)
        if (exp <= 0 || exp <= now) {
          deleteExpiredStoryFromDb(s.id)
          return false
        }
        return true
      }))
    }, 60000)

    return () => {
      unsubscribe()
      clearInterval(cleanupInterval)
    }
  }, [])

  const getProStoryData = (pro) => {
    if (!pro) return null

    const uid = String(pro.id || pro.uid || pro.proId || pro.proUid || pro.userId || '').trim()
    const proNameNorm = norm(pro.name || pro.nameEs || pro.proName || pro.fullName || pro.displayName)
    const firstName = proNameNorm.split(' ')[0]

    let matchedItems = []

    stories.forEach((story, idx) => {
      const storyUid = String(story.proId || story.proUid || story.userId || story.uid || '').trim()
      const storyNameNorm = norm(story.proName || story.fullName || story.userName || story.name)
      const storyFirstName = storyNameNorm.split(' ')[0]

      let isMatch = false
      if (uid && storyUid && uid === storyUid) {
        isMatch = true
      } else if (proNameNorm && storyNameNorm && (proNameNorm === storyNameNorm || proNameNorm.includes(storyNameNorm) || storyNameNorm.includes(proNameNorm))) {
        isMatch = true
      } else if (firstName && firstName.length >= 3 && storyFirstName && firstName === storyFirstName) {
        isMatch = true
      }

      if (isMatch) {
        matchedItems.push({ story, index: idx })
      }
    })

    if (matchedItems.length === 0) return null

    const firstIndex = matchedItems[0].index
    const allStoryIds = matchedItems.map(item => item.story.id)
    const isAllSeen = allStoryIds.every(id => seenStories.includes(id))

    return {
      stories: matchedItems.map(item => item.story),
      firstIndex,
      isAllSeen,
      count: matchedItems.length
    }
  }

  const markStoryAsSeen = (storyId) => {
    if (!storyId) return
    setSeenStories(prev => {
      if (!prev.includes(storyId)) {
        const next = [...prev, storyId]
        localStorage.setItem('listo_seen_stories', JSON.stringify(next))
        return next
      }
      return prev
    })
  }

  return {
    stories,
    seenStories,
    getProStoryData,
    markStoryAsSeen
  }
}
