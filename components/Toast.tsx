'use client'

import { useEffect, useState } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

let toastId = 0
let toastListener: ((toast: ToastMessage) => void) | null = null

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
  const id = `toast-${++toastId}`
  const toast: ToastMessage = {
    id,
    type,
    message,
    duration,
  }

  if (toastListener) {
    toastListener(toast)
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    toastListener = (toast) => {
      setToasts((prev) => [...prev, toast])

      if (toast.duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, toast.duration)
      }
    }

    return () => {
      toastListener = null
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg text-white animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-green-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : 'bg-blue-600'
          }`}
        >
          <div className="flex justify-between items-center gap-4">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:opacity-80"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
