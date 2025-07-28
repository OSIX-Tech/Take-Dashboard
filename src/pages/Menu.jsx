import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
      case 'Café Clásico': return <Coffee className="w-3 h-3" />
      case 'Lattes de Sabores': return <Coffee className="w-3 h-3" />
      case 'Frappés': return <Coffee className="w-3 h-3" />
      case 'Smoothies': return <Wine className="w-3 h-3" />
      case 'Dulces': return <Cake className="w-3 h-3" />
      case 'Sándwiches': return <Cake className="w-3 h-3" />
      default: return <Package className="w-3 h-3" />
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
    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Gestión del Menú</h1>
          <p className="text-gray-600 mt-0.5 text-xs lg:text-sm">Gestiona los elementos del menú y categorías</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-full sm:w-auto bg-black hover:bg-gray-800 px-3 sm:px-4 md:px-6 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3 text-xs sm:text-sm md:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 mr-1.5" />
          <span className="hidden sm:inline">Agregar Elemento</span>
          <span className="sm:hidden">Agregar</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-2 sm:p-3 md:p-4 lg:p-4 bg-white shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 w-3 h-3 lg:w-4 lg:h-4 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar elementos del menú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-8 w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400 text-xs sm:text-sm md:text-sm"
                style={{ height: '40px', minHeight: '40px' }}
              />
            </div>
            <div className="relative min-w-[180px] md:min-w-[200px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2.5 sm:px-3 md:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-xs sm:text-sm md:text-sm bg-white appearance-none cursor-pointer touch-manipulation hover:border-gray-400 transition-colors"
                style={{ height: '40px', minHeight: '40px' }}
              >
                <option value="">Todas las Categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid - Optimized for tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 overflow-hidden transform hover:-translate-y-1">
            {/* Image Section */}
            {item.image_url ? (
              <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-7 w-7 sm:h-8 sm:w-8 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-0 shadow-sm"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-7 w-7 sm:h-8 sm:w-8 bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700 p-0 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative h-32 sm:h-36 md:h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-gray-400">
                  <Coffee className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                </div>
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-7 w-7 sm:h-8 sm:w-8 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-0 shadow-sm"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-7 w-7 sm:h-8 sm:w-8 bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700 p-0 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="p-3 sm:p-4 md:p-5">
              {/* Header with category and status */}
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 sm:p-2 bg-gray-100 rounded-full">
                    {getCategoryIcon(item.category_id)}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    {getCategoryName(item.category_id)}
                  </span>
                </div>
                <Badge 
                  variant={item.is_available ? "default" : "secondary"} 
                  className={`text-xs px-2 py-1 font-medium ${
                    item.is_available 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {item.is_available ? 'Disponible' : 'No Disponible'}
                </Badge>
              </div>

              {/* Title and Description */}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                  {item.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Price Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    €{item.price}
                  </span>
                  {item.price > 3 && (
                    <span className="text-xs text-gray-500">Premium</span>
                  )}
                </div>
                
                {/* Quick actions for mobile */}
                <div className="flex space-x-1 sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancel}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingItem ? 'Editar Elemento' : 'Agregar Nuevo Elemento'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nombre del elemento"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción del elemento"
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
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.is_available}
                onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-700">
                Disponible
              </label>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingItem ? 'Actualizar' : 'Agregar'} Elemento
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
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

export default Menu 