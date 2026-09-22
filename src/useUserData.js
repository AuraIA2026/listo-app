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

              // Verificar si el plan (básico o pagado) ya venció según planExpirationDate
              if ((data.type === 'pro' || data.role === 'professional') && data.planStatus === 'active' && data.planExpirationDate) {
                try {
                  const expDate = new Date(data.planExpirationDate);
                  const now = new Date();
                  if (now >= expDate) {
                    // Expiró el plan. Cambiar a expirado en Firestore y apagar disponibilidad
                    const updatePayload = {
                      planStatus: 'expired',
                      contracts: 0,
                      available: false
                    };
                    // Si el plan era el básico de 3 meses gratis, al expirar lo convertimos a standard
                    if (data.plan === 'basico') {
                      updatePayload.plan = 'standard';
                    }
                    await updateDoc(doc(db, 'users', firebaseUser.uid), updatePayload);
                  }
                } catch (e) {
                  console.error("Error auto-expiring plan:", e);
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

  const userRole = (userData?.type === 'pro' || userData?.role === 'professional' || userData?.role === 'pro' || userData?.verificacion?.estado === 'aprobada' || userData?.verificacion?.estado === 'verificado') ? 'pro' : 'user'

  const isPro = Boolean(
    userData?.type === 'pro' || 
    userData?.role === 'professional' || 
    userData?.role === 'pro' ||
    userData?.verificacion || 
    userData?.category || 
    userData?.especialidad
  );

  let profileComplete = false;

  if (isPro) {
    const vf = userData?.verificacion || {};
    const vfDocs = vf.docs || {};
    const hasCedulaFront = Boolean(vfDocs.cedulaFrontal || userData?.cedulaFrontal);
    const hasCedulaBack  = Boolean(vfDocs.cedulaTrasera || userData?.cedulaTrasera);
    const hasSelfie      = Boolean(vfDocs.selfie || userData?.selfie);
    const hasConducta    = Boolean(vfDocs.buenaConducta || userData?.buenaConducta);
    const hasProfession  = Boolean(userData?.category || vf.especialidad || userData?.especialidad);

    const hasAllRequirements = hasCedulaFront && hasCedulaBack && hasSelfie && hasConducta && hasProfession;
    const isApproved = vf.estado === 'aprobada' || vf.estado === 'verificado' || userData?.approved === true;

    profileComplete = Boolean(hasAllRequirements && isApproved);
  } else {
    profileComplete = Boolean(userData?.profileComplete || (userData?.name && userData?.phone));
  }

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