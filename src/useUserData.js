// useUserData.js — Hook centralizado para datos del usuario
// Conecta directamente con Firestore en tiempo real
// Úsalo en ProfilePage, BottomNav, HomePage, o cualquier componente que necesite datos del usuario

import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase'

export function useUserData() {
  const [userData,  setUserData]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [authUser,  setAuthUser]  = useState(null)

  useEffect(() => {
    let unsubSnap = null

    // Escucha cambios de autenticación
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubSnap) { unsubSnap(); unsubSnap = null }

      if (firebaseUser) {
        setAuthUser(firebaseUser)
        // Escucha cambios en Firestore en tiempo real
        unsubSnap = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              setUserData({
                ...snap.data(),
                uid:   firebaseUser.uid,
                email: firebaseUser.email,
              })
            }
            setLoading(false)
          },
          (err) => {
            console.error('useUserData error:', err)
            setLoading(false)
          }
        )
      } else {
        setAuthUser(null)
        setUserData(null)
        setLoading(false)
      }
    })

    return () => {
      unsubAuth()
      if (unsubSnap) unsubSnap()
    }
  }, [])

  const getInitials = (name) => {
    if (!name) return '?'
    return String(name).trim().split(' ').map(n => String(n)[0] || '').join('').toUpperCase().slice(0, 2)
  }

  const getMemberSince = (lang = 'es') => {
    if (!userData?.createdAt) return '—'
    try {
      const date = userData.createdAt.toDate
        ? userData.createdAt.toDate()
        : new Date(userData.createdAt)
      return date.toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', {
        month: 'short', year: 'numeric'
      })
    } catch { return '—' }
  }

  const userRole     = (userData?.type === 'pro' || userData?.role === 'professional' || userData?.verificacion?.estado === 'aprobada') ? 'pro' : 'user'
  const profileComplete = userData?.profileComplete || userData?.verificacion?.estado === 'aprobada' || false

  return {
    userData,
    loading,
    authUser,
    userRole,
    profileComplete,
    getInitials,
    getMemberSince,
  }
}