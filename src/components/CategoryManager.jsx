import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, X, Coffee, Pizza, AlertCircle } from 'lucide-react'
import { menuService } from '@/services/menuService'
import Modal from '@/components/common/Modal'
import ImageUpload from '@/components/ImageUpload'

function CategoryManager({ categories, allergens, onDataChange, onClose }) {
  const [localCategories, setLocalCategories] = useState(categories || [])
  const [localAllergens, setLocalAllergens] = useState(allergens || [])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showAllergenForm, setShowAllergenForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingAllergen, setEditingAllergen] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('categories')
  
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    type: 'drinks',
    icon_url: '',
    allergen_ids: []
  })
  const [selectedCategoryFile, setSelectedCategoryFile] = useState(null)

  const [allergenFormData, setAllergenFormData] = useState({
    name: '',
    description: '',
    icon_url: '',
    category_ids: []
  })

  // Category Management
  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      let categoryData = { ...categoryFormData }
      let response
      
      if (editingCategory) {
        // Check if there's any image change
        const hasImageChange = selectedCategoryFile || (editingCategory.icon_url !== categoryData.icon_url)
        
        if (hasImageChange) {
          // Use multipart endpoint for any image change
          response = await menuService.updateCategoryWithImage(editingCategory.id, categoryData, selectedCategoryFile)
        } else {
          // Use regular endpoint only if no image changes
          response = await menuService.updateCategory(editingCategory.id, categoryData)
        }
        
        const updatedCategories = localCategories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...categoryData, ...response } : cat
        )
        setLocalCategories(updatedCategories)
      } else {
        if (selectedCategoryFile) {
          response = await menuService.addCategoryWithImage(categoryData, selectedCategoryFile)
        } else {
          response = await menuService.addCategory(categoryData)
        }
        const newCategory = response.data || response
        
        const updatedCategories = [...localCategories, newCategory]
        setLocalCategories(updatedCategories)
      }
      
      onDataChange({ categories: localCategories, allergens: localAllergens })
      resetCategoryForm()
    } catch (err) {
      console.error('Error saving category:', err)
      setError('Error al guardar la categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name || '',
      description: category.description || '',
      type: category.type || 'drinks',
      icon_url: category.icon_url || '',
      allergen_ids: category.allergen_ids || []
    })
    setPreviewUrl(category.icon_url)
    setSelectedCategoryFile(null)
    setShowCategoryForm(true)
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await menuService.deleteCategory(id)
        const updatedCategories = localCategories.filter(cat => cat.id !== id)
        setLocalCategories(updatedCategories)
        onDataChange({ categories: updatedCategories, allergens: localAllergens })
      } catch (err) {
        console.error('Error deleting category:', err)
        setError('Error al eliminar la categoría')
      }
    }
  }

  // Allergen Management
  const handleAllergenSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      let allergenData = { ...allergenFormData }
      delete allergenData.category_ids // Remove category_ids from allergen data
      
      if (editingAllergen) {
        await menuService.updateAllergen(editingAllergen.id, allergenData)
        
        const updatedAllergens = localAllergens.map(all => 
          all.id === editingAllergen.id ? { ...all, ...allergenData } : all
        )
        setLocalAllergens(updatedAllergens)
        
        // Update categories with this allergen
        const updatedCategories = localCategories.map(cat => {
          const shouldHaveAllergen = allergenFormData.category_ids.includes(cat.id)
          const hasAllergen = cat.allergen_ids && cat.allergen_ids.includes(editingAllergen.id)
          
          if (shouldHaveAllergen && !hasAllergen) {
            return { ...cat, allergen_ids: [...(cat.allergen_ids || []), editingAllergen.id] }
          } else if (!shouldHaveAllergen && hasAllergen) {
            return { ...cat, allergen_ids: cat.allergen_ids.filter(id => id !== editingAllergen.id) }
          }
          return cat
        })
        setLocalCategories(updatedCategories)
      } else {
        const response = await menuService.addAllergen(allergenData)
        const newAllergen = response.data || response
        
        const updatedAllergens = [...localAllergens, newAllergen]
        setLocalAllergens(updatedAllergens)
        
        // Add to selected categories
        if (newAllergen.id && allergenFormData.category_ids.length > 0) {
          const updatedCategories = localCategories.map(cat => {
            if (allergenFormData.category_ids.includes(cat.id)) {
              return { ...cat, allergen_ids: [...(cat.allergen_ids || []), newAllergen.id] }
            }
            return cat
          })
          setLocalCategories(updatedCategories)
        }
      }
      
      onDataChange({ categories: localCategories, allergens: localAllergens })
      resetAllergenForm()
    } catch (err) {
      console.error('Error saving allergen:', err)
      setError('Error al guardar el alérgeno')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAllergen = (allergen) => {
    setEditingAllergen(allergen)
    
    // Find which categories have this allergen
    const categoriesWithAllergen = localCategories
      .filter(cat => cat.allergen_ids && cat.allergen_ids.includes(allergen.id))
      .map(cat => cat.id)
    
    setAllergenFormData({
      name: allergen.name || '',
      description: allergen.description || '',
      icon_url: allergen.icon_url || '',
      category_ids: categoriesWithAllergen
    })
    setPreviewUrl(allergen.icon_url)
    setShowAllergenForm(true)
  }

  const handleDeleteAllergen = async (id) => {
    // Check if allergen is used in any category
    const isUsed = localCategories.some(cat => 
      cat.allergen_ids && cat.allergen_ids.includes(id)
    )
    
    if (isUsed) {
      setError('No se puede eliminar este alérgeno porque está siendo usado en una o más categorías')
      return
    }
    
    if (window.confirm('¿Estás seguro de eliminar este alérgeno?')) {
      try {
        await menuService.deleteAllergen(id)
        const updatedAllergens = localAllergens.filter(all => all.id !== id)
        setLocalAllergens(updatedAllergens)
        onDataChange({ categories: localCategories, allergens: updatedAllergens })
      } catch (err) {
        console.error('Error deleting allergen:', err)
        setError('Error al eliminar el alérgeno')
      }
    }
  }

  const toggleAllergen = (allergenId) => {
    setCategoryFormData(prev => ({
      ...prev,
      allergen_ids: prev.allergen_ids.includes(allergenId)
        ? prev.allergen_ids.filter(id => id !== allergenId)
        : [...prev.allergen_ids, allergenId]
    }))
  }

  const toggleCategory = (categoryId) => {
    setAllergenFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }))
  }

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      type: 'drinks',
      icon_url: '',
      allergen_ids: []
    })
    setEditingCategory(null)
    setShowCategoryForm(false)
    setSelectedFile(null)
    setSelectedCategoryFile(null)
    setPreviewUrl(null)
    setError(null)
  }

  const resetAllergenForm = () => {
    setAllergenFormData({
      name: '',
      description: '',
      icon_url: '',
      category_ids: []
    })
    setEditingAllergen(null)
    setShowAllergenForm(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
  }

  const getTypeIcon = (type) => {
    return type === 'drinks' ? <Coffee className="w-4 h-4" /> : <Pizza className="w-4 h-4" />
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-7xl h-[90vh] flex flex-col shadow-xl">
        {/* Header - Simple and clean */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Menú</h2>
            <p className="text-sm text-gray-500 mt-1">Administra categorías y alérgenos</p>
          </div>
          <Button 
            onClick={onClose} 
            className="p-2 bg-gray-50 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Tabs - Clean style */}
        <div className="flex space-x-1 px-6 pt-2 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 font-medium transition-colors rounded-t-lg ${
              activeTab === 'categories'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500'
            }`}
          >
            Categorías
          </button>
          <button
            onClick={() => setActiveTab('allergens')}
            className={`px-4 py-2.5 font-medium transition-colors rounded-t-lg ${
              activeTab === 'allergens'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500'
            }`}
          >
            Alérgenos
          </button>
        </div>

        {/* Content area with scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  Gestiona las categorías del menú y sus alérgenos asociados
                </p>
                {!showCategoryForm && (
                  <Button 
                    onClick={() => setShowCategoryForm(true)}
                    className="bg-black text-white rounded-lg px-4 py-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Categoría
                  </Button>
                )}
              </div>

              {showCategoryForm && (
                <Card className="mb-6 border border-gray-200 rounded-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg">
                      {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                          </label>
                          <Input
                            type="text"
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo *
                          </label>
                          <select
                            value={categoryFormData.type}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          >
                            <option value="drinks">Bebidas</option>
                            <option value="snacks">Snacks</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          value={categoryFormData.description}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          rows="2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imagen de la Categoría
                        </label>
                        <ImageUpload
                          currentImageUrl={categoryFormData.icon_url}
                          onImageUploaded={(url) => setCategoryFormData({ ...categoryFormData, icon_url: url })}
                          onFileSelected={setSelectedCategoryFile}
                          folder="categories"
                          mode="deferred"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alérgenos asociados
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                          {localAllergens.map(allergen => (
                            <label
                              key={allergen.id}
                              className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={categoryFormData.allergen_ids.includes(allergen.id)}
                                onChange={() => toggleAllergen(allergen.id)}
                                className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                              />
                              <span className="text-sm">{allergen.name}</span>
                            </label>
                          ))}
                        </div>
                        {localAllergens.length === 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            No hay alérgenos disponibles. Ve a la pestaña "Alérgenos" para crear algunos.
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          onClick={resetCategoryForm}
                          className="bg-gray-200 text-gray-800"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-black text-white"
                        >
                          {loading ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localCategories.map((category) => (
                  <Card key={category.id} className="border border-gray-200 rounded-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                              {category.icon_url ? (
                                <img 
                                  src={category.icon_url} 
                                  alt={category.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getTypeIcon(category.type || 'drinks')
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{category.name}</h3>
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                {category.type === 'snacks' ? 'Snacks' : 'Bebidas'}
                              </span>
                            </div>
                          </div>
                          
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          )}
                          
                          {category.allergen_ids && category.allergen_ids.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {category.allergen_ids.map(allergenId => {
                                const allergen = localAllergens.find(a => a.id === allergenId)
                                return allergen ? (
                                  <span key={allergenId} className="text-xs bg-yellow-100 px-2 py-0.5 rounded-full text-yellow-800">
                                    {allergen.name}
                                  </span>
                                ) : null
                              })}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-1 ml-3">
                          <Button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 bg-white border border-gray-200 rounded-lg"
                            size="sm"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 bg-white border border-gray-200 rounded-lg"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {localCategories.length === 0 && !showCategoryForm && (
                  <Card className="col-span-full">
                    <CardContent className="text-center py-12">
                      <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay categorías registradas</p>
                      <Button 
                        onClick={() => setShowCategoryForm(true)}
                        className="mt-4 bg-black text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear primera categoría
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Allergens Tab */}
          {activeTab === 'allergens' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  Define los alérgenos disponibles y asígnalos a las categorías
                </p>
                {!showAllergenForm && (
                  <Button 
                    onClick={() => setShowAllergenForm(true)}
                    className="bg-black text-white rounded-lg px-4 py-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Alérgeno
                  </Button>
                )}
              </div>

              {showAllergenForm && (
                <Card className="mb-6 border border-gray-200 rounded-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg">
                      {editingAllergen ? 'Editar Alérgeno' : 'Nuevo Alérgeno'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAllergenSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre *
                        </label>
                        <Input
                          type="text"
                          value={allergenFormData.name}
                          onChange={(e) => setAllergenFormData({ ...allergenFormData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          value={allergenFormData.description}
                          onChange={(e) => setAllergenFormData({ ...allergenFormData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          rows="2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Asignar a categorías
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                          {localCategories.map(category => (
                            <label
                              key={category.id}
                              className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={allergenFormData.category_ids.includes(category.id)}
                                onChange={() => toggleCategory(category.id)}
                                className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                              />
                              <div className="flex items-center space-x-1">
                                {getTypeIcon(category.type || 'drinks')}
                                <span className="text-sm">{category.name}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        {localCategories.length === 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            No hay categorías disponibles. Ve a la pestaña "Categorías" para crear algunas.
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          onClick={resetAllergenForm}
                          className="bg-gray-200 text-gray-800"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-black text-white"
                        >
                          {loading ? 'Guardando...' : (editingAllergen ? 'Actualizar' : 'Crear')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localAllergens.map((allergen) => {
                  const categoriesWithAllergen = localCategories.filter(cat => 
                    cat.allergen_ids && cat.allergen_ids.includes(allergen.id)
                  )
                  
                  return (
                    <Card key={allergen.id} className="border border-gray-200 rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{allergen.name}</h3>
                            {allergen.description && (
                              <p className="text-sm text-gray-600 mb-2">{allergen.description}</p>
                            )}
                            
                            {categoriesWithAllergen.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Usado en:</p>
                                <div className="flex flex-wrap gap-1">
                                  {categoriesWithAllergen.map(cat => (
                                    <span key={cat.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                      {cat.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-1 ml-3">
                            <Button
                              onClick={() => handleEditAllergen(allergen)}
                              className="p-2 bg-white border border-gray-200 rounded-lg"
                              size="sm"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteAllergen(allergen.id)}
                              className="p-2 bg-white border border-gray-200 rounded-lg"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4 text-gray-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {localAllergens.length === 0 && !showAllergenForm && (
                  <Card className="col-span-full">
                    <CardContent className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay alérgenos registrados</p>
                      <Button 
                        onClick={() => setShowAllergenForm(true)}
                        className="mt-4 bg-black text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear primer alérgeno
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CategoryManager