
import React, { useState, useRef, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import QRScanner from '../qr/QRScanner';
import { plantMasterList } from './plantMasterList';

// ==================== INDEXEDDB SETUP ====================

// Initialize IndexedDB for photo storage
const initPhotoDatabase = async () => {
  return new Promise((resolve, reject) => {
    // Remove version number to prevent version conflict
    const request = indexedDB.open('FleetPhotoDatabase');
    
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
        dimensions: { width: 0, height: 0 },
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
        thumbnail: savedPhoto.thumbnail
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

// Custom Fuel Store Modal Component
const CustomFuelStoreModal = ({ onSave, onClose }) => {
  const [storeName, setStoreName] = useState('');
  const [storeNumber, setStoreNumber] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!storeName.trim()) {
      setError('Please enter a fuel store name');
      return;
    }
    
    const customFuelStore = storeNumber.trim() 
      ? `${storeName} (${storeNumber})`
      : storeName;
    
    onSave(customFuelStore);
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
          <h3 style={{ margin: 0, color: '#1b5e20' }}>⛽ Add Custom Fuel Store</h3>
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
            Fuel Store Name: *
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => {
              setStoreName(e.target.value);
              setError('');
            }}
            placeholder="Enter fuel store name..."
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
            Store Number (Optional):
          </label>
          <input
            type="text"
            value={storeNumber}
            onChange={(e) => setStoreNumber(e.target.value)}
            placeholder="Enter store number..."
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
            disabled={!storeName.trim()}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: storeName.trim() ? '#1b5e20' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: storeName.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Add Store
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

// ==================== NEW COMPONENTS FOR SHIFT MANAGEMENT ====================

// Signature Modal Component
const SignatureModal = ({ onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1b5e20';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    setSignatureData(canvas.toDataURL());
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSave = () => {
    if (!signatureData) {
      alert('Please provide your signature');
      return;
    }
    onSave(signatureData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20' }}>✍️ Driver Signature</h3>
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

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Please sign in the box below to acknowledge your shift
          </p>
          
          <div style={{
            border: '2px solid #1b5e20',
            borderRadius: '8px',
            backgroundColor: 'white',
            marginBottom: '15px',
            overflow: 'hidden'
          }}>
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                canvasRef.current.dispatchEvent(mouseEvent);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                canvasRef.current.dispatchEvent(mouseEvent);
              }}
              onTouchEnd={stopDrawing}
              style={{
                width: '100%',
                height: '200px',
                cursor: 'crosshair',
                touchAction: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
            <button 
              onClick={clearSignature}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button 
            onClick={handleSave}
            disabled={!signatureData}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: signatureData ? '#1b5e20' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: signatureData ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ✅ Acknowledge & Save
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

// Breakdown Tracking Modal
const BreakdownModal = ({ onSave, onClose, shiftStartTime }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5);
    setStartTime(currentTime);
    
    // Set end time to 1 hour from now by default
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setEndTime(oneHourLater.toTimeString().substring(0, 5));
  }, []);

  const handleSave = () => {
    if (!startTime || !endTime) {
      setError('Please enter both start and end times');
      return;
    }
    
    if (!reason.trim()) {
      setError('Please enter a breakdown reason');
      return;
    }
    
    // Calculate hours
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);
    
    if (hours < 0) {
      setError('End time must be after start time');
      return;
    }
    
    onSave({
      startTime,
      endTime,
      reason,
      hours: hours.toFixed(1)
    });
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
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#d32f2f' }}>⚠️ Truck Breakdown</h3>
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
            Breakdown Start Time: *
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d32f2f',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Breakdown End Time: *
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d32f2f',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            required
          />
          {startTime && endTime && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Duration: {((new Date(`2000-01-01T${endTime}`) - new Date(`2000-01-01T${startTime}`)) / (1000 * 60 * 60)).toFixed(1)} hours
            </div>
          )}
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Breakdown Reason: *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the breakdown issue..."
            rows="3"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
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
            disabled={!startTime || !endTime || !reason.trim()}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: (startTime && endTime && reason.trim()) ? '#d32f2f' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: (startTime && endTime && reason.trim()) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🚨 Flag Breakdown
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

// End Shift Confirmation Modal
const EndShiftModal = ({ 
  onConfirm, 
  onClose, 
  shiftData,
  odometerKilos,
  odometerHours,
  onOdometerScan
}) => {
  const [showOdometerModal, setShowOdometerModal] = useState(null);
  const [endOdometerKilos, setEndOdometerKilos] = useState(odometerKilos || '');
  const [endOdometerHours, setEndOdometerHours] = useState(odometerHours || '');
  const [closingRemarks, setClosingRemarks] = useState('');
  const [error, setError] = useState('');

  const handleOdometerUpload = (result) => {
    const { type, value } = result;
    if (type === 'kilos') {
      setEndOdometerKilos(value);
    } else {
      setEndOdometerHours(value);
    }
    setShowOdometerModal(null);
  };

  const handleConfirm = () => {
    if (!endOdometerKilos && !endOdometerHours) {
      setError('Please provide at least one odometer reading (KM or Hours)');
      return;
    }
    
    onConfirm({
      endOdometerKilos,
      endOdometerHours,
      closingRemarks,
      endTime: new Date().toISOString()
    });
    onClose();
  };

  const calculateShiftHours = () => {
    if (!shiftData?.startTime) return '0';
    const start = new Date(shiftData.startTime);
    const end = new Date();
    const hours = (end - start) / (1000 * 60 * 60);
    return hours.toFixed(1);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
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
          <h3 style={{ margin: 0, color: '#1b5e20' }}>🏁 End Shift Confirmation</h3>
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

        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>Shift Start</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1b5e20' }}>
                {shiftData?.startTime ? new Date(shiftData.startTime).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>Shift Duration</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1b5e20' }}>
                {calculateShiftHours()} hours
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>Vehicle</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {shiftData?.plantNumber || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>Driver</div>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {shiftData?.driverName || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#333', marginBottom: '15px' }}>📏 End of Shift Odometer Readings</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                Final Kilometers:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  value={endOdometerKilos}
                  onChange={(e) => setEndOdometerKilos(e.target.value)}
                  placeholder="Enter KM"
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    border: '1px solid #ddd', 
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
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📸
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                Final Hours:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  value={endOdometerHours}
                  onChange={(e) => setEndOdometerHours(e.target.value)}
                  placeholder="Enter hours"
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    border: '1px solid #ddd', 
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
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📸
                </button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
            Note: At least one reading (KM or Hours) is required to end shift
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
            Closing Remarks:
          </label>
          <textarea
            value={closingRemarks}
            onChange={(e) => setClosingRemarks(e.target.value)}
            placeholder="Any notes about the shift..."
            rows="3"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
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
            onClick={handleConfirm}
            disabled={!endOdometerKilos && !endOdometerHours}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: (endOdometerKilos || endOdometerHours) ? '#1b5e20' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: (endOdometerKilos || endOdometerHours) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ✅ Confirm End Shift
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

const DriverDashboard = ({ user, onLogout, onNavigateToAdmin, onNavigateToMachineLogBook }) => {
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

  // Shift Management State
  const [shiftStatus, setShiftStatus] = useState('OFF DUTY');
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [shiftEndTime, setShiftEndTime] = useState(null);
  const [shiftData, setShiftData] = useState(null);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  
  // Breakdown Tracking State
  const [breakdowns, setBreakdowns] = useState([]);
  const [isOnBreakdown, setIsOnBreakdown] = useState(false);
  const [breakdownStartTime, setBreakdownStartTime] = useState(null);
  
  // Signature State
  const [driverSignature, setDriverSignature] = useState(null);
  const [signatureTimestamp, setSignatureTimestamp] = useState(null);
  
  // Custom Sites State
  const [customSites, setCustomSites] = useState([]);
  
  // Custom Fuel Stores State
  const [customFuelStores, setCustomFuelStores] = useState([]);
  
  // Modal States
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showReceiptCamera, setShowReceiptCamera] = useState(false);
  const [showFuelEditModal, setShowFuelEditModal] = useState(false);
  const [showCustomSiteModal, setShowCustomSiteModal] = useState(false);
  const [showCustomFuelStoreModal, setShowCustomFuelStoreModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [showFuelStoreQRScanner, setShowFuelStoreQRScanner] = useState(false);
  
  // Other States
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [odometerPhotos, setOdometerPhotos] = useState({
    kilos: null,
    hours: null
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState(5);

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

  // Calculate pagination variables
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Function to handle page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table for better UX
    window.scrollTo({
      top: document.querySelector('.transactions-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Function to render pagination buttons
  const renderPagination = () => {
    if (transactions.length <= transactionsPerPage) return null;
    
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    const maxVisiblePages = 5;
    let startPage, endPage;
    
    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '8px',
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            backgroundColor: currentPage === 1 ? '#e0e0e0' : '#1b5e20',
            color: currentPage === 1 ? '#666' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ← Previous
        </button>
        
        {/* First Page */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'white',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentPage === 1 ? '600' : '400'
              }}
            >
              1
            </button>
            {startPage > 2 && <span style={{ color: '#666' }}>...</span>}
          </>
        )}
        
        {/* Page Numbers */}
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === number ? '#1b5e20' : 'white',
              color: currentPage === number ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: currentPage === number ? '600' : '400',
              minWidth: '36px'
            }}
          >
            {number}
          </button>
        ))}
        
        {/* Last Page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ color: '#666' }}>...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'white',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentPage === totalPages ? '600' : '400'
              }}
            >
              {totalPages}
            </button>
          </>
        )}
        
        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#1b5e20',
            color: currentPage === totalPages ? '#666' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          Next →
        </button>
      </div>
    );
  };

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

  // Initialize data
  useEffect(() => {
    // Load user's recent transactions
    const userTransactions = transactionService.getAllTransactions()
      .filter(t => t.userId === user.id)
      .slice(0, 10);
    setTransactions(userTransactions);

    // Load shift data from localStorage
    const savedShift = localStorage.getItem(`driver_${user.id}_shift`);
    if (savedShift) {
      const shiftData = JSON.parse(savedShift);
      setShiftStatus('ON DUTY');
      setShiftStartTime(shiftData.startTime);
      setShiftData(shiftData);
      setCurrentVehicle(shiftData.plantNumber);
      
      // Load odometer readings from shift data
      if (shiftData.startOdometerKilos) {
        setFormData(prev => ({
          ...prev,
          odometerKilos: shiftData.startOdometerKilos
        }));
      }
      if (shiftData.startOdometerHours) {
        setFormData(prev => ({
          ...prev,
          odometerHours: shiftData.startOdometerHours
        }));
      }
      
      // Load signature if exists
      if (shiftData.signature) {
        setDriverSignature(shiftData.signature);
        setSignatureTimestamp(shiftData.signatureTimestamp);
      }
      
      // Load breakdowns if exists
      if (shiftData.breakdowns) {
        setBreakdowns(shiftData.breakdowns);
        setIsOnBreakdown(shiftData.isOnBreakdown || false);
      }
      
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
    
    // Load custom sites from localStorage
    const savedCustomSites = localStorage.getItem(`driver_${user.id}_customSites`);
    if (savedCustomSites) {
      setCustomSites(JSON.parse(savedCustomSites));
    }
    
    // Load custom fuel stores from localStorage
    const savedCustomFuelStores = localStorage.getItem(`driver_${user.id}_customFuelStores`);
    if (savedCustomFuelStores) {
      setCustomFuelStores(JSON.parse(savedCustomFuelStores));
    }
  }, [user.id]);

  // Helper function for today's distance
  const getTodayDistance = () => {
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(t => 
      new Date(t.transactionDate).toDateString() === today
    );
    return todayTransactions.reduce((sum, t) => sum + (parseFloat(t.odometerKilos) || 0), 0);
  };

  // QR Scan handler for vehicle
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

  // QR Scan handler for fuel store - UPDATED
  const handleFuelStoreQRScan = (scannedData) => {
    let fuelStore = '';
    
    if (typeof scannedData === 'string') {
      try {
        const parsedData = JSON.parse(scannedData);
        fuelStore = parsedData.storeName || parsedData.name || scannedData;
      } catch (error) {
        fuelStore = scannedData;
      }
    }
    
    // Check if this is a custom store not in the list
    if (fuelStore !== 'SASOL FLEET' && fuelStore !== 'STANDARD BANK FLEET' && 
        !customFuelStores.includes(fuelStore)) {
      // Add to custom stores
      const updatedStores = [...customFuelStores, fuelStore];
      setCustomFuelStores(updatedStores);
      localStorage.setItem(`driver_${user.id}_customFuelStores`, JSON.stringify(updatedStores));
    }
    
    setFormData(prev => ({
      ...prev,
      fuelStore: fuelStore
    }));
    
    setShowFuelStoreQRScanner(false);
    alert(`✅ Fuel store scanned: ${fuelStore}`);
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
    // Add the new custom site to the list
    const updatedCustomSites = [...customSites, customSite];
    setCustomSites(updatedCustomSites);
    
    // Save to localStorage
    localStorage.setItem(`driver_${user.id}_customSites`, JSON.stringify(updatedCustomSites));
    
    // Set the current value
    setFormData(prev => ({
      ...prev,
      contractType: customSite
    }));
    
    setShowCustomSiteModal(false);
    
    alert(`✅ Custom site added: ${customSite}`);
  };

  // Custom fuel store handler
  const handleAddCustomFuelStore = (customStore) => {
    // Add the new custom fuel store to the list
    const updatedCustomStores = [...customFuelStores, customStore];
    setCustomFuelStores(updatedCustomStores);
    
    // Save to localStorage
    localStorage.setItem(`driver_${user.id}_customFuelStores`, JSON.stringify(updatedCustomStores));
    
    // Set the current value
    setFormData(prev => ({
      ...prev,
      fuelStore: customStore
    }));
    
    setShowCustomFuelStoreModal(false);
    
    alert(`✅ Custom fuel store added: ${customStore}`);
  };

  // Signature handler
  const handleSignatureSave = (signatureData) => {
    setDriverSignature(signatureData);
    setSignatureTimestamp(new Date().toISOString());
    setShowSignatureModal(false);
    
    // Save to shift data
    if (shiftData) {
      const updatedShiftData = {
        ...shiftData,
        signature: signatureData,
        signatureTimestamp: new Date().toISOString()
      };
      localStorage.setItem(`driver_${user.id}_shift`, JSON.stringify(updatedShiftData));
      setShiftData(updatedShiftData);
    }
    
    alert('✅ Signature saved successfully!');
  };

  // Breakdown handler
  const handleBreakdownSave = (breakdownData) => {
    const newBreakdown = {
      ...breakdownData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      shiftId: shiftData?.id,
      startTimestamp: new Date(`2000-01-01T${breakdownData.startTime}`).toISOString(),
      endTimestamp: new Date(`2000-01-01T${breakdownData.endTime}`).toISOString()
    };
    
    const updatedBreakdowns = [...breakdowns, newBreakdown];
    setBreakdowns(updatedBreakdowns);
    setIsOnBreakdown(false); // Reset breakdown flag after saving

    // Save to shift data
    if (shiftData) {
      const updatedShiftData = {
        ...shiftData,
        breakdowns: updatedBreakdowns,
        isOnBreakdown: true
      };
      localStorage.setItem(`driver_${user.id}_shift`, JSON.stringify(updatedShiftData));
      setShiftData(updatedShiftData);
    }
    
    alert(`⚠️ Breakdown flagged: ${breakdownData.reason} (${breakdownData.hours} hours)`);
  };

  // helper function if vehicle happen under breakdown
  const isTransactionDuringBreakdown = (transactionTime) => {
    if (!breakdowns.length) return false;
    
    const transTime = new Date(transactionTime);
    
    return breakdowns.some(breakdown => {
      const start = new Date(breakdown.startTimestamp);
      const end = new Date(breakdown.endTimestamp);
      return transTime >= start && transTime <= end;
    });
  };

  const handleEndCurrentBreakdown = () => {
    setIsOnBreakdown(false);
    alert('Breakdown status cleared. Vehicle is back in operation.');
  };
  
  // Shift start handler
  const handleShiftStart = () => {
    if (!formData.plantNumber) {
      alert('Please scan or enter a plant first to start your shift');
      setShowQRScanner(true);
      return;
    }

    // Check if odometer readings are provided
    if (!formData.odometerKilos && !formData.odometerHours) {
      alert('Please provide at least one odometer reading (KM or Hours) to start shift');
      return;
    }

    const startTime = new Date().toISOString();
    const shiftId = `shift_${Date.now()}_${user.id}`;
    
    const newShiftData = {
      id: shiftId,
      startTime: startTime,
      plantNumber: formData.plantNumber,
      plantName: formData.plantName,
      plantType: formData.plantType,
      driverName: user.fullName,
      driverId: user.id,
      startOdometerKilos: formData.odometerKilos,
      startOdometerHours: formData.odometerHours,
      odometerKilosPhotoId: formData.odometerKilosPhotoId,
      odometerHoursPhotoId: formData.odometerHoursPhotoId,
      status: 'ACTIVE',
      breakdowns: [],
      isOnBreakdown: false
    };

    setShiftStatus('ON DUTY');
    setShiftStartTime(startTime);
    setShiftData(newShiftData);
    setCurrentVehicle(formData.plantNumber);

    // Update vehicle status
    setVehicleStatus(prev => ({
      ...prev,
      shiftStatus: 'On Duty',
      shiftStart: startTime
    }));

    localStorage.setItem(`driver_${user.id}_shift`, JSON.stringify(newShiftData));

    alert(`🚗 Shift started at ${new Date(startTime).toLocaleString()}\nVehicle: ${formData.plantNumber} - ${formData.plantName}\nOdometer: ${formData.odometerKilos || '0'} KM / ${formData.odometerHours || '0'} hrs`);
  };

  // Shift end handler
  const handleShiftEnd = () => {
    setShowEndShiftModal(true);
  };

  // Confirm shift end
  const handleConfirmShiftEnd = (endData) => {
    const endTime = new Date().toISOString();
    const startTime = shiftStartTime;
    
    // Calculate shift duration in hours and minutes
    const start = new Date(startTime);
    const end = new Date();
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}h ${minutes}m`;

    // Calculate total breakdown hours
    const totalBreakdownHours = breakdowns.reduce((total, b) => total + parseFloat(b.hours || 0), 0);

    // Save shift closure data
    const shiftClosure = {
      ...shiftData,
      endTime: endTime,
      endOdometerKilos: endData.endOdometerKilos,
      endOdometerHours: endData.endOdometerHours,
      closingRemarks: endData.closingRemarks,
      totalBreakdownHours: totalBreakdownHours,
      breakdowns: breakdowns,
      signature: driverSignature,
      signatureTimestamp: signatureTimestamp,
      status: 'COMPLETED',
      duration: duration,
      totalHours: hours + (minutes / 60), // Total hours as decimal
      productiveHours: hours + (minutes / 60) - totalBreakdownHours // Hours minus breakdowns
    };

    // Save to transaction service
    try {
      transactionService.saveShiftClosure(shiftClosure, user);
    } catch (error) {
      console.error('Error saving shift closure:', error);
      // Fallback: save as regular transaction
      transactionService.saveTransaction({
        plantNumber: shiftData.plantNumber,
        plantName: shiftData.plantName,
        plantType: shiftData.plantType,
        fuelQuantity: 0,
        fuelStore: 'SHIFT_CLOSURE',
        odometerKilos: endData.endOdometerKilos,
        odometerHours: endData.endOdometerHours,
        transactionType: 'Shift Closure',
        contractType: 'Internal',
        receiverName: user.fullName,
        receiverCompany: user.company,
        employmentNumber: user.employeeNumber,
        transactionDate: new Date().toISOString().split('T')[0],
        remarks: `SHIFT CLOSED: ${endData.closingRemarks || 'No remarks'} | Breakdowns: ${totalBreakdownHours}h | Duration: ${duration}`,
        shiftStatus: 'SHIFT_ENDED',
        shiftId: shiftData?.id,
        driverName: user.fullName,
        signature: driverSignature,
        breakdownFlag: breakdowns.length > 0,
        timestamp: new Date().toISOString(),
        folderPath: `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`
      }, user);
    }

    // Reset states
    setShiftStatus('OFF DUTY');
    setShiftStartTime(null);
    setShiftEndTime(endTime);
    setShiftData(null);
    setCurrentVehicle(null);
    setBreakdowns([]);
    setIsOnBreakdown(false);
    setDriverSignature(null);
    setSignatureTimestamp(null);
    
    // Update vehicle status
    setVehicleStatus(prev => ({
      ...prev,
      shiftStatus: 'Off Duty',
      shiftStart: null
    }));
    
    // Clear form
    setFormData(prev => ({
      ...prev,
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
      contractType: '',
      remarks: ''
    }));

    localStorage.removeItem(`driver_${user.id}_shift`);

    alert(`🏁 Shift ended at ${new Date(endTime).toLocaleString()}\nDuration: ${duration}\nTotal Breakdown: ${totalBreakdownHours.toFixed(1)} hours`);
  };

  // Fuel transaction submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation checks
      if (!formData.plantNumber || !formData.fuelQuantity || !formData.fuelStore) {
        throw new Error('Please fill in all required fields');
      }

      // Validate fuel store is not empty
      if (formData.fuelStore.trim() === '') {
        throw new Error('Please select or enter a valid fuel store');
      }

      if (shiftStatus === 'OFF DUTY') {
        throw new Error('Please start your shift before recording transactions');
      }

      if (!driverSignature) {
        throw new Error('Please provide your signature before recording transactions');
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
        shiftId: shiftData?.id,
        driverName: user.fullName,
        signature: driverSignature,
        breakdownFlag: isTransactionDuringBreakdown(new Date().toISOString()),
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

  // Calculate shift duration
  const calculateShiftDuration = () => {
    if (!shiftStartTime) return '0h 0m';
    const start = new Date(shiftStartTime);
    const end = new Date();
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate total breakdown hours
  const calculateTotalBreakdownHours = () => {
    return breakdowns.reduce((total, b) => total + parseFloat(b.hours || 0), 0).toFixed(1);
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
                  {isOnBreakdown && (
                    <div style={{ 
                      padding: '2px 8px', 
                      backgroundColor: '#d32f2f',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}>
                      ⚠️ BREAKDOWN
                    </div>
                  )}
                  {isOnBreakdown && (
                    <button 
                      onClick={handleEndCurrentBreakdown}
                      style={{ 
                        padding: '6px 12px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        marginLeft: '5px'
                      }}
                    >
                      ✅ End Breakdown
                    </button>
                  )}
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

        {/* Navigation Bar - WITH MACHINE LOG BOOK BUTTON */}
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
            
            {/* MACHINE LOG BOOK BUTTON */}
            <button
              onClick={onNavigateToMachineLogBook}
              style={{ 
                padding: '15px 20px',
                backgroundColor: 'transparent',
                color: '#666',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f0f0';
                e.target.style.color = '#1b5e20';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#666';
              }}
            >
              📖 Machine Log Book
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

        {/* Current Vehicle & Shift Info */}
        {currentVehicle && (
          <div style={{ 
            padding: '10px 25px',
            backgroundColor: '#e8f5e8',
            borderBottom: '1px solid #c8e6c9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <span style={{ color: '#1b5e20', fontWeight: '600' }}>🚗 Current Vehicle:</span>
                  <span style={{ color: '#2e7d32', fontWeight: '600', marginLeft: '5px' }}>{currentVehicle}</span>
                  {formData.plantName && (
                    <span style={{ color: '#666', fontSize: '14px', marginLeft: '10px' }}>- {formData.plantName}</span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#1b5e20', fontWeight: '600' }}>⏱️ Shift Duration:</span>
                  <span style={{ color: '#2e7d32', fontWeight: '600', marginLeft: '5px' }}>{calculateShiftDuration()}</span>
                </div>
                {breakdowns.length > 0 && (
                  <div>
                    <span style={{ color: '#d32f2f', fontWeight: '600' }}>⚠️ Breakdown:</span>
                    <span style={{ color: '#d32f2f', fontWeight: '600', marginLeft: '5px' }}>{calculateTotalBreakdownHours()}h</span>
                  </div>
                )}
              </div>
              
              {shiftStartTime && (
                <span style={{ color: '#666', fontSize: '12px' }}>
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
                
                {shiftStatus === 'ON DUTY' && (
                  <>
                    <button 
                      onClick={() => setShowSignatureModal(true)}
                      style={{ 
                        padding: '15px',
                        backgroundColor: driverSignature ? '#4caf50' : '#2196f3',
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
                      {driverSignature ? '✅ Signature Done' : '✍️ Provide Signature'}
                    </button>
                    
                    <button 
                      onClick={() => setShowBreakdownModal(true)}
                      style={{ 
                        padding: '15px',
                        backgroundColor: isOnBreakdown ? '#d32f2f' : '#ff9800',
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
                      {isOnBreakdown ? '⚠️ Breakdown Active' : '🚨 Report Breakdown'}
                    </button>
                  </>
                )}
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
                    <strong>Shift started:</strong> {new Date(shiftStartTime).toLocaleString()}
                  </div>
                  {driverSignature && (
                    <div style={{ fontSize: '14px', color: '#4caf50', marginTop: '5px' }}>
                      <strong>Signature:</strong> ✓ Provided at {formatTime(signatureTimestamp)}
                    </div>
                  )}
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
                    <div><strong>Start Odometer:</strong> {formData.odometerKilos || '0'} KM / {formData.odometerHours || '0'} hrs</div>
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

          {/* Breakdown Summary */}
          {breakdowns.length > 0 && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '25px',
              border: '2px solid #ff9800'
            }}>
              <h3 style={{ color: '#d32f2f', marginBottom: '15px', fontSize: '18px' }}>⚠️ Breakdown Summary</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#ffebee' }}>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ffcdd2', fontWeight: '600', color: '#d32f2f' }}>Start</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ffcdd2', fontWeight: '600', color: '#d32f2f' }}>End</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ffcdd2', fontWeight: '600', color: '#d32f2f' }}>Duration</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ffcdd2', fontWeight: '600', color: '#d32f2f' }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdowns.map((breakdown, index) => (
                      <tr key={breakdown.id} style={{ borderBottom: '1px solid #ffcdd2' }}>
                        <td style={{ padding: '10px' }}>{breakdown.startTime}</td>
                        <td style={{ padding: '10px' }}>{breakdown.endTime}</td>
                        <td style={{ padding: '10px', fontWeight: '600', color: '#d32f2f' }}>
                          {breakdown.hours} hours
                        </td>
                        <td style={{ padding: '10px' }}>{breakdown.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: '#ffebee', 
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <strong>Total Breakdown Time:</strong> {calculateTotalBreakdownHours()} hours
              </div>
            </div>
          )}

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
                        Started: {new Date(vehicleStatus.shiftStart).toLocaleString()}
                      </div>
                      {breakdowns.length > 0 && (
                        <div style={{ fontSize: '14px', color: '#d32f2f', marginTop: '5px' }}>
                          Breakdown Time: {calculateTotalBreakdownHours()} hours
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => setShowBreakdownModal(true)}
                        style={{ 
                          padding: '8px 16px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        🚨 Breakdown
                      </button>
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
            
            {/* Signature Warning */}
            {shiftStatus === 'ON DUTY' && !driverSignature && (
              <div style={{ 
                backgroundColor: '#fff3e0', 
                padding: '15px', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: '2px solid #ffb74d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px', color: '#ff9800' }}>⚠️</span>
                  <div>
                    <strong style={{ color: '#ef6c00' }}>Signature Required</strong>
                    <div style={{ fontSize: '14px', color: '#666' }}>Please provide your signature before recording transactions</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSignatureModal(true)}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  ✍️ Sign Now
                </button>
              </div>
            )}
            
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select
                        value={formData.fuelStore}
                        onChange={(e) => {
                          if (e.target.value === "CUSTOM") {
                            setShowCustomFuelStoreModal(true);
                          } else {
                            setFormData({...formData, fuelStore: e.target.value});
                          }
                        }}
                        style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                        required
                      >
                        <option value="">Select Store</option>
                        <option value="SASOL FLEET">SASOL FLEET</option>
                        <option value="STANDARD BANK FLEET">STANDARD BANK FLEET</option>
                        
                        {/* Custom Fuel Stores */}
                        {customFuelStores.length > 0 && (
                          <>
                            <option disabled>─── Custom Stores ───</option>
                            {customFuelStores.map((store, index) => (
                              <option key={index} value={store}>{store}</option>
                            ))}
                          </>
                        )}
                        
                        <option value="CUSTOM">+ Add Custom Fuel Store</option>
                      </select>
                      <button 
                        type="button" 
                        onClick={() => setShowFuelStoreQRScanner(true)}
                        style={{ 
                          padding: '12px 15px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        📱 Scan QR
                      </button>
                    </div>
                    
                    {/* Display current fuel store */}
                    {formData.fuelStore && (
                      <div style={{ 
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '6px',
                        border: '1px solid #4caf50',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: '#1b5e20', fontWeight: '600' }}>Selected Store:</span>
                        <span>{formData.fuelStore}</span>
                        {formData.fuelStore !== 'SASOL FLEET' && formData.fuelStore !== 'STANDARD BANK FLEET' && (
                          <button 
                            type="button"
                            onClick={() => {
                              // Remove the current custom store from list and show modal to edit
                              const updatedStores = customFuelStores.filter(s => s !== formData.fuelStore);
                              setCustomFuelStores(updatedStores);
                              localStorage.setItem(`driver_${user.id}_customFuelStores`, JSON.stringify(updatedStores));
                              setShowCustomFuelStoreModal(true);
                            }}
                            style={{ 
                              marginLeft: 'auto',
                              padding: '4px 8px',
                              backgroundColor: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
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
                        onChange={(e) => {
                          if (e.target.value === "Custom Site") {
                            setShowCustomSiteModal(true);
                          } else {
                            setFormData({...formData, contractType: e.target.value});
                          }
                        }}
                        style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                      >
                        <option value="">Select Contract</option>
                        <option value="AMPLANT 49">AMPLANT 49</option>
                        <option value="HILLARY (Site 2163)">HILLARY (Site 2163)</option>
                        <option value="HILLARY (Site 2102)">HILLARY (Site 2102)</option>
                        <option value="Polokwane Surfacing (Site 1809)">Polokwane Surfacing (Site 1809)</option>
                        
                        {/* Custom Sites */}
                        {customSites.length > 0 && (
                          <>
                            <option disabled>─── Custom Sites ───</option>
                            {customSites.map((site, index) => (
                              <option key={index} value={site}>{site}</option>
                            ))}
                          </>
                        )}
                        
                        <option value="Custom Site">+ Add New Custom Site</option>
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
                      <div><strong>Signature:</strong> {driverSignature ? '✅ Provided' : '❌ Required'}</div>
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
                  disabled={isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber || !driverSignature}
                  style={{ 
                    padding: '15px 40px',
                    backgroundColor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber || !driverSignature ? '#ccc' : '#1b5e20',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber || !driverSignature ? 'not-allowed' : 'pointer',
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
                {shiftStatus === 'ON DUTY' && !driverSignature && (
                  <p style={{ color: '#d32f2f', marginTop: '10px', fontSize: '14px' }}>
                    Please provide your signature before recording transactions
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Recent Transactions with Pagination */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '25px'
          }} className="transactions-section">
            <h3 style={{ color: '#1b5e20', marginBottom: '20px', fontSize: '20px' }}>
              📋 Recent Transactions 
              <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px', fontWeight: 'normal' }}>
                (Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length})
              </span>
            </h3>
            
            {/* Items per page selector */}
            {transactions.length > 5 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Transactions per page:
                  <select
                    value={transactionsPerPage}
                    onChange={(e) => {
                      setCurrentPage(1); // Reset to first page
                      setTransactionsPerPage(Number(e.target.value));
                    }}
                    style={{
                      marginLeft: '10px',
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
            
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
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Store</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Odometer</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Signature</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Breakdown</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.map((transaction, index) => (
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
                          <td style={{ padding: '12px' }}>
                            {transaction.signature ? (
                              <span style={{ color: '#4caf50' }}>✅</span>
                            ) : (
                              <span style={{ color: '#d32f2f' }}>❌</span>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {transaction.breakdownFlag ? (
                              <span style={{ color: '#d32f2f' }}>⚠️</span>
                            ) : (
                              <span style={{ color: '#4caf50' }}>✓</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {renderPagination()}
              </>
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
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Signature</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Breakdown</th>
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
                        {transaction.signature ? (
                          <span style={{ color: '#4caf50' }}>✅</span>
                        ) : (
                          <span style={{ color: '#d32f2f' }}>❌</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {transaction.breakdownFlag ? (
                          <span style={{ color: '#d32f2f' }}>⚠️</span>
                        ) : (
                          <span style={{ color: '#4caf50' }}>✓</span>
                        )}
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
              {/* Show specific company info if available */}
              {user.company && (
                <span style={{ 
                  marginLeft: '10px',
                  padding: '2px 8px',
                  backgroundColor: '#1b5e20',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {user.company === 'Hillary' ? '🏢 Hillary Construction' : 
                   user.company === 'Polokwane Surfacing' ? '🏗️ Polokwane Surfacing' : 
                   user.company}
                </span>
              )}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Role:</strong> {user.role || 'Driver'}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Current Shift:</strong> {shiftStatus}
              {shiftStatus === 'ON DUTY' && shiftStartTime && (
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                  (Started: {formatTime(shiftStartTime)})
                </span>
              )}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Total Transactions:</strong> {transactions.length}
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                ({transactions.filter(t => t.signature).length} signed)
              </span>
            </div>
            <div>
              <strong>Current Vehicle:</strong> {currentVehicle || 'None'}
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

      {showFuelStoreQRScanner && (
        <QRScanner 
          onScan={handleFuelStoreQRScan}
          onClose={() => setShowFuelStoreQRScanner(false)}
          title="Scan Fuel Store QR Code"
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

      {showCustomFuelStoreModal && (
        <CustomFuelStoreModal
          onSave={handleAddCustomFuelStore}
          onClose={() => setShowCustomFuelStoreModal(false)}
        />
      )}

      {showSignatureModal && (
        <SignatureModal
          onSave={handleSignatureSave}
          onClose={() => setShowSignatureModal(false)}
        />
      )}

      {showBreakdownModal && (
        <BreakdownModal
          onSave={handleBreakdownSave}
          onClose={() => setShowBreakdownModal(false)}
          shiftStartTime={shiftStartTime}
        />
      )}

      {showEndShiftModal && (
        <EndShiftModal
          onConfirm={handleConfirmShiftEnd}
          onClose={() => setShowEndShiftModal(false)}
          shiftData={shiftData}
          odometerKilos={formData.odometerKilos}
          odometerHours={formData.odometerHours}
          onOdometerScan={handleOdometerUpload}
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