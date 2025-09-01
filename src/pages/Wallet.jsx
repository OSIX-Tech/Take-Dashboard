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
  X,
  Loader2
} from 'lucide-react';
import walletService from '../services/walletService';
import QRScanner from '../components/QRScanner';
import MobileQRScanner from '../components/MobileQRScanner';

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
  
  // QR Scanner states - Scanner open by default for better UX
  const [showScanner, setShowScanner] = useState(true); // Changed to true - always open on load
  const [qrToken, setQrToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [sealsToAdd, setSealsToAdd] = useState(1);
  const [notes, setNotes] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [newlyUnlockedRewards, setNewlyUnlockedRewards] = useState([]);
  const [showUnlockedRewardsModal, setShowUnlockedRewardsModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Check if mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const loadInitialData = async () => {
    setInitialLoading(true);
    console.log('🚀 [Wallet] Starting loadInitialData...');
    
    try {
      // Load stats and transactions in parallel
      const [statsData, transactionsData] = await Promise.all([
        walletService.getStats().catch(err => {
          console.error('❌ [Wallet] Error loading stats:', err);
          return null;
        }),
        walletService.getTransactions({ limit: filters.limit }).catch(err => {
          console.error('❌ [Wallet] Error loading transactions:', err);
          return { transactions: [] };
        })
      ]);

      console.log('📊 [Wallet] Stats data received:', statsData);
      console.log('📋 [Wallet] Transactions data received:', transactionsData);
      
      // Validate stats data before setting
      if (statsData && typeof statsData === 'object' && !Array.isArray(statsData)) {
        console.log('✅ [Wallet] Setting valid stats data');
        setStats(statsData);
      } else {
        console.warn('⚠️ [Wallet] Invalid stats data structure, using null');
        setStats(null);
      }
      
      // Validate transactions data
      const transactions = transactionsData?.transactions || transactionsData || [];
      if (Array.isArray(transactions)) {
        console.log('✅ [Wallet] Setting transactions array with length:', transactions.length);
        setTransactions(transactions);
      } else {
        console.warn('⚠️ [Wallet] Invalid transactions data, using empty array');
        console.warn('⚠️ [Wallet] Received transactions data type:', typeof transactions);
        console.warn('⚠️ [Wallet] Received transactions data:', transactions);
        setTransactions([]);
      }
    } catch (err) {
      console.error('❌ [Wallet] Error loading initial data:', err);
      console.error('❌ [Wallet] Error stack:', err.stack);
      setError('Error al cargar los datos');
    } finally {
      console.log('🏁 [Wallet] Finished loadInitialData');
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
      // Ensure transactions is always an array
      const txData = data?.transactions || data || [];
      setTransactions(Array.isArray(txData) ? txData : []);
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
      
      // Handle the new API response format
      let scanData;
      if (response?.success && response?.data) {
        scanData = response.data;
      } else {
        scanData = response?.data || response;
      }
      console.log('📊 Extracted scan data:', scanData);
      
      // The response already has all the seal information we need
      const userDataWithSeals = {
        user: scanData?.user || {},
        currentSeals: scanData?.currentSeals || 0,
        totalSeals: scanData?.totalSeals || 0,
        sealsRemaining: scanData?.sealsRemaining || 15,
        lifetimeSeals: scanData?.lifetimeSeals || scanData?.totalSeals || 0,
        availableRewards: scanData?.availableRewards || [],
        lastUpdated: scanData?.lastUpdated || null
      };
      
      console.log('📦 User data with seals:', {
        userName: userDataWithSeals.user?.name,
        userEmail: userDataWithSeals.user?.email,
        currentSeals: userDataWithSeals.currentSeals,
        sealsRemaining: userDataWithSeals.sealsRemaining,
        totalSeals: userDataWithSeals.totalSeals,
        lifetimeSeals: userDataWithSeals.lifetimeSeals,
        availableRewards: userDataWithSeals.availableRewards?.length || 0
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
      const response = await walletService.addSeals(qrToken, sealsToAdd, notes);
      console.log('✅ Add seals response:', response);
      
      // Handle the new API response format
      let result;
      if (response?.success && response?.data) {
        result = response.data;
      } else {
        result = response;
      }
      
      // Store transaction details for display
      const transactionDetails = {
        transactionId: result?.transactionId,
        previousSeals: result?.previousSeals,
        sealsAdded: result?.sealsAdded || sealsToAdd,
        newTotal: result?.newTotal,
        rewardGranted: result?.rewardGranted,
        message: response?.message || result?.message
      };
      
      // Check for rewards
      if (result?.rewardGranted) {
        setShowReward(false); // Don't show animation
        setSuccess(response?.message || '¡Café gratis conseguido! Contador reiniciado a 0.');
      } else if (result?.newlyUnlockedRewards && result.newlyUnlockedRewards.length > 0) {
        setNewlyUnlockedRewards(result.newlyUnlockedRewards);
        setShowUnlockedRewardsModal(true);
        setSuccess(result.message || '¡Nuevas recompensas desbloqueadas!');
      } else {
        const sealsCount = result?.sealsAdded || sealsToAdd;
        setSuccess(`${sealsCount} sello${sealsCount > 1 ? 's' : ''} añadido${sealsCount > 1 ? 's' : ''} correctamente`);
      }

      // Update user info with the response data if available
      if (result?.user) {
        const updatedUserData = {
          user: result.user,
          currentSeals: result.newTotal !== undefined ? result.newTotal : userInfo.currentSeals + sealsToAdd,
          totalSeals: userInfo.totalSeals + (result?.sealsAdded || sealsToAdd),
          sealsRemaining: result.rewardGranted ? 15 : Math.max(0, 15 - (result.newTotal || 0)),
          lifetimeSeals: userInfo.lifetimeSeals + (result?.sealsAdded || sealsToAdd),
          availableRewards: result?.availableRewards || userInfo.availableRewards,
          lastUpdated: new Date().toISOString(),
          lastTransaction: transactionDetails
        };
        
        setUserInfo(updatedUserData);
      } else {
        // If no user data in response, fetch updated info
        const updatedResponse = await walletService.scanQRToken(qrToken);
        console.log('🔄 Updated user data after adding seals:', updatedResponse);
        
        let updatedData;
        if (updatedResponse?.success && updatedResponse?.data) {
          updatedData = updatedResponse.data;
        } else {
          updatedData = updatedResponse?.data || updatedResponse;
        }
        
        const updatedUserData = {
          user: updatedData?.user,
          currentSeals: updatedData?.currentSeals,
          totalSeals: updatedData?.totalSeals,
          sealsRemaining: updatedData?.sealsRemaining,
          lifetimeSeals: updatedData?.lifetimeSeals || updatedData?.totalSeals || 0,
          availableRewards: updatedData?.availableRewards || [],
          lastUpdated: updatedData?.lastUpdated,
          lastTransaction: transactionDetails
        };
        
        setUserInfo(updatedUserData);
      }
      
      setSealsToAdd(1);
      setNotes('');
      
      // Only reload stats if not on mobile
      if (!isMobile) {
        await loadStats();
        await loadTransactions();
      }
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
    // Keep scanner open for next scan
    setShowScanner(true);
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
    if (!userInfo || typeof userInfo !== 'object') return 0;
    const seals = Number(userInfo.currentSeals) || 0;
    return Math.min((seals / 15) * 100, 100);
  };

  const getRemainingCups = () => {
    if (!userInfo || typeof userInfo !== 'object') return [];
    const total = 15;
    const current = Number(userInfo.currentSeals) || 0;
    return Array.from({ length: total }, (_, i) => i < current);
  };

  const renderUserInfo = () => {
    console.log('🎨 Rendering user info with data:', userInfo);
    
    // Desktop/Tablet Premium Design - Responsive columns
    const renderDesktopLayout = () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.2fr,1fr] gap-3 md:gap-4 lg:gap-6">
        {/* Left Column - User & Progress */}
        <div className="space-y-3 md:space-y-4">
          {/* User Card with Avatar */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl md:rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-black to-gray-700 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-lg lg:text-xl font-bold text-gray-900 truncate" style={{ color: '#111827' }}>
                  {userInfo.user?.name || userInfo.name || 'Cliente'}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 truncate mt-0.5 md:mt-1" style={{ color: '#6b7280' }}>
                  {userInfo.user?.email || userInfo.email || 'Sin email'}
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3 mt-2 md:mt-3">
                  {userInfo.lifetimeSeals !== undefined && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-500" style={{ color: '#6b7280' }}>Total histórico:</span>
                      <span className="font-semibold text-lg" style={{ color: '#111827' }}>{Number(userInfo?.lifetimeSeals) || 0}</span>
                    </div>
                  )}
                  {userInfo.availableRewards && userInfo.availableRewards.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-500" style={{ color: '#6b7280' }}>Recompensas:</span>
                      <span className="font-semibold text-lg" style={{ color: '#111827' }}>{userInfo.availableRewards.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="bg-white rounded-xl md:rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 md:mb-4">
              <div>
                <h4 className="text-sm md:text-base font-medium text-gray-600 mb-1" style={{ color: '#4b5563' }}>Progreso Actual</h4>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900" style={{ color: '#111827' }}>{Number(userInfo?.currentSeals) || 0}</span>
                  <span className="text-lg md:text-xl lg:text-2xl text-gray-400" style={{ color: '#9ca3af' }}>/ 15</span>
                </div>
              </div>
              {userInfo?.sealsRemaining === 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold animate-bounce">
                  ¡PREMIO!
                </div>
              )}
            </div>

            {/* Circular Progress - Responsive */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto mb-3 md:mb-4">
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
                <span className="text-sm md:text-base font-semibold text-gray-600" style={{ color: '#4b5563' }}>
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Visual Stamps & Actions */}
        <div className="space-y-3 md:space-y-4">
          {/* Stamps Grid */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl md:rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 border border-gray-200 shadow-sm">
            <h4 className="text-sm md:text-base font-medium text-gray-600 mb-2 md:mb-3 lg:mb-4">Tarjeta de Sellos</h4>
            <div className="grid grid-cols-5 gap-1 md:gap-1.5 lg:gap-2 max-w-xs md:max-w-sm mx-auto lg:max-w-none">
              {getRemainingCups().map((filled, i) => (
                <div
                  key={i}
                  className={`relative aspect-square rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                    filled 
                      ? 'bg-gradient-to-br from-black to-gray-800 shadow-sm md:shadow-md lg:shadow-lg' 
                      : 'bg-white border lg:border-2 border-dashed border-gray-300'
                  }`}
                >
                  {filled ? (
                    <>
                      <Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white z-10" />
                      <div className="absolute inset-0 bg-white/10 rounded-lg md:rounded-xl animate-pulse" />
                    </>
                  ) : (
                    <div className="text-gray-300">
                      <Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    </div>
                  )}
                  <span className={`absolute bottom-0 right-0 md:bottom-0.5 md:right-0.5 lg:bottom-1 lg:right-1 text-xs md:text-sm lg:text-base font-bold ${
                    filled ? 'text-white' : 'text-gray-800'
                  }`}>
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Rewards Section */}
          {userInfo.availableRewards && userInfo.availableRewards.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl md:rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 border border-green-200 shadow-sm">
              <h4 className="text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-green-600" />
                Recompensas Disponibles
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userInfo.availableRewards.slice(0, 3).map((reward, idx) => (
                  <div key={reward.id || idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-100">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{reward.name}</p>
                      <p className="text-xs text-gray-500">{reward.required_seals} sellos</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                ))}
                {userInfo.availableRewards.length > 3 && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    +{userInfo.availableRewards.length - 3} más disponibles
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl md:rounded-xl lg:rounded-2xl p-2.5 md:p-3 lg:p-4 border border-gray-200 shadow-sm">
            <h4 className="text-xs md:text-sm font-medium text-gray-600 mb-2 md:mb-3">Añadir Sellos Rápido</h4>
            <div className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-3 gap-1 md:gap-1.5 lg:gap-2 max-w-xs md:max-w-sm mx-auto lg:max-w-none">
              {[1, 2, 3, 5, 10].map((num) => (
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

    // Mobile Premium Design - Simplified
    const renderMobileLayout = () => (
      <div className="space-y-3">
        {/* User Header Section - Simplified */}
        <div className="bg-black text-white rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate">
                  {userInfo.user?.name || 'Cliente'}
                </h3>
                <p className="text-xs opacity-75 truncate">
                  {userInfo.user?.email || 'Sin email'}
                </p>
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="text-xl font-bold">{Number(userInfo?.currentSeals) || 0}</div>
              <div className="text-xs opacity-75">sellos</div>
            </div>
          </div>
        </div>

        {/* Progress Section - Simplified */}
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">Progreso</span>
            <span className="text-xs font-medium">{Number(userInfo?.currentSeals) || 0} / 15</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-black h-full rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          
          {userInfo?.sealsRemaining === 0 && (
            <div className="bg-green-100 text-green-700 text-center py-2 rounded-lg text-sm font-medium">
              ¡Café Gratis Disponible!
            </div>
          )}

          {/* Stamps Grid - Simplified */}
          <div className="grid grid-cols-5 gap-1.5">
            {getRemainingCups().map((filled, i) => (
              <div key={i}
                className={`aspect-square rounded-lg flex items-center justify-center ${
                  filled 
                    ? 'bg-black' 
                    : 'bg-gray-100 border border-gray-300'
                }`}>
                <Coffee className={`w-3 h-3 ${filled ? 'text-white' : 'text-gray-400'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Simplified */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Sellos a añadir</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 5, 10].map((num) => (
              <button
                key={num}
                onClick={() => setSealsToAdd(num)}
                className={`flex-1 py-2 rounded-lg font-medium text-xs ${
                  sealsToAdd === num 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                +{num}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    return (
      <>
        {/* Desktop/Tablet Layout */}
        <div className="hidden md:block">
          {renderDesktopLayout()}
          
          {/* Action Section for Desktop/Tablet */}
          <div className="mt-4 md:mt-6 flex justify-center">
            <Button
              onClick={handleAddSeals}
              disabled={loading}
              className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-semibold px-8 md:px-12 py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-lg transform transition-all hover:scale-105 text-sm md:text-base"
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

        {/* Mobile Layout - Rendered in Bottom Sheet */}
        <div className="md:hidden">
          {renderMobileLayout()}
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

  // Debug logs
  console.log('🔍 [Wallet] Final render state check:');
  console.log('  - stats:', stats);
  console.log('  - transactions:', transactions);
  console.log('  - transactions is array?:', Array.isArray(transactions));
  console.log('  - error:', error);
  console.log('  - success:', success);
  
  // Additional safety check
  if (stats && typeof stats === 'object' && (stats.seals !== undefined || stats.rewards !== undefined)) {
    console.error('❌❌❌ [Wallet] FOUND THE PROBLEM: stats contains {seals, rewards} structure!');
    console.error('❌❌❌ [Wallet] Invalid stats object:', stats);
    setStats(null);
    setError('Estructura de datos incorrecta recibida del servidor');
  }

  try {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Google Wallet</h1>
          <p className="text-sm text-gray-600 hidden md:block">Gestiona los sellos y recompensas de los clientes</p>
        </div>
        {/* Only show toggle button on desktop when user info is shown */}
        {userInfo && (
          <Button
            onClick={() => {
              resetScanner();
              setShowScanner(true);
            }}
            className="hidden md:flex bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5 md:px-8 md:py-3 rounded-lg md:rounded-xl group"
          >
            <ScanLine className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Nuevo Escaneo</span>
          </Button>
        )}
      </div>

      {/* QR Scanner - PRIORITY: Always first visible element */}
      {showScanner && !userInfo && (
        <>
          {/* Mobile - Direct camera view */}
          <div className="md:hidden mb-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-black to-gray-800 text-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <h2 className="font-semibold text-base">Escanear Sellos</h2>
                  </div>
                  <span className="text-xs opacity-75">Apunta al código QR</span>
                </div>
              </div>
              <div className="p-3">
                <MobileQRScanner 
                  onScan={handleScanSuccess}
                  autoStart={true}
                />
              </div>
            </div>
          </div>
          
          {/* Desktop - Integrated card style */}
          <div className="hidden md:block md:mb-6">
            <Card className="border-0 shadow-macos">
              <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanLine className="w-5 h-5" />
                    Escanear QR del Cliente
                  </div>
                  <Button
                    onClick={() => setShowScanner(false)}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="max-w-md mx-auto">
                  <QRScanner 
                    onScan={handleScanSuccess}
                    onClose={() => {}}
                    title=""
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* User Info Modal - Responsive Design */}
      {showScanner && userInfo && (
        <>
          {/* Desktop/Tablet Modal - Full Experience */}
          <div className="hidden md:fixed md:inset-0 md:bg-black/70 md:backdrop-blur-md md:z-50 md:flex md:items-center md:justify-center md:p-4 lg:p-6">
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-400 w-full max-w-2xl lg:max-w-4xl max-h-[90vh] md:max-h-[85vh] flex">
              <Card className="border-0 shadow-2xl rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-b from-white to-gray-50 flex flex-col w-full">
                {/* Premium Header */}
                <CardHeader className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-3 md:py-4 px-5 md:px-6 overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="relative">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                      </div>
                      <CardTitle className="text-base md:text-lg font-medium tracking-wide">
                        Sesión de Cliente Activa
                      </CardTitle>
                      <Badge className="bg-white/20 text-white border-white/30 text-xs">
                        En vivo
                      </Badge>
                    </div>
                    <button
                      onClick={resetScanner}
                      className="group p-1.5 md:p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <X className="w-4 md:w-5 h-4 md:h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </CardHeader>
                
                {/* Premium Content - Scrollable */}
                <CardContent className="p-4 md:p-5 lg:p-6 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-y-auto flex-1">
                  {renderUserInfo()}
                  
                </CardContent>
              </Card>
            </div>
          </div>
          
          
          {/* Mobile - Simplified Card View */}
          <div className="md:hidden">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Compact User Header */}
              <div className="bg-black text-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <User className="w-5 h-5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{userInfo.user?.name || 'Cliente'}</h3>
                      <p className="text-xs opacity-75 truncate">{userInfo.user?.email || 'Sin email'}</p>
                    </div>
                  </div>
                  <button
                    onClick={resetScanner}
                    className="p-1.5 bg-white/20 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Simple Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold">{userInfo.currentSeals}</div>
                    <div className="text-xs opacity-75">actual</div>
                  </div>
                  <div className="border-x border-white/30">
                    <div className="text-lg font-bold">{userInfo.sealsRemaining}</div>
                    <div className="text-xs opacity-75">faltan</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{userInfo.lifetimeSeals || 0}</div>
                    <div className="text-xs opacity-75">total</div>
                  </div>
                </div>
              </div>

              {/* Transaction Result - Black & White */}
              {userInfo.lastTransaction && success && (
                <div className="p-3 bg-gray-100 border-b border-gray-300">
                  {userInfo.lastTransaction.rewardGranted ? (
                    <div className="text-center">
                      <Coffee className="w-8 h-8 text-black mx-auto mb-2" />
                      {/* Check for additional rewards in the message */}
                      <p className="font-bold text-black">¡Café Gratis!</p>
                      <p className="text-xs text-gray-600 mt-1">Contador reiniciado a 0</p>
                      {(success.includes('Además') || success.includes('desbloqueado')) && success.includes(':') && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs text-black font-medium">
                            {(() => {
                              // Extract reward name from message like "¡Además, has desbloqueado: Brownie gratis!"
                              const match = success.match(/desbloqueado:\s*(.+?)(?:\!|$)/);
                              return match ? `+ ${match[1]}` : '';
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-black" />
                        <span className="text-sm font-medium text-black">+{userInfo.lastTransaction.sealsAdded} sellos</span>
                      </div>
                      <span className="text-xs text-gray-600">Total: {userInfo.lastTransaction.newTotal}/15</span>
                    </div>
                  )}
                </div>
              )}

              {/* Seals Grid - Simplified */}
              <div className="p-3">
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {Array.from({ length: 15 }, (_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center ${
                        i < userInfo.currentSeals 
                          ? 'bg-black' 
                          : 'bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <Coffee className={`w-3 h-3 ${i < userInfo.currentSeals ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-600">
                  {userInfo.sealsRemaining === 0 
                    ? '¡Café gratis disponible!' 
                    : `Faltan ${userInfo.sealsRemaining} sellos`}
                </p>
              </div>


              {/* Actions - Simplified */}
              <div className="p-3 border-t border-gray-200 space-y-2">
                {/* Quick Seal Buttons */}
                <div className="flex gap-1">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSealsToAdd(num)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                        sealsToAdd === num 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      +{num}
                    </button>
                  ))}
                </div>

                {/* Main Actions */}
                <Button
                  onClick={handleAddSeals}
                  disabled={loading}
                  className="w-full bg-black text-white py-2.5 rounded-lg font-medium text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Añadir {sealsToAdd} {sealsToAdd === 1 ? 'Sello' : 'Sellos'}</>
                  )}
                </Button>
                
                <Button
                  onClick={() => {
                    setQrToken('');
                    setUserInfo(null);
                    setSealsToAdd(1);
                    setNotes('');
                    setError(null);
                    setSuccess(null);
                    setShowScanner(true);
                  }}
                  variant="outline"
                  className="w-full border border-gray-300 py-2.5 rounded-lg text-sm"
                >
                  <ScanLine className="w-3 h-3 mr-1 inline" />
                  Nuevo Escaneo
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error Messages Only - Success is shown in transaction result */}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Statistics Cards - Never show on mobile */}
      {!isMobile && (() => {
        
        console.log('🎨 [Wallet] Rendering stats section, stats value:', stats);
        console.log('🎨 [Wallet] Stats type:', typeof stats);
        console.log('🎨 [Wallet] Stats is array?:', Array.isArray(stats));
        
        if (!stats || typeof stats !== 'object' || Array.isArray(stats)) {
          console.warn('⚠️ [Wallet] Skipping stats render due to invalid data');
          return null;
        }
        
        console.log('🎨 [Wallet] Stats.wallets:', stats.wallets);
        console.log('🎨 [Wallet] Stats.today:', stats.today);
        console.log('🎨 [Wallet] Stats.thisWeek:', stats.thisWeek);
        
        return (
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
                <div className="text-xl md:text-2xl font-bold">{stats?.wallets?.totalUsers || 0}</div>
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
              <div className="text-xl md:text-2xl font-bold">{stats?.wallets?.usersCloseToReward || 0}</div>
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
              <div className="text-xl md:text-2xl font-bold">{stats?.today?.sealsGivenToday || 0}</div>
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
              <div className="text-xl md:text-2xl font-bold">{stats?.today?.rewardsGrantedToday || 0}</div>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">Cafés gratis</p>
            </CardContent>
          </Card>
        </div>
        );
      })()}

      {/* Weekly Stats - Never show on mobile */}
      {!isMobile && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card className="border-0 shadow-macos">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estadísticas Semanales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats && typeof stats === 'object' && !Array.isArray(stats) ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Sellos</p>
                    <p className="text-xl md:text-2xl font-bold">{stats?.thisWeek?.sealsGivenThisWeek || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Premios</p>
                    <p className="text-xl md:text-2xl font-bold">{stats?.thisWeek?.rewardsGrantedThisWeek || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Trans.</p>
                    <p className="text-xl md:text-2xl font-bold">{stats?.thisWeek?.transactionsThisWeek || 0}</p>
                  </div>
                </div>
              </div>
            ) : null}
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
            {stats?.thisWeek?.dailyBreakdown && typeof stats.thisWeek.dailyBreakdown === 'object' ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(stats.thisWeek.dailyBreakdown).map(([date, countData]) => {
                  // Handle both number and object formats
                  const count = typeof countData === 'number' 
                    ? countData 
                    : (countData?.seals || countData?.rewards || countData?.total || 0);
                  
                  // Log if we find the problematic structure
                  if (typeof countData === 'object' && (countData.seals !== undefined || countData.rewards !== undefined)) {
                    console.warn('⚠️ [Wallet] dailyBreakdown contains {seals, rewards} structure for date:', date, countData);
                  }
                  
                  return (
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
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Transactions Table - Never show on mobile */}
      {!isMobile && (
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
                    <p className="font-medium">{transaction?.user?.name || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-600">{transaction?.user?.email || 'Sin email'}</p>
                  </div>
                  <Badge variant="outline">+{transaction?.sealsAdded || 0}</Badge>
                </div>
                {transaction?.rewardGranted && (
                  <Badge className="bg-black text-white">Premio</Badge>
                )}
                <p className="text-xs text-gray-600">
                  {transaction?.createdAt ? formatDate(transaction.createdAt) : 'Sin fecha'}
                </p>
                {transaction?.notes && (
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
                        <p className="font-medium">{transaction?.user?.name || 'Usuario'}</p>
                        <p className="text-xs text-gray-600">{transaction?.user?.email || 'Sin email'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">+{transaction?.sealsAdded || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      {transaction?.rewardGranted && (
                        <Badge className="bg-green-600 text-white">Premio</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction?.notes || '-'}
                    </TableCell>
                    <TableCell>{transaction?.performedBy?.name || 'Sistema'}</TableCell>
                    <TableCell className="text-sm">
                      {transaction?.createdAt ? formatDate(transaction.createdAt) : 'Sin fecha'}
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
      )}


      {/* Newly Unlocked Rewards Modal */}
      {showUnlockedRewardsModal && newlyUnlockedRewards.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl transform animate-in zoom-in-105 duration-300 max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg animate-bounce">
                <Award className="w-10 h-10 text-white" />
                <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">¡NUEVAS RECOMPENSAS!</h2>
                <p className="text-sm text-gray-600 mt-2">Has desbloqueado {newlyUnlockedRewards.length} nueva{newlyUnlockedRewards.length > 1 ? 's' : ''} recompensa{newlyUnlockedRewards.length > 1 ? 's' : ''}</p>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {newlyUnlockedRewards.map((reward, idx) => (
                  <div key={reward.id || idx} className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-800">{reward.name}</p>
                        <p className="text-xs text-gray-600">{reward.description || `Requiere ${reward.required_seals} sellos`}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => {
                  setShowUnlockedRewardsModal(false);
                  setNewlyUnlockedRewards([]);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105"
              >
                ¡Genial!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  } catch (renderError) {
    console.error('❌❌❌ [Wallet] Render error caught:', renderError);
    console.error('❌❌❌ [Wallet] Error stack:', renderError.stack);
    console.error('❌❌❌ [Wallet] Current state when error occurred:');
    console.error('  - stats:', stats);
    console.error('  - transactions:', transactions);
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-bold mb-2">Error de Renderizado</h2>
          <p className="text-red-600">Ha ocurrido un error al renderizar la página de Wallet.</p>
          <p className="text-sm text-red-500 mt-2">Por favor, revisa la consola para más detalles.</p>
        </div>
      </div>
    );
  }
}

export default Wallet;