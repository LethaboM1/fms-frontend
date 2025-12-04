// import React, { useState, useRef, useEffect } from 'react';
// import transactionService from '../../services/transactionService';
// import QRScanner from '../qr/QRScanner';

// // ==================== INDEXEDDB SETUP ====================

// // Initialize IndexedDB for photo storage
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

// // Save photo to IndexedDB
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

// // Get all photos from database
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

// // Get all folders from database
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

// // Get photos by folder
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

// // Fuel Edit Modal Component
// const FuelEditModal = ({ currentQuantity, onSave, onClose }) => {
//   const [quantity, setQuantity] = useState(currentQuantity || '');

//   const handleSave = () => {
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

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
//             Fuel Quantity (Liters):
//           </label>
//           <input
//             type="number"
//             value={quantity}
//             onChange={(e) => setQuantity(e.target.value)}
//             placeholder="Enter liters..."
//             step="0.1"
//             min="0"
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: '2px solid #1b5e20',
//               borderRadius: '6px',
//               fontSize: '16px'
//             }}
//           />
//         </div>

//         <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//           <button 
//             onClick={onClose}
//             style={{ 
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
//           <button 
//             onClick={handleSave}
//             style={{ 
//               padding: '12px 20px', 
//               backgroundColor: '#1b5e20', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '6px', 
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Odometer Photo Upload Component
// const OdometerPhotoUpload = ({ 
//   onPhotoUpload, 
//   onClose, 
//   type, 
//   currentValue,
//   plantNumber,
//   transactionId,
//   userId
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
//       const filename = `odometer_${type}_${plantNumber || 'unknown'}_${year}${month}${day}_${hours}${minutes}${seconds}.jpg`;
      
//       const fileSize = Math.round((photo.length * 3) / 4);
      
//       const photoData = {
//         photoId: Date.now(),
//         filename: filename,
//         originalName: photoName || `odometer_${type}.jpg`,
//         base64Data: photo,
//         type: type,
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
//           readingValue: manualValue
//         }
//       };

//       const savedPhoto = await savePhotoToDatabase(photoData);
      
//       const savedPhotoRefs = JSON.parse(localStorage.getItem('odometerPhotoRefs') || '[]');
//       savedPhotoRefs.push({
//         photoId: savedPhoto.photoId,
//         filename: savedPhoto.filename,
//         type: savedPhoto.type,
//         reading: savedPhoto.reading,
//         timestamp: savedPhoto.timestamp,
//         plantNumber: savedPhoto.plantNumber,
//         folderPath: savedPhoto.folderPath,
//         thumbnail: savedPhoto.thumbnail
//       });
//       localStorage.setItem('odometerPhotoRefs', JSON.stringify(savedPhotoRefs));
      
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
//           type: type
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
//       type: type
//     });
//     onClose();
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
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
//             {type === 'kilos' ? '📏 Odometer Kilometers' : '⏱️ Odometer Hours'}
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
//             Enter Reading: *
//           </label>
//           <input
//             type="number"
//             value={manualValue}
//             onChange={(e) => {
//               setManualValue(e.target.value);
//               setErrorMessage('');
//             }}
//             placeholder={`Enter ${type === 'kilos' ? 'kilometers' : 'hours'}...`}
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
//                 alt="Odometer" 
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
//               <div><strong>Reading:</strong> {uploadedPhotoData.reading} {type === 'kilos' ? 'km' : 'hrs'}</div>
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

// // Enhanced Photo Gallery Modal
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
//       const savedPhotoRefs = JSON.parse(localStorage.getItem('odometerPhotoRefs') || '[]');
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
//     const kmPhotos = photos.filter(p => p.type === 'kilos');
//     const hourPhotos = photos.filter(p => p.type === 'hours');
//     const today = new Date().toDateString();
//     const todayPhotos = photos.filter(p => new Date(p.timestamp).toDateString() === today);
    
//     return {
//       total: photos.length,
//       km: kmPhotos.length,
//       hours: hourPhotos.length,
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
//                             📷 {photo.type === 'kilos' ? 'KM' : 'HRS'}
//                           </div>
//                         )}
//                       </div>
//                       <div style={{ padding: '10px' }}>
//                         <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
//                           {photo.reading} {photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : ''}
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
//                           📷 {photo.type === 'kilos' ? 'KM' : 'HRS'}
//                         </div>
//                       )}
//                     </div>
//                     <div style={{ padding: '10px' }}>
//                       <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
//                         {photo.reading} {photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : ''}
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
//                 <p>Upload odometer photos to see them here</p>
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
//                     {selectedPhoto.reading || '0'} {selectedPhoto.type === 'kilos' ? 'kilometers' : selectedPhoto.type === 'hours' ? 'hours' : ''}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Type</div>
//                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
//                     {selectedPhoto.type === 'kilos' ? 'Kilometers (KM)' : selectedPhoto.type === 'hours' ? 'Hours (HRS)' : 'Unknown'}
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
//                     alt="Odometer"
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
//                     alt="Odometer Thumbnail"
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

// // ==================== MAIN SERVICE TRUCK DRIVER DASHBOARD ====================

// const ServiceTruckDriverDashboard = ({ user, onLogout, onNavigateToAdmin }) => {
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
//     receiverName: user.fullName || '',
//     receiverCompany: user.company || '',
//     employmentNumber: user.employeeNumber || '',
//     transactionDate: new Date().toISOString().split('T')[0],
//     remarks: '',
//     serviceStatus: 'completed',
//     // Meter reading fields - REDESIGNED for better spacing
//     previousMeterReading: '',
//     currentMeterReadingBefore: '',
//     currentMeterReadingAfter: '',
//     meterVarianceFlag: false,
//     readingFlag: '',
//     meterVarianceMessage: '',
//     // Fuel store selection fields
//     fuelStoreCategory: '',
//     selectedFuelStore: ''
//   });

//   const [showQRScanner, setShowQRScanner] = useState(false);
//   const [showOdometerModal, setShowOdometerModal] = useState(null);
//   const [showPhotoGallery, setShowPhotoGallery] = useState(false);
//   const [showFuelEditModal, setShowFuelEditModal] = useState(false);
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

//   // Vehicle Status state - MATCHING DriverDashboard
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

//   // Service-specific stats
//   const [serviceStatus, setServiceStatus] = useState({
//     currentJobs: 3,
//     completedToday: 2,
//     urgentServices: 1,
//     totalServices: 15,
//     avgServiceTime: '2.5 hrs'
//   });

//   const fileInputRef = useRef(null);

//   // Fuel stores definition
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
        
//         if (kilosPhoto || hoursPhoto) {
//           setOdometerPhotos({
//             kilos: kilosPhoto || null,
//             hours: hoursPhoto || null
//           });
//         }
//       } catch (error) {
//         console.error('Error loading saved photos:', error);
//       }
//     };
    
//     loadSavedPhotos();
//   }, [user.id]);

//   // QR Scan handler
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

//   // Fuel quantity edit handler
//   const handleFuelQuantityEdit = (newQuantity) => {
//     setFormData(prev => ({
//       ...prev,
//       fuelQuantity: newQuantity
//     }));
//     setShowFuelEditModal(false);
//   };

