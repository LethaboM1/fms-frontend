import React, { useState, useRef, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import QRScanner from '../qr/QRScanner'; // Import the QRScanner component

// ==================== INDEXEDDB SETUP ====================

// Initialize IndexedDB for photo storage
const initPhotoDatabase = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FleetPhotoDatabase', 2);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      
      // Create photos store if it doesn't exist
      if (!db.objectStoreNames.contains('photos')) {
        const store = db.createObjectStore('photos', { keyPath: 'photoId', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('plantNumber', 'plantNumber', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('folderPath', 'folderPath', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
      }
      
      // Create folders store if it doesn't exist
      if (!db.objectStoreNames.contains('folders')) {
        const folderStore = db.createObjectStore('folders', { keyPath: 'path' });
        folderStore.createIndex('photoCount', 'photoCount', { unique: false });
        folderStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
      }
      
      // Create thumbnails store if needed
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('thumbnails')) {
          db.createObjectStore('thumbnails', { keyPath: 'photoId' });
        }
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Save photo to IndexedDB
const savePhotoToDatabase = async (photoData) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos', 'folders', 'thumbnails'], 'readwrite');
      const photoStore = transaction.objectStore('photos');
      const folderStore = transaction.objectStore('folders');
      const thumbnailStore = transaction.objectStore('thumbnails');
      
      // Generate thumbnail (first 50KB of base64)
      const thumbnail = photoData.base64Data.substring(0, 50000);
      const thumbnailData = {
        photoId: photoData.photoId,
        thumbnail: thumbnail,
        timestamp: photoData.timestamp
      };
      
      // Save thumbnail first
      const thumbnailRequest = thumbnailStore.add(thumbnailData);
      
      thumbnailRequest.onsuccess = () => {
        // Save full photo
        const photoRequest = photoStore.add(photoData);
        
        photoRequest.onsuccess = () => {
          const savedPhotoId = photoRequest.result;
          
          // Update folder stats
          const folderRequest = folderStore.get(photoData.folderPath);
          
          folderRequest.onsuccess = () => {
            const folder = folderRequest.result || {
              path: photoData.folderPath,
              name: photoData.folderPath.split('/').filter(Boolean).pop() || 'Root',
              photoCount: 0,
              lastUpdated: photoData.timestamp,
              totalSize: 0
            };
            
            folder.photoCount += 1;
            folder.lastUpdated = photoData.timestamp;
            folder.totalSize += photoData.fileSize || 0;
            
            const updateFolderRequest = folderStore.put(folder);
            
            updateFolderRequest.onsuccess = () => {
              transaction.oncomplete = () => {
                db.close();
              };
              resolve({ 
                ...photoData, 
                photoId: savedPhotoId,
                thumbnail: thumbnail 
              });
            };
            
            updateFolderRequest.onerror = () => {
              reject(new Error('Failed to update folder stats'));
            };
          };
          
          folderRequest.onerror = () => {
            reject(new Error('Failed to get folder stats'));
          };
        };
        
        photoRequest.onerror = () => {
          reject(new Error('Failed to save photo'));
        };
      };
      
      thumbnailRequest.onerror = () => {
        reject(new Error('Failed to save thumbnail'));
      };
      
      transaction.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

// Get all photos from database
const getAllPhotosFromDatabase = async (userId = null) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allPhotos = request.result;
        const filteredPhotos = userId 
          ? allPhotos.filter(photo => photo.userId === userId)
          : allPhotos;
        
        // Sort by timestamp (newest first)
        filteredPhotos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        transaction.oncomplete = () => {
          db.close();
        };
        
        resolve(filteredPhotos);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to load photos'));
      };
    });
  } catch (error) {
    console.error('Error loading photos:', error);
    return [];
  }
};

// Get all folders from database
const getAllFoldersFromDatabase = async () => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['folders'], 'readonly');
      const store = transaction.objectStore('folders');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const folders = request.result;
        
        // Sort by last updated (newest first)
        folders.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        
        transaction.oncomplete = () => {
          db.close();
        };
        
        resolve(folders);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to load folders'));
      };
    });
  } catch (error) {
    console.error('Error loading folders:', error);
    return [];
  }
};

// Get photos by folder
const getPhotosByFolder = async (folderPath) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const index = store.index('folderPath');
      const request = index.getAll(folderPath);
      
      request.onsuccess = () => {
        const photos = request.result;
        
        // Sort by timestamp (newest first)
        photos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        transaction.oncomplete = () => {
          db.close();
        };
        
        resolve(photos);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to load folder photos'));
      };
    });
  } catch (error) {
    console.error('Error loading folder photos:', error);
    return [];
  }
};

// ==================== ENHANCED SCANNER COMPONENTS ====================

