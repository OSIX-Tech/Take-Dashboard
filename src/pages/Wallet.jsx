import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import ErrorMessage from '../components/common/ErrorMessage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  QrCode, 
  Coffee, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Camera,
  X,
  Keyboard,
  Plus,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  ScanLine
} from 'lucide-react';
import walletService from '../services/walletService';

function Wallet() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const [scannerMode, setScannerMode] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    loadStats();
    loadTransactions();
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear();
      }
    };
  }, []);

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

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
  const startScanner = () => {
    setScannerMode(true);
    setManualMode(false);
    setError(null);
    
    setTimeout(() => {
      if (scannerRef.current && !html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 1.5,
            formatsToSupport: ['QR_CODE']
          },
          false
        );

        html5QrcodeScannerRef.current.render(
          (decodedText) => {
            setQrToken(decodedText);
            stopScanner();
            handleScanQR(decodedText);
          },
          (error) => {
            console.log('Scan error:', error);
          }
        );
      }
    }, 100);
  };

  const stopScanner = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }
    setScannerMode(false);
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
      const data = await walletService.scanQRToken(token);
      setUserInfo(data);
      setSealsToAdd(1);
      setNotes('');
      setManualMode(false);
    } catch (err) {
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
      const result = await walletService.addSeals(qrToken, sealsToAdd, notes);
      
      if (result.rewardGranted) {
        setShowReward(true);
        setSuccess('¡Café gratis conseguido!');
      } else {
        setSuccess(`${sealsToAdd} sello${sealsToAdd > 1 ? 's' : ''} añadido${sealsToAdd > 1 ? 's' : ''} correctamente`);
      }

      const updatedData = await walletService.scanQRToken(qrToken);
      setUserInfo(updatedData);
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
    setScannerMode(false);
    setManualMode(false);
    setShowScanner(false);
    stopScanner();
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
    return Math.min((userInfo.currentSeals / 15) * 100, 100);
  };

  const getRemainingCups = () => {
    if (!userInfo) return [];
    const total = 15;
    const current = userInfo.currentSeals;
    return Array.from({ length: total }, (_, i) => i < current);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 sm:mb-0">Google Wallet</h1>
        <Button
          onClick={() => setShowScanner(!showScanner)}
          className="bg-black text-white hover:bg-gray-800"
        >
          <ScanLine className="w-4 h-4 mr-2" />
          Escanear Cliente
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

      {/* QR Scanner Section - Collapsible */}
      {showScanner && (
        <Card className="mb-6 border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-black text-white py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="w-5 h-5" />
                <span className="font-semibold">Escanear Cliente</span>
              </CardTitle>
              <button
                onClick={resetScanner}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-5 pb-5 bg-white">
            {!userInfo && !scannerMode && !manualMode && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <ScanLine className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-base font-semibold mb-1">Selecciona método de escaneo</h3>
                <p className="text-xs text-gray-600 mb-4">Escanea el código QR del cliente para añadir sellos</p>
                
                <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                  <button
                    onClick={startScanner}
                    className="bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all shadow-md"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="w-5 h-5" />
                      <p className="text-xs font-medium">Cámara</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setManualMode(true)}
                    className="bg-white border border-gray-300 text-black p-3 rounded-lg hover:border-black transition-all shadow-md"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Keyboard className="w-5 h-5" />
                      <p className="text-xs font-medium">Manual</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Camera Scanner */}
            {scannerMode && (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <h3 className="font-semibold">Escaneando...</h3>
                    </div>
                    <button
                      onClick={stopScanner}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden shadow-inner"></div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4" />
                      Apunta al código QR del cliente
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Input */}
            {manualMode && !userInfo && (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Keyboard className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold">Introducir Código</h3>
                    </div>
                    <button
                      onClick={() => setManualMode(false)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={qrToken}
                        onChange={(e) => setQrToken(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors text-center text-lg font-mono"
                        placeholder="ABC-123-XYZ"
                        autoFocus
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <QrCode className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleScanQR()}
                      disabled={loading || !qrToken.trim()}
                      className="w-full py-3"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Buscando...
                        </span>
                      ) : (
                        'Buscar Cliente'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* User Info */}
            {userInfo && (
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-black text-white rounded-lg">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{userInfo.user?.name}</h3>
                        <p className="text-sm text-gray-600">{userInfo.user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={resetScanner}
                      className="text-sm text-gray-500 hover:text-black transition-colors"
                    >
                      Cambiar
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Sellos actuales</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black">{userInfo.currentSeals}</span>
                          <span className="text-lg text-gray-400">/15</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Faltan</p>
                        <Badge variant={userInfo.sealsRemaining <= 3 ? "default" : "outline"} className="text-lg px-3 py-1">
                          {userInfo.sealsRemaining}
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
                      {userInfo.sealsRemaining <= 3 && userInfo.sealsRemaining > 0 && (
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
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards - Mobile Responsive Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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

      {/* Weekly Stats - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card>
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

        <Card>
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

      {/* Transactions Table - Mobile Responsive */}
      <Card>
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
        <CardContent>
          {/* Mobile View */}
          <div className="block lg:hidden space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{transaction.user?.name}</p>
                    <p className="text-xs text-gray-600">{transaction.user?.email}</p>
                  </div>
                  <Badge variant="outline">+{transaction.sealsAdded}</Badge>
                </div>
                {transaction.rewardGranted && (
                  <Badge className="bg-green-600 text-white">Premio</Badge>
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