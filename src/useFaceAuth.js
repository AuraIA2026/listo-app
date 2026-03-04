import { useRef, useState, useCallback } from 'react'
import { db } from './firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// Carga face-api.js desde CDN dinámicamente
const loadFaceApi = () => {
  return new Promise((resolve, reject) => {
    if (window.faceapi) return resolve(window.faceapi)
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js'
    script.onload = () => resolve(window.faceapi)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

export function useFaceAuth() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | loading | ready | scanning | success | error
  const [message, setMessage] = useState('')

  const loadModels = useCallback(async () => {
    setStatus('loading')
    setMessage('Cargando modelos de reconocimiento...')
    const faceapi = await loadFaceApi()
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ])
    return faceapi
  }, [])

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await new Promise(res => { videoRef.current.onloadedmetadata = res })
      videoRef.current.play()
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setStatus('idle')
    setMessage('')
  }, [])

  const getDescriptor = useCallback(async (faceapi) => {
    setStatus('scanning')
    setMessage('Detectando tu rostro...')
    
    // Intenta hasta 20 veces en 10 segundos
    for (let i = 0; i < 20; i++) {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (detection) {
        return Array.from(detection.descriptor)
      }
      await new Promise(r => setTimeout(r, 500))
    }
    throw new Error('No se detectó ningún rostro. Asegúrate de estar frente a la cámara.')
  }, [])

  // Registrar rostro de un usuario (llamar al crear cuenta)
  const registerFace = useCallback(async (userId) => {
    try {
      const faceapi = await loadModels()
      await startCamera()
      setStatus('ready')
      setMessage('Mira hacia la cámara y mantente quieto')
      await new Promise(r => setTimeout(r, 2000))

      const descriptor = await getDescriptor(faceapi)
      
      await setDoc(doc(db, 'users', userId), {
        faceDescriptor: descriptor,
        faceRegisteredAt: new Date()
      }, { merge: true })

      setStatus('success')
      setMessage('¡Rostro registrado exitosamente!')
      stopCamera()
      return true
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Error al registrar rostro')
      stopCamera()
      return false
    }
  }, [loadModels, startCamera, stopCamera, getDescriptor])

  // Verificar rostro al hacer login
  const verifyFace = useCallback(async (userId) => {
    try {
      const faceapi = await loadModels()
      
      // Cargar descriptor guardado
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists() || !userDoc.data().faceDescriptor) {
        throw new Error('No tienes un rostro registrado. Regístrate primero.')
      }
      
      const savedDescriptor = new Float32Array(userDoc.data().faceDescriptor)
      
      await startCamera()
      setStatus('ready')
      setMessage('Mira hacia la cámara para verificar tu identidad')
      await new Promise(r => setTimeout(r, 1500))

      const liveDescriptor = new Float32Array(await getDescriptor(faceapi))
      
      // Calcular distancia euclidiana (< 0.6 = misma persona)
      const distance = faceapi.euclideanDistance(savedDescriptor, liveDescriptor)
      
      stopCamera()
      
      if (distance < 0.6) {
        setStatus('success')
        setMessage('¡Identidad verificada!')
        return true
      } else {
        setStatus('error')
        setMessage('Rostro no reconocido. Intenta de nuevo.')
        return false
      }
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Error al verificar rostro')
      stopCamera()
      return false
    }
  }, [loadModels, startCamera, stopCamera, getDescriptor])

  return { videoRef, status, message, registerFace, verifyFace, stopCamera }
}