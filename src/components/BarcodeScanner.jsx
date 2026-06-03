import React, { useEffect, useState, useRef } from 'react';
import { Camera, X, RefreshCw, Keyboard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ onScan, onClose, showWebcam = true }) {
  const [error, setError] = useState('');
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [activeCamera, setActiveCamera] = useState('environment'); // environment or user
  const scannerRef = useRef(null);
  const html5QrcodeInstance = useRef(null);

  // 1. Keyboard Emulator Detections (Physical barcode scanners act as fast keyboards)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      const now = Date.now();
      
      // If delay between keys is small, it's likely a scanner
      if (now - lastKeyTime > 50) {
        buffer = ''; // Reset buffer if typing is too slow (manual input)
      }
      
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 4) { // Typical barcodes are at least 4 chars
          console.log('Scanner Barcode Detected:', buffer);
          onScan(buffer);
          buffer = '';
          e.preventDefault();
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan]);

  // 2. Webcam Scanner Initialization using html5-qrcode
  useEffect(() => {
    if (!showWebcam) return;

    const elementId = 'scanner-video-container';
    
    // Tiny delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      try {
        const html5Qrcode = new Html5Qrcode(elementId);
        html5QrcodeInstance.current = html5Qrcode;

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 150 } 
        };

        html5Qrcode.start(
          { facingMode: activeCamera },
          config,
          (decodedText) => {
            console.log('Camera scanned code:', decodedText);
            // Play a success scan sound if possible
            playBeep();
            onScan(decodedText);
            // Stop after scan to avoid double scans
            stopScanner();
          },
          (errorMessage) => {
            // This fires constantly during scanning, we can ignore it
          }
        )
        .then(() => {
          setIsScannerReady(true);
        })
        .catch((err) => {
          console.warn('Error starting camera scanner:', err);
          setError('No se pudo acceder a la cámara. Usando entrada de pruebas.');
        });
      } catch (err) {
        console.error('Html5Qrcode setup error:', err);
        setError('Error al inicializar la cámara de escaneo.');
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [showWebcam, activeCamera]);

  const stopScanner = () => {
    if (html5QrcodeInstance.current && html5QrcodeInstance.current.isScanning) {
      html5QrcodeInstance.current.stop()
        .then(() => {
          console.log('Camera stopped.');
        })
        .catch(err => console.error('Error stopping camera:', err));
    }
  };

  const toggleCamera = () => {
    stopScanner();
    setIsScannerReady(false);
    setActiveCamera(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = 1000; // 1kHz beep
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1); // 100ms beep
    } catch (e) {
      console.warn('Beep audio not supported/allowed yet');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      playBeep();
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 900 }}>
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} /> Escanear Código de Barras
          </h3>
          {onClose && (
            <button className="cart-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="modal-body" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <p style={{ fontSize: '12px', color: 'var(--light-text)', marginBottom: '12px' }}>
            Apunta la cámara al código de barras o simula la lectura abajo.
          </p>

          {showWebcam && !error && (
            <div style={{ position: 'relative', width: '100%' }}>
              <div id="scanner-video-container" className="scanner-viewport">
                <div className="scanner-laser"></div>
                {!isScannerReady && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontSize: '13px' }}>
                    Iniciando cámara...
                  </div>
                )}
              </div>
              
              {isScannerReady && (
                <button 
                  onClick={toggleCamera} 
                  style={{
                    position: 'absolute', bottom: '20px', right: '20px', 
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', 
                    padding: '8px', color: '#fff', cursor: 'pointer', zIndex: 20
                  }}
                  title="Cambiar Cámara"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          )}

          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', border: '1px solid #fca5a5', 
              color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', 
              fontSize: '12px', width: '100%', marginBottom: '16px' 
            }}>
              {error}
            </div>
          )}

          <div style={{ 
            marginTop: '16px', borderTop: '1px solid var(--border-color)', 
            paddingTop: '16px', width: '100%' 
          }}>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Digitar código para probar (ej: 7790060023689)"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                style={{ flex: 1 }}
              />
              <button 
                type="submit" 
                className="add-to-cart-btn"
                style={{ width: 'auto', padding: '10px 16px' }}
              >
                Cargar
              </button>
            </form>
          </div>

          <div style={{ 
            marginTop: '16px', backgroundColor: 'var(--bg-light)', 
            padding: '10px', borderRadius: '6px', width: '100%', 
            fontSize: '11px', textAlign: 'left', color: 'var(--light-text)' 
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--dark-text)' }}>
              Lector de Mano Físico compatible:
            </strong>
            Simplemente mantén esta ventana abierta y dispara con tu lector físico. Capturará el código automáticamente.
          </div>
        </div>
      </div>
    </div>
  );
}
