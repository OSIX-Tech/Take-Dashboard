import { useState, useRef, useEffect, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import { 
  Camera,
  X,
  Loader2,
  ScanLine,
  AlertCircle
} from 'lucide-react';

function MobileQRScanner({ onScan, onClose, autoStart = true }) {
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  const stopScanner = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setCameraActive(false);
    setIsInitializing(false);
  }, []);

  const startScanner = useCallback(async () => {
    try {
      setError(null);
      setIsInitializing(true);

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
              onDecodeError: () => {
                // Silently ignore decode errors during scanning
              },
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 5,
              preferredCamera: 'environment'
            }
          );

          try {
            await qrScannerRef.current.start();
            setCameraActive(true);
            setIsInitializing(false);
          } catch (err) {
            
            setError('No se pudo iniciar la cámara. Verifica los permisos.');
            setIsInitializing(false);
          }
        }
      }, 100);
    } catch (err) {
      
      setError(err.message || 'Error al iniciar el escáner');
      setIsInitializing(false);
    }
  }, []);

  const handleScanSuccess = (decodedText) => {
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    stopScanner();
    onScan(decodedText);
  };

  useEffect(() => {
    if (autoStart) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [autoStart]);

  const retry = () => {
    setError(null);
    startScanner();
  };

  return (
    <div className="relative w-full">
      {/* Camera View */}
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] md:aspect-square">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Loading Overlay */}
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
            <p className="text-white text-sm">Iniciando cámara...</p>
          </div>
        )}

        {/* Scan Frame Overlay */}
        {cameraActive && !isInitializing && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Darkened corners */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-1/4 bg-black/40" />
              <div className="absolute bottom-0 left-0 w-full h-1/4 bg-black/40" />
              <div className="absolute top-1/4 left-0 w-1/6 h-1/2 bg-black/40" />
              <div className="absolute top-1/4 right-0 w-1/6 h-1/2 bg-black/40" />
            </div>
            
            {/* Scan frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              
              {/* Scanning line animation */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan" />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                <ScanLine className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Apunta al código QR</span>
              </div>
            </div>
          </div>
        )}

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{error}</p>
              <button
                onClick={retry}
                className="mt-2 text-sm text-red-700 underline hover:no-underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(256px); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default MobileQRScanner;