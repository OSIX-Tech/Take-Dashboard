import React from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Modal from '@/components/common/Modal'

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  itemName = null
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 sm:p-8">
        <div className="flex flex-col items-center">
          {/* Icon with background */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          
          {/* Title and message */}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {itemName && (
              <p className="mt-1 text-sm font-medium text-gray-700">
                "{itemName}"
              </p>
            )}
            <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
              {message}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 text-gray-700 bg-white border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-sm"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteConfirmationModal