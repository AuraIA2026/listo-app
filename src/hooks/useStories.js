import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, onSnapshot } from 'firebase/firestore'

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
        const isApproved = data.status === 'approved' || data.moderated === true
        
        let expiresTime = 0
        if (data.expiresAt) {
          expiresTime = new Date(data.expiresAt).getTime()
        } else if (data.createdAt) {
          expiresTime = new Date(data.createdAt).getTime() + (24 * 60 * 60 * 1000)
        }

        if (isApproved && expiresTime > now) {
          fetched.push({ id: doc.id, ...data })
        }
      })

      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setStories(fetched)
    }, (error) => {
      console.log('Error reading historias snapshot:', error)
    })

    return () => unsubscribe()
  }, [])

  // Map stories by pro identifier (uid/id or name)
  const storiesByPro = {}
  stories.forEach((story, idx) => {
    const uid = story.proId || story.proUid
    const nameClean = String(story.proName || story.fullName || '').toLowerCase().trim()
    
    if (uid) {
      if (!storiesByPro[uid]) storiesByPro[uid] = []
      storiesByPro[uid].push({ story, index: idx })
    }
    if (nameClean) {
      if (!storiesByPro[nameClean]) storiesByPro[nameClean] = []
      storiesByPro[nameClean].push({ story, index: idx })
    }
  })

  const getProStoryData = (pro) => {
    if (!pro) return null
    const uid = pro.id || pro.uid || pro.proId || pro.proUid
    const nameClean = String(pro.name || pro.nameEs || pro.proName || pro.fullName || '').toLowerCase().trim()

    const list = (uid && storiesByPro[uid]) || (nameClean && storiesByPro[nameClean]) || null
    if (!list || list.length === 0) return null

    const firstIndex = list[0].index
    const allStoryIds = list.map(item => item.story.id)
    const isAllSeen = allStoryIds.every(id => seenStories.includes(id))

    return {
      stories: list.map(item => item.story),
      firstIndex,
      isAllSeen,
      count: list.length
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
