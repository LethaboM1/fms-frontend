// import React from 'react';

// const DriverDashboard = ({ user, onLogout }) => {
//   return (
//     <div style={{ padding: '20px' }}>
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '30px',
//         backgroundColor: '#2e7d32',
//         color: 'white',
//         padding: '20px',
//         borderRadius: '8px'
//       }}>
//         <div>
//           <h1 style={{ margin: 0 }}>Driver Dashboard</h1>
//           <p style={{ margin: 0, opacity: 0.9 }}>Vehicle and Fuel Management</p>
//         </div>
//         <button 
//           onClick={onLogout}
//           style={{ 
//             padding: '10px 20px', 
//             border: '1px solid #fff',
//             backgroundColor: 'transparent',
//             color: 'white',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Logout
//         </button>
//       </div>

//       <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
//         <h3>Welcome, {user.fullName}!</h3>
//         <p><strong>Role:</strong> {user.role}</p>
//         <p><strong>Email:</strong> {user.email}</p>
//         <p><strong>Assigned Vehicle:</strong> Service Truck 12</p>
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
//         <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
//           <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>Fuel Level</h4>
//           <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>45%</p>
//         </div>
//         <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
//           <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>Range</h4>
//           <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>280 km</p>
//         </div>
//         <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
//           <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>Consumption</h4>
//           <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ed6c02' }}>8.2 km/L</p>
//         </div>
//       </div>

//       <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
//         <h3>Quick Actions</h3>
//         <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//           <button style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px' }}>
//             Record Refuel
//           </button>
//           <button style={{ padding: '10px 20px', backgroundColor: '#ed6c02', color: 'white', border: 'none', borderRadius: '4px' }}>
//             Report Issue
//           </button>
//           <button style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px' }}>
//             View Schedule
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverDashboard;

import React, { useState, useRef, useEffect } from 'react';
import QRScanner from '../qr/QRScanner';