//   // Handle input change for meter readings
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => {
//       const updatedData = { ...prev, [name]: value };
      
//       if (name === 'currentMeterReadingBefore' || name === 'fuelQuantity') {
//         const currentReading = parseFloat(updatedData.currentMeterReadingBefore) || 0;
//         const fuelQuantity = parseFloat(updatedData.fuelQuantity) || 0;
//         updatedData.currentMeterReadingAfter = (currentReading + fuelQuantity).toFixed(2);
//       }
      
//       if (name === 'currentMeterReadingBefore' && updatedData.previousMeterReading) {
//         const previous = parseFloat(updatedData.previousMeterReading);
//         const current = parseFloat(value);
//         const variance = current - previous;
        
//         if (variance < 0) {
//           updatedData.meterVarianceFlag = true;
//           updatedData.readingFlag = 'critical';
//           updatedData.meterVarianceMessage = `Current reading (${current}) is less than previous reading (${previous})!`;
//         } else if (variance > 1000) {
//           updatedData.meterVarianceFlag = true;
//           updatedData.readingFlag = 'warning';
//           updatedData.meterVarianceMessage = `Large variance detected: ${variance} units`;
//         } else {
//           updatedData.meterVarianceFlag = false;
//         }
//       }
      
//       return updatedData;
//     });
//   };

//   // Calculate today's distance
//   const getTodayDistance = () => {
//     return '0';
//   };

//   // Service submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       if (!formData.plantNumber || !formData.serviceType) {
//         throw new Error('Please fill in all required fields');
//       }

//       if (shiftStatus === 'OFF DUTY') {
//         throw new Error('Please start your shift before recording services');
//       }

//       const serviceData = {
//         plantNumber: formData.plantNumber,
//         plantName: formData.plantName,
//         plantType: formData.plantType,
//         serviceType: formData.serviceType,
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
//         // Meter reading data
//         previousMeterReading: formData.previousMeterReading,
//         currentMeterReadingBefore: formData.currentMeterReadingBefore,
//         currentMeterReadingAfter: formData.currentMeterReadingAfter,
//         meterVarianceFlag: formData.meterVarianceFlag,
//         readingFlag: formData.readingFlag,
//         meterVarianceMessage: formData.meterVarianceMessage,
//         // Fuel store data
//         fuelStoreCategory: formData.fuelStoreCategory,
//         selectedFuelStore: formData.selectedFuelStore,
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
//         folderPath: `services/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`
//       };

//       const transaction = transactionService.saveTransaction(serviceData, user);

//       setTransactions(prev => [transaction, ...prev]);

//       setServiceStatus(prev => ({
//         ...prev,
//         completedToday: prev.completedToday + 1,
//         totalServices: prev.totalServices + 1
//       }));

//       setFormData(prev => ({
//         ...prev,
//         serviceType: '',
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
//         previousMeterReading: '',
//         currentMeterReadingBefore: '',
//         currentMeterReadingAfter: '',
//         meterVarianceFlag: false,
//         readingFlag: '',
//         meterVarianceMessage: '',
//         fuelStoreCategory: '',
//         selectedFuelStore: '',
//         remarks: ''
//       }));

//       setOdometerPhotos({ kilos: null, hours: null });

//       setSuccessMessage('Service recorded successfully!');
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

//   const isFirstTransaction = !transactions.some(t => t.plantNumber === formData.plantNumber);

//   return (
//     <div style={{ 
//       padding: '20px', 
//       maxWidth: '1200px', 
//       margin: '0 auto', 
//       backgroundColor: '#f8f9fa', 
//       minHeight: '100vh' 
//     }}>
//       {/* Header with Navigation - MATCHING DriverDashboard structure */}
//       <div style={{ 
//         backgroundColor: 'white',
//         borderRadius: '12px',
//         boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//         marginBottom: '20px',
//         overflow: 'hidden'
//       }}>
//         {/* Top Bar */}
//         <div style={{ 
//           padding: '15px 25px',
//           backgroundColor: '#1565c0', // Changed to blue to match DriverDashboard
//           color: 'white'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//               <div style={{ 
//                 width: '40px', 
//                 height: '40px', 
//                 backgroundColor: 'white', 
//                 borderRadius: '50%',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#1565c0',
//                 fontWeight: 'bold',
//                 fontSize: '18px'
//               }}>
//                 🔧
//               </div>
//               <div>
//                 <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>Service Truck Driver Dashboard</h1>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
//                   <span style={{ fontSize: '13px', opacity: 0.9 }}>👤 {user.fullName}</span>
//                   <span style={{ fontSize: '13px', opacity: 0.9 }}>• #{user.employeeNumber || 'N/A'}</span>
//                   <div style={{ 
//                     padding: '2px 8px', 
//                     backgroundColor: shiftStatus === 'ON DUTY' ? '#4caf50' : '#757575',
//                     borderRadius: '12px',
//                     fontSize: '11px'
//                   }}>
//                     {shiftStatus === 'ON DUTY' ? '🟢 ON DUTY' : '⚫ OFF DUTY'}
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div style={{ display: 'flex', gap: '10px' }}>
//               {user.role === 'admin' && (
//                 <button 
//                   onClick={onNavigateToAdmin}
//                   style={{ 
//                     padding: '8px 16px',
//                     backgroundColor: '#ff9800',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '20px',
//                     cursor: 'pointer',
//                     fontWeight: '600',
//                     fontSize: '13px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '6px'
//                   }}
//                 >
//                   👨‍💼 Admin Panel
//                 </button>
//               )}
//               <button 
//                 onClick={onLogout}
//                 style={{ 
//                   padding: '8px 16px',
//                   backgroundColor: '#f5f5f5',
//                   color: '#666',
//                   border: '1px solid #ddd',
//                   borderRadius: '20px',
//                   cursor: 'pointer',
//                   fontWeight: '600',
//                   fontSize: '13px'
//                 }}
//               >
//                 🚪 Logout
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Bar - MATCHING DriverDashboard */}
//         <div style={{ 
//           backgroundColor: '#f8f9fa',
//           padding: '0 25px',
//           borderBottom: '1px solid #e0e0e0'
//         }}>
//           <div style={{ display: 'flex', gap: '0' }}>
//             <button
//               onClick={() => handleNavClick('dashboard')}
//               style={{ 
//                 padding: '15px 20px',
//                 backgroundColor: activeNav === 'dashboard' ? 'white' : 'transparent',
//                 color: activeNav === 'dashboard' ? '#1565c0' : '#666',
//                 border: 'none',
//                 borderBottom: activeNav === 'dashboard' ? '3px solid #1565c0' : 'none',
//                 cursor: 'pointer',
//                 fontWeight: activeNav === 'dashboard' ? '600' : '500',
//                 fontSize: '14px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}
//             >
//               🏠 Dashboard
//             </button>
            
//             <button
//               onClick={() => handleNavClick('history')}
//               style={{ 
//                 padding: '15px 20px',
//                 backgroundColor: activeNav === 'history' ? 'white' : 'transparent',
//                 color: activeNav === 'history' ? '#1565c0' : '#666',
//                 border: 'none',
//                 borderBottom: activeNav === 'history' ? '3px solid #1565c0' : 'none',
//                 cursor: 'pointer',
//                 fontWeight: activeNav === 'history' ? '600' : '500',
//                 fontSize: '14px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}
//             >
//               📋 History
//             </button>
            
//             <button
//               onClick={() => handleNavClick('profile')}
//               style={{ 
//                 padding: '15px 20px',
//                 backgroundColor: activeNav === 'profile' ? 'white' : 'transparent',
//                 color: activeNav === 'profile' ? '#1565c0' : '#666',
//                 border: 'none',
//                 borderBottom: activeNav === 'profile' ? '3px solid #1565c0' : 'none',
//                 cursor: 'pointer',
//                 fontWeight: activeNav === 'profile' ? '600' : '500',
//                 fontSize: '14px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}
//             >
//               👤 Profile
//             </button>
//           </div>
//         </div>

//         {/* Current Vehicle Info - MATCHING DriverDashboard */}
//         {currentVehicle && (
//           <div style={{ 
//             padding: '10px 25px',
//             backgroundColor: '#e8f5e8',
//             borderBottom: '1px solid #c8e6c9'
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//               <span style={{ color: '#1b5e20', fontWeight: '600' }}>🔧 Current Vehicle:</span>
//               <span style={{ color: '#2e7d32', fontWeight: '600' }}>{currentVehicle}</span>
//               {formData.plantName && (
//                 <span style={{ color: '#666', fontSize: '14px' }}>- {formData.plantName}</span>
//               )}
//               {shiftStartTime && (
//                 <span style={{ marginLeft: 'auto', color: '#666', fontSize: '12px' }}>
//                   Shift started: {formatTime(shiftStartTime)}
//                 </span>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {successMessage && (
//         <div style={{ 
//           backgroundColor: '#4caf50', 
//           color: 'white', 
//           padding: '12px 20px', 
//           borderRadius: '8px',
//           marginBottom: '20px',
//           textAlign: 'center',
//           fontWeight: '500'
//         }}>
//           {successMessage}
//         </div>
//       )}

//       {/* Main Content - MATCHING DriverDashboard layout */}
//       {activeNav === 'dashboard' ? (
//         <>
//           {/* Quick Actions - MATCHING DriverDashboard */}
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
//             gap: '15px', 
//             marginBottom: '25px' 
//           }}>
//             {/* Shift Actions */}
//             <div style={{ 
//               backgroundColor: 'white',
//               padding: '20px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//             }}>
//               <h3 style={{ color: '#1565c0', marginBottom: '15px', fontSize: '18px' }}>Shift Management</h3>
//               <div style={{ display: 'grid', gap: '10px' }}>
//                 <button 
//                   onClick={handleShiftStart}
//                   disabled={shiftStatus === 'ON DUTY'}
//                   style={{ 
//                     padding: '15px',
//                     backgroundColor: shiftStatus === 'ON DUTY' ? '#e0e0e0' : '#1565c0',
//                     color: shiftStatus === 'ON DUTY' ? '#666' : 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
//                     fontWeight: '600',
//                     fontSize: '15px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '10px'
//                   }}
//                 >
//                   🔧 {shiftStatus === 'ON DUTY' ? 'Shift Started' : 'Begin Shift'}
//                 </button>
                
//                 <button 
//                   onClick={handleShiftEnd}
//                   disabled={shiftStatus === 'OFF DUTY'}
//                   style={{ 
//                     padding: '15px',
//                     backgroundColor: shiftStatus === 'OFF DUTY' ? '#e0e0e0' : '#f57c00',
//                     color: shiftStatus === 'OFF DUTY' ? '#666' : 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: shiftStatus === 'OFF DUTY' ? 'not-allowed' : 'pointer',
//                     fontWeight: '600',
//                     fontSize: '15px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '10px'
//                   }}
//                 >
//                   🏁 {shiftStatus === 'OFF DUTY' ? 'Not on Shift' : 'End Shift'}
//                 </button>
//               </div>
              
//               {shiftStartTime && (
//                 <div style={{ 
//                   marginTop: '15px', 
//                   padding: '12px',
//                   backgroundColor: '#f0f9ff',
//                   borderRadius: '8px',
//                   border: '1px solid #e1f5fe'
//                 }}>
//                   <div style={{ fontSize: '14px', color: '#0277bd' }}>
//                     <strong>Shift started:</strong> {shiftStartTime}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Vehicle Info - MATCHING DriverDashboard */}
//             <div style={{ 
//               backgroundColor: 'white',
//               padding: '20px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//             }}>
//               <h3 style={{ color: '#1565c0', marginBottom: '15px', fontSize: '18px' }}>Current Vehicle</h3>
//               {formData.plantNumber ? (
//                 <div style={{ 
//                   backgroundColor: '#e8f5e8',
//                   padding: '15px',
//                   borderRadius: '8px',
//                   border: '2px solid #4caf50'
//                 }}>
//                   <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
//                     <div><strong>Fleet Number:</strong> {formData.plantNumber}</div>
//                     <div><strong>Type:</strong> {formData.plantType}</div>
//                     <div><strong>Description:</strong> {formData.plantName}</div>
//                   </div>
//                   <button 
//                     onClick={() => setShowQRScanner(true)}
//                     style={{ 
//                       marginTop: '15px',
//                       padding: '8px 15px',
//                       backgroundColor: '#1565c0',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       fontSize: '14px',
//                       width: '100%'
//                     }}
//                   >
//                     📱 Change Vehicle
//                   </button>
//                 </div>
//               ) : (
//                 <div style={{ 
//                   textAlign: 'center',
//                   padding: '30px 20px',
//                   backgroundColor: '#f5f5f5',
//                   borderRadius: '8px'
//                 }}>
//                   <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚗</div>
//                   <p style={{ color: '#666', marginBottom: '15px' }}>No vehicle selected</p>
//                   <button 
//                     onClick={() => setShowQRScanner(true)}
//                     style={{ 
//                       padding: '12px 20px',
//                       backgroundColor: '#1565c0',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       fontWeight: '600'
//                     }}
//                   >
//                     📱 Scan/Enter Vehicle
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Photo Gallery & Quick Tools - MATCHING DriverDashboard */}
//             <div style={{ 
//               backgroundColor: 'white',
//               padding: '20px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//             }}>
//               <h3 style={{ color: '#1565c0', marginBottom: '15px', fontSize: '18px' }}>Photo Tools</h3>
//               <div style={{ display: 'grid', gap: '10px' }}>
//                 <button 
//                   onClick={() => setShowPhotoGallery(true)}
//                   style={{ 
//                     padding: '15px',
//                     backgroundColor: '#7b1fa2',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: 'pointer',
//                     fontWeight: '600',
//                     fontSize: '15px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '10px'
//                   }}
//                 >
//                   📁 View Photo Gallery
//                 </button>
                
