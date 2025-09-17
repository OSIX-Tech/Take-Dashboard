import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Gift, Star, X, Trophy, Coffee, Target, Award } from 'lucide-react'
import gsap from 'gsap'
import { rewardsService } from '@/services/rewardsService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import Modal from '@/components/common/Modal'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'
import ImageUpload from '@/components/ImageUpload'

const Rewards = () => {
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingReward, setEditingReward] = useState(null)
  const [rewardToDelete, setRewardToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    required_seals: '',
    image_url: ''
  })
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  
  // Refs para mantener el foco
  const nameInputRef = useRef(null)
  const descriptionInputRef = useRef(null)
  const sealsInputRef = useRef(null)

  useEffect(() => {
    fetchRewards()
  }, [])

  // Simple GSAP animation for reward cards
  useEffect(() => {
    if (rewards.length > 0) {
      const cards = document.querySelectorAll('.reward-card')
      
      gsap.fromTo(cards,
        { 
          opacity: 0,
          scale: 0.98
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.02,
          ease: 'power2.out'
        }
      )
    }
  }, [rewards])

  const fetchRewards = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await rewardsService.getRewards()
      // El servicio ya maneja la extracción de datos
      setRewards(response || [])
    } catch (err) {
      setError('Error al cargar recompensas')
      setRewards([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingReward(null)
    setFormData({
      name: '',
      required_seals: '',
      description: '',
      image_url: '',
      active: true
    })
    setSelectedImageFile(null)
    setShowForm(true)
  }

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleEdit = (reward) => {
    setEditingReward(reward)
    setFormData({
      name: reward.name || '',
      description: reward.description || '',
      required_seals: reward.required_seals || '',
      image_url: reward.image_url || ''
    })
    setSelectedImageFile(null)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setRewardToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!rewardToDelete) return
    try {
      await rewardsService.deleteReward(rewardToDelete)
      setRewards(rewards.filter(reward => reward.id !== rewardToDelete))
      setShowDeleteModal(false)
      setRewardToDelete(null)
    } catch (error) {
      console.error('Error deleting reward:', error)
      setError('Error al eliminar la recompensa')
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setRewardToDelete(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos
    if (!formData.name.trim()) {
      alert('El nombre es requerido')
      return
    }
    
    if (!formData.description.trim()) {
      alert('La descripción es requerida')
      return
    }
    
    if (formData.required_seals === '' || formData.required_seals < 0) {
      alert('La cantidad de sellos debe ser 0 o mayor')
      return
    }
    
    // Validate image is required
    if (!formData.image_url && !selectedImageFile) {
      alert('El icono es obligatorio')
      return
    }

    try {
      // No enviar icon_url al backend, solo los datos básicos
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        required_seals: parseInt(formData.required_seals)
      }

      console.log('🚀 Submitting reward data:', payload)
      console.log('📸 Image file:', selectedImageFile)

      if (editingReward) {
        console.log('📝 Updating reward:', editingReward.id)
        // Always use multipart endpoint for rewards
        const response = await rewardsService.updateRewardWithImage(editingReward.id, payload, selectedImageFile)
        console.log('✅ Reward updated:', response)

        // Update reward locally after successful save (use response which has the icon_url)
        setRewards(rewards.map(reward =>
          reward.id === editingReward.id
            ? response.data || response
            : reward
        ))
        setEditingReward(null)
      } else {
        console.log('➕ Creating new reward')
        // Always use multipart endpoint for rewards
        const response = await rewardsService.createRewardWithImage(payload, selectedImageFile)
        console.log('✅ Reward created:', response)
        
        // Add new reward to list
        const newReward = response.data || response
        setRewards([...rewards, newReward])
      }
      
      setShowForm(false)
      setEditingReward(null)
      setFormData({ name: '', description: '', required_seals: '', image_url: '' })
      setSelectedImageFile(null)
    } catch (error) {
      console.error('Error saving reward:', error)
      setError('Error al guardar la recompensa')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingReward(null)
    setFormData({ name: '', description: '', required_seals: '', image_url: '' })
    setSelectedImageFile(null)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Recompensas</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Gestiona las recompensas del programa de fidelidad
          </p>
        </div>
        <Button onClick={handleCreate} className="px-4 sm:px-6 py-2 text-sm lg:text-base">
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          Nueva Recompensa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="reward-card bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recompensas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{rewards.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Gift className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="reward-card bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Sellos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {rewards.length > 0 
                    ? Math.round(rewards.reduce((acc, r) => acc + r.required_seals, 0) / rewards.length)
                    : 0}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Star className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="reward-card bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Máximo Sellos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {rewards.length > 0 
                    ? Math.max(...rewards.map(r => r.required_seals))
                    : 0}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Trophy className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {rewards.map((reward) => (
          <Card key={reward.id} className="reward-card bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            {/* Imagen destacada */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
              {reward.image_url ? (
                <img 
                  src={reward.image_url} 
                  alt={reward.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`fallback-icon absolute inset-0 flex items-center justify-center ${reward.image_url ? 'hidden' : ''}`}>
                <div className="p-6 bg-white/80 backdrop-blur rounded-full">
                  <Award className="w-16 h-16 text-gray-600" />
                </div>
              </div>
              {/* Badge de sellos requeridos */}
              <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full flex items-center gap-1">
                <Coffee className="w-4 h-4" />
                <span className="font-bold">{reward.required_seals}</span>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {reward.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{reward.description || 'Sin descripción'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Visual representation with coffee cups */}
              <div className="flex items-center space-x-1 mb-4">
                {reward.required_seals === 0 ? (
                  <span className="text-sm text-gray-500">Sin sellos requeridos</span>
                ) : (
                  <>
                    {[...Array(Math.min(reward.required_seals, 8))].map((_, i) => (
                      <Coffee key={i} className="w-4 h-4 text-gray-400" />
                    ))}
                    {reward.required_seals > 8 && (
                      <span className="text-sm text-gray-500 ml-1">+{reward.required_seals - 8}</span>
                    )}
                  </>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <Button
                  onClick={() => handleEdit(reward)}
                  size="sm"
                  variant="ghost"
                  className="p-2 bg-gray-50 rounded-lg"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </Button>
                <Button
                  onClick={() => handleDelete(reward.id)}
                  size="sm"
                  variant="ghost"
                  className="p-2 bg-gray-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {rewards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Gift className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay recompensas</h3>
          <p className="text-sm text-gray-600 text-center max-w-sm mb-4">
            Crea tu primera recompensa para el programa de fidelidad
          </p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Recompensa
          </Button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <Modal isOpen={showForm} onClose={handleCancel}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <Input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Café Gratis"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <Input
                ref={descriptionInputRef}
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Ej: Un café gratis de tu elección"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sellos Requeridos *
              </label>
              <Input
                ref={sealsInputRef}
                type="number"
                value={formData.required_seals}
                onChange={(e) => handleInputChange('required_seals', e.target.value)}
                placeholder="10"
                min="0"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icono *
              </label>
              <ImageUpload
                key={editingReward?.id || 'new'}
                currentImageUrl={formData.image_url || ''}
                mode="deferred"
                onFileSelected={(file) => {
                  console.log('🎯 File selected in Rewards:', file)
                  setSelectedImageFile(file)
                }}
                onImageUploaded={(url) => {
                  console.log('📍 Image URL updated:', url)
                  setFormData(prev => ({...prev, image_url: url}))
                }}
                folder="rewards"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingReward ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message="¿Estás seguro de que deseas eliminar esta recompensa?"
        confirmText="Eliminar recompensa"
      />
    </div>
  )
}

export default Rewards