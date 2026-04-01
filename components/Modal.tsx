'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center px-6 py-5 border-b border-[#eee]">
            <h2 className="text-lg font-black text-black">{title}</h2>
            <button onClick={onClose} className="text-[#aaa] hover:text-black text-lg transition-colors">
              ✕
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
          {footer && <div className="px-6 py-5 border-t border-[#eee]">{footer}</div>}
        </div>
      </div>
    </>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}

export function ConfirmModal({
  isOpen, title, message, onConfirm, onCancel,
  confirmText = '확인', cancelText = '취소',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-[#555] mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333] rounded-full font-bold transition text-sm"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-full font-bold transition text-sm"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