//                 <button 
//                   onClick={() => setShowQRScanner(true)}
//                   style={{ 
//                     padding: '15px',
//                     backgroundColor: '#1565c0',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: 'pointer',
//                     fontWeight: '600',
//                     fontSize: '15px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '10px'
//                   }}
//                 >
//                   📱 Scan Service Vehicle
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Vehicle Status Component - MATCHING DriverDashboard */}
//           {currentVehicle && (
//             <div style={{ 
//               backgroundColor: 'white',
//               padding: '25px',
//               borderRadius: '12px',
//               boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//               marginBottom: '25px'
//             }}>
//               <h3 style={{ color: '#1e88e5', marginBottom: '20px', fontSize: '20px' }}>🚗 Vehicle Status</h3>
              
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
//                 {[
//                   { label: 'Current Odometer', value: vehicleStatus.currentOdometer + ' KM', emoji: '📊' },
//                   { label: 'Fuel Level', value: vehicleStatus.fuelLevel + '%', emoji: '⛽', color: vehicleStatus.fuelLevel < 20 ? '#d32f2f' : '#2e7d32' },
//                   { label: 'Shift Status', value: vehicleStatus.shiftStatus, emoji: vehicleStatus.shiftStatus === 'On Duty' ? '🟢' : '⚫', color: vehicleStatus.shiftStatus === 'On Duty' ? '#2e7d32' : '#757575' },
//                   { label: 'Range', value: vehicleStatus.range + ' km', emoji: '🛣️' },
//                   { label: 'Consumption', value: vehicleStatus.consumption + ' km/L', emoji: '⚡' },
//                   { label: 'Last Refuel', value: vehicleStatus.lastRefuel, emoji: '🕒' },
//                   { label: 'Today Distance', value: getTodayDistance() + ' km', emoji: '📈' },
//                   { label: 'Next Service', value: vehicleStatus.nextService, emoji: '🔧' }
//                 ].map((item, index) => (
//                   <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <span style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                       <span style={{ fontSize: '20px' }}>{item.emoji}</span>
//                       {item.label}
//                     </span>
//                     <span style={{ color: item.color || '#1e88e5', fontWeight: '600', fontSize: '16px' }}>
//                       {item.value}
//                     </span>
//                   </div>
//                 ))}
//               </div>
              
//               {vehicleStatus.shiftStart && (
//                 <div style={{ 
//                   marginTop: '20px', 
//                   padding: '15px', 
//                   backgroundColor: '#f0f9ff',
//                   borderRadius: '8px',
//                   border: '1px solid #e1f5fe'
//                 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <div style={{ fontWeight: '600', color: '#0277bd' }}>Shift Information</div>
//                       <div style={{ fontSize: '14px', color: '#666' }}>
//                         Started: {vehicleStatus.shiftStart}
//                       </div>
//                     </div>
//                     <button 
//                       onClick={handleShiftEnd}
//                       style={{ 
//                         padding: '8px 16px',
//                         backgroundColor: '#f57c00',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '6px',
//                         cursor: 'pointer',
//                         fontWeight: '600',
//                         fontSize: '14px'
//                       }}
//                     >
//                       End Shift
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Service Record Form - ENHANCED with better meter reading layout */}
//           <div style={{ 
//             backgroundColor: 'white',
//             padding: '25px',
//             borderRadius: '12px',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//             marginBottom: '25px'
//           }}>
//             <h3 style={{ color: '#1565c0', marginBottom: '20px', fontSize: '20px' }}>🔧 Record New Service</h3>
            
//             <form onSubmit={handleSubmit}>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                 {/* Column 1 */}
//                 <div>
//                   <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Service Plant Number*</label>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <input
//                         type="text"
//                         value={formData.plantNumber}
//                         onChange={(e) => setFormData({...formData, plantNumber: e.target.value})}
//                         placeholder="Scan or enter vehicle number"
//                         style={{ 
//                           flex: 1, 
//                           padding: '12px', 
//                           border: formData.plantNumber ? '2px solid #1565c0' : '1px solid #ddd', 
//                           borderRadius: '6px', 
//                           fontSize: '14px' 
//                         }}
//                         required
//                         readOnly={shiftStatus === 'ON DUTY'}
//                       />
//                       <button 
//                         type="button" 
//                         onClick={() => setShowQRScanner(true)}
//                         disabled={shiftStatus === 'ON DUTY'}
//                         style={{ 
//                           padding: '12px 20px',
//                           backgroundColor: shiftStatus === 'ON DUTY' ? '#ccc' : '#1565c0',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '6px',
//                           cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
//                           fontSize: '14px',
//                           fontWeight: '600'
//                         }}
//                       >
//                         📱 Scan
//                       </button>
//                     </div>
//                   </div>

//                   {/* Fuel Store Selection */}
//                   <div>
//                     <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Fuel Store Selection</h4>
//                     <div style={{ display: 'grid', gap: '15px' }}>
//                       <div>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fuel Store Category:</label>
//                         <select 
//                           name="fuelStoreCategory" 
//                           value={formData.fuelStoreCategory} 
//                           onChange={handleInputChange} 
//                           style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
//                           required
//                         >
//                           <option value="">Select Category</option>
//                           <option value="service_trucks">Service Trucks</option>
//                           <option value="fuel_trailers">Fuel Trailers</option>
//                           <option value="underground_tanks">Static Tanks</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Specific Store:</label>
//                         <select 
//                           name="selectedFuelStore" 
//                           value={formData.selectedFuelStore} 
//                           onChange={handleInputChange} 
//                           disabled={!formData.fuelStoreCategory} 
//                           style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
//                           required
//                         >
//                           <option value="">Select Store</option>
//                           {formData.fuelStoreCategory && fuelStores[formData.fuelStoreCategory]?.map(store => (
//                             <option key={store} value={store}>{store}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Column 2 - REDESIGNED Meter Readings with better spacing */}
//                 <div>
//                   <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Meter Readings</h4>
                  
//                   {formData.meterVarianceFlag && (
//                     <div style={{ 
//                       backgroundColor: formData.readingFlag === 'critical' ? '#ffebee' : formData.readingFlag === 'warning' ? '#fff3e0' : '#e8f5e8', 
//                       border: formData.readingFlag === 'critical' ? '2px solid #f44336' : formData.readingFlag === 'warning' ? '2px solid #ff9800' : '2px solid #4caf50', 
//                       borderRadius: '4px', 
//                       padding: '10px', 
//                       marginBottom: '15px', 
//                       color: formData.readingFlag === 'critical' ? '#c62828' : formData.readingFlag === 'warning' ? '#e65100' : '#1b5e20' 
//                     }}>
//                       {formData.readingFlag === 'critical' ? '🚨 CRITICAL: ' : formData.readingFlag === 'warning' ? '⚠️ WARNING: ' : 'ℹ️ NOTE: '}{formData.meterVarianceMessage}
//                     </div>
//                   )}
                  
//                   {/* REDESIGNED: More spacious 2x2 grid instead of 3x1 */}
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
//                     <div>
//                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Previous Reading:</label>
//                       <input 
//                         type="number" 
//                         name="previousMeterReading" 
//                         value={formData.previousMeterReading} 
//                         onChange={handleInputChange} 
//                         step="0.01" 
//                         readOnly={!isFirstTransaction} 
//                         style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: isFirstTransaction ? 'white' : '#f5f5f5' }} 
//                         required 
//                       />
//                     </div>
//                     <div>
//                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Current Reading (Before):</label>
//                       <input 
//                         type="number" 
//                         name="currentMeterReadingBefore" 
//                         value={formData.currentMeterReadingBefore} 
//                         onChange={handleInputChange} 
//                         step="0.01" 
//                         style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
//                         required 
//                       />
//                     </div>
//                     <div>
//                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Fuel Quantity (L):</label>
//                       <input 
//                         type="number" 
//                         name="fuelQuantity" 
//                         value={formData.fuelQuantity} 
//                         onChange={handleInputChange} 
//                         step="0.01" 
//                         style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
//                         required 
//                       />
//                     </div>
//                     <div>
//                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Closing Reading (After):</label>
//                       <input 
//                         type="text" 
//                         value={formData.currentMeterReadingAfter || ''} 
//                         readOnly 
//                         style={{ width: '100%', padding: '10px', border: '2px solid #1b5e20', borderRadius: '4px', backgroundColor: '#e8f5e8', fontWeight: 'bold', color: '#1b5e20', fontSize: '14px' }} 
//                         placeholder="Auto-calculated" 
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Column 3 - Odometer Readings */}
//                 <div>
//                   <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                       Odometer (KM)
//                       {formData.odometerKilosPhotoName && (
//                         <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px', fontWeight: 'normal' }}>
//                           📷 Photo attached
//                         </span>
//                       )}
//                     </label>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <input
//                         type="number"
//                         value={formData.odometerKilos}
//                         onChange={(e) => setFormData({...formData, odometerKilos: e.target.value})}
//                         placeholder="Enter or scan"
//                         style={{ 
//                           flex: 1, 
//                           padding: '12px', 
//                           border: formData.odometerKilosPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
//                           borderRadius: '6px', 
//                           fontSize: '14px' 
//                         }}
//                         step="0.1"
//                       />
//                       <button 
//                         type="button" 
//                         onClick={() => setShowOdometerModal('kilos')}
//                         style={{ 
//                           padding: '12px 15px',
//                           backgroundColor: formData.odometerKilosPhotoName ? '#4caf50' : '#1565c0',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '6px',
//                           cursor: 'pointer',
//                           fontSize: '14px',
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '5px'
//                         }}
//                       >
//                         {formData.odometerKilosPhotoName ? '📷 Edit' : '📸 Add Photo'}
//                       </button>
//                     </div>
//                   </div>

