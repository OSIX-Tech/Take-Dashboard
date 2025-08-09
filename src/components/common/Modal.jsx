import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

const Modal = ({ isOpen, onClose, children }) => {
  const backdropRef = useRef(null)
  const modalRef = useRef(null)
  
  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  // Separate effect for GSAP animations - only runs when modal opens
  useEffect(() => {
    if (isOpen) {
      // GSAP animations for opening - simple scale fade
      if (backdropRef.current) {
        gsap.fromTo(backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
      }
      
      if (modalRef.current) {
        gsap.fromTo(modalRef.current,
          { 
            opacity: 0,
            scale: 0.95
          },
          { 
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          }
        )
      }
    }
  }, [isOpen]) // Only depend on isOpen, not onClose
  
  if (!isOpen) return null
  
  const handleClose = () => {
    // GSAP animations for closing - simple fade
    if (backdropRef.current && modalRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      })
      
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose
      })
    } else {
      onClose()
    }
  }
  
  return createPortal(
    <>
      {/* Backdrop with blur */}
      <div 
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Modal with macOS sheet style */}
      <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="relative w-full max-w-md pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="glass bg-white/95 rounded-3xl shadow-macos-xl overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default Modal 