import { useState } from 'react'
import { 
  Plus, 
  Gift, 
  Coffee, 
  Award, 
  Users, 
  CheckCircle, 
  X, 
  Edit, 
  Trash2, 
  Search,
  Star,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const Rewards = () => {
  const [rewards, setRewards] = useState([
    { id: 1, name: 'Café Gratis', sealsRequired: 10, description: 'Obtén un café gratis de tu elección', active: true },
    { id: 2, name: '50% Descuento en Pastelería', sealsRequired: 5, description: 'Mitad de precio en cualquier pastelería', active: true },
    { id: 3, name: 'Sesión de Arte Latte Gratis', sealsRequired: 15, description: 'Sesión gratuita de arte latte', active: false },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingReward, setEditingReward] = useState(null)
  const [formData, setFormData] = useState({ name: '', sealsRequired: '', description: '', active: true })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock users with seals data (based on actual BD schema)
  const usersWithSeals = [
    { 
      id: '1', 
      name: 'Juan Pérez', 
      email: 'juan@example.com',
      total_seals: 45, 
      current_seals: 15,
      max_seals: 50
    },
    { 
      id: '2', 
      name: 'María García', 
      email: 'maria@example.com',
      total_seals: 38, 
      current_seals: 8,
      max_seals: 50
    },
    { 
      id: '3', 
      name: 'Carlos López', 
      email: 'carlos@example.com',
      total_seals: 32, 
      current_seals: 12,
      max_seals: 50
    },
    { 
      id: '4', 
      name: 'Ana Martínez', 
      email: 'ana@example.com',
      total_seals: 28, 
      current_seals: 18,
      max_seals: 50
    },
    { 
      id: '5', 
      name: 'Luis Rodríguez', 
      email: 'luis@example.com',
      total_seals: 25, 
      current_seals: 5,
      max_seals: 50
    },
    { 
      id: '6', 
      name: 'Sofia Pérez', 
      email: 'sofia@example.com',
      total_seals: 22, 
      current_seals: 22,
      max_seals: 50
    },
  ]

  // Mock statistics based on actual data
  const stats = {
    totalSeals: usersWithSeals.reduce((sum, user) => sum + user.total_seals, 0),
    currentSeals: usersWithSeals.reduce((sum, user) => sum + user.current_seals, 0),
    totalUsers: usersWithSeals.length,
    topUser: usersWithSeals[0]?.name || 'N/A',
    topUserSeals: usersWithSeals[0]?.current_seals || 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingReward) {
      setRewards(rewards.map(reward => reward.id === editingReward.id ? { ...reward, ...formData } : reward))
      setEditingReward(null)
    } else {
      setRewards([...rewards, { id: Date.now(), ...formData }])
    }
    setFormData({ name: '', sealsRequired: '', description: '', active: true })
    setShowForm(false)
  }

  const handleEdit = (reward) => {
    setEditingReward(reward)
    setFormData(reward)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setRewards(rewards.filter(reward => reward.id !== id))
  }

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reward.active === (statusFilter === 'active')
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Gestión de Recompensas</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Gestiona tu programa de lealtad y recompensas</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-black hover:bg-gray-800 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation w-full sm:w-auto">
          <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
          Crear Recompensa
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Usuarios Listos para Canjear</CardTitle>
            <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-gray-100">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-gray-800" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">{usersWithSeals.filter(u => u.current_seals >= 10).length}</div>
            <div className="text-xs lg:text-sm text-gray-500">con 10+ sellos (ventas potenciales)</div>
          </CardContent>
        </Card>

        <Card className="p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Valor Promedio por Usuario</CardTitle>
            <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-gray-100">
              <Tag className="h-5 w-5 lg:h-6 lg:w-6 text-gray-800" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">€{(stats.currentSeals * 2.5 / stats.totalUsers).toFixed(2)}</div>
            <div className="text-xs lg:text-sm text-gray-500">valor estimado en sellos</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 lg:p-6">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-3 lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar recompensas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-12 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 lg:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent text-base lg:text-lg"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredRewards.map((reward) => (
          <Card key={reward.id} className="hover:shadow-md transition-shadow p-4 lg:p-6">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg lg:text-xl mb-3 break-words">{reward.name}</CardTitle>
                  <CardDescription className="mb-4 text-sm lg:text-base">{reward.description}</CardDescription>
                  <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600">
                    <Tag className="w-4 h-4 flex-shrink-0" />
                    <span>{reward.sealsRequired} sellos requeridos</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 lg:space-x-2 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(reward)}
                    className="h-8 w-8 lg:h-10 lg:w-10 p-0 focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
                  >
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reward.id)}
                    className="h-8 w-8 lg:h-10 lg:w-10 p-0 text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <Badge variant={reward.active ? "default" : "secondary"} className="text-xs lg:text-sm px-2 lg:px-3 py-1">
                  {reward.active ? 'Activo' : 'Inactivo'}
                </Badge>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">{reward.sealsRequired}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users with More Seals */}
      <Card className="p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
        <CardHeader className="p-0 pb-4 lg:pb-6">
          <CardTitle className="text-lg lg:text-xl text-gray-900">Usuarios con Más Sellos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 lg:space-y-4">
            {usersWithSeals.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 lg:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-sm lg:text-base font-medium">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm lg:text-base font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-xs lg:text-sm text-gray-500 truncate">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-4 ml-2">
                  <div className="text-right">
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">{user.current_seals}</div>
                    <div className="text-xs lg:text-sm text-gray-500">sellos actuales</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-base lg:text-lg font-medium text-gray-700">{user.total_seals}</div>
                    <div className="text-xs lg:text-sm text-gray-500">total acumulado</div>
                  </div>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-xs lg:text-sm font-medium">#{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {editingReward ? 'Editar Recompensa' : 'Crear Nueva Recompensa'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false)
                    setEditingReward(null)
                    setFormData({ name: '', sealsRequired: '', description: '', active: true })
                  }}
                  className="h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Recompensa</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="py-3 text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sellos Requeridos</label>
                  <Input
                    type="number"
                    value={formData.sealsRequired}
                    onChange={(e) => setFormData({...formData, sealsRequired: parseInt(e.target.value)})}
                    className="py-3 text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent text-base"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="w-5 h-5 text-gray-700 focus:ring-gray-300 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="text-base font-medium text-gray-700">
                    Activo
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1 bg-black hover:bg-gray-800 py-3 text-base">
                    {editingReward ? 'Actualizar' : 'Crear'} Recompensa
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingReward(null)
                      setFormData({ name: '', sealsRequired: '', description: '', active: true })
                    }}
                    className="flex-1 py-3 text-base"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Rewards 