import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Search, Filter, Coffee, Wine, Cake, Package, X, Settings } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { menuService } from '@/services/menuService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import Modal from '@/components/common/Modal'
import CategoryManager from '@/components/CategoryManager'
import ImageUpload from '@/components/ImageUpload'
import { useApiState } from '@/hooks/useApi'
import { validatePrice, validateRequired } from '@/utils/validation'
import { useGsapStagger } from '@/hooks/useGsap'

gsap.registerPlugin(ScrollTrigger)

const Menu = () => {
  // API states
  const { data: menuData, loading: menuLoading, error: menuError, executeApiCall: fetchMenu } = useApiState({ items: [], categories: [] })
  
  // GSAP refs
  const cardsContainerRef = useRef(null)

  // Local state for items, categories and allergens
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [allergens, setAllergens] = useState([])

  // Local states
  const [showForm, setShowForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
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
  const [selectedImageFile, setSelectedImageFile] = useState(null)

  // Memoized filtered items for better performance
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || item.category_id === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, categoryFilter])

  const loadData = async () => {
    try {
      const menuResponse = await fetchMenu(menuService.getMenu)
      if (menuResponse) {
        setItems(menuResponse.items || [])
        setCategories(menuResponse.categories || [])
        setAllergens(menuResponse.allergens || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])
  
  // GSAP animations for cards only
  useEffect(() => {
    if (filteredItems.length > 0) {
      const cards = document.querySelectorAll('.menu-card')
      
      gsap.fromTo(cards,
        { 
          opacity: 0,
          scale: 0.98
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.03,
          ease: 'power2.out'
        }
      )
    }
  }, [filteredItems])

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
    
    // Validate required fields
    const nameValidation = validateRequired(formData.name, 'Nombre')
    if (!nameValidation.isValid) {
      alert(nameValidation.error)
      return
    }
    
    const descValidation = validateRequired(formData.description, 'Descripción')
    if (!descValidation.isValid) {
      alert(descValidation.error)
      return
    }
    
    // Validate price
    const priceValidation = validatePrice(formData.price)
    if (!priceValidation.isValid) {
      alert(priceValidation.error)
      return
    }
    
    try {
      const imageUrlNormalized = typeof formData.image_url === 'string'
        ? (formData.image_url.trim() || null)
        : (formData.image_url ?? null)

      const normalized = {
        ...formData,
        name: nameValidation.value,
        description: descValidation.value,
        price: priceValidation.value,
        image_url: imageUrlNormalized,
        folder: 'menu-items'
      }

      if (editingItem) {
        let result
        // Check if there's any image change
        const hasImageChange = selectedImageFile || (editingItem.image_url !== normalized.image_url)
        
        if (hasImageChange) {
          // Use multipart endpoint for any image change (new, update, or remove)
          result = await menuService.updateItemWithImage(editingItem.id, normalized, selectedImageFile)
        } else {
          // Use regular endpoint only if no image changes at all
          result = await menuService.updateItem(editingItem.id, normalized)
        }
        // Update item locally after successful save
        setItems(items.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...normalized, ...result }
            : item
        ))
      } else {
        let result
        if (selectedImageFile) {
          result = await menuService.addItemWithImage(normalized, selectedImageFile)
        } else {
          result = await menuService.addItem(normalized)
        }
        // Add item locally after successful save
        const newItem = result || {
          id: Date.now().toString(),
          ...normalized
        }
        setItems([...items, newItem])
      }
      
      setShowForm(false)
      setEditingItem(null)
      resetForm()
      loadData() // Reload data after save
    } catch (error) {
      console.error('Error saving item:', error)
      alert(`Error al ${editingItem ? 'actualizar' : 'crear'} el elemento: ${error.message}`)
    }
  }

  const handleEdit = useCallback((item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price ? item.price.toString() : '',
      category_id: item.category_id,
      is_available: item.is_available,
      image_url: item.image_url || ''
    })
    setSelectedImageFile(null) // Reset selected image file when editing
    setShowForm(true)
  }, [])

  const handleDelete = useCallback((id) => {
    setItemToDelete(id)
    setShowDeleteModal(true)
  }, [])

  const confirmDelete = async () => {
    if (!itemToDelete) return
    
    try {
      await menuService.deleteItem(itemToDelete)
      // Delete item locally after successful delete
      setItems(items.filter(item => item.id !== itemToDelete))
      loadData() // Reload data after delete
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error al eliminar el elemento: ' + error.message)
    } finally {
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
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
    setSelectedImageFile(null)
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
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Gestión del Menú
          </h1>
          <p className="text-gray-600 mt-0.5 text-xs lg:text-sm">
            Gestiona los elementos del menú y categorías
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCategoryManager(true)} 
            variant="secondary"
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
            <span className="hidden sm:inline">Categorías</span>
          </Button>
          <Button 
            onClick={() => setShowForm(true)} 
            className="w-full sm:w-auto px-3 sm:px-4 md:px-6 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-3 text-xs sm:text-sm md:text-base lg:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 mr-1.5" />
            <span className="hidden sm:inline">Agregar Elemento</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter - Animated Section */}
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
                className="!pl-8 w-full border-gray-300 focus:border-gray-400 focus:outline-none text-xs sm:text-sm md:text-sm"
                style={{ height: '40px', minHeight: '40px' }}
              />
            </div>
            <div className="relative min-w-[180px] md:min-w-[200px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2.5 sm:px-3 md:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-xs sm:text-sm md:text-sm bg-white appearance-none cursor-pointer touch-manipulation"
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

      {/* Menu Items Grid - Enhanced visual design with GSAP animations */}
      <div 
        ref={cardsContainerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
      >
        {filteredItems.map((item, index) => (
          <Card key={item.id} className="menu-card relative bg-white border-0 shadow-macos overflow-hidden">
            
            {/* Image Section */}
            {item.image_url ? (
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                
                {/* Category badge overlay */}
                <div className="absolute top-3 left-3">
                  <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg">
                    {getCategoryIcon(item.category_id)}
                    <span className="text-xs font-semibold text-gray-800">
                      {getCategoryName(item.category_id)}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons overlay - Always visible */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-9 w-9 bg-white/95 backdrop-blur-sm text-gray-700 p-0 shadow-lg rounded-full"
                    aria-label="Editar elemento"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-9 w-9 bg-white/95 backdrop-blur-sm text-red-500 p-0 shadow-lg rounded-full"
                    aria-label="Eliminar elemento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative h-48 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`
                  }}></div>
                </div>
                
                <div className="text-gray-300">
                  <Coffee className="w-16 h-16" />
                </div>
                
                {/* Category badge overlay */}
                <div className="absolute top-3 left-3">
                  <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-md">
                    {getCategoryIcon(item.category_id)}
                    <span className="text-xs font-semibold text-gray-800">
                      {getCategoryName(item.category_id)}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons overlay - Always visible */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-9 w-9 bg-white/95 backdrop-blur-sm text-gray-700 p-0 shadow-lg rounded-full"
                    aria-label="Editar elemento"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-9 w-9 bg-white/95 backdrop-blur-sm text-red-500 p-0 shadow-lg rounded-full"
                    aria-label="Eliminar elemento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="p-5">
              {/* Status badge */}
              <div className="flex justify-between items-start mb-3">
                <div
                  className={`
                    text-xs px-2.5 py-1 font-semibold rounded-full
                    transition-all duration-200
                    ${item.is_available 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }
                  `}
                >
                  {item.is_available ? '✓ Disponible' : '× No Disponible'}
                </div>
              </div>

              {/* Title and Description */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Price Section with enhanced styling */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      €{item.price}
                    </span>
                  </div>
                  
                  {/* Quick actions for mobile - now always visible on mobile */}
                  <div className="flex space-x-2 sm:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0 text-gray-600 bg-gray-50 rounded-full"
                      aria-label="Editar elemento"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-500 bg-red-50 rounded-full"
                      aria-label="Eliminar elemento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Empty state when no items */}
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Coffee className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay elementos en el menú</h3>
          <p className="text-sm text-gray-600 text-center max-w-sm">
            {searchTerm || categoryFilter 
              ? 'No se encontraron elementos con los filtros aplicados' 
              : 'Comienza agregando tu primer elemento al menú'}
          </p>
          {(searchTerm || categoryFilter) && (
            <Button 
              onClick={() => { setSearchTerm(''); setCategoryFilter(''); }}
              className="mt-4 bg-black text-white"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

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
              className="h-8 w-8 p-0 bg-gray-50"
              aria-label="Cerrar modal"
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
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
              <ImageUpload
                key={editingItem?.id || 'new'} // Force re-render when switching items
                currentImageUrl={formData.image_url || ''}
                mode="deferred"
                onFileSelected={(file) => {
                  setSelectedImageFile(file)
                  // Update preview URL when file is selected
                  if (file) {
                    // Don't update formData.image_url with the data URL
                    // Just keep track of the file
                    console.log('New file selected:', file.name)
                  } else {
                    // If file is removed, set a blank/placeholder image URL
                    // Using a transparent 1x1 pixel or a placeholder image
                    const blankImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
                    // Or use a placeholder service:
                    // const blankImageUrl = 'https://via.placeholder.com/200x200/f0f0f0/cccccc?text=No+Image'
                    setFormData(prev => ({...prev, image_url: blankImageUrl}))
                  }
                }}
                folder="menu-items"
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
      >
        <div className="p-6 text-center">
          <Trash2 className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Eliminar Elemento
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="w-full text-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="w-full text-white bg-red-600"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          allergens={allergens}
          onDataChange={(data) => {
            if (data.categories) setCategories(data.categories)
            if (data.allergens) setAllergens(data.allergens)
            loadData()
          }}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  )
}

export default Menu 