const DriverDashboard = ({ user, onLogout }) => {
  const [showOdometerScanner, setShowOdometerScanner] = useState(false);
  const [showReceiptCamera, setShowReceiptCamera] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [receipts, setReceipts] = useState([]);
  const [odometerHistory, setOdometerHistory] = useState([]);
  const [refuelHistory, setRefuelHistory] = useState([]);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const cardRefs = useRef({});

  // Current vehicle status with real-time data
  const [vehicleStatus, setVehicleStatus] = useState({
    currentOdometer: '18,542',
    fuelLevel: 78,
    range: 520,
    consumption: 7.2,
    lastRefuel: new Date().toLocaleDateString(),
    status: 'Active',
    vehicle: 'Service Truck 12',
    nextService: '2,500 km'
  });

  // Create a sample receipt image
  const createSampleReceiptImage = (receiptData) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FUEL RECEIPT', canvas.width / 2, 50);
    
    // Content
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    
    const details = [
      `Date: ${receiptData.timestamp}`,
      `Station: ${receiptData.station || 'BP Service Station'}`,
      `Fuel Type: Diesel`,
      `Amount: ${receiptData.amount || '52.5'}L`,
      `Total: R ${receiptData.cost || '985.75'}`,
      `Vehicle: ${vehicleStatus.vehicle}`,
      `Driver: ${user.fullName}`,
      `Odometer: ${receiptData.odometer || '18,587'} KM`
    ];
    
    details.forEach((line, index) => {
      ctx.fillText(line, 50, 150 + (index * 40));
    });
    
    // Footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for your business!', canvas.width / 2, 500);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  // Initialize with current data
  useEffect(() => {
    const currentDate = new Date();
    const today = currentDate.toLocaleDateString();
    const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString();

    setOdometerHistory([
      { id: 1, date: `${today} 07:15`, reading: '18542', type: 'start', driver: user.fullName },
      { id: 2, date: `${today} 12:30`, reading: '18587', type: 'before_refuel', driver: user.fullName },
      { id: 3, date: `${today} 12:35`, reading: '18587', type: 'after_refuel', driver: user.fullName },
      { id: 4, date: `${yesterday} 07:20`, reading: '18420', type: 'start', driver: user.fullName },
    ]);

    setRefuelHistory([
      { id: 1, date: `${today} 12:30`, odometerBefore: '18587', odometerAfter: '18587', fuelAmount: 52.5, cost: 985.75, receipt: 'receipt_001.jpg' },
      { id: 2, date: `${yesterday} 14:45`, odometerBefore: '18345', odometerAfter: '18345', fuelAmount: 48.0, cost: 898.40, receipt: 'receipt_002.jpg' },
    ]);

    // Create actual image files for sample receipts
    const createSampleReceipts = async () => {
      const sampleReceipts = [];
      
      // Create first sample receipt
      const blob1 = await createSampleReceiptImage({
        timestamp: `${today} 12:32`,
        station: 'BP Service Station',
        amount: '52.5',
        cost: '985.75',
        odometer: '18,587'
      });
      
      const fileUrl1 = URL.createObjectURL(blob1);
      sampleReceipts.push({
        id: 1, 
        fileName: `receipt_${Date.now()}_1.jpg`,
        originalName: 'BP_Refuel_Current.jpg',
        timestamp: `${today} 12:32`,
        fileSize: blob1.size,
        fileType: 'image/jpeg',
        fileUrl: fileUrl1,
        blob: blob1
      });

      // Create second sample receipt
      const blob2 = await createSampleReceiptImage({
        timestamp: `${yesterday} 14:47`,
        station: 'Shell Service Station',
        amount: '48.0',
        cost: '898.40',
        odometer: '18,345'
      });
      
      const fileUrl2 = URL.createObjectURL(blob2);
      sampleReceipts.push({
        id: 2, 
        fileName: `receipt_${Date.now()}_2.jpg`,
        originalName: 'Shell_Refuel_Recent.jpg', 
        timestamp: `${yesterday} 14:47`,
        fileSize: blob2.size,
        fileType: 'image/jpeg',
        fileUrl: fileUrl2,
        blob: blob2
      });
      
      setReceipts(sampleReceipts);
    };

    createSampleReceipts();
  }, [user.fullName]);

  // Handle odometer QR scan
  const handleOdometerScan = (scannedData) => {
    try {
      let odometerValue = scannedData.replace(/[^\d.]/g, '');
      
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        reading: odometerValue,
        type: currentAction,
        driver: user.fullName
      };

      setOdometerHistory(prev => [newRecord, ...prev]);
      setVehicleStatus(prev => ({ ...prev, currentOdometer: odometerValue }));

      const messages = {
        start: `🚗 Start of day recorded: ${odometerValue} KM`,
        before_refuel: `⛽ Pre-refuel odometer: ${odometerValue} KM`, 
        after_refuel: `✅ Post-refuel odometer: ${odometerValue} KM`
      };

      alert(messages[currentAction] || `Odometer recorded: ${odometerValue} KM`);
      setShowOdometerScanner(false);
      setCurrentAction('');
      
    } catch (error) {
      alert('Error reading odometer QR. Please try again.');
    }
  };

  // Action handlers
  const handleStartWork = () => {
    setCurrentAction('start');
    setShowOdometerScanner(true);
  };

  const handleBeforeRefuel = () => {
    setCurrentAction('before_refuel');
    setShowOdometerScanner(true);
  };

  const handleAfterRefuel = () => {
    setCurrentAction('after_refuel');
    setShowOdometerScanner(true);
  };

  // Enhanced download receipt function for images
  const downloadReceipt = async (receipt) => {
    try {
      let blob;
      
      if (receipt.blob) {
        // Use existing blob
        blob = receipt.blob;
      } else if (receipt.fileUrl) {
        // Fetch the image from the fileUrl
        const response = await fetch(receipt.fileUrl);
        blob = await response.blob();
      } else {
        // Create a new receipt image on the fly
        blob = await createSampleReceiptImage({
          timestamp: receipt.timestamp,
          station: receipt.originalName.includes('BP') ? 'BP Service Station' : 'Shell Service Station',
          amount: receipt.originalName.includes('Current') ? '52.5' : '48.0',
          cost: receipt.originalName.includes('Current') ? '985.75' : '898.40',
          odometer: receipt.originalName.includes('Current') ? '18,587' : '18,345'
        });
      }

      // Create download link
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = receipt.originalName.endsWith('.jpg') ? receipt.originalName : `${receipt.originalName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL after download
      setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading receipt. Please try again.');
    }
  };

  // Enhanced camera functions with better error handling
  const startCamera = async () => {
    try {
      setCameraError('');
      setCameraReady(false);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera permissions with better error handling
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
        
        // Handle video errors
        videoRef.current.onerror = () => {
          setCameraError('Failed to load camera stream');
        };
      }

    } catch (error) {
      console.error('Camera error:', error);
      let errorMessage = 'Camera access denied. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions in your browser settings and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      setCameraError(errorMessage);
      setCameraReady(false);
    }
  };

  const capturePhoto = () => {
    if (!cameraReady || !videoRef.current || !canvasRef.current) {
      setCameraError('Camera not ready. Please try again.');
      return;
    }

    try {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Convert to blob and save
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `receipt_${Date.now()}.jpg`, { 
            type: 'image/jpeg'
          });
          saveReceipt(file);
          closeCamera();
        } else {
          setCameraError('Failed to capture photo. Please try again.');
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Capture error:', error);
      setCameraError('Error capturing photo: ' + error.message);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setShowReceiptCamera(false);
    setCameraReady(false);
    setCameraError('');
  };

  const openCameraModal = () => {
    setShowReceiptCamera(true);
    // Start camera after a brief delay to ensure modal is open
    setTimeout(() => {
      startCamera();
    }, 300);
  };

  const saveReceipt = (file) => {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    const fileUrl = URL.createObjectURL(file);
    
    const receiptData = {
      id: Date.now(),
      fileName: uniqueFileName,
      fileUrl: fileUrl,
      originalName: `Receipt_${new Date().toLocaleDateString().replace(/\//g, '-')}.${fileExtension}`,
      timestamp: new Date().toLocaleString(),
      fileSize: file.size,
      fileType: file.type,
      dimensions: file.type.startsWith('image/') ? 'Image' : 'File'
    };

    setReceipts(prev => [receiptData, ...prev]);
    alert('Receipt saved successfully!');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      saveReceipt(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  // Statistics calculations
  const getTodayDistance = () => {
    const todayStart = odometerHistory.find(record => 
      record.type === 'start' && 
      new Date(record.date).toDateString() === new Date().toDateString()
    );
    return todayStart ? (parseFloat(odometerHistory[0]?.reading) - parseFloat(todayStart.reading)) : 45;
  };

  // Safe hover handler
  const handleMouseEnter = (cardId) => {
    setHoveredCard(cardId);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  // Action cards data
  const actionCards = [
    {
      id: 'start',
      emoji: '🚗',
      title: 'Start Work',
      description: 'Scan odometer to begin your day',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      onClick: handleStartWork
    },
    {
      id: 'before_refuel',
      emoji: '⛽',
      title: 'Before Refuel',
      description: 'Scan odometer before refueling',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
      onClick: handleBeforeRefuel
    },
    {
      id: 'after_refuel',
      emoji: '✅',
      title: 'After Refuel',
      description: 'Scan odometer after refueling',
      gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      onClick: handleAfterRefuel
    }
  ];

  const cameraCards = [
    {
      id: 'camera',
      emoji: '📷',
      title: 'Camera',
      description: 'Take receipt photo',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      onClick: openCameraModal
    },
    {
      id: 'upload',
      emoji: '📁',
      title: 'Upload',
      description: 'Upload receipt file',
      gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
      onClick: () => fileInputRef.current?.click()
    }
  ];

  // Card style generator
  const getCardStyle = (cardId) => ({
    background: actionCards.find(c => c.id === cardId)?.gradient || cameraCards.find(c => c.id === cardId)?.gradient,
    padding: '25px',
    borderRadius: '16px',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    transform: hoveredCard === cardId ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)'
  });

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        padding: '25px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, color: 'white', fontSize: '2.2rem', fontWeight: '700' }}>Driver Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
            Welcome back, {user.fullName}!
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '10px 20px', 
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600'
          }}>
            🚗 {vehicleStatus.vehicle}
          </div>
          <button 
            onClick={onLogout}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: 'rgba(239,68,68,0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '25px' }}>
        {/* Main Content */}
        <div>
          {/* Action Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px',
            marginBottom: '25px'
          }}>
            {actionCards.map((card) => (
              <div 
                key={card.id}
                onClick={card.onClick}
                onMouseEnter={() => handleMouseEnter(card.id)}
                onMouseLeave={handleMouseLeave}
                style={getCardStyle(card.id)}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{card.emoji}</div>
                <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '1.2rem' }}>{card.title}</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Camera Actions */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '25px'
          }}>
            {cameraCards.map((card) => (
              <div 
                key={card.id}
                onClick={card.onClick}
                onMouseEnter={() => handleMouseEnter(card.id)}
                onMouseLeave={handleMouseLeave}
                style={getCardStyle(card.id)}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{card.emoji}</div>
                <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '1.2rem' }}>{card.title}</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  {card.description}
                </p>
              </div>
            ))}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* Data Section */}
          <div style={{ 
            backgroundColor: 'rgba(30,41,59,0.8)',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
              {['odometer', 'refuel', 'receipts'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '12px 24px',
                    background: activeTab === tab ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {tab === 'odometer' ? '📊 Odometer' : 
                   tab === 'refuel' ? '⛽ Refuel' : 
                   `📁 Receipts (${receipts.length})`}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'odometer' && (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      {['Date & Time', 'Reading (KM)', 'Type', 'Driver'].map(header => (
                        <th key={header} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {odometerHistory.map(record => (
                      <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <td style={{ padding: '15px' }}>{record.date}</td>
                        <td style={{ padding: '15px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {parseInt(record.reading).toLocaleString()} KM
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{ 
                            padding: '6px 12px', 
                            borderRadius: '20px',
                            backgroundColor: 
                              record.type === 'start' ? 'rgba(16,185,129,0.2)' : 
                              record.type === 'before_refuel' ? 'rgba(59,130,246,0.2)' : 'rgba(249,115,22,0.2)',
                            color: 
                              record.type === 'start' ? '#10b981' : 
                              record.type === 'before_refuel' ? '#3b82f6' : '#f97316',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {record.type === 'start' ? 'START DAY' : 
                             record.type === 'before_refuel' ? 'BEFORE REFUEL' : 'AFTER REFUEL'}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>{record.driver}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'receipts' && receipts.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {receipts.map((receipt, index) => (
                  <div 
                    key={receipt.id}
                    onMouseEnter={() => handleMouseEnter(`receipt-${index}`)}
                    onMouseLeave={handleMouseLeave}
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      transform: hoveredCard === `receipt-${index}` ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)'
                    }}
                  >
                    {/* Image Preview */}
                    <div style={{ 
                      width: '100%', 
                      height: '150px', 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {receipt.fileUrl ? (
                        <img 
                          src={receipt.fileUrl} 
                          alt={receipt.originalName}
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '6px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{ 
                        display: receipt.fileUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        fontSize: '2rem',
                        color: 'rgba(255,255,255,0.5)'
                      }}>
                        📄
                      </div>
                    </div>
                    
                    <div style={{ color: 'white', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                      {receipt.originalName}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '15px' }}>
                      {(receipt.fileSize / 1024 / 1024).toFixed(1)} MB • {receipt.timestamp}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => setSelectedImage(receipt)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        👁️ View
                      </button>
                      <button 
                        onClick={() => downloadReceipt(receipt)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ⬇ Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Vehicle Status */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.3rem' }}>🚗 Vehicle Status</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                { label: 'Current Odometer', value: `${parseInt(vehicleStatus.currentOdometer).toLocaleString()} KM`, emoji: '📊' },
                { label: 'Fuel Level', value: `${vehicleStatus.fuelLevel}%`, emoji: '⛽', color: vehicleStatus.fuelLevel < 20 ? '#ef4444' : '#10b981' },
                { label: 'Range', value: `${vehicleStatus.range} km`, emoji: '🛣️' },
                { label: 'Consumption', value: `${vehicleStatus.consumption} km/L`, emoji: '⚡' },
                { label: 'Last Refuel', value: vehicleStatus.lastRefuel, emoji: '🕒' },
                { label: 'Next Service', value: vehicleStatus.nextService, emoji: '🔧' }
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.emoji} {item.label}
                  </span>
                  <span style={{ color: item.color || 'white', fontWeight: '600' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Summary */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(14,165,233,0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.3rem' }}>📈 Today's Summary</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ 
                padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '5px' }}>
                  {getTodayDistance().toLocaleString()} km
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Distance Traveled</div>
              </div>
              
              <div style={{ 
                padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '5px' }}>
                  {odometerHistory.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Odometer Scans</div>
              </div>

              <div style={{ 
                padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '5px' }}>
                  {receipts.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Receipts Captured</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showOdometerScanner && (
        <QRScanner 
          onScan={handleOdometerScan}
          onClose={() => {
            setShowOdometerScanner(false);
            setCurrentAction('');
          }}
          title={`Scan Odometer - ${currentAction === 'start' ? 'Start of Day' : currentAction === 'before_refuel' ? 'Before Refuel' : 'After Refuel'}`}
          description="Point camera at vehicle's odometer QR code"
        />
      )}

      {/* Receipt Camera Modal */}
      {showReceiptCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '20px', textAlign: 'center', fontSize: '1.5rem' }}>
            📷 Take Receipt Photo
          </h3>
          
          {cameraError && (
            <div style={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '20px',
              maxWidth: '500px',
              textAlign: 'center'
            }}>
              {cameraError}
              <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.9 }}>
                Tip: Check browser permissions and refresh the page
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              maxHeight: '60vh',
              borderRadius: '16px',
              transform: 'scaleX(-1)',
              display: cameraReady && !cameraError ? 'block' : 'none',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          />
          
          {!cameraReady && !cameraError && (
            <div style={{ 
              width: '100%', 
              maxWidth: '500px', 
              height: '300px',
              background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem'
            }}>
              Starting camera...
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div style={{ marginTop: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              style={{
                padding: '15px 30px',
                background: cameraReady ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: cameraReady ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              📸 Capture
            </button>
            
            <button
              onClick={closeCamera}
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              ❌ Close
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img 
              src={selectedImage.fileUrl} 
              alt={selectedImage.originalName}
              style={{ 
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '8px',
                boxShadow: '0 10px 50px rgba(0,0,0,0.5)'
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(239,68,68,0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <div style={{ 
              color: 'white', 
              textAlign: 'center', 
              marginTop: '10px',
              fontSize: '14px'
            }}>
              {selectedImage.originalName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;