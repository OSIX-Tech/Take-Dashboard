import React from 'react'
import { createPortal } from 'react-dom'

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null
  
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="relative bg-white rounded-lg shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal 