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
import React, { useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState(null);

  const startScanner = async () => {
    try {
      setError('');
      setScannedData(null);
      setIsScanning(true);
      
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            const parsedData = JSON.parse(result.data);
            setScannedData(parsedData);
            onScan(result.data);
          } catch (e) {
            setScannedData({
              plantNumber: result.data,
              plantName: 'Unknown Equipment',
              plantType: 'Unknown Type',
              fuelType: 'Unknown',
              category: 'general'
            });
            onScan(result.data);
          }
          
          scanner.stop();
          setIsScanning(false);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      await scanner.start();
      videoRef.current.scanner = scanner;
    } catch (err) {
      setError('Failed to start camera: ' + err.message);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.scanner) {
      videoRef.current.scanner.stop();
      videoRef.current.scanner.destroy();
    }
    setIsScanning(false);
  };

  const clearScannedData = () => {
    setScannedData(null);
  };

  React.useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>QR Code Scanner</h3>
        
        {error && (
          <div style={{
            color: 'red',
            backgroundColor: '#ffe6e6',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        {scannedData && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '2px solid #1b5e20'
          }}>
            <h4 style={{ color: '#1b5e20', marginBottom: '10px', textAlign: 'center' }}>
              ✅ Equipment Scanned Successfully
            </h4>
            
            <div style={{ textAlign: 'left', lineHeight: '1.8' }}>
              <div><strong>Fleet Number:</strong> {scannedData.plantNumber}</div>
              <div><strong>Description:</strong> {scannedData.plantName}</div>
              <div><strong>Type:</strong> {scannedData.plantType}</div>
              <div><strong>Fuel Type:</strong> {scannedData.fuelType}</div>
              <div><strong>Category:</strong> {scannedData.category}</div>
            </div>
            
            <button
              onClick={clearScannedData}
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
            >
              Clear & Scan Again
            </button>
          </div>
        )}

        <div style={{
          width: '100%',
          height: '300px',
          backgroundColor: '#000',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '15px',
          position: 'relative'
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {isScanning && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              🔍 Scanning...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {!isScanning ? (
            <button
              onClick={startScanner}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1b5e20',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Start Scanner
            </button>
          ) : (
            <button
              onClick={stopScanner}
              style={{
                padding: '10px 20px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Stop Scanner
            </button>
          )}
          
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '15px', color: '#666', fontSize: '14px' }}>
          Point your camera at a vehicle QR code to scan equipment information
        </p>
      </div>
    </div>
  );
};

export default QRScanner;