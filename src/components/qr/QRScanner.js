// import React, { useRef, useState } from 'react';
// import QrScanner from 'qr-scanner';

// const QRScanner = ({ onScan, onClose }) => {
//   const videoRef = useRef(null);
//   const [isScanning, setIsScanning] = useState(false);
//   const [error, setError] = useState('');

//   const startScanner = async () => {
//     try {
//       setError('');
//       setIsScanning(true);
      
//       const scanner = new QrScanner(
//         videoRef.current,
//         (result) => {
//           console.log('QR Code scanned:', result);
//           onScan(result.data);
//           scanner.stop();
//           setIsScanning(false);
//         },
//         {
//           highlightScanRegion: true,
//           highlightCodeOutline: true,
//         }
//       );
      
//       await scanner.start();
      
//       // Store scanner instance for cleanup
//       videoRef.current.scanner = scanner;
//     } catch (err) {
//       setError('Failed to start camera: ' + err.message);
//       setIsScanning(false);
//     }
//   };

//   const stopScanner = () => {
//     if (videoRef.current?.scanner) {
//       videoRef.current.scanner.stop();
//       videoRef.current.scanner.destroy();
//     }
//     setIsScanning(false);
//   };

//   React.useEffect(() => {
//     return () => {
//       stopScanner();
//     };
//   }, []);

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.8)',
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       zIndex: 1000
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '20px',
//         borderRadius: '8px',
//         maxWidth: '500px',
//         width: '90%'
//       }}>
//         <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>QR Code Scanner</h3>
        
//         {error && (
//           <div style={{
//             color: 'red',
//             backgroundColor: '#ffe6e6',
//             padding: '10px',
//             borderRadius: '4px',
//             marginBottom: '15px'
//           }}>
//             {error}
//           </div>
//         )}

//         <div style={{
//           width: '100%',
//           height: '300px',
//           backgroundColor: '#000',
//           borderRadius: '4px',
//           overflow: 'hidden',
//           marginBottom: '15px'
//         }}>
//           <video
//             ref={videoRef}
//             style={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover'
//             }}
//           />
//         </div>

//         <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//           {!isScanning ? (
//             <button
//               onClick={startScanner}
//               style={{
//                 padding: '10px 20px',
//                 backgroundColor: '#1b5e20',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               Start Scanner
//             </button>
//           ) : (
//             <button
//               onClick={stopScanner}
//               style={{
//                 padding: '10px 20px',
//                 backgroundColor: '#d32f2f',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               Stop Scanner
//             </button>
//           )}
          
//           <button
//             onClick={onClose}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#666',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Close
//           </button>
//         </div>

//         <p style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}>
//           Point your camera at a vehicle QR code to automatically fill plant number
//         </p>
//       </div>
//     </div>
//   );
// };

// export default QRScanner;



/////////////////////////QR CODE WITHOUT SCANNER////////////////////////////////////
// import React, { useState } from 'react';

// const QRScanner = ({ onScan, onClose }) => {
//   const [manualInput, setManualInput] = useState('');

//   const handleManualSubmit = () => {
//     if (manualInput.trim()) {
//       onScan(manualInput.trim());
//       onClose();
//     } else {
//       alert('Please enter a plant number');
//     }
//   };

//   const handleQuickSelect = (plantNumber) => {
//     onScan(plantNumber);
//     onClose();
//   };

//   // Common plant numbers for quick selection
//   const commonPlants = [
//     'A-APP04', 'A-APP03', 'A-APP02', 'A-APP05', 'A-APP06',
//     'A-APB05', 'A-APD06', 'A-APD07', 'A-APD08', 'A-APD09',
//     'A-APD11', 'A-APN01', 'A-APV10', 'A-ASR01', 'A-ASR02',
//     'A-BBS03', 'A-BBS04', 'A-BDT02', 'A-BDT06', 'A-BEP01',
//     'A-BEP02', 'A-BNS08', 'A-BNS09', 'A-BNS10', 'A-BOC106',
//     'A-BOC107', 'A-BOC108', 'A-BRM11', 'A-BRM12', 'A-BRM13',
//     'A-BRM14', 'A-BTH100', 'A-BTH104', 'A-BTH115', 'A-CCK05',
//     'A-CHR03', 'A-CJK06', 'A-CSK01', 'A-CSM02', 'A-CSC03',
//     'A-CSE07', 'A-CSE08', 'A-CSE09', 'A-CSE10', 'A-DOK13',
//     'A-DOK15', 'A-DOK16', 'A-EXK38', 'A-EXK42', 'A-EXK44',
//     'A-EXK46', 'A-FDH39', 'A-FDH23', 'A-FDH26'
//   ];

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.9)',
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       zIndex: 1000
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '20px',
//         borderRadius: '8px',
//         maxWidth: '500px',
//         width: '90%',
//         maxHeight: '90vh',
//         overflow: 'auto'
//       }}>

