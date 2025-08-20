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
    
    // Desktop/Tablet Premium Design - Two columns for both
    const renderDesktopLayout = () => (
      <div className="grid md:grid-cols-[1.2fr,1fr] gap-3 md:gap-4 lg:gap-6">
        {/* Left Column - User & Progress */}
        <div className="space-y-3 md:space-y-4">
          {/* User Card with Avatar */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-black to-gray-700 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-lg lg:text-xl font-bold text-gray-900 truncate">
                  {userInfo.user?.name || userInfo.name || 'Cliente'}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 truncate mt-0.5 md:mt-1">
                  {userInfo.user?.email || userInfo.email || 'Sin email'}
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3 mt-2 md:mt-3">
                  {userInfo.lifetimeSeals !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className="text-gray-500">Total histórico:</span>
                      <span className="font-semibold">{userInfo.lifetimeSeals}</span>
                    </div>
                  )}
                  {userInfo.hasGoogleWallet !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <span className="text-gray-500">Wallet:</span>
                      <span className="font-semibold">{userInfo.hasGoogleWallet ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 md:mb-4">
              <div>
                <h4 className="text-xs md:text-sm font-medium text-gray-600 mb-1">Progreso Actual</h4>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900">{userInfo.currentSeals || 0}</span>
                  <span className="text-sm md:text-base lg:text-lg text-gray-400">/ 15</span>
                </div>
              </div>
              {userInfo.sealsRemaining <= 3 && userInfo.sealsRemaining > 0 && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold animate-pulse">
                  ¡Solo {userInfo.sealsRemaining} más!
                </div>
              )}
              {userInfo.sealsRemaining === 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold animate-bounce">
                  ¡PREMIO!
                </div>
              )}
            </div>

            {/* Circular Progress - Responsive for tablets */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto mb-3 md:mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-100"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={351.86}
                  strokeDashoffset={351.86 - (351.86 * getProgressPercentage()) / 100}
                  className="text-black transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Coffee className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-700 mb-0.5" />
                <span className="text-[10px] md:text-xs font-semibold text-gray-600">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gray-600 via-gray-800 to-black rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Inicio</span>
                <span className="font-semibold">Café Gratis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Visual Stamps & Actions */}
        <div className="space-y-3 md:space-y-4">
          {/* Stamps Grid */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-200 shadow-sm">
            <h4 className="text-xs md:text-sm font-medium text-gray-600 mb-2 md:mb-3 lg:mb-4">Tarjeta de Sellos</h4>
            <div className="grid grid-cols-5 gap-1 md:gap-1.5 lg:gap-2">
              {getRemainingCups().map((filled, i) => (
                <div
                  key={i}
                  className={`relative aspect-square rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                    filled 
                      ? 'bg-gradient-to-br from-black to-gray-800 shadow-md md:shadow-lg' 
                      : 'bg-white border md:border-2 border-dashed border-gray-300'
                  }`}
                >
                  {filled ? (
                    <>
                      <Coffee className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white z-10" />
                      <div className="absolute inset-0 bg-white/10 rounded-lg md:rounded-xl animate-pulse" />
                    </>
                  ) : (
                    <div className="text-gray-300">
                      <Coffee className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 md:bottom-0.5 md:right-0.5 lg:bottom-1 lg:right-1 text-[8px] md:text-[10px] lg:text-xs font-bold text-white/60">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl md:rounded-2xl p-2.5 md:p-3 lg:p-4 border border-gray-200 shadow-sm">
            <h4 className="text-xs md:text-sm font-medium text-gray-600 mb-2 md:mb-3">Añadir Sellos Rápido</h4>
            <div className="grid grid-cols-3 gap-1 md:gap-1.5 lg:gap-2">
              {[1, 2, 3, 5, 10, 15].map((num) => (
                <button
                  key={num}
                  onClick={() => setSealsToAdd(num)}
                  className={`relative py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm lg:text-base transition-all duration-200 transform hover:scale-105 ${
                    sealsToAdd === num 
                      ? 'bg-black text-white shadow-xl scale-105' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  +{num}
                  {sealsToAdd === num && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    // Mobile Compact Design (unchanged)
    const renderMobileLayout = () => (
      <>
        {/* Compact User Info Card */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-black text-white rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base truncate">{userInfo.user?.name || userInfo.name || 'Cliente'}</h3>
                <p className="text-xs text-gray-500 truncate">{userInfo.user?.email || userInfo.email || 'Sin email'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black">{userInfo.currentSeals || 0}</span>
                <span className="text-sm text-gray-400">/15 sellos</span>
              </div>
              
              {userInfo.sealsRemaining <= 3 && userInfo.sealsRemaining > 0 && (
                <Badge className="bg-orange-500 text-white text-xs">
                  ¡{userInfo.sealsRemaining} más!
                </Badge>
              )}
              
              {userInfo.sealsRemaining === 0 && (
                <Badge className="bg-green-500 text-white text-xs">
                  ¡Premio!
                </Badge>
              )}
            </div>

            <div className="relative mb-2.5">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-gray-700 to-black h-full rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1 max-w-xs mx-auto">
              {getRemainingCups().map((filled, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded flex items-center justify-center transition-all duration-200 ${
                    filled 
                      ? 'bg-black scale-110' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Coffee className={`w-2.5 h-2.5 ${filled ? 'text-white' : 'text-gray-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[1, 2, 3, 5, 10, 15].map((num) => (
              <button
                key={num}
                onClick={() => setSealsToAdd(num)}
                className={`min-w-[3rem] px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                  sealsToAdd === num 
                    ? 'bg-black text-white scale-105 shadow-lg' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                +{num}
              </button>
            ))}
          </div>
        </div>
      </>
    );

    return (
      <>
        {/* Desktop/Tablet Layout */}
        <div className="hidden md:block">
          {renderDesktopLayout()}
          
          {/* Action Section for Desktop/Tablet */}
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-3 md:gap-4">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-3 md:px-4 py-2.5 md:py-3 text-sm border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 bg-gray-50"
              placeholder="Notas de la transacción (opcional)"
            />
            <Button
              onClick={handleAddSeals}
              disabled={loading}
              className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-semibold py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-lg transform transition-all hover:scale-105 text-sm md:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Confirmar {sealsToAdd} {sealsToAdd === 1 ? 'Sello' : 'Sellos'}
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {renderMobileLayout()}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 mt-3"
            placeholder="Notas (opcional)"
          />
          <Button
            onClick={handleAddSeals}
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 shadow-lg mt-3"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Procesando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Plus className="w-4 h-4 mr-1.5" />
                Añadir {sealsToAdd} {sealsToAdd === 1 ? 'Sello' : 'Sellos'}
              </div>
            )}
          </Button>
        </div>

        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
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

      {/* User Info Modal - Premium Desktop/Tablet Experience */}
      {showScanner && userInfo && (
        <>
          {/* Desktop/Tablet Modal - Full Experience */}
          <div className="hidden md:fixed md:inset-0 md:bg-black/70 md:backdrop-blur-md md:z-50 md:flex md:items-center md:justify-center md:p-4 lg:p-6">
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-400 w-full max-w-2xl lg:max-w-4xl">
              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-b from-white to-gray-50">
                {/* Premium Header */}
                <CardHeader className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-4 px-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                      </div>
                      <CardTitle className="text-lg font-medium tracking-wide">
                        Sesión de Cliente Activa
                      </CardTitle>
                      <Badge className="bg-white/20 text-white border-white/30 text-xs">
                        En vivo
                      </Badge>
                    </div>
                    <button
                      onClick={resetScanner}
                      className="group p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </CardHeader>
                
                {/* Premium Content */}
                <CardContent className="p-6 bg-gradient-to-b from-white via-gray-50/50 to-white">
                  {renderUserInfo()}
                  
                  {/* Success Feedback Area */}
                  {success && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">{success}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Mobile Bottom Sheet Style */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-black/20 fixed inset-0" onClick={resetScanner} />
            <Card className="relative rounded-t-2xl border-0 shadow-2xl overflow-hidden bg-white">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-2" />
              <CardHeader className="py-2 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Cliente Activo
                  </CardTitle>
                  <button
                    onClick={resetScanner}
                    className="text-gray-400 hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
                {renderUserInfo()}
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

      {/* Reward Animation - Enhanced */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl transform animate-in zoom-in-105 duration-300">
            <div className="text-center space-y-3">
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-bounce">
                <Award className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">¡PREMIO CONSEGUIDO!</h2>
                <p className="text-sm text-gray-600 mt-1">Café Gratis Desbloqueado</p>
              </div>
              <div className="flex justify-center gap-2">
                <Coffee className="w-6 h-6 text-orange-500 animate-pulse" />
                <Coffee className="w-6 h-6 text-orange-400 animate-pulse delay-75" />
                <Coffee className="w-6 h-6 text-orange-500 animate-pulse delay-150" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;