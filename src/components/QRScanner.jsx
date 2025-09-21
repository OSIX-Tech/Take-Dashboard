import { useState, useRef, useEffect, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import { 
  QrCode, 
  Camera,
  X,
  Keyboard,
  ScanLine,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

function QRScanner({ onScan, onClose, title = "Escanear QR", isModal = false }) {
  const [scannerMode, setScannerMode] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  const stopScanner = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScannerMode(false);
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const startScanner = async () => {
    try {
      setError(null);
      setScannerMode(true);
      setManualMode(false);
      setIsScanning(true);

      // Check camera permission
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error('No se encontró cámara disponible');
      }

      // Wait for video element to be ready
      setTimeout(async () => {
        if (videoRef.current && !qrScannerRef.current) {
          qrScannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              if (result && result.data) {
                handleScanSuccess(result.data);
              }
            },
            {
              onDecodeError: (err) => {
                // Ignore decode errors during scanning
                
              },
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 5,
              preferredCamera: 'environment'
            }
          );

          try {
            await qrScannerRef.current.start();
            setIsScanning(false);
          } catch (err) {
            
            setError('No se pudo iniciar la cámara. Por favor, verifica los permisos.');
            stopScanner();
          }
        }
      }, 100);
    } catch (err) {
      
      setError(err.message || 'Error al iniciar el escáner');
      setScannerMode(false);
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    stopScanner();
    onScan(decodedText);
  };

  const handleManualSubmit = () => {
    if (qrToken.trim()) {
      onScan(qrToken.trim());
      setQrToken('');
      setManualMode(false);
    }
  };

  const resetScanner = () => {
    stopScanner();
    setQrToken('');
    setScannerMode(false);
    setManualMode(false);
    setError(null);
  };

  return (
    <Card className={`border border-gray-200 ${isModal ? 'shadow-2xl' : 'shadow-lg'} rounded-xl overflow-hidden transform transition-all duration-300 ${isModal ? 'scale-100' : ''}`}>
      <CardHeader className="bg-gradient-to-r from-gray-900 to-black text-white py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
              <QrCode className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-semibold">{title}</span>
          </CardTitle>
          <button
            onClick={onClose || resetScanner}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:rotate-90"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-5 pb-5 bg-white">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Initial state - show options */}
        {!scannerMode && !manualMode && (
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4 shadow-inner">
              <ScanLine className="w-7 h-7 md:w-8 md:h-8 text-gray-700 animate-pulse" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">Selecciona método de escaneo</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-6">Escanea o introduce el código QR del cliente</p>
            
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button
                onClick={startScanner}
                className="group bg-black text-white p-4 md:p-5 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Camera className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <p className="text-xs md:text-sm font-medium">Usar Cámara</p>
                </div>
              </button>
              <button
                onClick={() => setManualMode(true)}
                className="group bg-white border-2 border-gray-300 text-black p-4 md:p-5 rounded-xl hover:border-black transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <Keyboard className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <p className="text-xs md:text-sm font-medium">Introducir Manual</p>
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
                  <h3 className="font-semibold">
                    {isScanning ? 'Iniciando cámara...' : 'Escaneando...'}
                  </h3>
                </div>
                <button
                  onClick={stopScanner}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  Apunta al código QR
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Input */}
        {manualMode && (
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
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors text-center text-lg font-mono"
                    placeholder="ABC-123-XYZ"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <QrCode className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <button
                  onClick={handleManualSubmit}
                  disabled={!qrToken.trim()}
                  className="w-full bg-black text-white py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
                >
                  Confirmar Código
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QRScanner;