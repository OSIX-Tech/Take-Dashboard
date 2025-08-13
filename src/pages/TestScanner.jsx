import { useState } from 'react';
import QRScanner from '../components/QRScanner';
import { CheckCircle } from 'lucide-react';

function TestScanner() {
  const [scannedCode, setScannedCode] = useState(null);

  const handleScan = (code) => {
    setScannedCode(code);
  };

  const resetScanner = () => {
    setScannedCode(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-2xl font-bold text-center mb-6">Test QR Scanner</h1>
        
        {!scannedCode ? (
          <QRScanner 
            onScan={handleScan}
            title="Probar Escáner"
          />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
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
          </div>
        )}

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