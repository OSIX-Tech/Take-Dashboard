import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { eventsService } from '@/services/eventsService'
import { useApiState } from '@/hooks/useApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

const Events = () => {
  // Local state
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    published_at: new Date().toISOString().slice(0, 16)
  })
  const [searchTerm, setSearchTerm] = useState('')

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
      setLoading(true)
      setError(null)
      console.log('🔄 Loading events...')

      const eventsResponse = await eventsService.getEvents()
      console.log('�� Events response:', eventsResponse)

      if (eventsResponse && eventsResponse.data) {
        setEvents(eventsResponse.data || [])
      } else if (eventsResponse) {
        setEvents(eventsResponse || [])
      } else {
        setEvents([])
      }
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

    try {
      setSubmitting(true)
      console.log('🚀 Submitting event data:', formData)

      if (editingEvent) {
        console.log('📝 Updating event:', editingEvent.id)
        const response = await eventsService.updateEvent(editingEvent.id, formData)
        console.log('✅ Event updated:', response)

        // Update event locally after successful save
        setEvents(events.map(event =>
          event.id === editingEvent.id
            ? { ...event, ...formData, ...response }
            : event
        ))
        setEditingEvent(null)
      } else {
        console.log('➕ Creating new event')
        const response = await eventsService.createEvent(formData)
        console.log('✅ Event created:', response)

        // Add event locally after successful save
        const newEvent = {
          id: response.id || Date.now().toString(),
          ...formData,
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

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title || '',
      content: event.content || '',
      image_url: event.image_url || '',
      published_at: event.published_at
        ? new Date(event.published_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        console.log('🗑️ Deleting event:', id)
        await eventsService.deleteEvent(id)
        console.log('✅ Event deleted successfully')

        // Delete event locally after successful delete
        setEvents(events.filter(event => event.id !== id))

        // Reload data to ensure consistency
        await loadData()
      } catch (error) {
        console.error('❌ Error deleting event:', error)
        alert(`Error al eliminar el evento: ${error.message}`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      published_at: new Date().toISOString().slice(0, 16)
    })
    setEditingEvent(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.content?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Gestión de Eventos</h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">Gestiona tus eventos y talleres</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-black hover:bg-gray-800 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
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
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Título del evento"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, published_at: e.target.value})}
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  disabled={submitting}
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Gestión de Eventos</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Gestiona tus eventos y talleres</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-black hover:bg-gray-800 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
          <span className="hidden sm:inline">Crear Evento</span>
          <span className="sm:hidden">Crear</span>
        </Button>
      </div>

      {/* Search */}
      <Card className="p-3 sm:p-4 lg:p-6">
        <CardContent className="p-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar eventos por título o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!pl-12 w-full text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 overflow-hidden">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-xs lg:text-sm text-gray-500 mb-2 line-clamp-1">
                    {event.content}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-1 ml-2 sm:ml-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(event)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 touch-manipulation"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-xs lg:text-sm text-gray-600 font-medium">
                    {formatDate(event.published_at)}
                  </span>
                </div>
                <Badge variant="default" className="text-xs px-2 py-1">
                  Evento
                </Badge>
              </div>

              {event.image_url && (
                <div className="mt-3">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Título del evento"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm sm:text-base resize-none"
                  rows="4"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora *</label>
                <Input
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => setFormData({...formData, published_at: e.target.value})}
                  className="py-2 sm:py-3 text-sm sm:text-base"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                <Input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="py-2 sm:py-3 text-sm sm:text-base"
                  placeholder="https://example.com/image.jpg"
                  disabled={submitting}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-black hover:bg-gray-800 py-2 sm:py-3 text-sm sm:text-base touch-manipulation"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : (editingEvent ? 'Actualizar' : 'Crear') + ' Evento'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 py-2 sm:py-3 text-sm sm:text-base touch-manipulation"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Events 