import React, { useState, useEffect, useRef } from 'react';
import QRScanner from '../qr/QRScanner';
import * as XLSX from 'xlsx';
import { plantMasterList } from './plantMasterList';

// API configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Simple Odometer Photo Upload Component
const OdometerPhotoUpload = ({ 
  onPhotoUpload, 
  onClose, 
  type, 
  currentValue,
  plantNumber,
  transactionId,
  userId
}) => {
  const [manualValue, setManualValue] = useState(currentValue || '');
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedPhotoData, setUploadedPhotoData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoName(file.name);
      setErrorMessage('');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setPhoto(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhotoToServer = async () => {
    setErrorMessage('');
    
    if (!manualValue) {
      setErrorMessage('Please enter the reading value first');
      return;
    }
    
    if (!photo) {
      setErrorMessage('Please select a photo first');
      return;
    }

    if (!plantNumber) {
      setErrorMessage('Plant number is required for photo upload');
      return;
    }

    setUploading(true);
    
    try {
      // Create photo data object (simulated)
      const mockPhotoData = {
        photoId: Date.now(),
        filename: photoName || `odometer_${type}_${Date.now()}.jpg`,
        url: photo, // Store base64 image
        filepath: `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/odometer_${type}_${Date.now()}.jpg`,
        type: type,
        reading: manualValue,
        timestamp: new Date().toISOString(),
        folderPath: `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`,
        plantNumber: plantNumber,
        base64Data: photo // Store the actual image data
      };
      
      // Save to localStorage
      const savedPhotos = JSON.parse(localStorage.getItem('odometerPhotos') || '[]');
      savedPhotos.push(mockPhotoData);
      localStorage.setItem('odometerPhotos', JSON.stringify(savedPhotos));
      
      setUploadSuccess(true);
      setUploadedPhotoData(mockPhotoData);
      
      setTimeout(() => {
        onPhotoUpload({
          value: manualValue,
          photoData: mockPhotoData,
          type: type
        });
        onClose();
      }, 1500);
      
      setUploading(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage('Failed to upload photo. Please try again.');
      setUploading(false);
    }
  };

  const handleSaveWithoutPhoto = () => {
    if (!manualValue) {
      setErrorMessage('Please enter the reading value');
      return;
    }
    
    onPhotoUpload({
      value: manualValue,
      photoData: null,
      type: type
    });
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20' }}>
            {type === 'kilos' ? '📏 Odometer Kilometers' : '⏱️ Odometer Hours'}
          </h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #ef9a9a',
            fontSize: '14px'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Enter Reading: *
          </label>
          <input
            type="number"
            value={manualValue}
            onChange={(e) => {
              setManualValue(e.target.value);
              setErrorMessage('');
            }}
            placeholder={`Enter ${type === 'kilos' ? 'kilometers' : 'hours'}...`}
            step="0.1"
            style={{
              width: '100%',
              padding: '12px',
              border: errorMessage && !manualValue ? '2px solid #f44336' : '2px solid #1b5e20',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Upload Photo (Optional for verification):
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '15px',
              opacity: uploading ? 0.6 : 1
            }}
          >
            📷 {photoName ? 'Change Photo' : 'Take Photo / Upload Image'}
          </button>
          
          {photoName && (
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #4caf50',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4caf50' }}>✓</span>
                <span style={{ fontSize: '14px' }}>{photoName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actual Photo Preview */}
        {photo && !uploadSuccess && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Photo Preview:</p>
            <img 
              src={photo} 
              alt="Odometer" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '150px', 
                borderRadius: '8px',
                border: '2px solid #ddd'
              }} 
            />
          </div>
        )}

        {uploadSuccess && uploadedPhotoData && (
          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '15px',
            borderRadius: '6px',
            border: '2px solid #4caf50',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#4caf50', fontSize: '20px' }}>✅</span>
              <strong style={{ color: '#1b5e20' }}>Photo Uploaded Successfully!</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#555' }}>
              <div><strong>File:</strong> {uploadedPhotoData.filename}</div>
              <div><strong>Reading:</strong> {uploadedPhotoData.reading} {type === 'kilos' ? 'km' : 'hrs'}</div>
              <div><strong>Saved to:</strong> {uploadedPhotoData.folderPath}</div>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <button 
              onClick={handleSaveWithoutPhoto}
              disabled={!manualValue || uploading}
              style={{ 
                flex: 1,
                padding: '12px 20px', 
                backgroundColor: manualValue ? '#757575' : '#ccc', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px', 
                cursor: (manualValue && !uploading) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Save Without Photo
            </button>
            
            <button 
              onClick={uploadPhotoToServer}
              disabled={!manualValue || !photo || uploading}
              style={{ 
                flex: 1,
                padding: '12px 20px', 
                backgroundColor: (manualValue && photo && !uploading) ? '#1b5e20' : '#ccc', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px', 
                cursor: (manualValue && photo && !uploading) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {uploading ? 'Uploading...' : 'Save with Photo'}
            </button>
          </div>
          
          <button 
            onClick={onClose}
            disabled={uploading}
            style={{ 
              width: '100%',
              padding: '12px 20px', 
              backgroundColor: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #ddd',
              borderRadius: '6px', 
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginTop: '5px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// NEW: Meter Reading Photo Upload Component
const MeterReadingPhotoUpload = ({ 
  onPhotoUpload, 
  onClose, 
  type, 
  currentValue,
  plantNumber,
  transactionId,
  userId,
  meterType // 'before' or 'after'
}) => {
  const [manualValue, setManualValue] = useState(currentValue || '');
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedPhotoData, setUploadedPhotoData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoName(file.name);
      setErrorMessage('');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setPhoto(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhotoToServer = async () => {
    setErrorMessage('');
    
    if (!manualValue) {
      setErrorMessage('Please enter the meter reading value first');
      return;
    }
    
    if (!photo) {
      setErrorMessage('Please select a photo first');
      return;
    }

    if (!plantNumber) {
      setErrorMessage('Plant number is required for photo upload');
      return;
    }

    setUploading(true);
    
    try {
      // Create photo data object (simulated)
      const mockPhotoData = {
        photoId: Date.now(),
        filename: photoName || `meter_${meterType}_${type}_${Date.now()}.jpg`,
        url: photo,
        filepath: `uploads/meter_readings/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/meter_${meterType}_${type}_${Date.now()}.jpg`,
        type: 'meter',
        meterType: meterType,
        reading: manualValue,
        timestamp: new Date().toISOString(),
        folderPath: `uploads/meter_readings/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`,
        plantNumber: plantNumber,
        base64Data: photo
      };
      
      // Save to localStorage
      const savedPhotos = JSON.parse(localStorage.getItem('meterReadingPhotos') || '[]');
      savedPhotos.push(mockPhotoData);
      localStorage.setItem('meterReadingPhotos', JSON.stringify(savedPhotos));
      
      setUploadSuccess(true);
      setUploadedPhotoData(mockPhotoData);
      
      setTimeout(() => {
        onPhotoUpload({
          value: manualValue,
          photoData: mockPhotoData,
          type: type,
          meterType: meterType
        });
        onClose();
      }, 1500);
      
      setUploading(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage('Failed to upload photo. Please try again.');
      setUploading(false);
    }
  };

  const handleSaveWithoutPhoto = () => {
    if (!manualValue) {
      setErrorMessage('Please enter the meter reading value');
      return;
    }
    
    onPhotoUpload({
      value: manualValue,
      photoData: null,
      type: type,
      meterType: meterType
    });
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const getTitle = () => {
    if (meterType === 'before') {
      return '📈 Current Meter Reading (Before)';
    } else if (meterType === 'after') {
      return '📉 Closing Meter Reading (After)';
    } else {
      return '📊 Meter Reading';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20' }}>
            {getTitle()}
          </h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #ef9a9a',
            fontSize: '14px'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Enter Meter Reading: *
          </label>
          <input
            type="number"
            value={manualValue}
            onChange={(e) => {
              setManualValue(e.target.value);
              setErrorMessage('');
            }}
            placeholder="Enter meter reading..."
            step="0.1"
            style={{
              width: '100%',
              padding: '12px',
              border: errorMessage && !manualValue ? '2px solid #f44336' : '2px solid #1b5e20',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Upload Photo (For verification):
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '15px',
              opacity: uploading ? 0.6 : 1
            }}
          >
            📷 {photoName ? 'Change Photo' : 'Take Photo of Meter'}
          </button>
          
          {photoName && (
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #4caf50',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4caf50' }}>✓</span>
                <span style={{ fontSize: '14px' }}>{photoName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actual Photo Preview */}
        {photo && !uploadSuccess && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Photo Preview:</p>
            <img 
              src={photo} 
              alt="Meter Reading" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '150px', 
                borderRadius: '8px',
                border: '2px solid #ddd'
              }} 
            />
          </div>
        )}

        {uploadSuccess && uploadedPhotoData && (
          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '15px',
            borderRadius: '6px',
            border: '2px solid #4caf50',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#4caf50', fontSize: '20px' }}>✅</span>
              <strong style={{ color: '#1b5e20' }}>Meter Photo Uploaded Successfully!</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#555' }}>
              <div><strong>File:</strong> {uploadedPhotoData.filename}</div>
              <div><strong>Reading:</strong> {uploadedPhotoData.reading}</div>
              <div><strong>Type:</strong> {meterType === 'before' ? 'Before Fueling' : 'After Fueling'}</div>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <button 
              onClick={handleSaveWithoutPhoto}
              disabled={!manualValue || uploading}
              style={{ 
                flex: 1,
                padding: '12px 20px', 
                backgroundColor: manualValue ? '#757575' : '#ccc', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px', 
                cursor: (manualValue && !uploading) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Save Without Photo
            </button>
            
            <button 
              onClick={uploadPhotoToServer}
              disabled={!manualValue || !photo || uploading}
              style={{ 
                flex: 1,
                padding: '12px 20px', 
                backgroundColor: (manualValue && photo && !uploading) ? '#1b5e20' : '#ccc', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px', 
                cursor: (manualValue && photo && !uploading) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {uploading ? 'Uploading...' : 'Save with Photo'}
            </button>
          </div>
          
          <button 
            onClick={onClose}
            disabled={uploading}
            style={{ 
              width: '100%',
              padding: '12px 20px', 
              backgroundColor: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #ddd',
              borderRadius: '6px', 
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginTop: '5px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Photo Gallery Modal - Fixed version
const PhotoGalleryModal = ({ onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'odometer', 'meter'

  useEffect(() => {
    // Load all photos from localStorage
    const odometerPhotos = JSON.parse(localStorage.getItem('odometerPhotos') || '[]');
    const meterPhotos = JSON.parse(localStorage.getItem('meterReadingPhotos') || '[]');
    
    // Combine all photos
    const allPhotos = [
      ...odometerPhotos.map(photo => ({ ...photo, source: 'odometer' })),
      ...meterPhotos.map(photo => ({ ...photo, source: 'meter' }))
    ];
    
    // Ensure all photos have required properties
    const validatedPhotos = allPhotos.map(photo => ({
      photoId: photo.photoId || Date.now(),
      filename: photo.filename || `photo_${photo.type || 'unknown'}_${Date.now()}.jpg`,
      url: photo.url || '',
      filepath: photo.filepath || `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/unknown.jpg`,
      type: photo.type || 'unknown',
      meterType: photo.meterType || null,
      reading: photo.reading || '0',
      timestamp: photo.timestamp || new Date().toISOString(),
      folderPath: photo.folderPath || `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`,
      plantNumber: photo.plantNumber || 'Unknown',
      base64Data: photo.base64Data || null,
      source: photo.source || 'unknown'
    }));
    setPhotos(validatedPhotos);
  }, []);

  const getFolderStats = () => {
    const folders = {};
    photos.forEach(photo => {
      // Ensure folderPath exists and has a default value
      const folder = photo.folderPath || `uploads/unknown/${new Date().toISOString().slice(0, 7)}/`;
      if (!folders[folder]) {
        folders[folder] = {
          count: 0,
          photos: [],
          latestDate: photo.timestamp
        };
      }
      folders[folder].count++;
      folders[folder].photos.push(photo);
      if (new Date(photo.timestamp) > new Date(folders[folder].latestDate)) {
        folders[folder].latestDate = photo.timestamp;
      }
    });
    return folders;
  };

  const folderStats = getFolderStats();

  // Helper function to safely get folder name
  const getFolderName = (folderPath) => {
    if (!folderPath) return 'Unknown';
    const parts = folderPath.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : folderPath;
  };

  // Filter photos based on active tab
  const filteredPhotos = photos.filter(photo => {
    if (activeTab === 'all') return true;
    if (activeTab === 'odometer') return photo.source === 'odometer';
    if (activeTab === 'meter') return photo.source === 'meter';
    return true;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        margin: 'auto',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20' }}>
              📁 Photo Gallery
            </h3>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ 
                  padding: '5px 10px',
                  backgroundColor: viewMode === 'grid' ? '#1b5e20' : '#f5f5f5',
                  color: viewMode === 'grid' ? 'white' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📷 Grid View
              </button>
              <button 
                onClick={() => setViewMode('folders')}
                style={{ 
                  padding: '5px 10px',
                  backgroundColor: viewMode === 'folders' ? '#1b5e20' : '#f5f5f5',
                  color: viewMode === 'folders' ? 'white' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📁 Folder View
              </button>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'all' ? '#1b5e20' : '#f5f5f5',
              color: activeTab === 'all' ? 'white' : '#333',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📸 All Photos
          </button>
          <button
            onClick={() => setActiveTab('odometer')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'odometer' ? '#1976d2' : '#f5f5f5',
              color: activeTab === 'odometer' ? 'white' : '#333',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📏 Odometer
          </button>
          <button
            onClick={() => setActiveTab('meter')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'meter' ? '#ff9800' : '#f5f5f5',
              color: activeTab === 'meter' ? 'white' : '#333',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📊 Meter Readings
          </button>
        </div>

        {/* Statistics */}
        <div style={{ 
          backgroundColor: '#f0f7ff', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #bbdefb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#1976d2' }}>📊 Photo Statistics</h4>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Total: {photos.length} photos • {Object.keys(folderStats).length} folders
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
            <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1565c0' }}>📸 All Photos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{photos.length}</div>
            </div>
            <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1b5e20' }}>📏 Odometer</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{photos.filter(p => p.source === 'odometer').length}</div>
            </div>
            <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>📊 Meter Readings</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{photos.filter(p => p.source === 'meter').length}</div>
            </div>
            <div style={{ backgroundColor: '#f3e5f5', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#7b1fa2' }}>📅 Today</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {photos.filter(p => new Date(p.timestamp).toDateString() === new Date().toDateString()).length}
              </div>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'folders' ? (
          // Folder View
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>📁 Folders</h4>
            {Object.entries(folderStats).length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {Object.entries(folderStats).map(([folder, data]) => (
                  <div key={folder} style={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>📁</span>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#333' }}>{getFolderName(folder)}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{folder}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {data.count} photo{data.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    {/* Photos in this folder */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '10px',
                      marginTop: '10px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      padding: '10px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '6px'
                    }}>
                      {data.photos.slice(0, 10).map(photo => (
                        <div 
                          key={photo.photoId}
                          onClick={() => setSelectedPhoto(photo)}
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: '1px solid #ddd',
                            transition: 'transform 0.2s',
                            ':hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          {photo.base64Data ? (
                            <img 
                              src={photo.base64Data} 
                              alt={photo.filename}
                              style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{ 
                              height: '80px',
                              backgroundColor: '#e9ecef',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#666'
                            }}>
                              {photo.source === 'odometer' ? '📏' : '📊'}
                            </div>
                          )}
                          <div style={{ padding: '5px', fontSize: '10px' }}>
                            <div style={{ fontWeight: 'bold' }}>{photo.reading} {photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : ''}</div>
                            <div style={{ color: '#666' }}>{photo.source === 'odometer' ? 'Odometer' : 'Meter'}</div>
                          </div>
                        </div>
                      ))}
                      {data.photos.length > 10 && (
                        <div style={{
                          backgroundColor: '#e3f2fd',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '80px',
                          color: '#1976d2',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          +{data.photos.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                <h4 style={{ color: '#555' }}>No folders found</h4>
                <p>Upload photos to create folders</p>
              </div>
            )}
          </div>
        ) : (
          // Grid View
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>📷 {activeTab === 'all' ? 'All' : activeTab === 'odometer' ? 'Odometer' : 'Meter'} Photos ({filteredPhotos.length})</h4>
            {filteredPhotos.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '15px',
                padding: '10px'
              }}>
                {filteredPhotos.map(photo => (
                  <div 
                    key={photo.photoId} 
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #ddd',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    {photo.base64Data ? (
                      <img 
                        src={photo.base64Data} 
                        alt={photo.filename}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        height: '120px', 
                        backgroundColor: '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '24px'
                      }}>
                        {photo.source === 'odometer' ? '📏' : '📊'}
                      </div>
                    )}
                    <div style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
                        {photo.reading} {photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        {photo.source === 'odometer' ? 'Odometer' : 'Meter'} • {photo.plantNumber || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                        {new Date(photo.timestamp).toLocaleDateString()}
                      </div>
                      {photo.meterType && (
                        <div style={{ fontSize: '10px', color: '#ff9800', marginTop: '2px', fontWeight: 'bold' }}>
                          {photo.meterType === 'before' ? 'Before' : 'After'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                <h4 style={{ color: '#555' }}>No photos uploaded yet</h4>
                <p>Upload photos to see them here</p>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Storage: {photos.length} photos • {Object.keys(folderStats).length} folders
          </div>
          <button 
            onClick={onClose}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#1b5e20', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Close Gallery
          </button>
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 1002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1b5e20' }}>
                📷 Photo Details
              </h3>
              <button 
                onClick={() => setSelectedPhoto(null)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #ddd'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Reading</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1b5e20' }}>
                    {selectedPhoto.reading || '0'} {selectedPhoto.type === 'kilos' ? 'kilometers' : selectedPhoto.type === 'hours' ? 'hours' : ''}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Type</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
                    {selectedPhoto.source === 'odometer' ? 'Odometer' : 'Meter Reading'}
                    {selectedPhoto.type === 'kilos' ? ' (Kilometers)' : selectedPhoto.type === 'hours' ? ' (Hours)' : ''}
                    {selectedPhoto.meterType ? ` (${selectedPhoto.meterType === 'before' ? 'Before' : 'After'})` : ''}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Plant Number</div>
                  <div style={{ fontSize: '16px', color: '#333', wordBreak: 'break-all' }}>
                    {selectedPhoto.plantNumber || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Upload Date</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {new Date(selectedPhoto.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Folder Path</div>
                <div style={{ 
                  backgroundColor: '#e3f2fd', 
                  padding: '10px', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1565c0',
                  wordBreak: 'break-all'
                }}>
                  📁 {selectedPhoto.folderPath || 'No folder path available'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {selectedPhoto.base64Data ? (
                <img 
                  src={selectedPhoto.base64Data} 
                  alt="Photo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }}
                />
              ) : (
                <div style={{ 
                  height: '300px', 
                  backgroundColor: '#e9ecef',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '18px',
                  marginBottom: '10px'
                }}>
                  📷 No image data available
                </div>
              )}
              <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                Photo ID: {selectedPhoto.photoId}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedPhoto(null)}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#1b5e20', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Signature Pad Component
const SignaturePad = ({ onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [signature, setSignature] = useState(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    setContext(ctx);
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (context) {
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    setSignature(signatureData);
    onSave(signatureData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20' }}>
            ✍️ Draw Your Signature
          </h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Draw your signature in the box below using your mouse or touch screen
          </p>
          
          <div style={{
            border: '2px solid #ddd',
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: '#f8f9fa'
          }}>
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                startDrawing(e.touches[0]);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                draw(e.touches[0]);
              }}
              onTouchEnd={stopDrawing}
              style={{
                border: '1px solid #ccc',
                backgroundColor: 'white',
                cursor: 'crosshair',
                touchAction: 'none'
              }}
            />
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            <span>💡</span> Use mouse or touch to draw your signature
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <button 
              onClick={clearSignature}
              style={{ 
                flex: 1,
                padding: '12px 20px', 
                backgroundColor: '#757575', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🗑️ Clear Signature
            </button>
            
            <button 
              onClick={saveSignature}
              style={{ 
                flex: 1,
                padding: '12px 20px', 
                backgroundColor: '#1b5e20', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              💾 Save Signature
            </button>
          </div>
          
          <button 
            onClick={onClose}
            style={{ 
              width: '100%',
              padding: '12px 20px', 
              backgroundColor: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #ddd',
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginTop: '5px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    plantNumber: '',
    plantName: '',
    plantType: '',
    qrScannedData: null,
    
    odometerKilos: '',
    odometerHours: '',
    odometerKilosPhotoId: null,
    odometerHoursPhotoId: null,
    odometerKilosPhotoName: '',
    odometerHoursPhotoName: '',
    odometerKilosPhotoPath: '',
    odometerHoursPhotoPath: '',
    
    previousMeterReading: '',
    currentMeterReadingBefore: '',
    fuelQuantity: '',
    currentMeterReadingAfter: '',
    
    // NEW: Meter reading photo fields
    currentMeterReadingBeforePhotoId: null,
    currentMeterReadingBeforePhotoName: '',
    currentMeterReadingAfterPhotoId: null,
    currentMeterReadingAfterPhotoName: '',
    
    meterVarianceFlag: false,
    meterVarianceMessage: '',
    readingFlag: 'normal',
    expectedCurrentReading: '',
    
    // Fuel store with category and specific store
    fuelStoreCategory: '',
    selectedFuelStore: '',
    
    transactionType: '',
    contractType: '',
    customSiteNumber: '',
    fuelType: 'Diesel',
    transactionDate: new Date().toISOString().split('T')[0],
    
    attendantName: user?.fullName || '',
    receiverName: '',
    receiverCompany: '',
    employmentNumber: '',
    remarks: '',
    
    // Manual dip fields (NO CALCULATIONS)
    previousDip: '',
    currentDip: '',
    deliveryReceived: '',
    totalIssuedFromDips: '',
    openingReading: '',
    closingReading: '',
    totalIssuedFromReadings: '',
    varianceDips: '',
    varianceReadings: '',
    
    // Acknowledgement with signature
    acknowledgeAccuracy: false,
    signatureImage: null
  });

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showFuelStoreScanner, setShowFuelStoreScanner] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(null);
  const [showMeterReadingModal, setShowMeterReadingModal] = useState(null); // NEW: For meter readings
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [customSites, setCustomSites] = useState([]);
  const [storeReadings, setStoreReadings] = useState({});
  const [isFirstTransaction, setIsFirstTransaction] = useState(true);
  const [activeSection, setActiveSection] = useState('equipment');
  const [currentTransactionId] = useState(Date.now());

  // Fuel stores with categories
  const fuelStores = {
    service_trucks: ['FSH01 - 01 (650 L)', 'FSH02 - 01', 'FSH03 - 01', 'FSH04 - 01'],
    fuel_trailers: ['SLD 02 (1000L)', 'SLD 07 (2000L)', 'SLD 09 (1000L)'],
    underground_tanks: [
      'UDT 49 (Workshop Underground Tank)',
      'UPT 49 (Workshop Petrol Underground Tank)',
      'UDT 890 (Palmiet Underground Tank)',
      'STD 02 (Musina Static Tank)',
      'STD 05 (Musina Static Tank)'
    ]
  };

  const transactionTypes = [
    'Plant Fuel to Contract', 'Plant Fuel Return from Contract', 'Stock Issue to Balance Sheet',
    'Stock Issue to Contracts', 'Stock Issue to Overheads', 'Stock Issue Plant',
    'Stock Receipt from Supplier', 'Stock Return from Balance Sheet', 'Stock Return from Contract',
    'Stock Return from Plant', 'Stock Return from Overheads', 'Stock Return to Supplier', 'Stock Take On'
  ];

  const contractOptions = [
    'AMPLANT 49', 'HILLARY (Site 2163)', 'HILLARY (Site 2102)', 
    'Polokwane Surfacing (Site 1809)', 'Polokwane Surfacing 890', 'Sundries', 'Custom Site'
  ];

// const plantMasterList = {
//     'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD07': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD08': { name: 'ASPHALT PAVER DYNAPAC F161-8W', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD09': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD11': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APN01': { name: 'ASPHALT PAVER NIGATA', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APV10': { name: 'ASPHALT PAVER VOGELE 1800 SPRAY JET', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APP02': { name: 'ASPHALT MIXING PLANT MOBILE 40tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP03': { name: 'ASPHALT MIXING PLANT MOBILE 60tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP04': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP06': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-ASR01': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
//     'A-ASR02': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
//     'A-BBS03': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
//     'A-BBS04': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
//     'A-BDT02': { name: 'BITUMEN TRAILER 1kl', type: 'Bitumen Trailer', fuelType: 'Bitumen', category: 'specialized' },
//     'A-BDT06': { name: 'CRACKSEALING TRAILER', type: 'Cracksealing Trailer', fuelType: 'Diesel', category: 'specialized' },
//     'A-BEP01': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-BEP02': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-BNS08': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BNS09': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BNS10': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC106': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC107': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC108': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BRM11': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM12': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM13': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM14': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BTH100': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH104': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH115': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH116': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH118': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH119': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH122': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH123': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH125': { name: '1.0 TONNE BAKKIE 4X2 DC', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH127': { name: '1.0 TONNE BAKKIE 4X2 HI RISE', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH129': { name: '1.0 TONNE BAKKIE 4X2 HI RISE', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH130': { name: '1.0 TONNE BAKKIE 4X2 HI RISE', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH131': { name: '1.0 TONNE BAKKIE 4X2 HI RISE', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH134': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH135': { name: '1.0 TONNE BAKKIE 4X2 DC', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH80': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH81': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH91': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH92': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH94': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH95': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH96': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH97': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH99': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTL08': { name: 'TOYOTA LANDCRUISER', type: 'SUV', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-CFH04': { name: 'CRUSHER FIXED HATFIELD', type: 'Crusher', fuelType: 'Diesel', category: 'crushing' },
//     'A-CCK05': { name: 'KLEEMANN MOBICONE MCO 9 S EVO CONE', type: 'Cone Crusher', fuelType: 'Diesel', category: 'crushing' },
//     'A-CHR03': { name: 'RM HORIZONTAL IMPACT CRUSHER 100GO', type: 'Impact Crusher', fuelType: 'Diesel', category: 'crushing' },
//     'A-CJK06': { name: 'KLEEMANN MOBICAT MC 110 R EVO JAW', type: 'Jaw Crusher', fuelType: 'Diesel', category: 'crushing' },
//     'A-CSK01': { name: 'KLEEMANN MOBICAT MC 703 EVO SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
//     'A-CSM02': { name: 'METSO ST2.8 SCALPER SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
//     'A-CSC03': { name: 'CHIEFTAIN 600, DOUBLE DECK SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
//     'A-CSE07': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE08': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE09': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE10': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-DOK13': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-DOK15': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-DOK16': { name: 'DOZER KOMATSU D155 40t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-DUT07': { name: 'DUMPER B2000', type: 'Dumper', fuelType: 'Diesel', category: 'hauling' },
//     'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH28': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH35': { name: 'FLAT DECK HINO 5t DOUBLE CAB', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH36': { name: 'FLAT DECK HINO 5t DOUBLE CAB', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDM31': { name: 'FLATBED MAN 26-280 15t CRANE 6t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FLM03': { name: 'MAHAND 3.5TON FORKLIFT', type: 'Forklift', fuelType: 'Diesel', category: 'material_handling' },
//     'A-FLT02': { name: '2.5T FORK LIFT TOYOTA', type: 'Forklift', fuelType: 'Diesel', category: 'material_handling' },
//     'A-FSH01': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FSH02': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FSH03': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FSH04': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FSN05': { name: 'FLAT DECK NISSAN FUEL TANKER 10000L', type: 'Fuel Tanker', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-FSI06': { name: 'FLAT DECK ISUZU FUEL TANKER 4000L', type: 'Fuel Tanker', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-GRC27': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC28': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC30': { name: 'GRADER CAT 140K with Trimble', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC32': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC33': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRK34': { name: 'GRADER KOMATSU GD675-5', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC35': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-HOB11': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-HOB12': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-HOB13': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-HOB14': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-HOB15': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-LLP02': { name: 'POWER PLANT LISTER 55kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-LOC16': { name: 'LOADER CAT 950GC    3,1m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-LOK18': { name: 'LOADER KOMATSU WA250-6    2,3m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-LOK19': { name: 'LOADER KOMATSU WA250-6    2,3m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-LOK20': { name: 'LOADER KOMATSU WA380-6    3m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-LOK21': { name: 'LOADER KOMATSU WA250-6    2,3m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-MCL01': { name: 'MOBILE CRANE 35t LIEBHERR', type: 'Crane', fuelType: 'Diesel', category: 'lifting' },
//     'A-MIB11': { name: 'MIXER BARFORD 330R DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIB14': { name: 'MIXER BRIGGS AND STRATTON 175', type: 'Mixer', fuelType: 'Petrol', category: 'concrete' },
//     'A-MIL01': { name: 'MIXER LISTER 175 DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIL17': { name: 'MIXER LISTER 500R', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIL18': { name: 'MIXER LISTER 500R', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIW03': { name: 'MIXER WINGET 175 DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIW05': { name: 'MIXER WINGET 175TE DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIW12': { name: 'MIXER WINGET 330T DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIW13': { name: 'MIXER WINGET 330T DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MPW03': { name: 'ASPHALT MILL WIRTGEN W100F', type: 'Milling Machine', fuelType: 'Diesel', category: 'paving' },
//     'A-MPW04': { name: 'ASPHALT MILL WIRTGEN W200', type: 'Milling Machine', fuelType: 'Diesel', category: 'paving' },
//     'A-MRB07': { name: 'RECYCLER Bell MPH125', type: 'Recycler', fuelType: 'Diesel', category: 'paving' },
//     'A-MRW04': { name: 'RECYCLER WIRTGEN WR2000', type: 'Recycler', fuelType: 'Diesel', category: 'paving' },
//     'A-MRW05': { name: 'RECYCLER WIRTGEN WR240', type: 'Recycler', fuelType: 'Diesel', category: 'paving' },
//     'A-MRW06': { name: 'RECYCLER WIRTGEN WR240', type: 'Recycler', fuelType: 'Diesel', category: 'paving' },
//     'A-MTM03': { name: 'MAN CONCRETE MIXER 6x4 - 6m3', type: 'Concrete Mixer Truck', fuelType: 'Diesel', category: 'concrete' },
//     'A-MTS04': { name: 'SCANIA CONCRETE MIXER 6x4 - 6m3', type: 'Concrete Mixer Truck', fuelType: 'Diesel', category: 'concrete' },
//     'A-MTB06': { name: 'M/B REIMER CONCRETE MIXER 8x4 - 8m3', type: 'Concrete Mixer Truck', fuelType: 'Diesel', category: 'concrete' },
//     'A-MTB06-1': { name: 'REIMER CONCRETE MIXER DONKEY ENGINE', type: 'Concrete Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-RPA16': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPA17': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPA18': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPA21': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPA22': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPC19': { name: 'PNEUMATIC CAT CW34', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPC20': { name: 'PNEUMATIC CAT CW34', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD10': { name: 'PNEUMATIC DYNAPAC 20t CP221', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD11': { name: 'PNEUMATIC DYNAPAC 20t CP221', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD12': { name: 'PNEUMATIC DYNAPAC 27t CP271', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD14': { name: 'PNEUMATIC DYNAPAC 27t CP271', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD15': { name: 'PNEUMATIC DYNAPAC 24t CP224', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPH13': { name: 'PNEUMATIC HAMM 20t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RSD05': { name: 'STATIC DYNAPAC 3-Point 12t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RSD06': { name: 'STATIC DYNAPAC 3-Point 12t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RSD07': { name: 'STATIC DYNAPAC 3-Point 12t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTA10': { name: 'VIBRATING TANDEM AMMANN 9t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH11': { name: 'VIBRATING TANDEM HAMM 4t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH13': { name: 'VIBRATING TANDEM HAMM 2,5t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH14': { name: 'VIBRATING TANDEM HAMM 9t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH15': { name: 'VIBRATING TANDEM HAMM 2,7t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH16': { name: 'VIBRATING TANDEM HAMM 2,7t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA25': { name: 'VIBRATING AMMANN ASC 100 10t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA26': { name: 'VIBRATING AMMANN ACE PRO ASC 110 12t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA28': { name: 'VIBRATING AMMANN ASC 170 17t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA30': { name: 'VIBRATING AMMANN ASC 200 19t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA31': { name: 'VIBRATING AMMANN ASC 200 19t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA33': { name: 'VIBRATING AMMANN ACE 100 10t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA34': { name: 'VIBRATING AMMANN ACE 100 10t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVD19': { name: 'VIBRATING DYNAPAC CA512-D 17t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVD22': { name: 'VIBRATING DYNAPAC CA602 19t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVH29': { name: 'VIBRATING HAMM 3510 10t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVH32': { name: 'VIBRATING HAMM 3520 20t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLTD08': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS(WATER)', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD09': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD10': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD11': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD12': { name: 'GRW 29KL DRAWBAR TRAILERS', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD13': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS(WATER)', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW01': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW03': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW04': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW05': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW06': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW08': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW09': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SMB11': { name: 'SLURRY MIXER BENZ 3340', type: 'Slurry Mixer', fuelType: 'Diesel', category: 'paving' },
//     'A-SMB11-1': { name: 'SLURRY MIXER BENZ 3340 DONKEY ENGINE', type: 'Slurry Mixer', fuelType: 'Diesel', category: 'paving' },
//     'A-SMR12': { name: 'MOBILE RADIO TRAILERS', type: 'Radio Trailer', fuelType: 'None', category: 'support' },
//     'A-SPW01': { name: 'PRESSURE WASHER TRAILER', type: 'Pressure Washer', fuelType: 'Diesel', category: 'cleaning' },
//     'A-SPW02': { name: 'PRESSURE WASHER TRAILER', type: 'Pressure Washer', fuelType: 'Diesel', category: 'cleaning' },
//     'A-SPW03': { name: 'PRESSURE WASHER TRAILER', type: 'Pressure Washer', fuelType: 'Diesel', category: 'cleaning' },
//     'A-SPW04': { name: 'PRESSURE WASHER TRAILER', type: 'Pressure Washer', fuelType: 'Diesel', category: 'cleaning' },
//     'A-SSP03': { name: 'SEMI TRAILER MOBILE WORKSHOP', type: 'Mobile Workshop', fuelType: 'None', category: 'support' },
//     'A-STH14': { name: 'HINO SERVICE TRUCKS', type: 'Service Truck', fuelType: 'Diesel', category: 'support' },
//     'A-STL23': { name: 'GENERATOR TRAILER', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'A-STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'A-STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'A-STT10': { name: 'HINO SERVICE TRUCKS', type: 'Service Truck', fuelType: 'Diesel', category: 'support' },
//     'A-TAD01': { name: 'DOOSAN DA30 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAD02': { name: 'DOOSAN DA30 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAD03': { name: 'DOOSAN DA30 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC04': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC05': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC06': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS10': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS11': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS12': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS13': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS14': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS15': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS16': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS17': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS18': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS19': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS20': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS21': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS22': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS23': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS24': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS25': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS26': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS27': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS28': { name: 'SCANIA 8x4 15m3 Tipper Only', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS29': { name: 'SCANIA 8x4 15m3 Tipper Only', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS07': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS08': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS09': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIB69': { name: 'BENZ 33-35 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIB70': { name: 'BENZ 33-35 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS47': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS48': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS49': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS50': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS51': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS52': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS68': { name: 'SCANIA P360 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS71': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS72': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS74': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TLJ29': { name: 'TLB JCB 3CX 4X4 6.4t', type: 'TLB', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-TLJ31': { name: 'TLB JCB 3CX 4X4 6.4t', type: 'TLB', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-TLM01': { name: 'MANITOU MT932', type: 'Telehandler', fuelType: 'Diesel', category: 'material_handling' },
//     'A-TSF31': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSF32': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSF33': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSV45': { name: 'VW 17-250 4x2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSV46': { name: 'VW 17-250 4x2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-WTB36': { name: 'WATER TANKER MERC 2628', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM21': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM23': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM27': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM30': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM32': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM33': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM34': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM35': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM38': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTS37': { name: 'WATER TANKER 30KL  SCANIA P410 8X4', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBP01': { name: 'BITUMEN PUMP', type: 'Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP02': { name: 'BITUMEN PUMP 2"', type: 'Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP03': { name: 'BITUMEN PUMP 2"', type: 'Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP05': { name: 'BITUMEN PUMP 2"', type: 'Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZCFD01': { name: 'CARRIER FRAME DIESEL TANK 5000L', type: 'Fuel Tank', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-ZCH07': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCH08': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCH09': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCJ01': { name: 'CONVEYOR TRAILER', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },
//     'A-ZCJ02': { name: 'CONVEYOR TRAILER', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },
//     'A-ZCT03': { name: 'CONVEYOR BELT', type: 'Conveyor', fuelType: 'Electric', category: 'material_handling' },
//     'A-ZCT04': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCT05': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCT06': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCV07': { name: 'CONCRETE SAW HONDA', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFF01': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
//     'A-ZFF02': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
//     'A-ZFF03': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
//     'A-ZFH01': { name: 'FLOOR GRINDER', type: 'Floor Grinder', fuelType: 'Electric', category: 'concrete' },
//     'A-ZFH02': { name: 'FLOOR GRINDER', type: 'Floor Grinder', fuelType: 'Electric', category: 'concrete' },
//     'A-ZFR01': { name: 'POWER FLOAT', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR02': { name: 'POWER FLOAT BRIGGS & STRATTON', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR03': { name: 'POWER FLOAT ROBIN', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR04': { name: 'POWER FLOAT ROBIN', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZGB10': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB12': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB14': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB15': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB25': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB28': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB30': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB64': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGC17': { name: 'GENSET 100kVA CATERPILLAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD57': { name: 'GENSET DUETZ 100kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD59': { name: 'GENSET DUETZ 30kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD60': { name: 'GENSET DUETZ 30kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGE41': { name: 'GENSET ELEGEN', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGH20': { name: 'GENERATOR HONDA GX160', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH22': { name: 'GENSET HONDA SPOT LIGHT TRAILER', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH27': { name: 'GENERATOR HONDA 2.2KVA GX160', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH31': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH33': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH37': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH45': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH48': { name: 'GENERATOR 10KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGH69': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH70': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGK01': { name: 'GENERATOR 8KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGP47': { name: 'GEN KING 60kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGR04': { name: 'GENSET ROBIN CORE DRILL', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR05': { name: 'GENSET ROBIN CORE DRILL', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR59': { name: 'GENSET ROBIN', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR60': { name: 'GENSET ROBIN', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR61': { name: 'GENERATOR 8KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS49': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS50': { name: 'GENSET SKY-GO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS52': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS53': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS58': { name: 'GENSET 400kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGU33': { name: 'GENERATOR UNIPOWER 5500-52 5.5', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGV06': { name: 'GENSET VOLVO 60kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGV15': { name: 'GENSET 200kVA VOLVO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGV32': { name: 'GENSET 400kVA VOLVO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGY23': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGY64': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGY65': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZHBS01': { name: 'HAND HELD BROOM STIHL', type: 'Broom', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZHBS02': { name: 'HAND HELD BROOM STIHL', type: 'Broom', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZJB07': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZJB09': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZJB10': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZJB11': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZJH12': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZLC01': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'lab' },
//     'A-ZLC02': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'lab' },
//     'A-ZLC03': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'lab' },
//     'A-ZLC04': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'lab' },
//     'A-ZLH01': { name: 'TOWER LIGHT HONDA HOME BUILT', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLG02': { name: 'TOWER LIGHT GENERAC VTEVO', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLG03': { name: 'TOWER LIGHT GENERAC VTEVO', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLY04': { name: 'TOWER LIGHT YANMAR HOME BUILD', type: 'Tower Light', fuelType: 'Diesel', category: 'lighting' },
//     'A-ZLY05': { name: 'TOWER LIGHT YANMAR HOME BUILD', type: 'Tower Light', fuelType: 'Diesel', category: 'lighting' },
//     'A-ZPB40': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB43': { name: 'WATER PUMP 4" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB49': { name: 'WATER PUMP 2" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB51': { name: 'WATER PUMP 2" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB72': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB73': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB80': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPCB01': { name: 'PLATE COMPACTOR', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH02': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH03': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH04': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH05': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPD01': { name: 'POKER DIASTAR KS20', type: 'Poker Vibrator', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZPF01': { name: 'WATER PUMP 6" FORD', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF02': { name: 'WATER PUMP VARIABLE FIAT', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF03': { name: 'WATER PUMP 3 INCH PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF04': { name: 'WATER PUMP 4" FIAT', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPH35': { name: 'WATER PUMP 3" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH45': { name: 'WATER PUMP 4" HOFFMANN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH47': { name: 'WATER PUMP 4" HOFFMANN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH52': { name: 'WATER PUMP 3 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH61': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH74': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH75': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH76': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH77': { name: 'WATER PUMP 2 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH81': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH82': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH83': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH86': { name: 'WATER PUMP 2 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH87': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH88': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH89': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH90': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPK63': { name: 'WATER PUMP 4" Electrical', type: 'Water Pump', fuelType: 'Electric', category: 'pumping' },
//     'A-ZPL28': { name: 'WATER PUMP 3" LAUNTOP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPL3': { name: 'WATER PUMP DRIVE UNIT LISTER DIESEL', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPL62': { name: 'WATER PUMP 3 INCH LAUNTOP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPP01': { name: 'WATER PUMP 3" PETTER', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP03': { name: 'WATER PUMP 3" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP04': { name: 'WATER PUMP 3" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP59': { name: 'WATER PUMP 6" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPR60': { name: 'WATER PUMP 4" ROBIN SLUDGE', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPWH06': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH07': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH08': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH74': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPY53': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPY84': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPY85': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZRB21': { name: 'WALK-BEHIND ROLL BOMAG BW65', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB23': { name: 'WALK-BEHIND ROLL BOMAG BW65', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB25': { name: 'WALK-BEHIND ROLL BOMAG BW65H', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB38': { name: 'WALK-BEHIND ROLL BOMAG BW65H', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB39': { name: 'WALK-BEHIND ROLL BOMAG BW61', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB40': { name: 'WALK-BEHIND ROLL BOMAG BW61', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRH52': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRH53': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM43': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM44': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM45': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM46': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM47': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRS01': { name: 'PAINT STRIPPER', type: 'Paint Stripper', fuelType: 'Electric', category: 'maintenance' },
//     'A-ZRW31': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW33': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW36': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW54': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW55': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW56': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW57': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW58': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW59': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW60': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW61': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW62': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW63': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRY38': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRY48': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRY49': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRH50': { name: 'RAMMER HOFFMANN', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRH51': { name: 'RAMMER HOFFMANN', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZSF01': { name: 'SUBMERSIBLE PUMP', type: 'Submersible Pump', fuelType: 'Electric', category: 'pumping' },
//     'A-ZTS05': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS06': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS07': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS08': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS09': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS10': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS12': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS13': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS14': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS15': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS16': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS17': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS18': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS19': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS20': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS21': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS22': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZVB05': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB10': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB15': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB16': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB19': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB21': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB36': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVD12': { name: 'DRIVE UNIT DEK', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH23': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH27': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH32': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH38': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH39': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR22': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR31': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR33': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR43': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR44': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVY40': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY41': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY42': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY62': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVW35': { name: 'DRIVE UNIT WACKER', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZWH21': { name: 'GENSET WELDER HONDA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
//     'A-ZWH24': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH25': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH32': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH42': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH43': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH44': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH45': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH46': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH56': { name: 'GENSET WELDER HONDA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
//     'A-ZWY01': { name: 'GENSET WELDER YAMAHA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
// };

  // Function to handle fuel store QR scanning
  // Smart Fuel Store Scanner Handler
const handleFuelStoreQRScan = (scannedData) => {
  console.log('Scanned fuel store data:', scannedData);
  
  let storeName = '';
  let category = '';
  
  if (typeof scannedData === 'string') {
    try {
      // Try to parse as JSON
      const parsedData = JSON.parse(scannedData);
      storeName = parsedData.store || scannedData;
      
      // Try to determine category from JSON
      if (parsedData.category) {
        category = parsedData.category;
      } else if (parsedData.store) {
        // Try to determine category from store name
        if (parsedData.store.includes('FSH') || parsedData.store.includes('Bakkie') || parsedData.store.includes('Service')) {
          category = 'service_trucks';
        } else if (parsedData.store.includes('SLD') || parsedData.store.includes('Trailer')) {
          category = 'fuel_trailers';
        } else if (parsedData.store.includes('UDT') || parsedData.store.includes('UPT') || 
                   parsedData.store.includes('STD') || parsedData.store.includes('Underground') || 
                   parsedData.store.includes('Static')) {
          category = 'underground_tanks';
        } else {
          category = 'service_trucks'; // Default
        }
      }
    } catch (error) {
      // Not JSON, use as-is
      storeName = scannedData;
      
      // Smart category detection based on scanned text
      const scannedText = scannedData.toLowerCase();
      
      if (scannedText.includes('fsh') || scannedText.includes('bakkie') || 
          scannedText.includes('service') || scannedText.includes('truck')) {
        category = 'service_trucks';
      } else if (scannedText.includes('sld') || scannedText.includes('trailer')) {
        category = 'fuel_trailers';
      } else if (scannedText.includes('udt') || scannedText.includes('upt') || 
                 scannedText.includes('std') || scannedText.includes('underground') || 
                 scannedText.includes('static') || scannedText.includes('tank')) {
        category = 'underground_tanks';
      } else {
        // Search in all stores
        const allStores = Object.values(fuelStores).flat();
        const matchedStore = allStores.find(store => 
          store.toLowerCase().includes(scannedText) || 
          scannedText.includes(store.toLowerCase().split(' ')[0])
        );
        
        if (matchedStore) {
          storeName = matchedStore;
          // Find category
          category = Object.keys(fuelStores).find(cat => 
            fuelStores[cat].includes(matchedStore)
          ) || 'service_trucks';
        } else {
          // No match found, set defaults
          category = 'service_trucks';
        }
      }
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      fuelStoreCategory: category,
      selectedFuelStore: storeName || scannedData
    }));
    
    // Also update the store reading if available
    if (storeName) {
      const lastStoreReading = getLastStoreReading(storeName);
      if (lastStoreReading) {
        setFormData(prev => ({
          ...prev,
          previousDip: lastStoreReading
        }));
      }
    }
  }
  
  setShowFuelStoreScanner(false);
  window.alert(`Fuel store scanned: ${storeName || scannedData}\nCategory: ${category}`);
};

  const getLastMeterReading = (plantNumber) => {
    if (!plantNumber) return null;
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    const plantTransactions = savedTransactions.filter(t => t.plantNumber === plantNumber);
    if (plantTransactions.length === 0) return null;
    const lastTransaction = plantTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    return lastTransaction ? parseFloat(lastTransaction.currentMeterReadingAfter) : null;
  };

  const getLastStoreReading = (storeName) => {
    if (!storeName) return null;
    const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
    return savedStoreReadings[storeName] || null;
  };

  const checkIfFirstTransaction = (plantNumber) => {
    if (!plantNumber) return true;
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    return savedTransactions.filter(t => t.plantNumber === plantNumber).length === 0;
  };

  const validateMeterReadings = (newData) => {
    const prev = parseFloat(newData.previousMeterReading) || 0;
    const currentBefore = parseFloat(newData.currentMeterReadingBefore) || 0;
    const fuelQty = parseFloat(newData.fuelQuantity) || 0;
    
    let varianceFlag = false;
    let varianceMessage = '';
    let readingFlag = 'normal';
    const expectedCurrent = prev;

    if (currentBefore && prev) {
      const variance = Math.abs(currentBefore - expectedCurrent);
      const variancePercentage = (variance / (prev || 1)) * 100;
      
      if (variance > 0) {
        varianceFlag = true;
        if (variancePercentage > 10) {
          readingFlag = 'critical';
          varianceMessage = `CRITICAL: Variance ${variancePercentage.toFixed(1)}%`;
        } else if (variancePercentage > 5) {
          readingFlag = 'warning';
          varianceMessage = `WARNING: Variance ${variancePercentage.toFixed(1)}%`;
        } else {
          readingFlag = 'minor';
          varianceMessage = `NOTE: Variance ${variancePercentage.toFixed(1)}%`;
        }
      }
    }

    // Manual entry for currentAfter
    if (currentBefore && fuelQty) {
      const currentAfter = currentBefore + fuelQty;
      // Don't auto-fill, just validate
      if (!newData.currentMeterReadingAfter) {
        newData.currentMeterReadingAfter = currentAfter.toFixed(2);
      }
    }

    return {
      ...newData,
      meterVarianceFlag: varianceFlag,
      meterVarianceMessage: varianceMessage,
      readingFlag: readingFlag,
      expectedCurrentReading: expectedCurrent
    };
  };

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Remove the automatic calculation for manual fields
      // Keep only for the meter readings (equipment fuel)
      if (name.includes('MeterReading') || name === 'fuelQuantity') {
        return validateMeterReadings(newData);
      }

      if (name === 'fuelStoreCategory') {
        newData.selectedFuelStore = '';
      }

      if (name === 'selectedFuelStore' && value) {
        const lastStoreReading = getLastStoreReading(value);
        if (lastStoreReading) {
          newData.previousDip = lastStoreReading;
        }
      }

      return newData;
    });
  };

  const handleQRScan = (scannedData) => {
    let plantNumber = '';
    let plantInfo = null;

    if (typeof scannedData === 'string') {
      try {
        const parsedData = JSON.parse(scannedData);
        plantNumber = parsedData.plantNumber;
        if (plantNumber) {
          const masterPlant = plantMasterList[plantNumber];
          plantInfo = masterPlant || {
            name: parsedData.plantName || plantNumber,
            type: parsedData.plantType || 'Equipment',
            fuelType: parsedData.fuelType || 'Diesel',
            category: parsedData.category || 'general'
          };
        }
      } catch (error) {
        plantNumber = scannedData;
        const masterPlant = plantMasterList[plantNumber];
        plantInfo = masterPlant || {
          name: plantNumber, type: 'Unknown Equipment', fuelType: 'Diesel', category: 'general'
        };
      }
    }

    const lastMeterReading = getLastMeterReading(plantNumber);
    const firstTransaction = checkIfFirstTransaction(plantNumber);
    setIsFirstTransaction(firstTransaction);

    setFormData(prev => ({
      ...prev,
      plantNumber: plantNumber,
      plantName: plantInfo.name,
      plantType: plantInfo.type,
      fuelType: plantInfo.fuelType,
      previousMeterReading: lastMeterReading ? lastMeterReading.toString() : '0',
      currentMeterReadingBefore: !firstTransaction && lastMeterReading ? lastMeterReading.toString() : '',
    }));

    setShowQRScanner(false);
    setActiveSection('fuel');
  };

  const handleOdometerUpload = (result) => {
    const { type, value, photoData } = result;
    
    if (type === 'kilos') {
      setFormData(prev => ({
        ...prev,
        odometerKilos: value,
        odometerKilosPhotoId: photoData?.photoId || null,
        odometerKilosPhotoName: photoData?.filename || '',
        odometerKilosPhotoPath: photoData?.folderPath || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        odometerHours: value,
        odometerHoursPhotoId: photoData?.photoId || null,
        odometerHoursPhotoName: photoData?.filename || '',
        odometerHoursPhotoPath: photoData?.folderPath || ''
      }));
    }
  };

  // NEW: Handle Meter Reading Photo Upload
  const handleMeterReadingUpload = (result) => {
    const { meterType, value, photoData } = result;
    
    if (meterType === 'before') {
      setFormData(prev => ({
        ...prev,
        currentMeterReadingBefore: value,
        currentMeterReadingBeforePhotoId: photoData?.photoId || null,
        currentMeterReadingBeforePhotoName: photoData?.filename || '',
      }));
    } else if (meterType === 'after') {
      setFormData(prev => ({
        ...prev,
        currentMeterReadingAfter: value,
        currentMeterReadingAfterPhotoId: photoData?.photoId || null,
        currentMeterReadingAfterPhotoName: photoData?.filename || '',
      }));
    }
  };

  const handleSignatureSave = (signatureImage) => {
    setFormData(prev => ({
      ...prev,
      signatureImage: signatureImage
    }));
    setShowSignaturePad(false);
  };

  const handleAddCustomSite = () => {
    if (formData.customSiteNumber && !customSites.includes(formData.customSiteNumber)) {
      setCustomSites(prev => [...prev, formData.customSiteNumber]);
      setFormData(prev => ({
        ...prev,
        contractType: formData.customSiteNumber,
        customSiteNumber: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedDate = new Date(formData.transactionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      window.alert('Cannot select previous dates. Please select today or a future date.');
      return;
    }

    if (!formData.currentMeterReadingBefore || !formData.fuelQuantity) {
      window.alert('Please enter both current reading before and fuel quantity.');
      return;
    }

    if (!formData.fuelStoreCategory || !formData.selectedFuelStore) {
      window.alert('Please select fuel store category and specific store.');
      return;
    }

    // Add acknowledgement validation
    if (!formData.acknowledgeAccuracy) {
      window.alert('Please confirm that all readings and information provided are accurate.');
      return;
    }
    
    if (!formData.signatureImage) {
      window.alert('Please provide your signature by drawing it in the signature pad.');
      return;
    }

    if (formData.readingFlag === 'critical') {
      const proceed = window.confirm(
        `CRITICAL METER READING FLAG:\n${formData.meterVarianceMessage}\n\nAre you absolutely sure you want to proceed?`
      );
      if (!proceed) return;
    }

    const currentAfter = parseFloat(formData.currentMeterReadingAfter) || 0;
    const transaction = {
      id: currentTransactionId,
      timestamp: new Date().toISOString(),
      ...formData,
      closingReading: currentAfter.toString(),
      attendantName: user.fullName,
      userId: user.id,
      userRole: user.role,
      userStation: user.station || 'Main Station',
      isFirstTransaction: isFirstTransaction,
      meterReadingFlag: formData.readingFlag,
      source: 'clerk_attendant',
      odometerPhotos: {
        kilos: {
          value: formData.odometerKilos,
          photoId: formData.odometerKilosPhotoId,
          photoName: formData.odometerKilosPhotoName,
          photoPath: formData.odometerKilosPhotoPath
        },
        hours: {
          value: formData.odometerHours,
          photoId: formData.odometerHoursPhotoId,
          photoName: formData.odometerHoursPhotoName,
          photoPath: formData.odometerHoursPhotoPath
        }
      },
      // NEW: Add meter reading photos to transaction
      meterReadingPhotos: {
        before: {
          value: formData.currentMeterReadingBefore,
          photoId: formData.currentMeterReadingBeforePhotoId,
          photoName: formData.currentMeterReadingBeforePhotoName,
        },
        after: {
          value: formData.currentMeterReadingAfter,
          photoId: formData.currentMeterReadingAfterPhotoId,
          photoName: formData.currentMeterReadingAfterPhotoName,
        }
      },
      // Add acknowledgement data
      acknowledgeAccuracy: formData.acknowledgeAccuracy,
      signatureImage: formData.signatureImage,
      signatureTimestamp: new Date().toISOString()
    };

    setTransactions(prev => [transaction, ...prev]);
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    savedTransactions.unshift(transaction);
    localStorage.setItem('fuelTransactions', JSON.stringify(savedTransactions));

    if (formData.selectedFuelStore && formData.fuelQuantity) {
      const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
      const currentReading = parseFloat(savedStoreReadings[formData.selectedFuelStore] || '0');
      const newReading = currentReading - parseFloat(formData.fuelQuantity);
      const updatedReadings = {
        ...savedStoreReadings,
        [formData.selectedFuelStore]: Math.max(0, newReading).toString()
      };
      localStorage.setItem('storeReadings', JSON.stringify(updatedReadings));
      setStoreReadings(updatedReadings);
    }

    setFormData(prev => ({
      ...prev,
      plantNumber: '', plantName: '', plantType: '', qrScannedData: null,
      odometerKilos: '', odometerHours: '',
      odometerKilosPhotoId: null, odometerHoursPhotoId: null,
      odometerKilosPhotoName: '', odometerHoursPhotoName: '',
      odometerKilosPhotoPath: '', odometerHoursPhotoPath: '',
      previousMeterReading: currentAfter.toString(),
      currentMeterReadingBefore: '', fuelQuantity: '', currentMeterReadingAfter: '',
      // NEW: Reset meter reading photo fields
      currentMeterReadingBeforePhotoId: null,
      currentMeterReadingBeforePhotoName: '',
      currentMeterReadingAfterPhotoId: null,
      currentMeterReadingAfterPhotoName: '',
      meterVarianceFlag: false, meterVarianceMessage: '', readingFlag: 'normal', expectedCurrentReading: '',
      fuelStoreCategory: '', selectedFuelStore: '',
      contractType: '', customSiteNumber: '', transactionType: '',
      receiverName: '', receiverCompany: '', employmentNumber: '', remarks: '',
      closingReading: currentAfter.toString(),
      previousDip: '', currentDip: '', deliveryReceived: '',
      openingReading: '', totalIssuedFromDips: '',
      closingReading: '', totalIssuedFromReadings: '',
      varianceDips: '', varianceReadings: '',
      // Reset acknowledgement fields
      acknowledgeAccuracy: false,
      signatureImage: null
    }));

    setIsFirstTransaction(false);
    setActiveSection('equipment');
    window.alert('Transaction recorded successfully!');
  };

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    setTransactions(savedTransactions);
    const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
    setStoreReadings(savedStoreReadings);
  }, []);

  const downloadTransactionsExcel = () => {
    if (transactions.length === 0) {
      window.alert('No transactions to download.');
      return;
    }

    try {
      const excelData = transactions.map(transaction => ({
        'Transaction ID': transaction.id, 'Date': transaction.transactionDate,
        'Plant Number': transaction.plantNumber, 'Plant Name': transaction.plantName || '',
        'Fuel Store Category': transaction.fuelStoreCategory,
        'Fuel Store': transaction.selectedFuelStore,
        'Previous Reading': transaction.previousMeterReading,
        'Current Reading Before': transaction.currentMeterReadingBefore, 
        'Fuel Quantity (L)': transaction.fuelQuantity,
        'Current Reading After': transaction.currentMeterReadingAfter, 
        'Closing Reading': transaction.closingReading,
        'Meter Reading Flag': transaction.meterReadingFlag || 'normal', 
        'Odometer (KM)': transaction.odometerKilos,
        'Odometer KM Photo': transaction.odometerPhotos?.kilos?.photoName || 'No photo',
        'Hours': transaction.odometerHours,
        'Hours Photo': transaction.odometerPhotos?.hours?.photoName || 'No photo',
        'Meter Reading Before Photo': transaction.meterReadingPhotos?.before?.photoName || 'No photo',
        'Meter Reading After Photo': transaction.meterReadingPhotos?.after?.photoName || 'No photo',
        'Transaction Type': transaction.transactionType,
        'Contract/Site': transaction.contractType, 
        'Fuel Type': transaction.fuelType,
        'Receiver Name': transaction.receiverName, 
        'Receiver Company': transaction.receiverCompany,
        'Employment Number': transaction.employmentNumber, 
        'Attendant': transaction.attendantName,
        'Remarks': transaction.remarks || '', 
        'First Transaction': transaction.isFirstTransaction ? 'Yes' : 'No',
        'Acknowledgement': transaction.acknowledgeAccuracy ? 'Confirmed' : 'Not Confirmed',
        'Signature': transaction.signatureImage ? 'Provided' : 'Not Provided',
        'Previous Dip': transaction.previousDip || '',
        'Current Dip': transaction.currentDip || '',
        'Delivery Received': transaction.deliveryReceived || '',
        'Total Issued from Dips': transaction.totalIssuedFromDips || '',
        'Opening Reading': transaction.openingReading || '',
        'Closing Reading': transaction.closingReading || '',
        'Total Issued from Readings': transaction.totalIssuedFromReadings || '',
        'Variance Dips': transaction.varianceDips || '',
        'Variance Readings': transaction.varianceReadings || ''
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fuel Transactions');
      XLSX.writeFile(wb, `fuel-transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      window.alert('Excel download failed. Please try again.');
    }
  };

  const getUserInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['#1b5e20', '#1976d2', '#d32f2f', '#7b1fa2', '#ff9800', '#0097a7', '#388e3c', '#5d4037'];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Updated navigation items with Photo Gallery in side nav
  const navigationItems = [
    { id: 'equipment', label: 'Equipment', icon: '🚜' },
    { id: 'fuel', label: 'Fuel Details', icon: '⛽' },
    { id: 'stock', label: 'Stock Management', icon: '📊' },
    { id: 'transaction', label: 'Transaction', icon: '📝' },
    { id: 'photos', label: 'Photo Gallery', icon: '📁' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'white' }}>
            <img src="/fuel2.jpg" alt="FMS Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#1b5e20', fontSize: '20px', fontWeight: '600' }}>Fuel Management System</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Clerk/Attendant Dashboard</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', backgroundColor: '#f8f9fa', borderRadius: '25px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: getAvatarColor(user?.fullName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
              {getUserInitials(user?.fullName)}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{user?.fullName || 'User'}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Clerk/Attendant'}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ padding: '10px 20px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 350px', gap: '20px' }}>
        
        {/* Navigation Sidebar - Updated with Photo Gallery */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: '20px', textAlign: 'center' }}>Navigation</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'photos') {
                    setShowPhotoGallery(true);
                  } else {
                    setActiveSection(item.id);
                  }
                }}
                style={{
                  padding: '12px 15px',
                  backgroundColor: activeSection === item.id ? '#1b5e20' : '#f8f9fa',
                  color: activeSection === item.id ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Form Content */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* Show photo gallery when photos section is active */}
          {activeSection === 'photos' ? (
            <div>
              <h2 style={{ color: '#1b5e20', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📁 Photo Gallery
              </h2>
              <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                  Click the button below to view all uploaded photos including odometer and meter readings
                </p>
                <button 
                  onClick={() => setShowPhotoGallery(true)}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#1976d2', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  📁 Open Photo Gallery
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 style={{ color: '#1b5e20', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {navigationItems.find(item => item.id === activeSection)?.icon}
                {navigationItems.find(item => item.id === activeSection)?.label}
              </h2>
              
              <form onSubmit={handleSubmit}>
                {/* Equipment Section */}
                {activeSection === 'equipment' && (
                  <div>
                    {formData.plantNumber && (
                      <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #4caf50' }}>
                        <h4 style={{ color: '#1b5e20', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>✅</span> Scanned Plant Information
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                          <div><strong>Fleet Number:</strong> {formData.plantNumber}</div>
                          <div><strong>Type:</strong> {formData.plantType}</div>
                          <div><strong>Description:</strong> {formData.plantName}</div>
                          <div><strong>Fuel Type:</strong> {formData.fuelType}</div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Plant Number (QR Scan):</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="text"
                            name="plantNumber"
                            value={formData.plantNumber}
                            onChange={handleInputChange}
                            placeholder="Scan plant QR code"
                            style={{ flex: 1, padding: '10px', border: formData.plantNumber ? '2px solid #4caf50' : '1px solid #ddd', borderRadius: '4px' }}
                            required
                          />
                          <button type="button" onClick={() => setShowQRScanner(true)} style={{ padding: '10px 15px', backgroundColor: '#1b5e20', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            📱 Scan Plant
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Odometer Section */}
                      <div>
                        <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Odometer Readings with Photo Capture</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                              Odometer Kilometers:
                              {formData.odometerKilosPhotoName && (
                                <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px' }}>📷 Photo Added</span>
                              )}
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input 
                                type="number" 
                                name="odometerKilos"
                                value={formData.odometerKilos} 
                                onChange={handleInputChange}
                                step="0.1" 
                                placeholder="Enter KM"
                                style={{ 
                                  flex: 1, 
                                  padding: '10px', 
                                  border: formData.odometerKilosPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                                  borderRadius: '4px'
                                }} 
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowOdometerModal('kilos')}
                                style={{ 
                                  padding: '10px 15px', 
                                  backgroundColor: formData.odometerKilosPhotoName ? '#4caf50' : '#1976d2', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '4px', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                {formData.odometerKilosPhotoName ? '📷' : '📸'} 
                                {formData.odometerKilosPhotoName ? 'Change' : 'Add Photo'}
                              </button>
                            </div>
                            {formData.odometerKilosPhotoName && (
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                Photo: {formData.odometerKilosPhotoName}
                              </div>
                            )}
                          </div>

                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                              Odometer Hours:
                              {formData.odometerHoursPhotoName && (
                                <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px' }}>📷 Photo Added</span>
                              )}
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input 
                                type="number" 
                                name="odometerHours"
                                value={formData.odometerHours} 
                                onChange={handleInputChange}
                                step="0.1" 
                                placeholder="Enter hours"
                                style={{ 
                                  flex: 1, 
                                  padding: '10px', 
                                  border: formData.odometerHoursPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                                  borderRadius: '4px'
                                }} 
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowOdometerModal('hours')}
                                style={{ 
                                  padding: '10px 15px', 
                                  backgroundColor: formData.odometerHoursPhotoName ? '#4caf50' : '#1976d2', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '4px', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                {formData.odometerHoursPhotoName ? '📷' : '📸'} 
                                {formData.odometerHoursPhotoName ? 'Change' : 'Add Photo'}
                              </button>
                            </div>
                            {formData.odometerHoursPhotoName && (
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                Photo: {formData.odometerHoursPhotoName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fuel Details Section */}
                {activeSection === 'fuel' && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Fuel Store Selection with Category */}
                  <div>
                    <h4 style={{ color: '#1b5e20', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      ⛽ Fuel Store Selection
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fuel Store Category:</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select 
                            name="fuelStoreCategory" 
                            value={formData.fuelStoreCategory} 
                            onChange={handleInputChange} 
                            style={{ 
                              flex: 1, 
                              padding: '10px', 
                              border: formData.fuelStoreCategory ? '2px solid #4caf50' : '1px solid #ddd', 
                              borderRadius: '4px' 
                            }} 
                            required
                          >
                            <option value="">Select Category</option>
                            <option value="service_trucks">Service Trucks</option>
                            <option value="fuel_trailers">Fuel Trailers</option>
                            <option value="underground_tanks">Static Tanks</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Specific Store:</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select 
                            name="selectedFuelStore" 
                            value={formData.selectedFuelStore} 
                            onChange={handleInputChange} 
                            disabled={!formData.fuelStoreCategory} 
                            style={{ 
                              flex: 1, 
                              padding: '10px', 
                              border: formData.selectedFuelStore ? '2px solid #4caf50' : '1px solid #ddd', 
                              borderRadius: '4px' 
                            }} 
                            required
                          >
                            <option value="">Select Store</option>
                            {formData.fuelStoreCategory && fuelStores[formData.fuelStoreCategory]?.map(store => (
                              <option key={store} value={store}>{store}</option>
                            ))}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => setShowFuelStoreScanner(true)}
                            style={{ 
                              padding: '10px 15px', 
                              backgroundColor: formData.selectedFuelStore ? '#4caf50' : '#1b5e20', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            📱 Scan Store
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Store Information Display */}
                    {formData.selectedFuelStore && (
                      <div style={{ 
                        backgroundColor: '#e8f5e8', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        border: '2px solid #4caf50',
                        marginBottom: '15px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h5 style={{ margin: '0 0 5px 0', color: '#1b5e20' }}>Selected Store Information</h5>
                            <div style={{ fontSize: '14px', color: '#555' }}>
                              <div><strong>Store:</strong> {formData.selectedFuelStore}</div>
                              <div><strong>Category:</strong> {formData.fuelStoreCategory}</div>
                              {storeReadings[formData.selectedFuelStore] && (
                                <div><strong>Current Level:</strong> {storeReadings[formData.selectedFuelStore]} L</div>
                              )}
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', fontStyle: 'italic' }}>
                                {formData.selectedFuelStore.includes('FSH') ? 'Service Truck' : 
                                formData.selectedFuelStore.includes('SLD') ? 'Fuel Trailer' : 
                                formData.selectedFuelStore.includes('UDT') || formData.selectedFuelStore.includes('STD') ? 'Static Tank' : 
                                'Fuel Storage'}
                              </div>
                            </div>
                          </div>
                          <span style={{ color: '#4caf50', fontSize: '24px' }}>✅</span>
                        </div>
                      </div>
                    )}
                  </div>
                    
                    {/* Enhanced Meter Readings with Photo Capture */}
                    <div>
                      <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Meter Readings with Photo Capture</h4>
                      
                      {formData.meterVarianceFlag && (
                        <div style={{ backgroundColor: formData.readingFlag === 'critical' ? '#ffebee' : formData.readingFlag === 'warning' ? '#fff3e0' : '#e8f5e8', border: formData.readingFlag === 'critical' ? '2px solid #f44336' : formData.readingFlag === 'warning' ? '2px solid #ff9800' : '2px solid #4caf50', borderRadius: '4px', padding: '10px', marginBottom: '15px', color: formData.readingFlag === 'critical' ? '#c62828' : formData.readingFlag === 'warning' ? '#e65100' : '#1b5e20' }}>
                          {formData.readingFlag === 'critical' ? '🚨 CRITICAL: ' : formData.readingFlag === 'warning' ? '⚠️ WARNING: ' : 'ℹ️ NOTE: '}{formData.meterVarianceMessage}
                        </div>
                      )}
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Previous Reading:</label>
                          <input 
                            type="number" 
                            name="previousMeterReading" 
                            value={formData.previousMeterReading} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            readOnly={!isFirstTransaction} 
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: isFirstTransaction ? 'white' : '#f5f5f5' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Current Reading (Before):
                            {formData.currentMeterReadingBeforePhotoName && (
                              <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px' }}>📷 Photo Added</span>
                            )}
                          </label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                              type="number" 
                              name="currentMeterReadingBefore" 
                              value={formData.currentMeterReadingBefore} 
                              onChange={handleInputChange} 
                              step="0.01" 
                              style={{ 
                                flex: 1, 
                                padding: '10px', 
                                border: formData.currentMeterReadingBeforePhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                                borderRadius: '4px' 
                              }} 
                              required 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowMeterReadingModal('before')}
                              style={{ 
                                padding: '10px 15px', 
                                backgroundColor: formData.currentMeterReadingBeforePhotoName ? '#4caf50' : '#1976d2', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              {formData.currentMeterReadingBeforePhotoName ? '📷' : '📸'} 
                              {formData.currentMeterReadingBeforePhotoName ? 'Change' : 'Add Photo'}
                            </button>
                          </div>
                          {formData.currentMeterReadingBeforePhotoName && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                              Photo: {formData.currentMeterReadingBeforePhotoName}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fuel Quantity (L):</label>
                          <input 
                            type="number" 
                            name="fuelQuantity" 
                            value={formData.fuelQuantity} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Closing Reading (After):
                            {formData.currentMeterReadingAfterPhotoName && (
                              <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px' }}>📷 Photo Added</span>
                            )}
                          </label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                              type="number" 
                              name="currentMeterReadingAfter" 
                              value={formData.currentMeterReadingAfter} 
                              onChange={handleInputChange}
                              step="0.01"
                              placeholder="Enter closing reading manually"
                              style={{ 
                                flex: 1, 
                                padding: '10px', 
                                border: formData.currentMeterReadingAfterPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                                borderRadius: '4px' 
                              }} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowMeterReadingModal('after')}
                              style={{ 
                                padding: '10px 15px', 
                                backgroundColor: formData.currentMeterReadingAfterPhotoName ? '#4caf50' : '#1976d2', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              {formData.currentMeterReadingAfterPhotoName ? '📷' : '📸'} 
                              {formData.currentMeterReadingAfterPhotoName ? 'Change' : 'Add Photo'}
                            </button>
                          </div>
                          {formData.currentMeterReadingAfterPhotoName && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                              Photo: {formData.currentMeterReadingAfterPhotoName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stock Management Section - COMPLETELY MANUAL, NO CALCULATIONS */}
                {activeSection === 'stock' && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    
                    {/* Manual Dip Readings */}
                    <div>
                      <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Dip Readings </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Previous Dip/Probe (L):</label>
                          <input 
                            type="number" 
                            name="previousDip" 
                            value={formData.previousDip} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            placeholder="Enter previous dip"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Current Dip/Probe (L):</label>
                          <input 
                            type="number" 
                            name="currentDip" 
                            value={formData.currentDip} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            placeholder="Enter current dip"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Delivery Received (L):</label>
                          <input 
                            type="number" 
                            name="deliveryReceived" 
                            value={formData.deliveryReceived} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            placeholder="Enter delivery amount"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Total Issued from Dips (L):</label>
                          <input 
                            type="number" 
                            name="totalIssuedFromDips" 
                            value={formData.totalIssuedFromDips} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            placeholder="Enter total issued from dips"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Manual IQTech Meter Readings */}
                    <div>
                      <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>IQTech Meter Readings</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Opening Reading:</label>
                          <input 
                            type="number" 
                            name="openingReading" 
                            value={formData.openingReading} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            placeholder="Enter opening reading"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Closing Reading:</label>
                          <input 
                            type="number" 
                            name="closingReading" 
                            value={formData.closingReading} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            placeholder="Enter closing reading"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                          />
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Total Issued from Readings (L):</label>
                        <input 
                          type="number" 
                          name="totalIssuedFromReadings" 
                          value={formData.totalIssuedFromReadings} 
                          onChange={handleInputChange} 
                          step="0.01" 
                          placeholder="Enter total issued from readings"
                          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                        />
                      </div>
                    </div>
                    
                    {/* Manual Variances */}
                    <div>
                      <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Variances</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Variance Dips (%):</label>
                          <input 
                            type="number" 
                            name="varianceDips" 
                            value={formData.varianceDips} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            placeholder="Enter variance percentage"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Variance Readings (%):</label>
                          <input 
                            type="number" 
                            name="varianceReadings" 
                            value={formData.varianceReadings} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            placeholder="Enter variance percentage"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Section */}
                {activeSection === 'transaction' && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Transaction Type:</label>
                        <select name="transactionType" value={formData.transactionType} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required>
                          <option value="">Select Transaction Type</option>
                          {transactionTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contract/Site:</label>
                        <select name="contractType" value={formData.contractType} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required>
                          <option value="">Select Contract/Site</option>
                          {contractOptions.map(contract => (
                            <option key={contract} value={contract}>{contract}</option>
                          ))}
                          {customSites.map(site => (
                            <option key={site} value={site}>{site} (Custom)</option>
                          ))}
                        </select>
                      </div>
                      
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Add Custom Site:</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" name="customSiteNumber" value={formData.customSiteNumber} onChange={handleInputChange} placeholder="e.g., 2501-05" style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        <button type="button" onClick={handleAddCustomSite} disabled={!formData.customSiteNumber} style={{ padding: '10px 15px', backgroundColor: formData.customSiteNumber ? '#1b5e20' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: formData.customSiteNumber ? 'pointer' : 'not-allowed' }}>
                          Add Site
                        </button>
                      </div>
                    </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Receiver Name:</label>
                        <input type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Employment Number:</label>
                        <input type="text" name="employmentNumber" value={formData.employmentNumber} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Receiver Company:</label>
                      <input type="text" name="receiverCompany" value={formData.receiverCompany} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fuel Type:</label>
                        <select name="fuelType" value={formData.fuelType} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                          <option value="Diesel">Diesel</option>
                          <option value="Petrol">Petrol</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Transaction Date:</label>
                        <input type="date" name="transactionDate" value={formData.transactionDate} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Remarks:</label>
                      <textarea 
                        name="remarks" 
                        value={formData.remarks} 
                        onChange={handleInputChange} 
                        rows="3" 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} 
                        placeholder="Additional notes or comments..." 
                      />
                    </div>

                    {/* Acknowledgement Section WITH DRAWING SIGNATURE */}
                    <div style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '20px', 
                      borderRadius: '8px', 
                      border: '2px solid #e0e0e0',
                      marginTop: '15px'
                    }}>
                      <h4 style={{ color: '#1b5e20', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📝 Acknowledgement & Signature
                      </h4>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                          I confirm that all readings and information provided are accurate:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <input 
                            type="checkbox" 
                            id="acknowledgeAccuracy"
                            checked={formData.acknowledgeAccuracy}
                            onChange={(e) => setFormData(prev => ({ ...prev, acknowledgeAccuracy: e.target.checked }))}
                            required
                          />
                          <label htmlFor="acknowledgeAccuracy" style={{ color: '#333' }}>
                            ✓ I confirm all readings and quantities are accurate
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                          Digital Signature (Draw your signature):
                        </label>
                        
                        {formData.signatureImage ? (
                          <div style={{ 
                            marginBottom: '15px',
                            textAlign: 'center'
                          }}>
                            <div style={{ 
                              backgroundColor: 'white', 
                              padding: '15px', 
                              borderRadius: '8px',
                              border: '2px solid #4caf50'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                marginBottom: '10px'
                              }}>
                                <h5 style={{ margin: 0, color: '#1b5e20' }}>✓ Signature Added</h5>
                                <button 
                                  type="button"
                                  onClick={() => setShowSignaturePad(true)}
                                  style={{ 
                                    padding: '5px 10px',
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  ✏️ Redraw
                                </button>
                              </div>
                              <img 
                                src={formData.signatureImage} 
                                alt="Signature" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100px',
                                  border: '1px solid #ddd',
                                  backgroundColor: 'white'
                                }} 
                              />
                            </div>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setShowSignaturePad(true)}
                            style={{ 
                              width: '100%',
                              padding: '15px',
                              backgroundColor: '#1b5e20',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px'
                            }}
                          >
                            ✍️ Draw Your Signature
                          </button>
                        )}
                        
                        <small style={{ color: '#666', display: 'block', marginTop: '10px' }}>
                          Click the button above to draw your signature. Signature is required for submission.
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
                  <button type="button" onClick={() => {
                    const currentIndex = navigationItems.findIndex(item => item.id === activeSection);
                    if (currentIndex > 0) setActiveSection(navigationItems[currentIndex - 1].id);
                  }} disabled={activeSection === 'equipment'} style={{ padding: '12px 24px', backgroundColor: '#757575', color: 'white', border: 'none', borderRadius: '6px', cursor: activeSection === 'equipment' ? 'not-allowed' : 'pointer', opacity: activeSection === 'equipment' ? 0.6 : 1 }}>
                    ← Previous
                  </button>
                  
                  <button type="button" onClick={() => {
                    const currentIndex = navigationItems.findIndex(item => item.id === activeSection);
                    if (currentIndex < navigationItems.length - 1) setActiveSection(navigationItems[currentIndex + 1].id);
                  }} disabled={activeSection === 'transaction'} style={{ padding: '12px 24px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: activeSection === 'transaction' ? 'not-allowed' : 'pointer', opacity: activeSection === 'transaction' ? 0.6 : 1 }}>
                    Next →
                  </button>
                </div>

                {/* Submit Button - Only show on last section */}
                {activeSection === 'transaction' && (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '15px 40px', backgroundColor: '#1b5e20', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
                      ✅ Record Fuel Transaction
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
          
        </div>
          
        {/* Right Sidebar */}
        <div>
          {/* Quick Stats */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Quick Stats</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>{transactions.length}</div>
                <div style={{ color: '#666', fontSize: '14px' }}>Total Transactions</div>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>{new Set(transactions.map(t => t.plantNumber)).size}</div>
                <div style={{ color: '#666', fontSize: '14px' }}>Unique Equipment</div>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef6c00' }}>{transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0).toFixed(0)}L</div>
                <div style={{ color: '#666', fontSize: '14px' }}>Total Fuel</div>
              </div>
              {/* Photo Stats */}
              <div style={{ padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2' }}>
                  {JSON.parse(localStorage.getItem('odometerPhotos') || '[]').length + JSON.parse(localStorage.getItem('meterReadingPhotos') || '[]').length}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>Total Photos</div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#1b5e20', margin: 0 }}>Recent Transactions</h3>
              <button onClick={downloadTransactionsExcel} disabled={transactions.length === 0} style={{ padding: '6px 12px', backgroundColor: transactions.length === 0 ? '#ccc' : '#1b5e20', color: 'white', border: 'none', borderRadius: '4px', cursor: transactions.length === 0 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                📊 Excel
              </button>
            </div>
            {transactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '10px' }}>No transactions</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {transactions.slice(0, 5).map(transaction => (
                  <div key={transaction.id} style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{transaction.plantNumber}</strong>
                      <span>{transaction.fuelQuantity}L</span>
                    </div>
                    <div style={{ color: '#666' }}>{transaction.transactionDate} • {transaction.selectedFuelStore}</div>
                    <div style={{ fontSize: '10px', color: '#4caf50', marginTop: '2px' }}>
                      {transaction.odometerPhotos?.kilos?.photoName ? '📷 KM ' : ''}
                      {transaction.odometerPhotos?.hours?.photoName ? '📷 HRS' : ''}
                      {transaction.meterReadingPhotos?.before?.photoName ? '📊 Before' : ''}
                      {transaction.meterReadingPhotos?.after?.photoName ? '📊 After' : ''}
                      {transaction.signatureImage ? '✍️ Signed' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Modals */}
      {showQRScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />}
      {showFuelStoreScanner && (
        <QRScanner 
          onScan={handleFuelStoreQRScan} 
          onClose={() => setShowFuelStoreScanner(false)}
          title="Scan Fuel Store QR Code"
          instructions="Point camera at fuel store QR code"
        />
      )}
      {showOdometerModal && (
        <OdometerPhotoUpload
          onPhotoUpload={handleOdometerUpload}
          onClose={() => setShowOdometerModal(null)}
          type={showOdometerModal}
          currentValue={showOdometerModal === 'kilos' ? formData.odometerKilos : formData.odometerHours}
          plantNumber={formData.plantNumber}
          transactionId={currentTransactionId}
          userId={user?.id}
        />
      )}
      {/* NEW: Meter Reading Photo Upload Modal */}
      {showMeterReadingModal && (
        <MeterReadingPhotoUpload
          onPhotoUpload={handleMeterReadingUpload}
          onClose={() => setShowMeterReadingModal(null)}
          type="meter"
          currentValue={showMeterReadingModal === 'before' ? formData.currentMeterReadingBefore : formData.currentMeterReadingAfter}
          plantNumber={formData.plantNumber}
          transactionId={currentTransactionId}
          userId={user?.id}
          meterType={showMeterReadingModal}
        />
      )}
      {showPhotoGallery && (
        <PhotoGalleryModal
          onClose={() => {
            setShowPhotoGallery(false);
            if (activeSection === 'photos') {
              setActiveSection('equipment');
            }
          }}
        />
      )}
      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onClose={() => setShowSignaturePad(false)}
        />
      )}

      {/* ==================== FOOTER ==================== */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e0e0e0',
        padding: '20px 30px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        marginTop: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '12px', 
          flexWrap: 'wrap' 
        }}>
          <span>© 2025 Fuel Management System. All rights reserved.</span>
          <span style={{ color: '#1b5e20' }}>|</span>
          <span>
            Created by 
            <a 
              href="https://port-lee.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#1b5e20', 
                textDecoration: 'none',
                marginLeft: '5px',
                fontWeight: '600'
              }}
            >
              Lethabo Mokgokoloshi 
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};


export default Admin;