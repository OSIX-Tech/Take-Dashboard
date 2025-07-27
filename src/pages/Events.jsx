import { useState } from 'react'
import { 
  Plus, 
  Calendar, 
  Edit, 
  Trash2, 
  X,
  Search,
  Image
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const Events = () => {
  const [events, setEvents] = useState([
    { 
      id: '1', 
      title: 'Evento 1', 
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Únete a nuestra cata de café donde aprenderás sobre diferentes variedades y métodos de preparación.',
      image_url: 'https://example.com/cata-cafe.jpg',
      published_at: '2024-02-15T14:00:00Z'
    },
    { 
      id: '2', 
      title: 'Evento 2', 
      content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Aprende las técnicas básicas de un barista profesional desde el molido hasta el arte latte.',
      image_url: 'https://example.com/taller-barista.jpg',
      published_at: '2024-02-20T10:00:00Z'
    },
    { 
      id: '3', 
      title: 'Evento 3', 
      content: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Demuestra tu creatividad en nuestro concurso de arte latte con premios increíbles.',
      image_url: 'https://example.com/arte-latte.jpg',
      published_at: '2024-01-30T16:00:00Z'
    },
    { 
      id: '4', 
      title: 'Evento 4', 
      content: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Disfruta de una velada única con música jazz en vivo mientras degustas nuestros mejores cafés.',
      image_url: 'https://example.com/jazz-cafe.jpg',
      published_at: '2024-03-10T20:00:00Z'
    },
    { 
      id: '5', 
      title: 'Evento 5', 
      content: 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Domina las técnicas más avanzadas del arte latte con nuestros expertos.',
      image_url: 'https://example.com/latte-art.jpg',
      published_at: '2024-02-25T11:00:00Z'
    },
    { 
      id: '6', 
      title: 'Evento 6', 
      content: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus. Celebra con nosotros la diversidad de cafés de origen único.',
      image_url: 'https://example.com/festival-cafe.jpg',
      published_at: '2024-04-05T12:00:00Z'
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    image_url: '', 
    published_at: new Date().toISOString().slice(0, 16)
  })
  const [searchTerm, setSearchTerm] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingEvent) {
      setEvents(events.map(event => event.id === editingEvent.id ? { ...event, ...formData } : event))
      setEditingEvent(null)
    } else {
      setEvents([...events, { id: Date.now().toString(), ...formData }])
    }
    setFormData({ title: '', content: '', image_url: '', published_at: new Date().toISOString().slice(0, 16) })
    setShowForm(false)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      ...event,
      published_at: event.published_at ? new Date(event.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setEvents(events.filter(event => event.id !== id))
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Gestión de Eventos</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Gestiona tus eventos y talleres</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-black hover:bg-gray-800 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation w-full sm:w-auto">
          <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
          Crear Evento
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 lg:p-6">
        <CardContent className="p-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar eventos por título o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!pl-12 w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow p-4 lg:p-6">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg lg:text-xl mb-3 break-words">{event.title}</CardTitle>
                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(event.published_at)}</span>
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 line-clamp-3 lg:line-clamp-2">
                      {event.content}
                    </div>
                    {event.image_url && (
                      <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600">
                        <Image className="w-4 h-4 flex-shrink-0" />
                        <span>Con imagen</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 lg:space-x-2 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(event)}
                    className="h-8 w-8 lg:h-10 lg:w-10 p-0 focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
                  >
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    className="h-8 w-8 lg:h-10 lg:w-10 p-0 text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  ID: {event.id}
                </div>
                <div className="text-xs text-gray-500">
                  {event.image_url ? 'Con imagen' : 'Sin imagen'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false)
                    setEditingEvent(null)
                    setFormData({ title: '', content: '', image_url: '', published_at: new Date().toISOString().slice(0, 16) })
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Evento</label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="py-3 text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent text-base"
                    rows="4"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen (opcional)</label>
                  <Input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="py-3 text-base"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Publicación</label>
                  <Input
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={(e) => setFormData({...formData, published_at: e.target.value})}
                    className="py-3 text-base"
                    required
                  />
                </div>
                

                
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1 bg-black hover:bg-gray-800 py-3 text-base">
                    {editingEvent ? 'Actualizar' : 'Crear'} Evento
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingEvent(null)
                      setFormData({ title: '', content: '', image_url: '', published_at: new Date().toISOString().slice(0, 16) })
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

export default Events 