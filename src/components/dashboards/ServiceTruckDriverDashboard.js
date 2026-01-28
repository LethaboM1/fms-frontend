// import React, { useState, useRef, useEffect } from 'react';
// import transactionService from '../../services/transactionService';
// import QRScanner from '../qr/QRScanner';
// import MachineLogBookDashboard from './MachineLogBookDashboard';

// // ==================== INDEXEDDB SETUP ====================

// const initPhotoDatabase = async () => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('FleetPhotoDatabase', 2);
    
//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       const oldVersion = event.oldVersion;
      
//       if (!db.objectStoreNames.contains('photos')) {
//         const store = db.createObjectStore('photos', { keyPath: 'photoId', autoIncrement: true });
//         store.createIndex('type', 'type', { unique: false });
//         store.createIndex('plantNumber', 'plantNumber', { unique: false });
//         store.createIndex('timestamp', 'timestamp', { unique: false });
//         store.createIndex('folderPath', 'folderPath', { unique: false });
//         store.createIndex('userId', 'userId', { unique: false });
//       }
      
//       if (!db.objectStoreNames.contains('folders')) {
//         const folderStore = db.createObjectStore('folders', { keyPath: 'path' });
//         folderStore.createIndex('photoCount', 'photoCount', { unique: false });
//         folderStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
//       }
      
//       if (oldVersion < 2) {
//         if (!db.objectStoreNames.contains('thumbnails')) {
//           db.createObjectStore('thumbnails', { keyPath: 'photoId' });
//         }
//       }
//     };
    
//     request.onsuccess = (event) => {
//       resolve(event.target.result);
//     };
    
//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// };

// const savePhotoToDatabase = async (photoData) => {
//   try {
//     const db = await initPhotoDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['photos', 'folders', 'thumbnails'], 'readwrite');
//       const photoStore = transaction.objectStore('photos');
//       const folderStore = transaction.objectStore('folders');
//       const thumbnailStore = transaction.objectStore('thumbnails');
      
//       const thumbnail = photoData.base64Data.substring(0, 50000);
//       const thumbnailData = {
//         photoId: photoData.photoId,
//         thumbnail: thumbnail,
//         timestamp: photoData.timestamp
//       };
      
//       const thumbnailRequest = thumbnailStore.add(thumbnailData);
      
//       thumbnailRequest.onsuccess = () => {
//         const photoRequest = photoStore.add(photoData);
        
//         photoRequest.onsuccess = () => {
//           const savedPhotoId = photoRequest.result;
          
//           const folderRequest = folderStore.get(photoData.folderPath);
          
//           folderRequest.onsuccess = () => {
//             const folder = folderRequest.result || {
//               path: photoData.folderPath,
//               name: photoData.folderPath.split('/').filter(Boolean).pop() || 'Root',
//               photoCount: 0,
//               lastUpdated: photoData.timestamp,
//               totalSize: 0
//             };
            
//             folder.photoCount += 1;
//             folder.lastUpdated = photoData.timestamp;
//             folder.totalSize += photoData.fileSize || 0;
            
//             const updateFolderRequest = folderStore.put(folder);
            
//             updateFolderRequest.onsuccess = () => {
//               transaction.oncomplete = () => {
//                 db.close();
//               };
//               resolve({ 
//                 ...photoData, 
//                 photoId: savedPhotoId,
//                 thumbnail: thumbnail 
//               });
//             };
            
//             updateFolderRequest.onerror = () => {
//               reject(new Error('Failed to update folder stats'));
//             };
//           };
          
//           folderRequest.onerror = () => {
//             reject(new Error('Failed to get folder stats'));
//           };
//         };
        
//         photoRequest.onerror = () => {
//           reject(new Error('Failed to save photo'));
//         };
//       };
      
//       thumbnailRequest.onerror = () => {
//         reject(new Error('Failed to save thumbnail'));
//       };
      
//       transaction.onerror = (event) => {
//         reject(event.target.error);
//       };
//     });
//   } catch (error) {
//     console.error('Database error:', error);
//     throw error;
//   }
// };

// const getAllPhotosFromDatabase = async (userId = null) => {
//   try {
//     const db = await initPhotoDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['photos'], 'readonly');
//       const store = transaction.objectStore('photos');
//       const request = store.getAll();
      
//       request.onsuccess = () => {
//         const allPhotos = request.result;
//         const filteredPhotos = userId 
//           ? allPhotos.filter(photo => photo.userId === userId)
//           : allPhotos;
        
//         filteredPhotos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(filteredPhotos);
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to load photos'));
//       };
//     });
//   } catch (error) {
//     console.error('Error loading photos:', error);
//     return [];
//   }
// };

// const getAllFoldersFromDatabase = async () => {
//   try {
//     const db = await initPhotoDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['folders'], 'readonly');
//       const store = transaction.objectStore('folders');
//       const request = store.getAll();
      
//       request.onsuccess = () => {
//         const folders = request.result;
        
//         folders.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(folders);
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to load folders'));
//       };
//     });
//   } catch (error) {
//     console.error('Error loading folders:', error);
//     return [];
//   }
// };

// const getPhotosByFolder = async (folderPath) => {
//   try {
//     const db = await initPhotoDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['photos'], 'readonly');
//       const store = transaction.objectStore('photos');
//       const index = store.index('folderPath');
//       const request = index.getAll(folderPath);
      
//       request.onsuccess = () => {
//         const photos = request.result;
        
//         photos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(photos);
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to load folder photos'));
//       };
//     });
//   } catch (error) {
//     console.error('Error loading folder photos:', error);
//     return [];
//   }
// };

// // ==================== MODAL COMPONENTS ====================

// const FuelEditModal = ({ currentQuantity, onSave, onClose }) => {
//   const [quantity, setQuantity] = useState(currentQuantity || '');
//   const [error, setError] = useState('');

//   const handleSave = () => {
//     if (!quantity || parseFloat(quantity) <= 0) {
//       setError('Please enter a valid fuel quantity (greater than 0)');
//       return;
//     }
//     onSave(quantity);
//     onClose();
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.8)',
//       zIndex: 1000,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '25px',
//         borderRadius: '12px',
//         maxWidth: '400px',
//         width: '100%'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h3 style={{ margin: 0, color: '#1b5e20' }}>⛽ Edit Fuel Quantity</h3>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '24px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         {error && (
//           <div style={{
//             backgroundColor: '#ffebee',
//             color: '#c62828',
//             padding: '10px',
//             borderRadius: '6px',
//             marginBottom: '15px',
//             border: '1px solid #ef9a9a',
//             fontSize: '14px'
//           }}>
//             ⚠️ {error}
//           </div>
//         )}

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
//             Fuel Quantity (Liters):
//           </label>
//           <input
//             type="number"
//             value={quantity}
//             onChange={(e) => {
//               setQuantity(e.target.value);
//               setError('');
//             }}
//             placeholder="Enter fuel quantity in liters..."
//             step="0.1"
//             min="0"
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: '2px solid #1b5e20',
//               borderRadius: '6px',
//               fontSize: '16px'
//             }}
//             required
//           />
//         </div>

//         <div style={{ 
//           display: 'flex', 
//           gap: '10px',
//           borderTop: '1px solid #eee',
//           paddingTop: '20px'
//         }}>
//           <button 
//             onClick={handleSave}
//             disabled={!quantity}
//             style={{ 
//               flex: 1,
//               padding: '12px 20px', 
//               backgroundColor: quantity ? '#1b5e20' : '#ccc', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '6px', 
//               cursor: quantity ? 'pointer' : 'not-allowed',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             Save Changes
//           </button>
          
//           <button 
//             onClick={onClose}
//             style={{ 
//               flex: 1,
//               padding: '12px 20px', 
//               backgroundColor: '#f5f5f5', 
//               color: '#333', 
//               border: '1px solid #ddd',
//               borderRadius: '6px', 
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Enhanced Odometer Photo Upload that can be used for meter readings too
// const MeterReadingPhotoUpload = ({ 
//   onPhotoUpload, 
//   onClose, 
//   type, 
//   currentValue,
//   plantNumber,
//   transactionId,
//   userId,
//   label = null,
//   isMeterReading = false
// }) => {
//   const [manualValue, setManualValue] = useState(currentValue || '');
//   const [photo, setPhoto] = useState(null);
//   const [photoName, setPhotoName] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [uploadSuccess, setUploadSuccess] = useState(false);
//   const [uploadedPhotoData, setUploadedPhotoData] = useState(null);
//   const [errorMessage, setErrorMessage] = useState('');
//   const fileInputRef = useRef(null);

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPhotoName(file.name);
//       setErrorMessage('');
      
//       if (file.size > 10 * 1024 * 1024) {
//         setErrorMessage('File size too large. Maximum 10MB allowed.');
//         return;
//       }
      
//       if (!file.type.startsWith('image/')) {
//         setErrorMessage('Please select an image file (JPEG, PNG, etc.)');
//         return;
//       }
      
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const base64Image = event.target.result;
//         setPhoto(base64Image);
//       };
//       reader.onerror = () => {
//         setErrorMessage('Failed to read image file');
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const uploadPhotoToServer = async () => {
//     setErrorMessage('');
    
//     if (!manualValue) {
//       setErrorMessage('Please enter the reading value first');
//       return;
//     }
    
//     if (!photo) {
//       setErrorMessage('Please select a photo first');
//       return;
//     }

//     setUploading(true);
    
//     try {
//       const now = new Date();
//       const year = now.getFullYear();
//       const month = String(now.getMonth() + 1).padStart(2, '0');
//       const day = String(now.getDate()).padStart(2, '0');
//       const hours = String(now.getHours()).padStart(2, '0');
//       const minutes = String(now.getMinutes()).padStart(2, '0');
//       const seconds = String(now.getSeconds()).padStart(2, '0');
      
//       const folderPath = `uploads/${year}/${month}/${day}/`;
//       const filename = isMeterReading 
//         ? `meter_${type}_${plantNumber || 'unknown'}_${year}${month}${day}_${hours}${minutes}${seconds}.jpg`
//         : `odometer_${type}_${plantNumber || 'unknown'}_${year}${month}${day}_${hours}${minutes}${seconds}.jpg`;
      
//       const fileSize = Math.round((photo.length * 3) / 4);
      
//       const photoData = {
//         photoId: Date.now(),
//         filename: filename,
//         originalName: photoName || (isMeterReading ? `meter_${type}.jpg` : `odometer_${type}.jpg`),
//         base64Data: photo,
//         type: isMeterReading ? `meter_${type}` : type,
//         reading: manualValue,
//         timestamp: now.toISOString(),
//         plantNumber: plantNumber || 'Unknown',
//         userId: userId || 'unknown',
//         transactionId: transactionId || null,
//         folderPath: folderPath,
//         fileSize: fileSize,
//         dimensions: { width: 0, height: 0 },
//         metadata: {
//           uploadedBy: userId || 'unknown',
//           uploadTime: now.toISOString(),
//           device: navigator.userAgent.substring(0, 100),
//           readingType: type,
//           readingValue: manualValue,
//           isMeterReading: isMeterReading
//         }
//       };

//       const savedPhoto = await savePhotoToDatabase(photoData);
      
//       const savedPhotoRefs = JSON.parse(localStorage.getItem('meterPhotoRefs') || '[]');
//       savedPhotoRefs.push({
//         photoId: savedPhoto.photoId,
//         filename: savedPhoto.filename,
//         type: savedPhoto.type,
//         reading: savedPhoto.reading,
//         timestamp: savedPhoto.timestamp,
//         plantNumber: savedPhoto.plantNumber,
//         folderPath: savedPhoto.folderPath,
//         thumbnail: savedPhoto.thumbnail,
//         isMeterReading: isMeterReading
//       });
//       localStorage.setItem('meterPhotoRefs', JSON.stringify(savedPhotoRefs));
      
//       const photoCount = parseInt(localStorage.getItem('totalPhotos') || '0') + 1;
//       localStorage.setItem('totalPhotos', photoCount.toString());
      
//       setUploadSuccess(true);
//       setUploadedPhotoData(savedPhoto);
      
//       const folderStructure = JSON.parse(localStorage.getItem('photoFolderStructure') || '{}');
//       if (!folderStructure[folderPath]) {
//         folderStructure[folderPath] = {
//           path: folderPath,
//           displayName: `${year}-${month}-${day}`,
//           photoCount: 0,
//           lastUpdated: now.toISOString()
//         };
//       }
//       folderStructure[folderPath].photoCount += 1;
//       folderStructure[folderPath].lastUpdated = now.toISOString();
//       localStorage.setItem('photoFolderStructure', JSON.stringify(folderStructure));
      
//       setTimeout(() => {
//         onPhotoUpload({
//           value: manualValue,
//           photoData: savedPhoto,
//           type: type,
//           isMeterReading: isMeterReading
//         });
//         onClose();
//       }, 1500);
      
//       setUploading(false);
      
//     } catch (error) {
//       console.error('Upload error:', error);
//       setErrorMessage(`Failed to save photo: ${error.message}`);
//       setUploading(false);
//     }
//   };

//   const handleSaveWithoutPhoto = () => {
//     if (!manualValue) {
//       setErrorMessage('Please enter the reading value');
//       return;
//     }
    
//     onPhotoUpload({
//       value: manualValue,
//       photoData: null,
//       type: type,
//       isMeterReading: isMeterReading
//     });
//     onClose();
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   const getDisplayType = () => {
//     if (isMeterReading) {
//       return label || 'Meter Reading';
//     }
//     return type === 'kilos' ? 'Odometer Kilometers' : 'Odometer Hours';
//   };

//   const getUnit = () => {
//     if (isMeterReading) {
//       return 'units';
//     }
//     return type === 'kilos' ? 'km' : 'hrs';
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.8)',
//       zIndex: 1000,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '25px',
//         borderRadius: '12px',
//         maxWidth: '500px',
//         width: '100%'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h3 style={{ margin: 0, color: '#1b5e20' }}>
//             {isMeterReading ? '📊 ' : (type === 'kilos' ? '📏 ' : '⏱️ ')}
//             {getDisplayType()}
//           </h3>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '24px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         {errorMessage && (
//           <div style={{
//             backgroundColor: '#ffebee',
//             color: '#c62828',
//             padding: '10px',
//             borderRadius: '6px',
//             marginBottom: '15px',
//             border: '1px solid #ef9a9a',
//             fontSize: '14px'
//           }}>
//             ⚠️ {errorMessage}
//           </div>
//         )}

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
//             Enter {getDisplayType()}: *
//           </label>
//           <input
//             type="number"
//             value={manualValue}
//             onChange={(e) => {
//               setManualValue(e.target.value);
//               setErrorMessage('');
//             }}
//             placeholder={`Enter ${getDisplayType().toLowerCase()}...`}
//             step="0.1"
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: errorMessage && !manualValue ? '2px solid #f44336' : '2px solid #1b5e20',
//               borderRadius: '6px',
//               fontSize: '16px'
//             }}
//             required
//           />
//         </div>

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
//             Upload Photo (Optional for verification):
//           </label>
          
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             capture="environment"
//             onChange={handleFileSelect}
//             style={{ display: 'none' }}
//           />
          
//           <button
//             onClick={triggerFileInput}
//             disabled={uploading}
//             style={{
//               width: '100%',
//               padding: '15px',
//               backgroundColor: '#1976d2',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               fontSize: '16px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '10px',
//               marginBottom: '15px',
//               opacity: uploading ? 0.6 : 1
//             }}
//           >
//             📷 {photoName ? 'Change Photo' : 'Take Photo / Upload Image'}
//           </button>
          
//           {photoName && (
//             <div style={{
//               backgroundColor: '#e8f5e8',
//               padding: '10px',
//               borderRadius: '6px',
//               border: '1px solid #4caf50',
//               marginTop: '10px'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <span style={{ color: '#4caf50' }}>✓</span>
//                 <span style={{ fontSize: '14px' }}>{photoName}</span>
//                 <span style={{ fontSize: '12px', color: '#666' }}>
//                   ({Math.round(photoName.length / 1024)} KB)
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>

//         {photo && !uploadSuccess && (
//           <div style={{ marginBottom: '20px', textAlign: 'center' }}>
//             <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Photo Preview:</p>
//             <div style={{ 
//               maxWidth: '100%', 
//               maxHeight: '200px', 
//               overflow: 'hidden',
//               borderRadius: '8px',
//               border: '2px solid #ddd'
//             }}>
//               <img 
//                 src={photo} 
//                 alt={getDisplayType()} 
//                 style={{ 
//                   width: '100%',
//                   height: 'auto',
//                   maxHeight: '200px',
//                   objectFit: 'contain'
//                 }} 
//               />
//             </div>
//             <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
//               Image loaded successfully
//             </p>
//           </div>
//         )}

//         {uploadSuccess && uploadedPhotoData && (
//           <div style={{
//             backgroundColor: '#e8f5e8',
//             padding: '15px',
//             borderRadius: '6px',
//             border: '2px solid #4caf50',
//             marginBottom: '20px'
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
//               <span style={{ color: '#4caf50', fontSize: '20px' }}>✅</span>
//               <strong style={{ color: '#1b5e20' }}>Photo Saved Successfully!</strong>
//             </div>
//             <div style={{ fontSize: '14px', color: '#555' }}>
//               <div><strong>File:</strong> {uploadedPhotoData.filename}</div>
//               <div><strong>Reading:</strong> {uploadedPhotoData.reading} {getUnit()}</div>
//               <div><strong>Saved to:</strong> {uploadedPhotoData.folderPath}</div>
//               <div><strong>Database ID:</strong> {uploadedPhotoData.photoId}</div>
//               <div><strong>Timestamp:</strong> {new Date(uploadedPhotoData.timestamp).toLocaleTimeString()}</div>
//             </div>
//           </div>
//         )}

//         <div style={{ 
//           display: 'flex', 
//           flexDirection: 'column',
//           gap: '10px',
//           borderTop: '1px solid #eee',
//           paddingTop: '20px'
//         }}>
//           <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
//             <button 
//               onClick={handleSaveWithoutPhoto}
//               disabled={!manualValue || uploading}
//               style={{ 
//                 flex: 1,
//                 padding: '12px 20px', 
//                 backgroundColor: manualValue ? '#757575' : '#ccc', 
//                 color: 'white', 
//                 border: 'none',
//                 borderRadius: '6px', 
//                 cursor: (manualValue && !uploading) ? 'pointer' : 'not-allowed',
//                 fontSize: '14px',
//                 fontWeight: '500'
//               }}
//             >
//               Save Without Photo
//             </button>
            
//             <button 
//               onClick={uploadPhotoToServer}
//               disabled={!manualValue || !photo || uploading}
//               style={{ 
//                 flex: 1,
//                 padding: '12px 20px', 
//                 backgroundColor: (manualValue && photo && !uploading) ? '#1b5e20' : '#ccc', 
//                 color: 'white', 
//                 border: 'none',
//                 borderRadius: '6px', 
//                 cursor: (manualValue && photo && !uploading) ? 'pointer' : 'not-allowed',
//                 fontSize: '14px',
//                 fontWeight: '500'
//               }}
//             >
//               {uploading ? 'Saving...' : 'Save with Photo'}
//             </button>
//           </div>
          
//           <button 
//             onClick={onClose}
//             disabled={uploading}
//             style={{ 
//               width: '100%',
//               padding: '12px 20px', 
//               backgroundColor: '#f5f5f5', 
//               color: '#333', 
//               border: '1px solid #ddd',
//               borderRadius: '6px', 
//               cursor: uploading ? 'not-allowed' : 'pointer',
//               fontSize: '14px',
//               fontWeight: '500',
//               marginTop: '5px'
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const PhotoGalleryModal = ({ onClose, userId }) => {
//   const [photos, setPhotos] = useState([]);
//   const [folders, setFolders] = useState([]);
//   const [selectedPhoto, setSelectedPhoto] = useState(null);
//   const [viewMode, setViewMode] = useState('grid');
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedFolder, setSelectedFolder] = useState(null);
//   const [folderPhotos, setFolderPhotos] = useState([]);

//   useEffect(() => {
//     loadGalleryData();
//   }, [userId]);

//   const loadGalleryData = async () => {
//     setIsLoading(true);
//     try {
//       const [photosData, foldersData] = await Promise.all([
//         getAllPhotosFromDatabase(userId),
//         getAllFoldersFromDatabase()
//       ]);
      
//       setPhotos(photosData);
//       setFolders(foldersData);
//     } catch (error) {
//       console.error('Error loading gallery data:', error);
//       const savedPhotoRefs = JSON.parse(localStorage.getItem('meterPhotoRefs') || '[]');
//       setPhotos(savedPhotoRefs);
      
//       const folderStructure = JSON.parse(localStorage.getItem('photoFolderStructure') || '{}');
//       setFolders(Object.values(folderStructure));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadFolderPhotos = async (folderPath) => {
//     try {
//       const photos = await getPhotosByFolder(folderPath);
//       setFolderPhotos(photos);
//       setSelectedFolder(folderPath);
//     } catch (error) {
//       console.error('Error loading folder photos:', error);
//     }
//   };

//   const getFolderName = (folderPath) => {
//     if (!folderPath) return 'Unknown';
//     const parts = folderPath.split('/').filter(Boolean);
//     return parts.length > 1 ? `${parts[parts.length - 3]}/${parts[parts.length - 2]}/${parts[parts.length - 1]}` : folderPath;
//   };

//   const getPhotoStats = () => {
//     const kmPhotos = photos.filter(p => p.type === 'kilos' || p.type === 'meter_kilos');
//     const hourPhotos = photos.filter(p => p.type === 'hours' || p.type === 'meter_hours');
//     const meterPhotos = photos.filter(p => p.type.includes('meter_'));
//     const today = new Date().toDateString();
//     const todayPhotos = photos.filter(p => new Date(p.timestamp).toDateString() === today);
    
//     return {
//       total: photos.length,
//       km: kmPhotos.length,
//       hours: hourPhotos.length,
//       meter: meterPhotos.length,
//       today: todayPhotos.length,
//       folders: folders.length,
//       totalSize: photos.reduce((sum, p) => sum + (p.fileSize || 0), 0)
//     };
//   };

//   const stats = getPhotoStats();

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.95)',
//       zIndex: 1001,
//       display: 'flex',
//       flexDirection: 'column',
//       padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '20px',
//         borderRadius: '12px',
//         maxWidth: '1200px',
//         width: '100%',
//         maxHeight: '90vh',
//         margin: 'auto',
//         overflow: 'hidden',
//         display: 'flex',
//         flexDirection: 'column'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//             <h3 style={{ margin: 0, color: '#1b5e20' }}>
//               📁 Photo Gallery
//             </h3>
//             <div style={{ display: 'flex', gap: '5px' }}>
//               <button 
//                 onClick={() => { setViewMode('grid'); setSelectedFolder(null); }}
//                 style={{ 
//                   padding: '5px 10px',
//                   backgroundColor: viewMode === 'grid' && !selectedFolder ? '#1b5e20' : '#f5f5f5',
//                   color: viewMode === 'grid' && !selectedFolder ? 'white' : '#333',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   cursor: 'pointer',
//                   fontSize: '12px'
//                 }}
//               >
//                 📷 All Photos
//               </button>
//               <button 
//                 onClick={() => setViewMode('folders')}
//                 style={{ 
//                   padding: '5px 10px',
//                   backgroundColor: viewMode === 'folders' ? '#1b5e20' : '#f5f5f5',
//                   color: viewMode === 'folders' ? 'white' : '#333',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   cursor: 'pointer',
//                   fontSize: '12px'
//                 }}
//               >
//                 📁 Folders
//               </button>
//             </div>
//           </div>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '24px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         <div style={{ 
//           backgroundColor: '#f0f7ff', 
//           padding: '15px', 
//           borderRadius: '8px',
//           marginBottom: '20px',
//           border: '1px solid #bbdefb'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <h4 style={{ margin: 0, color: '#1976d2' }}>📊 Photo Statistics</h4>
//             <div style={{ fontSize: '14px', color: '#666' }}>
//               Total: {stats.total} photos • {stats.folders} folders
//             </div>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
//             <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#1565c0' }}>📸 KM Photos</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.km}</div>
//             </div>
//             <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#1b5e20' }}>⏱️ HR Photos</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.hours}</div>
//             </div>
//             <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>📊 Meter Photos</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.meter}</div>
//             </div>
//             <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>🏭 Today</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.today}</div>
//             </div>
//             <div style={{ backgroundColor: '#f3e5f5', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#7b1fa2' }}>💾 Storage</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
//                 {Math.round(stats.totalSize / (1024 * 1024 * 10) * 100)}% used
//               </div>
//             </div>
//           </div>
//         </div>

//         {isLoading ? (
//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <div style={{ textAlign: 'center' }}>
//               <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
//               <p>Loading photos...</p>
//             </div>
//           </div>
//         ) : selectedFolder ? (
//           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
//               <button 
//                 onClick={() => setSelectedFolder(null)}
//                 style={{ 
//                   padding: '5px 10px',
//                   backgroundColor: '#f5f5f5',
//                   color: '#333',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   cursor: 'pointer',
//                   fontSize: '12px'
//                 }}
//               >
//                 ← Back
//               </button>
//               <h4 style={{ margin: 0, color: '#555' }}>📁 {getFolderName(selectedFolder)} ({folderPhotos.length} photos)</h4>
//             </div>
            