//                   <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                       Hours
//                       {formData.odometerHoursPhotoName && (
//                         <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px', fontWeight: 'normal' }}>
//                           📷 Photo attached
//                         </span>
//                       )}
//                     </label>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <input
//                         type="number"
//                         value={formData.odometerHours}
//                         onChange={(e) => setFormData({...formData, odometerHours: e.target.value})}
//                         placeholder="Enter hours"
//                         style={{ 
//                           flex: 1, 
//                           padding: '12px', 
//                           border: formData.odometerHoursPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
//                           borderRadius: '6px', 
//                           fontSize: '14px' 
//                         }}
//                         step="0.1"
//                       />
//                       <button 
//                         type="button" 
//                         onClick={() => setShowOdometerModal('hours')}
//                         style={{ 
//                           padding: '12px 15px',
//                           backgroundColor: formData.odometerHoursPhotoName ? '#4caf50' : '#1565c0',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '6px',
//                           cursor: 'pointer',
//                           fontSize: '14px',
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '5px'
//                         }}
//                       >
//                         {formData.odometerHoursPhotoName ? '📷 Edit' : '⏱️ Add Photo'}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Service Truck Driver Information */}
//                   <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Service Truck Driver Information</label>
//                     <div style={{ 
//                       backgroundColor: '#f8f9fa', 
//                       padding: '12px', 
//                       borderRadius: '6px',
//                       fontSize: '14px'
//                     }}>
//                       <div><strong>Name:</strong> {user.fullName}</div>
//                       <div><strong>Employee #:</strong> {user.employeeNumber || 'N/A'}</div>
//                       <div><strong>Company:</strong> {user.company || 'N/A'}</div>
//                     </div>
//                   </div>

//                   {/* Remarks */}
//                   <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Service Details</label>
//                     <textarea
//                       value={formData.serviceDetails}
//                       onChange={(e) => setFormData({...formData, serviceDetails: e.target.value})}
//                       placeholder="Describe the service performed..."
//                       rows="3"
//                       style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div style={{ textAlign: 'center' }}>
//                 <button
//                   type="submit"
//                   disabled={isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber}
//                   style={{ 
//                     padding: '15px 40px',
//                     backgroundColor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? '#ccc' : '#1565c0',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     fontSize: '16px',
//                     cursor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? 'not-allowed' : 'pointer',
//                     fontWeight: 'bold',
//                     transition: 'all 0.3s ease'
//                   }}
//                 >
//                   {isLoading ? 'Recording...' : '🔧 Record Service'}
//                 </button>
//                 {shiftStatus === 'OFF DUTY' && (
//                   <p style={{ color: '#d32f2f', marginTop: '10px', fontSize: '14px' }}>
//                     Please start your service shift before recording
//                   </p>
//                 )}
//               </div>
//             </form>
//           </div>

//           {/* Recent Services */}
//           <div style={{ 
//             backgroundColor: 'white',
//             padding: '25px',
//             borderRadius: '12px',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//           }}>
//             <h3 style={{ color: '#1565c0', marginBottom: '20px', fontSize: '20px' }}>📋 Recent Services</h3>
//             {transactions.length === 0 ? (
//               <div style={{ 
//                 textAlign: 'center', 
//                 padding: '40px 20px', 
//                 color: '#666',
//                 backgroundColor: '#f8f9fa',
//                 borderRadius: '8px'
//               }}>
//                 <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔧</div>
//                 <p>No services recorded yet</p>
//                 <p style={{ fontSize: '14px', color: '#999' }}>Start your shift and record your first service</p>
//               </div>
//             ) : (
//               <div style={{ overflowX: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
//                   <thead>
//                     <tr style={{ backgroundColor: '#f8f9fa' }}>
//                       <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date</th>
//                       <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
//                       <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Service</th>
//                       <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel</th>
//                       <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Odometer</th>
//                       <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {transactions.slice(0, 10).map((transaction, index) => (
//                       <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
//                         <td style={{ padding: '12px' }}>{transaction.transactionDate}</td>
//                         <td style={{ padding: '12px', fontWeight: '600', color: '#1565c0' }}>
//                           {transaction.plantNumber}
//                         </td>
//                         <td style={{ padding: '12px', fontWeight: 'bold', color: '#2e7d32' }}>
//                           {transaction.serviceType}
//                         </td>
//                         <td style={{ padding: '12px' }}>
//                           {transaction.fuelAdded ? `${transaction.fuelAdded}L` : '-'}
//                         </td>
//                         <td style={{ padding: '12px' }}>
//                           {transaction.odometerKilos ? `${transaction.odometerKilos} KM` : '-'}
//                         </td>
//                         <td style={{ padding: '12px' }}>
//                           <span style={{ 
//                             padding: '4px 8px', 
//                             borderRadius: '12px',
//                             backgroundColor: 
//                               transaction.serviceStatus === 'completed' ? '#e8f5e8' :
//                               transaction.serviceStatus === 'in-progress' ? '#fff3e0' :
//                               '#ffebee',
//                             color: 
//                               transaction.serviceStatus === 'completed' ? '#1b5e20' :
//                               transaction.serviceStatus === 'in-progress' ? '#ef6c00' :
//                               '#d32f2f',
//                             fontSize: '12px'
//                           }}>
//                             {transaction.serviceStatus === 'completed' ? '✅ Completed' :
//                              transaction.serviceStatus === 'in-progress' ? '🔄 In Progress' :
//                              '⏳ Pending'}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </>
//       ) : activeNav === 'history' ? (
//         // Service History View
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '25px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//         }}>
//           <h3 style={{ color: '#1565c0', marginBottom: '20px', fontSize: '20px' }}>📋 All Service History</h3>
//           {transactions.length === 0 ? (
//             <div style={{ 
//               textAlign: 'center', 
//               padding: '40px 20px', 
//               color: '#666',
//               backgroundColor: '#f8f9fa',
//               borderRadius: '8px'
//             }}>
//               <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
//               <p>No service history available</p>
//             </div>
//           ) : (
//             <div style={{ overflowX: 'auto' }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
//                 <thead>
//                   <tr style={{ backgroundColor: '#f8f9fa' }}>
//                     <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Date & Time</th>
//                     <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Vehicle</th>
//                     <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Service Type</th>
//                     <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Fuel Added</th>
//                     <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600', color: '#333' }}>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {transactions.map((transaction, index) => (
//                     <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
//                       <td style={{ padding: '12px' }}>{new Date(transaction.timestamp).toLocaleString()}</td>
//                       <td style={{ padding: '12px', fontWeight: '600', color: '#1565c0' }}>
//                         {transaction.plantNumber}
//                       </td>
//                       <td style={{ padding: '12px', fontWeight: 'bold', color: '#2e7d32' }}>
//                         {transaction.serviceType}
//                       </td>
//                       <td style={{ padding: '12px' }}>
//                         {transaction.fuelAdded ? `${transaction.fuelAdded}L` : '-'}
//                       </td>
//                       <td style={{ padding: '12px' }}>
//                         <span style={{ 
//                           padding: '4px 8px', 
//                           borderRadius: '12px',
//                           backgroundColor: 
//                             transaction.serviceStatus === 'completed' ? '#e8f5e8' :
//                             transaction.serviceStatus === 'in-progress' ? '#fff3e0' :
//                             '#ffebee',
//                           color: 
//                             transaction.serviceStatus === 'completed' ? '#1b5e20' :
//                             transaction.serviceStatus === 'in-progress' ? '#ef6c00' :
//                             '#d32f2f',
//                           fontSize: '12px'
//                         }}>
//                           {transaction.serviceStatus || 'completed'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       ) : (
//         // Profile View - MATCHING DriverDashboard
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '40px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           textAlign: 'center'
//         }}>
//           <div style={{ fontSize: '64px', marginBottom: '20px' }}>
//             👤
//           </div>
//           <h3 style={{ color: '#1565c0', marginBottom: '10px' }}>
//             Service Driver Profile
//           </h3>
//           <div style={{ 
//             backgroundColor: '#f8f9fa', 
//             padding: '20px', 
//             borderRadius: '8px',
//             maxWidth: '400px',
//             margin: '0 auto',
//             textAlign: 'left'
//           }}>
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Name:</strong> {user.fullName}
//             </div>
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Employee #:</strong> {user.employeeNumber || 'N/A'}
//             </div>
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Company:</strong> {user.company || 'N/A'}
//             </div>
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Role:</strong> {user.role || 'Service Driver'}
//             </div>
//             <div>
//               <strong>Total Services:</strong> {transactions.length}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       {showQRScanner && (
//         <QRScanner 
//           onScan={handleQRScan}
//           onClose={() => setShowQRScanner(false)}
//         />
//       )}

//       {showOdometerModal && (
//         <OdometerPhotoUpload
//           onPhotoUpload={handleOdometerUpload}
//           onClose={() => setShowOdometerModal(null)}
//           type={showOdometerModal}
//           currentValue={showOdometerModal === 'kilos' ? formData.odometerKilos : formData.odometerHours}
//           plantNumber={formData.plantNumber}
//           transactionId={Date.now()}
//           userId={user?.id}
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
//     </div>
//   );
// };

