import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { ChevronDown, ChevronUp, Calendar, Clock, RefreshCw, X, Plus, Settings } from 'lucide-react'
// eslint-disable-next-line no-unused-vars
import Layout from '../components/layout/Layout.jsx'
import { leaderboardService } from '../services/leaderboardService.js'

function LeaderboardPeriods() {
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedPeriod, setExpandedPeriod] = useState(null)
  const [showNewPeriodForm, setShowNewPeriodForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState(null)
  const [, setRefreshInterval] = useState(null)

  const [newPeriod, setNewPeriod] = useState({
    gameId: '',
    durationDays: 7,
    autoRestart: true
  })

  const [editData, setEditData] = useState({
    duration_days: 7,
    auto_restart: true,
    next_period_duration_days: 7
  })

  useEffect(() => {
    loadPeriods()
    const interval = setInterval(loadPeriods, 60000) // Refresh every minute
    setRefreshInterval(interval)
    return () => clearInterval(interval)
  }, [])

  const loadPeriods = async () => {
    try {
      setLoading(true)
      const data = await leaderboardService.getAllPeriods()
      setPeriods(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Error loading periods:', err)
      setError('Error al cargar los periodos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePeriod = async (e) => {
    e.preventDefault()
    try {
      await leaderboardService.createPeriod(newPeriod)
      setShowNewPeriodForm(false)
      setNewPeriod({ gameId: '', durationDays: 7, autoRestart: true })
      await loadPeriods()
    } catch (err) {
      console.error('Error creating period:', err)
      setError('Error al crear el periodo')
    }
  }

  const handleUpdatePeriod = async (e) => {
    e.preventDefault()
    if (!editingPeriod) return
    
    try {
      await leaderboardService.updatePeriod(editingPeriod.id, editData)
      setShowEditForm(false)
      setEditingPeriod(null)
      await loadPeriods()
    } catch (err) {
      console.error('Error updating period:', err)
      setError('Error al actualizar el periodo')
    }
  }

  const handleClosePeriod = async (periodId) => {
    if (!confirm('¿Cerrar este periodo y determinar el ganador?')) return
    
    try {
      await leaderboardService.closePeriod(periodId)
      await loadPeriods()
    } catch (err) {
      console.error('Error closing period:', err)
      setError('Error al cerrar el periodo')
    }
  }

  const handleProcessExpired = async () => {
    try {
      await leaderboardService.processExpiredPeriods()
      await loadPeriods()
      alert('Periodos expirados procesados correctamente')
    } catch (err) {
      console.error('Error processing expired periods:', err)
      setError('Error al procesar periodos expirados')
    }
  }

  const openEditForm = (period) => {
    setEditingPeriod(period)
    setEditData({
      duration_days: period.duration_days,
      auto_restart: period.auto_restart,
      next_period_duration_days: period.duration_days
    })
    setShowEditForm(true)
  }

  const activePeriod = periods.find(p => p.is_active)

  if (loading) return <Layout><div className="p-6">Cargando periodos...</div></Layout>
  if (error) return <Layout><div className="p-6 text-red-500">{error}</div></Layout>

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Periodos del Leaderboard</h1>
          <div className="flex gap-2">
            <button
              onClick={handleProcessExpired}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Procesar Expirados
            </button>
            <button
              onClick={() => setShowNewPeriodForm(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Periodo
            </button>
          </div>
        </div>

        {/* Active Period Card */}
        {activePeriod && (
          <div className="mb-6 p-6 border-2 border-black rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold mb-2">PERIODO ACTUAL</h2>
                <span className="px-2 py-1 bg-green-500 text-white text-sm rounded">ACTIVO</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {leaderboardService.formatTimeRemaining(activePeriod.end_date)}
                </p>
                <p className="text-sm text-gray-600">Tiempo restante</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Inicio</p>
                <p className="font-semibold">
                  {new Date(activePeriod.start_date).toLocaleDateString('es')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fin</p>
                <p className="font-semibold">
                  {new Date(activePeriod.end_date).toLocaleDateString('es')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duración</p>
                <p className="font-semibold">{activePeriod.duration_days} días</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reinicio Auto</p>
                <p className="font-semibold">{activePeriod.auto_restart ? 'Sí' : 'No'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleClosePeriod(activePeriod.id)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar Periodo
              </button>
              <button
                onClick={() => openEditForm(activePeriod)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Editar Duración
              </button>
            </div>
          </div>
        )}

        {/* Period History */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold">Historial de Periodos</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {periods.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay periodos registrados
              </div>
            ) : (
              periods.map((period) => (
                <div key={period.id} className="p-4">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedPeriod(expandedPeriod === period.id ? null : period.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {leaderboardService.formatPeriodDates(period.start_date, period.end_date)}
                        </span>
                      </div>
                      {period.is_active ? (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Activo</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">Cerrado</span>
                      )}
                      {period.games && (
                        <span className="text-sm text-gray-600">{period.games.name}</span>
                      )}
                    </div>
                    {expandedPeriod === period.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  
                  {expandedPeriod === period.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">ID del Periodo</p>
                          <p className="font-mono text-xs">{period.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duración</p>
                          <p>{period.duration_days} días</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reinicio Automático</p>
                          <p>{period.auto_restart ? 'Activado' : 'Desactivado'}</p>
                        </div>
                        {!period.is_active && (
                          <div>
                            <p className="text-gray-600">Estado</p>
                            <p>Cerrado</p>
                          </div>
                        )}
                      </div>
                      
                      {period.is_active && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleClosePeriod(period.id)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            Cerrar Periodo
                          </button>
                          <button
                            onClick={() => openEditForm(period)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Period Form Modal */}
        {showNewPeriodForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Crear Nuevo Periodo</h3>
                <button
                  onClick={() => setShowNewPeriodForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePeriod} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ID del Juego</label>
                  <input
                    type="text"
                    value={newPeriod.gameId}
                    onChange={(e) => setNewPeriod({...newPeriod, gameId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="UUID del juego Flappy Bird"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Duración (días)</label>
                  <input
                    type="number"
                    value={newPeriod.durationDays}
                    onChange={(e) => setNewPeriod({...newPeriod, durationDays: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRestart"
                    checked={newPeriod.autoRestart}
                    onChange={(e) => setNewPeriod({...newPeriod, autoRestart: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="autoRestart" className="text-sm">
                    Reinicio automático
                  </label>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Crear Periodo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewPeriodForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Period Form Modal */}
        {showEditForm && editingPeriod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Editar Periodo</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePeriod} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duración (días)</label>
                  <input
                    type="number"
                    value={editData.duration_days}
                    onChange={(e) => setEditData({...editData, duration_days: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editAutoRestart"
                    checked={editData.auto_restart}
                    onChange={(e) => setEditData({...editData, auto_restart: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="editAutoRestart" className="text-sm">
                    Reinicio automático
                  </label>
                </div>
                
                {editData.auto_restart && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Duración del siguiente periodo (días)</label>
                    <input
                      type="number"
                      value={editData.next_period_duration_days}
                      onChange={(e) => setEditData({...editData, next_period_duration_days: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1"
                    />
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default LeaderboardPeriods