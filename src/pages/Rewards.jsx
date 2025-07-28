import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Gift, Plus, Edit, Trash2, Star, Users, Coffee, Trophy } from 'lucide-react'

function Rewards() {
  const [rewards, setRewards] = useState([
    {
      id: 1,
      name: "Recompensa 1",
      description: "Descripción de la recompensa 1",
      sealsRequired: 10,
      active: true
    },
    {
      id: 2,
      name: "Recompensa 2",
      description: "Descripción de la recompensa 2",
      sealsRequired: 15,
      active: true
    },
    {
      id: 3,
      name: "Recompensa 3",
      description: "Descripción de la recompensa 3",
      sealsRequired: 20,
      active: true
    },
    {
      id: 4,
      name: "Recompensa 4",
      description: "Descripción de la recompensa 4",
      sealsRequired: 25,
      active: false
    },
    {
      id: 5,
      name: "Recompensa 5",
      description: "Descripción de la recompensa 5",
      sealsRequired: 30,
      active: true
    },
    {
      id: 6,
      name: "Recompensa 6",
      description: "Descripción de la recompensa 6",
      sealsRequired: 35,
      active: true
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingReward, setEditingReward] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    sealsRequired: '',
    description: '',
    active: true
  })

  // Modal component using portal
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return createPortal(
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      >
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

  // Mock user data with seals
  const usersWithSeals = [
    {
      id: 1,
      name: "Usuario 1",
      email: "usuario1@example.com",
      total_seals: 45,
      current_seals: 12
    },
    {
      id: 2,
      name: "Usuario 2",
      email: "usuario2@example.com",
      total_seals: 38,
      current_seals: 8
    },
    {
      id: 3,
      name: "Usuario 3",
      email: "usuario3@example.com",
      total_seals: 52,
      current_seals: 22
    },
    {
      id: 4,
      name: "Usuario 4",
      email: "usuario4@example.com",
      total_seals: 29,
      current_seals: 9
    },
    {
      id: 5,
      name: "Usuario 5",
      email: "usuario5@example.com",
      total_seals: 67,
      current_seals: 17
    },
    {
      id: 6,
      name: "Usuario 6",
      email: "usuario6@example.com",
      total_seals: 41,
      current_seals: 11
    },
    {
      id: 7,
      name: "Usuario 7",
      email: "usuario7@example.com",
      total_seals: 33,
      current_seals: 13
    },
    {
      id: 8,
      name: "Usuario 8",
      email: "usuario8@example.com",
      total_seals: 48,
      current_seals: 18
    },
    {
      id: 9,
      name: "Usuario 9",
      email: "usuario9@example.com",
      total_seals: 55,
      current_seals: 25
    },
    {
      id: 10,
      name: "Usuario 10",
      email: "usuario10@example.com",
      total_seals: 36,
      current_seals: 6
    }
  ].sort((a, b) => b.current_seals - a.current_seals)

  // Calculate stats
  const totalSeals = usersWithSeals.reduce((sum, user) => sum + user.total_seals, 0)
  const totalFreeCoffees = Math.floor(totalSeals / 10) // Assuming 10 seals = 1 free coffee
  const totalRewardsGiven = rewards.filter(r => r.active).length * 5 // Mock calculation

  const filteredRewards = rewards.filter(reward => {
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && reward.active) ||
                         (statusFilter === 'inactive' && !reward.active)
    return matchesStatus
  })

  const handleCreate = () => {
    setEditingReward(null)
    setFormData({
      name: '',
      sealsRequired: '',
      description: '',
      active: true
    })
    setShowForm(true)
  }

  const handleEdit = (reward) => {
    setEditingReward(reward)
    setFormData({
      name: reward.name,
      sealsRequired: reward.sealsRequired.toString(),
      description: reward.description,
      active: reward.active
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta recompensa?')) {
      setRewards(rewards.filter(reward => reward.id !== id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingReward) {
      setRewards(rewards.map(reward => 
        reward.id === editingReward.id 
          ? { ...reward, ...formData, sealsRequired: parseInt(formData.sealsRequired) }
          : reward
      ))
      setEditingReward(null)
    } else {
      const newReward = {
        id: Date.now(),
        ...formData,
        sealsRequired: parseInt(formData.sealsRequired)
      }
      setRewards([...rewards, newReward])
    }
    
    setFormData({
      name: '',
      sealsRequired: '',
      description: '',
      active: true
    })
    setShowForm(false)
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
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          Crear Recompensa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Total Sellos</CardTitle>
            <Star className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">{totalSeals}</div>
            <p className="text-xs lg:text-sm text-gray-600">Sellos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Cafés Gratis</CardTitle>
            <Coffee className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">{totalFreeCoffees}</div>
            <p className="text-xs lg:text-sm text-gray-600">Cafés regalados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Recompensas Dadas</CardTitle>
            <Trophy className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">{totalRewardsGiven}</div>
            <p className="text-xs lg:text-sm text-gray-600">Recompensas entregadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">{usersWithSeals.length}</div>
            <p className="text-xs lg:text-sm text-gray-600">Usuarios con sellos</p>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredRewards.map((reward) => (
          <Card key={reward.id} className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 overflow-hidden transform hover:-translate-y-1">
            {/* Content Section */}
            <div className="p-4 lg:p-6">
              {/* Header with status */}
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Gift className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                  </div>
                  <h3 className="text-base lg:text-lg font-bold text-gray-900">
                    {reward.name}
                  </h3>
                </div>
                <Badge 
                  variant={reward.active ? "default" : "secondary"} 
                  className={`text-xs px-2 py-1 font-medium ${
                    reward.active 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {reward.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm lg:text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {reward.description}
              </p>

              {/* Seals required */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                  <span className="text-sm lg:text-base font-semibold text-gray-900">
                    {reward.sealsRequired} sellos
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(reward)}
                    className="h-7 w-7 p-0 text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reward.id)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Users with More Seals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 lg:w-6 lg:h-6" />
            <span>Usuarios con Más Sellos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Sellos Actuales</TableHead>
                <TableHead>Total Sellos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersWithSeals.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{user.current_seals}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.total_seals}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingReward ? 'Editar Recompensa' : 'Crear Recompensa'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nombre de la recompensa"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción de la recompensa"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sellos Requeridos</label>
              <Input
                type="number"
                value={formData.sealsRequired}
                onChange={(e) => setFormData({...formData, sealsRequired: e.target.value})}
                placeholder="10"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">Activa</label>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingReward ? 'Actualizar' : 'Crear'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

export default Rewards 