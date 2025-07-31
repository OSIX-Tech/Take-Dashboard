import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Gift, Star, X } from 'lucide-react'
import { rewardsService } from '@/services/rewardsService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import Modal from '@/components/common/Modal'

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
    required_seals: ''
  })
  
  // Refs para mantener el foco
  const nameInputRef = useRef(null)
  const descriptionInputRef = useRef(null)
  const sealsInputRef = useRef(null)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await rewardsService.getRewards()
      if (Array.isArray(response)) {
        setRewards(response)
      } else if (response && response.data) {
        setRewards(response.data)
      } else {
        setRewards([])
      }
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
      active: true
    })
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
      required_seals: reward.required_seals || ''
    })
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
    setLoading(true)
    try {
      if (editingReward) {
        await rewardsService.updateReward(editingReward.id, formData)
      } else {
        await rewardsService.createReward(formData)
      }
      setShowForm(false)
      setEditingReward(null)
      setFormData({ name: '', required_seals: '', description: '' })
      await fetchRewards()
    } catch (err) {
      setError('Error al guardar la recompensa')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!rewards || rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Gift className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">No hay recompensas aún</h2>
        <p className="text-gray-500">¡Crea una recompensa para empezar!</p>
        <Button onClick={handleCreate} className="mt-4">
          <Plus className="w-4 h-4 mr-2" /> Crear Recompensa
        </Button>
        <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingReward ? 'Editar Recompensa' : 'Crear Recompensa'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="h-8 w-8 p-0 hover:bg-gray-100">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Nombre de la recompensa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <Input
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Descripción de la recompensa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sellos Requeridos</label>
                <Input
                  type="number"
                  value={formData.required_seals}
                  onChange={e => handleInputChange('required_seals', e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">{editingReward ? 'Actualizar' : 'Crear'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Recompensas</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Gestiona las recompensas y sellos de los usuarios</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" /> Crear Recompensa
        </Button>
      </div>
      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {rewards.map((reward) => (
          <Card key={reward.id} className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 overflow-hidden transform hover:-translate-y-1">
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Gift className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                  </div>
                  <h3 className="text-base lg:text-lg font-bold text-gray-900">{reward.name}</h3>
                </div>
              </div>
              <p className="text-sm lg:text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">{reward.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                  <span className="text-sm lg:text-base font-semibold text-gray-900">{reward.required_seals} sellos</span>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(reward)} className="h-7 w-7 p-0 text-gray-600 hover:text-gray-900"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(reward.id)} className="h-7 w-7 p-0 text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingReward ? 'Editar Recompensa' : 'Crear Recompensa'}</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="h-8 w-8 p-0 hover:bg-gray-100"><Trash2 className="w-4 h-4" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <Input
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Nombre de la recompensa"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <Input
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Descripción de la recompensa"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sellos Requeridos</label>
              <Input
                type="number"
                value={formData.required_seals}
                onChange={e => handleInputChange('required_seals', e.target.value)}
                placeholder="10"
                required
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1">{editingReward ? 'Actualizar' : 'Crear'}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            </div>
          </form>
        </div>
      </Modal>
      <Modal isOpen={showDeleteModal} onClose={cancelDelete}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Confirmar Eliminación</h2>
          <p className="text-gray-700 mb-4">¿Estás seguro de que quieres eliminar esta recompensa?</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={cancelDelete} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Rewards 