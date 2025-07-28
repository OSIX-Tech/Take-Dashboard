import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Coffee,
  Cake,
  Wine,
  Star,
  Tag,
  X,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { menuService, categoryService } from '@/services/menuService'
import { useApiState } from '@/hooks/useApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

const Menu = () => {
  // API states
  const { data: menuData, loading: menuLoading, error: menuError, executeApiCall: fetchMenu } = useApiState({ items: [], categories: [] })
  const { loading: saveLoading, error: saveError, executeApiCall: saveItem } = useApiState()
  const { loading: deleteLoading, error: deleteError, executeApiCall: deleteItem } = useApiState()

  // Local state for items and categories
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])

  // Local states
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    image_url: ''
  })

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const menuResponse = await fetchMenu(menuService.getMenu)
      if (menuResponse) {
        setItems(menuResponse.items || [])
        setCategories(menuResponse.categories || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || item.category_id === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : 'Sin categoría'
  }

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    switch (category?.name) {
      case 'Café Clásico': return <Coffee className="w-4 h-4" />
      case 'Lattes de Sabores': return <Coffee className="w-4 h-4" />
      case 'Frappés': return <Coffee className="w-4 h-4" />
      case 'Smoothies': return <Wine className="w-4 h-4" />
      case 'Dulces': return <Cake className="w-4 h-4" />
      case 'Sándwiches': return <Cake className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        await saveItem(menuService.updateMenuItem, editingItem.id, formData)
        // Update item locally after successful save
        setItems(items.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...formData, price: parseFloat(formData.price) }
            : item
        ))
      } else {
        await saveItem(menuService.createMenuItem, formData)
        // Add item locally after successful save
        const newItem = {
          id: Date.now().toString(),
          ...formData,
          price: parseFloat(formData.price)
        }
        setItems([...items, newItem])
      }
      
      setShowForm(false)
      setEditingItem(null)
      resetForm()
      loadData() // Reload data after save
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category_id: item.category_id,
      is_available: item.is_available,
      image_url: item.image_url || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      try {
        await deleteItem(menuService.deleteMenuItem, id)
        // Delete item locally after successful delete
        setItems(items.filter(item => item.id !== id))
        loadData() // Reload data after delete
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true,
      image_url: ''
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
    resetForm()
  }

  // Show loading state
  if (menuLoading) {
    return <LoadingSpinner />
  }

  // Show error state
  if (menuError) {
    return <ErrorMessage message="Error cargando los datos del menú" />
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Gestión del Menú</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Gestiona los elementos del menú y categorías</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-full sm:w-auto bg-black hover:bg-gray-800 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
          <span className="hidden sm:inline">Agregar Elemento</span>
          <span className="sm:hidden">Agregar</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Card className="p-3 sm:p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Producto Premium</CardTitle>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-gray-100">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-800" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">€{Math.max(...items.map(item => item.price)).toFixed(2)}</div>
            <div className="text-xs lg:text-sm text-gray-500">precio más alto (Smoothies)</div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Valor Total Carta</CardTitle>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-gray-100">
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-800" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">€{items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</div>
            <div className="text-xs lg:text-sm text-gray-500">suma de todos los productos</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-3 sm:p-4 lg:p-6 bg-white shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 lg:w-5 lg:h-5 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar elementos del menú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-12 w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400 text-sm sm:text-base"
              />
            </div>
            <div className="relative min-w-[200px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-sm sm:text-base bg-white appearance-none cursor-pointer touch-manipulation hover:border-gray-400 transition-colors"
              >
                <option value="">Todas las Categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 overflow-hidden">
            {/* Header con acciones */}
            <div className="p-3 sm:p-4 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-500 mb-2 line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-2 sm:ml-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 touch-manipulation"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="px-3 sm:px-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(item.category_id)}
                  <span className="text-xs lg:text-sm text-gray-600 font-medium">
                    {getCategoryName(item.category_id)}
                  </span>
                </div>
                <Badge variant={item.is_available ? "default" : "secondary"} className="text-xs px-2 py-1">
                  {item.is_available ? 'Disponible' : 'No Disponible'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                  €{item.price}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="max-w-sm sm:max-w-md w-full mx-auto p-3 sm:p-4 lg:p-6 max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 pb-3 sm:pb-4 lg:pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg lg:text-xl">
                  {editingItem ? 'Editar Elemento' : 'Agregar Nuevo Elemento'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 p-0 touch-manipulation"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="py-2 sm:py-3 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="py-2 sm:py-3 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="py-2 sm:py-3 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm sm:text-base"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                  <Input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="py-2 sm:py-3 text-sm sm:text-base"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 focus:ring-gray-300 border-gray-300 rounded"
                  />
                  <label htmlFor="available" className="text-sm sm:text-base font-medium text-gray-700">
                    Disponible
                  </label>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                  <Button type="submit" className="flex-1 bg-black hover:bg-gray-800 py-2 sm:py-3 text-sm sm:text-base touch-manipulation">
                    {editingItem ? 'Actualizar' : 'Agregar'} Elemento
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 py-2 sm:py-3 text-sm sm:text-base touch-manipulation"
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

export default Menu 