// export default ServiceTruckDriverDashboard;


// import React, { useState, useRef, useEffect } from 'react';
// import transactionService from '../../services/transactionService';
// import QRScanner from '../qr/QRScanner';

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

//   const handleSave = () => {
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

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
//             Fuel Quantity (Liters):
//           </label>
//           <input
//             type="number"
//             value={quantity}
//             onChange={(e) => setQuantity(e.target.value)}
//             placeholder="Enter liters..."
//             step="0.1"
//             min="0"
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: '2px solid #1b5e20',
//               borderRadius: '6px',
//               fontSize: '16px'
//             }}
//           />
//         </div>

//         <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//           <button 
//             onClick={onClose}
//             style={{ 
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
//           <button 
//             onClick={handleSave}
//             style={{ 
//               padding: '12px 20px', 
//               backgroundColor: '#1b5e20', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '6px', 
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const OdometerPhotoUpload = ({ 
//   onPhotoUpload, 
//   onClose, 
//   type, 
//   currentValue,
//   plantNumber,
//   transactionId,
//   userId
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
//       const filename = `odometer_${type}_${plantNumber || 'unknown'}_${year}${month}${day}_${hours}${minutes}${seconds}.jpg`;
      
//       const fileSize = Math.round((photo.length * 3) / 4);
      
//       const photoData = {
//         photoId: Date.now(),
//         filename: filename,
//         originalName: photoName || `odometer_${type}.jpg`,
//         base64Data: photo,
//         type: type,
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
//           readingValue: manualValue
//         }
//       };

//       const savedPhoto = await savePhotoToDatabase(photoData);
      
//       const savedPhotoRefs = JSON.parse(localStorage.getItem('odometerPhotoRefs') || '[]');
//       savedPhotoRefs.push({
//         photoId: savedPhoto.photoId,
//         filename: savedPhoto.filename,
//         type: savedPhoto.type,
//         reading: savedPhoto.reading,
//         timestamp: savedPhoto.timestamp,
//         plantNumber: savedPhoto.plantNumber,
//         folderPath: savedPhoto.folderPath,
//         thumbnail: savedPhoto.thumbnail
//       });
//       localStorage.setItem('odometerPhotoRefs', JSON.stringify(savedPhotoRefs));
      
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
//           type: type
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
//       type: type
//     });
//     onClose();
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
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
//             {type === 'kilos' ? '📏 Odometer Kilometers' : '⏱️ Odometer Hours'}
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
//             Enter Reading: *
//           </label>
//           <input
//             type="number"
//             value={manualValue}
//             onChange={(e) => {
//               setManualValue(e.target.value);
//               setErrorMessage('');
//             }}
//             placeholder={`Enter ${type === 'kilos' ? 'kilometers' : 'hours'}...`}
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
//                 alt="Odometer" 
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
//               <div><strong>Reading:</strong> {uploadedPhotoData.reading} {type === 'kilos' ? 'km' : 'hrs'}</div>
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
//       const savedPhotoRefs = JSON.parse(localStorage.getItem('odometerPhotoRefs') || '[]');
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
//     const kmPhotos = photos.filter(p => p.type === 'kilos');
//     const hourPhotos = photos.filter(p => p.type === 'hours');
//     const today = new Date().toDateString();
//     const todayPhotos = photos.filter(p => new Date(p.timestamp).toDateString() === today);
    
//     return {
//       total: photos.length,
//       km: kmPhotos.length,
//       hours: hourPhotos.length,
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
//                             📷 {photo.type === 'kilos' ? 'KM' : 'HRS'}
//                           </div>
//                         )}
//                       </div>
//                       <div style={{ padding: '10px' }}>
//                         <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
//                           {photo.reading} {photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : ''}
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
//                           📷 {photo.type === 'kilos' ? 'KM' : 'HRS'}
//                         </div>
//                       )}
//                     </div>
//                     <div style={{ padding: '10px' }}>
//                       <div style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
//                         {photo.reading} {photo.type === 'kilos' ? 'km' : photo.type === 'hours' ? 'hrs' : ''}
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
//                 <p>Upload odometer photos to see them here</p>
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
//                     {selectedPhoto.reading || '0'} {selectedPhoto.type === 'kilos' ? 'kilometers' : selectedPhoto.type === 'hours' ? 'hours' : ''}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Type</div>
//                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
//                     {selectedPhoto.type === 'kilos' ? 'Kilometers (KM)' : selectedPhoto.type === 'hours' ? 'Hours (HRS)' : 'Unknown'}
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
//                     alt="Odometer"
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
//                     alt="Odometer Thumbnail"
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

// // ==================== MAIN SERVICE TRUCK DRIVER DASHBOARD ====================

// const ServiceTruckDriverDashboard = ({ user, onLogout, onNavigateToAdmin }) => {
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
//     receiverName: user.fullName || '',
//     receiverCompany: user.company || '',
//     employmentNumber: user.employeeNumber || '',
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
//     selectedFuelStore: ''
//   });

//   const [showQRScanner, setShowQRScanner] = useState(false);
//   const [showOdometerModal, setShowOdometerModal] = useState(null);
//   const [showPhotoGallery, setShowPhotoGallery] = useState(false);
//   const [showFuelEditModal, setShowFuelEditModal] = useState(false);
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

//   // Fuel stores definition
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

//   // Plant master list (truncated for brevity)
//   const plantMasterList = {
//     'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     // ... add more plant entries as needed
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
        
//         if (kilosPhoto || hoursPhoto) {
//           setOdometerPhotos({
//             kilos: kilosPhoto || null,
//             hours: hoursPhoto || null
//           });
//         }
//       } catch (error) {
//         console.error('Error loading saved photos:', error);
//       }
//     };
    
//     loadSavedPhotos();
//   }, [user.id]);

//   // QR Scan handler
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

//   // Fuel quantity edit handler
//   const handleFuelQuantityEdit = (newQuantity) => {
//     setFormData(prev => ({
//       ...prev,
//       fuelQuantity: newQuantity
//     }));
//     setShowFuelEditModal(false);
//   };

//   // Handle input change for meter readings
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => {
//       const updatedData = { ...prev, [name]: value };
      
//       if (name === 'currentMeterReadingBefore' || name === 'fuelQuantity') {
//         const currentReading = parseFloat(updatedData.currentMeterReadingBefore) || 0;
//         const fuelQuantity = parseFloat(updatedData.fuelQuantity) || 0;
//         updatedData.currentMeterReadingAfter = (currentReading + fuelQuantity).toFixed(2);
//       }
      
//       if (name === 'currentMeterReadingBefore' && updatedData.previousMeterReading) {
//         const previous = parseFloat(updatedData.previousMeterReading);
//         const current = parseFloat(value);
//         const variance = current - previous;
        
//         if (variance < 0) {
//           updatedData.meterVarianceFlag = true;
//           updatedData.readingFlag = 'critical';
//           updatedData.meterVarianceMessage = `Current reading (${current}) is less than previous reading (${previous})!`;
//         } else if (variance > 1000) {
//           updatedData.meterVarianceFlag = true;
//           updatedData.readingFlag = 'warning';
//           updatedData.meterVarianceMessage = `Large variance detected: ${variance} units`;
//         } else {
//           updatedData.meterVarianceFlag = false;
//         }
//       }
      
//       return updatedData;
//     });
//   };

//   // Calculate today's distance
//   const getTodayDistance = () => {
//     return '0';
//   };

//   // Service submission
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
//         previousMeterReading: formData.previousMeterReading,
//         currentMeterReadingBefore: formData.currentMeterReadingBefore,
//         currentMeterReadingAfter: formData.currentMeterReadingAfter,
//         meterVarianceFlag: formData.meterVarianceFlag,
//         readingFlag: formData.readingFlag,
//         meterVarianceMessage: formData.meterVarianceMessage,
//         fuelStoreCategory: formData.fuelStoreCategory,
//         selectedFuelStore: formData.selectedFuelStore,
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
//         folderPath: `services/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`
//       };

//       const transaction = transactionService.saveTransaction(serviceData, user);

//       setTransactions(prev => [transaction, ...prev]);

//       setServiceStats(prev => ({
//         ...prev,
//         completedToday: prev.completedToday + 1,
//         totalServices: prev.totalServices + 1
//       }));

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
//         previousMeterReading: '',
//         currentMeterReadingBefore: '',
//         currentMeterReadingAfter: '',
//         meterVarianceFlag: false,
//         readingFlag: '',
//         meterVarianceMessage: '',
//         fuelStoreCategory: '',
//         selectedFuelStore: '',
//         remarks: ''
//       }));

//       setOdometerPhotos({ kilos: null, hours: null });

//       setSuccessMessage('Service recorded successfully!');
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

//   // Notification handlers
//   const markNotificationAsRead = (id) => {
//     setNotifications(prev => 
//       prev.map(notif => 
//         notif.id === id ? { ...notif, read: true } : notif
//       )
//     );
//   };

//   const markAllNotificationsAsRead = () => {
//     setNotifications(prev => 
//       prev.map(notif => ({ ...notif, read: true }))
//     );
//   };

//   const unreadNotificationsCount = notifications.filter(n => !n.read).length;

//   const isFirstTransaction = !transactions.some(t => t.plantNumber === formData.plantNumber);

//   // Define colors for consistency
//   const colors = {
//     primary: '#1b5e20',
//     primaryLight: '#4caf50',
//     cardBg: '#f8f9fa',
//     textLight: '#666',
//     border: '#e0e0e0'
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
//           {!sidebarCollapsed && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//               <div style={{ 
//                 width: '40px', 
//                 height: '40px', 
//                 borderRadius: '50%', 
//                 overflow: 'hidden',
//                 backgroundColor: 'white',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}>
//                 <img src="/fuel2.jpg" alt="FMS Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//               </div>
//               <div>
//                 <div style={{ fontWeight: 'bold', fontSize: '16px' }}>FMS</div>
//                 <div style={{ fontSize: '12px', opacity: 0.8 }}>Service Driver</div>
//               </div>
//             </div>
//           )}
          
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

//         {/* User Profile */}
//         <div style={{
//           padding: '20px',
//           borderBottom: '1px solid rgba(255,255,255,0.1)',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '12px'
//         }}>
//           <div style={{
//             width: '50px',
//             height: '50px',
//             borderRadius: '50%',
//             backgroundColor: '#4caf50',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontWeight: 'bold',
//             fontSize: '18px',
//             flexShrink: 0
//           }}>
//             {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
//           </div>
          
//           {!sidebarCollapsed && (
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{ fontWeight: '600', fontSize: '15px' }}>{user.fullName}</div>
//               <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
//                 #{user.employeeNumber || 'N/A'}
//               </div>
//               <div style={{
//                 marginTop: '8px',
//                 padding: '4px 8px',
//                 backgroundColor: shiftStatus === 'ON DUTY' ? '#4caf50' : '#757575',
//                 borderRadius: '12px',
//                 fontSize: '11px',
//                 display: 'inline-block'
//               }}>
//                 {shiftStatus === 'ON DUTY' ? '🟢 ON DUTY' : '⚫ OFF DUTY'}
//               </div>
//             </div>
//           )}
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

//         {/* Sidebar Footer */}
//         <div style={{
//           padding: '20px',
//           borderTop: '1px solid rgba(255,255,255,0.1)',
//           marginTop: 'auto'
//         }}>
//           <button
//             onClick={onLogout}
//             style={{
//               width: '100%',
//               padding: sidebarCollapsed ? '12px 0' : '12px 20px',
//               backgroundColor: 'rgba(255,255,255,0.1)',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '10px',
//               fontSize: '14px',
//               transition: 'all 0.3s ease',
//               ':hover': {
//                 backgroundColor: 'rgba(255,255,255,0.15)'
//               }
//             }}
//           >
//             <span style={{ fontSize: '16px' }}>🚪</span>
//             {!sidebarCollapsed && <span>Logout</span>}
//           </button>
//         </div>
//       </div>

//       {/* ==================== MAIN CONTENT ==================== */}
//       <div style={{ 
//         flex: 1,
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'auto'
//       }}>
//         {/* Top Header Bar */}
//         <div style={{
//           backgroundColor: 'white',
//           padding: '0 30px',
//           borderBottom: '1px solid #e0e0e0',
//           height: '70px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           position: 'sticky',
//           top: 0,
//           zIndex: 99
//         }}>
//           <div>
//             <h1 style={{ 
//               margin: 0, 
//               color: '#1b5e20', 
//               fontSize: '24px', 
//               fontWeight: '600' 
//             }}>
//               {activeNav === 'dashboard' ? 'Service Dashboard' : 
//                activeNav === 'history' ? 'Service History' : 
//                'Driver Profile'}
//             </h1>
//             <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
//               Welcome back, {user.fullName}!
//             </div>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//             {/* Notifications */}
//             <div style={{ position: 'relative' }}>
//               <button
//                 onClick={() => {
//                   // Toggle notifications
//                 }}
//                 style={{
//                   backgroundColor: 'transparent',
//                   border: 'none',
//                   cursor: 'pointer',
//                   padding: '8px',
//                   borderRadius: '50%',
//                   position: 'relative',
//                   ':hover': {
//                     backgroundColor: '#f5f5f5'
//                   }
//                 }}
//               >
//                 <span style={{ fontSize: '20px' }}>🔔</span>
//                 {unreadNotificationsCount > 0 && (
//                   <span style={{
//                     position: 'absolute',
//                     top: '2px',
//                     right: '2px',
//                     backgroundColor: '#f44336',
//                     color: 'white',
//                     borderRadius: '50%',
//                     width: '18px',
//                     height: '18px',
//                     fontSize: '10px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     fontWeight: 'bold'
//                   }}>
//                     {unreadNotificationsCount}
//                   </span>
//                 )}
//               </button>
//             </div>

//             {/* Current Vehicle Info */}
//             {currentVehicle && (
//               <div style={{ 
//                 padding: '8px 16px',
//                 backgroundColor: '#e8f5e8',
//                 borderRadius: '20px',
//                 border: '1px solid #c8e6c9',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}>
//                 <span style={{ color: '#1b5e20', fontWeight: '600' }}>🔧</span>
//                 <span style={{ color: '#2e7d32', fontWeight: '600' }}>{currentVehicle}</span>
//                 {shiftStartTime && (
//                   <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px' }}>
//                     Started: {formatTime(shiftStartTime)}
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <div style={{ 
//           flex: 1,
//           padding: '30px',
//           overflowY: 'auto'
//         }}>
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
//               {/* Quick Stats */}
//               <div style={{ 
//                 display: 'grid', 
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//                 gap: '20px', 
//                 marginBottom: '30px' 
//               }}>
//                 <div style={{ 
//                   backgroundColor: 'white',
//                   padding: '20px',
//                   borderRadius: '12px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                   textAlign: 'center'
//                 }}>
//                   <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔧</div>
//                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>
//                     {serviceStats.currentJobs}
//                   </div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Active Services</div>
//                 </div>
                
//                 <div style={{ 
//                   backgroundColor: 'white',
//                   padding: '20px',
//                   borderRadius: '12px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                   textAlign: 'center'
//                 }}>
//                   <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
//                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
//                     {serviceStats.completedToday}
//                   </div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Completed Today</div>
//                 </div>
                
//                 <div style={{ 
//                   backgroundColor: 'white',
//                   padding: '20px',
//                   borderRadius: '12px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                   textAlign: 'center'
//                 }}>
//                   <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚨</div>
//                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>
//                     {serviceStats.urgentServices}
//                   </div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Urgent Services</div>
//                 </div>
                
//                 <div style={{ 
//                   backgroundColor: 'white',
//                   padding: '20px',
//                   borderRadius: '12px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                   textAlign: 'center'
//                 }}>
//                   <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏱️</div>
//                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
//                     {serviceStats.avgServiceTime}
//                   </div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Avg. Service Time</div>
//                 </div>
//               </div>

//               {/* Service Record Form */}
//               <div style={{ 
//                 backgroundColor: 'white',
//                 padding: '30px',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                 marginBottom: '30px'
//               }}>
//                 <h3 style={{ color: '#1565c0', marginBottom: '25px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   <span>🔧</span>
//                   Record New Service
//                 </h3>
                
//                 <form onSubmit={handleSubmit}>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '25px' }}>
//                     {/* Column 1 */}
//                     <div>
//                       <div style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
//                           Service Plant Number *
//                         </label>
//                         <div style={{ display: 'flex', gap: '12px' }}>
//                           <input
//                             type="text"
//                             value={formData.plantNumber}
//                             onChange={(e) => setFormData({...formData, plantNumber: e.target.value})}
//                             placeholder="Scan or enter vehicle number"
//                             style={{ 
//                               flex: 1, 
//                               padding: '14px', 
//                               border: formData.plantNumber ? '2px solid #1565c0' : '1px solid #ddd', 
//                               borderRadius: '8px', 
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
//                               padding: '14px 24px',
//                               backgroundColor: shiftStatus === 'ON DUTY' ? '#ccc' : '#1565c0',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '8px',
//                               cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
//                               fontSize: '15px',
//                               fontWeight: '600',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '8px'
//                             }}
//                           >
//                             <span>📱</span>
//                             Scan
//                           </button>
//                         </div>
//                       </div>

//                       {/* Fuel Store Selection */}
//                       <div>
//                         <h4 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                           <span>⛽</span>
//                           Fuel Store Selection
//                         </h4>
//                         <div style={{ display: 'grid', gap: '15px' }}>
//                           <div>
//                             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fuel Store Category:</label>
//                             <select 
//                               name="fuelStoreCategory" 
//                               value={formData.fuelStoreCategory} 
//                               onChange={handleInputChange} 
//                               style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
//                               required
//                             >
//                               <option value="">Select Category</option>
//                               <option value="service_trucks">Service Trucks</option>
//                               <option value="fuel_trailers">Fuel Trailers</option>
//                               <option value="underground_tanks">Static Tanks</option>
//                             </select>
//                           </div>
//                           <div>
//                             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Specific Store:</label>
//                             <select 
//                               name="selectedFuelStore" 
//                               value={formData.selectedFuelStore} 
//                               onChange={handleInputChange} 
//                               disabled={!formData.fuelStoreCategory} 
//                               style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
//                               required
//                             >
//                               <option value="">Select Store</option>
//                               {formData.fuelStoreCategory && fuelStores[formData.fuelStoreCategory]?.map(store => (
//                                 <option key={store} value={store}>{store}</option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Column 2 - Meter Readings */}
//                     <div>
//                       <h4 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                         <span>📊</span>
//                         Meter Readings
//                       </h4>
                      
//                       {formData.meterVarianceFlag && (
//                         <div style={{ 
//                           backgroundColor: formData.readingFlag === 'critical' ? '#ffebee' : formData.readingFlag === 'warning' ? '#fff3e0' : '#e8f5e8', 
//                           border: formData.readingFlag === 'critical' ? '2px solid #f44336' : formData.readingFlag === 'warning' ? '2px solid #ff9800' : '2px solid #4caf50', 
//                           borderRadius: '6px', 
//                           padding: '12px', 
//                           marginBottom: '20px', 
//                           color: formData.readingFlag === 'critical' ? '#c62828' : formData.readingFlag === 'warning' ? '#e65100' : '#1b5e20' 
//                         }}>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
//                             <span>{formData.readingFlag === 'critical' ? '🚨' : formData.readingFlag === 'warning' ? '⚠️' : 'ℹ️'}</span>
//                             {formData.readingFlag === 'critical' ? 'CRITICAL: ' : formData.readingFlag === 'warning' ? 'WARNING: ' : 'NOTE: '}{formData.meterVarianceMessage}
//                           </div>
//                         </div>
//                       )}
                      
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
//                         <div>
//                           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Previous Reading:</label>
//                           <input 
//                             type="number" 
//                             name="previousMeterReading" 
//                             value={formData.previousMeterReading} 
//                             onChange={handleInputChange} 
//                             step="0.01" 
//                             readOnly={!isFirstTransaction} 
//                             style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: isFirstTransaction ? 'white' : '#f5f5f5', fontSize: '15px' }} 
//                             required 
//                           />
//                         </div>
//                         <div>
//                           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Current Reading (Before):</label>
//                           <input 
//                             type="number" 
//                             name="currentMeterReadingBefore" 
//                             value={formData.currentMeterReadingBefore} 
//                             onChange={handleInputChange} 
//                             step="0.01" 
//                             style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
//                             required 
//                           />
//                         </div>
//                         <div>
//                           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Fuel Quantity (L):</label>
//                           <input 
//                             type="number" 
//                             name="fuelQuantity" 
//                             value={formData.fuelQuantity} 
//                             onChange={handleInputChange} 
//                             step="0.01" 
//                             style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
//                             required 
//                           />
//                         </div>
//                         <div>
//                           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Closing Reading (After):</label>
//                           <input 
//                             type="text" 
//                             value={formData.currentMeterReadingAfter || ''} 
//                             readOnly 
//                             style={{ width: '100%', padding: '12px', border: '2px solid #1b5e20', borderRadius: '6px', backgroundColor: '#e8f5e8', fontWeight: 'bold', color: '#1b5e20', fontSize: '15px' }} 
//                             placeholder="Auto-calculated" 
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Column 3 - Odometer Readings */}
//                     <div>
//                       <div style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
//                           Odometer (KM)
//                           {formData.odometerKilosPhotoName && (
//                             <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px', fontWeight: 'normal' }}>
//                               📷 Photo attached
//                             </span>
//                           )}
//                         </label>
//                         <div style={{ display: 'flex', gap: '12px' }}>
//                           <input
//                             type="number"
//                             value={formData.odometerKilos}
//                             onChange={(e) => setFormData({...formData, odometerKilos: e.target.value})}
//                             placeholder="Enter or scan"
//                             style={{ 
//                               flex: 1, 
//                               padding: '14px', 
//                               border: formData.odometerKilosPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
//                               borderRadius: '8px', 
//                               fontSize: '15px' 
//                             }}
//                             step="0.1"
//                           />
//                           <button 
//                             type="button" 
//                             onClick={() => setShowOdometerModal('kilos')}
//                             style={{ 
//                               padding: '14px 18px',
//                               backgroundColor: formData.odometerKilosPhotoName ? '#4caf50' : '#1565c0',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '8px',
//                               cursor: 'pointer',
//                               fontSize: '15px',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '8px'
//                             }}
//                           >
//                             {formData.odometerKilosPhotoName ? '📷 Edit' : '📸 Add Photo'}
//                           </button>
//                         </div>
//                       </div>

//                       <div style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
//                           Hours
//                           {formData.odometerHoursPhotoName && (
//                             <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px', fontWeight: 'normal' }}>
//                               📷 Photo attached
//                             </span>
//                           )}
//                         </label>
//                         <div style={{ display: 'flex', gap: '12px' }}>
//                           <input
//                             type="number"
//                             value={formData.odometerHours}
//                             onChange={(e) => setFormData({...formData, odometerHours: e.target.value})}
//                             placeholder="Enter hours"
//                             style={{ 
//                               flex: 1, 
//                               padding: '14px', 
//                               border: formData.odometerHoursPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
//                               borderRadius: '8px', 
//                               fontSize: '15px' 
//                             }}
//                             step="0.1"
//                           />
//                           <button 
//                             type="button" 
//                             onClick={() => setShowOdometerModal('hours')}
//                             style={{ 
//                               padding: '14px 18px',
//                               backgroundColor: formData.odometerHoursPhotoName ? '#4caf50' : '#1565c0',
//                               color: 'white',
//                               border: 'none',
//                               borderRadius: '8px',
//                               cursor: 'pointer',
//                               fontSize: '15px',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '8px'
//                             }}
//                           >
//                             {formData.odometerHoursPhotoName ? '📷 Edit' : '⏱️ Add Photo'}
//                           </button>
//                         </div>
//                       </div>

//                       {/* Service Truck Driver Information */}
//                       <div style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
//                           👤 Service Truck Driver Information
//                         </label>
//                         <div style={{ 
//                           backgroundColor: '#f8f9fa', 
//                           padding: '15px', 
//                           borderRadius: '8px',
//                           fontSize: '15px',
//                           border: '1px solid #e0e0e0'
//                         }}>
//                           <div><strong>Name:</strong> {user.fullName}</div>
//                           <div><strong>Employee #:</strong> {user.employeeNumber || 'N/A'}</div>
//                           <div><strong>Company:</strong> {user.company || 'N/A'}</div>
//                         </div>
//                       </div>

//                       {/* Remarks */}
//                       <div style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
//                           📝 Service Details
//                         </label>
//                         <textarea
//                           value={formData.serviceDetails}
//                           onChange={(e) => setFormData({...formData, serviceDetails: e.target.value})}
//                           placeholder="Describe the service performed..."
//                           rows="4"
//                           style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', resize: 'vertical' }}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #eee' }}>
//                     <button
//                       type="submit"
//                       disabled={isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber}
//                       style={{ 
//                         padding: '16px 50px',
//                         backgroundColor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? '#ccc' : '#1565c0',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '8px',
//                         fontSize: '17px',
//                         cursor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? 'not-allowed' : 'pointer',
//                         fontWeight: 'bold',
//                         transition: 'all 0.3s ease',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '12px',
//                         margin: '0 auto'
//                       }}
//                     >
//                       {isLoading ? (
//                         <>
//                           <span>⏳</span>
//                           Recording...
//                         </>
//                       ) : (
//                         <>
//                           <span>🔧</span>
//                           Record Service
//                         </>
//                       )}
//                     </button>
//                     {shiftStatus === 'OFF DUTY' && (
//                       <p style={{ color: '#d32f2f', marginTop: '15px', fontSize: '15px' }}>
//                         ⚠️ Please start your service shift before recording
//                       </p>
//                     )}
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

//       {showOdometerModal && (
//         <OdometerPhotoUpload
//           onPhotoUpload={handleOdometerUpload}
//           onClose={() => setShowOdometerModal(null)}
//           type={showOdometerModal}
//           currentValue={showOdometerModal === 'kilos' ? formData.odometerKilos : formData.odometerHours}
//           plantNumber={formData.plantNumber}
//           transactionId={Date.now()}
//           userId={user?.id}
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
//     </div>
//   );
// };

// export default ServiceTruckDriverDashboard;

import React, { useState, useRef, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import QRScanner from '../qr/QRScanner';

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
      const filename = `odometer_${type}_${plantNumber || 'unknown'}_${year}${month}${day}_${hours}${minutes}${seconds}.jpg`;
      
      const fileSize = Math.round((photo.length * 3) / 4);
      
      const photoData = {
        photoId: Date.now(),
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

      const savedPhoto = await savePhotoToDatabase(photoData);
      
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

// ==================== MAIN SERVICE TRUCK DRIVER DASHBOARD ====================

const ServiceTruckDriverDashboard = ({ user, onLogout, onNavigateToAdmin }) => {
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
    receiverName: user.fullName || '',
    receiverCompany: user.company || '',
    employmentNumber: user.employeeNumber || '',
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
    selectedFuelStore: ''
  });

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
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

  // Additional state for sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Service due for A-APB05', time: '2 hours ago', read: false },
    { id: 2, message: 'Fuel low in FSH01', time: '1 day ago', read: true },
    { id: 3, message: 'Weekly report ready', time: '2 days ago', read: true }
  ]);

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

  // Fuel stores definition
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

  // Plant master list
  const plantMasterList = {
    'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    // ... add more plant entries as needed
  };

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

  // Handle input change for meter readings
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      if (name === 'currentMeterReadingBefore' || name === 'fuelQuantity') {
        const currentReading = parseFloat(updatedData.currentMeterReadingBefore) || 0;
        const fuelQuantity = parseFloat(updatedData.fuelQuantity) || 0;
        updatedData.currentMeterReadingAfter = (currentReading + fuelQuantity).toFixed(2);
      }
      
      if (name === 'currentMeterReadingBefore' && updatedData.previousMeterReading) {
        const previous = parseFloat(updatedData.previousMeterReading);
        const current = parseFloat(value);
        const variance = current - previous;
        
        if (variance < 0) {
          updatedData.meterVarianceFlag = true;
          updatedData.readingFlag = 'critical';
          updatedData.meterVarianceMessage = `Current reading (${current}) is less than previous reading (${previous})!`;
        } else if (variance > 1000) {
          updatedData.meterVarianceFlag = true;
          updatedData.readingFlag = 'warning';
          updatedData.meterVarianceMessage = `Large variance detected: ${variance} units`;
        } else {
          updatedData.meterVarianceFlag = false;
        }
      }
      
      return updatedData;
    });
  };

  // Calculate today's distance
  const getTodayDistance = () => {
    return '0';
  };

  // Service submission
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

      const serviceData = {
        plantNumber: formData.plantNumber,
        plantName: formData.plantName,
        plantType: formData.plantType,
        serviceType: 'General Service',
        serviceDetails: formData.serviceDetails,
        fuelQuantity: formData.fuelQuantity || '0',
        fuelAdded: formData.fuelAdded || '0',
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
        folderPath: `services/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/`
      };

      const transaction = transactionService.saveTransaction(serviceData, user);

      setTransactions(prev => [transaction, ...prev]);

      setServiceStats(prev => ({
        ...prev,
        completedToday: prev.completedToday + 1,
        totalServices: prev.totalServices + 1
      }));

      setFormData(prev => ({
        ...prev,
        serviceDetails: '',
        fuelQuantity: '',
        fuelAdded: '',
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
        currentMeterReadingAfter: '',
        meterVarianceFlag: false,
        readingFlag: '',
        meterVarianceMessage: '',
        fuelStoreCategory: '',
        selectedFuelStore: '',
        contractType: '',
        remarks: ''
      }));

      setOdometerPhotos({ kilos: null, hours: null });

      setSuccessMessage('Service recorded successfully!');
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

  // Notification handlers
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const isFirstTransaction = !transactions.some(t => t.plantNumber === formData.plantNumber);

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

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      display: 'flex'
    }}>
      {/* ==================== SIDEBAR ==================== */}
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
          {/* {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                overflow: 'hidden',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src="/fuel2.jpg" alt="FMS Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>FMS</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Service Driver</div>
              </div>
            </div>
          )} */}
          
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

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            {!sidebarCollapsed && (
              <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                Main Menu
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
          </div>

          <div style={{ marginBottom: '20px' }}>
            {!sidebarCollapsed && (
              <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                Quick Actions
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
              onClick={handleShiftStart}
              disabled={shiftStatus === 'ON DUTY'}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                backgroundColor: shiftStatus === 'ON DUTY' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: shiftStatus === 'ON DUTY' ? 'rgba(255,255,255,0.5)' : 'white',
                border: 'none',
                cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                ':hover': shiftStatus === 'ON DUTY' ? {} : {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🔧</span>
              {!sidebarCollapsed && <span>{shiftStatus === 'ON DUTY' ? 'Shift Started' : 'Begin Shift'}</span>}
            </button>
            
            <button
              onClick={handleShiftEnd}
              disabled={shiftStatus === 'OFF DUTY'}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                backgroundColor: shiftStatus === 'OFF DUTY' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: shiftStatus === 'OFF DUTY' ? 'rgba(255,255,255,0.5)' : 'white',
                border: 'none',
                cursor: shiftStatus === 'OFF DUTY' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                ':hover': shiftStatus === 'OFF DUTY' ? {} : {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🏁</span>
              {!sidebarCollapsed && <span>{shiftStatus === 'OFF DUTY' ? 'Not on Shift' : 'End Shift'}</span>}
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
                  </div>
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

              {/* Service Record Form */}
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '25px' }}>
                    {/* Column 1 */}
                    <div>
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
                          Service Plant Number *
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input
                            type="text"
                            value={formData.plantNumber}
                            onChange={(e) => setFormData({...formData, plantNumber: e.target.value})}
                            placeholder="Scan or enter vehicle number"
                            style={{ 
                              flex: 1, 
                              padding: '14px', 
                              border: formData.plantNumber ? '2px solid #1565c0' : '1px solid #ddd', 
                              borderRadius: '8px', 
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
                              padding: '14px 24px',
                              backgroundColor: shiftStatus === 'ON DUTY' ? '#ccc' : '#1565c0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: shiftStatus === 'ON DUTY' ? 'not-allowed' : 'pointer',
                              fontSize: '15px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span>📱</span>
                            Scan
                          </button>
                        </div>
                      </div>

                      {/* Fuel Store Selection */}
                      <div>
                        <h4 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>⛽</span>
                          Fuel Store Selection
                        </h4>
                        <div style={{ display: 'grid', gap: '15px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fuel Store Category:</label>
                            <select 
                              name="fuelStoreCategory" 
                              value={formData.fuelStoreCategory} 
                              onChange={handleInputChange} 
                              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
                              required
                            >
                              <option value="">Select Category</option>
                              <option value="service_trucks">Service Trucks</option>
                              <option value="fuel_trailers">Fuel Trailers</option>
                              <option value="underground_tanks">Static Tanks</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Specific Store:</label>
                            <select 
                              name="selectedFuelStore" 
                              value={formData.selectedFuelStore} 
                              onChange={handleInputChange} 
                              disabled={!formData.fuelStoreCategory} 
                              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
                              required
                            >
                              <option value="">Select Store</option>
                              {formData.fuelStoreCategory && fuelStores[formData.fuelStoreCategory]?.map(store => (
                                <option key={store} value={store}>{store}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 - Meter Readings */}
                    <div>
                      <h4 style={{ color: '#1b5e20', marginBottom: '15px', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📊</span>
                        Meter Readings
                      </h4>
                      
                      {formData.meterVarianceFlag && (
                        <div style={{ 
                          backgroundColor: formData.readingFlag === 'critical' ? '#ffebee' : formData.readingFlag === 'warning' ? '#fff3e0' : '#e8f5e8', 
                          border: formData.readingFlag === 'critical' ? '2px solid #f44336' : formData.readingFlag === 'warning' ? '2px solid #ff9800' : '2px solid #4caf50', 
                          borderRadius: '6px', 
                          padding: '12px', 
                          marginBottom: '20px', 
                          color: formData.readingFlag === 'critical' ? '#c62828' : formData.readingFlag === 'warning' ? '#e65100' : '#1b5e20' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <span>{formData.readingFlag === 'critical' ? '🚨' : formData.readingFlag === 'warning' ? '⚠️' : 'ℹ️'}</span>
                            {formData.readingFlag === 'critical' ? 'CRITICAL: ' : formData.readingFlag === 'warning' ? 'WARNING: ' : 'NOTE: '}{formData.meterVarianceMessage}
                          </div>
                        </div>
                      )}
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Previous Reading:</label>
                          <input 
                            type="number" 
                            name="previousMeterReading" 
                            value={formData.previousMeterReading} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            readOnly={!isFirstTransaction} 
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: isFirstTransaction ? 'white' : '#f5f5f5', fontSize: '15px' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Current Reading (Before):</label>
                          <input 
                            type="number" 
                            name="currentMeterReadingBefore" 
                            value={formData.currentMeterReadingBefore} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Fuel Quantity (L):</label>
                          <input 
                            type="number" 
                            name="fuelQuantity" 
                            value={formData.fuelQuantity} 
                            onChange={handleInputChange} 
                            step="0.01" 
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Closing Reading (After):</label>
                          <input 
                            type="text" 
                            value={formData.currentMeterReadingAfter || ''} 
                            readOnly 
                            style={{ width: '100%', padding: '12px', border: '2px solid #1b5e20', borderRadius: '6px', backgroundColor: '#e8f5e8', fontWeight: 'bold', color: '#1b5e20', fontSize: '15px' }} 
                            placeholder="Auto-calculated" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 3 - Odometer Readings */}
                    <div>
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
                          Odometer (KM)
                          {formData.odometerKilosPhotoName && (
                            <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px', fontWeight: 'normal' }}>
                              📷 Photo attached
                            </span>
                          )}
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input
                            type="number"
                            value={formData.odometerKilos}
                            onChange={(e) => setFormData({...formData, odometerKilos: e.target.value})}
                            placeholder="Enter or scan"
                            style={{ 
                              flex: 1, 
                              padding: '14px', 
                              border: formData.odometerKilosPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                              borderRadius: '8px', 
                              fontSize: '15px' 
                            }}
                            step="0.1"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowOdometerModal('kilos')}
                            style={{ 
                              padding: '14px 18px',
                              backgroundColor: formData.odometerKilosPhotoName ? '#4caf50' : '#1565c0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            {formData.odometerKilosPhotoName ? '📷 Edit' : '📸 Add Photo'}
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
                          Hours
                          {formData.odometerHoursPhotoName && (
                            <span style={{ color: '#4caf50', marginLeft: '5px', fontSize: '12px', fontWeight: 'normal' }}>
                              📷 Photo attached
                            </span>
                          )}
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input
                            type="number"
                            value={formData.odometerHours}
                            onChange={(e) => setFormData({...formData, odometerHours: e.target.value})}
                            placeholder="Enter hours"
                            style={{ 
                              flex: 1, 
                              padding: '14px', 
                              border: formData.odometerHoursPhotoName ? '2px solid #4caf50' : '1px solid #ddd', 
                              borderRadius: '8px', 
                              fontSize: '15px' 
                            }}
                            step="0.1"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowOdometerModal('hours')}
                            style={{ 
                              padding: '14px 18px',
                              backgroundColor: formData.odometerHoursPhotoName ? '#4caf50' : '#1565c0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            {formData.odometerHoursPhotoName ? '📷 Edit' : '⏱️ Add Photo'}
                          </button>
                        </div>
                      </div>

                      {/* Contract/Site Selection */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Contract/Site</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select
                            value={formData.contractType}
                            onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                            style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }}
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

                    {/* Column 4 */}
                    <div>
                                {/* Service Truck Driver Information */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
                          👤 Service Truck Driver Information
                        </label>
                        <div style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '15px', 
                          borderRadius: '8px',
                          fontSize: '15px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <div><strong>Name:</strong> {user.fullName}</div>
                          <div><strong>Employee #:</strong> {user.employeeNumber || 'N/A'}</div>
                          <div><strong>Company:</strong> {user.company || 'N/A'}</div>
                        </div>
                      </div>
                      {/* Remarks */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
                          📝 Remarks
                        </label>
                        <textarea
                          value={formData.remarks}
                          onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                          placeholder="Additional notes..."
                          rows="3"
                          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <button
                      type="submit"
                      disabled={isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber}
                      style={{ 
                        padding: '16px 50px',
                        backgroundColor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? '#ccc' : '#1565c0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '17px',
                        cursor: isLoading || shiftStatus === 'OFF DUTY' || !formData.plantNumber ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        margin: '0 auto'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span>⏳</span>
                          Recording...
                        </>
                      ) : (
                        <>
                          <span>🔧</span>
                          Record Service
                        </>
                      )}
                    </button>
                    {shiftStatus === 'OFF DUTY' && (
                      <p style={{ color: '#d32f2f', marginTop: '15px', fontSize: '15px' }}>
                        ⚠️ Please start your service shift before recording
                      </p>
                    )}
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
    </div>
  );
};

export default ServiceTruckDriverDashboard;