//         <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>Enter Equipment Information</h3>

//         {/* Manual Input Section */}
//         <div style={{ marginBottom: '20px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', textAlign: 'left' }}>
//             Plant Number:
//           </label>
//           <input
//             type="text"
//             value={manualInput}
//             onChange={(e) => setManualInput(e.target.value)}
//             placeholder="e.g., A-APP04"
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: '1px solid #ddd',
//               borderRadius: '4px',
//               fontSize: '16px',
//               marginBottom: '10px'
//             }}
//             onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
//           />
          
//           <button
//             onClick={handleManualSubmit}
//             disabled={!manualInput.trim()}
//             style={{
//               width: '100%',
//               padding: '12px',
//               backgroundColor: manualInput.trim() ? '#4caf50' : '#ccc',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: manualInput.trim() ? 'pointer' : 'not-allowed',
//               fontSize: '16px',
//               fontWeight: 'bold'
//             }}
//           >
//             ✅ Use This Equipment
//           </button>
//         </div>

//         {/* Quick Select Options */}
//         <div style={{ 
//           backgroundColor: '#f0f8ff',
//           padding: '15px',
//           borderRadius: '8px',
//           marginBottom: '20px'
//         }}>
//           <h4 style={{ color: '#2196f3', margin: '0 0 15px 0', textAlign: 'center' }}>Quick Select Common Equipment:</h4>
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: '1fr 1fr', 
//             gap: '8px',
//             maxHeight: '200px',
//             overflowY: 'auto'
//           }}>
//             {commonPlants.map(plant => (
//               <button
//                 key={plant}
//                 onClick={() => handleQuickSelect(plant)}
//                 style={{
//                   padding: '8px 12px',
//                   backgroundColor: '#2196f3',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: 'pointer',
//                   fontSize: '12px',
//                   textAlign: 'center'
//                 }}
//               >
//                 {plant}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Camera Not Working Notice */}
//         <div style={{ 
//           backgroundColor: '#fff3e0',
//           padding: '15px',
//           borderRadius: '8px',
//           marginBottom: '20px',
//           border: '1px solid #ffb74d'
//         }}>
//           <h4 style={{ color: '#e65100', margin: '0 0 10px 0', textAlign: 'center' }}>📷 Camera Not Available</h4>
//           <p style={{ margin: 0, color: '#666', fontSize: '14px', textAlign: 'center' }}>
//             Use manual input or quick select buttons above. 
//             The plant number will be automatically populated in the form.
//           </p>
//         </div>

//         <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//           <button
//             onClick={onClose}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#666',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QRScanner;
///////////////////////////QR SCANNER WORKS////////////////////////////////////

