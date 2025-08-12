import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  QrCode, 
  Camera,
  X,
  Keyboard,
  ScanLine,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function TestScanner() {
  const [qrToken, setQrToken] = useState('');
  const [scannerMode, setScannerMode] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    setScannerMode(true);
    setManualMode(false);
    setScannedCode(null);
    
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
            setScannedCode(decodedText);
            stopScanner();
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

  const handleManualSubmit = () => {
    if (qrToken.trim()) {
      setScannedCode(qrToken);
      setManualMode(false);
    }
  };

  const resetScanner = () => {
    setQrToken('');
    setScannedCode(null);
    setScannerMode(false);
    setManualMode(false);
    stopScanner();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-2xl font-bold text-center mb-6">Test QR Scanner</h1>
        
        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-black text-white py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="w-5 h-5" />
                <span className="font-semibold">Probar Escáner</span>
              </CardTitle>
              {(scannerMode || manualMode || scannedCode) && (
                <button
                  onClick={resetScanner}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-5 pb-5 bg-white">
            {/* Initial state - show options */}
            {!scannedCode && !scannerMode && !manualMode && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <ScanLine className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-base font-semibold mb-1">Selecciona método de escaneo</h3>
                <p className="text-xs text-gray-600 mb-4">Prueba el escáner QR</p>
                
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

            {/* Result Display */}
            {scannedCode && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">¡Código Escaneado!</h3>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Código QR:</p>
                  <p className="font-mono text-sm break-all">{scannedCode}</p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  La cámara funciona correctamente ✓
                </p>
                <button
                  onClick={resetScanner}
                  className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Escanear Otro
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/login'}
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            ← Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestScanner;