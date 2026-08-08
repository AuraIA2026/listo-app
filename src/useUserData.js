// useUserData.js — Hook centralizado para datos del usuario
// Conecta directamente con Firestore en tiempo real
// Úsalo en ProfilePage, BottomNav, HomePage, o cualquier componente que necesite datos del usuario

import React, { useState, useEffect, createContext, useContext } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const UserContext = createContext(null)

export function UserProvider({ children }) {
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
          async (snap) => {
            if (snap.exists()) {
              const data = snap.data()
              setUserData({
                ...data,
                uid:   firebaseUser.uid,
                email: firebaseUser.email,
              })

              // Verificar si el plan Básico de 3 meses gratis ya expiró
              if ((data.type === 'pro' || data.role === 'professional') && data.plan === 'basico' && data.createdAt) {
                try {
                  const regDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                  const diffTime = new Date() - regDate;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays > 90) {
                    // Expiró el plan básico de 3 meses gratis. Se convierte a plan standard (RD$500/mes)
                    await updateDoc(doc(db, 'users', firebaseUser.uid), {
                      plan: 'standard',
                      planStatus: 'expired', // Requiere pago de RD$500 para reactivarse
                      contracts: 0           // Se agotan los contratos gratis
                    });
                  }
                } catch (e) {
                  console.error("Error auto-updating expired plan:", e);
                }
              }
            }
            setLoading(false)
          },
          (err) => {
            console.error('useUserData Context error:', err)
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

  const value = {
    userData,
    loading,
    authUser,
    userRole,
    profileComplete,
    getInitials,
    getMemberSince,
  }

  return React.createElement(UserContext.Provider, { value }, children)
}

export function useUserData() {
  const context = useContext(UserContext)
  if (context === undefined || context === null) {
    throw new Error('useUserData must be used within a UserProvider')
  }
  return context
}