//             <div style={{ 
//               flex: 1,
//               overflowY: 'auto',
//               paddingRight: '10px'
//             }}>
//               {folderPhotos.length > 0 ? (
//                 <div style={{ 
//                   display: 'grid', 
//                   gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
//                   gap: '15px',
//                   padding: '10px'
//                 }}>
//                   {folderPhotos.map(photo => (
//                     <div 
//                       key={photo.photoId} 
//                       style={{ 
//                         backgroundColor: '#f8f9fa',
//                         borderRadius: '8px',
//                         overflow: 'hidden',
//                         border: '1px solid #ddd',
//                         cursor: 'pointer'
//                       }}
//                       onClick={() => setSelectedPhoto(photo)}
//                     >
//                       <div style={{ 
//                         height: '120px', 
//                         backgroundColor: '#e9ecef',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         overflow: 'hidden'
//                       }}>
//                         {photo.base64Data || photo.thumbnail ? (
//                           <img 
//                             src={photo.base64Data || photo.thumbnail} 
//                             alt={photo.filename}
//                             style={{
//                               width: '100%',
//                               height: '100%',
//                               objectFit: 'cover'
//                             }}
//                           />
//                         ) : (
//                           <div style={{ color: '#666' }}>
//                             📷 {photo.type.includes('meter') ? 'METER' : (photo.type === 'kilos' ? 'KM' : 'HRS')}
//                           </div>
//                         )}
//                       </div>
//                       <div style={{ padding: '10px' }}>
//                         <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
//                           {photo.reading} {photo.type.includes('meter') ? 'units' : (photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : '')}
//                         </div>
//                         <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
//                           Type: {photo.type}
//                         </div>
//                         <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
//                           Plant: {photo.plantNumber || 'Unknown'}
//                         </div>
//                         <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
//                           {new Date(photo.timestamp).toLocaleDateString()}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div style={{ 
//                   textAlign: 'center', 
//                   padding: '40px', 
//                   color: '#666',
//                   backgroundColor: '#f8f9fa',
//                   borderRadius: '8px'
//                 }}>
//                   <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
//                   <p>No photos in this folder</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : viewMode === 'folders' ? (
//           <div style={{ 
//             flex: 1,
//             overflowY: 'auto',
//             paddingRight: '10px'
//           }}>
//             <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>📁 Folders ({folders.length})</h4>
//             {folders.length > 0 ? (
//               <div style={{ display: 'grid', gap: '10px' }}>
//                 {folders.map(folder => (
//                   <div 
//                     key={folder.path}
//                     style={{ 
//                       backgroundColor: '#f8f9fa',
//                       borderRadius: '8px',
//                       padding: '15px',
//                       border: '1px solid #ddd',
//                       cursor: 'pointer'
//                     }}
//                     onClick={() => loadFolderPhotos(folder.path)}
//                   >
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                         <span style={{ fontSize: '20px' }}>📁</span>
//                         <div>
//                           <div style={{ fontWeight: 'bold', color: '#333' }}>{getFolderName(folder.path)}</div>
//                           <div style={{ fontSize: '12px', color: '#666' }}>{folder.path}</div>
//                         </div>
//                       </div>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//                         <div style={{ fontSize: '14px', color: '#666' }}>
//                           {folder.photoCount} photo{folder.photoCount !== 1 ? 's' : ''}
//                         </div>
//                         <span style={{ fontSize: '20px' }}>→</span>
//                       </div>
//                     </div>
//                     <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
//                       Last updated: {new Date(folder.lastUpdated).toLocaleString()}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div style={{ 
//                 textAlign: 'center', 
//                 padding: '40px', 
//                 color: '#666',
//                 backgroundColor: '#f8f9fa',
//                 borderRadius: '8px'
//               }}>
//                 <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
//                 <h4 style={{ color: '#555' }}>No folders found</h4>
//                 <p>Upload photos to create folders automatically</p>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div style={{ 
//             flex: 1,
//             overflowY: 'auto',
//             paddingRight: '10px'
//           }}>
//             <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>📷 All Photos ({photos.length})</h4>
//             {photos.length > 0 ? (
//               <div style={{ 
//                 display: 'grid', 
//                 gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
//                 gap: '15px',
//                 padding: '10px'
//               }}>
//                 {photos.map(photo => (
//                   <div 
//                     key={photo.photoId} 
//                     style={{ 
//                       backgroundColor: '#f8f9fa',
//                       borderRadius: '8px',
//                       overflow: 'hidden',
//                       border: '1px solid #ddd',
//                       cursor: 'pointer'
//                     }}
//                     onClick={() => setSelectedPhoto(photo)}
//                   >
//                     <div style={{ 
//                       height: '120px', 
//                       backgroundColor: '#e9ecef',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       overflow: 'hidden'
//                     }}>
//                       {photo.base64Data || photo.thumbnail ? (
//                         <img 
//                           src={photo.base64Data || photo.thumbnail} 
//                           alt={photo.filename}
//                           style={{
//                             width: '100%',
//                             height: '100%',
//                             objectFit: 'cover'
//                           }}
//                         />
//                       ) : (
//                         <div style={{ color: '#666' }}>
//                           📷 {photo.type.includes('meter') ? 'METER' : (photo.type === 'kilos' ? 'KM' : 'HRS')}
//                         </div>
//                       )}
//                     </div>
//                     <div style={{ padding: '10px' }}>
//                       <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
//                         {photo.reading} {photo.type.includes('meter') ? 'units' : (photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : '')}
//                       </div>
//                       <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
//                         Type: {photo.type}
//                       </div>
//                       <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
//                         Plant: {photo.plantNumber || 'Unknown'}
//                       </div>
//                       <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
//                         {new Date(photo.timestamp).toLocaleDateString()}
//                       </div>
//                       <div style={{ fontSize: '10px', color: '#1976d2', marginTop: '2px' }}>
//                         📁 {getFolderName(photo.folderPath)}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div style={{ 
//                 textAlign: 'center', 
//                 padding: '40px', 
//                 color: '#666',
//                 backgroundColor: '#f8f9fa',
//                 borderRadius: '8px'
//               }}>
//                 <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
//                 <h4 style={{ color: '#555' }}>No photos uploaded yet</h4>
//                 <p>Upload odometer or meter reading photos to see them here</p>
//               </div>
//             )}
//           </div>
//         )}

//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginTop: '20px',
//           paddingTop: '20px',
//           borderTop: '1px solid #eee'
//         }}>
//           <div style={{ fontSize: '14px', color: '#666' }}>
//             Database: {stats.total} photos • {stats.folders} folders
//           </div>
//           <button 
//             onClick={onClose}
//             style={{ 
//               padding: '10px 20px', 
//               backgroundColor: '#1b5e20', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '6px', 
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             Close Gallery
//           </button>
//         </div>
//       </div>

