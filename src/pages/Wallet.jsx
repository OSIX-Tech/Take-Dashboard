import { useState, useEffect } from 'react';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  Coffee, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Plus,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  ScanLine,
  User,
  X
} from 'lucide-react';
import walletService from '../services/walletService';
import QRScanner from '../components/QRScanner';

function Wallet() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    rewardGranted: '',
    limit: 50
  });
  
  // QR Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [sealsToAdd, setSealsToAdd] = useState(1);
  const [notes, setNotes] = useState('');
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      // Load stats and transactions in parallel
      const [statsData, transactionsData] = await Promise.all([
        walletService.getStats().catch(err => {
          console.error('Error loading stats:', err);
          return null;
        }),
        walletService.getTransactions({ limit: filters.limit }).catch(err => {
          console.error('Error loading transactions:', err);
          return { transactions: [] };
        })
      ]);

      if (statsData) setStats(statsData);
      setTransactions(transactionsData.transactions || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await walletService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Error al cargar las estadísticas');
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.rewardGranted !== '') params.rewardGranted = filters.rewardGranted;
      params.limit = filters.limit;

      const data = await walletService.getTransactions(params);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  // QR Scanner functions
  const handleScanSuccess = (decodedText) => {
    setQrToken(decodedText);
    setShowScanner(true); // Keep scanner modal/section active to show user info
    handleScanQR(decodedText);
  };

  const handleScanQR = async (token = qrToken) => {
    if (!token || !token.trim()) {
      setError('Por favor introduce un código QR válido');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setUserInfo(null);

    try {
      // Get user info from scan endpoint
      const response = await walletService.scanQRToken(token);
      console.log('🔍 Raw QR Scan Response:', response);
      
      // Extract data from response structure
      const scanData = response.data || response;
      console.log('📊 Extracted scan data:', scanData);
      
      // The response already has all the seal information we need
      const userDataWithSeals = {
        user: scanData.user,
        currentSeals: scanData.currentSeals,
        totalSeals: scanData.totalSeals,
        sealsRemaining: scanData.sealsRemaining,
        lastUpdated: scanData.lastUpdated
      };
      
      console.log('📦 User data with seals:', {
        userName: userDataWithSeals.user?.name,
        userEmail: userDataWithSeals.user?.email,
        currentSeals: userDataWithSeals.currentSeals,
        sealsRemaining: userDataWithSeals.sealsRemaining,
        totalSeals: userDataWithSeals.totalSeals
      });
      
      setUserInfo(userDataWithSeals);
      setSealsToAdd(1);
      setNotes('');
      // Ensure we're showing the scanner section with user info
      setShowScanner(true);
      console.log('✅ User info set successfully');
    } catch (err) {
      console.error('❌ Error in handleScanQR:', err);
      setError(err.message || 'Error al escanear el código QR');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeals = async () => {
    if (!userInfo) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📌 Adding seals:', { qrToken, sealsToAdd, notes });
      const result = await walletService.addSeals(qrToken, sealsToAdd, notes);
      console.log('✅ Add seals response:', result);
      
      if (result.rewardGranted) {
        setShowReward(true);
        setSuccess('¡Café gratis conseguido!');
      } else {
        setSuccess(`${sealsToAdd} sello${sealsToAdd > 1 ? 's' : ''} añadido${sealsToAdd > 1 ? 's' : ''} correctamente`);
      }

      // Get updated user info after adding seals by scanning again
      const updatedResponse = await walletService.scanQRToken(qrToken);
      console.log('🔄 Updated user data after adding seals:', updatedResponse);
      
      // Extract data from response structure
      const updatedData = updatedResponse.data || updatedResponse;
      
      // Update user info with new seal count
      const updatedUserData = {
        user: updatedData.user,
        currentSeals: updatedData.currentSeals,
        totalSeals: updatedData.totalSeals,
        sealsRemaining: updatedData.sealsRemaining,
        lastUpdated: updatedData.lastUpdated
      };
      
      setUserInfo(updatedUserData);
      setSealsToAdd(1);
      setNotes('');
      
      // Reload stats and transactions
      await loadStats();
      await loadTransactions();
    } catch (err) {
      setError(err.message || 'Error al añadir sellos');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setQrToken('');
    setUserInfo(null);
    setSealsToAdd(1);
    setNotes('');
    setError(null);
    setSuccess(null);
    setShowScanner(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    if (!userInfo) return 0;
    const seals = userInfo.currentSeals || 0;
    return Math.min((seals / 15) * 100, 100);
  };

  const getRemainingCups = () => {
    if (!userInfo) return [];
    const total = 15;
    const current = userInfo.currentSeals || 0;
    return Array.from({ length: total }, (_, i) => i < current);
  };

  const renderUserInfo = () => {
    console.log('🎨 Rendering user info with data:', userInfo);
    return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-black text-white rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{userInfo.user?.name || userInfo.name || 'Cliente'}</h3>
              <p className="text-sm text-gray-600">{userInfo.user?.email || userInfo.email || 'Sin email'}</p>
            </div>
          </div>
          <button
            onClick={resetScanner}
            className="text-sm text-gray-500 hover:text-black transition-colors md:hidden"
          >
            Cambiar
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Sellos actuales</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{userInfo.currentSeals || 0}</span>
                <span className="text-lg text-gray-400">/15</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Faltan</p>
              <Badge variant={userInfo.sealsRemaining <= 3 ? "default" : "outline"} className="text-lg px-3 py-1">
                {userInfo.sealsRemaining || 0}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-gray-800 to-black h-full rounded-full transition-all duration-700 relative"
                style={{ width: `${getProgressPercentage()}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            {(userInfo.sealsRemaining <= 3 && userInfo.sealsRemaining > 0) && (
              <p className="absolute -top-6 right-0 text-xs font-medium text-orange-600">
                ¡Casi lo consigues!
              </p>
            )}
          </div>

          {/* Visual Cups - Mobile Responsive */}
          <div className="grid grid-cols-5 gap-1.5">
            {getRemainingCups().map((filled, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                  filled 
                    ? 'bg-black shadow-sm' 
                    : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <Coffee className={`w-3 h-3 sm:w-4 sm:h-4 ${filled ? 'text-white' : 'text-gray-400'}`} />
              </div>
            ))}
          </div>

          {/* Additional Wallet Info */}
          {(userInfo.lifetimeSeals !== undefined || userInfo.hasGoogleWallet !== undefined) && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs">
              {userInfo.lifetimeSeals !== undefined && (
                <div>
                  <span className="text-gray-500">Total histórico: </span>
                  <span className="font-semibold">{userInfo.lifetimeSeals}</span>
                </div>
              )}
              {userInfo.hasGoogleWallet !== undefined && (
                <div>
                  <span className="text-gray-500">Google Wallet: </span>
                  <span className="font-semibold">{userInfo.hasGoogleWallet ? '✓' : '✗'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Seals Section */}
      <div className="border-t pt-4">
        <p className="text-sm font-semibold mb-3">Añadir Sellos</p>
        
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[1, 2, 3, 5, 10].map((num) => (
            <button
              key={num}
              onClick={() => setSealsToAdd(num)}
              className={`py-2 rounded-lg font-semibold transition-all ${
                sealsToAdd === num 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
          placeholder="Notas (opcional)"
        />

        <Button
          onClick={handleAddSeals}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            'Procesando...'
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Añadir {sealsToAdd} {sealsToAdd === 1 ? 'Sello' : 'Sellos'}
            </>
          )}
        </Button>
      </div>
    </>
  );
  };

  // Show initial loading state
  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Google Wallet</h1>
          <p className="text-sm text-gray-600 hidden md:block">Gestiona los sellos y recompensas de los clientes</p>
        </div>
        <Button
          onClick={() => setShowScanner(!showScanner)}
          className="bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5 md:px-8 md:py-3 rounded-lg md:rounded-xl group"
        >
          <ScanLine className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Escanear Cliente</span>
        </Button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* QR Scanner Modal Overlay for Desktop, Inline for Mobile */}
      {showScanner && !userInfo && (
        <>
          {/* Desktop Modal Overlay */}
          <div className="hidden md:fixed md:inset-0 md:bg-black/50 md:backdrop-blur-sm md:z-50 md:flex md:items-center md:justify-center md:p-4 animate-in fade-in duration-200" onClick={resetScanner}>
            <div className="animate-in fade-in-up duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-lg w-full">
                <QRScanner 
                  onScan={handleScanSuccess}
                  onClose={resetScanner}
                  title="Escanear Cliente"
                  isModal={true}
                />
              </div>
            </div>
          </div>
          
          {/* Mobile Inline */}
          <div className="md:hidden mb-6">
            <QRScanner 
              onScan={handleScanSuccess}
              onClose={resetScanner}
              title="Escanear Cliente"
            />
          </div>
        </>
      )}

      {/* User Info Modal for Desktop, Inline for Mobile */}
      {showScanner && userInfo && (
        <>
          {/* Desktop Modal */}
          <div className="hidden md:fixed md:inset-0 md:bg-black/50 md:backdrop-blur-sm md:z-50 md:flex md:items-center md:justify-center md:p-4">
            <div className="animate-in fade-in zoom-in duration-300 max-w-lg w-full">
              <Card className="border border-gray-200 shadow-2xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-900 to-black text-white py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Cliente Escaneado
                    </CardTitle>
                    <button
                      onClick={resetScanner}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 pb-5 bg-white">
                  <div className="max-w-md mx-auto">
                    {renderUserInfo()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Mobile Inline */}
          <div className="md:hidden mb-6">
            <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
              <CardHeader className="bg-black text-white py-4">
                <CardTitle className="text-base font-semibold">Cliente Escaneado</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 pb-5 bg-white">
                <div className="max-w-md mx-auto">
                  {renderUserInfo()}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}


      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="border-0 shadow-macos">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Total Usuarios</span>
                <span className="sm:hidden">Usuarios</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-xl md:text-2xl font-bold">{stats.wallets?.totalUsers || 0}</div>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">Con wallet activo</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-macos">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Cerca Premio</span>
                <span className="sm:hidden">Premio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-xl md:text-2xl font-bold">{stats.wallets?.usersCloseToReward || 0}</div>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">12+ sellos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-macos">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                <span className="hidden sm:inline">Sellos Hoy</span>
                <span className="sm:hidden">Hoy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-xl md:text-2xl font-bold">{stats.today?.sealsGivenToday || 0}</div>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">Otorgados</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-macos">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Premios Hoy</span>
                <span className="sm:hidden">Premios</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-xl md:text-2xl font-bold">{stats.today?.rewardsGrantedToday || 0}</div>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">Cafés gratis</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card className="border-0 shadow-macos">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estadísticas Semanales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Sellos</p>
                    <p className="text-xl md:text-2xl font-bold">{stats.thisWeek?.sealsGivenThisWeek || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Premios</p>
                    <p className="text-xl md:text-2xl font-bold">{stats.thisWeek?.rewardsGrantedThisWeek || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Trans.</p>
                    <p className="text-xl md:text-2xl font-bold">{stats.thisWeek?.transactionsThisWeek || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-macos">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Desglose Diario
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.thisWeek?.dailyBreakdown && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(stats.thisWeek.dailyBreakdown).map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium">
                      {new Date(date).toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                    <Badge variant="outline" className="font-bold">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-0 shadow-macos">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <CardTitle>Historial de Transacciones</CardTitle>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <select
                value={filters.rewardGranted}
                onChange={(e) => setFilters({ ...filters, rewardGranted: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Todos</option>
                <option value="true">Con premio</option>
                <option value="false">Sin premio</option>
              </select>
              <Button size="sm" onClick={loadTransactions}>
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando transacciones...</p>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay transacciones</h3>
              <p className="text-sm text-gray-600 text-center max-w-sm">
                Las transacciones aparecerán aquí cuando escanees códigos QR de clientes
              </p>
            </div>
          ) : (
            <>
          {/* Mobile View - Enhanced Cards */}
          <div className="block lg:hidden p-4 space-y-3">
            {transactions.map((transaction, index) => (
              <div key={transaction.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{transaction.user?.name}</p>
                    <p className="text-xs text-gray-600">{transaction.user?.email}</p>
                  </div>
                  <Badge variant="outline">+{transaction.sealsAdded}</Badge>
                </div>
                {transaction.rewardGranted && (
                  <Badge className="bg-black text-white">Premio</Badge>
                )}
                <p className="text-xs text-gray-600">
                  {formatDate(transaction.createdAt)}
                </p>
                {transaction.notes && (
                  <p className="text-xs text-gray-500 italic">{transaction.notes}</p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Sellos</TableHead>
                  <TableHead>Premio</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Realizado por</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.user?.name || 'Usuario'}</p>
                        <p className="text-xs text-gray-600">{transaction.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">+{transaction.sealsAdded}</Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.rewardGranted && (
                        <Badge className="bg-green-600 text-white">Premio</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.notes || '-'}
                    </TableCell>
                    <TableCell>{transaction.performedBy?.name || 'Sistema'}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reward Animation */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl transform scale-110">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-full mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">¡PREMIO!</h2>
              <p className="text-gray-600">Café Gratis Conseguido</p>
              <Coffee className="w-8 h-8 text-black mx-auto mt-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;