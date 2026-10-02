import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, onSnapshot } from 'firebase/firestore'

const norm = (str) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

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

      snapshot.forEach(doc => {
        const data = doc.data()
        const isRejected = data.status === 'rejected' || data.moderated === 'rejected' || data.approved === false || data.rejected === true
        const isApproved = (data.status === 'approved' || data.approved === true || (data.moderated === true && data.status !== 'rejected')) && !isRejected
        
        let expiresTime = 0
        if (data.expiresAt) {
          expiresTime = new Date(data.expiresAt).getTime()
        } else if (data.createdAt) {
          expiresTime = new Date(data.createdAt).getTime() + (24 * 60 * 60 * 1000)
        } else {
          expiresTime = Date.now() + (24 * 60 * 60 * 1000)
        }

        if (isApproved && !isRejected && expiresTime > now) {
          fetched.push({ id: doc.id, ...data })
        }
      })

      fetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      setStories(fetched)
    }, (error) => {
      console.log('Error reading historias snapshot:', error)
    })

    return () => unsubscribe()
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