//       {selectedPhoto && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0,0,0,0.95)',
//           zIndex: 1002,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '40px'
//         }}>
//           <div style={{
//             backgroundColor: 'white',
//             padding: '30px',
//             borderRadius: '12px',
//             maxWidth: '800px',
//             width: '100%'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//               <h3 style={{ margin: 0, color: '#1b5e20' }}>
//                 📷 Photo Details
//               </h3>
//               <button 
//                 onClick={() => setSelectedPhoto(null)} 
//                 style={{ 
//                   background: 'none', 
//                   border: 'none', 
//                   fontSize: '24px', 
//                   cursor: 'pointer',
//                   color: '#666'
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <div style={{ 
//               backgroundColor: '#f8f9fa',
//               padding: '20px',
//               borderRadius: '8px',
//               marginBottom: '20px',
//               border: '1px solid #ddd'
//             }}>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Reading</div>
//                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1b5e20' }}>
//                     {selectedPhoto.reading || '0'} {selectedPhoto.type.includes('meter') ? 'units' : (selectedPhoto.type === 'kilos' ? 'kilometers' : selectedPhoto.type === 'hours' ? 'hours' : '')}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Type</div>
//                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
//                     {selectedPhoto.type.includes('meter') ? 'Meter Reading' : (selectedPhoto.type === 'kilos' ? 'Kilometers (KM)' : selectedPhoto.type === 'hours' ? 'Hours (HRS)' : 'Unknown')}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Plant Number</div>
//                   <div style={{ fontSize: '16px', color: '#333', wordBreak: 'break-all' }}>
//                     {selectedPhoto.plantNumber || 'Unknown'}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Upload Date</div>
//                   <div style={{ fontSize: '16px', color: '#333' }}>
//                     {new Date(selectedPhoto.timestamp).toLocaleString()}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>File Size</div>
//                   <div style={{ fontSize: '16px', color: '#333' }}>
//                     {selectedPhoto.fileSize ? Math.round(selectedPhoto.fileSize / 1024) + ' KB' : 'Unknown'}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Database ID</div>
//                   <div style={{ fontSize: '16px', color: '#333' }}>
//                     {selectedPhoto.photoId || 'N/A'}
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Folder Path</div>
//                 <div style={{ 
//                   backgroundColor: '#e3f2fd', 
//                   padding: '10px', 
//                   borderRadius: '6px',
//                   fontSize: '14px',
//                   color: '#1565c0',
//                   wordBreak: 'break-all'
//                 }}>
//                   📁 {selectedPhoto.folderPath || 'No folder path available'}
//                 </div>
//               </div>
//             </div>

//             <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//               {selectedPhoto.base64Data ? (
//                 <div style={{ 
//                   maxHeight: '400px', 
//                   overflow: 'auto',
//                   marginBottom: '10px',
//                   border: '2px solid #ddd',
//                   borderRadius: '8px'
//                 }}>
//                   <img 
//                     src={selectedPhoto.base64Data} 
//                     alt="Meter Reading"
//                     style={{
//                       maxWidth: '100%',
//                       maxHeight: '400px',
//                       objectFit: 'contain'
//                     }}
//                   />
//                 </div>
//               ) : selectedPhoto.thumbnail ? (
//                 <div>
//                   <img 
//                     src={selectedPhoto.thumbnail} 
//                     alt="Thumbnail"
//                     style={{
//                       maxWidth: '100%',
//                       maxHeight: '200px',
//                       borderRadius: '8px',
//                       border: '2px solid #ddd',
//                       objectFit: 'contain'
//                     }}
//                   />
//                   <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
//                     (Thumbnail preview - full image stored in database)
//                   </p>
//                 </div>
//               ) : (
//                 <div style={{ 
//                   height: '300px', 
//                   backgroundColor: '#e9ecef',
//                   borderRadius: '8px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: '#666',
//                   fontSize: '18px',
//                   marginBottom: '10px'
//                 }}>
//                   📷 No image data available
//                 </div>
//               )}
//               <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
//                 Photo ID: {selectedPhoto.photoId || 'N/A'}
//               </div>
//             </div>

//             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//               <button 
//                 onClick={() => setSelectedPhoto(null)}
//                 style={{ 
//                   padding: '10px 20px', 
//                   backgroundColor: '#1b5e20', 
//                   color: 'white', 
//                   border: 'none',
//                   borderRadius: '6px', 
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 Close Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CustomSiteModal = ({ onSave, onClose }) => {
//   const [siteName, setSiteName] = useState('');
//   const [siteNumber, setSiteNumber] = useState('');
//   const [error, setError] = useState('');

//   const handleSave = () => {
//     if (!siteName.trim()) {
//       setError('Please enter a site name');
//       return;
//     }
    
//     const customSite = siteNumber.trim() 
//       ? `${siteName} (${siteNumber})`
//       : siteName;
    
//     onSave(customSite);
//     onClose();
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.8)',
//       zIndex: 1000,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '25px',
//         borderRadius: '12px',
//         maxWidth: '400px',
//         width: '100%'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h3 style={{ margin: 0, color: '#1b5e20' }}>🏗️ Add Custom Site</h3>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '24px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         {error && (
//           <div style={{
//             backgroundColor: '#ffebee',
//             color: '#c62828',
//             padding: '10px',
//             borderRadius: '6px',
//             marginBottom: '15px',
//             border: '1px solid #ef9a9a',
//             fontSize: '14px'
//           }}>
//             ⚠️ {error}
//           </div>
//         )}

//         <div style={{ marginBottom: '20px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
//             Site Name: *
//           </label>
//           <input
//             type="text"
//             value={siteName}
//             onChange={(e) => {
//               setSiteName(e.target.value);
//               setError('');
//             }}
//             placeholder="Enter site name..."
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: '2px solid #1b5e20',
//               borderRadius: '6px',
//               fontSize: '16px'
//             }}
//             required
//           />
//         </div>

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
//             Site Number (Optional):
//           </label>
//           <input
//             type="text"
//             value={siteNumber}
//             onChange={(e) => setSiteNumber(e.target.value)}
//             placeholder="Enter site number..."
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: '1px solid #ddd',
//               borderRadius: '6px',
//               fontSize: '16px'
//             }}
//           />
//         </div>

//         <div style={{ 
//           display: 'flex', 
//           gap: '10px',
//           borderTop: '1px solid #eee',
//           paddingTop: '20px'
//         }}>
//           <button 
//             onClick={handleSave}
//             disabled={!siteName.trim()}
//             style={{ 
//               flex: 1,
//               padding: '12px 20px', 
//               backgroundColor: siteName.trim() ? '#1b5e20' : '#ccc', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '6px', 
//               cursor: siteName.trim() ? 'pointer' : 'not-allowed',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             Add Site
//           </button>
          
//           <button 
//             onClick={onClose}
//             style={{ 
//               flex: 1,
//               padding: '12px 20px', 
//               backgroundColor: '#f5f5f5', 
//               color: '#333', 
//               border: '1px solid #ddd',
//               borderRadius: '6px', 
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const FuelStoreQRScannerModal = ({ onScan, onClose }) => {
//   const [manualInput, setManualInput] = useState('');
//   const [showManualInput, setShowManualInput] = useState(false);

//   const handleManualSubmit = () => {
//     if (manualInput.trim()) {
//       onScan(manualInput);
//       onClose();
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.95)',
//       zIndex: 1000,
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '25px',
//         borderRadius: '12px',
//         maxWidth: '500px',
//         width: '100%'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h3 style={{ margin: 0, color: '#1b5e20' }}>📱 Scan Fuel Store QR Code</h3>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '24px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         {!showManualInput ? (
//           <>
//             <div style={{ textAlign: 'center', marginBottom: '25px' }}>
//               <div style={{ fontSize: '64px', marginBottom: '10px' }}>📷</div>
//               <p style={{ color: '#666', marginBottom: '20px' }}>Point camera at fuel store QR code to scan</p>
              
//               {/* QR Scanner integration */}
//               <div style={{
//                 backgroundColor: '#f5f5f5',
//                 height: '200px',
//                 borderRadius: '8px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 marginBottom: '20px',
//                 border: '2px dashed #ddd'
//               }}>
//                 <QRScanner onScan={onScan} onClose={onClose} />
//               </div>
//             </div>

//             <div style={{ 
//               display: 'flex', 
//               gap: '10px',
//               borderTop: '1px solid #eee',
//               paddingTop: '20px'
//             }}>
//               <button 
//                 onClick={() => setShowManualInput(true)}
//                 style={{ 
//                   flex: 1,
//                   padding: '12px 20px', 
//                   backgroundColor: '#2196f3', 
//                   color: 'white', 
//                   border: 'none',
//                   borderRadius: '6px', 
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 📝 Enter Manually
//               </button>
              
//               <button 
//                 onClick={onClose}
//                 style={{ 
//                   flex: 1,
//                   padding: '12px 20px', 
//                   backgroundColor: '#f5f5f5', 
//                   color: '#333', 
//                   border: '1px solid #ddd',
//                   borderRadius: '6px', 
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             <div style={{ marginBottom: '25px' }}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
//                 Enter Fuel Store Manually:
//               </label>
//               <input
//                 type="text"
//                 value={manualInput}
//                 onChange={(e) => setManualInput(e.target.value)}
//                 placeholder="Enter fuel store name or code..."
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: '2px solid #1b5e20',
//                   borderRadius: '6px',
//                   fontSize: '16px'
//                 }}
//               />
//             </div>

//             <div style={{ 
//               display: 'flex', 
//               gap: '10px',
//               borderTop: '1px solid #eee',
//               paddingTop: '20px'
//             }}>
//               <button 
//                 onClick={handleManualSubmit}
//                 disabled={!manualInput.trim()}
//                 style={{ 
//                   flex: 1,
//                   padding: '12px 20px', 
//                   backgroundColor: manualInput.trim() ? '#1b5e20' : '#ccc', 
//                   color: 'white', 
//                   border: 'none',
//                   borderRadius: '6px', 
//                   cursor: manualInput.trim() ? 'pointer' : 'not-allowed',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 Save Fuel Store
//               </button>
              
//               <button 
//                 onClick={() => setShowManualInput(false)}
//                 style={{ 
//                   flex: 1,
//                   padding: '12px 20px', 
//                   backgroundColor: '#f5f5f5', 
//                   color: '#333', 
//                   border: '1px solid #ddd',
//                   borderRadius: '6px', 
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 Back to Scan
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // ==================== MACHINE LOG BOOK MODAL ====================

// const MachineLogBookModal = ({ 
//   onClose, 
//   currentVehicle, 
//   userId,
//   user,
//   formData 
// }) => {
//   const [logEntries, setLogEntries] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedEntry, setSelectedEntry] = useState(null);
//   const [newLogEntry, setNewLogEntry] = useState({
//     date: new Date().toISOString().split('T')[0],
//     machineNumber: currentVehicle?.plantNumber || formData?.plantNumber || '',
//     machineName: currentVehicle?.plantName || formData?.plantName || '',
//     operationHours: '',
//     fuelConsumed: '',
//     maintenancePerformed: '',
//     issuesReported: '',
//     operatorName: user?.fullName || '',
//     operatorId: userId,
//     remarks: '',
//     odometerReading: formData?.odometerKilos || '',
//     serviceType: 'Preventive Maintenance',
//     status: 'Completed'
//   });
//   const [showNewEntryForm, setShowNewEntryForm] = useState(false);

//   useEffect(() => {
//     loadLogEntries();
//   }, [userId, currentVehicle, formData]);

//   const loadLogEntries = async () => {
//     setIsLoading(true);
//     try {
//       const savedLogs = JSON.parse(localStorage.getItem(`machine_logs_${userId}`) || '[]');
//       const machineNumber = currentVehicle?.plantNumber || formData?.plantNumber;
//       const filteredLogs = machineNumber 
//         ? savedLogs.filter(log => log.machineNumber === machineNumber)
//         : savedLogs;
      
//       setLogEntries(filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date)));
//     } catch (error) {
//       console.error('Error loading log entries:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSaveLogEntry = () => {
//     if (!newLogEntry.operationHours || !newLogEntry.machineNumber) {
//       alert('Please fill in required fields: Operation Hours and Machine Number');
//       return;
//     }

//     const logEntry = {
//       ...newLogEntry,
//       id: Date.now(),
//       timestamp: new Date().toISOString(),
//       createdBy: userId
//     };

//     const savedLogs = JSON.parse(localStorage.getItem(`machine_logs_${userId}`) || '[]');
//     savedLogs.push(logEntry);
//     localStorage.setItem(`machine_logs_${userId}`, JSON.stringify(savedLogs));

//     setLogEntries(prev => [logEntry, ...prev]);
//     setNewLogEntry({
//       date: new Date().toISOString().split('T')[0],
//       machineNumber: currentVehicle?.plantNumber || formData?.plantNumber || '',
//       machineName: currentVehicle?.plantName || formData?.plantName || '',
//       operationHours: '',
//       fuelConsumed: '',
//       maintenancePerformed: '',
//       issuesReported: '',
//       operatorName: user?.fullName || '',
//       operatorId: userId,
//       remarks: '',
//       odometerReading: formData?.odometerKilos || '',
//       serviceType: 'Preventive Maintenance',
//       status: 'Completed'
//     });
//     setShowNewEntryForm(false);

//     alert('✅ Machine log entry saved successfully!');
//   };

//   const calculateTotalHours = () => {
//     return logEntries.reduce((total, log) => total + parseFloat(log.operationHours || 0), 0).toFixed(1);
//   };

//   const calculateTotalFuel = () => {
//     return logEntries.reduce((total, log) => total + parseFloat(log.fuelConsumed || 0), 0).toFixed(1);
//   };

//   const getStatusColor = (status) => {
//     switch(status?.toLowerCase()) {
//       case 'completed': return '#4caf50';
//       case 'in-progress': return '#ff9800';
//       case 'pending': return '#f44336';
//       default: return '#757575';
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.95)',
//       zIndex: 1001,
//       display: 'flex',
//       flexDirection: 'column',
//       padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '20px',
//         borderRadius: '12px',
//         maxWidth: '1200px',
//         width: '100%',
//         maxHeight: '90vh',
//         margin: 'auto',
//         overflow: 'hidden',
//         display: 'flex',
//         flexDirection: 'column'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//             <h3 style={{ margin: 0, color: '#1b5e20' }}>
//               📖 Machine Log Book
//             </h3>
//             <div style={{ fontSize: '14px', color: '#666' }}>
//               {currentVehicle?.plantNumber ? `Vehicle: ${currentVehicle.plantNumber}` : 'No vehicle selected'}
//             </div>
//           </div>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '24px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         <div style={{ 
//           backgroundColor: '#f0f7ff', 
//           padding: '15px', 
//           borderRadius: '8px',
//           marginBottom: '20px',
//           border: '1px solid #bbdefb'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <h4 style={{ margin: 0, color: '#1976d2' }}>📊 Log Book Statistics</h4>
//             <button 
//               onClick={() => setShowNewEntryForm(true)}
//               style={{ 
//                 padding: '8px 16px',
//                 backgroundColor: '#1b5e20',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500'
//               }}
//             >
//               + New Log Entry
//             </button>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
//             <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#1565c0' }}>📋 Total Entries</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{logEntries.length}</div>
//             </div>
//             <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#1b5e20' }}>⏱️ Total Hours</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{calculateTotalHours()} hrs</div>
//             </div>
//             <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>⛽ Fuel Used</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{calculateTotalFuel()} L</div>
//             </div>
//             <div style={{ backgroundColor: '#f3e5f5', padding: '10px', borderRadius: '6px' }}>
//               <div style={{ fontWeight: 'bold', color: '#7b1fa2' }}>🔧 Active Issues</div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
//                 {logEntries.filter(log => log.issuesReported && log.status !== 'Completed').length}
//               </div>
//             </div>
//           </div>
//         </div>

//         {showNewEntryForm ? (
//           <div style={{ 
//             flex: 1,
//             overflowY: 'auto',
//             padding: '20px',
//             backgroundColor: '#f8f9fa',
//             borderRadius: '8px',
//             marginBottom: '20px'
//           }}>
//             <h4 style={{ margin: '0 0 20px 0', color: '#1b5e20' }}>➕ New Log Entry</h4>
            
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Date *</label>
//                 <input
//                   type="date"
//                   value={newLogEntry.date}
//                   onChange={(e) => setNewLogEntry({...newLogEntry, date: e.target.value})}
//                   style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
//                 />
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Machine Number *</label>
//                 <input
//                   type="text"
//                   value={newLogEntry.machineNumber}
//                   onChange={(e) => setNewLogEntry({...newLogEntry, machineNumber: e.target.value})}
//                   placeholder="Enter machine number"
//                   style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
//                 />
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Operation Hours *</label>
//                 <input
//                   type="number"
//                   value={newLogEntry.operationHours}
//                   onChange={(e) => setNewLogEntry({...newLogEntry, operationHours: e.target.value})}
//                   placeholder="Enter hours"
//                   step="0.1"
//                   style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
//                 />
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Odometer Reading (KM)</label>
//                 <input
//                   type="number"
//                   value={newLogEntry.odometerReading}
//                   onChange={(e) => setNewLogEntry({...newLogEntry, odometerReading: e.target.value})}
//                   placeholder="Enter KM reading"
//                   step="0.1"
//                   style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
//                 />
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Service Type</label>
//                 <select
//                   value={newLogEntry.serviceType}
//                   onChange={(e) => setNewLogEntry({...newLogEntry, serviceType: e.target.value})}
//                   style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
//                 >
//                   <option value="Preventive Maintenance">Preventive Maintenance</option>
//                   <option value="Corrective Maintenance">Corrective Maintenance</option>
//                   <option value="Emergency Repair">Emergency Repair</option>
//                   <option value="Scheduled Service">Scheduled Service</option>
//                   <option value="Inspection">Inspection</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Status</label>
//                 <select
//                   value={newLogEntry.status}
//                   onChange={(e) => setNewLogEntry({...newLogEntry, status: e.target.value})}
//                   style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
//                 >
//                   <option value="Completed">Completed</option>
//                   <option value="In-Progress">In-Progress</option>
//                   <option value="Pending">Pending</option>
//                   <option value="On Hold">On Hold</option>
//                 </select>
//               </div>
//             </div>
            
//             <div style={{ marginBottom: '20px' }}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Maintenance Performed</label>
//               <textarea
//                 value={newLogEntry.maintenancePerformed}
//                 onChange={(e) => setNewLogEntry({...newLogEntry, maintenancePerformed: e.target.value})}
//                 placeholder="Describe maintenance activities..."
//                 rows="3"
//                 style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
//               />
//             </div>
            
//             <div style={{ marginBottom: '20px' }}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Issues Reported</label>
//               <textarea
//                 value={newLogEntry.issuesReported}
//                 onChange={(e) => setNewLogEntry({...newLogEntry, issuesReported: e.target.value})}
//                 placeholder="Report any issues found..."
//                 rows="2"
//                 style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
//               />
//             </div>
            
//             <div style={{ marginBottom: '25px' }}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Remarks</label>
//               <textarea
//                 value={newLogEntry.remarks}
//                 onChange={(e) => setNewLogEntry({...newLogEntry, remarks: e.target.value})}
//                 placeholder="Additional notes..."
//                 rows="2"
//                 style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
//               />
//             </div>
            
//             <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//               <button 
//                 onClick={() => setShowNewEntryForm(false)}
//                 style={{ 
//                   padding: '10px 20px',
//                   backgroundColor: '#f5f5f5',
//                   color: '#333',
//                   border: '1px solid #ddd',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleSaveLogEntry}
//                 style={{ 
//                   padding: '10px 20px',
//                   backgroundColor: '#1b5e20',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 Save Log Entry
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div style={{ 
//             flex: 1,
//             overflowY: 'auto',
//             paddingRight: '10px'
//           }}>
//             <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>📋 Log Entries ({logEntries.length})</h4>
            
//             {isLoading ? (
//               <div style={{ textAlign: 'center', padding: '40px' }}>
//                 <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
//                 <p>Loading log entries...</p>
//               </div>
//             ) : logEntries.length > 0 ? (
//               <div style={{ display: 'grid', gap: '10px' }}>
//                 {logEntries.map(log => (
//                   <div 
//                     key={log.id}
//                     style={{ 
//                       backgroundColor: '#f8f9fa',
//                       borderRadius: '8px',
//                       padding: '15px',
//                       border: '1px solid #ddd',
//                       cursor: 'pointer'
//                     }}
//                     onClick={() => setSelectedEntry(log)}
//                   >
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                         <span style={{ 
//                           padding: '4px 8px', 
//                           backgroundColor: getStatusColor(log.status),
//                           color: 'white',
//                           borderRadius: '4px',
//                           fontSize: '12px',
//                           fontWeight: '600'
//                         }}>
//                           {log.status || 'N/A'}
//                         </span>
//                         <span style={{ fontWeight: 'bold', color: '#333' }}>{log.machineNumber}</span>
//                         <span style={{ color: '#666', fontSize: '14px' }}>{log.serviceType}</span>
//                       </div>
//                       <span style={{ color: '#666', fontSize: '14px' }}>{log.date}</span>
//                     </div>
                    
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
//                       <div><strong>Hours:</strong> {log.operationHours} hrs</div>
//                       <div><strong>Odometer:</strong> {log.odometerReading || 'N/A'} KM</div>
//                       <div><strong>Operator:</strong> {log.operatorName}</div>
//                     </div>
                    
//                     {log.issuesReported && (
//                       <div style={{ 
//                         marginTop: '10px',
//                         padding: '8px',
//                         backgroundColor: '#ffebee',
//                         borderRadius: '4px',
//                         borderLeft: '3px solid #f44336'
//                       }}>
//                         <strong>⚠️ Issues:</strong> {log.issuesReported}
//                       </div>
//                     )}
                    
//                     {log.maintenancePerformed && (
//                       <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
//                         <strong>🔧 Maintenance:</strong> {log.maintenancePerformed.substring(0, 100)}...
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div style={{ 
//                 textAlign: 'center', 
//                 padding: '40px', 
//                 color: '#666',
//                 backgroundColor: '#f8f9fa',
//                 borderRadius: '8px'
//               }}>
//                 <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
//                 <h4 style={{ color: '#555' }}>No log entries found</h4>
//                 <p>Create your first log entry for this machine</p>
//                 <button 
//                   onClick={() => setShowNewEntryForm(true)}
//                   style={{ 
//                     marginTop: '15px',
//                     padding: '10px 20px',
//                     backgroundColor: '#1b5e20',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '6px',
//                     cursor: 'pointer',
//                     fontSize: '14px',
//                     fontWeight: '500'
//                   }}
//                 >
//                   + Create First Entry
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginTop: '20px',
//           paddingTop: '20px',
//           borderTop: '1px solid #eee'
//         }}>
//           <div style={{ fontSize: '14px', color: '#666' }}>
//             Machine: {currentVehicle?.plantNumber || 'N/A'} • Total Hours: {calculateTotalHours()} • Entries: {logEntries.length}
//           </div>
//           <button 
//             onClick={onClose}
//             style={{ 
//               padding: '10px 20px', 
//               backgroundColor: '#1b5e20', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '6px', 
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             Close Log Book
//           </button>
//         </div>
//       </div>

//       {selectedEntry && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0,0,0,0.95)',
//           zIndex: 1002,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '40px'
//         }}>
//           <div style={{
//             backgroundColor: 'white',
//             padding: '30px',
//             borderRadius: '12px',
//             maxWidth: '800px',
//             width: '100%'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//               <h3 style={{ margin: 0, color: '#1b5e20' }}>
//                 📋 Log Entry Details
//               </h3>
//               <button 
//                 onClick={() => setSelectedEntry(null)} 
//                 style={{ 
//                   background: 'none', 
//                   border: 'none', 
//                   fontSize: '24px', 
//                   cursor: 'pointer',
//                   color: '#666'
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <div style={{ 
//               backgroundColor: '#f8f9fa',
//               padding: '20px',
//               borderRadius: '8px',
//               marginBottom: '20px',
//               border: '1px solid #ddd'
//             }}>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Date</div>
//                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
//                     {selectedEntry.date}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Machine</div>
//                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1b5e20' }}>
//                     {selectedEntry.machineNumber}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Status</div>
//                   <div style={{ 
//                     fontSize: '14px', 
//                     fontWeight: 'bold', 
//                     color: 'white',
//                     backgroundColor: getStatusColor(selectedEntry.status),
//                     padding: '4px 8px',
//                     borderRadius: '4px',
//                     display: 'inline-block'
//                   }}>
//                     {selectedEntry.status}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Operation Hours</div>
//                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
//                     {selectedEntry.operationHours} hrs
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Odometer</div>
//                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
//                     {selectedEntry.odometerReading || 'N/A'} KM
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Service Type</div>
//                   <div style={{ fontSize: '16px', color: '#333' }}>
//                     {selectedEntry.serviceType}
//                   </div>
//                 </div>
//               </div>

//               <div style={{ marginBottom: '15px' }}>
//                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Maintenance Performed</div>
//                 <div style={{ 
//                   backgroundColor: '#e8f5e9', 
//                   padding: '10px', 
//                   borderRadius: '6px',
//                   fontSize: '14px',
//                   color: '#1b5e20'
//                 }}>
//                   {selectedEntry.maintenancePerformed || 'No maintenance details'}
//                 </div>
//               </div>

//               {selectedEntry.issuesReported && (
//                 <div style={{ marginBottom: '15px' }}>
//                   <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Issues Reported</div>
//                   <div style={{ 
//                     backgroundColor: '#ffebee', 
//                     padding: '10px', 
//                     borderRadius: '6px',
//                     fontSize: '14px',
//                     color: '#c62828'
//                   }}>
//                     {selectedEntry.issuesReported}
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Remarks</div>
//                 <div style={{ 
//                   backgroundColor: '#e3f2fd', 
//                   padding: '10px', 
//                   borderRadius: '6px',
//                   fontSize: '14px',
//                   color: '#1565c0'
//                 }}>
//                   {selectedEntry.remarks || 'No remarks'}
//                 </div>
//               </div>
//             </div>

//             <div style={{ 
//               backgroundColor: '#f5f5f5', 
//               padding: '15px', 
//               borderRadius: '8px',
//               marginBottom: '20px'
//             }}>
//               <div style={{ fontSize: '14px', color: '#666' }}>
//                 <strong>Operator:</strong> {selectedEntry.operatorName} • 
//                 <strong> Created:</strong> {new Date(selectedEntry.timestamp).toLocaleString()}
//               </div>
//             </div>

//             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//               <button 
//                 onClick={() => setSelectedEntry(null)}
//                 style={{ 
//                   padding: '10px 20px', 
//                   backgroundColor: '#1b5e20', 
//                   color: 'white', 
//                   border: 'none',
//                   borderRadius: '6px', 
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 Close Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ==================== MAIN SERVICE TRUCK DRIVER DASHBOARD ====================

// const ServiceTruckDriverDashboard = ({ user, onLogout, onNavigateToAdmin }) => {
//   // ========== STATE VARIABLES ==========
//   const [formData, setFormData] = useState({
//     plantNumber: '',
//     plantName: '',
//     plantType: '',
//     serviceDetails: '',
//     odometerKilos: '',
//     odometerHours: '',
//     odometerKilosPhotoId: null,
//     odometerHoursPhotoId: null,
//     odometerKilosPhotoName: '',
//     odometerHoursPhotoName: '',
//     odometerKilosPhotoPath: '',
//     odometerHoursPhotoPath: '',
//     fuelQuantity: '',
//     fuelAdded: '',
//     transactionType: 'Service',
//     contractType: '',
//     receiverName: user?.fullName || '',
//     receiverCompany: user?.company || '',
//     employmentNumber: user?.employeeNumber || '',
//     transactionDate: new Date().toISOString().split('T')[0],
//     remarks: '',
//     serviceStatus: 'completed',
//     previousMeterReading: '',
//     currentMeterReadingBefore: '',
//     currentMeterReadingAfter: '',
//     meterVarianceFlag: false,
//     readingFlag: '',
//     meterVarianceMessage: '',
//     fuelStoreCategory: '',
//     selectedFuelStore: '',
//     // Meter reading photo data
//     meterReadingPhotoId: null,
//     meterReadingPhotoName: '',
//     meterReadingPhotoPath: '',
//     previousMeterReadingPhotoId: null,
//     previousMeterReadingPhotoName: '',
//     previousMeterReadingPhotoPath: ''
//   });
  
//   const [showQRScanner, setShowQRScanner] = useState(false);
//   const [showOdometerModal, setShowOdometerModal] = useState(null);
//   const [showPhotoGallery, setShowPhotoGallery] = useState(false);
//   const [showFuelEditModal, setShowFuelEditModal] = useState(false);
//   const [showCustomSiteModal, setShowCustomSiteModal] = useState(false);
//   const [showFuelStoreQRScanner, setShowFuelStoreQRScanner] = useState(false);
//   const [showMachineLogBook, setShowMachineLogBook] = useState(false);
//   const [showMeterReadingModal, setShowMeterReadingModal] = useState(null); // 'before' or 'after'
  
//   const [transactions, setTransactions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [shiftStatus, setShiftStatus] = useState('OFF DUTY');
//   const [shiftStartTime, setShiftStartTime] = useState(null);
//   const [currentVehicle, setCurrentVehicle] = useState(null);
//   const [activeNav, setActiveNav] = useState('dashboard');
//   const [odometerPhotos, setOdometerPhotos] = useState({
//     kilos: null,
//     hours: null
//   });
//   const [meterReadingPhotos, setMeterReadingPhotos] = useState({
//     before: null,
//     after: null
//   });

//   // Additional state for sidebar
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [notifications, setNotifications] = useState([
//     { id: 1, message: 'Service due for A-APB05', time: '2 hours ago', read: false },
//     { id: 2, message: 'Fuel low in FSH01', time: '1 day ago', read: true },
//     { id: 3, message: 'Weekly report ready', time: '2 days ago', read: true }
//   ]);

//   const [vehicleStatus, setVehicleStatus] = useState({
//     currentOdometer: 0,
//     fuelLevel: 0,
//     shiftStatus: 'Off Duty',
//     range: 0,
//     consumption: 0,
//     lastRefuel: 'Never',
//     nextService: 'Due',
//     shiftStart: null
//   });

//   const [serviceStats, setServiceStats] = useState({
//     currentJobs: 3,
//     completedToday: 2,
//     urgentServices: 1,
//     totalServices: 15,
//     avgServiceTime: '2.5 hrs'
//   });

//   const fileInputRef = useRef(null);

// //   // Fuel stores with categories
//   const fuelStores = {
//     service_trucks: ['FSH01 - 01 (650 L)', 'FSH02 - 01', 'FSH03 - 01', 'FSH04 - 01'],
//     fuel_trailers: ['SLD 02 (1000L)', 'SLD 07 (2000L)', 'SLD 09 (1000L)'],
//     underground_tanks: [
//       'UDT 49 (Workshop Underground Tank)',
//       'UPT 49 (Workshop Petrol Underground Tank)',
//       'UDT 890 (Palmiet Underground Tank)',
//       'STD 02 (Musina Static Tank)',
//       'STD 05 (Musina Static Tank)'
//     ]
//   };

//   const transactionTypes = [
//     'Plant Fuel to Contract', 'Plant Fuel Return from Contract', 'Stock Issue to Balance Sheet',
//     'Stock Issue to Contracts', 'Stock Issue to Overheads', 'Stock Issue Plant',
//     'Stock Receipt from Supplier', 'Stock Return from Balance Sheet', 'Stock Return from Contract',
//     'Stock Return from Plant', 'Stock Return from Overheads', 'Stock Return to Supplier', 'Stock Take On'
//   ];

//   const contractOptions = [
//     'AMPLANT 49', 'HILLARY (Site 2163)', 'HILLARY (Site 2102)', 
//     'Polokwane Surfacing (Site 1809)', 'Polokwane Surfacing 890', 'Sundries', 'Custom Site'
//   ];


//   // Plant master list
//   const plantMasterList = {
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
//     'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'plant' },
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
//     'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//   };

//   // Initialize data
//   useEffect(() => {
//     const userTransactions = transactionService.getAllTransactions()
//       .filter(t => t.userId === user.id && t.transactionType === 'Service')
//       .slice(0, 10);
//     setTransactions(userTransactions);

//     const savedShift = localStorage.getItem(`service_driver_${user.id}_shift`);
//     if (savedShift) {
//       const shiftData = JSON.parse(savedShift);
//       setShiftStatus('ON DUTY');
//       setShiftStartTime(shiftData.startTime);
//       setCurrentVehicle(shiftData.vehicle);
      
//       if (shiftData.plantNumber) {
//         setFormData(prev => ({
//           ...prev,
//           plantNumber: shiftData.plantNumber,
//           plantName: shiftData.plantName,
//           plantType: shiftData.plantType
//         }));
        
//         setVehicleStatus(prev => ({
//           ...prev,
//           shiftStatus: 'On Duty',
//           shiftStart: shiftData.startTime
//         }));
//       }
//     }

//     const loadSavedPhotos = async () => {
//       try {
//         const savedPhotos = await getAllPhotosFromDatabase(user.id);
//         const kilosPhoto = savedPhotos.find(p => p.type === 'kilos');
//         const hoursPhoto = savedPhotos.find(p => p.type === 'hours');
//         const meterBeforePhoto = savedPhotos.find(p => p.type === 'meter_before');
//         const meterAfterPhoto = savedPhotos.find(p => p.type === 'meter_after');
        
//         if (kilosPhoto || hoursPhoto || meterBeforePhoto || meterAfterPhoto) {
//           setOdometerPhotos({
//             kilos: kilosPhoto || null,
//             hours: hoursPhoto || null
//           });
//           setMeterReadingPhotos({
//             before: meterBeforePhoto || null,
//             after: meterAfterPhoto || null
//           });
//         }
//       } catch (error) {
//         console.error('Error loading saved photos:', error);
//       }
//     };
    
//     loadSavedPhotos();
//   }, [user.id]);

//   // QR Scan handler for vehicle
//   const handleQRScan = (scannedData) => {
//     let plantNumber = '';
//     let plantInfo = null;

//     if (typeof scannedData === 'string') {
//       try {
//         const parsedData = JSON.parse(scannedData);
//         plantNumber = parsedData.plantNumber;
//         if (plantNumber) {
//           const masterPlant = plantMasterList[plantNumber];
//           plantInfo = masterPlant || {
//             name: parsedData.plantName || plantNumber,
//             type: parsedData.plantType || 'Equipment',
//             fuelType: parsedData.fuelType || 'Diesel',
//             category: parsedData.category || 'general'
//           };
//         }
//       } catch (error) {
//         plantNumber = scannedData;
//         const masterPlant = plantMasterList[plantNumber];
//         plantInfo = masterPlant || {
//           name: plantNumber, type: 'Unknown Equipment', fuelType: 'Diesel', category: 'general'
//         };
//       }
//     }

//     setFormData(prev => ({
//       ...prev,
//       plantNumber: plantNumber,
//       plantName: plantInfo.name,
//       plantType: plantInfo.type,
//       fuelType: plantInfo.fuelType
//     }));

//     setShowQRScanner(false);
//     alert(`✅ Vehicle scanned: ${plantNumber} - ${plantInfo.name}`);
//   };

//   // QR Scan handler for fuel store
//   const handleFuelStoreQRScan = (scannedData) => {
//     let fuelStore = '';
    
//     if (typeof scannedData === 'string') {
//       try {
//         const parsedData = JSON.parse(scannedData);
//         fuelStore = parsedData.storeName || parsedData.name || scannedData;
//       } catch (error) {
//         fuelStore = scannedData;
//       }
//     }
    
//     // Auto-detect fuel store category based on scanned data
//     let detectedCategory = '';
//     let detectedStore = '';
    
//     // Check for service trucks
//     if (fuelStore.includes('FSH') || fuelStore.toLowerCase().includes('service truck')) {
//       detectedCategory = 'service_trucks';
//       detectedStore = fuelStores.service_trucks.find(store => store.includes(fuelStore.substring(0, 5))) || fuelStore;
//     }
//     // Check for fuel trailers
//     else if (fuelStore.includes('SLD') || fuelStore.toLowerCase().includes('trailer')) {
//       detectedCategory = 'fuel_trailers';
//       detectedStore = fuelStores.fuel_trailers.find(store => store.includes(fuelStore.substring(0, 4))) || fuelStore;
//     }
//     // Check for underground/static tanks
//     else if (fuelStore.includes('UDT') || fuelStore.includes('STD') || fuelStore.includes('UPT') || 
//              fuelStore.toLowerCase().includes('tank')) {
//       detectedCategory = 'underground_tanks';
//       detectedStore = fuelStores.underground_tanks.find(store => store.includes(fuelStore.substring(0, 4))) || fuelStore;
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       fuelStoreCategory: detectedCategory || prev.fuelStoreCategory,
//       selectedFuelStore: detectedStore || fuelStore
//     }));
    
//     setShowFuelStoreQRScanner(false);
//     alert(`✅ Fuel store scanned: ${detectedStore || fuelStore}${detectedCategory ? ` (Category: ${detectedCategory.replace('_', ' ')})` : ''}`);
//   };

//   // Odometer photo upload handler
//   const handleOdometerUpload = (result) => {
//     const { type, value, photoData } = result;
    
//     const photoInfo = {
//       [`odometer${type.charAt(0).toUpperCase() + type.slice(1)}`]: value,
//       [`odometer${type.charAt(0).toUpperCase() + type.slice(1)}PhotoId`]: photoData?.photoId || null,
//       [`odometer${type.charAt(0).toUpperCase() + type.slice(1)}PhotoName`]: photoData?.filename || '',
//       [`odometer${type.charAt(0).toUpperCase() + type.slice(1)}PhotoPath`]: photoData?.folderPath || ''
//     };
    
//     setFormData(prev => ({
//       ...prev,
//       ...photoInfo
//     }));

//     setOdometerPhotos(prev => ({
//       ...prev,
//       [type]: photoData
//     }));

//     setShowOdometerModal(null);
//   };

//   // Meter reading photo upload handler
//   const handleMeterReadingUpload = (result) => {
//     const { type, value, photoData, isMeterReading } = result;
    
//     if (isMeterReading && showMeterReadingModal) {
//       const isBefore = showMeterReadingModal === 'before';
      
//       const photoInfo = {
//         [isBefore ? 'previousMeterReading' : 'currentMeterReadingBefore']: value,
//         [isBefore ? 'previousMeterReadingPhotoId' : 'meterReadingPhotoId']: photoData?.photoId || null,
//         [isBefore ? 'previousMeterReadingPhotoName' : 'meterReadingPhotoName']: photoData?.filename || '',
//         [isBefore ? 'previousMeterReadingPhotoPath' : 'meterReadingPhotoPath']: photoData?.folderPath || ''
//       };
      
//       setFormData(prev => ({
//         ...prev,
//         ...photoInfo
//       }));

//       setMeterReadingPhotos(prev => ({
//         ...prev,
//         [showMeterReadingModal]: photoData
//       }));

//       setShowMeterReadingModal(null);
//     }
//   };

//   // Fuel quantity edit handler
//   const handleFuelQuantityEdit = (newQuantity) => {
//     setFormData(prev => ({
//       ...prev,
//       fuelQuantity: newQuantity
//     }));
//     setShowFuelEditModal(false);
//   };

//   // Custom site handler
//   const handleAddCustomSite = (customSite) => {
//     setFormData(prev => ({
//       ...prev,
//       contractType: customSite
//     }));
//     setShowCustomSiteModal(false);
//   };

//   // Handle input change for meter readings with odometer logic
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => {
//       const updatedData = { ...prev, [name]: value };
      
//       // Odometer logic: Calculate current reading after fuel addition
//       if (name === 'currentMeterReadingBefore' || name === 'fuelQuantity') {
//         const currentReading = parseFloat(updatedData.currentMeterReadingBefore) || 0;
//         const fuelQuantity = parseFloat(updatedData.fuelQuantity) || 0;
//         updatedData.currentMeterReadingAfter = (currentReading + fuelQuantity).toFixed(2);
        
//         // Also update odometer kilos if it's empty and we have a meaningful reading
//         if (!updatedData.odometerKilos && currentReading > 0) {
//           updatedData.odometerKilos = currentReading.toString();
//         }
//       }
      
//       // Odometer variance check logic
//       if (name === 'currentMeterReadingBefore' && updatedData.previousMeterReading) {
//         const previous = parseFloat(updatedData.previousMeterReading);
//         const current = parseFloat(value);
        
//         if (current > 0) {
//           // Update odometer kilos with current reading
//           updatedData.odometerKilos = current.toString();
          
//           // Calculate variance
//           const variance = current - previous;
          
//           if (variance < 0) {
//             updatedData.meterVarianceFlag = true;
//             updatedData.readingFlag = 'critical';
//             updatedData.meterVarianceMessage = `🚨 Critical: Current reading (${current}) is less than previous reading (${previous})!`;
//           } else if (variance > 1000) {
//             updatedData.meterVarianceFlag = true;
//             updatedData.readingFlag = 'warning';
//             updatedData.meterVarianceMessage = `⚠️ Warning: Large variance detected: ${variance} units`;
//           } else if (variance > 100) {
//             updatedData.meterVarianceFlag = true;
//             updatedData.readingFlag = 'info';
//             updatedData.meterVarianceMessage = `ℹ️ Note: Variance detected: ${variance} units`;
//           } else {
//             updatedData.meterVarianceFlag = false;
//             updatedData.meterVarianceMessage = `✓ Normal variance: ${variance} units`;
//           }
//         }
//       }
      
//       // Auto-select fuel store category based on selected store
//       if (name === 'selectedFuelStore') {
//         const store = value;
//         if (store) {
//           // Check which category this store belongs to
//           if (fuelStores.service_trucks.includes(store)) {
//             updatedData.fuelStoreCategory = 'service_trucks';
//           } else if (fuelStores.fuel_trailers.includes(store)) {
//             updatedData.fuelStoreCategory = 'fuel_trailers';
//           } else if (fuelStores.underground_tanks.includes(store)) {
//             updatedData.fuelStoreCategory = 'underground_tanks';
//           }
//         }
//       }
      
//       return updatedData;
//     });
//   };

//   // Calculate today's distance based on odometer readings
//   const getTodayDistance = () => {
//     const today = new Date().toDateString();
//     const todayTransactions = transactions.filter(t => 
//       new Date(t.transactionDate).toDateString() === today
//     );
    
//     if (todayTransactions.length > 0) {
//       // Calculate distance from odometer differences
//       const totalDistance = todayTransactions.reduce((sum, t) => {
//         const odometer = parseFloat(t.odometerKilos) || 0;
//         const previousOdometer = parseFloat(t.previousMeterReading) || 0;
//         return sum + (odometer - previousOdometer);
//       }, 0);
      
//       return totalDistance > 0 ? totalDistance.toFixed(1) : '0';
//     }
    
//     return '0';
//   };

//   // Service submission with enhanced odometer logic
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       if (!formData.plantNumber) {
//         throw new Error('Please select a vehicle first');
//       }

//       if (shiftStatus === 'OFF DUTY') {
//         throw new Error('Please start your shift before recording services');
//       }

//       // Calculate odometer difference
//       const previousReading = parseFloat(formData.previousMeterReading) || 0;
//       const currentReading = parseFloat(formData.currentMeterReadingBefore) || 0;
//       const odometerDifference = currentReading - previousReading;
      
//       // Update vehicle status with odometer reading
//       if (currentReading > 0) {
//         setVehicleStatus(prev => ({
//           ...prev,
//           currentOdometer: currentReading.toLocaleString(),
//           todayDistance: getTodayDistance()
//         }));
//       }

//       const serviceData = {
//         plantNumber: formData.plantNumber,
//         plantName: formData.plantName,
//         plantType: formData.plantType,
//         serviceType: 'General Service',
//         serviceDetails: formData.serviceDetails,
//         fuelQuantity: formData.fuelQuantity || '0',
//         fuelAdded: formData.fuelAdded || '0',
//         odometerKilos: formData.odometerKilos,
//         odometerHours: formData.odometerHours,
//         odometerPhotos: {
//           kilos: {
//             value: formData.odometerKilos,
//             photoId: formData.odometerKilosPhotoId,
//             photoName: formData.odometerKilosPhotoName,
//             photoPath: formData.odometerKilosPhotoPath
//           },
//           hours: {
//             value: formData.odometerHours,
//             photoId: formData.odometerHoursPhotoId,
//             photoName: formData.odometerHoursPhotoName,
//             photoPath: formData.odometerHoursPhotoPath
//           }
//         },
//         meterReadingPhotos: {
//           before: {
//             value: formData.currentMeterReadingBefore,
//             photoId: formData.meterReadingPhotoId,
//             photoName: formData.meterReadingPhotoName,
//             photoPath: formData.meterReadingPhotoPath
//           },
//           previous: {
//             value: formData.previousMeterReading,
//             photoId: formData.previousMeterReadingPhotoId,
//             photoName: formData.previousMeterReadingPhotoName,
//             photoPath: formData.previousMeterReadingPhotoPath
//           }
//         },
//         previousMeterReading: formData.previousMeterReading,
//         currentMeterReadingBefore: formData.currentMeterReadingBefore,
//         currentMeterReadingAfter: formData.currentMeterReadingAfter,
//         meterVarianceFlag: formData.meterVarianceFlag,
//         readingFlag: formData.readingFlag,
//         meterVarianceMessage: formData.meterVarianceMessage,
//         fuelStoreCategory: formData.fuelStoreCategory,
//         selectedFuelStore: formData.selectedFuelStore,
//         contractType: formData.contractType,
//         transactionType: 'Service',
//         receiverName: formData.receiverName,
//         receiverCompany: formData.receiverCompany,
//         employmentNumber: formData.employmentNumber,
//         transactionDate: formData.transactionDate,
//         remarks: formData.remarks,
//         serviceStatus: formData.serviceStatus,
//         shiftStatus: shiftStatus,
//         driverName: user.fullName,
//         timestamp: new Date().toISOString(),
//         folderPath: `services/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`,
//         odometerDifference: odometerDifference,
//         calculatedDistance: odometerDifference > 0 ? odometerDifference : 0
//       };

//       const transaction = transactionService.saveTransaction(serviceData, user);

//       setTransactions(prev => [transaction, ...prev]);

//       setServiceStats(prev => ({
//         ...prev,
//         completedToday: prev.completedToday + 1,
//         totalServices: prev.totalServices + 1
//       }));

//       // Update vehicle status with new odometer reading
//       if (formData.currentMeterReadingAfter) {
//         setVehicleStatus(prev => ({
//           ...prev,
//           currentOdometer: parseFloat(formData.currentMeterReadingAfter).toLocaleString()
//         }));
//       }

//       // Reset form but keep plant info
//       setFormData(prev => ({
//         ...prev,
//         serviceDetails: '',
//         fuelQuantity: '',
//         fuelAdded: '',
//         odometerKilos: '',
//         odometerHours: '',
//         odometerKilosPhotoId: null,
//         odometerHoursPhotoId: null,
//         odometerKilosPhotoName: '',
//         odometerHoursPhotoName: '',
//         odometerKilosPhotoPath: '',
//         odometerHoursPhotoPath: '',
//         previousMeterReading: formData.currentMeterReadingAfter || '',
//         currentMeterReadingBefore: '',
//         currentMeterReadingAfter: '',
//         meterVarianceFlag: false,
//         readingFlag: '',
//         meterVarianceMessage: '',
//         fuelStoreCategory: '',
//         selectedFuelStore: '',
//         contractType: '',
//         remarks: '',
//         meterReadingPhotoId: null,
//         meterReadingPhotoName: '',
//         meterReadingPhotoPath: '',
//         previousMeterReadingPhotoId: null,
//         previousMeterReadingPhotoName: '',
//         previousMeterReadingPhotoPath: ''
//       }));

//       setOdometerPhotos({ kilos: null, hours: null });
//       setMeterReadingPhotos({ before: null, after: null });

//       setSuccessMessage(`Service recorded successfully! Distance: ${odometerDifference > 0 ? odometerDifference.toFixed(1) + ' km' : 'N/A'}`);
//       setTimeout(() => setSuccessMessage(''), 3000);

//     } catch (error) {
//       window.alert(error.message || 'Failed to record service');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Shift handlers
//   const handleShiftStart = () => {
//     if (!formData.plantNumber) {
//       alert('Please scan or enter a plant number first to start your shift');
//       setShowQRScanner(true);
//       return;
//     }

//     const startTime = new Date().toLocaleString();
//     setShiftStatus('ON DUTY');
//     setShiftStartTime(startTime);
//     setCurrentVehicle(formData.plantNumber);
    
//     setVehicleStatus(prev => ({
//       ...prev,
//       shiftStatus: 'On Duty',
//       shiftStart: startTime
//     }));

//     const shiftData = {
//       startTime: startTime,
//       plantNumber: formData.plantNumber,
//       plantName: formData.plantName,
//       plantType: formData.plantType
//     };
//     localStorage.setItem(`service_driver_${user.id}_shift`, JSON.stringify(shiftData));

//     alert(`🔧 Service shift started at ${startTime}\nVehicle: ${formData.plantNumber} - ${formData.plantName}`);
//   };

//   const handleShiftEnd = () => {
//     const endTime = new Date().toLocaleString();
//     const startTime = shiftStartTime;
    
//     const duration = startTime ? 
//       `${Math.round((new Date() - new Date(startTime)) / (1000 * 60 * 60))} hours` : 
//       'N/A';

//     setShiftStatus('OFF DUTY');
//     setShiftStartTime(null);
//     setCurrentVehicle(null);
    
//     setVehicleStatus(prev => ({
//       ...prev,
//       shiftStatus: 'Off Duty',
//       shiftStart: null
//     }));
    
//     localStorage.removeItem(`service_driver_${user.id}_shift`);

//     alert(`🏁 Service shift ended at ${endTime}\nDuration: ${duration}\nVehicle: ${formData.plantNumber || 'N/A'}`);
//   };

//   // Navigation handler
//   const handleNavClick = (navItem) => {
//     setActiveNav(navItem);
//   };

//   // Format time display
//   const formatTime = (dateString) => {
//     if (!dateString) return '--:--';
//     const date = new Date(dateString);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Helper functions for avatar
//   const getAvatarColor = (name) => {
//     if (!name) return '#4caf50';
//     const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#8bc34a'];
//     const index = name.charCodeAt(0) % colors.length;
//     return colors[index];
//   };

//   const getUserInitials = (name) => {
//     if (!name) return 'U';
//     return name
//       .split(' ')
//       .map(part => part.charAt(0))
//       .join('')
//       .toUpperCase()
//       .substring(0, 2);
//   };

//   return (
//     <div style={{ 
//       backgroundColor: '#f8f9fa', 
//       minHeight: '100vh',
//       display: 'flex'
//     }}>
//       {/* ==================== SIDEBAR ==================== */}
//       <div style={{
//         width: sidebarCollapsed ? '80px' : '280px',
//         backgroundColor: '#1b5e20',
//         color: 'white',
//         transition: 'all 0.3s ease',
//         display: 'flex',
//         flexDirection: 'column',
//         position: 'sticky',
//         top: 0,
//         height: '100vh',
//         zIndex: 100
//       }}>
//         {/* Sidebar Header */}
//         <div style={{
//           padding: '20px',
//           borderBottom: '1px solid rgba(255,255,255,0.1)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between'
//         }}>
//           <button
//             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//             style={{
//               backgroundColor: 'transparent',
//               border: 'none',
//               color: 'white',
//               cursor: 'pointer',
//               padding: '8px',
//               borderRadius: '4px',
//               ':hover': {
//                 backgroundColor: 'rgba(255,255,255,0.1)'
//               }
//             }}
//           >
//             {sidebarCollapsed ? '→' : '←'}
//           </button>
//         </div>

//         {/* Navigation Menu */}
//         <div style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
//           <div style={{ marginBottom: '20px' }}>
//             {!sidebarCollapsed && (
//               <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
//                 Main Menu
//               </div>
//             )}
            
//             <button
//               onClick={() => handleNavClick('dashboard')}
//               style={{
//                 width: '100%',
//                 padding: sidebarCollapsed ? '15px 0' : '15px 20px',
//                 backgroundColor: activeNav === 'dashboard' ? 'rgba(255,255,255,0.15)' : 'transparent',
//                 color: 'white',
//                 border: 'none',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '14px',
//                 transition: 'all 0.3s ease',
//                 ':hover': {
//                   backgroundColor: 'rgba(255,255,255,0.1)'
//                 }
//               }}
//             >
//               <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🏠</span>
//               {!sidebarCollapsed && <span>Dashboard</span>}
//             </button>
            
//             <button
//               onClick={() => handleNavClick('history')}
//               style={{
//                 width: '100%',
//                 padding: sidebarCollapsed ? '15px 0' : '15px 20px',
//                 backgroundColor: activeNav === 'history' ? 'rgba(255,255,255,0.15)' : 'transparent',
//                 color: 'white',
//                 border: 'none',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '14px',
//                 transition: 'all 0.3s ease',
//                 ':hover': {
//                   backgroundColor: 'rgba(255,255,255,0.1)'
//                 }
//               }}
//             >
//               <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📋</span>
//               {!sidebarCollapsed && <span>Service History</span>}
//             </button>
            
//             <button
//               onClick={() => setShowPhotoGallery(true)}
//               style={{
//                 width: '100%',
//                 padding: sidebarCollapsed ? '15px 0' : '15px 20px',
//                 backgroundColor: 'transparent',
//                 color: 'white',
//                 border: 'none',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '14px',
//                 transition: 'all 0.3s ease',
//                 ':hover': {
//                   backgroundColor: 'rgba(255,255,255,0.1)'
//                 }
//               }}
//             >
//               <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📁</span>
//               {!sidebarCollapsed && <span>Photo Gallery</span>}
//             </button>
            
//             {/* MACHINE LOG BOOK MENU ITEM */}
//             <button
//               onClick={() => handleNavClick('logbook')}  // Changed from setShowMachineLogBook(true)
//               style={{
//                 width: '100%',
//                 padding: sidebarCollapsed ? '15px 0' : '15px 20px',
//                 backgroundColor: activeNav === 'logbook' ? 'rgba(255,255,255,0.15)' : 'transparent',
//                 color: 'white',
//                 border: 'none',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '14px',
//                 transition: 'all 0.3s ease',
//                 ':hover': {
//                   backgroundColor: 'rgba(255,255,255,0.1)'
//                 }
//               }}
//             >
//               <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📖</span>
//               {!sidebarCollapsed && <span>Machine Log Book</span>}
//             </button>
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             {!sidebarCollapsed && (
//               <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
//                 Quick Actions
//               </div>
//             )}
            
//             <button
//               onClick={() => setShowQRScanner(true)}
//               style={{
//                 width: '100%',
//                 padding: sidebarCollapsed ? '15px 0' : '15px 20px',
//                 backgroundColor: 'transparent',
//                 color: 'white',
//                 border: 'none',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '14px',
//                 transition: 'all 0.3s ease',
//                 ':hover': {
//                   backgroundColor: 'rgba(255,255,255,0.1)'
//                 }
//               }}
//             >
//               <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📱</span>
//               {!sidebarCollapsed && <span>Scan Vehicle</span>}
//             </button>
            
//             <button
//               onClick={() => setShowFuelStoreQRScanner(true)}
//               style={{
//                 width: '100%',
//                 padding: sidebarCollapsed ? '15px 0' : '15px 20px',
//                 backgroundColor: 'transparent',
//                 color: 'white',
//                 border: 'none',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '14px',
//                 transition: 'all 0.3s ease',
//                 ':hover': {
//                   backgroundColor: 'rgba(255,255,255,0.1)'
//                 }
//               }}
//             >
//               <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>⛽</span>
//               {!sidebarCollapsed && <span>Scan Fuel Store</span>}
//             </button>
            
//             <button
//               onClick={handleShiftStart}
//               disabled={shiftStatus === 'ON DUTY'}
//               style={{
//                 width: '100%',
//                 padding: sidebarCollapsed ? '15px 0' : '15px 20px',
//                 backgroundColor: shiftStatus === 'ON DUTY' ? 'rgba(255,255,255,0.1)' : 'transparent',
//                 color: shiftStatus === 'ON DUTY' ? 'rgba(255,255,255,0.5)' : 'white',
//                 border: 'none',
//                 cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '14px',
//                 transition: 'all 0.3s ease',
//                 ':hover': shiftStatus === 'ON DUTY' ? {} : {
//                   backgroundColor: 'rgba(255,255,255,0.1)'
//                 }
//               }}
//             >
//               <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🔧</span>
//               {!sidebarCollapsed && <span>{shiftStatus === 'ON DUTY' ? 'Shift Started' : 'Begin Shift'}</span>}
//             </button>
            
//             <button
//               onClick={handleShiftEnd}
//               disabled={shiftStatus === 'OFF DUTY'}
//               style={{
//                 width: '100%',
//                 padding: sidebarCollapsed ? '15px 0' : '15px 20px',
//                 backgroundColor: shiftStatus === 'OFF DUTY' ? 'rgba(255,255,255,0.1)' : 'transparent',
//                 color: shiftStatus === 'OFF DUTY' ? 'rgba(255,255,255,0.5)' : 'white',
//                 border: 'none',
//                 cursor: shiftStatus === 'OFF DUTY' ? 'not-allowed' : 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '14px',
//                 transition: 'all 0.3s ease',
//                 ':hover': shiftStatus === 'OFF DUTY' ? {} : {
//                   backgroundColor: 'rgba(255,255,255,0.1)'
//                 }
//               }}
//             >
//               <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🏁</span>
//               {!sidebarCollapsed && <span>{shiftStatus === 'OFF DUTY' ? 'Not on Shift' : 'End Shift'}</span>}
//             </button>
//           </div>

//           {!sidebarCollapsed && user.role === 'admin' && (
//             <div style={{ marginBottom: '20px' }}>
//               <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
//                 Administration
//               </div>
              
//               <button
//                 onClick={onNavigateToAdmin}
//                 style={{
//                   width: '100%',
//                   padding: '15px 20px',
//                   backgroundColor: 'transparent',
//                   color: 'white',
//                   border: 'none',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '12px',
//                   fontSize: '14px',
//                   transition: 'all 0.3s ease',
//                   ':hover': {
//                     backgroundColor: 'rgba(255,255,255,0.1)'
//                   }
//                 }}
//               >
//                 <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>👨‍💼</span>
//                 <span>Admin Panel</span>
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ==================== MAIN CONTENT ==================== */}
//       <div style={{ 
//         flex: 1,
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'auto'
//       }}>
//         {/* Main Content Area */}
//         <div style={{ 
//           flex: 1,
//           padding: '30px',
//           overflowY: 'auto'
//         }}>
//           {/* Header Section */}
//           <div style={{ 
//             display: 'flex', 
//             justifyContent: 'space-between', 
//             alignItems: 'center', 
//             marginBottom: '30px', 
//             backgroundColor: 'white', 
//             padding: '15px 25px', 
//             borderRadius: '12px', 
//             boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//               <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'white' }}>
//                 <img src="/fuel2.jpg" alt="FMS Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//               </div>
//               <div>
//                 <h2 style={{ margin: 0, color: '#1b5e20', fontSize: '20px', fontWeight: '600' }}>Fuel Management System</h2>
//                 <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Service Truck Driver Dashboard</p>
//               </div>
//             </div>

//             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', backgroundColor: '#f8f9fa', borderRadius: '25px' }}>
//                 <div style={{ 
//                   width: '40px', 
//                   height: '40px', 
//                   borderRadius: '50%', 
//                   backgroundColor: getAvatarColor(user?.fullName), 
//                   display: 'flex', 
//                   alignItems: 'center', 
//                   justifyContent: 'center', 
//                   color: 'white', 
//                   fontSize: '14px', 
//                   fontWeight: 'bold' 
//                 }}>
//                   {getUserInitials(user?.fullName)}
//                 </div>
//                 <div style={{ textAlign: 'right' }}>
//                   <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{user?.fullName || 'User'}</div>
//                   <div style={{ fontSize: '12px', color: '#666' }}>Service Truck Driver</div>
//                 </div>
//               </div>
              
//               {/* Current Vehicle Info */}
//               {currentVehicle && (
//                 <div style={{ 
//                   padding: '8px 16px',
//                   backgroundColor: '#e8f5e8',
//                   borderRadius: '20px',
//                   border: '1px solid #c8e6c9',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px'
//                 }}>
//                   <span style={{ color: '#1b5e20', fontWeight: '600' }}>🔧</span>
//                   <span style={{ color: '#2e7d32', fontWeight: '600' }}>{currentVehicle}</span>
//                   {shiftStartTime && (
//                     <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px' }}>
//                       Started: {formatTime(shiftStartTime)}
//                     </span>
//                   )}
//                 </div>
//               )}
              
//               <button 
//                 onClick={onLogout} 
//                 style={{ 
//                   padding: '10px 20px', 
//                   backgroundColor: '#d32f2f', 
//                   color: 'white', 
//                   border: 'none', 
//                   borderRadius: '25px', 
//                   cursor: 'pointer', 
//                   fontSize: '14px', 
//                   fontWeight: '600' 
//                 }}
//               >
//                 🚪 Logout
//               </button>
//             </div>
//           </div>

//           {successMessage && (
//             <div style={{ 
//               backgroundColor: '#4caf50', 
//               color: 'white', 
//               padding: '12px 20px', 
//               borderRadius: '8px',
//               marginBottom: '20px',
//               textAlign: 'center',
//               fontWeight: '500'
//             }}>
//               {successMessage}
//             </div>
//           )}

//           {/* Content based on active navigation */}
//           {activeNav === 'dashboard' ? (
//             <>
//               {/* Quick Actions */}
//               <div style={{ 
//                 display: 'grid', 
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
//                 gap: '15px', 
//                 marginBottom: '25px' 
//               }}>
//                 {/* Shift Actions */}
//                 <div style={{ 
//                   backgroundColor: 'white',
//                   padding: '20px',
//                   borderRadius: '12px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//                 }}>
//                   <h3 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '18px' }}>Shift Management</h3>
//                   <div style={{ display: 'grid', gap: '10px' }}>
//                     <button 
//                       onClick={handleShiftStart}
//                       disabled={shiftStatus === 'ON DUTY'}
//                       style={{ 
//                         padding: '15px',
//                         backgroundColor: shiftStatus === 'ON DUTY' ? '#e0e0e0' : '#1b5e20',
//                         color: shiftStatus === 'ON DUTY' ? '#666' : 'white',
//                         border: 'none',
//                         borderRadius: '8px',
//                         cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
//                         fontWeight: '600',
//                         fontSize: '15px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '10px'
//                       }}
//                     >
//                       🚗 {shiftStatus === 'ON DUTY' ? 'Shift Started' : 'Begin Shift'}
//                     </button>
                    
//                     <button 
//                       onClick={handleShiftEnd}
//                       disabled={shiftStatus === 'OFF DUTY'}
//                       style={{ 
//                         padding: '15px',
//                         backgroundColor: shiftStatus === 'OFF DUTY' ? '#e0e0e0' : '#f57c00',
//                         color: shiftStatus === 'OFF DUTY' ? '#666' : 'white',
//                         border: 'none',
//                         borderRadius: '8px',
//                         cursor: shiftStatus === 'OFF DUTY' ? 'not-allowed' : 'pointer',
//                         fontWeight: '600',
//                         fontSize: '15px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '10px'
//                       }}
//                     >
//                       🏁 {shiftStatus === 'OFF DUTY' ? 'Not on Shift' : 'End Shift'}
//                     </button>
//                   </div>
                  
//                   {shiftStartTime && (
//                     <div style={{ 
//                       marginTop: '15px', 
//                       padding: '12px',
//                       backgroundColor: '#f0f9ff',
//                       borderRadius: '8px',
//                       border: '1px solid #e1f5fe'
//                     }}>
//                       <div style={{ fontSize: '14px', color: '#0277bd' }}>
//                         <strong>Shift started:</strong> {shiftStartTime}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Vehicle Info */}
//                 <div style={{ 
//                   backgroundColor: 'white',
//                   padding: '20px',
//                   borderRadius: '12px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//                 }}>
//                   <h3 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '18px' }}>Current Vehicle</h3>
//                   {formData.plantNumber ? (
//                     <div style={{ 
//                       backgroundColor: '#e8f5e8',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       border: '2px solid #4caf50'
//                     }}>
//                       <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
//                         <div><strong>Fleet Number:</strong> {formData.plantNumber}</div>
//                         <div><strong>Type:</strong> {formData.plantType}</div>
//                         <div><strong>Description:</strong> {formData.plantName}</div>
//                         <div><strong>Odometer:</strong> {formData.odometerKilos || '0'} KM</div>
//                       </div>
//                       <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
//                         <button 
//                           onClick={() => setShowQRScanner(true)}
//                           style={{ 
//                             flex: 1,
//                             padding: '8px 15px',
//                             backgroundColor: '#1b5e20',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '6px',
//                             cursor: 'pointer',
//                             fontSize: '14px'
//                           }}
//                         >
//                           📱 Change Vehicle
//                         </button>
//                         <button 
//                           onClick={() => setShowMachineLogBook(true)}
//                           style={{ 
//                             flex: 1,
//                             padding: '8px 15px',
//                             backgroundColor: '#2196f3',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '6px',
//                             cursor: 'pointer',
//                             fontSize: '14px'
//                           }}
//                         >
//                           📖 Log Book
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div style={{ 
//                       textAlign: 'center',
//                       padding: '30px 20px',
//                       backgroundColor: '#f5f5f5',
//                       borderRadius: '8px'
//                     }}>
//                       <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚗</div>
//                       <p style={{ color: '#666', marginBottom: '15px' }}>No vehicle selected</p>
//                       <button 
//                         onClick={() => setShowQRScanner(true)}
//                         style={{ 
//                           padding: '12px 20px',
//                           backgroundColor: '#1b5e20',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '6px',
//                           cursor: 'pointer',
//                           fontWeight: '600'
//                         }}
//                       >
//                         📱 Scan/Enter Vehicle
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Photo Gallery & Quick Tools */}
//                 <div style={{ 
//                   backgroundColor: 'white',
//                   padding: '20px',
//                   borderRadius: '12px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//                 }}>
//                   <h3 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '18px' }}>Quick Tools</h3>
//                   <div style={{ display: 'grid', gap: '10px' }}>
//                     <button 
//                       onClick={() => setShowPhotoGallery(true)}
//                       style={{ 
//                         padding: '15px',
//                         backgroundColor: '#7b1fa2',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontWeight: '600',
//                         fontSize: '15px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '10px'
//                       }}
//                     >
//                       📁 View Photo Gallery
//                     </button>
                    
//                    <button 
//                       onClick={() => setActiveNav('logbook')}
//                       style={{ 
//                         padding: '15px',
//                         backgroundColor: '#2196f3',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontWeight: '600',
//                         fontSize: '15px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '10px'
//                       }}
//                     >
//                       📖 Open Log Book Dashboard
//                     </button>
                    
//                     <button 
//                       onClick={() => setShowFuelStoreQRScanner(true)}
//                       style={{ 
//                         padding: '15px',
//                         backgroundColor: '#4caf50',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontWeight: '600',
//                         fontSize: '15px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '10px'
//                       }}
//                     >
//                       📱 Scan Fuel Store
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Vehicle Status Component */}
//               {currentVehicle && (
//                 <div style={{ 
//                   backgroundColor: 'white',
//                   padding: '25px',
//                   borderRadius: '12px',
//                   boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//                   marginBottom: '25px'
//                 }}>
//                   <h3 style={{ color: '#1e88e5', marginBottom: '20px', fontSize: '20px' }}>🚗 Vehicle Status</h3>
                  
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
//                     {[
//                       { label: 'Current Odometer', value: vehicleStatus.currentOdometer + ' KM', emoji: '📊' },
//                       { label: 'Fuel Level', value: vehicleStatus.fuelLevel + '%', emoji: '⛽', color: vehicleStatus.fuelLevel < 20 ? '#d32f2f' : '#2e7d32' },
//                       { label: 'Shift Status', value: vehicleStatus.shiftStatus, emoji: vehicleStatus.shiftStatus === 'On Duty' ? '🟢' : '⚫', color: vehicleStatus.shiftStatus === 'On Duty' ? '#2e7d32' : '#757575' },
//                       { label: 'Range', value: vehicleStatus.range + ' km', emoji: '🛣️' },
//                       { label: 'Consumption', value: vehicleStatus.consumption + ' km/L', emoji: '⚡' },
//                       { label: 'Last Refuel', value: vehicleStatus.lastRefuel, emoji: '🕒' },
//                       { label: 'Today Distance', value: getTodayDistance() + ' km', emoji: '📈' },
//                       { label: 'Next Service', value: vehicleStatus.nextService, emoji: '🔧' }
//                     ].map((item, index) => (
//                       <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <span style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                           <span style={{ fontSize: '20px' }}>{item.emoji}</span>
//                           {item.label}
//                         </span>
//                         <span style={{ color: item.color || '#1e88e5', fontWeight: '600', fontSize: '16px' }}>
//                           {item.value}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
                  
//                   {vehicleStatus.shiftStart && (
//                     <div style={{ 
//                       marginTop: '20px', 
//                       padding: '15px', 
//                       backgroundColor: '#f0f9ff',
//                       borderRadius: '8px',
//                       border: '1px solid #e1f5fe'
//                     }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <div>
//                           <div style={{ fontWeight: '600', color: '#0277bd' }}>Shift Information</div>
//                           <div style={{ fontSize: '14px', color: '#666' }}>
//                             Started: {vehicleStatus.shiftStart}
//                           </div>
//                           <div style={{ fontSize: '14px', color: '#1b5e20', marginTop: '5px' }}>
//                             Today's Distance: {getTodayDistance()} km
//                           </div>
//                         </div>
//                         <button 
//                           onClick={handleShiftEnd}
//                           style={{ 
//                             padding: '8px 16px',
//                             backgroundColor: '#f57c00',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '6px',
//                             cursor: 'pointer',
//                             fontWeight: '600',
//                             fontSize: '14px'
//                           }}
//                         >
//                           End Shift
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* ==================== RECORD NEW SERVICE SECTION - REARRANGED ==================== */}
//               <div style={{ 
//                 backgroundColor: 'white',
//                 padding: '25px',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                 marginBottom: '25px'
//               }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '25px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   <span>🔧</span>
//                   Record New Service
//                 </h3>
                
//                 <form onSubmit={handleSubmit}>
//                   {/* ========== VEHICLE & BASIC INFO SECTION ========== */}
//                   <div style={{ 
//                     backgroundColor: '#f0f9ff', 
//                     padding: '20px', 
//                     borderRadius: '10px',
//                     marginBottom: '25px',
//                     border: '1px solid #bbdefb'
//                   }}>
//                     <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                       <span>🚗</span>
//                       Vehicle Information
//                     </h4>
                    
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
//                       {/* Vehicle Selection */}
//                       <div>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
//                           Service Plant Number *
//                         </label>
//                         <div style={{ display: 'flex', gap: '10px' }}>
//                           <input
//                             type="text"
//                             value={formData.plantNumber}
//                             onChange={(e) => setFormData({...formData, plantNumber: e.target.value})}
//                             placeholder="Scan or enter vehicle number"
//                             style={{ 
//                               flex: 1, 
//                               padding: '12px', 
//                               border: formData.plantNumber ? '2px solid #1565c0' : '1px solid #ddd', 
//                               borderRadius: '6px', 
//                               fontSize: '15px' 
//                             }}
//                             required
//                             readOnly={shiftStatus === 'ON DUTY'}
//                           />
//                           <button 
//                             type="button" 
//                             onClick={() => setShowQRScanner(true)}
//                             disabled={shiftStatus === 'ON DUTY'}
//                             style={{ 
//                               padding: '12px 15px',
//                               backgroundColor: shiftStatus === 'ON DUTY' ? '#ccc' : '#1565c0',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '6px',
//                               cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
//                               fontSize: '14px',
//                               fontWeight: '600',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '5px',
//                               whiteSpace: 'nowrap'
//                             }}
//                           >
//                             <span>📱</span>
//                             Scan
//                           </button>
//                         </div>
//                         {formData.plantNumber && (
//                           <div style={{ 
//                             marginTop: '8px', 
//                             padding: '8px', 
//                             backgroundColor: '#e8f5e8', 
//                             borderRadius: '4px',
//                             fontSize: '14px',
//                             color: '#1b5e20'
//                           }}>
//                             ✅ {formData.plantName} - {formData.plantType}
//                           </div>
//                         )}
//                       </div>
                      
//                       {/* Contract/Site Selection */}
//                       <div>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
//                           Contract/Site *
//                         </label>
//                         <div style={{ display: 'flex', gap: '10px' }}>
//                           <select
//                             value={formData.contractType}
//                             onChange={(e) => setFormData({...formData, contractType: e.target.value})}
//                             style={{ 
//                               flex: 1, 
//                               padding: '12px', 
//                               border: '1px solid #ddd', 
//                               borderRadius: '6px', 
//                               fontSize: '15px' 
//                             }}
//                             required
//                           >
//                             <option value="">Select Contract</option>
//                             <option value="AMPLANT 49">AMPLANT 49</option>
//                             <option value="HILLARY (Site 2163)">HILLARY (Site 2163)</option>
//                             <option value="HILLARY (Site 2102)">HILLARY (Site 2102)</option>
//                             <option value="Polokwane Surfacing (Site 1809)">Polokwane Surfacing (Site 1809)</option>
//                             <option value="Custom Site">Custom Site</option>
//                           </select>
//                           <button 
//                             type="button" 
//                             onClick={() => setShowCustomSiteModal(true)}
//                             style={{ 
//                               padding: '12px 15px',
//                               backgroundColor: '#ff9800',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '6px',
//                               cursor: 'pointer',
//                               fontSize: '14px',
//                               whiteSpace: 'nowrap'
//                             }}
//                           >
//                             Custom Site
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ========== METER READINGS & FUEL SECTION ========== */}
//                   <div style={{ 
//                     backgroundColor: '#fff8e1', 
//                     padding: '20px', 
//                     borderRadius: '10px',
//                     marginBottom: '25px',
//                     border: '1px solid #ffecb3'
//                   }}>
//                     <h4 style={{ color: '#ef6c00', marginBottom: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                       <span>📊</span>
//                       Meter Readings & Fuel Information
//                     </h4>
                    
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
//                       {/* Previous Reading */}
//                       <div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                           <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Previous Reading:</label>
//                           <button 
//                             type="button"
//                             onClick={() => setShowMeterReadingModal('before')}
//                             style={{ 
//                               padding: '6px 10px',
//                               backgroundColor: formData.previousMeterReadingPhotoName ? '#4caf50' : '#1976d2',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '4px',
//                               cursor: 'pointer',
//                               fontSize: '12px',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '4px'
//                             }}
//                           >
//                             📷 {formData.previousMeterReadingPhotoName ? 'Photo' : 'Add'}
//                           </button>
//                         </div>
//                         <input 
//                           type="number" 
//                           name="previousMeterReading" 
//                           value={formData.previousMeterReading} 
//                           onChange={handleInputChange} 
//                           step="0.01" 
//                           style={{ 
//                             width: '100%', 
//                             padding: '12px', 
//                             border: '1px solid #ddd', 
//                             borderRadius: '6px', 
//                             backgroundColor: '#f5f5f5', 
//                             fontSize: '15px' 
//                           }} 
//                           placeholder="Auto from last"
//                           required 
//                         />
//                       </div>
                      
//                       {/* Current Reading */}
//                       <div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                           <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Current Reading:</label>
//                           <button 
//                             type="button"
//                             onClick={() => setShowMeterReadingModal('before')}
//                             style={{ 
//                               padding: '6px 10px',
//                               backgroundColor: formData.meterReadingPhotoName ? '#4caf50' : '#1976d2',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '4px',
//                               cursor: 'pointer',
//                               fontSize: '12px',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '4px'
//                             }}
//                           >
//                             📷 {formData.meterReadingPhotoName ? 'Photo' : 'Add'}
//                           </button>
//                         </div>
//                         <input 
//                           type="number" 
//                           name="currentMeterReadingBefore" 
//                           value={formData.currentMeterReadingBefore} 
//                           onChange={handleInputChange} 
//                           step="0.01" 
//                           style={{ 
//                             width: '100%', 
//                             padding: '12px', 
//                             border: '1px solid #ddd', 
//                             borderRadius: '6px', 
//                             fontSize: '15px' 
//                           }} 
//                           placeholder="Enter current"
//                           required 
//                         />
//                       </div>
                      
//                       {/* Fuel Quantity */}
//                       <div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                           <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Fuel Quantity (L):</label>
//                           <button 
//                             type="button"
//                             onClick={() => setShowFuelEditModal(true)}
//                             style={{ 
//                               padding: '6px 10px',
//                               backgroundColor: formData.fuelQuantity ? '#4caf50' : '#757575',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '4px',
//                               cursor: 'pointer',
//                               fontSize: '12px',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '4px'
//                             }}
//                           >
//                             ⛽ Edit
//                           </button>
//                         </div>
//                         <input 
//                           type="number" 
//                           name="fuelQuantity" 
//                           value={formData.fuelQuantity} 
//                           onChange={handleInputChange} 
//                           step="0.01" 
//                           style={{ 
//                             width: '100%', 
//                             padding: '12px', 
//                             border: '1px solid #ddd', 
//                             borderRadius: '6px', 
//                             fontSize: '15px' 
//                           }} 
//                           required 
//                         />
//                       </div>
                      
//                       {/* Closing Reading */}
//                       <div>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#333' }}>
//                           Closing Reading:
//                         </label>
//                         <input 
//                           type="text" 
//                           value={formData.currentMeterReadingAfter || ''} 
//                           readOnly 
//                           style={{ 
//                             width: '100%', 
//                             padding: '12px', 
//                             border: '2px solid #1b5e20', 
//                             borderRadius: '6px', 
//                             backgroundColor: '#e8f5e8', 
//                             fontWeight: 'bold', 
//                             color: '#1b5e20', 
//                             fontSize: '15px' 
//                           }} 
//                           placeholder="Auto-calculated" 
//                         />
//                       </div>
//                     </div>
                    
//                     {/* Variance Alert */}
//                     {formData.meterVarianceFlag && (
//                       <div style={{ 
//                         marginTop: '15px', 
//                         padding: '12px', 
//                         backgroundColor: formData.readingFlag === 'critical' ? '#ffebee' : 
//                                        formData.readingFlag === 'warning' ? '#fff3e0' : '#e3f2fd', 
//                         border: formData.readingFlag === 'critical' ? '2px solid #f44336' : 
//                                formData.readingFlag === 'warning' ? '2px solid #ff9800' : '2px solid #2196f3', 
//                         borderRadius: '6px'
//                       }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', 
//                                       color: formData.readingFlag === 'critical' ? '#c62828' : 
//                                             formData.readingFlag === 'warning' ? '#e65100' : '#1565c0' }}>
//                           <span>{formData.readingFlag === 'critical' ? '🚨' : formData.readingFlag === 'warning' ? '⚠️' : 'ℹ️'}</span>
//                           {formData.meterVarianceMessage}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* ========== FUEL STORE & ODOMETER SECTION ========== */}
//                   <div style={{ 
//                     backgroundColor: '#e8f5e9', 
//                     padding: '20px', 
//                     borderRadius: '10px',
//                     marginBottom: '25px',
//                     border: '1px solid #c8e6c9'
//                   }}>
//                     <h4 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                       <span>⛽</span>
//                       Fuel Store & Odometer
//                     </h4>
                    
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
//                       {/* Fuel Store Selection */}
//                       <div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                           <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Fuel Store:</label>
//                           <button 
//                             type="button" 
//                             onClick={() => setShowFuelStoreQRScanner(true)}
//                             style={{ 
//                               padding: '6px 10px',
//                               backgroundColor: '#4caf50',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '4px',
//                               cursor: 'pointer',
//                               fontSize: '12px',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '4px'
//                             }}
//                           >
//                             📱 Scan QR
//                           </button>
//                         </div>
//                         <select 
//                           name="fuelStoreCategory" 
//                           value={formData.fuelStoreCategory} 
//                           onChange={handleInputChange} 
//                           style={{ 
//                             width: '100%', 
//                             padding: '12px', 
//                             border: '1px solid #ddd', 
//                             borderRadius: '6px', 
//                             fontSize: '15px',
//                             marginBottom: '10px'
//                           }} 
//                           required
//                         >
//                           <option value="">Select Category</option>
//                           <option value="service_trucks">Service Trucks</option>
//                           <option value="fuel_trailers">Fuel Trailers</option>
//                           <option value="underground_tanks">Static Tanks</option>
//                         </select>
                        
//                         {formData.fuelStoreCategory && (
//                           <select 
//                             name="selectedFuelStore" 
//                             value={formData.selectedFuelStore} 
//                             onChange={handleInputChange} 
//                             style={{ 
//                               width: '100%', 
//                               padding: '12px', 
//                               border: '1px solid #ddd', 
//                               borderRadius: '6px', 
//                               fontSize: '15px' 
//                             }} 
//                             required
//                           >
//                             <option value="">Select Store</option>
//                             {fuelStores[formData.fuelStoreCategory]?.map(store => (
//                               <option key={store} value={store}>{store}</option>
//                             ))}
//                           </select>
//                         )}
//                       </div>
                      
//                       {/* Odometer (KM) */}
//                       <div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                           <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Odometer (KM):</label>
//                           <button 
//                             type="button" 
//                             onClick={() => setShowOdometerModal('kilos')}
//                             style={{ 
//                               padding: '6px 10px',
//                               backgroundColor: formData.odometerKilosPhotoName ? '#4caf50' : '#1976d2',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '4px',
//                               cursor: 'pointer',
//                               fontSize: '12px',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '4px'
//                             }}
//                           >
//                             📷 {formData.odometerKilosPhotoName ? 'Photo' : 'Add'}
//                           </button>
//                         </div>
//                         <input
//                           type="number"
//                           value={formData.odometerKilos}
//                           onChange={(e) => setFormData({...formData, odometerKilos: e.target.value})}
//                           placeholder="Enter or auto-filled"
//                           style={{ 
//                             width: '100%', 
//                             padding: '12px', 
//                             border: formData.odometerKilosPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
//                             borderRadius: '6px', 
//                             fontSize: '15px' 
//                           }}
//                           step="0.1"
//                         />
//                       </div>
                      
//                       {/* Hours */}
//                       <div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                           <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Hours:</label>
//                           <button 
//                             type="button" 
//                             onClick={() => setShowOdometerModal('hours')}
//                             style={{ 
//                               padding: '6px 10px',
//                               backgroundColor: formData.odometerHoursPhotoName ? '#4caf50' : '#1976d2',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '4px',
//                               cursor: 'pointer',
//                               fontSize: '12px',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '4px'
//                             }}
//                           >
//                             ⏱️ {formData.odometerHoursPhotoName ? 'Photo' : 'Add'}
//                           </button>
//                         </div>
//                         <input
//                           type="number"
//                           value={formData.odometerHours}
//                           onChange={(e) => setFormData({...formData, odometerHours: e.target.value})}
//                           placeholder="Enter hours"
//                           style={{ 
//                             width: '100%', 
//                             padding: '12px', 
//                             border: formData.odometerHoursPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
//                             borderRadius: '6px', 
//                             fontSize: '15px' 
//                           }}
//                           step="0.1"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* ========== REMARKS & SUBMISSION SECTION ========== */}
//                   <div style={{ 
//                     backgroundColor: '#f5f5f5', 
//                     padding: '20px', 
//                     borderRadius: '10px',
//                     marginBottom: '25px',
//                     border: '1px solid #e0e0e0'
//                   }}>
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
//                       {/* Driver Information */}
//                       <div>
//                         <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                           <span>👤</span>
//                           Driver Information
//                         </h4>
//                         <div style={{ 
//                           backgroundColor: 'white', 
//                           padding: '15px', 
//                           borderRadius: '8px',
//                           fontSize: '14px',
//                           border: '1px solid #e0e0e0'
//                         }}>
//                           <div><strong>Name:</strong> {user.fullName}</div>
//                           <div><strong>Employee #:</strong> {user.employeeNumber || 'N/A'}</div>
//                           <div><strong>Company:</strong> {user.company || 'N/A'}</div>
//                           <div><strong>Shift:</strong> {shiftStatus === 'ON DUTY' ? '🟢 On Duty' : '⚫ Off Duty'}</div>
//                         </div>
//                       </div>
                      
//                       {/* Remarks */}
//                       <div>
//                         <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                           <span>📝</span>
//                           Remarks
//                         </h4>
//                         <textarea
//                           value={formData.remarks}
//                           onChange={(e) => setFormData({...formData, remarks: e.target.value})}
//                           placeholder="Additional notes, issues found, special instructions..."
//                           rows="4"
//                           style={{ 
//                             width: '100%', 
//                             padding: '12px', 
//                             border: '1px solid #ddd', 
//                             borderRadius: '6px', 
//                             fontSize: '15px', 
//                             resize: 'vertical',
//                             backgroundColor: 'white'
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* ========== SUBMIT BUTTON ========== */}
//                   <div style={{ 
//                     textAlign: 'center', 
//                     paddingTop: '20px', 
//                     borderTop: '2px solid #eee' 
//                   }}>
//                     <div style={{ 
//                       display: 'flex', 
//                       justifyContent: 'center', 
//                       alignItems: 'center', 
//                       gap: '20px',
//                       flexWrap: 'wrap'
//                     }}>
//                       <button
//                         type="submit"
//                         disabled={isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber}
//                         style={{ 
//                           padding: '16px 40px',
//                           backgroundColor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? '#ccc' : '#1565c0',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '8px',
//                           fontSize: '16px',
//                           cursor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? 'not-allowed' : 'pointer',
//                           fontWeight: 'bold',
//                           transition: 'all 0.3s ease',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '10px',
//                           minWidth: '200px'
//                         }}
//                       >
//                         {isLoading ? (
//                           <>
//                             <span>⏳</span>
//                             Recording Service...
//                           </>
//                         ) : (
//                           <>
//                             <span>🔧</span>
//                             Record Service
//                           </>
//                         )}
//                       </button>
                      
//                       <button
//                         type="button"
//                         onClick={() => {
//                           // Clear form but keep vehicle info
//                           setFormData(prev => ({
//                             ...prev,
//                             serviceDetails: '',
//                             fuelQuantity: '',
//                             odometerKilos: '',
//                             odometerHours: '',
//                             previousMeterReading: prev.currentMeterReadingAfter || '',
//                             currentMeterReadingBefore: '',
//                             currentMeterReadingAfter: '',
//                             meterVarianceFlag: false,
//                             readingFlag: '',
//                             meterVarianceMessage: '',
//                             fuelStoreCategory: '',
//                             selectedFuelStore: '',
//                             contractType: '',
//                             remarks: '',
//                             meterReadingPhotoId: null,
//                             meterReadingPhotoName: '',
//                             meterReadingPhotoPath: '',
//                             previousMeterReadingPhotoId: null,
//                             previousMeterReadingPhotoName: '',
//                             previousMeterReadingPhotoPath: ''
//                           }));
//                         }}
//                         style={{ 
//                           padding: '16px 30px',
//                           backgroundColor: '#757575',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '8px',
//                           fontSize: '16px',
//                           cursor: 'pointer',
//                           fontWeight: '600',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '10px',
//                           minWidth: '180px'
//                         }}
//                       >
//                         <span>🗑️</span>
//                         Clear Form
//                       </button>
//                     </div>
                    
//                     {shiftStatus === 'OFF DUTY' ? (
//                       <p style={{ color: '#d32f2f', marginTop: '15px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <span>⚠️</span>
//                         Please start your service shift before recording
//                       </p>
//                     ) : !formData.plantNumber ? (
//                       <p style={{ color: '#f57c00', marginTop: '15px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <span>ℹ️</span>
//                         Please select a vehicle first
//                       </p>
//                     ) : null}
//                   </div>
//                 </form>
//               </div>

//               {/* Recent Services */}
//               <div style={{ 
//                 backgroundColor: 'white',
//                 padding: '30px',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//               }}>
//                 <h3 style={{ color: '#1565c0', marginBottom: '25px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   <span>📋</span>
//                   Recent Services
//                 </h3>
//                 {transactions.length === 0 ? (
//                   <div style={{ 
//                     textAlign: 'center', 
//                     padding: '50px 20px', 
//                     color: '#666',
//                     backgroundColor: '#f8f9fa',
//                     borderRadius: '8px'
//                   }}>
//                     <div style={{ fontSize: '64px', marginBottom: '15px' }}>🔧</div>
//                     <p style={{ fontSize: '18px', marginBottom: '10px' }}>No services recorded yet</p>
//                     <p style={{ fontSize: '15px', color: '#999' }}>Start your shift and record your first service</p>
//                   </div>
//                 ) : (
//                   <div style={{ overflowX: 'auto' }}>
//                     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
//                       <thead>
//                         <tr style={{ backgroundColor: '#f8f9fa' }}>
//                           <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date</th>
//                           <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
//                           <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Service</th>
//                           <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel</th>
//                           <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Odometer</th>
//                           <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Status</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {transactions.slice(0, 10).map((transaction, index) => (
//                           <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
//                             <td style={{ padding: '15px' }}>{transaction.transactionDate}</td>
//                             <td style={{ padding: '15px', fontWeight: '600', color: '#1565c0' }}>
//                               {transaction.plantNumber}
//                             </td>
//                             <td style={{ padding: '15px', fontWeight: 'bold', color: '#2e7d32' }}>
//                               {transaction.serviceType || 'General Service'}
//                             </td>
//                             <td style={{ padding: '15px' }}>
//                               {transaction.fuelAdded ? `${transaction.fuelAdded}L` : '-'}
//                             </td>
//                             <td style={{ padding: '15px' }}>
//                               {transaction.odometerKilos ? `${transaction.odometerKilos} KM` : '-'}
//                               {transaction.calculatedDistance ? ` (${transaction.calculatedDistance} km)` : ''}
//                             </td>
//                             <td style={{ padding: '15px' }}>
//                               <span style={{ 
//                                 padding: '6px 12px', 
//                                 borderRadius: '12px',
//                                 backgroundColor: 
//                                   transaction.serviceStatus === 'completed' ? '#e8f5e8' :
//                                   transaction.serviceStatus === 'in-progress' ? '#fff3e0' :
//                                   '#ffebee',
//                                 color: 
//                                   transaction.serviceStatus === 'completed' ? '#1b5e20' :
//                                   transaction.serviceStatus === 'in-progress' ? '#ef6c00' :
//                                   '#d32f2f',
//                                 fontSize: '13px',
//                                 fontWeight: '600'
//                               }}>
//                                 {transaction.serviceStatus === 'completed' ? '✅ Completed' :
//                                  transaction.serviceStatus === 'in-progress' ? '🔄 In Progress' :
//                                  '⏳ Pending'}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : activeNav === 'history' ? (
//             // Service History View
//             <div style={{ 
//               backgroundColor: 'white',
//               padding: '30px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//             }}>
//               <h3 style={{ color: '#1565c0', marginBottom: '25px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                 <span>📋</span>
//                 All Service History
//               </h3>
//               {transactions.length === 0 ? (
//                 <div style={{ 
//                   textAlign: 'center', 
//                   padding: '50px 20px', 
//                   color: '#666',
//                   backgroundColor: '#f8f9fa',
//                   borderRadius: '8px'
//                 }}>
//                   <div style={{ fontSize: '64px', marginBottom: '15px' }}>📋</div>
//                   <p style={{ fontSize: '18px' }}>No service history available</p>
//                 </div>
//               ) : (
//                 <div style={{ overflowX: 'auto' }}>
//                   <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
//                     <thead>
//                       <tr style={{ backgroundColor: '#f8f9fa' }}>
//                         <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date & Time</th>
//                         <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
//                         <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Service Type</th>
//                         <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel Added</th>
//                         <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {transactions.map((transaction, index) => (
//                         <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
//                           <td style={{ padding: '15px' }}>{new Date(transaction.timestamp).toLocaleString()}</td>
//                           <td style={{ padding: '15px', fontWeight: '600', color: '#1565c0' }}>
//                             {transaction.plantNumber}
//                           </td>
//                           <td style={{ padding: '15px', fontWeight: 'bold', color: '#2e7d32' }}>
//                             {transaction.serviceType || 'General Service'}
//                           </td>
//                           <td style={{ padding: '15px' }}>
//                             {transaction.fuelAdded ? `${transaction.fuelAdded}L` : '-'}
//                           </td>
//                           <td style={{ padding: '15px' }}>
//                             <span style={{ 
//                               padding: '6px 12px', 
//                               borderRadius: '12px',
//                               backgroundColor: 
//                                 transaction.serviceStatus === 'completed' ? '#e8f5e8' :
//                                 transaction.serviceStatus === 'in-progress' ? '#fff3e0' :
//                                 '#ffebee',
//                               color: 
//                                 transaction.serviceStatus === 'completed' ? '#1b5e20' :
//                                 transaction.serviceStatus === 'in-progress' ? '#ef6c00' :
//                                 '#d32f2f',
//                               fontSize: '13px',
//                               fontWeight: '600'
//                             }}>
//                               {transaction.serviceStatus || 'completed'}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           )  : activeNav === 'logbook' ? (
//             <MachineLogBookDashboard
//               user={user}
//               onBack={() => setActiveNav('dashboard')}
//               selectedMachine={currentVehicle ? {
//                 number: currentVehicle,
//                 name: formData.plantName,
//                 type: formData.plantType,
//                 status: 'OPERATIONAL'
//               } : null}
//             />
//           ) : (
//             // Profile View
//             <div style={{ 
//               backgroundColor: 'white',
//               padding: '40px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//               textAlign: 'center'
//             }}>
//               <div style={{ fontSize: '80px', marginBottom: '20px' }}>
//                 👤
//               </div>
//               <h3 style={{ color: '#1565c0', marginBottom: '10px', fontSize: '24px' }}>
//                 Service Driver Profile
//               </h3>
//               <div style={{ 
//                 backgroundColor: '#f8f9fa', 
//                 padding: '25px', 
//                 borderRadius: '8px',
//                 maxWidth: '500px',
//                 margin: '0 auto',
//                 textAlign: 'left',
//                 fontSize: '16px'
//               }}>
//                 <div style={{ marginBottom: '20px' }}>
//                   <strong>Name:</strong> {user.fullName}
//                 </div>
//                 <div style={{ marginBottom: '20px' }}>
//                   <strong>Employee #:</strong> {user.employeeNumber || 'N/A'}
//                 </div>
//                 <div style={{ marginBottom: '20px' }}>
//                   <strong>Company:</strong> {user.company || 'N/A'}
//                 </div>
//                 <div style={{ marginBottom: '20px' }}>
//                   <strong>Role:</strong> {user.role || 'Service Driver'}
//                 </div>
//                 <div>
//                   <strong>Total Services:</strong> {transactions.length}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ==================== FOOTER ==================== */}
//         <div style={{
//           backgroundColor: 'white',
//           borderTop: '1px solid #e0e0e0',
//           padding: '20px 30px',
//           textAlign: 'center',
//           color: '#666',
//           fontSize: '14px'
//         }}>
//           <div style={{ 
//             display: 'flex', 
//             justifyContent: 'center', 
//             alignItems: 'center', 
//             gap: '12px', 
//             flexWrap: 'wrap' 
//           }}>
//             <span>© 2025 Fuel Management System. All rights reserved.</span>
//             <span style={{ color: '#1b5e20' }}>|</span>
//             <span>
//               Created by 
//               <a 
//                 href="https://port-lee.vercel.app/" 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 style={{ 
//                   color: '#1b5e20', 
//                   textDecoration: 'none',
//                   marginLeft: '5px',
//                   fontWeight: '600'
//                 }}
//               >
//                 Lethabo Mokgokoloshi 
//               </a>
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {showQRScanner && (
//         <QRScanner 
//           onScan={handleQRScan}
//           onClose={() => setShowQRScanner(false)}
//         />
//       )}

//       {showFuelStoreQRScanner && (
//         <FuelStoreQRScannerModal
//           onScan={handleFuelStoreQRScan}
//           onClose={() => setShowFuelStoreQRScanner(false)}
//         />
//       )}

//       {showOdometerModal && (
//         <MeterReadingPhotoUpload
//           onPhotoUpload={handleOdometerUpload}
//           onClose={() => setShowOdometerModal(null)}
//           type={showOdometerModal}
//           currentValue={showOdometerModal === 'kilos' ? formData.odometerKilos : formData.odometerHours}
//           plantNumber={formData.plantNumber}
//           transactionId={Date.now()}
//           userId={user?.id}
//           isMeterReading={false}
//         />
//       )}

//       {showMeterReadingModal && (
//         <MeterReadingPhotoUpload
//           onPhotoUpload={handleMeterReadingUpload}
//           onClose={() => setShowMeterReadingModal(null)}
//           type={showMeterReadingModal}
//           currentValue={showMeterReadingModal === 'before' ? formData.currentMeterReadingBefore : formData.previousMeterReading}
//           plantNumber={formData.plantNumber}
//           transactionId={Date.now()}
//           userId={user?.id}
//           label={showMeterReadingModal === 'before' ? 'Current Meter Reading' : 'Previous Meter Reading'}
//           isMeterReading={true}
//         />
//       )}

//       {showPhotoGallery && (
//         <PhotoGalleryModal
//           onClose={() => {
//             setShowPhotoGallery(false);
//           }}
//           userId={user?.id}
//         />
//       )}

//       {showFuelEditModal && (
//         <FuelEditModal
//           currentQuantity={formData.fuelQuantity}
//           onSave={handleFuelQuantityEdit}
//           onClose={() => setShowFuelEditModal(false)}
//         />
//       )}

//       {showCustomSiteModal && (
//         <CustomSiteModal
//           onSave={handleAddCustomSite}
//           onClose={() => setShowCustomSiteModal(false)}
//         />
//       )}

//       {showMachineLogBook && (
//         <MachineLogBookModal
//           onClose={() => setShowMachineLogBook(false)}
//           currentVehicle={currentVehicle ? { 
//             plantNumber: currentVehicle,
//             plantName: formData.plantName,
//             plantType: formData.plantType
//           } : null}
//           userId={user?.id}
//           user={user}
//           formData={formData}
//         />
//       )}
//     </div>
//   );
// };

// export default ServiceTruckDriverDashboard;


import React, { useState, useRef, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import QRScanner from '../qr/QRScanner';
import MachineLogBookDashboard from './MachineLogBookDashboard';
import { plantMasterList } from './plantMasterList';

// ==================== INDEXEDDB SETUP ====================

const initPhotoDatabase = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FleetPhotoDatabase', 2);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      
      if (!db.objectStoreNames.contains('photos')) {
        const store = db.createObjectStore('photos', { keyPath: 'photoId', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('plantNumber', 'plantNumber', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('folderPath', 'folderPath', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('folders')) {
        const folderStore = db.createObjectStore('folders', { keyPath: 'path' });
        folderStore.createIndex('photoCount', 'photoCount', { unique: false });
        folderStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
      }
      
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

const savePhotoToDatabase = async (photoData) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos', 'folders', 'thumbnails'], 'readwrite');
      const photoStore = transaction.objectStore('photos');
      const folderStore = transaction.objectStore('folders');
      const thumbnailStore = transaction.objectStore('thumbnails');
      
      const thumbnail = photoData.base64Data.substring(0, 50000);
      const thumbnailData = {
        photoId: photoData.photoId,
        thumbnail: thumbnail,
        timestamp: photoData.timestamp
      };
      
      const thumbnailRequest = thumbnailStore.add(thumbnailData);
      
      thumbnailRequest.onsuccess = () => {
        const photoRequest = photoStore.add(photoData);
        
        photoRequest.onsuccess = () => {
          const savedPhotoId = photoRequest.result;
          
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

const getAllFoldersFromDatabase = async () => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['folders'], 'readonly');
      const store = transaction.objectStore('folders');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const folders = request.result;
        
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

// ==================== MODAL COMPONENTS ====================

const FuelEditModal = ({ currentQuantity, onSave, onClose }) => {
  const [quantity, setQuantity] = useState(currentQuantity || '');
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

// Enhanced Odometer Photo Upload that can be used for meter readings too
const MeterReadingPhotoUpload = ({ 
  onPhotoUpload, 
  onClose, 
  type, 
  currentValue,
  plantNumber,
  transactionId,
  userId,
  label = null,
  isMeterReading = false
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
      
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size too large. Maximum 10MB allowed.');
        return;
      }
      
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
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const folderPath = `uploads/${year}/${month}/${day}/`;
      const filename = isMeterReading 
        ? `meter_${type}_${plantNumber || 'unknown'}_${year}${month}${day}_${hours}${minutes}${seconds}.jpg`
        : `odometer_${type}_${plantNumber || 'unknown'}_${year}${month}${day}_${hours}${minutes}${seconds}.jpg`;
      
      const fileSize = Math.round((photo.length * 3) / 4);
      
      const photoData = {
        photoId: Date.now(),
        filename: filename,
        originalName: photoName || (isMeterReading ? `meter_${type}.jpg` : `odometer_${type}.jpg`),
        base64Data: photo,
        type: isMeterReading ? `meter_${type}` : type,
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
          readingValue: manualValue,
          isMeterReading: isMeterReading
        }
      };

      const savedPhoto = await savePhotoToDatabase(photoData);
      
      const savedPhotoRefs = JSON.parse(localStorage.getItem('meterPhotoRefs') || '[]');
      savedPhotoRefs.push({
        photoId: savedPhoto.photoId,
        filename: savedPhoto.filename,
        type: savedPhoto.type,
        reading: savedPhoto.reading,
        timestamp: savedPhoto.timestamp,
        plantNumber: savedPhoto.plantNumber,
        folderPath: savedPhoto.folderPath,
        thumbnail: savedPhoto.thumbnail,
        isMeterReading: isMeterReading
      });
      localStorage.setItem('meterPhotoRefs', JSON.stringify(savedPhotoRefs));
      
      const photoCount = parseInt(localStorage.getItem('totalPhotos') || '0') + 1;
      localStorage.setItem('totalPhotos', photoCount.toString());
      
      setUploadSuccess(true);
      setUploadedPhotoData(savedPhoto);
      
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
          type: type,
          isMeterReading: isMeterReading
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
      type: type,
      isMeterReading: isMeterReading
    });
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const getDisplayType = () => {
    if (isMeterReading) {
      return label || 'Meter Reading';
    }
    return type === 'kilos' ? 'Odometer Kilometers' : 'Odometer Hours';
  };

  const getUnit = () => {
    if (isMeterReading) {
      return 'units';
    }
    return type === 'kilos' ? 'km' : 'hrs';
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
            {isMeterReading ? '📊 ' : (type === 'kilos' ? '📏 ' : '⏱️ ')}
            {getDisplayType()}
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
            Enter {getDisplayType()}: *
          </label>
          <input
            type="number"
            value={manualValue}
            onChange={(e) => {
              setManualValue(e.target.value);
              setErrorMessage('');
            }}
            placeholder={`Enter ${getDisplayType().toLowerCase()}...`}
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
                <span style={{ fontSize: '12px', color: '#666' }}>
                  ({Math.round(photoName.length / 1024)} KB)
                </span>
              </div>
            </div>
          )}
        </div>

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
                alt={getDisplayType()} 
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
              <div><strong>Reading:</strong> {uploadedPhotoData.reading} {getUnit()}</div>
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
      const savedPhotoRefs = JSON.parse(localStorage.getItem('meterPhotoRefs') || '[]');
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
    const kmPhotos = photos.filter(p => p.type === 'kilos' || p.type === 'meter_kilos');
    const hourPhotos = photos.filter(p => p.type === 'hours' || p.type === 'meter_hours');
    const meterPhotos = photos.filter(p => p.type.includes('meter_'));
    const today = new Date().toDateString();
    const todayPhotos = photos.filter(p => new Date(p.timestamp).toDateString() === today);
    
    return {
      total: photos.length,
      km: kmPhotos.length,
      hours: hourPhotos.length,
      meter: meterPhotos.length,
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
              <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>📊 Meter Photos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.meter}</div>
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
                            📷 {photo.type.includes('meter') ? 'METER' : (photo.type === 'kilos' ? 'KM' : 'HRS')}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
                          {photo.reading} {photo.type.includes('meter') ? 'units' : (photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : '')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          Type: {photo.type}
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
                          📷 {photo.type.includes('meter') ? 'METER' : (photo.type === 'kilos' ? 'KM' : 'HRS')}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
                        {photo.reading} {photo.type.includes('meter') ? 'units' : (photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : '')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        Type: {photo.type}
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
                <p>Upload odometer or meter reading photos to see them here</p>
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
                    {selectedPhoto.reading || '0'} {selectedPhoto.type.includes('meter') ? 'units' : (selectedPhoto.type === 'kilos' ? 'kilometers' : selectedPhoto.type === 'hours' ? 'hours' : '')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Type</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
                    {selectedPhoto.type.includes('meter') ? 'Meter Reading' : (selectedPhoto.type === 'kilos' ? 'Kilometers (KM)' : selectedPhoto.type === 'hours' ? 'Hours (HRS)' : 'Unknown')}
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
                    alt="Meter Reading"
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
                    alt="Thumbnail"
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

const CustomSiteModal = ({ onSave, onClose, customSites = [], onDeleteSite }) => {
  const [siteName, setSiteName] = useState('');
  const [siteNumber, setSiteNumber] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleSave = () => {
    if (!siteName.trim()) {
      setError('Please enter a site name');
      return;
    }
    
    const customSite = siteNumber.trim() 
      ? `${siteName} (${siteNumber})`
      : siteName;
    
    onSave(customSite);
    setSiteName('');
    setSiteNumber('');
    setError('');
  };

  const handleDeleteSite = (site) => {
    onDeleteSite(site);
    setShowDeleteConfirm(null);
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
          <h3 style={{ margin: 0, color: '#1b5e20' }}>🏗️ Manage Custom Sites</h3>
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

        {/* Add New Site */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>➕ Add New Site</h4>
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

          <div style={{ marginBottom: '20px' }}>
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

          <button 
            onClick={handleSave}
            disabled={!siteName.trim()}
            style={{ 
              width: '100%',
              padding: '12px 20px', 
              backgroundColor: siteName.trim() ? '#1b5e20' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: siteName.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '10px'
            }}
          >
            Add Site
          </button>
        </div>

        {/* Existing Sites */}
        {customSites && customSites.length > 0 ? (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>📋 Existing Custom Sites ({customSites.length})</h4>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '10px'
            }}>
              {customSites.map((site, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <span style={{ flex: 1 }}>{site}</span>
                  <button
                    onClick={() => setShowDeleteConfirm(site)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginLeft: '10px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ 
            marginBottom: '25px', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <p style={{ margin: 0, color: '#666' }}>No custom sites added yet</p>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 1001
          }}>
            <p style={{ marginBottom: '15px' }}>Are you sure you want to delete "{showDeleteConfirm}"?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDeleteSite(showDeleteConfirm)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const FuelStoreQRScannerModal = ({ onScan, onClose }) => {
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scannerError, setScannerError] = useState('');

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput);
      onClose();
    }
  };

  const handleQRScan = (data) => {
    try {
      if (!data) {
        setScannerError('No QR data received');
        return;
      }
      onScan(data);
      onClose();
    } catch (error) {
      console.error('QR Scan error:', error);
      setScannerError('Failed to scan QR code. Please try manual entry.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
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
          <h3 style={{ margin: 0, color: '#1b5e20' }}>📱 Scan Fuel Store QR Code</h3>
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

        {scannerError && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #ef9a9a',
            fontSize: '14px'
          }}>
            ⚠️ {scannerError}
          </div>
        )}

        {!showManualInput ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '64px', marginBottom: '10px' }}>📷</div>
              <p style={{ color: '#666', marginBottom: '20px' }}>Point camera at fuel store QR code to scan</p>
              
              {/* QR Scanner integration */}
              <div style={{
                backgroundColor: '#f5f5f5',
                height: '200px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                border: '2px dashed #ddd'
              }}>
                <QRScanner onScan={handleQRScan} onClose={onClose} />
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '10px',
              borderTop: '1px solid #eee',
              paddingTop: '20px'
            }}>
              <button 
                onClick={() => setShowManualInput(true)}
                style={{ 
                  flex: 1,
                  padding: '12px 20px', 
                  backgroundColor: '#2196f3', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📝 Enter Manually
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
          </>
        ) : (
          <>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Enter Fuel Store Manually:
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter fuel store name or code..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #1b5e20',
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
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                style={{ 
                  flex: 1,
                  padding: '12px 20px', 
                  backgroundColor: manualInput.trim() ? '#1b5e20' : '#ccc', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '6px', 
                  cursor: manualInput.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Save Fuel Store
              </button>
              
              <button 
                onClick={() => setShowManualInput(false)}
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
                Back to Scan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== NEW FEATURES MODALS ====================

// Litres Received Upload Modal
const LitresReceivedUploadModal = ({ onSave, onClose, plantNumber, userId }) => {
  const [litres, setLitres] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoName(file.name);
      setError('');
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Maximum 10MB allowed.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setPhoto(base64Image);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!litres || parseFloat(litres) <= 0) {
      setError('Please enter valid litres received (greater than 0)');
      return;
    }

    setUploading(true);
    
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      const folderPath = `litres_received/${year}/${month}/${day}/`;
      const filename = `litres_${plantNumber}_${year}${month}${day}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.jpg`;
      
      let photoData = null;
      
      if (photo) {
        const fileSize = Math.round((photo.length * 3) / 4);
        photoData = {
          photoId: Date.now(),
          filename: filename,
          originalName: photoName,
          base64Data: photo,
          type: 'litres_received',
          litres: litres,
          timestamp: now.toISOString(),
          plantNumber: plantNumber || 'Unknown',
          userId: userId || 'unknown',
          folderPath: folderPath,
          fileSize: fileSize,
          metadata: {
            litresReceived: litres,
            uploadTime: now.toISOString(),
            type: 'litres_received'
          }
        };

        const savedPhoto = await savePhotoToDatabase(photoData);
        photoData = savedPhoto;
      }

      onSave({
        litres: litres,
        photoData: photoData,
        timestamp: now.toISOString(),
        plantNumber: plantNumber
      });
      
      setUploading(false);
      onClose();
      
    } catch (error) {
      console.error('Error saving litres received:', error);
      setError(`Failed to save: ${error.message}`);
      setUploading(false);
    }
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
          <h3 style={{ margin: 0, color: '#1b5e20' }}>📊 Litres Received Upload</h3>
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
            Litres Received: *
          </label>
          <input
            type="number"
            value={litres}
            onChange={(e) => {
              setLitres(e.target.value);
              setError('');
            }}
            placeholder="Enter litres received..."
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

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Upload Photo (Optional):
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

        {photo && (
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
                alt="Litres Received" 
                style={{ 
                  width: '100%',
                  height: 'auto',
                  maxHeight: '200px',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button 
            onClick={handleSave}
            disabled={!litres || uploading}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: (litres && !uploading) ? '#1b5e20' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: (litres && !uploading) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {uploading ? 'Saving...' : 'Save Litres Received'}
          </button>
          
          <button 
            onClick={onClose}
            disabled={uploading}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #ddd',
              borderRadius: '6px', 
              cursor: uploading ? 'not-allowed' : 'pointer',
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

// Fuel Slip Upload Modal
const FuelSlipUploadModal = ({ onSave, onClose, plantNumber, userId }) => {
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoName(file.name);
      setError('');
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Maximum 10MB allowed.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setPhoto(base64Image);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!photo) {
      setError('Please select a fuel slip photo');
      return;
    }

    setUploading(true);
    
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      const folderPath = `fuel_slips/${year}/${month}/${day}/`;
      const filename = `fuel_slip_${plantNumber}_${year}${month}${day}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.jpg`;
      
      const fileSize = Math.round((photo.length * 3) / 4);
      const photoData = {
        photoId: Date.now(),
        filename: filename,
        originalName: photoName,
        base64Data: photo,
        type: 'fuel_slip',
        timestamp: now.toISOString(),
        plantNumber: plantNumber || 'Unknown',
        userId: userId || 'unknown',
        folderPath: folderPath,
        fileSize: fileSize,
        metadata: {
          uploadTime: now.toISOString(),
          type: 'fuel_slip'
        }
      };

      const savedPhoto = await savePhotoToDatabase(photoData);

      onSave({
        photoData: savedPhoto,
        timestamp: now.toISOString(),
        plantNumber: plantNumber
      });
      
      setUploading(false);
      onClose();
      
    } catch (error) {
      console.error('Error saving fuel slip:', error);
      setError(`Failed to save: ${error.message}`);
      setUploading(false);
    }
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
          <h3 style={{ margin: 0, color: '#1b5e20' }}>🧾 Fuel Slip Upload</h3>
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
            Upload Fuel Slip Photo: *
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

        {photo && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Fuel Slip Preview:</p>
            <div style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              overflow: 'hidden',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}>
              <img 
                src={photo} 
                alt="Fuel Slip" 
                style={{ 
                  width: '100%',
                  height: 'auto',
                  maxHeight: '300px',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button 
            onClick={handleSave}
            disabled={!photo || uploading}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: (photo && !uploading) ? '#1b5e20' : '#ccc', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: (photo && !uploading) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {uploading ? 'Saving...' : 'Save Fuel Slip'}
          </button>
          
          <button 
            onClick={onClose}
            disabled={uploading}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #ddd',
              borderRadius: '6px', 
              cursor: uploading ? 'not-allowed' : 'pointer',
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

// Fuel Store Summary Modal
const FuelStoreSummaryModal = ({ onClose, fuelStores, fuelStoreUsage }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Calculate store totals
  const calculateStoreTotals = () => {
    const totals = {};
    
    Object.keys(fuelStores).forEach(category => {
      if (selectedCategory === 'all' || selectedCategory === category) {
        fuelStores[category].forEach(store => {
          const usage = fuelStoreUsage[store] || { litresPoured: 0, litresLeft: 0 };
          totals[store] = {
            category: category,
            litresPoured: usage.litresPoured || 0,
            litresLeft: usage.litresLeft || 0,
            capacity: getStoreCapacity(store)
          };
        });
      }
    });
    
    return totals;
  };

  const getStoreCapacity = (storeName) => {
    if (storeName.includes('650 L')) return 650;
    if (storeName.includes('1000L')) return 1000;
    if (storeName.includes('2000L')) return 2000;
    if (storeName.includes('23m3')) return 23000;
    return 1000; // Default capacity
  };

  const storeTotals = calculateStoreTotals();
  const totalLitresPoured = Object.values(storeTotals).reduce((sum, store) => sum + store.litresPoured, 0);
  const totalLitresLeft = Object.values(storeTotals).reduce((sum, store) => sum + store.litresLeft, 0);

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
          <h3 style={{ margin: 0, color: '#1b5e20' }}>📊 Fuel Store Summary</h3>
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

        {/* Summary Stats */}
        <div style={{ 
          backgroundColor: '#f0f7ff', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #bbdefb'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1565c0' }}>Total Stores</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{Object.keys(storeTotals).length}</div>
            </div>
            <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1b5e20' }}>Total Litres Poured</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalLitresPoured.toFixed(1)} L</div>
            </div>
            <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>Total Litres Left</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalLitresLeft.toFixed(1)} L</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
            Filter by Category:
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{ 
                padding: '8px 16px',
                backgroundColor: selectedCategory === 'all' ? '#1b5e20' : '#f5f5f5',
                color: selectedCategory === 'all' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              All Stores
            </button>
            {Object.keys(fuelStores).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: selectedCategory === category ? '#1b5e20' : '#f5f5f5',
                  color: selectedCategory === category ? 'white' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {category.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Store Details */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          paddingRight: '10px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>
            {selectedCategory === 'all' ? 'All Fuel Stores' : selectedCategory.replace('_', ' ')} ({Object.keys(storeTotals).length})
          </h4>
          
          {Object.keys(storeTotals).length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {Object.entries(storeTotals).map(([storeName, data]) => {
                const percentageUsed = ((data.litresPoured / data.capacity) * 100).toFixed(1);
                const percentageLeft = ((data.litresLeft / data.capacity) * 100).toFixed(1);
                
                return (
                  <div key={storeName} style={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>{storeName}</div>
                        <div style={{ fontSize: '14px', color: '#666', textTransform: 'capitalize' }}>
                          {data.category.replace('_', ' ')}
                        </div>
                      </div>
                      <div style={{ 
                        padding: '4px 8px', 
                        backgroundColor: percentageLeft > 30 ? '#4caf50' : percentageLeft > 10 ? '#ff9800' : '#f44336',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {percentageLeft}% Left
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Litres Poured</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1b5e20' }}>
                          {data.litresPoured.toFixed(1)} L
                        </div>
                        <div style={{ 
                          height: '6px',
                          backgroundColor: '#e0e0e0',
                          borderRadius: '3px',
                          marginTop: '5px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${Math.min(percentageUsed, 100)}%`,
                            height: '100%',
                            backgroundColor: '#1b5e20',
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Litres Left</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                          {data.litresLeft.toFixed(1)} L
                        </div>
                        <div style={{ 
                          height: '6px',
                          backgroundColor: '#e0e0e0',
                          borderRadius: '3px',
                          marginTop: '5px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${Math.min(percentageLeft, 100)}%`,
                            height: '100%',
                            backgroundColor: '#4caf50',
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      <span>Capacity: {data.capacity} L</span>
                      <span>Available: {data.capacity - data.litresPoured} L</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>⛽</div>
              <h4 style={{ color: '#555' }}>No fuel stores found</h4>
              <p>Start recording fuel transactions to see store summaries</p>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Showing {Object.keys(storeTotals).length} stores • Total: {totalLitresPoured.toFixed(1)}L poured
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
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MACHINE LOG BOOK MODAL ====================

const MachineLogBookModal = ({ 
  onClose, 
  currentVehicle, 
  userId,
  user,
  formData 
}) => {
  const [logEntries, setLogEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newLogEntry, setNewLogEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    machineNumber: currentVehicle?.plantNumber || formData?.plantNumber || '',
    machineName: currentVehicle?.plantName || formData?.plantName || '',
    operationHours: '',
    fuelConsumed: '',
    maintenancePerformed: '',
    issuesReported: '',
    operatorName: user?.fullName || '',
    operatorId: userId,
    remarks: '',
    odometerReading: formData?.odometerKilos || '',
    serviceType: 'Preventive Maintenance',
    status: 'Completed'
  });
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);

  useEffect(() => {
    loadLogEntries();
  }, [userId, currentVehicle, formData]);

  const loadLogEntries = async () => {
    setIsLoading(true);
    try {
      const savedLogs = JSON.parse(localStorage.getItem(`machine_logs_${userId}`) || '[]');
      const machineNumber = currentVehicle?.plantNumber || formData?.plantNumber;
      const filteredLogs = machineNumber 
        ? savedLogs.filter(log => log.machineNumber === machineNumber)
        : savedLogs;
      
      setLogEntries(filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error loading log entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLogEntry = () => {
    if (!newLogEntry.operationHours || !newLogEntry.machineNumber) {
      alert('Please fill in required fields: Operation Hours and Machine Number');
      return;
    }

    const logEntry = {
      ...newLogEntry,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      createdBy: userId
    };

    const savedLogs = JSON.parse(localStorage.getItem(`machine_logs_${userId}`) || '[]');
    savedLogs.push(logEntry);
    localStorage.setItem(`machine_logs_${userId}`, JSON.stringify(savedLogs));

    setLogEntries(prev => [logEntry, ...prev]);
    setNewLogEntry({
      date: new Date().toISOString().split('T')[0],
      machineNumber: currentVehicle?.plantNumber || formData?.plantNumber || '',
      machineName: currentVehicle?.plantName || formData?.plantName || '',
      operationHours: '',
      fuelConsumed: '',
      maintenancePerformed: '',
      issuesReported: '',
      operatorName: user?.fullName || '',
      operatorId: userId,
      remarks: '',
      odometerReading: formData?.odometerKilos || '',
      serviceType: 'Preventive Maintenance',
      status: 'Completed'
    });
    setShowNewEntryForm(false);

    alert('✅ Machine log entry saved successfully!');
  };

  const calculateTotalHours = () => {
    return logEntries.reduce((total, log) => total + parseFloat(log.operationHours || 0), 0).toFixed(1);
  };

  const calculateTotalFuel = () => {
    return logEntries.reduce((total, log) => total + parseFloat(log.fuelConsumed || 0), 0).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return '#4caf50';
      case 'in-progress': return '#ff9800';
      case 'pending': return '#f44336';
      default: return '#757575';
    }
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
              📖 Machine Log Book
            </h3>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {currentVehicle?.plantNumber ? `Vehicle: ${currentVehicle.plantNumber}` : 'No vehicle selected'}
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

        <div style={{ 
          backgroundColor: '#f0f7ff', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #bbdefb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#1976d2' }}>📊 Log Book Statistics</h4>
            <button 
              onClick={() => setShowNewEntryForm(true)}
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#1b5e20',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + New Log Entry
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
            <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1565c0' }}>📋 Total Entries</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{logEntries.length}</div>
            </div>
            <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#1b5e20' }}>⏱️ Total Hours</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{calculateTotalHours()} hrs</div>
            </div>
            <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#ef6c00' }}>⛽ Fuel Used</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{calculateTotalFuel()} L</div>
            </div>
            <div style={{ backgroundColor: '#f3e5f5', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#7b1fa2' }}>🔧 Active Issues</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {logEntries.filter(log => log.issuesReported && log.status !== 'Completed').length}
              </div>
            </div>
          </div>
        </div>

        {showNewEntryForm ? (
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#1b5e20' }}>➕ New Log Entry</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Date *</label>
                <input
                  type="date"
                  value={newLogEntry.date}
                  onChange={(e) => setNewLogEntry({...newLogEntry, date: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Machine Number *</label>
                <input
                  type="text"
                  value={newLogEntry.machineNumber}
                  onChange={(e) => setNewLogEntry({...newLogEntry, machineNumber: e.target.value})}
                  placeholder="Enter machine number"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Operation Hours *</label>
                <input
                  type="number"
                  value={newLogEntry.operationHours}
                  onChange={(e) => setNewLogEntry({...newLogEntry, operationHours: e.target.value})}
                  placeholder="Enter hours"
                  step="0.1"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Odometer Reading (KM)</label>
                <input
                  type="number"
                  value={newLogEntry.odometerReading}
                  onChange={(e) => setNewLogEntry({...newLogEntry, odometerReading: e.target.value})}
                  placeholder="Enter KM reading"
                  step="0.1"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Service Type</label>
                <select
                  value={newLogEntry.serviceType}
                  onChange={(e) => setNewLogEntry({...newLogEntry, serviceType: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="Preventive Maintenance">Preventive Maintenance</option>
                  <option value="Corrective Maintenance">Corrective Maintenance</option>
                  <option value="Emergency Repair">Emergency Repair</option>
                  <option value="Scheduled Service">Scheduled Service</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Status</label>
                <select
                  value={newLogEntry.status}
                  onChange={(e) => setNewLogEntry({...newLogEntry, status: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="Completed">Completed</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Maintenance Performed</label>
              <textarea
                value={newLogEntry.maintenancePerformed}
                onChange={(e) => setNewLogEntry({...newLogEntry, maintenancePerformed: e.target.value})}
                placeholder="Describe maintenance activities..."
                rows="3"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Issues Reported</label>
              <textarea
                value={newLogEntry.issuesReported}
                onChange={(e) => setNewLogEntry({...newLogEntry, issuesReported: e.target.value})}
                placeholder="Report any issues found..."
                rows="2"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Remarks</label>
              <textarea
                value={newLogEntry.remarks}
                onChange={(e) => setNewLogEntry({...newLogEntry, remarks: e.target.value})}
                placeholder="Additional notes..."
                rows="2"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowNewEntryForm(false)}
                style={{ 
                  padding: '10px 20px',
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
              <button 
                onClick={handleSaveLogEntry}
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
                Save Log Entry
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>📋 Log Entries ({logEntries.length})</h4>
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
                <p>Loading log entries...</p>
              </div>
            ) : logEntries.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {logEntries.map(log => (
                  <div 
                    key={log.id}
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '15px',
                      border: '1px solid #ddd',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedEntry(log)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          backgroundColor: getStatusColor(log.status),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {log.status || 'N/A'}
                        </span>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>{log.machineNumber}</span>
                        <span style={{ color: '#666', fontSize: '14px' }}>{log.serviceType}</span>
                      </div>
                      <span style={{ color: '#666', fontSize: '14px' }}>{log.date}</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
                      <div><strong>Hours:</strong> {log.operationHours} hrs</div>
                      <div><strong>Odometer:</strong> {log.odometerReading || 'N/A'} KM</div>
                      <div><strong>Operator:</strong> {log.operatorName}</div>
                    </div>
                    
                    {log.issuesReported && (
                      <div style={{ 
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: '#ffebee',
                        borderRadius: '4px',
                        borderLeft: '3px solid #f44336'
                      }}>
                        <strong>⚠️ Issues:</strong> {log.issuesReported}
                      </div>
                    )}
                    
                    {log.maintenancePerformed && (
                      <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                        <strong>🔧 Maintenance:</strong> {log.maintenancePerformed.substring(0, 100)}...
                      </div>
                    )}
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
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
                <h4 style={{ color: '#555' }}>No log entries found</h4>
                <p>Create your first log entry for this machine</p>
                <button 
                  onClick={() => setShowNewEntryForm(true)}
                  style={{ 
                    marginTop: '15px',
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
                  + Create First Entry
                </button>
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
            Machine: {currentVehicle?.plantNumber || 'N/A'} • Total Hours: {calculateTotalHours()} • Entries: {logEntries.length}
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
            Close Log Book
          </button>
        </div>
      </div>

      {selectedEntry && (
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
                📋 Log Entry Details
              </h3>
              <button 
                onClick={() => setSelectedEntry(null)} 
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Date</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                    {selectedEntry.date}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Machine</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1b5e20' }}>
                    {selectedEntry.machineNumber}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Status</div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: 'white',
                    backgroundColor: getStatusColor(selectedEntry.status),
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {selectedEntry.status}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Operation Hours</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
                    {selectedEntry.operationHours} hrs
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Odometer</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                    {selectedEntry.odometerReading || 'N/A'} KM
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Service Type</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {selectedEntry.serviceType}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Maintenance Performed</div>
                <div style={{ 
                  backgroundColor: '#e8f5e9', 
                  padding: '10px', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1b5e20'
                }}>
                  {selectedEntry.maintenancePerformed || 'No maintenance details'}
                </div>
              </div>

              {selectedEntry.issuesReported && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Issues Reported</div>
                  <div style={{ 
                    backgroundColor: '#ffebee', 
                    padding: '10px', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#c62828'
                  }}>
                    {selectedEntry.issuesReported}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Remarks</div>
                <div style={{ 
                  backgroundColor: '#e3f2fd', 
                  padding: '10px', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1565c0'
                }}>
                  {selectedEntry.remarks || 'No remarks'}
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <strong>Operator:</strong> {selectedEntry.operatorName} • 
                <strong> Created:</strong> {new Date(selectedEntry.timestamp).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedEntry(null)}
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

// ==================== MAIN SERVICE TRUCK DRIVER DASHBOARD ====================

const ServiceTruckDriverDashboard = ({ user, onLogout, onNavigateToAdmin }) => {
  // ========== STATE VARIABLES ==========
  const [formData, setFormData] = useState({
    plantNumber: '',
    plantName: '',
    plantType: '',
    serviceDetails: '',
    odometerKilos: '',
    odometerHours: '',
    odometerKilosPhotoId: null,
    odometerHoursPhotoId: null,
    odometerKilosPhotoName: '',
    odometerHoursPhotoName: '',
    odometerKilosPhotoPath: '',
    odometerHoursPhotoPath: '',
    fuelQuantity: '',
    fuelAdded: '',
    transactionType: 'Service',
    contractType: '',
    receiverName: user?.fullName || '',
    receiverCompany: user?.company || '',
    employmentNumber: user?.employeeNumber || '',
    transactionDate: new Date().toISOString().split('T')[0],
    remarks: '',
    serviceStatus: 'completed',
    previousMeterReading: '',
    currentMeterReadingBefore: '',
    currentMeterReadingAfter: '',
    meterVarianceFlag: false,
    readingFlag: '',
    meterVarianceMessage: '',
    fuelStoreCategory: '',
    selectedFuelStore: '',
    // Meter reading photo data
    meterReadingPhotoId: null,
    meterReadingPhotoName: '',
    meterReadingPhotoPath: '',
    previousMeterReadingPhotoId: null,
    previousMeterReadingPhotoName: '',
    previousMeterReadingPhotoPath: '',
    // Fuel quality tracking
    fuelQualityLiters: '',
    // Odometer for fuel store
    fuelStoreOdometer: ''
  });
  
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showFuelEditModal, setShowFuelEditModal] = useState(false);
  const [showCustomSiteModal, setShowCustomSiteModal] = useState(false);
  const [showFuelStoreQRScanner, setShowFuelStoreQRScanner] = useState(false);
  const [showMachineLogBook, setShowMachineLogBook] = useState(false);
  const [showMeterReadingModal, setShowMeterReadingModal] = useState(null);
  const [showLitresReceivedModal, setShowLitresReceivedModal] = useState(false);
  const [showFuelSlipModal, setShowFuelSlipModal] = useState(false);
  const [showFuelStoreSummary, setShowFuelStoreSummary] = useState(false);
  
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
  const [meterReadingPhotos, setMeterReadingPhotos] = useState({
    before: null,
    after: null
  });
  const [customSites, setCustomSites] = useState([]);
  const [litresReceived, setLitresReceived] = useState([]);
  const [fuelSlips, setFuelSlips] = useState([]);
  const [fuelStoreUsage, setFuelStoreUsage] = useState({});

  // Additional state for sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [vehicleStatus, setVehicleStatus] = useState({
    currentOdometer: 0,
    fuelLevel: 0,
    shiftStatus: 'Off Duty',
    range: 0,
    consumption: 0,
    lastRefuel: 'Never',
    nextService: 'Due',
    shiftStart: null
  });

  const [serviceStats, setServiceStats] = useState({
    currentJobs: 3,
    completedToday: 2,
    urgentServices: 1,
    totalServices: 15,
    avgServiceTime: '2.5 hrs'
  });

  const fileInputRef = useRef(null);

  // Fuel stores with categories - UPDATED with Polokwane Surfacing 890
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

  // Contract options - UPDATED with Polokwane Surfacing 890
  const contractOptions = [
    'AMPLANT 49', 'HILLARY (Site 2163)', 'HILLARY (Site 2102)', 
    'Polokwane Surfacing (Site 1809)', 'Polokwane Surfacing 890', 'Sundries'
  ];

  // Initialize data
  useEffect(() => {
    const userTransactions = transactionService.getAllTransactions()
      .filter(t => t.userId === user.id && t.transactionType === 'Service')
      .slice(0, 10);
    setTransactions(userTransactions);

    const savedShift = localStorage.getItem(`service_driver_${user.id}_shift`);
    if (savedShift) {
      const shiftData = JSON.parse(savedShift);
      setShiftStatus('ON DUTY');
      setShiftStartTime(shiftData.startTime);
      setCurrentVehicle(shiftData.vehicle);
      
      if (shiftData.plantNumber) {
        setFormData(prev => ({
          ...prev,
          plantNumber: shiftData.plantNumber,
          plantName: shiftData.plantName,
          plantType: shiftData.plantType
        }));
        
        setVehicleStatus(prev => ({
          ...prev,
          shiftStatus: 'On Duty',
          shiftStart: shiftData.startTime
        }));
      }
    }

    // Load custom sites
    const savedCustomSites = localStorage.getItem(`service_driver_${user.id}_customSites`);
    if (savedCustomSites) {
      setCustomSites(JSON.parse(savedCustomSites));
    }

    // Load litres received
    const savedLitresReceived = localStorage.getItem(`service_driver_${user.id}_litresReceived`);
    if (savedLitresReceived) {
      setLitresReceived(JSON.parse(savedLitresReceived));
    }

    // Load fuel slips
    const savedFuelSlips = localStorage.getItem(`service_driver_${user.id}_fuelSlips`);
    if (savedFuelSlips) {
      setFuelSlips(JSON.parse(savedFuelSlips));
    }

    // Load fuel store usage
    const savedFuelStoreUsage = localStorage.getItem(`service_driver_${user.id}_fuelStoreUsage`);
    if (savedFuelStoreUsage) {
      setFuelStoreUsage(JSON.parse(savedFuelStoreUsage));
    }

    const loadSavedPhotos = async () => {
      try {
        const savedPhotos = await getAllPhotosFromDatabase(user.id);
        const kilosPhoto = savedPhotos.find(p => p.type === 'kilos');
        const hoursPhoto = savedPhotos.find(p => p.type === 'hours');
        const meterBeforePhoto = savedPhotos.find(p => p.type === 'meter_before');
        const meterAfterPhoto = savedPhotos.find(p => p.type === 'meter_after');
        
        if (kilosPhoto || hoursPhoto || meterBeforePhoto || meterAfterPhoto) {
          setOdometerPhotos({
            kilos: kilosPhoto || null,
            hours: hoursPhoto || null
          });
          setMeterReadingPhotos({
            before: meterBeforePhoto || null,
            after: meterAfterPhoto || null
          });
        }
      } catch (error) {
        console.error('Error loading saved photos:', error);
      }
    };
    
    loadSavedPhotos();
  }, [user.id]);

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

  // QR Scan handler for fuel store
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
    
    // Auto-detect fuel store category based on scanned data
    let detectedCategory = '';
    let detectedStore = '';
    
    // Check for service trucks
    if (fuelStore.includes('FSH') || fuelStore.toLowerCase().includes('service truck')) {
      detectedCategory = 'service_trucks';
      detectedStore = fuelStores.service_trucks.find(store => store.includes(fuelStore.substring(0, 5))) || fuelStore;
    }
    // Check for fuel trailers
    else if (fuelStore.includes('SLD') || fuelStore.toLowerCase().includes('trailer')) {
      detectedCategory = 'fuel_trailers';
      detectedStore = fuelStores.fuel_trailers.find(store => store.includes(fuelStore.substring(0, 4))) || fuelStore;
    }
    // Check for underground/static tanks
    else if (fuelStore.includes('UDT') || fuelStore.includes('STD') || fuelStore.includes('UPT') || 
             fuelStore.toLowerCase().includes('tank')) {
      detectedCategory = 'underground_tanks';
      detectedStore = fuelStores.underground_tanks.find(store => store.includes(fuelStore.substring(0, 4))) || fuelStore;
    }
    
    setFormData(prev => ({
      ...prev,
      fuelStoreCategory: detectedCategory || prev.fuelStoreCategory,
      selectedFuelStore: detectedStore || fuelStore
    }));
    
    setShowFuelStoreQRScanner(false);
    alert(`✅ Fuel store scanned: ${detectedStore || fuelStore}${detectedCategory ? ` (Category: ${detectedCategory.replace('_', ' ')})` : ''}`);
  };

  // Odometer photo upload handler
  const handleOdometerUpload = (result) => {
    const { type, value, photoData } = result;
    
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

    setOdometerPhotos(prev => ({
      ...prev,
      [type]: photoData
    }));

    setShowOdometerModal(null);
  };

  // Meter reading photo upload handler
  const handleMeterReadingUpload = (result) => {
    const { type, value, photoData, isMeterReading } = result;
    
    if (isMeterReading && showMeterReadingModal) {
      const isBefore = showMeterReadingModal === 'before';
      
      const photoInfo = {
        [isBefore ? 'previousMeterReading' : 'currentMeterReadingBefore']: value,
        [isBefore ? 'previousMeterReadingPhotoId' : 'meterReadingPhotoId']: photoData?.photoId || null,
        [isBefore ? 'previousMeterReadingPhotoName' : 'meterReadingPhotoName']: photoData?.filename || '',
        [isBefore ? 'previousMeterReadingPhotoPath' : 'meterReadingPhotoPath']: photoData?.folderPath || ''
      };
      
      setFormData(prev => ({
        ...prev,
        ...photoInfo
      }));

      setMeterReadingPhotos(prev => ({
        ...prev,
        [showMeterReadingModal]: photoData
      }));

      setShowMeterReadingModal(null);
    }
  };

  // Fuel quantity edit handler
  const handleFuelQuantityEdit = (newQuantity) => {
    setFormData(prev => ({
      ...prev,
      fuelQuantity: newQuantity
    }));
    setShowFuelEditModal(false);
  };

  // Custom site handlers
  const handleAddCustomSite = (customSite) => {
    const updatedCustomSites = [...customSites, customSite];
    setCustomSites(updatedCustomSites);
    localStorage.setItem(`service_driver_${user.id}_customSites`, JSON.stringify(updatedCustomSites));
    
    setFormData(prev => ({
      ...prev,
      contractType: customSite
    }));
    setShowCustomSiteModal(false);
  };

  const handleDeleteCustomSite = (siteToDelete) => {
    const updatedCustomSites = customSites.filter(site => site !== siteToDelete);
    setCustomSites(updatedCustomSites);
    localStorage.setItem(`service_driver_${user.id}_customSites`, JSON.stringify(updatedCustomSites));
    
    // If the deleted site was selected, clear it
    if (formData.contractType === siteToDelete) {
      setFormData(prev => ({
        ...prev,
        contractType: ''
      }));
    }
  };

  // Litres received handler
  const handleLitresReceivedSave = (data) => {
    const newEntry = {
      ...data,
      id: Date.now(),
      userId: user.id
    };
    
    const updatedLitresReceived = [newEntry, ...litresReceived];
    setLitresReceived(updatedLitresReceived);
    localStorage.setItem(`service_driver_${user.id}_litresReceived`, JSON.stringify(updatedLitresReceived));
    
    setShowLitresReceivedModal(false);
    alert('✅ Litres received recorded successfully!');
  };

  // Fuel slip handler
  const handleFuelSlipSave = (data) => {
    const newEntry = {
      ...data,
      id: Date.now(),
      userId: user.id
    };
    
    const updatedFuelSlips = [newEntry, ...fuelSlips];
    setFuelSlips(updatedFuelSlips);
    localStorage.setItem(`service_driver_${user.id}_fuelSlips`, JSON.stringify(updatedFuelSlips));
    
    setShowFuelSlipModal(false);
    alert('✅ Fuel slip uploaded successfully!');
  };

  // Handle input change for meter readings WITHOUT auto-populating odometer
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      // Odometer logic: Calculate current reading after fuel addition
      if (name === 'currentMeterReadingBefore' || name === 'fuelQuantity') {
        const currentReading = parseFloat(updatedData.currentMeterReadingBefore) || 0;
        const fuelQuantity = parseFloat(updatedData.fuelQuantity) || 0;
        updatedData.currentMeterReadingAfter = (currentReading + fuelQuantity).toFixed(2);
        
        // REMOVED AUTO-POPULATION OF ODOMETER
        // Odometer should be entered separately
      }
      
      // Odometer variance check logic
      if (name === 'currentMeterReadingBefore' && updatedData.previousMeterReading) {
        const previous = parseFloat(updatedData.previousMeterReading);
        const current = parseFloat(value);
        
        if (current > 0) {
          // Calculate variance
          const variance = current - previous;
          
          if (variance < 0) {
            updatedData.meterVarianceFlag = true;
            updatedData.readingFlag = 'critical';
            updatedData.meterVarianceMessage = `🚨 Critical: Current reading (${current}) is less than previous reading (${previous})!`;
          } else if (variance > 1000) {
            updatedData.meterVarianceFlag = true;
            updatedData.readingFlag = 'warning';
            updatedData.meterVarianceMessage = `⚠️ Warning: Large variance detected: ${variance} units`;
          } else if (variance > 100) {
            updatedData.meterVarianceFlag = true;
            updatedData.readingFlag = 'info';
            updatedData.meterVarianceMessage = `ℹ️ Note: Variance detected: ${variance} units`;
          } else {
            updatedData.meterVarianceFlag = false;
            updatedData.meterVarianceMessage = `✓ Normal variance: ${variance} units`;
          }
        }
      }
      
      // Auto-select fuel store category based on selected store
      if (name === 'selectedFuelStore') {
        const store = value;
        if (store) {
          // Check which category this store belongs to
          if (fuelStores.service_trucks.includes(store)) {
            updatedData.fuelStoreCategory = 'service_trucks';
          } else if (fuelStores.fuel_trailers.includes(store)) {
            updatedData.fuelStoreCategory = 'fuel_trailers';
          } else if (fuelStores.underground_tanks.includes(store)) {
            updatedData.fuelStoreCategory = 'underground_tanks';
          }
        }
      }
      
      // Auto-populate fuel store odometer from odometer kilos
      if (name === 'odometerKilos' && !updatedData.fuelStoreOdometer) {
        updatedData.fuelStoreOdometer = value;
      }
      
      return updatedData;
    });
  };

  // Calculate today's distance based on odometer readings
  const getTodayDistance = () => {
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(t => 
      new Date(t.transactionDate).toDateString() === today
    );
    
    if (todayTransactions.length > 0) {
      // Calculate distance from odometer differences
      const totalDistance = todayTransactions.reduce((sum, t) => {
        const odometer = parseFloat(t.odometerKilos) || 0;
        const previousOdometer = parseFloat(t.previousMeterReading) || 0;
        return sum + (odometer - previousOdometer);
      }, 0);
      
      return totalDistance > 0 ? totalDistance.toFixed(1) : '0';
    }
    
    return '0';
  };

  // Service submission with enhanced odometer logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.plantNumber) {
        throw new Error('Please select a vehicle first');
      }

      if (shiftStatus === 'OFF DUTY') {
        throw new Error('Please start your shift before recording services');
      }

      // Calculate odometer difference
      const previousReading = parseFloat(formData.previousMeterReading) || 0;
      const currentReading = parseFloat(formData.currentMeterReadingBefore) || 0;
      const odometerDifference = currentReading - previousReading;
      
      // Update vehicle status with odometer reading
      if (currentReading > 0) {
        setVehicleStatus(prev => ({
          ...prev,
          currentOdometer: currentReading.toLocaleString(),
          todayDistance: getTodayDistance()
        }));
      }

      // Update fuel store usage
      if (formData.selectedFuelStore && formData.fuelQuantity) {
        const store = formData.selectedFuelStore;
        const litres = parseFloat(formData.fuelQuantity) || 0;
        const currentUsage = fuelStoreUsage[store] || { litresPoured: 0, litresLeft: 1000 };
        
        const updatedUsage = {
          ...fuelStoreUsage,
          [store]: {
            litresPoured: currentUsage.litresPoured + litres,
            litresLeft: Math.max(0, currentUsage.litresLeft - litres),
            lastUpdated: new Date().toISOString()
          }
        };
        
        setFuelStoreUsage(updatedUsage);
        localStorage.setItem(`service_driver_${user.id}_fuelStoreUsage`, JSON.stringify(updatedUsage));
      }

      const serviceData = {
        plantNumber: formData.plantNumber,
        plantName: formData.plantName,
        plantType: formData.plantType,
        serviceType: 'General Service',
        serviceDetails: formData.serviceDetails,
        fuelQuantity: formData.fuelQuantity || '0',
        fuelAdded: formData.fuelAdded || '0',
        fuelQualityLiters: formData.fuelQualityLiters || '',
        fuelStoreOdometer: formData.fuelStoreOdometer || '',
        odometerKilos: formData.odometerKilos,
        odometerHours: formData.odometerHours,
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
        meterReadingPhotos: {
          before: {
            value: formData.currentMeterReadingBefore,
            photoId: formData.meterReadingPhotoId,
            photoName: formData.meterReadingPhotoName,
            photoPath: formData.meterReadingPhotoPath
          },
          previous: {
            value: formData.previousMeterReading,
            photoId: formData.previousMeterReadingPhotoId,
            photoName: formData.previousMeterReadingPhotoName,
            photoPath: formData.previousMeterReadingPhotoPath
          }
        },
        previousMeterReading: formData.previousMeterReading,
        currentMeterReadingBefore: formData.currentMeterReadingBefore,
        currentMeterReadingAfter: formData.currentMeterReadingAfter,
        meterVarianceFlag: formData.meterVarianceFlag,
        readingFlag: formData.readingFlag,
        meterVarianceMessage: formData.meterVarianceMessage,
        fuelStoreCategory: formData.fuelStoreCategory,
        selectedFuelStore: formData.selectedFuelStore,
        contractType: formData.contractType,
        transactionType: 'Service',
        receiverName: formData.receiverName,
        receiverCompany: formData.receiverCompany,
        employmentNumber: formData.employmentNumber,
        transactionDate: formData.transactionDate,
        remarks: formData.remarks,
        serviceStatus: formData.serviceStatus,
        shiftStatus: shiftStatus,
        driverName: user.fullName,
        timestamp: new Date().toISOString(),
        folderPath: `services/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`,
        odometerDifference: odometerDifference,
        calculatedDistance: odometerDifference > 0 ? odometerDifference : 0
      };

      const transaction = transactionService.saveTransaction(serviceData, user);

      setTransactions(prev => [transaction, ...prev]);

      setServiceStats(prev => ({
        ...prev,
        completedToday: prev.completedToday + 1,
        totalServices: prev.totalServices + 1
      }));

      // Update vehicle status with new odometer reading
      if (formData.currentMeterReadingAfter) {
        setVehicleStatus(prev => ({
          ...prev,
          currentOdometer: parseFloat(formData.currentMeterReadingAfter).toLocaleString()
        }));
      }

      // Reset form but keep plant info
      setFormData(prev => ({
        ...prev,
        serviceDetails: '',
        fuelQuantity: '',
        fuelAdded: '',
        fuelQualityLiters: '',
        fuelStoreOdometer: '',
        odometerKilos: '',
        odometerHours: '',
        odometerKilosPhotoId: null,
        odometerHoursPhotoId: null,
        odometerKilosPhotoName: '',
        odometerHoursPhotoName: '',
        odometerKilosPhotoPath: '',
        odometerHoursPhotoPath: '',
        previousMeterReading: formData.currentMeterReadingAfter || '',
        currentMeterReadingBefore: '',
        currentMeterReadingAfter: '',
        meterVarianceFlag: false,
        readingFlag: '',
        meterVarianceMessage: '',
        fuelStoreCategory: '',
        selectedFuelStore: '',
        contractType: '',
        remarks: '',
        meterReadingPhotoId: null,
        meterReadingPhotoName: '',
        meterReadingPhotoPath: '',
        previousMeterReadingPhotoId: null,
        previousMeterReadingPhotoName: '',
        previousMeterReadingPhotoPath: ''
      }));

      setOdometerPhotos({ kilos: null, hours: null });
      setMeterReadingPhotos({ before: null, after: null });

      setSuccessMessage(`Service recorded successfully! Distance: ${odometerDifference > 0 ? odometerDifference.toFixed(1) + ' km' : 'N/A'}`);
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      window.alert(error.message || 'Failed to record service');
    } finally {
      setIsLoading(false);
    }
  };

  // Shift handlers
  const handleShiftStart = () => {
    if (!formData.plantNumber) {
      alert('Please scan or enter a plant number first to start your shift');
      setShowQRScanner(true);
      return;
    }

    const startTime = new Date().toLocaleString();
    setShiftStatus('ON DUTY');
    setShiftStartTime(startTime);
    setCurrentVehicle(formData.plantNumber);
    
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
    localStorage.setItem(`service_driver_${user.id}_shift`, JSON.stringify(shiftData));

    alert(`🔧 Service shift started at ${startTime}\nVehicle: ${formData.plantNumber} - ${formData.plantName}`);
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
    
    setVehicleStatus(prev => ({
      ...prev,
      shiftStatus: 'Off Duty',
      shiftStart: null
    }));
    
    localStorage.removeItem(`service_driver_${user.id}_shift`);

    alert(`🏁 Service shift ended at ${endTime}\nDuration: ${duration}\nVehicle: ${formData.plantNumber || 'N/A'}`);
  };

  // Navigation handler
  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
  };

  // Format time display
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper functions for avatar
  const getAvatarColor = (name) => {
    if (!name) return '#4caf50';
    const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#8bc34a'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate total litres received today
  const getTodayLitresReceived = () => {
    const today = new Date().toDateString();
    return litresReceived
      .filter(entry => new Date(entry.timestamp).toDateString() === today)
      .reduce((total, entry) => total + parseFloat(entry.litres || 0), 0)
      .toFixed(1);
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      display: 'flex'
    }}>
      {/* ==================== SIMPLIFIED SIDEBAR ==================== */}
      <div style={{
        width: sidebarCollapsed ? '80px' : '280px',
        backgroundColor: '#1b5e20',
        color: 'white',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              ':hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Simplified Navigation Menu */}
        <div style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            {!sidebarCollapsed && (
              <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                Navigation
              </div>
            )}
            
            <button
              onClick={() => handleNavClick('dashboard')}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                backgroundColor: activeNav === 'dashboard' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🏠</span>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>
            
            <button
              onClick={() => handleNavClick('history')}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                backgroundColor: activeNav === 'history' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📋</span>
              {!sidebarCollapsed && <span>Service History</span>}
            </button>
            
            <button
              onClick={() => handleNavClick('logbook')}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                backgroundColor: activeNav === 'logbook' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📖</span>
              {!sidebarCollapsed && <span>Machine Log Book</span>}
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            {!sidebarCollapsed && (
              <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                Quick Tools
              </div>
            )}
            
            <button
              onClick={() => setShowQRScanner(true)}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📱</span>
              {!sidebarCollapsed && <span>Scan Vehicle</span>}
            </button>
            
            <button
              onClick={() => setShowPhotoGallery(true)}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📁</span>
              {!sidebarCollapsed && <span>Photo Gallery</span>}
            </button>
            
            <button
              onClick={shiftStatus === 'ON DUTY' ? handleShiftEnd : handleShiftStart}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>
                {shiftStatus === 'ON DUTY' ? '🏁' : '🔧'}
              </span>
              {!sidebarCollapsed && <span>{shiftStatus === 'ON DUTY' ? 'End Shift' : 'Begin Shift'}</span>}
            </button>
          </div>

          {!sidebarCollapsed && user.role === 'admin' && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                Administration
              </div>
              
              <button
                onClick={onNavigateToAdmin}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>👨‍💼</span>
                <span>Admin Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div style={{ 
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          {!sidebarCollapsed && (
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Service Driver Dashboard
            </div>
          )}
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        {/* Main Content Area */}
        <div style={{ 
          flex: 1,
          padding: '30px',
          overflowY: 'auto'
        }}>
          {/* Header Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '30px', 
            backgroundColor: 'white', 
            padding: '15px 25px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'white' }}>
                <img src="/fuel2.jpg" alt="FMS Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <h2 style={{ margin: 0, color: '#1b5e20', fontSize: '20px', fontWeight: '600' }}>Fuel Management System</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Service Truck Driver Dashboard</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', backgroundColor: '#f8f9fa', borderRadius: '25px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: getAvatarColor(user?.fullName), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: 'bold' 
                }}>
                  {getUserInitials(user?.fullName)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{user?.fullName || 'User'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Service Truck Driver</div>
                </div>
              </div>
              
              {/* Current Vehicle Info */}
              {currentVehicle && (
                <div style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '20px',
                  border: '1px solid #c8e6c9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#1b5e20', fontWeight: '600' }}>🔧</span>
                  <span style={{ color: '#2e7d32', fontWeight: '600' }}>{currentVehicle}</span>
                  {shiftStartTime && (
                    <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px' }}>
                      Started: {formatTime(shiftStartTime)}
                    </span>
                  )}
                </div>
              )}
              
              <button 
                onClick={onLogout} 
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#d32f2f', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '25px', 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}
              >
                🚪 Logout
              </button>
            </div>
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

          {/* Content based on active navigation */}
          {activeNav === 'dashboard' ? (
            <>
              {/* Quick Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px', 
                marginBottom: '25px' 
              }}>
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', color: '#1b5e20', marginBottom: '5px' }}>⛽</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Today's Litres</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{getTodayLitresReceived()}L</div>
                </div>
                
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', color: '#2196f3', marginBottom: '5px' }}>📋</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Services Today</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{serviceStats.completedToday}</div>
                </div>
                
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', color: '#ff9800', marginBottom: '5px' }}>🚗</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Current Vehicle</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{currentVehicle || 'None'}</div>
                </div>
                
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', color: shiftStatus === 'ON DUTY' ? '#4caf50' : '#757575', marginBottom: '5px' }}>
                    {shiftStatus === 'ON DUTY' ? '🟢' : '⚫'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Shift Status</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: shiftStatus === 'ON DUTY' ? '#4caf50' : '#757575' }}>
                    {shiftStatus === 'ON DUTY' ? 'ON DUTY' : 'OFF DUTY'}
                  </div>
                </div>
              </div>

              {/* Quick Tools Panel */}
              <div style={{ 
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '25px'
              }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '20px', fontSize: '20px' }}>🚀 Quick Tools</h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '15px' 
                }}>
                  <button
                    onClick={() => setShowLitresReceivedModal(true)}
                    style={{ 
                      padding: '15px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📊</span>
                    <span>Litres Received</span>
                  </button>
                  
                  <button
                    onClick={() => setShowFuelSlipModal(true)}
                    style={{ 
                      padding: '15px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>🧾</span>
                    <span>Fuel Slip</span>
                  </button>
                  
                  <button
                    onClick={() => setShowFuelStoreQRScanner(true)}
                    style={{ 
                      padding: '15px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📱</span>
                    <span>Scan Fuel Store</span>
                  </button>
                  
                  <button
                    onClick={() => setShowFuelStoreSummary(true)}
                    style={{ 
                      padding: '15px',
                      backgroundColor: '#9c27b0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📈</span>
                    <span>Store Summary</span>
                  </button>
                  
                  <button
                    onClick={() => setShowMachineLogBook(true)}
                    style={{ 
                      padding: '15px',
                      backgroundColor: '#607d8b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📖</span>
                    <span>Log Book</span>
                  </button>
                  
                  <button
                    onClick={() => setShowCustomSiteModal(true)}
                    style={{ 
                      padding: '15px',
                      backgroundColor: '#795548',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>🏗️</span>
                    <span>Custom Sites</span>
                  </button>
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
                          <div style={{ fontSize: '14px', color: '#1b5e20', marginTop: '5px' }}>
                            Today's Distance: {getTodayDistance()} km
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

              {/* ==================== RECORD NEW SERVICE SECTION ==================== */}
              <div style={{ 
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '25px'
              }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '25px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🔧</span>
                  Record New Service
                </h3>
                
                <form onSubmit={handleSubmit}>
                  {/* ========== VEHICLE & BASIC INFO SECTION ========== */}
                  <div style={{ 
                    backgroundColor: '#f0f9ff', 
                    padding: '20px', 
                    borderRadius: '10px',
                    marginBottom: '25px',
                    border: '1px solid #bbdefb'
                  }}>
                    <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🚗</span>
                      Vehicle Information
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                      {/* Vehicle Selection */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
                          Service Plant Number *
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="text"
                            value={formData.plantNumber}
                            onChange={(e) => setFormData({...formData, plantNumber: e.target.value})}
                            placeholder="Scan or enter vehicle number"
                            style={{ 
                              flex: 1, 
                              padding: '12px', 
                              border: formData.plantNumber ? '2px solid #1565c0' : '1px solid #ddd', 
                              borderRadius: '6px', 
                              fontSize: '15px' 
                            }}
                            required
                            readOnly={shiftStatus === 'ON DUTY'}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowQRScanner(true)}
                            disabled={shiftStatus === 'ON DUTY'}
                            style={{ 
                              padding: '12px 15px',
                              backgroundColor: shiftStatus === 'ON DUTY' ? '#ccc' : '#1565c0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span>📱</span>
                            Scan
                          </button>
                        </div>
                        {formData.plantNumber && (
                          <div style={{ 
                            marginTop: '8px', 
                            padding: '8px', 
                            backgroundColor: '#e8f5e8', 
                            borderRadius: '4px',
                            fontSize: '14px',
                            color: '#1b5e20'
                          }}>
                            ✅ {formData.plantName} - {formData.plantType}
                          </div>
                        )}
                      </div>
                      
                      {/* Contract/Site Selection */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
                          Contract/Site *
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select
                            value={formData.contractType}
                            onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                            style={{ 
                              flex: 1, 
                              padding: '12px', 
                              border: '1px solid #ddd', 
                              borderRadius: '6px', 
                              fontSize: '15px' 
                            }}
                            required
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
                              fontSize: '14px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Custom Site
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ========== METER READINGS & FUEL SECTION ========== */}
                  <div style={{ 
                    backgroundColor: '#fff8e1', 
                    padding: '20px', 
                    borderRadius: '10px',
                    marginBottom: '25px',
                    border: '1px solid #ffecb3'
                  }}>
                    <h4 style={{ color: '#ef6c00', marginBottom: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📊</span>
                      Meter Readings & Fuel Information
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                      {/* Previous Reading */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Previous Reading:</label>
                          <button 
                            type="button"
                            onClick={() => setShowMeterReadingModal('before')}
                            style={{ 
                              padding: '6px 10px',
                              backgroundColor: formData.previousMeterReadingPhotoName ? '#4caf50' : '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📷 {formData.previousMeterReadingPhotoName ? 'Photo' : 'Add'}
                          </button>
                        </div>
                        <input 
                          type="number" 
                          name="previousMeterReading" 
                          value={formData.previousMeterReading} 
                          onChange={handleInputChange} 
                          step="0.01" 
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            backgroundColor: '#f5f5f5', 
                            fontSize: '15px' 
                          }} 
                          placeholder="Auto from last"
                          required 
                        />
                      </div>
                      
                      {/* Current Reading */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Current Reading:</label>
                          <button 
                            type="button"
                            onClick={() => setShowMeterReadingModal('before')}
                            style={{ 
                              padding: '6px 10px',
                              backgroundColor: formData.meterReadingPhotoName ? '#4caf50' : '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📷 {formData.meterReadingPhotoName ? 'Photo' : 'Add'}
                          </button>
                        </div>
                        <input 
                          type="number" 
                          name="currentMeterReadingBefore" 
                          value={formData.currentMeterReadingBefore} 
                          onChange={handleInputChange} 
                          step="0.01" 
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            fontSize: '15px' 
                          }} 
                          placeholder="Enter current"
                          required 
                        />
                      </div>
                      
                      {/* Fuel Quantity */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Fuel Quantity (L):</label>
                          <button 
                            type="button"
                            onClick={() => setShowFuelEditModal(true)}
                            style={{ 
                              padding: '6px 10px',
                              backgroundColor: formData.fuelQuantity ? '#4caf50' : '#757575',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            ⛽ Edit
                          </button>
                        </div>
                        <input 
                          type="number" 
                          name="fuelQuantity" 
                          value={formData.fuelQuantity} 
                          onChange={handleInputChange} 
                          step="0.01" 
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            fontSize: '15px' 
                          }} 
                          required 
                        />
                      </div>
                      
                      {/* Closing Reading */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#333' }}>
                          Closing Reading:
                        </label>
                        <input 
                          type="text" 
                          value={formData.currentMeterReadingAfter || ''} 
                          readOnly 
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '2px solid #1b5e20', 
                            borderRadius: '6px', 
                            backgroundColor: '#e8f5e8', 
                            fontWeight: 'bold', 
                            color: '#1b5e20', 
                            fontSize: '15px' 
                          }} 
                          placeholder="Auto-calculated" 
                        />
                      </div>
                    </div>
                    
                    {/* Variance Alert */}
                    {formData.meterVarianceFlag && (
                      <div style={{ 
                        marginTop: '15px', 
                        padding: '12px', 
                        backgroundColor: formData.readingFlag === 'critical' ? '#ffebee' : 
                                       formData.readingFlag === 'warning' ? '#fff3e0' : '#e3f2fd', 
                        border: formData.readingFlag === 'critical' ? '2px solid #f44336' : 
                               formData.readingFlag === 'warning' ? '2px solid #ff9800' : '2px solid #2196f3', 
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', 
                                      color: formData.readingFlag === 'critical' ? '#c62828' : 
                                            formData.readingFlag === 'warning' ? '#e65100' : '#1565c0' }}>
                          <span>{formData.readingFlag === 'critical' ? '🚨' : formData.readingFlag === 'warning' ? '⚠️' : 'ℹ️'}</span>
                          {formData.meterVarianceMessage}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ========== FUEL STORE & ODOMETER SECTION ========== */}
                  <div style={{ 
                    backgroundColor: '#e8f5e9', 
                    padding: '20px', 
                    borderRadius: '10px',
                    marginBottom: '25px',
                    border: '1px solid #c8e6c9'
                  }}>
                    <h4 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⛽</span>
                      Fuel Store & Odometer
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                      {/* Fuel Store Selection */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Fuel Store:</label>
                          <button 
                            type="button" 
                            onClick={() => setShowFuelStoreQRScanner(true)}
                            style={{ 
                              padding: '6px 10px',
                              backgroundColor: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📱 Scan QR
                          </button>
                        </div>
                        <select 
                          name="fuelStoreCategory" 
                          value={formData.fuelStoreCategory} 
                          onChange={handleInputChange} 
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            fontSize: '15px',
                            marginBottom: '10px'
                          }} 
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="service_trucks">Service Trucks</option>
                          <option value="fuel_trailers">Fuel Trailers</option>
                          <option value="underground_tanks">Static Tanks</option>
                        </select>
                        
                        {formData.fuelStoreCategory && (
                          <select 
                            name="selectedFuelStore" 
                            value={formData.selectedFuelStore} 
                            onChange={handleInputChange} 
                            style={{ 
                              width: '100%', 
                              padding: '12px', 
                              border: '1px solid #ddd', 
                              borderRadius: '6px', 
                              fontSize: '15px' 
                            }} 
                            required
                          >
                            <option value="">Select Store</option>
                            {fuelStores[formData.fuelStoreCategory]?.map(store => (
                              <option key={store} value={store}>{store}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      
                      {/* Odometer (KM) - NOT AUTO-POPULATED */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Odometer (KM):</label>
                          <button 
                            type="button" 
                            onClick={() => setShowOdometerModal('kilos')}
                            style={{ 
                              padding: '6px 10px',
                              backgroundColor: formData.odometerKilosPhotoName ? '#4caf50' : '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📷 {formData.odometerKilosPhotoName ? 'Photo' : 'Add'}
                          </button>
                        </div>
                        <input
                          type="number"
                          value={formData.odometerKilos}
                          onChange={(e) => setFormData({...formData, odometerKilos: e.target.value})}
                          placeholder="Enter odometer reading"
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: formData.odometerKilosPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                            borderRadius: '6px', 
                            fontSize: '15px' 
                          }}
                          step="0.1"
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                          * Enter vehicle odometer reading separately
                        </div>
                      </div>
                      
                      {/* Hours */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Hours:</label>
                          <button 
                            type="button" 
                            onClick={() => setShowOdometerModal('hours')}
                            style={{ 
                              padding: '6px 10px',
                              backgroundColor: formData.odometerHoursPhotoName ? '#4caf50' : '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            ⏱️ {formData.odometerHoursPhotoName ? 'Photo' : 'Add'}
                          </button>
                        </div>
                        <input
                          type="number"
                          value={formData.odometerHours}
                          onChange={(e) => setFormData({...formData, odometerHours: e.target.value})}
                          placeholder="Enter hours"
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: formData.odometerHoursPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                            borderRadius: '6px', 
                            fontSize: '15px' 
                          }}
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ========== REMARKS & SUBMISSION SECTION ========== */}
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '20px', 
                    borderRadius: '10px',
                    marginBottom: '25px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      {/* Driver Information */}
                      <div>
                        <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>👤</span>
                          Driver Information
                        </h4>
                        <div style={{ 
                          backgroundColor: 'white', 
                          padding: '15px', 
                          borderRadius: '8px',
                          fontSize: '14px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <div><strong>Name:</strong> {user.fullName}</div>
                          <div><strong>Employee #:</strong> {user.employeeNumber || 'N/A'}</div>
                          <div><strong>Company:</strong> {user.company || 'N/A'}</div>
                          <div><strong>Shift:</strong> {shiftStatus === 'ON DUTY' ? '🟢 On Duty' : '⚫ Off Duty'}</div>
                        </div>
                      </div>
                      
                      {/* Remarks */}
                      <div>
                        <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📝</span>
                          Remarks
                        </h4>
                        <textarea
                          value={formData.remarks}
                          onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                          placeholder="Additional notes, issues found, special instructions..."
                          rows="4"
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            fontSize: '15px', 
                            resize: 'vertical',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ========== SUBMIT BUTTON ========== */}
                  <div style={{ 
                    textAlign: 'center', 
                    paddingTop: '20px', 
                    borderTop: '2px solid #eee' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '20px',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        type="submit"
                        disabled={isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber}
                        style={{ 
                          padding: '16px 40px',
                          backgroundColor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? '#ccc' : '#1565c0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          cursor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          minWidth: '200px'
                        }}
                      >
                        {isLoading ? (
                          <>
                            <span>⏳</span>
                            Recording Service...
                          </>
                        ) : (
                          <>
                            <span>🔧</span>
                            Record Service
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          // Clear form but keep vehicle info
                          setFormData(prev => ({
                            ...prev,
                            serviceDetails: '',
                            fuelQuantity: '',
                            odometerKilos: '',
                            odometerHours: '',
                            previousMeterReading: prev.currentMeterReadingAfter || '',
                            currentMeterReadingBefore: '',
                            currentMeterReadingAfter: '',
                            meterVarianceFlag: false,
                            readingFlag: '',
                            meterVarianceMessage: '',
                            fuelStoreCategory: '',
                            selectedFuelStore: '',
                            contractType: '',
                            remarks: '',
                            meterReadingPhotoId: null,
                            meterReadingPhotoName: '',
                            meterReadingPhotoPath: '',
                            previousMeterReadingPhotoId: null,
                            previousMeterReadingPhotoName: '',
                            previousMeterReadingPhotoPath: ''
                          }));
                        }}
                        style={{ 
                          padding: '16px 30px',
                          backgroundColor: '#757575',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          minWidth: '180px'
                        }}
                      >
                        <span>🗑️</span>
                        Clear Form
                      </button>
                    </div>
                    
                    {shiftStatus === 'OFF DUTY' ? (
                      <p style={{ color: '#d32f2f', marginTop: '15px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span>⚠️</span>
                        Please start your service shift before recording
                      </p>
                    ) : !formData.plantNumber ? (
                      <p style={{ color: '#f57c00', marginTop: '15px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span>ℹ️</span>
                        Please select a vehicle first
                      </p>
                    ) : null}
                  </div>
                </form>
              </div>

              {/* Recent Services */}
              <div style={{ 
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ color: '#1565c0', marginBottom: '25px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>📋</span>
                  Recent Services
                </h3>
                {transactions.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '50px 20px', 
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '15px' }}>🔧</div>
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>No services recorded yet</p>
                    <p style={{ fontSize: '15px', color: '#999' }}>Start your shift and record your first service</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date</th>
                          <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
                          <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Service</th>
                          <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel</th>
                          <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Odometer</th>
                          <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 10).map((transaction, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '15px' }}>{transaction.transactionDate}</td>
                            <td style={{ padding: '15px', fontWeight: '600', color: '#1565c0' }}>
                              {transaction.plantNumber}
                            </td>
                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#2e7d32' }}>
                              {transaction.serviceType || 'General Service'}
                            </td>
                            <td style={{ padding: '15px' }}>
                              {transaction.fuelAdded ? `${transaction.fuelAdded}L` : '-'}
                            </td>
                            <td style={{ padding: '15px' }}>
                              {transaction.odometerKilos ? `${transaction.odometerKilos} KM` : '-'}
                              {transaction.calculatedDistance ? ` (${transaction.calculatedDistance} km)` : ''}
                            </td>
                            <td style={{ padding: '15px' }}>
                              <span style={{ 
                                padding: '6px 12px', 
                                borderRadius: '12px',
                                backgroundColor: 
                                  transaction.serviceStatus === 'completed' ? '#e8f5e8' :
                                  transaction.serviceStatus === 'in-progress' ? '#fff3e0' :
                                  '#ffebee',
                                color: 
                                  transaction.serviceStatus === 'completed' ? '#1b5e20' :
                                  transaction.serviceStatus === 'in-progress' ? '#ef6c00' :
                                  '#d32f2f',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}>
                                {transaction.serviceStatus === 'completed' ? '✅ Completed' :
                                 transaction.serviceStatus === 'in-progress' ? '🔄 In Progress' :
                                 '⏳ Pending'}
                              </span>
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
            // Service History View
            <div style={{ 
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#1565c0', marginBottom: '25px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📋</span>
                All Service History
              </h3>
              {transactions.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '50px 20px', 
                  color: '#666',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '15px' }}>📋</div>
                  <p style={{ fontSize: '18px' }}>No service history available</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date & Time</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Service Type</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel Added</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '15px' }}>{new Date(transaction.timestamp).toLocaleString()}</td>
                          <td style={{ padding: '15px', fontWeight: '600', color: '#1565c0' }}>
                            {transaction.plantNumber}
                          </td>
                          <td style={{ padding: '15px', fontWeight: 'bold', color: '#2e7d32' }}>
                            {transaction.serviceType || 'General Service'}
                          </td>
                          <td style={{ padding: '15px' }}>
                            {transaction.fuelAdded ? `${transaction.fuelAdded}L` : '-'}
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span style={{ 
                              padding: '6px 12px', 
                              borderRadius: '12px',
                              backgroundColor: 
                                transaction.serviceStatus === 'completed' ? '#e8f5e8' :
                                transaction.serviceStatus === 'in-progress' ? '#fff3e0' :
                                '#ffebee',
                              color: 
                                transaction.serviceStatus === 'completed' ? '#1b5e20' :
                                transaction.serviceStatus === 'in-progress' ? '#ef6c00' :
                                '#d32f2f',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}>
                              {transaction.serviceStatus || 'completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeNav === 'logbook' ? (
            <MachineLogBookDashboard
              user={user}
              onBack={() => setActiveNav('dashboard')}
              selectedMachine={currentVehicle ? {
                number: currentVehicle,
                name: formData.plantName,
                type: formData.plantType,
                status: 'OPERATIONAL'
              } : null}
            />
          ) : (
            // Profile View
            <div style={{ 
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                👤
              </div>
              <h3 style={{ color: '#1565c0', marginBottom: '10px', fontSize: '24px' }}>
                Service Driver Profile
              </h3>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '25px', 
                borderRadius: '8px',
                maxWidth: '500px',
                margin: '0 auto',
                textAlign: 'left',
                fontSize: '16px'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <strong>Name:</strong> {user.fullName}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <strong>Employee #:</strong> {user.employeeNumber || 'N/A'}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <strong>Company:</strong> {user.company || 'N/A'}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <strong>Role:</strong> {user.role || 'Service Driver'}
                </div>
                <div>
                  <strong>Total Services:</strong> {transactions.length}
                </div>
              </div>
            </div>
          )}
        </div>

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

      {/* Modals */}
      {showQRScanner && (
        <QRScanner 
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {showFuelStoreQRScanner && (
        <FuelStoreQRScannerModal
          onScan={handleFuelStoreQRScan}
          onClose={() => setShowFuelStoreQRScanner(false)}
        />
      )}

      {showOdometerModal && (
        <MeterReadingPhotoUpload
          onPhotoUpload={handleOdometerUpload}
          onClose={() => setShowOdometerModal(null)}
          type={showOdometerModal}
          currentValue={showOdometerModal === 'kilos' ? formData.odometerKilos : formData.odometerHours}
          plantNumber={formData.plantNumber}
          transactionId={Date.now()}
          userId={user?.id}
          isMeterReading={false}
        />
      )}

      {showMeterReadingModal && (
        <MeterReadingPhotoUpload
          onPhotoUpload={handleMeterReadingUpload}
          onClose={() => setShowMeterReadingModal(null)}
          type={showMeterReadingModal}
          currentValue={showMeterReadingModal === 'before' ? formData.currentMeterReadingBefore : formData.previousMeterReading}
          plantNumber={formData.plantNumber}
          transactionId={Date.now()}
          userId={user?.id}
          label={showMeterReadingModal === 'before' ? 'Current Meter Reading' : 'Previous Meter Reading'}
          isMeterReading={true}
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
          customSites={customSites}
          onDeleteSite={handleDeleteCustomSite}
        />
      )}

      {showMachineLogBook && (
        <MachineLogBookModal
          onClose={() => setShowMachineLogBook(false)}
          currentVehicle={currentVehicle ? { 
            plantNumber: currentVehicle,
            plantName: formData.plantName,
            plantType: formData.plantType
          } : null}
          userId={user?.id}
          user={user}
          formData={formData}
        />
      )}

      {showLitresReceivedModal && (
        <LitresReceivedUploadModal
          onSave={handleLitresReceivedSave}
          onClose={() => setShowLitresReceivedModal(false)}
          plantNumber={formData.plantNumber}
          userId={user?.id}
        />
      )}

      {showFuelSlipModal && (
        <FuelSlipUploadModal
          onSave={handleFuelSlipSave}
          onClose={() => setShowFuelSlipModal(false)}
          plantNumber={formData.plantNumber}
          userId={user?.id}
        />
      )}

      {showFuelStoreSummary && (
        <FuelStoreSummaryModal
          onClose={() => setShowFuelStoreSummary(false)}
          fuelStores={fuelStores}
          fuelStoreUsage={fuelStoreUsage}
        />
      )}
    </div>
  );
};

export default ServiceTruckDriverDashboard;