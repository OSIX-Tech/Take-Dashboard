import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Calendar, Clock, X, MapPin, Users, Sparkles } from 'lucide-react'
import { eventsService } from '@/services/eventsService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import Modal from '@/components/common/Modal'
import ImageUpload from '@/components/ImageUpload'
import { validateDate, validateRequired } from '@/utils/validation'

const Events = () => {
  // Local state
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    published_at: new Date().toISOString().slice(0, 16)
  })
  const [selectedImageFile, setSelectedImageFile] = useState(null)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Loading events...')

      const eventsResponse = await eventsService.getEvents()
      console.log('🔍 Events response:', eventsResponse)

      // Manejar diferentes tipos de respuesta
      let eventsData = []
      
      if (eventsResponse) {
        if (Array.isArray(eventsResponse)) {
          eventsData = eventsResponse
        } else if (eventsResponse && Array.isArray(eventsResponse.data)) {
          eventsData = eventsResponse.data
        } else if (eventsResponse && Array.isArray(eventsResponse.results)) {
          eventsData = eventsResponse.results
        } else if (eventsResponse && typeof eventsResponse === 'object') {
          // Si es un objeto pero no tiene data/results, asumir que es un array
          eventsData = Object.values(eventsResponse).find(val => Array.isArray(val)) || []
        }
      }
      
      console.log('📊 Events data to set:', eventsData)
      setEvents(eventsData)
      
    } catch (error) {
      console.error('Error loading events:', error)
      setError('Error cargando los eventos')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    const titleValidation = validateRequired(formData.title, 'Título')
    if (!titleValidation.isValid) {
      alert(titleValidation.error)
      return
    }
    
    const contentValidation = validateRequired(formData.content, 'Contenido')
    if (!contentValidation.isValid) {
      alert(contentValidation.error)
      return
    }
    
    // Validate date
    const dateValidation = validateDate(formData.published_at)
    if (!dateValidation.isValid) {
      alert(dateValidation.error)
      return
    }

    try {
      setSubmitting(true)
      
      const imageUrlNormalized = typeof formData.image_url === 'string'
        ? (formData.image_url.trim() || null)
        : (formData.image_url ?? null)

      const validatedData = {
        ...formData,
        title: titleValidation.value,
        content: contentValidation.value,
        published_at: dateValidation.value,
        image_url: imageUrlNormalized,
        folder: 'events'
      }
      
      console.log('🚀 Submitting event data:', validatedData)

      if (editingEvent) {
        console.log('📝 Updating event:', editingEvent.id)
        let response
        // Check if there's any image change
        const hasImageChange = selectedImageFile || (editingEvent.image_url !== validatedData.image_url)
        
        if (hasImageChange) {
          // Use multipart endpoint for any image change (new, update, or remove)
          response = await eventsService.updateEventWithImage(editingEvent.id, validatedData, selectedImageFile)
        } else {
          // Use regular endpoint only if no image changes at all
          response = await eventsService.updateEvent(editingEvent.id, validatedData)
        }
        console.log('✅ Event updated:', response)

        // Update event locally after successful save
        setEvents(events.map(event =>
          event.id === editingEvent.id
            ? { ...event, ...validatedData, ...response }
            : event
        ))
        setEditingEvent(null)
      } else {
        console.log('➕ Creating new event')
        let response
        if (selectedImageFile) {
          response = await eventsService.createEventWithImage(validatedData, selectedImageFile)
        } else {
          response = await eventsService.createEvent(validatedData)
        }
        console.log('✅ Event created:', response)

        // Add event locally after successful save
        const newEvent = {
          id: response.id || Date.now().toString(),
          ...validatedData,
          ...response
        }
        setEvents([...events, newEvent])
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        image_url: '',
        published_at: new Date().toISOString().slice(0, 16)
      })
      setSelectedImageFile(null)
      setShowForm(false)

      // Reload data to ensure consistency
      await loadData()

    } catch (error) {
      console.error('❌ Error saving event:', error)
      alert(`Error al guardar el evento: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title || '',
      content: event.content || '',
      image_url: event.image_url || '',
      published_at: event.published_at ? new Date(event.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
    })
    setSelectedImageFile(null) // Reset selected image file when editing
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setEventToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) return
    try {
      await eventsService.deleteEvent(eventToDelete)
      setEvents(events.filter(event => event.id !== eventToDelete))
      setShowDeleteModal(false)
      setEventToDelete(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      setError('Error al eliminar el evento')
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setEventToDelete(null)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      published_at: new Date().toISOString().slice(0, 16)
    })
    setSelectedImageFile(null)
    setEditingEvent(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha'

    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  // Show loading state
  if (loading) {
    return <LoadingSpinner />
  }

  // Show error state
  if (error) {
    return <ErrorMessage message={error} />
  }

  // Show empty state if no events
  if (!events || events.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Eventos</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">Gestiona los eventos y actividades</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Crear Evento</span>
            <span className="sm:hidden">Crear</span>
          </Button>
        </div>

        {/* Empty state */}
        <Card className="p-4 sm:p-6 lg:p-8 text-center">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No hay eventos</h3>
              <p className="text-sm">Crea tu primer evento para empezar</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-black hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Evento
            </Button>
          </CardContent>
        </Card>

        {/* Add/Edit Form Modal */}
        <Modal isOpen={showForm} onClose={handleCancel}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título del evento"
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Descripción del evento"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => handleInputChange('published_at', e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Evento</label>
                <ImageUpload
                  key={editingEvent?.id || 'new'} // Force re-render when switching items
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
                      const blankImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
                      setFormData(prev => ({...prev, image_url: blankImageUrl}))
                    }
                  }}
                  folder="events"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingEvent ? 'Actualizar' : 'Crear')} Evento
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={submitting}
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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header - Animated */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Gestiona los eventos y actividades</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Crear Evento</span>
          <span className="sm:hidden">Crear</span>
        </Button>
      </div>

      {/* Events Grid - Enhanced Design with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
        {events.map((event, index) => {
          const eventDate = new Date(event.published_at)
          const isUpcoming = eventDate > new Date()
          const dayOfWeek = eventDate.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()
          const dayNumber = eventDate.getDate()
          const month = eventDate.toLocaleDateString('es-ES', { month: 'short' })
          
          return (
            <Card key={event.id} className="group relative bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
              {/* Decorative accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                isUpcoming 
                  ? 'from-gray-900 via-gray-700 to-gray-900' 
                  : 'from-gray-400 via-gray-300 to-gray-400'
              }`}></div>
              
              {/* Image or gradient background */}
              {event.image_url ? (
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Date overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg text-center min-w-[60px]">
                      <div className="text-xs font-bold text-gray-500">{dayOfWeek}</div>
                      <div className="text-2xl font-bold text-gray-900 leading-none mt-1">{dayNumber}</div>
                      <div className="text-xs font-medium text-gray-600 mt-1">{month}</div>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`px-3 py-1.5 font-semibold text-xs rounded-full shadow-lg ${
                      isUpcoming 
                        ? 'bg-green-500 text-white border-0' 
                        : 'bg-gray-500 text-white border-0'
                    }`}>
                      {isUpcoming ? 'Próximo' : 'Pasado'}
                    </Badge>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="h-9 w-9 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-0 shadow-lg rounded-full"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      className="h-9 w-9 bg-white/95 backdrop-blur-sm hover:bg-red-50 text-red-500 hover:text-red-700 p-0 shadow-lg rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative h-56 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`
                    }}></div>
                  </div>
                  
                  {/* Date card */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white rounded-lg p-3 shadow-lg text-center min-w-[60px]">
                      <div className="text-xs font-bold text-gray-500">{dayOfWeek}</div>
                      <div className="text-2xl font-bold text-gray-900 leading-none mt-1">{dayNumber}</div>
                      <div className="text-xs font-medium text-gray-600 mt-1">{month}</div>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`px-3 py-1.5 font-semibold text-xs rounded-full shadow-md ${
                      isUpcoming 
                        ? 'bg-green-500 text-white border-0' 
                        : 'bg-gray-500 text-white border-0'
                    }`}>
                      {isUpcoming ? 'Próximo' : 'Pasado'}
                    </Badge>
                  </div>
                  
                  {/* Decorative icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-20 h-20 text-gray-200" />
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="h-9 w-9 bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900 p-0 shadow-lg rounded-full"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      className="h-9 w-9 bg-white/95 hover:bg-red-50 text-red-500 hover:text-red-700 p-0 shadow-lg rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Content Section */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {event.content}
                </p>
                
                {/* Event details */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                  {event.attendees && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{event.attendees} asistentes</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      
      {/* Empty state when filtered */}
      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Calendar className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos</h3>
          <p className="text-sm text-gray-600 text-center max-w-sm">
            Comienza creando tu primer evento para mostrar aquí
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            className="mt-4 bg-black hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <Modal isOpen={showForm} onClose={handleCancel}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título del evento"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Descripción del evento"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora *</label>
                <Input
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => handleInputChange('published_at', e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Evento</label>
                <ImageUpload
                  key={editingEvent?.id || 'new'} // Force re-render when switching items
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
                      const blankImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
                      setFormData(prev => ({...prev, image_url: blankImageUrl}))
                    }
                  }}
                  folder="events"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingEvent ? 'Actualizar' : 'Crear')} Evento
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isOpen={showDeleteModal} onClose={cancelDelete}>
          <div className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">Confirmar Eliminación</h2>
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar Evento'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Events 