import React, { useRef, useState, useEffect } from 'react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');

  // Start camera using native HTML5 API
  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);
      setCameraReady(false);
      setLastScannedCode('');

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Get camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);

      // Set video source and wait for it to load
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        const playVideo = () => {
          videoRef.current.play().then(() => {
            setCameraReady(true);
            console.log('Camera started successfully');
            startQRDetection();
          }).catch(playError => {
            console.error('Video play error:', playError);
            setError('Failed to start camera video. Please try again.');
          });
        };

        if (videoRef.current.readyState >= 3) {
          playVideo();
        } else {
          videoRef.current.onloadeddata = playVideo;
        }
      }

    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'Camera Error: ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = '❌ Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '❌ No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = '❌ Camera not supported. Try Chrome browser.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = '❌ Camera is in use by another application.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  // QR Code Detection
  const startQRDetection = () => {
    let animationFrameId;
    
    const detectQR = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for QR detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Detect QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          console.log('QR Code detected:', code.data);
          setLastScannedCode(code.data);
          
          // Stop scanning and return result
          stopCamera();
          onScan(code.data);
          onClose();
          return;
        }
      }
      
      // Continue scanning
      animationFrameId = requestAnimationFrame(detectQR);
    };
    
    // Start detection loop
    animationFrameId = requestAnimationFrame(detectQR);
    
    // Return cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  };

  // Manual QR code input as fallback
  const handleManualInput = () => {
    const qrData = prompt('Enter plant number (e.g., A-APP04) or paste QR code data:');
    if (qrData) {
      onScan(qrData);
      onClose();
    }
  };

  // Test with sample data
  const handleTestScan = () => {
    const testData = '{"plantNumber":"A-APP04","plantName":"ASPHALT MIXING PLANT AMMANN 140TPH","plantType":"Asphalt Plant","fuelType":"Diesel","category":"plant"}';
    onScan(testData);
    onClose();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    setIsScanning(false);
    setCameraReady(false);
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '95%',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>

        <h3 style={{ marginBottom: '20px', color: '#333' }}>📷 Scan QR Code</h3>

        {error && (
          <div style={{ 
            color: '#d32f2f', 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#ffebee', 
            borderRadius: '8px',
            border: '1px solid #f44336',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Camera Access Required</div>
            <div style={{ fontSize: '14px', marginBottom: '15px' }}>{error}</div>
            
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button 
                onClick={startCamera}
                style={{
                  padding: '12px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        )}

        {/* Camera Preview */}
        <div style={{
          width: '100%',
          height: '300px',
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
          position: 'relative',
          border: '3px solid #333'
        }}>
          <video
            ref={videoRef}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: 'scaleX(-1)'
            }}
            muted
            playsInline
          />
          
          {/* Hidden canvas for QR processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Loading overlay */}
          {!cameraReady && !error && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.8)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📷</div>
                <div>Starting camera...</div>
                <div style={{ fontSize: '12px', marginTop: '5px', color: '#ccc' }}>Please wait</div>
              </div>
            </div>
          )}
          
          {/* Scanning overlay when camera is ready */}
          {cameraReady && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{
                width: '250px',
                height: '250px',
                border: '4px solid #00ff00',
                borderRadius: '15px',
                position: 'relative',
                boxShadow: '0 0 30px rgba(0, 255, 0, 0.6)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '15%',
                  right: '15%',
                  height: '4px',
                  backgroundColor: '#00ff00',
                  animation: 'scan 2s ease-in-out infinite',
                  boxShadow: '0 0 10px #00ff00'
                }}></div>
              </div>
              
              <div style={{
                color: '#00ff00',
                fontSize: '18px',
                fontWeight: 'bold',
                marginTop: '20px',
                textShadow: '0 0 10px #00ff00',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '8px 16px',
                borderRadius: '20px'
              }}>
                🔍 Scanning for QR Codes...
              </div>
            </div>
          )}
        </div>

        {/* Camera Status */}
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px',
          backgroundColor: cameraReady ? '#e8f5e8' : '#fff3e0',
          borderRadius: '6px',
          color: cameraReady ? '#2e7d32' : '#f57c00',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {cameraReady ? '✅ Camera Active - Scanning for QR Codes' : '🔄 Starting Camera...'}
        </div>

        {/* Last scanned code display */}
        {lastScannedCode && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '12px',
            backgroundColor: '#4caf50',
            color: 'white',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ✅ QR Code Detected!
          </div>
        )}

        {/* Scanning Instructions */}
        <div style={{ 
          marginBottom: '25px', 
          color: '#555',
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>How to Scan:</div>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            1. Point camera at the QR code<br/>
            2. Ensure good lighting<br/>
            3. Hold steady for 2-3 seconds<br/>
            4. Scanner will detect automatically
          </div>
        </div>

        {/* Alternative Options */}
        <div style={{ 
          backgroundColor: '#e3f2fd',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '2px solid #2196f3'
        }}>
          <h4 style={{ color: '#1976d2', margin: '0 0 15px 0' }}>Alternative Options</h4>
          
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              onClick={handleTestScan}
              style={{
                padding: '12px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🧪 Test with Sample Data
            </button>
            
            <button
              onClick={handleManualInput}
              style={{
                padding: '12px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📝 Enter Manually
            </button>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={startCamera}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📷 Restart Scanner
          </button>
          
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes scan {
            0% {
              transform: translateY(-100px);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default QRScanner;