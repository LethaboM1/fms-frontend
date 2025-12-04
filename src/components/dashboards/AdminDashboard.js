import React, { useState, useEffect, useRef } from 'react';
import QRScanner from '../qr/QRScanner';
import * as XLSX from 'xlsx';

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

// Photo Gallery Modal
// Photo Gallery Modal - Fixed version
const PhotoGalleryModal = ({ onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Load photos from localStorage
    const savedPhotos = JSON.parse(localStorage.getItem('odometerPhotos') || '[]');
    // Ensure all photos have required properties
    const validatedPhotos = savedPhotos.map(photo => ({
      photoId: photo.photoId || Date.now(),
      filename: photo.filename || `odometer_${photo.type || 'unknown'}_${Date.now()}.jpg`,
      url: photo.url || '',
      filepath: photo.filepath || `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/unknown.jpg`,
      type: photo.type || 'unknown',
      reading: photo.reading || '0',
      timestamp: photo.timestamp || new Date().toISOString(),
      folderPath: photo.folderPath || `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`,
      plantNumber: photo.plantNumber || 'Unknown',
      base64Data: photo.base64Data || null
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
              📁 Odometer Photo Gallery
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
              <div style={{ fontWeight: 'bold', color: '#1565c0' }}>📸 KM Photos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{photos.filter(p => p.type === 'kilos').length}</div>
            </div>
            <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1b5e20' }}>⏱️ HR Photos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{photos.filter(p => p.type === 'hours').length}</div>
            </div>
            <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>🏭 Plant Photos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{new Set(photos.map(p => p.plantNumber || 'Unknown')).size}</div>
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
                              📷
                            </div>
                          )}
                          <div style={{ padding: '5px', fontSize: '10px' }}>
                            <div style={{ fontWeight: 'bold' }}>{photo.reading} {photo.type === 'kilos' ? 'km' : 'hrs'}</div>
                            <div style={{ color: '#666' }}>{photo.plantNumber || 'Unknown'}</div>
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
                <p>Upload odometer photos to create folders</p>
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
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
                        color: '#666'
                      }}>
                        📷 {photo.type === 'kilos' ? 'KM' : photo.type === 'hours' ? 'HRS' : 'Photo'}
                      </div>
                    )}
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
                  alt="Odometer"
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
    
    meterVarianceFlag: false,
    meterVarianceMessage: '',
    readingFlag: 'normal',
    expectedCurrentReading: '',
    
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
    
    previousDip: '',
    currentDip: '',
    deliveryReceived: '',
    openingReading: '',
    closingReading: '',
    dipProbeStart: '',
    dipProbeEnd: '',
    totalIssuedFromOldMeter: '',
    totalIssuedFromDips: '',
    totalIssuedFromReadings: '',
    totalIssuedFromIQTechMeter: '',
    varianceDips: '',
    varianceReadings: ''
  });

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [customSites, setCustomSites] = useState([]);
  const [storeReadings, setStoreReadings] = useState({});
  const [isFirstTransaction, setIsFirstTransaction] = useState(true);
  const [activeSection, setActiveSection] = useState('equipment');
  const [currentTransactionId] = useState(Date.now());

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

  const calculateVariance = (actual, expected) => {
    if (!actual || !expected || expected === 0) return 0;
    return ((actual - expected) / expected) * 100;
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

    if (currentBefore && fuelQty) {
      const currentAfter = currentBefore + fuelQty;
      newData.currentMeterReadingAfter = currentAfter.toFixed(2);
      newData.closingReading = currentAfter.toFixed(2);
    }

    const previousDip = parseFloat(newData.previousDip) || 0;
    const currentDip = parseFloat(newData.currentDip) || 0;
    const deliveryReceived = parseFloat(newData.deliveryReceived) || 0;
    const openingReading = parseFloat(newData.openingReading) || 0;
    const closingReading = parseFloat(newData.closingReading) || 0;

    const totalIssuedFromDips = previousDip + deliveryReceived - currentDip;
    const totalIssuedFromReadings = closingReading - openingReading;

    newData.totalIssuedFromDips = totalIssuedFromDips > 0 ? totalIssuedFromDips.toFixed(2) : '';
    newData.totalIssuedFromReadings = totalIssuedFromReadings > 0 ? totalIssuedFromReadings.toFixed(2) : '';

    if (totalIssuedFromDips > 0 && totalIssuedFromReadings > 0) {
      newData.varianceDips = calculateVariance(totalIssuedFromDips, totalIssuedFromReadings).toFixed(2);
      newData.varianceReadings = calculateVariance(totalIssuedFromReadings, totalIssuedFromDips).toFixed(2);
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

      if (name.includes('MeterReading') || name === 'fuelQuantity' || name === 'plantNumber' ||
          name.includes('Dip') || name.includes('Reading') || name === 'deliveryReceived') {
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
      }
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
      meterVarianceFlag: false, meterVarianceMessage: '', readingFlag: 'normal', expectedCurrentReading: '',
      contractType: '', customSiteNumber: '', transactionType: '',
      receiverName: '', receiverCompany: '', employmentNumber: '', remarks: '',
      closingReading: currentAfter.toString(),
      previousDip: prev.currentDip || '', currentDip: '', deliveryReceived: '',
      openingReading: prev.closingReading || '', dipProbeStart: '', dipProbeEnd: '',
      totalIssuedFromOldMeter: '', totalIssuedFromDips: '', totalIssuedFromReadings: '',
      totalIssuedFromIQTechMeter: '', varianceDips: '', varianceReadings: ''
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
        'Fuel Store': transaction.selectedFuelStore, 'Previous Reading': transaction.previousMeterReading,
        'Current Reading Before': transaction.currentMeterReadingBefore, 'Fuel Quantity (L)': transaction.fuelQuantity,
        'Current Reading After': transaction.currentMeterReadingAfter, 'Closing Reading': transaction.closingReading,
        'Meter Reading Flag': transaction.meterReadingFlag || 'normal', 'Odometer (KM)': transaction.odometerKilos,
        'Odometer KM Photo': transaction.odometerPhotos?.kilos?.photoName || 'No photo',
        'Hours': transaction.odometerHours,
        'Hours Photo': transaction.odometerPhotos?.hours?.photoName || 'No photo',
        'Transaction Type': transaction.transactionType,
        'Contract/Site': transaction.contractType, 'Fuel Type': transaction.fuelType,
        'Receiver Name': transaction.receiverName, 'Receiver Company': transaction.receiverCompany,
        'Employment Number': transaction.employmentNumber, 'Attendant': transaction.attendantName,
        'Remarks': transaction.remarks || '', 'First Transaction': transaction.isFirstTransaction ? 'Yes' : 'No'
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
                  Click the button below to view all uploaded odometer photos organized by folders
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
                    <div>
                      <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Fuel Store Selection</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fuel Store Category:</label>
                          <select name="fuelStoreCategory" value={formData.fuelStoreCategory} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required>
                            <option value="">Select Category</option>
                            <option value="service_trucks">Service Trucks</option>
                            <option value="fuel_trailers">Fuel Trailers</option>
                            <option value="underground_tanks">Static Tanks</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Specific Store:</label>
                          <select name="selectedFuelStore" value={formData.selectedFuelStore} onChange={handleInputChange} disabled={!formData.fuelStoreCategory} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required>
                            <option value="">Select Store</option>
                            {formData.fuelStoreCategory && fuelStores[formData.fuelStoreCategory]?.map(store => (
                              <option key={store} value={store}>{store}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Meter Readings</h4>
                      
                      {formData.meterVarianceFlag && (
                        <div style={{ backgroundColor: formData.readingFlag === 'critical' ? '#ffebee' : formData.readingFlag === 'warning' ? '#fff3e0' : '#e8f5e8', border: formData.readingFlag === 'critical' ? '2px solid #f44336' : formData.readingFlag === 'warning' ? '2px solid #ff9800' : '2px solid #4caf50', borderRadius: '4px', padding: '10px', marginBottom: '15px', color: formData.readingFlag === 'critical' ? '#c62828' : formData.readingFlag === 'warning' ? '#e65100' : '#1b5e20' }}>
                          {formData.readingFlag === 'critical' ? '🚨 CRITICAL: ' : formData.readingFlag === 'warning' ? '⚠️ WARNING: ' : 'ℹ️ NOTE: '}{formData.meterVarianceMessage}
                        </div>
                      )}
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Previous Reading:</label>
                          <input type="number" name="previousMeterReading" value={formData.previousMeterReading} onChange={handleInputChange} step="0.01" readOnly={!isFirstTransaction} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: isFirstTransaction ? 'white' : '#f5f5f5' }} required />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Current Reading (Before):</label>
                          <input type="number" name="currentMeterReadingBefore" value={formData.currentMeterReadingBefore} onChange={handleInputChange} step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fuel Quantity (L):</label>
                          <input type="number" name="fuelQuantity" value={formData.fuelQuantity} onChange={handleInputChange} step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
                        </div>
                      </div>

                      <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Closing Reading (After):</label>
                        <input type="text" value={formData.currentMeterReadingAfter || ''} readOnly style={{ width: '100%', padding: '10px', border: '2px solid #1b5e20', borderRadius: '4px', backgroundColor: '#e8f5e8', fontWeight: 'bold', color: '#1b5e20' }} placeholder="Before + Fuel Quantity" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Stock Management Section */}
                {activeSection === 'stock' && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Previous Dip/Probe:</label>
                        <input type="number" name="previousDip" value={formData.previousDip} onChange={handleInputChange} step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Current Dip/Probe:</label>
                        <input type="number" name="currentDip" value={formData.currentDip} onChange={handleInputChange} step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Delivery Received:</label>
                        <input type="number" name="deliveryReceived" value={formData.deliveryReceived} onChange={handleInputChange} step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Opening Reading:</label>
                        <input type="number" name="openingReading" value={formData.openingReading} onChange={handleInputChange} step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {(formData.totalIssuedFromDips || formData.totalIssuedFromReadings) && (
                      <div style={{ backgroundColor: '#f0f7ff', padding: '15px', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                        <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>Calculated Results</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div><strong>Total Issued from Dips:</strong> {formData.totalIssuedFromDips || '0'}</div>
                          <div><strong>Total Issued from Readings:</strong> {formData.totalIssuedFromReadings || '0'}</div>
                          <div><strong>Variance Dips:</strong> {formData.varianceDips || '0'}%</div>
                          <div><strong>Variance Readings:</strong> {formData.varianceReadings || '0'}%</div>
                        </div>
                      </div>
                    )}
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
                      <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} placeholder="Additional notes or comments..." />
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
                  {JSON.parse(localStorage.getItem('odometerPhotos') || '[]').length}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>Odometer Photos</div>
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
                    <div style={{ color: '#666' }}>{transaction.transactionDate} • {transaction.contractType}</div>
                    <div style={{ fontSize: '10px', color: '#4caf50', marginTop: '2px' }}>
                      {transaction.odometerPhotos?.kilos?.photoName ? '📷 KM ' : ''}
                      {transaction.odometerPhotos?.hours?.photoName ? '📷 HRS' : ''}
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