// Odometer Photo Upload Component with proper IndexedDB storage
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
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size too large. Maximum 10MB allowed.');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setPhoto(base64Image);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read image file');
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

    setUploading(true);
    
    try {
      // Create photo folder structure based on date
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const folderPath = `uploads/${year}/${month}/${day}/`;
      const filename = `odometer_${type}_${plantNumber || 'unknown'}_${year}${month}${day}_${hours}${minutes}${seconds}.jpg`;
      
      // Calculate file size
      const fileSize = Math.round((photo.length * 3) / 4); // Approximate size in bytes
      
      // Create photo data object
      const photoData = {
        photoId: Date.now(), // Temporary ID, will be replaced by IndexedDB auto-increment
        filename: filename,
        originalName: photoName || `odometer_${type}.jpg`,
        base64Data: photo,
        type: type,
        reading: manualValue,
        timestamp: now.toISOString(),
        plantNumber: plantNumber || 'Unknown',
        userId: userId || 'unknown',
        transactionId: transactionId || null,
        folderPath: folderPath,
        fileSize: fileSize,
        dimensions: { width: 0, height: 0 }, // You can extract this if needed
        metadata: {
          uploadedBy: userId || 'unknown',
          uploadTime: now.toISOString(),
          device: navigator.userAgent.substring(0, 100),
          readingType: type,
          readingValue: manualValue
        }
      };

      // Save to IndexedDB
      const savedPhoto = await savePhotoToDatabase(photoData);
      
      // Also save reference to localStorage for quick access
      const savedPhotoRefs = JSON.parse(localStorage.getItem('odometerPhotoRefs') || '[]');
      savedPhotoRefs.push({
        photoId: savedPhoto.photoId,
        filename: savedPhoto.filename,
        type: savedPhoto.type,
        reading: savedPhoto.reading,
        timestamp: savedPhoto.timestamp,
        plantNumber: savedPhoto.plantNumber,
        folderPath: savedPhoto.folderPath,
        thumbnail: savedPhoto.thumbnail // Store thumbnail for quick preview
      });
      localStorage.setItem('odometerPhotoRefs', JSON.stringify(savedPhotoRefs));
      
      // Update photo counter
      const photoCount = parseInt(localStorage.getItem('totalPhotos') || '0') + 1;
      localStorage.setItem('totalPhotos', photoCount.toString());
      
      setUploadSuccess(true);
      setUploadedPhotoData(savedPhoto);
      
      // Also save to transaction folder structure
      const folderStructure = JSON.parse(localStorage.getItem('photoFolderStructure') || '{}');
      if (!folderStructure[folderPath]) {
        folderStructure[folderPath] = {
          path: folderPath,
          displayName: `${year}-${month}-${day}`,
          photoCount: 0,
          lastUpdated: now.toISOString()
        };
      }
      folderStructure[folderPath].photoCount += 1;
      folderStructure[folderPath].lastUpdated = now.toISOString();
      localStorage.setItem('photoFolderStructure', JSON.stringify(folderStructure));
      
      setTimeout(() => {
        onPhotoUpload({
          value: manualValue,
          photoData: savedPhoto,
          type: type
        });
        onClose();
      }, 1500);
      
      setUploading(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(`Failed to save photo: ${error.message}`);
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
            Upload Photo:
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
                <span style={{ fontSize: '12px', color: '#666' }}>
                  ({Math.round(photoName.length / 1024)} KB)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Photo Preview */}
        {photo && !uploadSuccess && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Photo Preview:</p>
            <div style={{ 
              maxWidth: '100%', 
              maxHeight: '200px', 
              overflow: 'hidden',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}>
              <img 
                src={photo} 
                alt="Odometer" 
                style={{ 
                  width: '100%',
                  height: 'auto',
                  maxHeight: '200px',
                  objectFit: 'contain'
                }} 
              />
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Image loaded successfully
            </p>
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
              <strong style={{ color: '#1b5e20' }}>Photo Saved Successfully!</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#555' }}>
              <div><strong>File:</strong> {uploadedPhotoData.filename}</div>
              <div><strong>Reading:</strong> {uploadedPhotoData.reading} {type === 'kilos' ? 'km' : 'hrs'}</div>
              <div><strong>Saved to:</strong> {uploadedPhotoData.folderPath}</div>
              <div><strong>Database ID:</strong> {uploadedPhotoData.photoId}</div>
              <div><strong>Timestamp:</strong> {new Date(uploadedPhotoData.timestamp).toLocaleTimeString()}</div>
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
              {uploading ? 'Saving...' : 'Save with Photo'}
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

// Enhanced Photo Gallery Modal with IndexedDB
const PhotoGalleryModal = ({ onClose, userId }) => {
  const [photos, setPhotos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderPhotos, setFolderPhotos] = useState([]);

  useEffect(() => {
    loadGalleryData();
  }, [userId]);

  const loadGalleryData = async () => {
    setIsLoading(true);
    try {
      const [photosData, foldersData] = await Promise.all([
        getAllPhotosFromDatabase(userId),
        getAllFoldersFromDatabase()
      ]);
      
      setPhotos(photosData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Error loading gallery data:', error);
      // Fallback to localStorage
      const savedPhotoRefs = JSON.parse(localStorage.getItem('odometerPhotoRefs') || '[]');
      setPhotos(savedPhotoRefs);
      
      const folderStructure = JSON.parse(localStorage.getItem('photoFolderStructure') || '{}');
      setFolders(Object.values(folderStructure));
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolderPhotos = async (folderPath) => {
    try {
      const photos = await getPhotosByFolder(folderPath);
      setFolderPhotos(photos);
      setSelectedFolder(folderPath);
    } catch (error) {
      console.error('Error loading folder photos:', error);
    }
  };

  const getFolderName = (folderPath) => {
    if (!folderPath) return 'Unknown';
    const parts = folderPath.split('/').filter(Boolean);
    return parts.length > 1 ? `${parts[parts.length - 3]}/${parts[parts.length - 2]}/${parts[parts.length - 1]}` : folderPath;
  };

  const getPhotoStats = () => {
    const kmPhotos = photos.filter(p => p.type === 'kilos');
    const hourPhotos = photos.filter(p => p.type === 'hours');
    const today = new Date().toDateString();
    const todayPhotos = photos.filter(p => new Date(p.timestamp).toDateString() === today);
    
    return {
      total: photos.length,
      km: kmPhotos.length,
      hours: hourPhotos.length,
      today: todayPhotos.length,
      folders: folders.length,
      totalSize: photos.reduce((sum, p) => sum + (p.fileSize || 0), 0)
    };
  };

  const stats = getPhotoStats();

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
                onClick={() => { setViewMode('grid'); setSelectedFolder(null); }}
                style={{ 
                  padding: '5px 10px',
                  backgroundColor: viewMode === 'grid' && !selectedFolder ? '#1b5e20' : '#f5f5f5',
                  color: viewMode === 'grid' && !selectedFolder ? 'white' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📷 All Photos
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
                📁 Folders
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
              Total: {stats.total} photos • {stats.folders} folders
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
            <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1565c0' }}>📸 KM Photos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.km}</div>
            </div>
            <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1b5e20' }}>⏱️ HR Photos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.hours}</div>
            </div>
            <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>🏭 Today</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.today}</div>
            </div>
            <div style={{ backgroundColor: '#f3e5f5', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#7b1fa2' }}>💾 Storage</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {Math.round(stats.totalSize / (1024 * 1024 * 10) * 100)}% used
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
              <p>Loading photos...</p>
            </div>
          </div>
        ) : selectedFolder ? (
          // Folder Photos View
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <button 
                onClick={() => setSelectedFolder(null)}
                style={{ 
                  padding: '5px 10px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ← Back
              </button>
              <h4 style={{ margin: 0, color: '#555' }}>📁 {getFolderName(selectedFolder)} ({folderPhotos.length} photos)</h4>
            </div>
            
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              paddingRight: '10px'
            }}>
              {folderPhotos.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '15px',
                  padding: '10px'
                }}>
                  {folderPhotos.map(photo => (
                    <div 
                      key={photo.photoId} 
                      style={{ 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #ddd',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <div style={{ 
                        height: '120px', 
                        backgroundColor: '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {photo.base64Data || photo.thumbnail ? (
                          <img 
                            src={photo.base64Data || photo.thumbnail} 
                            alt={photo.filename}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{ color: '#666' }}>
                            📷 {photo.type === 'kilos' ? 'KM' : 'HRS'}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
                          {photo.reading} {photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : ''}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          Plant: {photo.plantNumber || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                          {new Date(photo.timestamp).toLocaleDateString()}
                        </div>
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
                  <p>No photos in this folder</p>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'folders' ? (
          // Folder List View
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>📁 Folders ({folders.length})</h4>
            {folders.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {folders.map(folder => (
                  <div 
                    key={folder.path}
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '15px',
                      border: '1px solid #ddd',
                      cursor: 'pointer'
                    }}
                    onClick={() => loadFolderPhotos(folder.path)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>📁</span>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#333' }}>{getFolderName(folder.path)}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{folder.path}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {folder.photoCount} photo{folder.photoCount !== 1 ? 's' : ''}
                        </div>
                        <span style={{ fontSize: '20px' }}>→</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                      Last updated: {new Date(folder.lastUpdated).toLocaleString()}
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
                <p>Upload photos to create folders automatically</p>
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
            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>📷 All Photos ({photos.length})</h4>
            {photos.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '15px',
                padding: '10px'
              }}>
                {photos.map(photo => (
                  <div 
                    key={photo.photoId} 
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #ddd',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div style={{ 
                      height: '120px', 
                      backgroundColor: '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {photo.base64Data || photo.thumbnail ? (
                        <img 
                          src={photo.base64Data || photo.thumbnail} 
                          alt={photo.filename}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{ color: '#666' }}>
                          📷 {photo.type === 'kilos' ? 'KM' : 'HRS'}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
                        {photo.reading} {photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        Plant: {photo.plantNumber || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                        {new Date(photo.timestamp).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '10px', color: '#1976d2', marginTop: '2px' }}>
                        📁 {getFolderName(photo.folderPath)}
                      </div>
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
                <p>Upload odometer photos to see them here</p>
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
            Database: {stats.total} photos • {stats.folders} folders
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
                    {selectedPhoto.type === 'kilos' ? 'Kilometers (KM)' : selectedPhoto.type === 'hours' ? 'Hours (HRS)' : 'Unknown'}
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
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>File Size</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {selectedPhoto.fileSize ? Math.round(selectedPhoto.fileSize / 1024) + ' KB' : 'Unknown'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Database ID</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {selectedPhoto.photoId || 'N/A'}
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
                <div style={{ 
                  maxHeight: '400px', 
                  overflow: 'auto',
                  marginBottom: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '8px'
                }}>
                  <img 
                    src={selectedPhoto.base64Data} 
                    alt="Odometer"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ) : selectedPhoto.thumbnail ? (
                <div>
                  <img 
                    src={selectedPhoto.thumbnail} 
                    alt="Odometer Thumbnail"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      objectFit: 'contain'
                    }}
                  />
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                    (Thumbnail preview - full image stored in database)
                  </p>
                </div>
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
                Photo ID: {selectedPhoto.photoId || 'N/A'}
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

// Fuel Edit Modal Component
const FuelEditModal = ({ currentQuantity, onSave, onClose }) => {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid fuel quantity (greater than 0)');
      return;
    }
    onSave(quantity);
    onClose();
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
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20' }}>⛽ Edit Fuel Quantity</h3>
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

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #ef9a9a',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Fuel Quantity (Liters):
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError('');
            }}
            placeholder="Enter fuel quantity in liters..."
            step="0.1"
            min="0"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #1b5e20',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button 
            onClick={handleSave}
            disabled={!quantity}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: quantity ? '#1b5e20' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: quantity ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Save Changes
          </button>
          
          <button 
            onClick={onClose}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #ddd',
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Site Modal Component
const CustomSiteModal = ({ onSave, onClose }) => {
  const [siteName, setSiteName] = useState('');
  const [siteNumber, setSiteNumber] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!siteName.trim()) {
      setError('Please enter a site name');
      return;
    }
    
    const customSite = siteNumber.trim() 
      ? `${siteName} (${siteNumber})`
      : siteName;
    
    onSave(customSite);
    onClose();
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
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20' }}>🏗️ Add Custom Site</h3>
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

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #ef9a9a',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Site Name: *
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => {
              setSiteName(e.target.value);
              setError('');
            }}
            placeholder="Enter site name..."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #1b5e20',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Site Number (Optional):
          </label>
          <input
            type="text"
            value={siteNumber}
            onChange={(e) => setSiteNumber(e.target.value)}
            placeholder="Enter site number..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button 
            onClick={handleSave}
            disabled={!siteName.trim()}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: siteName.trim() ? '#1b5e20' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: siteName.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Add Site
          </button>
          
          <button 
            onClick={onClose}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #ddd',
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN DRIVER DASHBOARD ====================

const DriverDashboard = ({ user, onLogout, onNavigateToAdmin }) => {
  // Main state
  const [formData, setFormData] = useState({
    plantNumber: '',
    plantName: '',
    plantType: '',
    odometerKilos: '',
    odometerHours: '',
    odometerKilosPhotoId: null,
    odometerHoursPhotoId: null,
    odometerKilosPhotoName: '',
    odometerHoursPhotoName: '',
    odometerKilosPhotoPath: '',
    odometerHoursPhotoPath: '',
    fuelQuantity: '',
    fuelStore: '',
    transactionType: 'Plant Fuel to Contract',
    contractType: '',
    receiverName: user.fullName || '',
    receiverCompany: user.company || '',
    employmentNumber: user.employeeNumber || '',
    transactionDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showReceiptCamera, setShowReceiptCamera] = useState(false);
  const [showFuelEditModal, setShowFuelEditModal] = useState(false);
  const [showCustomSiteModal, setShowCustomSiteModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [shiftStatus, setShiftStatus] = useState('OFF DUTY');
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [odometerPhotos, setOdometerPhotos] = useState({
    kilos: null,
    hours: null
  });

  // Add vehicle status state
  const [vehicleStatus, setVehicleStatus] = useState({
    currentOdometer: '18,542',
    fuelLevel: 78,
    shiftStatus: 'Off Duty',
    range: 520,
    consumption: 7.2,
    lastRefuel: '12/2/2025',
    todayDistance: 0,
    nextService: '2,500 km',
    shiftStart: null
  });

  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize IndexedDB on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initPhotoDatabase();
        console.log('IndexedDB initialized successfully');
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };
    
    initializeDatabase();
  }, []);

  // Plant master list (same as admin)
  const plantMasterList = {
    'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD07': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD08': { name: 'ASPHALT PAVER DYNAPAC F161-8W', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD09': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD11': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APN01': { name: 'ASPHALT PAVER NIGATA', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APV10': { name: 'ASPHALT PAVER VOGELE 1800 SPRAY JET', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APP02': { name: 'ASPHALT MIXING PLANT MOBILE 40tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP03': { name: 'ASPHALT MIXING PLANT MOBILE 60tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP04': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'plant' },
    'A-APP06': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-ASR01': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
    'A-ASR02': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
    'A-BBS03': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
    'A-BBS04': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
    'A-BDT02': { name: 'BITUMEN TRAILER 1kl', type: 'Bitumen Trailer', fuelType: 'Bitumen', category: 'specialized' },
    'A-BDT06': { name: 'CRACKSEALING TRAILER', type: 'Cracksealing Trailer', fuelType: 'Diesel', category: 'specialized' },
    'A-BEP01': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
    'A-BEP02': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
    'A-BNS08': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BNS09': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BNS10': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC106': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC107': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC108': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BRM11': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM12': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM13': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM14': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BTH100': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
    'A-BTH104': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
    'A-BTH115': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
    'A-CCK05': { name: 'KLEEMANN MOBICONE MCO 9 S EVO CONE', type: 'Cone Crusher', fuelType: 'Diesel', category: 'crushing' },
    'A-CHR03': { name: 'RM HORIZONTAL IMPACT CRUSHER 100GO', type: 'Impact Crusher', fuelType: 'Diesel', category: 'crushing' },
    'A-CJK06': { name: 'KLEEMANN MOBICAT MC 110 R EVO JAW', type: 'Jaw Crusher', fuelType: 'Diesel', category: 'crushing' },
    'A-CSK01': { name: 'KLEEMANN MOBICAT MC 703 EVO SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
    'A-CSM02': { name: 'METSO ST2.8 SCALPER SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
    'A-CSC03': { name: 'CHIEFTAIN 600, DOUBLE DECK SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
    'A-CSE07': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE08': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE09': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE10': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-DOK13': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
    'A-DOK15': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
    'A-DOK16': { name: 'DOZER KOMATSU D155 40t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
    'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
    'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
    'SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
    'STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
    'STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
    'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
    'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
    'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  };

  // Initialize data
  useEffect(() => {
    // Load user's recent transactions
    const userTransactions = transactionService.getAllTransactions()
      .filter(t => t.userId === user.id)
      .slice(0, 10);
    setTransactions(userTransactions);

    // Check shift status from localStorage
    const savedShift = localStorage.getItem(`driver_${user.id}_shift`);
    if (savedShift) {
      const shiftData = JSON.parse(savedShift);
      setShiftStatus('ON DUTY');
      setShiftStartTime(shiftData.startTime);
      setCurrentVehicle(shiftData.vehicle);
      
      // Update vehicle status
      setVehicleStatus(prev => ({
        ...prev,
        shiftStatus: 'On Duty',
        shiftStart: shiftData.startTime
      }));
      
      if (shiftData.plantNumber) {
        setFormData(prev => ({
          ...prev,
          plantNumber: shiftData.plantNumber,
          plantName: shiftData.plantName,
          plantType: shiftData.plantType
        }));
      }
    }

    // Load saved odometer photos from IndexedDB
    const loadSavedPhotos = async () => {
      try {
        const savedPhotos = await getAllPhotosFromDatabase(user.id);
        const kilosPhoto = savedPhotos.find(p => p.type === 'kilos');
        const hoursPhoto = savedPhotos.find(p => p.type === 'hours');
        
        if (kilosPhoto || hoursPhoto) {
          setOdometerPhotos({
            kilos: kilosPhoto || null,
            hours: hoursPhoto || null
          });
        }
      } catch (error) {
        console.error('Error loading saved photos:', error);
      }
    };
    
    loadSavedPhotos();
  }, [user.id]);

  // Helper function for today's distance
  const getTodayDistance = () => {
    // This would typically calculate from transactions for today
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(t => 
      new Date(t.transactionDate).toDateString() === today
    );
    // Sum distances from today's transactions
    return todayTransactions.reduce((sum, t) => sum + (parseFloat(t.odometerKilos) || 0), 0);
  };

  // QR Scan handler
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

    setFormData(prev => ({
      ...prev,
      plantNumber: plantNumber,
      plantName: plantInfo.name,
      plantType: plantInfo.type,
      fuelType: plantInfo.fuelType
    }));

    setShowQRScanner(false);
    alert(`✅ Vehicle scanned: ${plantNumber} - ${plantInfo.name}`);
  };

  // Odometer photo upload handler
  const handleOdometerUpload = (result) => {
    const { type, value, photoData } = result;
    
    // Update form data with photo info
    const photoInfo = {
      [`odometer${type.charAt(0).toUpperCase() + type.slice(1)}`]: value,
      [`odometer${type.charAt(0).toUpperCase() + type.slice(1)}PhotoId`]: photoData?.photoId || null,
      [`odometer${type.charAt(0).toUpperCase() + type.slice(1)}PhotoName`]: photoData?.filename || '',
      [`odometer${type.charAt(0).toUpperCase() + type.slice(1)}PhotoPath`]: photoData?.folderPath || ''
    };
    
    setFormData(prev => ({
      ...prev,
      ...photoInfo
    }));

    // Update photos state
    setOdometerPhotos(prev => ({
      ...prev,
      [type]: photoData
    }));

    setShowOdometerModal(null);
  };

  // Fuel quantity edit handler
  const handleFuelQuantityEdit = (newQuantity) => {
    setFormData(prev => ({
      ...prev,
      fuelQuantity: newQuantity
    }));
    setShowFuelEditModal(false);
  };

  // Custom site handler
  const handleAddCustomSite = (customSite) => {
    setFormData(prev => ({
      ...prev,
      contractType: customSite
    }));
    setShowCustomSiteModal(false);
  };

  // Custom fuel store handler
  const handleCustomFuelStore = () => {
    const customStore = prompt('Enter custom fuel store name:');
    if (customStore && customStore.trim()) {
      setFormData(prev => ({
        ...prev,
        fuelStore: customStore.trim()
      }));
    }
  };

  // Shift handlers
  const handleShiftStart = () => {
    if (!formData.plantNumber) {
      alert('Please scan or enter a plant first to start your shift');
      setShowQRScanner(true);
      return;
    }

    const startTime = new Date().toLocaleString();
    setShiftStatus('ON DUTY');
    setShiftStartTime(startTime);
    setCurrentVehicle(formData.plantNumber);

    // Update vehicle status
    setVehicleStatus(prev => ({
      ...prev,
      shiftStatus: 'On Duty',
      shiftStart: startTime
    }));

    const shiftData = {
      startTime: startTime,
      plantNumber: formData.plantNumber,
      plantName: formData.plantName,
      plantType: formData.plantType
    };
    localStorage.setItem(`driver_${user.id}_shift`, JSON.stringify(shiftData));

    alert(`🚗 Shift started at ${startTime}\nVehicle: ${formData.plantNumber} - ${formData.plantName}`);
  };

  const handleShiftEnd = () => {
    const endTime = new Date().toLocaleString();
    const startTime = shiftStartTime;
    
    const duration = startTime ? 
      `${Math.round((new Date() - new Date(startTime)) / (1000 * 60 * 60))} hours` : 
      'N/A';

    setShiftStatus('OFF DUTY');
    setShiftStartTime(null);
    setCurrentVehicle(null);
    
    // Update vehicle status
    setVehicleStatus(prev => ({
      ...prev,
      shiftStatus: 'Off Duty',
      shiftStart: null
    }));
    
    localStorage.removeItem(`driver_${user.id}_shift`);

    alert(`🏁 Shift ended at ${endTime}\nDuration: ${duration}\nVehicle: ${formData.plantNumber || 'N/A'}`);
  };

  // Fuel transaction submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.plantNumber || !formData.fuelQuantity || !formData.fuelStore) {
        throw new Error('Please fill in all required fields');
      }

      if (shiftStatus === 'OFF DUTY') {
        throw new Error('Please start your shift before recording transactions');
      }

      // Create odometer photos data
      const odometerPhotosData = {
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
      };

      const transaction = transactionService.saveTransaction({
        plantNumber: formData.plantNumber,
        plantName: formData.plantName,
        plantType: formData.plantType,
        fuelQuantity: formData.fuelQuantity,
        fuelStore: formData.fuelStore,
        odometerKilos: formData.odometerKilos,
        odometerHours: formData.odometerHours,
        odometerPhotos: odometerPhotosData,
        transactionType: formData.transactionType,
        contractType: formData.contractType,
        receiverName: formData.receiverName,
        receiverCompany: formData.receiverCompany,
        employmentNumber: formData.employmentNumber,
        transactionDate: formData.transactionDate,
        remarks: formData.remarks,
        shiftStatus: shiftStatus,
        driverName: user.fullName,
        timestamp: new Date().toISOString(),
        folderPath: `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`
      }, user);

      setTransactions(prev => [transaction, ...prev]);

      // Reset form but keep plant info
      setFormData(prev => ({
        ...prev,
        fuelQuantity: '',
        odometerKilos: '',
        odometerHours: '',
        odometerKilosPhotoId: null,
        odometerHoursPhotoId: null,
        odometerKilosPhotoName: '',
        odometerHoursPhotoName: '',
        odometerKilosPhotoPath: '',
        odometerHoursPhotoPath: '',
        contractType: '',
        remarks: ''
      }));

      // Clear odometer photos for next transaction
      setOdometerPhotos({ kilos: null, hours: null });

      setSuccessMessage('Fuel transaction recorded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      window.alert(error.message || 'Failed to record transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Camera functions (for fuel slip)
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Camera access denied. Please allow camera permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    const video = videoRef.current;
    
    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        // Save fuel slip photo to IndexedDB
        const now = new Date();
        const folderPath = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/`;
        const fuelSlipPhoto = {
          photoId: Date.now(),
          filename: `fuel_slip_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.jpg`,
          timestamp: now.toISOString(),
          plantNumber: formData.plantNumber,
          folderPath: folderPath,
          type: 'fuel_slip',
          userId: user.id
        };
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = async () => {
          fuelSlipPhoto.base64Data = reader.result;
          fuelSlipPhoto.fileSize = blob.size;
          
          try {
            await savePhotoToDatabase(fuelSlipPhoto);
            alert('✅ Fuel slip saved to database!');
          } catch (error) {
            alert('❌ Failed to save fuel slip: ' + error.message);
          }
        };
        reader.readAsDataURL(blob);
        
        closeCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowReceiptCamera(false);
  };

  const openCameraModal = () => {
    setShowReceiptCamera(true);
    setTimeout(() => {
      startCamera();
    }, 300);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Save to IndexedDB
      const now = new Date();
      const folderPath = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/`;
      
      const reader = new FileReader();
      reader.onload = async () => {
        const fuelSlipPhoto = {
          photoId: Date.now(),
          filename: file.name,
          originalName: file.name,
          base64Data: reader.result,
          timestamp: now.toISOString(),
          plantNumber: formData.plantNumber,
          folderPath: folderPath,
          fileSize: file.size,
          type: 'fuel_slip',
          userId: user.id,
          metadata: {
            uploadedBy: user.id,
            uploadTime: now.toISOString(),
            device: navigator.userAgent.substring(0, 100)
          }
        };
        
        try {
          await savePhotoToDatabase(fuelSlipPhoto);
          alert('✅ Fuel slip uploaded and saved to database!');
        } catch (error) {
          alert('❌ Failed to save fuel slip: ' + error.message);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  // Format time display
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Navigation handler
  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
  };

  // Debug function to check storage
  const debugStorage = async () => {
    console.log('=== STORAGE DEBUG ===');
    
    // Check IndexedDB
    try {
      const photos = await getAllPhotosFromDatabase();
      const folders = await getAllFoldersFromDatabase();
      
      console.log('IndexedDB Photos:', photos.length);
      console.log('IndexedDB Folders:', folders.length);
      console.log('Photos sample:', photos.slice(0, 3));
      
      alert(`IndexedDB: ${photos.length} photos, ${folders.length} folders\nCheck console for details.`);
    } catch (error) {
      console.error('Debug error:', error);
      alert('Error checking storage. See console.');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh' 
    }}>
    
      {/* Header with Navigation */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        {/* Top Bar */}
        <div style={{ 
          padding: '15px 25px',
          backgroundColor: '#1b5e20',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: 'white', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1b5e20',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {user.fullName?.charAt(0) || 'D'}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>Driver Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.9 }}>👤 {user.fullName}</span>
                  <span style={{ fontSize: '13px', opacity: 0.9 }}>• #{user.employeeNumber || 'N/A'}</span>
                  <div style={{ 
                    padding: '2px 8px', 
                    backgroundColor: shiftStatus === 'ON DUTY' ? '#4caf50' : '#757575',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {shiftStatus === 'ON DUTY' ? '🟢 ON DUTY' : '⚫ OFF DUTY'}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              
              {user.role === 'admin' && (
                <button 
                  onClick={onNavigateToAdmin}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  👨‍💼 Admin Panel
                </button>
              )}
              <button 
                onClick={onLogout}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '0 25px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => handleNavClick('dashboard')}
              style={{ 
                padding: '15px 20px',
                backgroundColor: activeNav === 'dashboard' ? 'white' : 'transparent',
                color: activeNav === 'dashboard' ? '#1b5e20' : '#666',
                border: 'none',
                borderBottom: activeNav === 'dashboard' ? '3px solid #1b5e20' : 'none',
                cursor: 'pointer',
                fontWeight: activeNav === 'dashboard' ? '600' : '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🏠 Dashboard
            </button>
            
            <button
              onClick={() => handleNavClick('history')}
              style={{ 
                padding: '15px 20px',
                backgroundColor: activeNav === 'history' ? 'white' : 'transparent',
                color: activeNav === 'history' ? '#1b5e20' : '#666',
                border: 'none',
                borderBottom: activeNav === 'history' ? '3px solid #1b5e20' : 'none',
                cursor: 'pointer',
                fontWeight: activeNav === 'history' ? '600' : '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📋 History
            </button>
            
            <button
              onClick={() => handleNavClick('profile')}
              style={{ 
                padding: '15px 20px',
                backgroundColor: activeNav === 'profile' ? 'white' : 'transparent',
                color: activeNav === 'profile' ? '#1b5e20' : '#666',
                border: 'none',
                borderBottom: activeNav === 'profile' ? '3px solid #1b5e20' : 'none',
                cursor: 'pointer',
                fontWeight: activeNav === 'profile' ? '600' : '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              👤 Profile
            </button>
          </div>
        </div>

        {/* Current Vehicle Info */}
        {currentVehicle && (
          <div style={{ 
            padding: '10px 25px',
            backgroundColor: '#e8f5e8',
            borderBottom: '1px solid #c8e6c9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#1b5e20', fontWeight: '600' }}>🚗 Current Vehicle:</span>
              <span style={{ color: '#2e7d32', fontWeight: '600' }}>{currentVehicle}</span>
              {formData.plantName && (
                <span style={{ color: '#666', fontSize: '14px' }}>- {formData.plantName}</span>
              )}
              {shiftStartTime && (
                <span style={{ marginLeft: 'auto', color: '#666', fontSize: '12px' }}>
                  Shift started: {formatTime(shiftStartTime)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div style={{ 
          backgroundColor: '#4caf50', 
          color: 'white', 
          padding: '12px 20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {successMessage}
        </div>
      )}

      {/* Main Content */}
      {activeNav === 'dashboard' ? (
        <>
          {/* Quick Actions */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '15px', 
            marginBottom: '25px' 
          }}>
            {/* Shift Actions */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '18px' }}>Shift Management</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <button 
                  onClick={handleShiftStart}
                  disabled={shiftStatus === 'ON DUTY'}
                  style={{ 
                    padding: '15px',
                    backgroundColor: shiftStatus === 'ON DUTY' ? '#e0e0e0' : '#1b5e20',
                    color: shiftStatus === 'ON DUTY' ? '#666' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  🚗 {shiftStatus === 'ON DUTY' ? 'Shift Started' : 'Begin Shift'}
                </button>
                
                <button 
                  onClick={handleShiftEnd}
                  disabled={shiftStatus === 'OFF DUTY'}
                  style={{ 
                    padding: '15px',
                    backgroundColor: shiftStatus === 'OFF DUTY' ? '#e0e0e0' : '#f57c00',
                    color: shiftStatus === 'OFF DUTY' ? '#666' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: shiftStatus === 'OFF DUTY' ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  🏁 {shiftStatus === 'OFF DUTY' ? 'Not on Shift' : 'End Shift'}
                </button>
              </div>
              
              {shiftStartTime && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #e1f5fe'
                }}>
                  <div style={{ fontSize: '14px', color: '#0277bd' }}>
                    <strong>Shift started:</strong> {shiftStartTime}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '18px' }}>Current Vehicle</h3>
              {formData.plantNumber ? (
                <div style={{ 
                  backgroundColor: '#e8f5e8',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid #4caf50'
                }}>
                  <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                    <div><strong>Fleet Number:</strong> {formData.plantNumber}</div>
                    <div><strong>Type:</strong> {formData.plantType}</div>
                    <div><strong>Description:</strong> {formData.plantName}</div>
                  </div>
                  <button 
                    onClick={() => setShowQRScanner(true)}
                    style={{ 
                      marginTop: '15px',
                      padding: '8px 15px',
                      backgroundColor: '#1b5e20',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    📱 Change Vehicle
                  </button>
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center',
                  padding: '30px 20px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚗</div>
                  <p style={{ color: '#666', marginBottom: '15px' }}>No vehicle selected</p>
                  <button 
                    onClick={() => setShowQRScanner(true)}
                    style={{ 
                      padding: '12px 20px',
                      backgroundColor: '#1b5e20',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📱 Scan/Enter Vehicle
                  </button>
                </div>
              )}
            </div>

            {/* Photo Gallery & Quick Tools */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '18px' }}>Photo Tools</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <button 
                  onClick={() => setShowPhotoGallery(true)}
                  style={{ 
                    padding: '15px',
                    backgroundColor: '#7b1fa2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  📁 View Photo Gallery
                </button>
                
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button 
                    onClick={openCameraModal}
                    style={{ 
                      padding: '12px',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    📷 Fuel Slip
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      padding: '12px',
                      backgroundColor: '#db2777',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    📁 Upload
                  </button>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Vehicle Status Component */}
          {currentVehicle && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '25px'
            }}>
              <h3 style={{ color: '#1e88e5', marginBottom: '20px', fontSize: '20px' }}>🚗 Vehicle Status</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                {[
                  { label: 'Current Odometer', value: vehicleStatus.currentOdometer + ' KM', emoji: '📊' },
                  { label: 'Fuel Level', value: vehicleStatus.fuelLevel + '%', emoji: '⛽', color: vehicleStatus.fuelLevel < 20 ? '#d32f2f' : '#2e7d32' },
                  { label: 'Shift Status', value: vehicleStatus.shiftStatus, emoji: vehicleStatus.shiftStatus === 'On Duty' ? '🟢' : '⚫', color: vehicleStatus.shiftStatus === 'On Duty' ? '#2e7d32' : '#757575' },
                  { label: 'Range', value: vehicleStatus.range + ' km', emoji: '🛣️' },
                  { label: 'Consumption', value: vehicleStatus.consumption + ' km/L', emoji: '⚡' },
                  { label: 'Last Refuel', value: vehicleStatus.lastRefuel, emoji: '🕒' },
                  { label: 'Today Distance', value: getTodayDistance() + ' km', emoji: '📈' },
                  { label: 'Next Service', value: vehicleStatus.nextService, emoji: '🔧' }
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{item.emoji}</span>
                      {item.label}
                    </span>
                    <span style={{ color: item.color || '#1e88e5', fontWeight: '600', fontSize: '16px' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              
              {vehicleStatus.shiftStart && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #e1f5fe'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0277bd' }}>Shift Information</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Started: {vehicleStatus.shiftStart}
                      </div>
                    </div>
                    <button 
                      onClick={handleShiftEnd}
                      style={{ 
                        padding: '8px 16px',
                        backgroundColor: '#f57c00',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      End Shift
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fuel Transaction Form with Enhanced Odometer Section */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '20px', fontSize: '20px' }}>⛽ New Fuel Transaction</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                {/* Column 1 */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Plant Number *</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        value={formData.plantNumber}
                        onChange={(e) => setFormData({...formData, plantNumber: e.target.value})}
                        placeholder="Scan or enter vehicle number"
                        style={{ 
                          flex: 1, 
                          padding: '12px', 
                          border: formData.plantNumber ? '2px solid #4caf50' : '1px solid #ddd', 
                          borderRadius: '6px', 
                          fontSize: '14px' 
                        }}
                        required
                        readOnly={shiftStatus === 'ON DUTY'}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowQRScanner(true)}
                        disabled={shiftStatus === 'ON DUTY'}
                        style={{ 
                          padding: '12px 20px',
                          backgroundColor: shiftStatus === 'ON DUTY' ? '#ccc' : '#1b5e20',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        📱 Scan
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px', position: 'relative' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Fuel Quantity (L) *
                      <button 
                        type="button"
                        onClick={() => setShowFuelEditModal(true)}
                        style={{
                          marginLeft: '10px',
                          padding: '2px 8px',
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                    </label>
                    <input
                      type="number"
                      value={formData.fuelQuantity}
                      onChange={(e) => setFormData({...formData, fuelQuantity: e.target.value})}
                      placeholder="Enter liters"
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                      required
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Fuel Store *</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={formData.fuelStore}
                        onChange={(e) => setFormData({...formData, fuelStore: e.target.value})}
                        style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                        required
                      >
                        <option value="">Select Store</option>
                        <option value="SASOL FLEET">SASOL FLEET</option>
                        <option value="STANDARD BANK FLEET">STANDARD BANK FLEET</option>
                        <option value="CUSTOM">CUSTOM</option>
                      </select>
                      {formData.fuelStore === 'CUSTOM' && (
                        <button 
                          type="button" 
                          onClick={handleCustomFuelStore}
                          style={{ 
                            padding: '12px 15px',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Custom
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2 - Enhanced Odometer Section */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Odometer (KM)
                      {formData.odometerKilosPhotoName && (
                        <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px', fontWeight: 'normal' }}>
                          📷 Photo attached
                        </span>
                      )}
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="number"
                        value={formData.odometerKilos}
                        onChange={(e) => setFormData({...formData, odometerKilos: e.target.value})}
                        placeholder="Enter or scan"
                        style={{ 
                          flex: 1, 
                          padding: '12px', 
                          border: formData.odometerKilosPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                          borderRadius: '6px', 
                          fontSize: '14px' 
                        }}
                        step="0.1"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowOdometerModal('kilos')}
                        style={{ 
                          padding: '12px 15px',
                          backgroundColor: formData.odometerKilosPhotoName ? '#4caf50' : '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {formData.odometerKilosPhotoName ? '📷 Edit' : '📸 Add Photo'}
                      </button>
                    </div>
                    {formData.odometerKilosPhotoName && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', paddingLeft: '5px' }}>
                        Photo: {formData.odometerKilosPhotoName}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Hours
                      {formData.odometerHoursPhotoName && (
                        <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px', fontWeight: 'normal' }}>
                          📷 Photo attached
                        </span>
                      )}
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="number"
                        value={formData.odometerHours}
                        onChange={(e) => setFormData({...formData, odometerHours: e.target.value})}
                        placeholder="Enter hours"
                        style={{ 
                          flex: 1, 
                          padding: '12px', 
                          border: formData.odometerHoursPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                          borderRadius: '6px', 
                          fontSize: '14px' 
                        }}
                        step="0.1"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowOdometerModal('hours')}
                        style={{ 
                          padding: '12px 15px',
                          backgroundColor: formData.odometerHoursPhotoName ? '#4caf50' : '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {formData.odometerHoursPhotoName ? '📷 Edit' : '⏱️ Add Photo'}
                      </button>
                    </div>
                    {formData.odometerHoursPhotoName && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', paddingLeft: '5px' }}>
                        Photo: {formData.odometerHoursPhotoName}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Contract/Site</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={formData.contractType}
                        onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                        style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                      >
                        <option value="">Select Contract</option>
                        <option value="AMPLANT 49">AMPLANT 49</option>
                        <option value="HILLARY (Site 2163)">HILLARY (Site 2163)</option>
                        <option value="HILLARY (Site 2102)">HILLARY (Site 2102)</option>
                        <option value="Polokwane Surfacing (Site 1809)">Polokwane Surfacing (Site 1809)</option>
                        <option value="Custom Site">Custom Site</option>
                      </select>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomSiteModal(true)}
                        style={{ 
                          padding: '12px 15px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Driver Information</label>
                    <div style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '12px', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      <div><strong>Name:</strong> {user.fullName}</div>
                      <div><strong>Employee #:</strong> {user.employeeNumber || 'N/A'}</div>
                      <div><strong>Company:</strong> {user.company || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Remarks</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      placeholder="Additional notes..."
                      rows="3"
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber}
                  style={{ 
                    padding: '15px 40px',
                    backgroundColor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? '#ccc' : '#1b5e20',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isLoading ? 'Recording...' : '📝 Record Fuel Transaction'}
                </button>
                {shiftStatus === 'OFF DUTY' && (
                  <p style={{ color: '#d32f2f', marginTop: '10px', fontSize: '14px' }}>
                    Please start your shift before recording transactions
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Recent Transactions */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '20px', fontSize: '20px' }}>📋 Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>⛽</div>
                <p>No transactions recorded yet</p>
                <p style={{ fontSize: '14px', color: '#999' }}>Start your shift and record your first transaction</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Store</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Odometer</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Contract</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Photos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{transaction.transactionDate}</td>
                        <td style={{ padding: '12px', fontWeight: '600', color: '#1b5e20' }}>
                          {transaction.plantNumber}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#2e7d32' }}>
                          {transaction.fuelQuantity}L
                        </td>
                        <td style={{ padding: '12px' }}>{transaction.fuelStore}</td>
                        <td style={{ padding: '12px' }}>
                          {transaction.odometerKilos ? `${transaction.odometerKilos} KM` : '-'}
                          {transaction.odometerHours ? ` / ${transaction.odometerHours} hrs` : ''}
                        </td>
                        <td style={{ padding: '12px' }}>{transaction.contractType || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          {transaction.odometerPhotos?.kilos?.photoName || transaction.odometerPhotos?.hours?.photoName ? (
                            <span style={{ color: '#4caf50' }}>📷</span>
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : activeNav === 'history' ? (
        // Transaction History View
        <div style={{ 
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#1b5e20', marginBottom: '20px', fontSize: '20px' }}>📋 All Transactions</h3>
          {transactions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
              <p>No transaction history available</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date & Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel (L)</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Store</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Photos</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{new Date(transaction.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#1b5e20' }}>
                        {transaction.plantNumber}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#2e7d32' }}>
                        {transaction.fuelQuantity}L
                      </td>
                      <td style={{ padding: '12px' }}>{transaction.fuelStore}</td>
                      <td style={{ padding: '12px' }}>
                        {transaction.odometerPhotos?.kilos?.photoName || transaction.odometerPhotos?.hours?.photoName ? (
                          <span style={{ color: '#4caf50' }}>📷</span>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px',
                          backgroundColor: transaction.shiftStatus === 'ON DUTY' ? '#e8f5e8' : '#f5f5f5',
                          color: transaction.shiftStatus === 'ON DUTY' ? '#1b5e20' : '#666',
                          fontSize: '12px'
                        }}>
                          {transaction.shiftStatus || 'OFF DUTY'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Profile View
        <div style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            👤
          </div>
          <h3 style={{ color: '#1b5e20', marginBottom: '10px' }}>
            Driver Profile
          </h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            maxWidth: '400px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Name:</strong> {user.fullName}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Employee #:</strong> {user.employeeNumber || 'N/A'}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Company:</strong> {user.company || 'N/A'}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Role:</strong> {user.role || 'Driver'}
            </div>
            <div>
              <strong>Total Transactions:</strong> {transactions.length}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showQRScanner && (
        <QRScanner 
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {showOdometerModal && (
        <OdometerPhotoUpload
          onPhotoUpload={handleOdometerUpload}
          onClose={() => setShowOdometerModal(null)}
          type={showOdometerModal}
          currentValue={showOdometerModal === 'kilos' ? formData.odometerKilos : formData.odometerHours}
          plantNumber={formData.plantNumber}
          transactionId={Date.now()}
          userId={user?.id}
        />
      )}

      {showPhotoGallery && (
        <PhotoGalleryModal
          onClose={() => {
            setShowPhotoGallery(false);
          }}
          userId={user?.id}
        />
      )}

      {showFuelEditModal && (
        <FuelEditModal
          currentQuantity={formData.fuelQuantity}
          onSave={handleFuelQuantityEdit}
          onClose={() => setShowFuelEditModal(false)}
        />
      )}

      {showCustomSiteModal && (
        <CustomSiteModal
          onSave={handleAddCustomSite}
          onClose={() => setShowCustomSiteModal(false)}
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
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '15px', textAlign: 'center' }}>
            📷 Capture Fuel Slip
          </h3>
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              maxHeight: '60vh',
              borderRadius: '8px',
              transform: 'scaleX(-1)',
              border: '2px solid #ddd'
            }}
          />
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
            <button
              onClick={capturePhoto}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2e7d32',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              📸 Capture
            </button>
            
            <button
              onClick={closeCamera}
              style={{
                padding: '12px 24px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
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
      
        {/* ==================== FOOTER ==================== */}
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #e0e0e0',
          padding: '20px 30px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
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

export default DriverDashboard;