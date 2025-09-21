import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadService } from '@/services/uploadService'

function ImageUpload({ 
  currentImageUrl = null, 
  onImageUploaded, 
  folder = 'menu-items',
  className = '',
  disabled = false,
  // mode: 'auto' sube inmediatamente; 'deferred' solo selecciona archivo y devuelve el File
  mode = 'auto',
  onFileSelected
}) {
  const isTouchDevice = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const inputId = useMemo(() => `image-upload-${Math.random().toString(36).substr(2, 9)}`, [])
  
  // Update preview when currentImageUrl changes
  useEffect(() => {
    setPreviewUrl(currentImageUrl)
  }, [currentImageUrl])

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isTouchDevice) {
      setIsDragging(true)
    }
  }, [disabled, isTouchDevice])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isTouchDevice) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isTouchDevice) setIsDragging(false)
    
    if (disabled || isTouchDevice) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [disabled, isTouchDevice])

  // Handle file selection
  const handleFileSelect = (e) => {
        const file = e.target.files[0]
    if (file) {
            handleFile(file)
    }
  }

  // Process the selected file
  const handleFile = async (file) => {
    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('La imagen no debe superar los 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)

    if (mode === 'deferred') {
      // Modo diferido: no subir, solo devolver el File
      if (onFileSelected) {
        onFileSelected(file)
      }
      return
    }

    // Upload to Supabase (modo auto)
    setIsUploading(true)
    try {
      const result = await uploadService.uploadImage(file, folder)
      if (result.url) {
        setPreviewUrl(result.url)
        onImageUploaded(result.url)
      }
    } catch (err) {
            setError(err.message || 'Error al subir la imagen')
      setPreviewUrl(currentImageUrl) // Revert to original
    } finally {
      setIsUploading(false)
    }
  }

  // Remove image
  const handleRemoveImage = async () => {
    if (mode === 'auto') {
      if (previewUrl && previewUrl !== currentImageUrl && typeof previewUrl === 'string' && previewUrl.includes('/storage/v1/object/public/')) {
        // Try to delete only if it looks like a stored public URL
        await uploadService.deleteImage(previewUrl)
      }
    }
    // Always clear preview
    setPreviewUrl(null)
    setError(null)
    // Notify parent to clear both the selected file and the URL
    if (onFileSelected) onFileSelected(null)
    if (onImageUploaded) onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Drop zone / Preview */}
      <div
        onDragEnter={!isTouchDevice ? handleDragEnter : undefined}
        onDragLeave={!isTouchDevice ? handleDragLeave : undefined}
        onDragOver={!isTouchDevice ? handleDragOver : undefined}
        onDrop={!isTouchDevice ? handleDrop : undefined}
        className={`
          relative border-2 ${!isTouchDevice ? 'border-dashed' : ''} rounded-lg transition-all duration-200
          ${isDragging ? 'border-black bg-gray-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${previewUrl ? 'h-48' : 'h-32'}
        `}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled && !previewUrl && fileInputRef.current) {
                        fileInputRef.current.click()
          }
        }}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Subiendo imagen...</p>
            </div>
          </div>
        )}

        {previewUrl ? (
          <div className="relative h-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage()
                }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              {isTouchDevice
                ? 'Toca para seleccionar o tomar una foto'
                : (isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic para seleccionar')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF hasta 5MB
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Botón visible para seleccionar/cambiar imagen - usando label */}
      {!disabled && (
        <label
          htmlFor={inputId}
          onClick={(e) => e.stopPropagation()}
          className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-black cursor-pointer inline-flex items-center justify-center"
        >
          <Upload className="w-4 h-4 inline-block mr-2" />
          {previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </label>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload