import React, { useState, useRef, useEffect } from 'react';
import QRScanner from '../qr/QRScanner';

const ServiceTruckDriverDashboard = ({ user, onLogout }) => {
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

  // Service Truck specific status with real-time data
  const [truckStatus, setTruckStatus] = useState({
    currentOdometer: '45,287',
    fuelLevel: 65,
    range: 380,
    consumption: 5.8,
    lastRefuel: new Date().toLocaleDateString(),
    status: 'On Duty',
    truck: 'Service Truck FSH01 - 01',
    nextService: '1,200 km',
    currentLocation: 'Site 2163 - Hillary',
    toolsStatus: 'All Present',
    fuelCardBalance: 'R 2,450.00'
  });

  // Create a sample receipt image for service truck
  const createSampleReceiptImage = (receiptData) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(0, 0, canvas.width, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SERVICE TRUCK FUEL RECEIPT', canvas.width / 2, 50);
    
    // Content
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    
    const details = [
      `Date: ${receiptData.timestamp}`,
      `Station: ${receiptData.station || 'BP Service Station'}`,
      `Fuel Type: Diesel`,
      `Amount: ${receiptData.amount || '65.0'}L`,
      `Total: R ${receiptData.cost || '1,215.50'}`,
      `Service Truck: ${truckStatus.truck}`,
      `Driver: ${user.fullName}`,
      `Odometer: ${receiptData.odometer || '45,287'} KM`,
      `Site: ${truckStatus.currentLocation}`,
      `Fuel Card: **** 4567`
    ];
    
    details.forEach((line, index) => {
      ctx.fillText(line, 50, 150 + (index * 35));
    });
    
    // Footer
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Authorized Service Vehicle - Fuel Management System', canvas.width / 2, 500);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  // Initialize with service truck data
  useEffect(() => {
    const currentDate = new Date();
    const today = currentDate.toLocaleDateString();
    const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString();

    setOdometerHistory([
      { id: 1, date: `${today} 06:00`, reading: '45287', type: 'start', driver: user.fullName, site: 'Workshop' },
      { id: 2, date: `${today} 08:30`, reading: '45325', type: 'site_arrival', driver: user.fullName, site: 'Site 2163' },
      { id: 3, date: `${today} 12:15`, reading: '45365', type: 'before_refuel', driver: user.fullName, site: 'BP Station' },
      { id: 4, date: `${today} 12:20`, reading: '45365', type: 'after_refuel', driver: user.fullName, site: 'BP Station' },
      { id: 5, date: `${yesterday} 06:15`, reading: '45120', type: 'start', driver: user.fullName, site: 'Workshop' },
    ]);

    setRefuelHistory([
      { id: 1, date: `${today} 12:15`, odometerBefore: '45365', odometerAfter: '45365', fuelAmount: 65.0, cost: 1215.50, receipt: 'receipt_st_001.jpg' },
      { id: 2, date: `${yesterday} 13:30`, odometerBefore: '45180', odometerAfter: '45180', fuelAmount: 58.5, cost: 1095.75, receipt: 'receipt_st_002.jpg' },
    ]);

    // Create actual image files for sample receipts
    const createSampleReceipts = async () => {
      const sampleReceipts = [];
      
      // Create first sample receipt
      const blob1 = await createSampleReceiptImage({
        timestamp: `${today} 12:18`,
        station: 'BP Service Station',
        amount: '65.0',
        cost: '1,215.50',
        odometer: '45,365'
      });
      
      const fileUrl1 = URL.createObjectURL(blob1);
      sampleReceipts.push({
        id: 1, 
        fileName: `service_truck_receipt_${Date.now()}_1.jpg`,
        originalName: 'FSH01_BP_Refuel.jpg',
        timestamp: `${today} 12:18`,
        fileSize: blob1.size,
        fileType: 'image/jpeg',
        fileUrl: fileUrl1,
        blob: blob1
      });

      // Create second sample receipt
      const blob2 = await createSampleReceiptImage({
        timestamp: `${yesterday} 13:33`,
        station: 'Caltex Service Station',
        amount: '58.5',
        cost: '1,095.75',
        odometer: '45,180'
      });
      
      const fileUrl2 = URL.createObjectURL(blob2);
      sampleReceipts.push({
        id: 2, 
        fileName: `service_truck_receipt_${Date.now()}_2.jpg`,
        originalName: 'FSH01_Caltex_Refuel.jpg', 
        timestamp: `${yesterday} 13:33`,
        fileSize: blob2.size,
        fileType: 'image/jpeg',
        fileUrl: fileUrl2,
        blob: blob2
      });
      
      setReceipts(sampleReceipts);
    };

    createSampleReceipts();
  }, [user.fullName]);

  // Handle odometer QR scan for service truck
  const handleOdometerScan = (scannedData) => {
    try {
      let odometerValue = scannedData.replace(/[^\d.]/g, '');
      
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        reading: odometerValue,
        type: currentAction,
        driver: user.fullName,
        site: truckStatus.currentLocation
      };

      setOdometerHistory(prev => [newRecord, ...prev]);
      setTruckStatus(prev => ({ ...prev, currentOdometer: odometerValue }));

      const messages = {
        start: `🚛 Service Truck start recorded: ${odometerValue} KM`,
        site_arrival: `🏗️ Site arrival recorded: ${odometerValue} KM`,
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

  // Action handlers for service truck
  const handleStartWork = () => {
    setCurrentAction('start');
    setShowOdometerScanner(true);
  };

  const handleSiteArrival = () => {
    setCurrentAction('site_arrival');
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

  // Enhanced download receipt function for service truck
  const downloadReceipt = async (receipt) => {
    try {
      let blob;
      
      if (receipt.blob) {
        blob = receipt.blob;
      } else if (receipt.fileUrl) {
        const response = await fetch(receipt.fileUrl);
        blob = await response.blob();
      } else {
        blob = await createSampleReceiptImage({
          timestamp: receipt.timestamp,
          station: receipt.originalName.includes('BP') ? 'BP Service Station' : 'Caltex Service Station',
          amount: receipt.originalName.includes('Current') ? '65.0' : '58.5',
          cost: receipt.originalName.includes('Current') ? '1,215.50' : '1,095.75',
          odometer: receipt.originalName.includes('Current') ? '45,365' : '45,180'
        });
      }

      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = receipt.originalName.endsWith('.jpg') ? receipt.originalName : `${receipt.originalName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading receipt. Please try again.');
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError('');
      setCameraReady(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

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
      
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `service_truck_receipt_${Date.now()}.jpg`, { 
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
      originalName: `Service_Truck_Receipt_${new Date().toLocaleDateString().replace(/\//g, '-')}.${fileExtension}`,
      timestamp: new Date().toLocaleString(),
      fileSize: file.size,
      fileType: file.type,
      dimensions: file.type.startsWith('image/') ? 'Image' : 'File'
    };

    setReceipts(prev => [receiptData, ...prev]);
    alert('Service truck receipt saved successfully!');
    
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

  // Statistics calculations for service truck
  const getTodayDistance = () => {
    const todayStart = odometerHistory.find(record => 
      record.type === 'start' && 
      new Date(record.date).toDateString() === new Date().toDateString()
    );
    return todayStart ? (parseFloat(odometerHistory[0]?.reading) - parseFloat(todayStart.reading)) : 78;
  };

  // Safe hover handler
  const handleMouseEnter = (cardId) => {
    setHoveredCard(cardId);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  // Service Truck specific action cards
  const actionCards = [
    {
      id: 'start',
      emoji: '🚛',
      title: 'Start Shift',
      description: 'Scan odometer to begin service truck shift',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      onClick: handleStartWork
    },
    {
      id: 'site_arrival',
      emoji: '🏗️',
      title: 'Site Arrival',
      description: 'Record odometer at work site',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
      onClick: handleSiteArrival
    },
    {
      id: 'before_refuel',
      emoji: '⛽',
      title: 'Before Refuel',
      description: 'Scan odometer before refueling service truck',
      gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      onClick: handleBeforeRefuel
    },
    {
      id: 'after_refuel',
      emoji: '✅',
      title: 'After Refuel',
      description: 'Scan odometer after refueling service truck',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      onClick: handleAfterRefuel
    }
  ];

  const cameraCards = [
    {
      id: 'camera',
      emoji: '📷',
      title: 'Camera',
      description: 'Take receipt photo for service truck',
      gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
      onClick: openCameraModal
    },
    {
      id: 'upload',
      emoji: '📁',
      title: 'Upload',
      description: 'Upload receipt file for service truck',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
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
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        padding: '25px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, color: 'white', fontSize: '2.2rem', fontWeight: '700' }}>Service Truck Driver Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
            Heavy Vehicle Operations - Welcome, {user.fullName}!
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
            🚛 {truckStatus.truck}
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
            gridTemplateColumns: 'repeat(2, 1fr)', 
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
                    background: activeTab === tab ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {tab === 'odometer' ? '📊 Odometer Log' : 
                   tab === 'refuel' ? '⛽ Refuel History' : 
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
                      {['Date & Time', 'Reading (KM)', 'Type', 'Site', 'Driver'].map(header => (
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
                              record.type === 'site_arrival' ? 'rgba(59,130,246,0.2)' :
                              record.type === 'before_refuel' ? 'rgba(249,115,22,0.2)' : 'rgba(139,92,246,0.2)',
                            color: 
                              record.type === 'start' ? '#10b981' : 
                              record.type === 'site_arrival' ? '#3b82f6' :
                              record.type === 'before_refuel' ? '#f97316' : '#8b5cf6',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {record.type === 'start' ? 'START SHIFT' : 
                             record.type === 'site_arrival' ? 'SITE ARRIVAL' :
                             record.type === 'before_refuel' ? 'BEFORE REFUEL' : 'AFTER REFUEL'}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>{record.site}</td>
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
                          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
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
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
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
          {/* Service Truck Status */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.3rem' }}>🚛 Service Truck Status</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                { label: 'Current Odometer', value: `${parseInt(truckStatus.currentOdometer).toLocaleString()} KM`, emoji: '📊' },
                { label: 'Fuel Level', value: `${truckStatus.fuelLevel}%`, emoji: '⛽', color: truckStatus.fuelLevel < 25 ? '#ef4444' : '#10b981' },
                { label: 'Range', value: `${truckStatus.range} km`, emoji: '🛣️' },
                { label: 'Consumption', value: `${truckStatus.consumption} km/L`, emoji: '⚡' },
                { label: 'Current Location', value: truckStatus.currentLocation, emoji: '📍' },
                { label: 'Tools Status', value: truckStatus.toolsStatus, emoji: '🛠️', color: truckStatus.toolsStatus === 'All Present' ? '#10b981' : '#f59e0b' },
                { label: 'Fuel Card Balance', value: truckStatus.fuelCardBalance, emoji: '💳' },
                { label: 'Next Service', value: truckStatus.nextService, emoji: '🔧' }
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.emoji} {item.label}
                  </span>
                  <span style={{ color: item.color || 'white', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Service Summary */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(46,125,50,0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.3rem' }}>📈 Today's Service Summary</h3>
            
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
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Odometer Records</div>
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
          title={`Service Truck Odometer - ${currentAction === 'start' ? 'Start Shift' : currentAction === 'site_arrival' ? 'Site Arrival' : currentAction === 'before_refuel' ? 'Before Refuel' : 'After Refuel'}`}
          description="Point camera at service truck's odometer QR code"
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
            📷 Service Truck Receipt Photo
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
                background: cameraReady ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: cameraReady ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              📸 Capture Receipt
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

export default ServiceTruckDriverDashboard;