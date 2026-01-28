// import React, { useState, useEffect, useRef } from 'react';

// // ==================== LOCAL MOCK PHOTO UTILS ====================
// const savePhotoToDatabase = async (photoData) => {
//   console.log('Saving photo to database (mock):', photoData);
//   return {
//     ...photoData,
//     photoId: photoData.photoId || Date.now() + Math.random(),
//     timestamp: photoData.timestamp || new Date().toISOString(),
//     saved: true
//   };
// };

// const getAllPhotosFromDatabase = async () => {
//   console.log('Getting all photos (mock)');
//   return [];
// };

// // ==================== INDEXEDDB LOG BOOK SETUP ====================
// const initLogBookDatabase = async () => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('MachineLogBookDatabase', 3);
    
//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       const oldVersion = event.oldVersion;
      
//       // Create log entries store
//       if (!db.objectStoreNames.contains('log_entries')) {
//         const store = db.createObjectStore('log_entries', { keyPath: 'logId', autoIncrement: true });
//         store.createIndex('machineNumber', 'machineNumber', { unique: false });
//         store.createIndex('logType', 'logType', { unique: false });
//         store.createIndex('timestamp', 'timestamp', { unique: false });
//         store.createIndex('status', 'status', { unique: false });
//         store.createIndex('userId', 'userId', { unique: false });
//         store.createIndex('date', 'date', { unique: false });
//       }
      
//       // Create maintenance schedule store
//       if (!db.objectStoreNames.contains('maintenance_schedule')) {
//         const maintStore = db.createObjectStore('maintenance_schedule', { keyPath: 'scheduleId', autoIncrement: true });
//         maintStore.createIndex('machineNumber', 'machineNumber', { unique: false });
//         maintStore.createIndex('maintenanceType', 'maintenanceType', { unique: false });
//         maintStore.createIndex('dueDate', 'dueDate', { unique: false });
//         maintStore.createIndex('status', 'status', { unique: false });
//       }
      
//       // Create issues store
//       if (oldVersion < 3) {
//         if (!db.objectStoreNames.contains('issues')) {
//           const issuesStore = db.createObjectStore('issues', { keyPath: 'issueId', autoIncrement: true });
//           issuesStore.createIndex('machineNumber', 'machineNumber', { unique: false });
//           issuesStore.createIndex('severity', 'severity', { unique: false });
//           issuesStore.createIndex('status', 'status', { unique: false });
//           issuesStore.createIndex('reportedDate', 'reportedDate', { unique: false });
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

// // Save log entry to database
// const saveLogEntry = async (logData) => {
//   try {
//     const db = await initLogBookDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['log_entries'], 'readwrite');
//       const store = transaction.objectStore('log_entries');
      
//       const logEntry = {
//         ...logData,
//         timestamp: new Date().toISOString(),
//         date: new Date().toISOString().split('T')[0],
//         logId: Date.now() + Math.random()
//       };
      
//       const request = store.add(logEntry);
      
//       request.onsuccess = () => {
//         const savedLogId = request.result;
//         transaction.oncomplete = () => {
//           db.close();
//         };
//         resolve({ ...logEntry, logId: savedLogId });
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to save log entry'));
//       };
//     });
//   } catch (error) {
//     console.error('Database error:', error);
//     throw error;
//   }
// };

// // Get all log entries for a machine
// const getLogEntriesForMachine = async (machineNumber, userId = null) => {
//   try {
//     const db = await initLogBookDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['log_entries'], 'readonly');
//       const store = transaction.objectStore('log_entries');
//       const index = store.index('machineNumber');
//       const request = index.getAll(machineNumber);
      
//       request.onsuccess = () => {
//         let entries = request.result;
        
//         if (userId) {
//           entries = entries.filter(entry => entry.userId === userId);
//         }
        
//         // Sort by timestamp (newest first)
//         entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(entries);
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to load log entries'));
//       };
//     });
//   } catch (error) {
//     console.error('Error loading log entries:', error);
//     return [];
//   }
// };

// // Get all log entries for a user
// const getUserLogEntries = async (userId) => {
//   try {
//     const db = await initLogBookDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['log_entries'], 'readonly');
//       const store = transaction.objectStore('log_entries');
//       const index = store.index('userId');
//       const request = index.getAll(userId);
      
//       request.onsuccess = () => {
//         const entries = request.result;
        
//         // Sort by timestamp (newest first)
//         entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(entries);
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to load user log entries'));
//       };
//     });
//   } catch (error) {
//     console.error('Error loading user log entries:', error);
//     return [];
//   }
// };

// // Save maintenance schedule entry
// const saveMaintenanceSchedule = async (maintenanceData) => {
//   try {
//     const db = await initLogBookDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['maintenance_schedule'], 'readwrite');
//       const store = transaction.objectStore('maintenance_schedule');
      
//       const scheduleEntry = {
//         ...maintenanceData,
//         createdDate: new Date().toISOString(),
//         scheduleId: Date.now() + Math.random()
//       };
      
//       const request = store.add(scheduleEntry);
      
//       request.onsuccess = () => {
//         const savedId = request.result;
//         transaction.oncomplete = () => {
//           db.close();
//         };
//         resolve({ ...scheduleEntry, scheduleId: savedId });
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to save maintenance schedule'));
//       };
//     });
//   } catch (error) {
//     console.error('Database error:', error);
//     throw error;
//   }
// };

// // Get maintenance schedule for a machine
// const getMaintenanceSchedule = async (machineNumber) => {
//   try {
//     const db = await initLogBookDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['maintenance_schedule'], 'readonly');
//       const store = transaction.objectStore('maintenance_schedule');
//       const index = store.index('machineNumber');
//       const request = index.getAll(machineNumber);
      
//       request.onsuccess = () => {
//         const entries = request.result;
        
//         // Sort by due date
//         entries.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(entries);
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to load maintenance schedule'));
//       };
//     });
//   } catch (error) {
//     console.error('Error loading maintenance schedule:', error);
//     return [];
//   }
// };

// // Report an issue
// const reportIssue = async (issueData) => {
//   try {
//     const db = await initLogBookDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['issues'], 'readwrite');
//       const store = transaction.objectStore('issues');
      
//       const issueEntry = {
//         ...issueData,
//         reportedDate: new Date().toISOString(),
//         issueId: Date.now() + Math.random(),
//         status: 'OPEN'
//       };
      
//       const request = store.add(issueEntry);
      
//       request.onsuccess = () => {
//         const savedId = request.result;
//         transaction.oncomplete = () => {
//           db.close();
//         };
//         resolve({ ...issueEntry, issueId: savedId });
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to report issue'));
//       };
//     });
//   } catch (error) {
//     console.error('Database error:', error);
//     throw error;
//   }
// };

// // Get issues for a machine
// const getIssuesForMachine = async (machineNumber) => {
//   try {
//     const db = await initLogBookDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['issues'], 'readonly');
//       const store = transaction.objectStore('issues');
//       const index = store.index('machineNumber');
//       const request = index.getAll(machineNumber);
      
//       request.onsuccess = () => {
//         const issues = request.result;
        
//         // Sort by reported date (newest first)
//         issues.sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate));
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(issues);
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to load issues'));
//       };
//     });
//   } catch (error) {
//     console.error('Error loading issues:', error);
//     return [];
//   }
// };

// // ==================== LOG BOOK MODAL COMPONENTS ====================

// // Daily Checklist Modal
// const DailyChecklistModal = ({ machineNumber, machineName, userId, onSave, onClose }) => {
//   const [checklist, setChecklist] = useState({
//     fluidsChecked: false,
//     oilLevel: 'NORMAL',
//     coolantLevel: 'NORMAL',
//     tirePressure: 'NORMAL',
//     lightsWorking: true,
//     brakesChecked: false,
//     safetyEquipment: true,
//     unusualNoises: false,
//     leaksDetected: false,
//     remarks: ''
//   });
  
//   const [photos, setPhotos] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const handleChecklistChange = (field, value) => {
//     setChecklist(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handlePhotoUpload = async (files) => {
//     setUploading(true);
//     const uploadedPhotos = [];
    
//     for (const file of files) {
//       if (file && file.type.startsWith('image/')) {
//         const reader = new FileReader();
        
//         reader.onload = async (event) => {
//           const base64Image = event.target.result;
//           const now = new Date();
//           const folderPath = `checklists/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/`;
          
//           const photoData = {
//             photoId: Date.now() + Math.random(),
//             filename: `checklist_${machineNumber}_${now.getTime()}.jpg`,
//             originalName: file.name,
//             base64Data: base64Image,
//             timestamp: now.toISOString(),
//             machineNumber: machineNumber,
//             folderPath: folderPath,
//             fileSize: file.size,
//             type: 'checklist',
//             userId: userId,
//             metadata: {
//               checklistItem: 'daily_inspection',
//               machineName: machineName
//             }
//           };
          
//           try {
//             const savedPhoto = await savePhotoToDatabase(photoData);
//             uploadedPhotos.push(savedPhoto);
//             setPhotos(prev => [...prev, savedPhoto]);
//           } catch (error) {
//             console.error('Error saving photo:', error);
//           }
//         };
        
//         reader.readAsDataURL(file);
//       }
//     }
    
//     setUploading(false);
//   };

//   const handleSubmit = async () => {
//     setUploading(true);
    
//     const logEntry = {
//       machineNumber,
//       machineName,
//       logType: 'DAILY_CHECKLIST',
//       checklistData: checklist,
//       photos: photos,
//       status: 'COMPLETED',
//       userId,
//       operatorName: userId // You might want to pass actual user name
//     };
    
//     try {
//       const savedLog = await saveLogEntry(logEntry);
//       onSave(savedLog);
//       onClose();
//     } catch (error) {
//       alert(`Failed to save checklist: ${error.message}`);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.9)',
//       zIndex: 1000,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px',
//       overflowY: 'auto'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '30px',
//         borderRadius: '12px',
//         maxWidth: '800px',
//         width: '100%',
//         maxHeight: '90vh',
//         overflowY: 'auto'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//           <h3 style={{ margin: 0, color: '#1976d2' }}>
//             📋 Daily Checklist - {machineName} ({machineNumber})
//           </h3>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '28px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         <div style={{ 
//           display: 'grid', 
//           gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
//           gap: '20px',
//           marginBottom: '25px'
//         }}>
//           {[
//             { label: 'Fluids Checked', field: 'fluidsChecked', type: 'checkbox' },
//             { label: 'Oil Level', field: 'oilLevel', type: 'select', options: ['LOW', 'NORMAL', 'HIGH'] },
//             { label: 'Coolant Level', field: 'coolantLevel', type: 'select', options: ['LOW', 'NORMAL', 'HIGH'] },
//             { label: 'Tire Pressure', field: 'tirePressure', type: 'select', options: ['LOW', 'NORMAL', 'HIGH'] },
//             { label: 'Lights Working', field: 'lightsWorking', type: 'checkbox' },
//             { label: 'Brakes Checked', field: 'brakesChecked', type: 'checkbox' },
//             { label: 'Safety Equipment', field: 'safetyEquipment', type: 'checkbox' },
//             { label: 'Unusual Noises', field: 'unusualNoises', type: 'checkbox' },
//             { label: 'Leaks Detected', field: 'leaksDetected', type: 'checkbox' }
//           ].map((item) => (
//             <div key={item.field} style={{ 
//               backgroundColor: '#f8f9fa', 
//               padding: '15px', 
//               borderRadius: '8px',
//               border: '1px solid #ddd'
//             }}>
//               <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <span style={{ fontWeight: '600', color: '#333' }}>{item.label}:</span>
//                 {item.type === 'checkbox' ? (
//                   <input
//                     type="checkbox"
//                     checked={checklist[item.field]}
//                     onChange={(e) => handleChecklistChange(item.field, e.target.checked)}
//                     style={{ transform: 'scale(1.3)' }}
//                   />
//                 ) : (
//                   <select
//                     value={checklist[item.field]}
//                     onChange={(e) => handleChecklistChange(item.field, e.target.value)}
//                     style={{ 
//                       padding: '8px 12px', 
//                       borderRadius: '6px', 
//                       border: '1px solid #ccc',
//                       minWidth: '120px'
//                     }}
//                   >
//                     {item.options.map(option => (
//                       <option key={option} value={option}>{option}</option>
//                     ))}
//                   </select>
//                 )}
//               </label>
//             </div>
//           ))}
//         </div>

//         <div style={{ marginBottom: '20px' }}>
//           <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
//             Remarks:
//           </label>
//           <textarea
//             value={checklist.remarks}
//             onChange={(e) => handleChecklistChange('remarks', e.target.value)}
//             placeholder="Any additional notes or observations..."
//             rows="3"
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: '1px solid #ddd',
//               borderRadius: '8px',
//               fontSize: '14px',
//               resize: 'vertical'
//             }}
//           />
//         </div>

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
//             📷 Upload Photos:
//           </label>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={(e) => handlePhotoUpload(Array.from(e.target.files))}
//             style={{ display: 'none' }}
//           />
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             disabled={uploading}
//             style={{
//               width: '100%',
//               padding: '15px',
//               backgroundColor: '#1976d2',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               fontSize: '16px',
//               cursor: 'pointer',
//               marginBottom: '15px'
//             }}
//           >
//             📸 Upload Inspection Photos
//           </button>
          
//           {photos.length > 0 && (
//             <div style={{ 
//               backgroundColor: '#e8f5e9', 
//               padding: '15px', 
//               borderRadius: '8px',
//               border: '1px solid #4caf50'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//                 <strong style={{ color: '#1b5e20' }}>Uploaded Photos ({photos.length}):</strong>
//               </div>
//               <div style={{ 
//                 display: 'grid', 
//                 gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
//                 gap: '10px',
//                 maxHeight: '200px',
//                 overflowY: 'auto'
//               }}>
//                 {photos.map((photo, index) => (
//                   <div key={index} style={{ position: 'relative' }}>
//                     <img 
//                       src={photo.base64Data} 
//                       alt={`Checklist ${index + 1}`}
//                       style={{
//                         width: '100%',
//                         height: '100px',
//                         objectFit: 'cover',
//                         borderRadius: '6px',
//                         border: '1px solid #ddd'
//                       }}
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         <div style={{ 
//           display: 'flex', 
//           gap: '15px',
//           borderTop: '1px solid #eee',
//           paddingTop: '20px'
//         }}>
//           <button 
//             onClick={handleSubmit}
//             disabled={uploading}
//             style={{ 
//               flex: 1,
//               padding: '15px 20px', 
//               backgroundColor: uploading ? '#ccc' : '#4caf50', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '8px', 
//               cursor: uploading ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               fontWeight: '600'
//             }}
//           >
//             {uploading ? 'Saving...' : '✅ Complete Checklist'}
//           </button>
          
//           <button 
//             onClick={onClose}
//             disabled={uploading}
//             style={{ 
//               flex: 1,
//               padding: '15px 20px', 
//               backgroundColor: '#f5f5f5', 
//               color: '#333', 
//               border: '1px solid #ddd',
//               borderRadius: '8px', 
//               cursor: uploading ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               fontWeight: '600'
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Service/Maintenance Log Modal
// const ServiceLogModal = ({ machineNumber, machineName, userId, onSave, onClose }) => {
//   const [serviceData, setServiceData] = useState({
//     serviceType: 'ROUTINE',
//     description: '',
//     partsUsed: '',
//     hours: '',
//     cost: '',
//     serviceProvider: '',
//     nextServiceDue: '',
//     remarks: ''
//   });
  
//   const [photos, setPhotos] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const handleServiceChange = (field, value) => {
//     setServiceData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handlePhotoUpload = async (files) => {
//     setUploading(true);
//     const uploadedPhotos = [];
    
//     for (const file of files) {
//       if (file && file.type.startsWith('image/')) {
//         const reader = new FileReader();
        
//         reader.onload = async (event) => {
//           const base64Image = event.target.result;
//           const now = new Date();
//           const folderPath = `services/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/`;
          
//           const photoData = {
//             photoId: Date.now() + Math.random(),
//             filename: `service_${machineNumber}_${now.getTime()}.jpg`,
//             originalName: file.name,
//             base64Data: base64Image,
//             timestamp: now.toISOString(),
//             machineNumber: machineNumber,
//             folderPath: folderPath,
//             fileSize: file.size,
//             type: 'service',
//             userId: userId,
//             metadata: {
//               serviceType: serviceData.serviceType,
//               machineName: machineName
//             }
//           };
          
//           try {
//             const savedPhoto = await savePhotoToDatabase(photoData);
//             uploadedPhotos.push(savedPhoto);
//             setPhotos(prev => [...prev, savedPhoto]);
//           } catch (error) {
//             console.error('Error saving photo:', error);
//           }
//         };
        
//         reader.readAsDataURL(file);
//       }
//     }
    
//     setUploading(false);
//   };

//   const handleSubmit = async () => {
//     setUploading(true);
    
//     const logEntry = {
//       machineNumber,
//       machineName,
//       logType: 'SERVICE',
//       serviceData: serviceData,
//       photos: photos,
//       status: 'COMPLETED',
//       userId,
//       operatorName: userId
//     };
    
//     try {
//       const savedLog = await saveLogEntry(logEntry);
      
//       // If next service due is set, add to maintenance schedule
//       if (serviceData.nextServiceDue) {
//         const scheduleEntry = {
//           machineNumber,
//           machineName,
//           maintenanceType: serviceData.serviceType,
//           description: serviceData.description,
//           dueDate: serviceData.nextServiceDue,
//           status: 'PENDING',
//           createdBy: userId,
//           relatedLogId: savedLog.logId
//         };
        
//         await saveMaintenanceSchedule(scheduleEntry);
//       }
      
//       onSave(savedLog);
//       onClose();
//     } catch (error) {
//       alert(`Failed to save service log: ${error.message}`);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.9)',
//       zIndex: 1000,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px',
//       overflowY: 'auto'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '30px',
//         borderRadius: '12px',
//         maxWidth: '800px',
//         width: '100%',
//         maxHeight: '90vh',
//         overflowY: 'auto'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//           <h3 style={{ margin: 0, color: '#ff9800' }}>
//             🔧 Service/Maintenance Log - {machineName} ({machineNumber})
//           </h3>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '28px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         <div style={{ 
//           display: 'grid', 
//           gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
//           gap: '15px',
//           marginBottom: '20px'
//         }}>
//           {[
//             { label: 'Service Type', field: 'serviceType', type: 'select', options: ['ROUTINE', 'REPAIR', 'OVERHAUL', 'EMERGENCY'] },
//             { label: 'Service Provider', field: 'serviceProvider', type: 'text', placeholder: 'e.g., In-house, External vendor' },
//             { label: 'Hours Worked', field: 'hours', type: 'number', placeholder: 'Hours spent' },
//             { label: 'Cost (ZAR)', field: 'cost', type: 'number', placeholder: '0.00' },
//             { label: 'Next Service Due', field: 'nextServiceDue', type: 'date' }
//           ].map((item) => (
//             <div key={item.field}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                 {item.label}:
//               </label>
//               {item.type === 'select' ? (
//                 <select
//                   value={serviceData[item.field]}
//                   onChange={(e) => handleServiceChange(item.field, e.target.value)}
//                   style={{ 
//                     width: '100%', 
//                     padding: '10px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc' 
//                   }}
//                 >
//                   {item.options.map(option => (
//                     <option key={option} value={option}>{option}</option>
//                   ))}
//                 </select>
//               ) : (
//                 <input
//                   type={item.type}
//                   value={serviceData[item.field]}
//                   onChange={(e) => handleServiceChange(item.field, e.target.value)}
//                   placeholder={item.placeholder}
//                   style={{ 
//                     width: '100%', 
//                     padding: '10px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc' 
//                   }}
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         <div style={{ marginBottom: '15px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//             Description:
//           </label>
//           <textarea
//             value={serviceData.description}
//             onChange={(e) => handleServiceChange('description', e.target.value)}
//             placeholder="Describe the service performed..."
//             rows="2"
//             style={{
//               width: '100%',
//               padding: '10px',
//               border: '1px solid #ddd',
//               borderRadius: '6px',
//               fontSize: '14px'
//             }}
//           />
//         </div>

//         <div style={{ marginBottom: '15px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//             Parts Used:
//           </label>
//           <textarea
//             value={serviceData.partsUsed}
//             onChange={(e) => handleServiceChange('partsUsed', e.target.value)}
//             placeholder="List parts replaced or used..."
//             rows="2"
//             style={{
//               width: '100%',
//               padding: '10px',
//               border: '1px solid #ddd',
//               borderRadius: '6px',
//               fontSize: '14px'
//             }}
//           />
//         </div>

//         <div style={{ marginBottom: '20px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//             Remarks:
//           </label>
//           <textarea
//             value={serviceData.remarks}
//             onChange={(e) => handleServiceChange('remarks', e.target.value)}
//             placeholder="Additional notes or observations..."
//             rows="2"
//             style={{
//               width: '100%',
//               padding: '10px',
//               border: '1px solid #ddd',
//               borderRadius: '6px',
//               fontSize: '14px'
//             }}
//           />
//         </div>

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
//             📷 Service Photos:
//           </label>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={(e) => handlePhotoUpload(Array.from(e.target.files))}
//             style={{ display: 'none' }}
//           />
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             disabled={uploading}
//             style={{
//               width: '100%',
//               padding: '12px',
//               backgroundColor: '#ff9800',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               fontSize: '14px',
//               cursor: 'pointer',
//               marginBottom: '15px'
//             }}
//           >
//             📸 Upload Service Photos
//           </button>
          
//           {photos.length > 0 && (
//             <div style={{ 
//               backgroundColor: '#fff3e0', 
//               padding: '10px', 
//               borderRadius: '6px' 
//             }}>
//               <div style={{ fontSize: '14px', color: '#666' }}>
//                 {photos.length} photo(s) uploaded
//               </div>
//             </div>
//           )}
//         </div>

//         <div style={{ 
//           display: 'flex', 
//           gap: '15px',
//           borderTop: '1px solid #eee',
//           paddingTop: '20px'
//         }}>
//           <button 
//             onClick={handleSubmit}
//             disabled={uploading}
//             style={{ 
//               flex: 1,
//               padding: '15px 20px', 
//               backgroundColor: uploading ? '#ccc' : '#ff9800', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '8px', 
//               cursor: uploading ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               fontWeight: '600'
//             }}
//           >
//             {uploading ? 'Saving...' : '💾 Save Service Log'}
//           </button>
          
//           <button 
//             onClick={onClose}
//             disabled={uploading}
//             style={{ 
//               flex: 1,
//               padding: '15px 20px', 
//               backgroundColor: '#f5f5f5', 
//               color: '#333', 
//               border: '1px solid #ddd',
//               borderRadius: '8px', 
//               cursor: uploading ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               fontWeight: '600'
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Issue Reporting Modal
// const IssueReportModal = ({ machineNumber, machineName, userId, onSave, onClose }) => {
//   const [issueData, setIssueData] = useState({
//     title: '',
//     description: '',
//     severity: 'MEDIUM',
//     category: 'MECHANICAL',
//     location: '',
//     reportedBy: userId,
//     status: 'OPEN',
//     emergency: false
//   });
  
//   const [photos, setPhotos] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const handleIssueChange = (field, value) => {
//     setIssueData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handlePhotoUpload = async (files) => {
//     setUploading(true);
//     const uploadedPhotos = [];
    
//     for (const file of files) {
//       if (file && file.type.startsWith('image/')) {
//         const reader = new FileReader();
        
//         reader.onload = async (event) => {
//           const base64Image = event.target.result;
//           const now = new Date();
//           const folderPath = `issues/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/`;
          
//           const photoData = {
//             photoId: Date.now() + Math.random(),
//             filename: `issue_${machineNumber}_${now.getTime()}.jpg`,
//             originalName: file.name,
//             base64Data: base64Image,
//             timestamp: now.toISOString(),
//             machineNumber: machineNumber,
//             folderPath: folderPath,
//             fileSize: file.size,
//             type: 'issue',
//             userId: userId,
//             metadata: {
//               issueTitle: issueData.title,
//               machineName: machineName,
//               severity: issueData.severity
//             }
//           };
          
//           try {
//             const savedPhoto = await savePhotoToDatabase(photoData);
//             uploadedPhotos.push(savedPhoto);
//             setPhotos(prev => [...prev, savedPhoto]);
//           } catch (error) {
//             console.error('Error saving photo:', error);
//           }
//         };
        
//         reader.readAsDataURL(file);
//       }
//     }
    
//     setUploading(false);
//   };

//   const handleSubmit = async () => {
//     if (!issueData.title.trim() || !issueData.description.trim()) {
//       alert('Please provide a title and description for the issue');
//       return;
//     }
    
//     setUploading(true);
    
//     try {
//       // Save as issue
//       const issueEntry = {
//         ...issueData,
//         machineNumber,
//         machineName,
//         photos: photos,
//         reportedDate: new Date().toISOString()
//       };
      
//       const savedIssue = await reportIssue(issueEntry);
      
//       // Also save as log entry
//       const logEntry = {
//         machineNumber,
//         machineName,
//         logType: 'ISSUE_REPORT',
//         issueData: issueData,
//         photos: photos,
//         status: 'REPORTED',
//         userId,
//         operatorName: userId,
//         relatedIssueId: savedIssue.issueId
//       };
      
//       const savedLog = await saveLogEntry(logEntry);
      
//       onSave({ issue: savedIssue, log: savedLog });
//       onClose();
//     } catch (error) {
//       alert(`Failed to report issue: ${error.message}`);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.9)',
//       zIndex: 1000,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px',
//       overflowY: 'auto'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '30px',
//         borderRadius: '12px',
//         maxWidth: '700px',
//         width: '100%',
//         maxHeight: '90vh',
//         overflowY: 'auto'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//           <h3 style={{ margin: 0, color: '#d32f2f' }}>
//             ⚠️ Report Issue - {machineName} ({machineNumber})
//           </h3>
//           <button 
//             onClick={onClose} 
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               fontSize: '28px', 
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         <div style={{ marginBottom: '20px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
//             <input
//               type="checkbox"
//               id="emergency"
//               checked={issueData.emergency}
//               onChange={(e) => handleIssueChange('emergency', e.target.checked)}
//               style={{ transform: 'scale(1.3)' }}
//             />
//             <label htmlFor="emergency" style={{ color: '#d32f2f', fontWeight: '600', fontSize: '16px' }}>
//               🚨 EMERGENCY - Requires Immediate Attention
//             </label>
//           </div>
//         </div>

//         <div style={{ 
//           display: 'grid', 
//           gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
//           gap: '15px',
//           marginBottom: '20px'
//         }}>
//           {[
//             { label: 'Issue Title *', field: 'title', type: 'text', placeholder: 'Brief description of the issue' },
//             { label: 'Severity', field: 'severity', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
//             { label: 'Category', field: 'category', type: 'select', options: ['MECHANICAL', 'ELECTRICAL', 'HYDRAULIC', 'SAFETY', 'OTHER'] },
//             { label: 'Location', field: 'location', type: 'text', placeholder: 'Where did the issue occur?' }
//           ].map((item) => (
//             <div key={item.field}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                 {item.label}:
//               </label>
//               {item.type === 'select' ? (
//                 <select
//                   value={issueData[item.field]}
//                   onChange={(e) => handleIssueChange(item.field, e.target.value)}
//                   style={{ 
//                     width: '100%', 
//                     padding: '10px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc' 
//                   }}
//                 >
//                   {item.options.map(option => (
//                     <option key={option} value={option}>{option}</option>
//                   ))}
//                 </select>
//               ) : (
//                 <input
//                   type={item.type}
//                   value={issueData[item.field]}
//                   onChange={(e) => handleIssueChange(item.field, e.target.value)}
//                   placeholder={item.placeholder}
//                   style={{ 
//                     width: '100%', 
//                     padding: '10px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc' 
//                   }}
//                   required={item.label.includes('*')}
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         <div style={{ marginBottom: '20px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//             Description *:
//           </label>
//           <textarea
//             value={issueData.description}
//             onChange={(e) => handleIssueChange('description', e.target.value)}
//             placeholder="Describe the issue in detail..."
//             rows="4"
//             style={{
//               width: '100%',
//               padding: '12px',
//               border: '1px solid #ddd',
//               borderRadius: '8px',
//               fontSize: '14px',
//               resize: 'vertical'
//             }}
//             required
//           />
//         </div>

//         <div style={{ marginBottom: '25px' }}>
//           <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
//             📷 Upload Photos/Evidence:
//           </label>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={(e) => handlePhotoUpload(Array.from(e.target.files))}
//             style={{ display: 'none' }}
//           />
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             disabled={uploading}
//             style={{
//               width: '100%',
//               padding: '12px',
//               backgroundColor: '#d32f2f',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               fontSize: '14px',
//               cursor: 'pointer',
//               marginBottom: '15px'
//             }}
//           >
//             📸 Upload Evidence Photos
//           </button>
          
//           {photos.length > 0 && (
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
//               gap: '10px',
//               maxHeight: '200px',
//               overflowY: 'auto'
//             }}>
//               {photos.map((photo, index) => (
//                 <div key={index} style={{ position: 'relative' }}>
//                   <img 
//                     src={photo.base64Data} 
//                     alt={`Issue evidence ${index + 1}`}
//                     style={{
//                       width: '100%',
//                       height: '100px',
//                       objectFit: 'cover',
//                       borderRadius: '6px',
//                       border: '2px solid #d32f2f'
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div style={{ 
//           display: 'flex', 
//           gap: '15px',
//           borderTop: '1px solid #eee',
//           paddingTop: '20px'
//         }}>
//           <button 
//             onClick={handleSubmit}
//             disabled={uploading || !issueData.title.trim() || !issueData.description.trim()}
//             style={{ 
//               flex: 1,
//               padding: '15px 20px', 
//               backgroundColor: uploading || !issueData.title.trim() || !issueData.description.trim() ? '#ccc' : '#d32f2f', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '8px', 
//               cursor: uploading || !issueData.title.trim() || !issueData.description.trim() ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               fontWeight: '600'
//             }}
//           >
//             {uploading ? 'Reporting...' : '🚨 Report Issue'}
//           </button>
          
//           <button 
//             onClick={onClose}
//             disabled={uploading}
//             style={{ 
//               flex: 1,
//               padding: '15px 20px', 
//               backgroundColor: '#f5f5f5', 
//               color: '#333', 
//               border: '1px solid #ddd',
//               borderRadius: '8px', 
//               cursor: uploading ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               fontWeight: '600'
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ==================== MAIN LOG BOOK DASHBOARD COMPONENT ====================
// const MachineLogBookDashboard = ({ user, onBack, selectedMachine }) => {
//   const [activeView, setActiveView] = useState('overview');
//   const [logEntries, setLogEntries] = useState([]);
//   const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
//   const [issues, setIssues] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalLogs: 0,
//     thisWeek: 0,
//     openIssues: 0,
//     pendingMaintenance: 0
//   });
  
//   const [showDailyChecklist, setShowDailyChecklist] = useState(false);
//   const [showServiceLog, setShowServiceLog] = useState(false);
//   const [showIssueReport, setShowIssueReport] = useState(false);
  
//   const [selectedLog, setSelectedLog] = useState(null);
  
//   // Machine data - you can pass this as prop or fetch it
//   const machine = selectedMachine || {
//     number: 'A-EXK38',
//     name: 'EXCAVATOR PC500 50t TRACKED',
//     type: 'Excavator',
//     model: 'KOMATSU PC500',
//     year: '2020',
//     lastService: '2025-01-15',
//     nextService: '2025-02-15',
//     totalHours: 2450,
//     status: 'OPERATIONAL'
//   };

//   useEffect(() => {
//     loadLogBookData();
//   }, [machine.number, user.id]);

//   const loadLogBookData = async () => {
//     setIsLoading(true);
//     try {
//       const [logs, maintenance, machineIssues] = await Promise.all([
//         getLogEntriesForMachine(machine.number, user.id),
//         getMaintenanceSchedule(machine.number),
//         getIssuesForMachine(machine.number)
//       ]);
      
//       setLogEntries(logs);
//       setMaintenanceSchedule(maintenance);
//       setIssues(machineIssues);
      
//       // Calculate statistics
//       const today = new Date();
//       const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
//       setStats({
//         totalLogs: logs.length,
//         thisWeek: logs.filter(log => new Date(log.timestamp) >= oneWeekAgo).length,
//         openIssues: machineIssues.filter(issue => issue.status === 'OPEN').length,
//         pendingMaintenance: maintenance.filter(m => m.status === 'PENDING').length
//       });
//     } catch (error) {
//       console.error('Error loading log book data:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSaveLogEntry = (savedLog) => {
//     setLogEntries(prev => [savedLog, ...prev]);
//     loadLogBookData(); // Refresh all data
//   };

//   const handleSaveIssue = (savedData) => {
//     if (savedData.issue) {
//       setIssues(prev => [savedData.issue, ...prev]);
//     }
//     if (savedData.log) {
//       setLogEntries(prev => [savedData.log, ...prev]);
//     }
//     loadLogBookData(); // Refresh all data
//   };

//   const getLogTypeIcon = (logType) => {
//     switch(logType) {
//       case 'DAILY_CHECKLIST': return '📋';
//       case 'SERVICE': return '🔧';
//       case 'ISSUE_REPORT': return '⚠️';
//       case 'FUEL': return '⛽';
//       case 'ODOMETER': return '📊';
//       default: return '📝';
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'COMPLETED': return '#4caf50';
//       case 'PENDING': return '#ff9800';
//       case 'OVERDUE': return '#d32f2f';
//       case 'OPEN': return '#d32f2f';
//       case 'CLOSED': return '#757575';
//       case 'IN_PROGRESS': return '#2196f3';
//       default: return '#666';
//     }
//   };

//   const getSeverityColor = (severity) => {
//     switch(severity) {
//       case 'CRITICAL': return '#d32f2f';
//       case 'HIGH': return '#f57c00';
//       case 'MEDIUM': return '#ffb300';
//       case 'LOW': return '#4caf50';
//       default: return '#666';
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatDateTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div style={{ 
//       padding: '20px', 
//       maxWidth: '1400px', 
//       margin: '0 auto', 
//       backgroundColor: '#f5f5f5', 
//       minHeight: '100vh' 
//     }}>
      
//       {/* Header */}
//       <div style={{ 
//         backgroundColor: 'white',
//         borderRadius: '12px',
//         boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//         marginBottom: '25px',
//         overflow: 'hidden'
//       }}>
//         <div style={{ 
//           padding: '25px 30px',
//           backgroundColor: '#1b5e20',
//           color: 'white',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//             <div style={{ 
//               width: '60px', 
//               height: '60px', 
//               backgroundColor: 'white', 
//               borderRadius: '10px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: '#1b5e20',
//               fontSize: '28px',
//               fontWeight: 'bold'
//             }}>
//               🚜
//             </div>
//             <div>
//               <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Machine Log Book</h1>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
//                 <span style={{ fontSize: '16px', fontWeight: '500' }}>{machine.name}</span>
//                 <span style={{ 
//                   padding: '4px 12px', 
//                   backgroundColor: machine.status === 'OPERATIONAL' ? '#4caf50' : '#d32f2f',
//                   borderRadius: '20px',
//                   fontSize: '12px',
//                   fontWeight: '600'
//                 }}>
//                   {machine.status}
//                 </span>
//                 <span style={{ fontSize: '14px', opacity: 0.9 }}>Fleet: {machine.number}</span>
//               </div>
//             </div>
//           </div>
          
//           <div style={{ display: 'flex', gap: '15px' }}>
//             <button 
//               onClick={onBack}
//               style={{ 
//                 padding: '10px 20px',
//                 backgroundColor: '#f5f5f5',
//                 color: '#333',
//                 border: '1px solid #ddd',
//                 borderRadius: '8px',
//                 cursor: 'pointer',
//                 fontWeight: '600',
//                 fontSize: '14px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}
//             >
//               ← Back
//             </button>
            
//             <div style={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               gap: '10px',
//               padding: '10px 20px',
//               backgroundColor: 'rgba(255,255,255,0.1)',
//               borderRadius: '8px'
//             }}>
//               <span>👤</span>
//               <span style={{ fontSize: '14px' }}>{user.fullName}</span>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '0 30px',
//           borderBottom: '1px solid #e0e0e0',
//           display: 'flex',
//           gap: '0'
//         }}>
//           {['overview', 'logs', 'maintenance', 'issues', 'reports'].map((view) => (
//             <button
//               key={view}
//               onClick={() => setActiveView(view)}
//               style={{ 
//                 padding: '18px 25px',
//                 backgroundColor: activeView === view ? '#f0f7ff' : 'transparent',
//                 color: activeView === view ? '#1976d2' : '#666',
//                 border: 'none',
//                 borderBottom: activeView === view ? '3px solid #1976d2' : 'none',
//                 cursor: 'pointer',
//                 fontWeight: activeView === view ? '600' : '500',
//                 fontSize: '15px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px',
//                 textTransform: 'capitalize'
//               }}
//             >
//               {view === 'overview' && '📊'}
//               {view === 'logs' && '📝'}
//               {view === 'maintenance' && '🔧'}
//               {view === 'issues' && '⚠️'}
//               {view === 'reports' && '📈'}
//               {view.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div style={{ 
//         display: 'grid', 
//         gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
//         gap: '20px', 
//         marginBottom: '30px' 
//       }}>
//         <button 
//           onClick={() => setShowDailyChecklist(true)}
//           style={{ 
//             backgroundColor: 'white',
//             border: 'none',
//             borderRadius: '12px',
//             padding: '25px 20px',
//             cursor: 'pointer',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//             transition: 'all 0.3s ease',
//             textAlign: 'left'
//           }}
//           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
//           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//         >
//           <div style={{ fontSize: '36px', marginBottom: '15px', color: '#1976d2' }}>📋</div>
//           <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Daily Checklist</h3>
//           <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
//             Complete daily inspection and maintenance checklist
//           </p>
//         </button>

//         <button 
//           onClick={() => setShowServiceLog(true)}
//           style={{ 
//             backgroundColor: 'white',
//             border: 'none',
//             borderRadius: '12px',
//             padding: '25px 20px',
//             cursor: 'pointer',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//             transition: 'all 0.3s ease',
//             textAlign: 'left'
//           }}
//           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
//           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//         >
//           <div style={{ fontSize: '36px', marginBottom: '15px', color: '#ff9800' }}>🔧</div>
//           <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Service Log</h3>
//           <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
//             Record maintenance, repairs, or service work
//           </p>
//         </button>

//         <button 
//           onClick={() => setShowIssueReport(true)}
//           style={{ 
//             backgroundColor: 'white',
//             border: 'none',
//             borderRadius: '12px',
//             padding: '25px 20px',
//             cursor: 'pointer',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//             transition: 'all 0.3s ease',
//             textAlign: 'left'
//           }}
//           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
//           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//         >
//           <div style={{ fontSize: '36px', marginBottom: '15px', color: '#d32f2f' }}>⚠️</div>
//           <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Report Issue</h3>
//           <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
//             Report mechanical, safety, or operational issues
//           </p>
//         </button>

//         <button 
//           onClick={() => setActiveView('reports')}
//           style={{ 
//             backgroundColor: 'white',
//             border: 'none',
//             borderRadius: '12px',
//             padding: '25px 20px',
//             cursor: 'pointer',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//             transition: 'all 0.3s ease',
//             textAlign: 'left'
//           }}
//           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
//           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//         >
//           <div style={{ fontSize: '36px', marginBottom: '15px', color: '#7b1fa2' }}>📈</div>
//           <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Reports & Analytics</h3>
//           <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
//             View usage statistics and generate reports
//           </p>
//         </button>
//       </div>

//       {/* Statistics Cards */}
//       <div style={{ 
//         display: 'grid', 
//         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//         gap: '20px', 
//         marginBottom: '30px' 
//       }}>
//         {[
//           { label: 'Total Log Entries', value: stats.totalLogs, icon: '📝', color: '#1976d2' },
//           { label: 'This Week', value: stats.thisWeek, icon: '📅', color: '#4caf50' },
//           { label: 'Open Issues', value: stats.openIssues, icon: '⚠️', color: '#d32f2f' },
//           { label: 'Pending Maintenance', value: stats.pendingMaintenance, icon: '🔧', color: '#ff9800' },
//           { label: 'Machine Hours', value: machine.totalHours, icon: '⏱️', color: '#7b1fa2' }
//         ].map((stat, index) => (
//           <div key={index} style={{ 
//             backgroundColor: 'white',
//             padding: '25px',
//             borderRadius: '12px',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '20px'
//           }}>
//             <div style={{ 
//               width: '60px', 
//               height: '60px', 
//               backgroundColor: `${stat.color}15`,
//               borderRadius: '12px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '28px',
//               color: stat.color
//             }}>
//               {stat.icon}
//             </div>
//             <div>
//               <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
//                 {stat.value}
//               </div>
//               <div style={{ fontSize: '14px', color: '#666' }}>
//                 {stat.label}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Main Content */}
//       {isLoading ? (
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '60px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           textAlign: 'center'
//         }}>
//           <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
//           <h3 style={{ color: '#666' }}>Loading Log Book Data...</h3>
//         </div>
//       ) : activeView === 'overview' ? (
//         <div style={{ 
//           display: 'grid', 
//           gridTemplateColumns: '1fr 1fr', 
//           gap: '30px',
//           marginBottom: '30px'
//         }}>
//           {/* Recent Logs */}
//           <div style={{ 
//             backgroundColor: 'white',
//             padding: '30px',
//             borderRadius: '12px',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//           }}>
//             <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📝 Recent Log Entries</h3>
//             <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//               {logEntries.slice(0, 10).map((log, index) => (
//                 <div 
//                   key={log.logId}
//                   onClick={() => setSelectedLog(log)}
//                   style={{ 
//                     padding: '15px',
//                     borderBottom: '1px solid #eee',
//                     cursor: 'pointer',
//                     transition: 'background-color 0.2s',
//                     backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
//                   }}
//                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
//                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : 'white'}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                       <span style={{ fontSize: '20px' }}>{getLogTypeIcon(log.logType)}</span>
//                       <div>
//                         <div style={{ fontWeight: '600', color: '#333' }}>
//                           {log.logType.replace('_', ' ')}
//                         </div>
//                         <div style={{ fontSize: '12px', color: '#666' }}>
//                           {formatDateTime(log.timestamp)}
//                         </div>
//                       </div>
//                     </div>
//                     <div style={{ 
//                       padding: '4px 10px',
//                       backgroundColor: getStatusColor(log.status) + '15',
//                       color: getStatusColor(log.status),
//                       borderRadius: '20px',
//                       fontSize: '12px',
//                       fontWeight: '600'
//                     }}>
//                       {log.status}
//                     </div>
//                   </div>
//                   {log.logType === 'ISSUE_REPORT' && log.issueData && (
//                     <div style={{ marginTop: '8px', fontSize: '14px', color: '#d32f2f' }}>
//                       {log.issueData.title}
//                     </div>
//                   )}
//                   {log.logType === 'DAILY_CHECKLIST' && log.checklistData && (
//                     <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
//                       Daily inspection completed
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//             <button 
//               onClick={() => setActiveView('logs')}
//               style={{ 
//                 marginTop: '20px',
//                 padding: '10px 20px',
//                 backgroundColor: '#f5f5f5',
//                 color: '#333',
//                 border: '1px solid #ddd',
//                 borderRadius: '6px',
//                 cursor: 'pointer',
//                 width: '100%'
//               }}
//             >
//               View All Logs →
//             </button>
//           </div>

//           {/* Maintenance & Issues */}
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateRows: '1fr 1fr', 
//             gap: '30px'
//           }}>
//             {/* Upcoming Maintenance */}
//             <div style={{ 
//               backgroundColor: 'white',
//               padding: '30px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//             }}>
//               <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔧 Upcoming Maintenance</h3>
//               <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                 {maintenanceSchedule
//                   .filter(m => m.status === 'PENDING')
//                   .slice(0, 5)
//                   .map((maintenance, index) => (
//                     <div key={maintenance.scheduleId} style={{ 
//                       padding: '12px',
//                       borderBottom: '1px solid #eee',
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'center'
//                     }}>
//                       <div>
//                         <div style={{ fontWeight: '600', color: '#333' }}>
//                           {maintenance.maintenanceType}
//                         </div>
//                         <div style={{ fontSize: '12px', color: '#666' }}>
//                           Due: {formatDate(maintenance.dueDate)}
//                         </div>
//                       </div>
//                       <div style={{ 
//                         padding: '4px 10px',
//                         backgroundColor: new Date(maintenance.dueDate) < new Date() ? '#d32f2f15' : '#ff980015',
//                         color: new Date(maintenance.dueDate) < new Date() ? '#d32f2f' : '#ff9800',
//                         borderRadius: '20px',
//                         fontSize: '12px',
//                         fontWeight: '600'
//                       }}>
//                         {new Date(maintenance.dueDate) < new Date() ? 'OVERDUE' : 'PENDING'}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//               <button 
//                 onClick={() => setActiveView('maintenance')}
//                 style={{ 
//                   marginTop: '20px',
//                   padding: '10px 20px',
//                   backgroundColor: '#f5f5f5',
//                   color: '#333',
//                   border: '1px solid #ddd',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   width: '100%'
//                 }}
//               >
//                 View Maintenance Schedule →
//               </button>
//             </div>

//             {/* Open Issues */}
//             <div style={{ 
//               backgroundColor: 'white',
//               padding: '30px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//             }}>
//               <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>⚠️ Open Issues</h3>
//               <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                 {issues
//                   .filter(issue => issue.status === 'OPEN')
//                   .slice(0, 5)
//                   .map((issue, index) => (
//                     <div key={issue.issueId} style={{ 
//                       padding: '12px',
//                       borderBottom: '1px solid #eee',
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'center'
//                     }}>
//                       <div style={{ flex: 1 }}>
//                         <div style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
//                           {issue.title}
//                         </div>
//                         <div style={{ fontSize: '12px', color: '#666' }}>
//                           Reported: {formatDate(issue.reportedDate)}
//                         </div>
//                       </div>
//                       <div style={{ 
//                         padding: '4px 10px',
//                         backgroundColor: getSeverityColor(issue.severity) + '15',
//                         color: getSeverityColor(issue.severity),
//                         borderRadius: '20px',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         minWidth: '80px',
//                         textAlign: 'center'
//                       }}>
//                         {issue.severity}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//               <button 
//                 onClick={() => setActiveView('issues')}
//                 style={{ 
//                   marginTop: '20px',
//                   padding: '10px 20px',
//                   backgroundColor: '#f5f5f5',
//                   color: '#333',
//                   border: '1px solid #ddd',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   width: '100%'
//                 }}
//               >
//                 View All Issues →
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : activeView === 'logs' ? (
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '30px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           marginBottom: '30px'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//             <h3 style={{ margin: 0, color: '#333' }}>📝 All Log Entries</h3>
//             <div style={{ display: 'flex', gap: '10px' }}>
//               <select style={{ 
//                 padding: '10px 15px',
//                 border: '1px solid #ddd',
//                 borderRadius: '6px',
//                 backgroundColor: 'white'
//               }}>
//                 <option>All Types</option>
//                 <option>Daily Checklist</option>
//                 <option>Service</option>
//                 <option>Issue Report</option>
//               </select>
//               <input
//                 type="date"
//                 style={{ 
//                   padding: '10px 15px',
//                   border: '1px solid #ddd',
//                   borderRadius: '6px'
//                 }}
//               />
//             </div>
//           </div>
          
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Date & Time</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Type</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Details</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Operator</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Photos</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {logEntries.map((log) => (
//                   <tr 
//                     key={log.logId} 
//                     onClick={() => setSelectedLog(log)}
//                     style={{ 
//                       borderBottom: '1px solid #eee',
//                       cursor: 'pointer',
//                       transition: 'background-color 0.2s'
//                     }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
//                   >
//                     <td style={{ padding: '15px', color: '#666' }}>
//                       {formatDateTime(log.timestamp)}
//                     </td>
//                     <td style={{ padding: '15px' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                         <span style={{ fontSize: '18px' }}>{getLogTypeIcon(log.logType)}</span>
//                         <span>{log.logType.replace('_', ' ')}</span>
//                       </div>
//                     </td>
//                     <td style={{ padding: '15px', maxWidth: '300px' }}>
//                       {log.logType === 'ISSUE_REPORT' && log.issueData && (
//                         <div style={{ fontWeight: '600', color: '#d32f2f' }}>
//                           {log.issueData.title}
//                         </div>
//                       )}
//                       {log.logType === 'DAILY_CHECKLIST' && log.checklistData && (
//                         <div>Daily inspection completed</div>
//                       )}
//                       {log.logType === 'SERVICE' && log.serviceData && (
//                         <div>{log.serviceData.description || 'Service performed'}</div>
//                       )}
//                     </td>
//                     <td style={{ padding: '15px' }}>
//                       <span style={{ 
//                         padding: '4px 10px',
//                         backgroundColor: getStatusColor(log.status) + '15',
//                         color: getStatusColor(log.status),
//                         borderRadius: '20px',
//                         fontSize: '12px',
//                         fontWeight: '600'
//                       }}>
//                         {log.status}
//                       </span>
//                     </td>
//                     <td style={{ padding: '15px', color: '#666' }}>
//                       {log.operatorName || 'N/A'}
//                     </td>
//                     <td style={{ padding: '15px' }}>
//                       {log.photos && log.photos.length > 0 ? (
//                         <span style={{ color: '#4caf50' }}>📷 {log.photos.length}</span>
//                       ) : (
//                         <span style={{ color: '#999' }}>-</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
          
//           {logEntries.length === 0 && (
//             <div style={{ 
//               textAlign: 'center', 
//               padding: '40px', 
//               color: '#666'
//             }}>
//               <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
//               <h4>No log entries found</h4>
//               <p>Start by completing a daily checklist or reporting a service</p>
//             </div>
//           )}
//         </div>
//       ) : activeView === 'maintenance' ? (
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '30px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           marginBottom: '30px'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//             <h3 style={{ margin: 0, color: '#333' }}>🔧 Maintenance Schedule</h3>
//             <button 
//               onClick={() => setShowServiceLog(true)}
//               style={{ 
//                 padding: '12px 24px',
//                 backgroundColor: '#ff9800',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: 'pointer',
//                 fontWeight: '600',
//                 fontSize: '14px'
//               }}
//             >
//               + Add Service Entry
//             </button>
//           </div>
          
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Maintenance Type</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Description</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Due Date</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Created By</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {maintenanceSchedule.map((item) => (
//                   <tr key={item.scheduleId} style={{ borderBottom: '1px solid #eee' }}>
//                     <td style={{ padding: '15px', fontWeight: '600', color: '#333' }}>
//                       {item.maintenanceType}
//                     </td>
//                     <td style={{ padding: '15px', maxWidth: '300px', color: '#666' }}>
//                       {item.description || 'No description provided'}
//                     </td>
//                     <td style={{ padding: '15px', color: '#666' }}>
//                       {formatDate(item.dueDate)}
//                       {new Date(item.dueDate) < new Date() && (
//                         <div style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px' }}>
//                           ⚠️ Overdue by {Math.floor((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24))} days
//                         </div>
//                       )}
//                     </td>
//                     <td style={{ padding: '15px' }}>
//                       <span style={{ 
//                         padding: '4px 10px',
//                         backgroundColor: getStatusColor(item.status) + '15',
//                         color: getStatusColor(item.status),
//                         borderRadius: '20px',
//                         fontSize: '12px',
//                         fontWeight: '600'
//                       }}>
//                         {item.status}
//                       </span>
//                     </td>
//                     <td style={{ padding: '15px', color: '#666' }}>
//                       {item.createdBy || 'N/A'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : activeView === 'issues' ? (
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '30px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           marginBottom: '30px'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//             <h3 style={{ margin: 0, color: '#333' }}>⚠️ Issues & Incidents</h3>
//             <button 
//               onClick={() => setShowIssueReport(true)}
//               style={{ 
//                 padding: '12px 24px',
//                 backgroundColor: '#d32f2f',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: 'pointer',
//                 fontWeight: '600',
//                 fontSize: '14px'
//               }}
//             >
//               🚨 Report New Issue
//             </button>
//           </div>
          
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Issue</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Severity</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Category</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Reported Date</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
//                   <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Reported By</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {issues.map((issue) => (
//                   <tr key={issue.issueId} style={{ borderBottom: '1px solid #eee' }}>
//                     <td style={{ padding: '15px' }}>
//                       <div style={{ fontWeight: '600', color: '#333' }}>{issue.title}</div>
//                       <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
//                         {issue.description.substring(0, 100)}...
//                       </div>
//                     </td>
//                     <td style={{ padding: '15px' }}>
//                       <span style={{ 
//                         padding: '4px 10px',
//                         backgroundColor: getSeverityColor(issue.severity) + '15',
//                         color: getSeverityColor(issue.severity),
//                         borderRadius: '20px',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         display: 'inline-block',
//                         minWidth: '80px',
//                         textAlign: 'center'
//                       }}>
//                         {issue.severity}
//                       </span>
//                     </td>
//                     <td style={{ padding: '15px', color: '#666' }}>
//                       {issue.category}
//                     </td>
//                     <td style={{ padding: '15px', color: '#666' }}>
//                       {formatDate(issue.reportedDate)}
//                     </td>
//                     <td style={{ padding: '15px' }}>
//                       <span style={{ 
//                         padding: '4px 10px',
//                         backgroundColor: getStatusColor(issue.status) + '15',
//                         color: getStatusColor(issue.status),
//                         borderRadius: '20px',
//                         fontSize: '12px',
//                         fontWeight: '600'
//                       }}>
//                         {issue.status}
//                       </span>
//                     </td>
//                     <td style={{ padding: '15px', color: '#666' }}>
//                       {issue.reportedBy || 'N/A'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         // Reports View
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '30px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           marginBottom: '30px'
//         }}>
//           <h3 style={{ margin: '0 0 25px 0', color: '#333' }}>📈 Reports & Analytics</h3>
          
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
//             gap: '25px',
//             marginBottom: '30px'
//           }}>
//             {/* Activity Chart */}
//             <div style={{ 
//               backgroundColor: '#f8f9fa',
//               padding: '20px',
//               borderRadius: '8px'
//             }}>
//               <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📅 Activity This Month</h4>
//               <div style={{ 
//                 display: 'flex', 
//                 alignItems: 'flex-end', 
//                 gap: '8px', 
//                 height: '150px',
//                 padding: '10px 0'
//               }}>
//                 {[5, 8, 12, 7, 15, 10, 8, 12, 9, 11, 14, 10, 7, 9, 6, 8, 12, 15, 11, 9, 7, 10, 13, 9, 8, 11, 14, 10, 6, 8].map((height, index) => (
//                   <div key={index} style={{ 
//                     flex: 1,
//                     backgroundColor: index % 7 === 0 ? '#1976d2' : '#4caf50',
//                     height: `${height * 5}px`,
//                     borderRadius: '4px 4px 0 0'
//                   }} />
//                 ))}
//               </div>
//               <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
//                 Daily log entries for January 2025
//               </div>
//             </div>

//             {/* Log Type Distribution */}
//             <div style={{ 
//               backgroundColor: '#f8f9fa',
//               padding: '20px',
//               borderRadius: '8px'
//             }}>
//               <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Log Type Distribution</h4>
//               <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '10px 0' }}>
//                 {[
//                   { label: 'Checklists', value: 45, color: '#1976d2' },
//                   { label: 'Service', value: 25, color: '#ff9800' },
//                   { label: 'Issues', value: 15, color: '#d32f2f' },
//                   { label: 'Other', value: 15, color: '#7b1fa2' }
//                 ].map((item, index) => (
//                   <div key={index} style={{ flex: 1, textAlign: 'center' }}>
//                     <div style={{ 
//                       backgroundColor: item.color,
//                       height: `${item.value * 2}px`,
//                       borderRadius: '4px 4px 0 0'
//                     }} />
//                     <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{item.label}</div>
//                     <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{item.value}%</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Machine Health */}
//           <div style={{ 
//             backgroundColor: '#f8f9fa',
//             padding: '25px',
//             borderRadius: '8px',
//             marginBottom: '25px'
//           }}>
//             <h4 style={{ margin: '0 0 20px 0', color: '#333' }}>🏥 Machine Health Score</h4>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
//               <div style={{ position: 'relative', width: '120px', height: '120px' }}>
//                 <div style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   width: '120px',
//                   height: '120px',
//                   borderRadius: '50%',
//                   background: 'conic-gradient(#4caf50 0% 85%, #ff9800 85% 95%, #d32f2f 95% 100%)'
//                 }} />
//                 <div style={{
//                   position: 'absolute',
//                   top: '10px',
//                   left: '10px',
//                   width: '100px',
//                   height: '100px',
//                   borderRadius: '50%',
//                   backgroundColor: 'white',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>85%</span>
//                 </div>
//               </div>
              
//               <div style={{ flex: 1 }}>
//                 <div style={{ display: 'grid', gap: '12px' }}>
//                   {[
//                     { label: 'Regular Maintenance', value: 'On Schedule', status: 'good' },
//                     { label: 'Open Issues', value: '2 Critical', status: 'warning' },
//                     { label: 'Last Service', value: '15 days ago', status: 'good' },
//                     { label: 'Operating Hours', value: 'Within Limits', status: 'good' }
//                   ].map((item, index) => (
//                     <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <span style={{ color: '#666' }}>{item.label}:</span>
//                       <span style={{ 
//                         color: item.status === 'good' ? '#4caf50' : item.status === 'warning' ? '#ff9800' : '#d32f2f',
//                         fontWeight: '600'
//                       }}>
//                         {item.value}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Reports */}
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
//             <button style={{ 
//               padding: '20px',
//               backgroundColor: '#f0f7ff',
//               border: '1px solid #1976d2',
//               borderRadius: '8px',
//               cursor: 'pointer',
//               textAlign: 'left'
//             }}>
//               <div style={{ fontSize: '24px', marginBottom: '10px', color: '#1976d2' }}>📄</div>
//               <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>Monthly Report</div>
//               <div style={{ fontSize: '14px', color: '#666' }}>Generate monthly summary report</div>
//             </button>
            
//             <button style={{ 
//               padding: '20px',
//               backgroundColor: '#fff3e0',
//               border: '1px solid #ff9800',
//               borderRadius: '8px',
//               cursor: 'pointer',
//               textAlign: 'left'
//             }}>
//               <div style={{ fontSize: '24px', marginBottom: '10px', color: '#ff9800' }}>🔧</div>
//               <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>Maintenance Report</div>
//               <div style={{ fontSize: '14px', color: '#666' }}>View maintenance history</div>
//             </button>
            
//             <button style={{ 
//               padding: '20px',
//               backgroundColor: '#ffebee',
//               border: '1px solid #d32f2f',
//               borderRadius: '8px',
//               cursor: 'pointer',
//               textAlign: 'left'
//             }}>
//               <div style={{ fontSize: '24px', marginBottom: '10px', color: '#d32f2f' }}>⚠️</div>
//               <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>Issues Report</div>
//               <div style={{ fontSize: '14px', color: '#666' }}>View issue resolution timeline</div>
//             </button>
            
//             <button style={{ 
//               padding: '20px',
//               backgroundColor: '#f3e5f5',
//               border: '1px solid #7b1fa2',
//               borderRadius: '8px',
//               cursor: 'pointer',
//               textAlign: 'left'
//             }}>
//               <div style={{ fontSize: '24px', marginBottom: '10px', color: '#7b1fa2' }}>📊</div>
//               <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>Analytics</div>
//               <div style={{ fontSize: '14px', color: '#666' }}>Detailed usage analytics</div>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Log Detail Modal */}
//       {selectedLog && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0,0,0,0.95)',
//           zIndex: 1001,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '30px'
//         }}>
//           <div style={{
//             backgroundColor: 'white',
//             padding: '40px',
//             borderRadius: '12px',
//             maxWidth: '800px',
//             width: '100%',
//             maxHeight: '90vh',
//             overflowY: 'auto'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
//               <h3 style={{ margin: 0, color: '#333' }}>
//                 {getLogTypeIcon(selectedLog.logType)} Log Details
//               </h3>
//               <button 
//                 onClick={() => setSelectedLog(null)} 
//                 style={{ 
//                   background: 'none', 
//                   border: 'none', 
//                   fontSize: '28px', 
//                   cursor: 'pointer',
//                   color: '#666'
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <div style={{ 
//               backgroundColor: '#f8f9fa', 
//               padding: '25px', 
//               borderRadius: '8px',
//               marginBottom: '25px'
//             }}>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Log Type</div>
//                   <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
//                     {selectedLog.logType.replace('_', ' ')}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Status</div>
//                   <div style={{ 
//                     fontSize: '14px', 
//                     fontWeight: '600',
//                     padding: '6px 12px',
//                     backgroundColor: getStatusColor(selectedLog.status) + '15',
//                     color: getStatusColor(selectedLog.status),
//                     borderRadius: '20px',
//                     display: 'inline-block'
//                   }}>
//                     {selectedLog.status}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Date & Time</div>
//                   <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
//                     {formatDateTime(selectedLog.timestamp)}
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>Operator</div>
//                   <div style={{ fontSize: '16px', color: '#333' }}>
//                     {selectedLog.operatorName || 'N/A'}
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Machine</div>
//                 <div style={{ 
//                   backgroundColor: '#e3f2fd', 
//                   padding: '12px 15px', 
//                   borderRadius: '6px',
//                   fontSize: '16px',
//                   color: '#1976d2',
//                   fontWeight: '600'
//                 }}>
//                   {selectedLog.machineNumber} - {selectedLog.machineName}
//                 </div>
//               </div>
//             </div>

//             {/* Log Type Specific Details */}
//             {selectedLog.logType === 'DAILY_CHECKLIST' && selectedLog.checklistData && (
//               <div style={{ marginBottom: '25px' }}>
//                 <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 Checklist Results</h4>
//                 <div style={{ 
//                   display: 'grid', 
//                   gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//                   gap: '15px'
//                 }}>
//                   {Object.entries(selectedLog.checklistData).map(([key, value]) => {
//                     if (key === 'remarks') return null;
                    
//                     const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
//                     return (
//                       <div key={key} style={{ 
//                         backgroundColor: '#f8f9fa', 
//                         padding: '15px', 
//                         borderRadius: '6px',
//                         border: '1px solid #e0e0e0'
//                       }}>
//                         <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>{label}</div>
//                         <div style={{ 
//                           fontSize: '16px', 
//                           fontWeight: '600',
//                           color: typeof value === 'boolean' 
//                             ? (value ? '#4caf50' : '#d32f2f')
//                             : '#333'
//                         }}>
//                           {typeof value === 'boolean' ? (value ? '✓ Yes' : '✗ No') : String(value).toUpperCase()}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
                
//                 {selectedLog.checklistData.remarks && (
//                   <div style={{ marginTop: '20px' }}>
//                     <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Remarks</div>
//                     <div style={{ 
//                       backgroundColor: '#fff3e0', 
//                       padding: '15px', 
//                       borderRadius: '6px',
//                       fontStyle: 'italic'
//                     }}>
//                       {selectedLog.checklistData.remarks}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {selectedLog.logType === 'SERVICE' && selectedLog.serviceData && (
//               <div style={{ marginBottom: '25px' }}>
//                 <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>🔧 Service Details</h4>
//                 <div style={{ 
//                   display: 'grid', 
//                   gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
//                   gap: '20px',
//                   marginBottom: '20px'
//                 }}>
//                   {Object.entries(selectedLog.serviceData).map(([key, value]) => {
//                     if (!value || key === 'remarks') return null;
                    
//                     const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
//                     return (
//                       <div key={key}>
//                         <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>{label}</div>
//                         <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
//                           {String(value)}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
                
//                 {selectedLog.serviceData.remarks && (
//                   <div>
//                     <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Remarks</div>
//                     <div style={{ 
//                       backgroundColor: '#f0f7ff', 
//                       padding: '15px', 
//                       borderRadius: '6px'
//                     }}>
//                       {selectedLog.serviceData.remarks}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {selectedLog.logType === 'ISSUE_REPORT' && selectedLog.issueData && (
//               <div style={{ marginBottom: '25px' }}>
//                 <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>⚠️ Issue Details</h4>
//                 <div style={{ 
//                   backgroundColor: '#ffebee', 
//                   padding: '20px', 
//                   borderRadius: '8px',
//                   marginBottom: '20px'
//                 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//                     <div style={{ fontSize: '18px', fontWeight: '600', color: '#d32f2f' }}>
//                       {selectedLog.issueData.title}
//                     </div>
//                     <div style={{ 
//                       padding: '6px 12px',
//                       backgroundColor: getSeverityColor(selectedLog.issueData.severity) + '15',
//                       color: getSeverityColor(selectedLog.issueData.severity),
//                       borderRadius: '20px',
//                       fontSize: '12px',
//                       fontWeight: '600'
//                     }}>
//                       {selectedLog.issueData.severity}
//                     </div>
//                   </div>
                  
//                   <div style={{ marginBottom: '15px' }}>
//                     <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Description</div>
//                     <div style={{ color: '#333' }}>
//                       {selectedLog.issueData.description}
//                     </div>
//                   </div>
                  
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
//                     <div>
//                       <div style={{ fontSize: '14px', color: '#666' }}>Category</div>
//                       <div style={{ color: '#333', fontWeight: '600' }}>
//                         {selectedLog.issueData.category}
//                       </div>
//                     </div>
//                     <div>
//                       <div style={{ fontSize: '14px', color: '#666' }}>Location</div>
//                       <div style={{ color: '#333' }}>
//                         {selectedLog.issueData.location || 'Not specified'}
//                       </div>
//                     </div>
//                     <div>
//                       <div style={{ fontSize: '14px', color: '#666' }}>Emergency</div>
//                       <div style={{ 
//                         color: selectedLog.issueData.emergency ? '#d32f2f' : '#4caf50',
//                         fontWeight: '600'
//                       }}>
//                         {selectedLog.issueData.emergency ? 'YES' : 'NO'}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Photos Section */}
//             {selectedLog.photos && selectedLog.photos.length > 0 && (
//               <div style={{ marginBottom: '25px' }}>
//                 <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📷 Photos ({selectedLog.photos.length})</h4>
//                 <div style={{ 
//                   display: 'grid', 
//                   gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
//                   gap: '15px',
//                   maxHeight: '300px',
//                   overflowY: 'auto',
//                   padding: '10px',
//                   backgroundColor: '#f8f9fa',
//                   borderRadius: '8px'
//                 }}>
//                   {selectedLog.photos.map((photo, index) => (
//                     <div key={index} style={{ position: 'relative' }}>
//                       <img 
//                         src={photo.base64Data} 
//                         alt={`Log photo ${index + 1}`}
//                         style={{
//                           width: '100%',
//                           height: '150px',
//                           objectFit: 'cover',
//                           borderRadius: '6px',
//                           border: '2px solid #ddd'
//                         }}
//                       />
//                       <div style={{ 
//                         position: 'absolute', 
//                         top: '5px', 
//                         right: '5px',
//                         backgroundColor: 'rgba(0,0,0,0.7)',
//                         color: 'white',
//                         fontSize: '10px',
//                         padding: '2px 6px',
//                         borderRadius: '4px'
//                       }}>
//                         {index + 1}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div style={{ 
//               display: 'flex', 
//               justifyContent: 'flex-end',
//               borderTop: '1px solid #eee',
//               paddingTop: '20px'
//             }}>
//               <button 
//                 onClick={() => setSelectedLog(null)}
//                 style={{ 
//                   padding: '12px 30px', 
//                   backgroundColor: '#1b5e20', 
//                   color: 'white', 
//                   border: 'none',
//                   borderRadius: '8px', 
//                   cursor: 'pointer',
//                   fontSize: '16px',
//                   fontWeight: '600'
//                 }}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       {showDailyChecklist && (
//         <DailyChecklistModal
//           machineNumber={machine.number}
//           machineName={machine.name}
//           userId={user.id}
//           onSave={handleSaveLogEntry}
//           onClose={() => setShowDailyChecklist(false)}
//         />
//       )}

//       {showServiceLog && (
//         <ServiceLogModal
//           machineNumber={machine.number}
//           machineName={machine.name}
//           userId={user.id}
//           onSave={handleSaveLogEntry}
//           onClose={() => setShowServiceLog(false)}
//         />
//       )}

//       {showIssueReport && (
//         <IssueReportModal
//           machineNumber={machine.number}
//           machineName={machine.name}
//           userId={user.id}
//           onSave={handleSaveIssue}
//           onClose={() => setShowIssueReport(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default MachineLogBookDashboard;



// import React, { useState, useEffect, useRef } from 'react';

// // ==================== INDEXEDDB SETUP ====================
// const initDatabase = async () => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('BreakdownReportsDB', 2);
    
//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       const oldVersion = event.oldVersion;
      
//       // Create breakdown reports store
//       if (!db.objectStoreNames.contains('breakdown_reports')) {
//         const store = db.createObjectStore('breakdown_reports', { keyPath: 'reportId', autoIncrement: true });
//         store.createIndex('plantNumber', 'plantNumber', { unique: false });
//         store.createIndex('breakdownDate', 'breakdownDate', { unique: false });
//         store.createIndex('reportedBy', 'reportedBy', { unique: false });
//         store.createIndex('status', 'status', { unique: false });
//       }
      
//       // Create machine photos store
//       if (oldVersion < 2) {
//         if (!db.objectStoreNames.contains('machine_photos')) {
//           const photosStore = db.createObjectStore('machine_photos', { keyPath: 'photoId', autoIncrement: true });
//           photosStore.createIndex('plantNumber', 'plantNumber', { unique: false });
//           photosStore.createIndex('reportId', 'reportId', { unique: false });
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

// // ==================== DATABASE FUNCTIONS ====================
// const saveBreakdownReport = async (reportData) => {
//   try {
//     const db = await initDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['breakdown_reports'], 'readwrite');
//       const store = transaction.objectStore('breakdown_reports');
      
//       const reportEntry = {
//         ...reportData,
//         reportId: Date.now() + Math.random(),
//         timestamp: new Date().toISOString(),
//         status: 'SUBMITTED'
//       };
      
//       const request = store.add(reportEntry);
      
//       request.onsuccess = () => {
//         const savedId = request.result;
//         transaction.oncomplete = () => {
//           db.close();
//         };
//         resolve({ ...reportEntry, reportId: savedId });
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to save breakdown report'));
//       };
//     });
//   } catch (error) {
//     console.error('Database error:', error);
//     throw error;
//   }
// };

// const getAllBreakdownReports = async () => {
//   try {
//     const db = await initDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['breakdown_reports'], 'readonly');
//       const store = transaction.objectStore('breakdown_reports');
//       const request = store.getAll();
      
//       request.onsuccess = () => {
//         const reports = request.result;
        
//         // Sort by date (newest first)
//         reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(reports);
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to load breakdown reports'));
//       };
//     });
//   } catch (error) {
//     console.error('Error loading reports:', error);
//     return [];
//   }
// };

// const saveMachinePhoto = async (photoData) => {
//   try {
//     const db = await initDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['machine_photos'], 'readwrite');
//       const store = transaction.objectStore('machine_photos');
      
//       const photoEntry = {
//         ...photoData,
//         photoId: Date.now() + Math.random(),
//         uploadedAt: new Date().toISOString()
//       };
      
//       const request = store.add(photoEntry);
      
//       request.onsuccess = () => {
//         const savedId = request.result;
//         transaction.oncomplete = () => {
//           db.close();
//         };
//         resolve({ ...photoEntry, photoId: savedId });
//       };
      
//       request.onerror = () => {
//         reject(new Error('Failed to save photo'));
//       };
//     });
//   } catch (error) {
//     console.error('Database error:', error);
//     throw error;
//   }
// };

// const getPhotosForReport = async (reportId) => {
//   try {
//     const db = await initDatabase();
    
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(['machine_photos'], 'readonly');
//       const store = transaction.objectStore('machine_photos');
//       const index = store.index('reportId');
//       const request = index.getAll(reportId);
      
//       request.onsuccess = () => {
//         const photos = request.result;
        
//         transaction.oncomplete = () => {
//           db.close();
//         };
        
//         resolve(photos);
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

// // ==================== SIGNATURE PAD COMPONENT ====================
// const SignaturePad = ({ onSave, onClose }) => {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [context, setContext] = useState(null);
  
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.lineWidth = 2;
//     ctx.lineCap = 'round';
//     ctx.strokeStyle = '#000000';
//     setContext(ctx);
    
//     // Clear canvas
//     ctx.fillStyle = 'white';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   }, []);

//   const startDrawing = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
    
//     if (context) {
//       context.beginPath();
//       context.moveTo(x, y);
//       setIsDrawing(true);
//     }
//   };

//   const draw = (e) => {
//     if (!isDrawing || !context) return;
    
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
    
//     context.lineTo(x, y);
//     context.stroke();
//   };

//   const stopDrawing = () => {
//     if (context) {
//       context.closePath();
//     }
//     setIsDrawing(false);
//   };

//   const clearSignature = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.fillStyle = 'white';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   };

//   const saveSignature = () => {
//     const canvas = canvasRef.current;
//     const signatureData = canvas.toDataURL('image/png');
//     onSave(signatureData);
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
//         maxWidth: '600px',
//         width: '100%'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h3 style={{ margin: 0, color: '#1b5e20' }}>
//             ✍️ Draw Your Signature
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

//         <div style={{ 
//           marginBottom: '20px',
//           textAlign: 'center'
//         }}>
//           <p style={{ color: '#666', marginBottom: '10px' }}>
//             Draw your signature in the box below using your mouse or touch screen
//           </p>
          
//           <div style={{
//             border: '2px solid #ddd',
//             borderRadius: '8px',
//             padding: '10px',
//             backgroundColor: '#f8f9fa'
//           }}>
//             <canvas
//               ref={canvasRef}
//               width={500}
//               height={200}
//               onMouseDown={startDrawing}
//               onMouseMove={draw}
//               onMouseUp={stopDrawing}
//               onMouseLeave={stopDrawing}
//               onTouchStart={(e) => {
//                 e.preventDefault();
//                 startDrawing(e.touches[0]);
//               }}
//               onTouchMove={(e) => {
//                 e.preventDefault();
//                 draw(e.touches[0]);
//               }}
//               onTouchEnd={stopDrawing}
//               style={{
//                 border: '1px solid #ccc',
//                 backgroundColor: 'white',
//                 cursor: 'crosshair',
//                 touchAction: 'none'
//               }}
//             />
//           </div>
          
//           <div style={{ 
//             fontSize: '12px', 
//             color: '#666', 
//             marginTop: '5px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '5px'
//           }}>
//             <span>💡</span> Use mouse or touch to draw your signature
//           </div>
//         </div>

//         <div style={{ 
//           display: 'flex', 
//           flexDirection: 'column',
//           gap: '10px',
//           borderTop: '1px solid #eee',
//           paddingTop: '20px'
//         }}>
//           <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
//             <button 
//               onClick={clearSignature}
//               style={{ 
//                 flex: 1,
//                 padding: '12px 20px', 
//                 backgroundColor: '#757575', 
//                 color: 'white', 
//                 border: 'none',
//                 borderRadius: '6px', 
//                 cursor: 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500'
//               }}
//             >
//               🗑️ Clear Signature
//             </button>
            
//             <button 
//               onClick={saveSignature}
//               style={{ 
//                 flex: 1,
//                 padding: '12px 20px', 
//                 backgroundColor: '#1b5e20', 
//                 color: 'white', 
//                 border: 'none',
//                 borderRadius: '6px', 
//                 cursor: 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500'
//               }}
//             >
//               💾 Save Signature
//             </button>
//           </div>
          
//           <button 
//             onClick={onClose}
//             style={{ 
//               width: '100%',
//               padding: '12px 20px', 
//               backgroundColor: '#f5f5f5', 
//               color: '#333', 
//               border: '1px solid #ddd',
//               borderRadius: '6px', 
//               cursor: 'pointer',
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

// // ==================== QR SCANNER COMPONENT ====================
// const QRScannerModal = ({ onScan, onClose }) => {
//   const [scanning, setScanning] = useState(true);
//   const videoRef = useRef(null);

//   // Simulate QR scanning for demo
//   useEffect(() => {
//     if (scanning) {
//       const timer = setTimeout(() => {
//         setScanning(false);
//         // Simulate successful scan
//         onScan(`PLANT-${Math.floor(Math.random() * 9000) + 1000}`);
//       }, 2000);
      
//       return () => clearTimeout(timer);
//     }
//   }, [scanning, onScan]);

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
//         <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#333' }}>
//           📷 Scan Plant Number QR Code
//         </h3>
        
//         <div style={{ 
//           width: '100%', 
//           height: '300px',
//           backgroundColor: '#000',
//           borderRadius: '8px',
//           marginBottom: '20px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           position: 'relative',
//           overflow: 'hidden'
//         }}>
//           {/* Scanner frame */}
//           <div style={{
//             width: '250px',
//             height: '250px',
//             border: '2px solid #4caf50',
//             borderRadius: '8px',
//             position: 'relative',
//             animation: 'pulse 2s infinite'
//           }}>
//             {/* Scanning animation line */}
//             {scanning && (
//               <div style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 height: '3px',
//                 backgroundColor: '#4caf50',
//                 animation: 'scan 2s linear infinite'
//               }} />
//             )}
//           </div>
          
//           {/* Corner markers */}
//           <div style={{
//             position: 'absolute',
//             top: '25px',
//             left: '25px',
//             width: '20px',
//             height: '20px',
//             borderTop: '3px solid #4caf50',
//             borderLeft: '3px solid #4caf50'
//           }} />
//           <div style={{
//             position: 'absolute',
//             top: '25px',
//             right: '25px',
//             width: '20px',
//             height: '20px',
//             borderTop: '3px solid #4caf50',
//             borderRight: '3px solid #4caf50'
//           }} />
//           <div style={{
//             position: 'absolute',
//             bottom: '25px',
//             left: '25px',
//             width: '20px',
//             height: '20px',
//             borderBottom: '3px solid #4caf50',
//             borderLeft: '3px solid #4caf50'
//           }} />
//           <div style={{
//             position: 'absolute',
//             bottom: '25px',
//             right: '25px',
//             width: '20px',
//             height: '20px',
//             borderBottom: '3px solid #4caf50',
//             borderRight: '3px solid #4caf50'
//           }} />
//         </div>
        
//         <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
//           {scanning 
//             ? 'Position the QR code within the frame to scan...' 
//             : '✅ Plant number scanned successfully!'}
//         </p>
        
//         <div style={{ display: 'flex', gap: '10px' }}>
//           <button 
//             onClick={onClose}
//             style={{ 
//               flex: 1,
//               padding: '12px 20px', 
//               backgroundColor: '#757575', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '6px', 
//               cursor: 'pointer',
//               fontSize: '14px'
//             }}
//           >
//             Cancel Scan
//           </button>
          
//           <button 
//             onClick={() => {
//               onScan(`PLANT-${Math.floor(Math.random() * 9000) + 1000}`);
//             }}
//             style={{ 
//               flex: 1,
//               padding: '12px 20px', 
//               backgroundColor: '#1976d2', 
//               color: 'white', 
//               border: 'none',
//               borderRadius: '6px', 
//               cursor: 'pointer',
//               fontSize: '14px'
//             }}
//           >
//             Simulate Scan
//           </button>
//         </div>
//       </div>
      
//       <style>{`
//         @keyframes scan {
//           0% { top: 0; }
//           50% { top: 250px; }
//           100% { top: 0; }
//         }
        
//         @keyframes pulse {
//           0%, 100% { border-color: #4caf50; }
//           50% { border-color: #81c784; }
//         }
//       `}</style>
//     </div>
//   );
// };

// // ==================== MAIN BREAKDOWN REPORT COMPONENT ====================
// const BreakdownReportComponent = ({ user, onBack }) => {
//   const [activeView, setActiveView] = useState('new'); // 'new', 'history', 'details'
//   const [reports, setReports] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // New report form state
//   const [formData, setFormData] = useState({
//     plantNumber: '',
//     breakdownDate: new Date().toISOString().split('T')[0],
//     hoursIn: '',
//     hoursOut: '',
//     reason: '',
//     description: '',
//     severity: 'MEDIUM',
//     category: 'MECHANICAL',
//     reportedBy: user?.fullName || 'Operator',
//     department: '',
//     location: '',
//     actionTaken: '',
//     supervisorNotified: false,
//     machineStopped: false,
//     safetyChecked: true,
//     photos: [],
//     signature: null
//   });
  
//   const [showQRScanner, setShowQRScanner] = useState(false);
//   const [showSignaturePad, setShowSignaturePad] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     loadReports();
//   }, []);

//   const loadReports = async () => {
//     setIsLoading(true);
//     try {
//       const allReports = await getAllBreakdownReports();
//       setReports(allReports);
//     } catch (error) {
//       console.error('Error loading reports:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleQRScan = (plantNumber) => {
//     handleInputChange('plantNumber', plantNumber);
//     setShowQRScanner(false);
//   };

//   const handleSignatureSave = (signatureData) => {
//     setFormData(prev => ({
//       ...prev,
//       signature: signatureData
//     }));
//     setShowSignaturePad(false);
//   };

//   const handlePhotoUpload = async (files) => {
//     const uploadedPhotos = [];
    
//     for (const file of files) {
//       if (file && file.type.startsWith('image/')) {
//         const reader = new FileReader();
        
//         reader.onload = async (event) => {
//           const base64Image = event.target.result;
          
//           const photoData = {
//             base64Data: base64Image,
//             filename: file.name,
//             fileType: file.type,
//             fileSize: file.size,
//             uploadedAt: new Date().toISOString(),
//             uploadedBy: user?.fullName || 'Operator'
//           };
          
//           uploadedPhotos.push(photoData);
          
//           // Update form data with all uploaded photos
//           setFormData(prev => ({
//             ...prev,
//             photos: [...prev.photos, ...uploadedPhotos]
//           }));
//         };
        
//         reader.readAsDataURL(file);
//       }
//     }
//   };

//   const validateForm = () => {
//     const errors = [];
    
//     if (!formData.plantNumber) errors.push('Plant number is required');
//     if (!formData.breakdownDate) errors.push('Breakdown date is required');
//     if (!formData.hoursIn) errors.push('Hours in is required');
//     if (!formData.hoursOut) errors.push('Hours out is required');
//     if (parseFloat(formData.hoursOut) <= parseFloat(formData.hoursIn)) {
//       errors.push('Hours out must be greater than hours in');
//     }
//     if (!formData.reason) errors.push('Reason for breakdown is required');
//     if (!formData.signature) errors.push('Signature is required');
    
//     return errors;
//   };

//   const handleSubmit = async () => {
//     const errors = validateForm();
//     if (errors.length > 0) {
//       alert(`Please fix the following errors:\n\n${errors.join('\n')}`);
//       return;
//     }
    
//     setSubmitting(true);
    
//     try {
//       // Calculate downtime
//       const hoursIn = parseFloat(formData.hoursIn);
//       const hoursOut = parseFloat(formData.hoursOut);
//       const downtimeHours = hoursOut - hoursIn;
      
//       // Prepare report data
//       const reportData = {
//         ...formData,
//         downtimeHours: downtimeHours,
//         reportedBy: user?.fullName || 'Operator',
//         userId: user?.id || 'anonymous',
//         status: 'SUBMITTED',
//         timestamp: new Date().toISOString()
//       };
      
//       // Save report to database
//       const savedReport = await saveBreakdownReport(reportData);
      
//       // Save photos if any
//       if (formData.photos.length > 0) {
//         for (const photo of formData.photos) {
//           await saveMachinePhoto({
//             ...photo,
//             plantNumber: formData.plantNumber,
//             reportId: savedReport.reportId
//           });
//         }
//       }
      
//       // Reset form
//       setFormData({
//         plantNumber: '',
//         breakdownDate: new Date().toISOString().split('T')[0],
//         hoursIn: '',
//         hoursOut: '',
//         reason: '',
//         description: '',
//         severity: 'MEDIUM',
//         category: 'MECHANICAL',
//         reportedBy: user?.fullName || 'Operator',
//         department: '',
//         location: '',
//         actionTaken: '',
//         supervisorNotified: false,
//         machineStopped: false,
//         safetyChecked: true,
//         photos: [],
//         signature: null
//       });
      
//       // Reload reports
//       await loadReports();
      
//       // Show success message
//       alert('✅ Breakdown report submitted successfully!');
      
//       // Switch to history view
//       setActiveView('history');
      
//     } catch (error) {
//       console.error('Error submitting report:', error);
//       alert(`Failed to submit report: ${error.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleViewReport = async (report) => {
//     setSelectedReport(report);
    
//     // Load photos for this report
//     if (report.reportId) {
//       const photos = await getPhotosForReport(report.reportId);
//       setSelectedReport(prev => ({ ...prev, photos }));
//     }
    
//     setActiveView('details');
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getSeverityColor = (severity) => {
//     switch(severity) {
//       case 'LOW': return '#4caf50';
//       case 'MEDIUM': return '#ff9800';
//       case 'HIGH': return '#f57c00';
//       case 'CRITICAL': return '#d32f2f';
//       default: return '#666';
//     }
//   };

//   // Calculate statistics
//   const stats = {
//     totalReports: reports.length,
//     todayReports: reports.filter(r => 
//       new Date(r.timestamp).toDateString() === new Date().toDateString()
//     ).length,
//     openReports: reports.filter(r => r.status === 'SUBMITTED' || r.status === 'IN_PROGRESS').length,
//     resolvedReports: reports.filter(r => r.status === 'RESOLVED').length,
//     avgDowntime: reports.length > 0 
//       ? (reports.reduce((sum, r) => sum + (r.downtimeHours || 0), 0) / reports.length).toFixed(1)
//       : 0
//   };

//   return (
//     <div style={{ 
//       padding: '20px', 
//       maxWidth: '1200px', 
//       margin: '0 auto', 
//       backgroundColor: '#f5f5f5', 
//       minHeight: '100vh' 
//     }}>
      
//       {/* Header */}
//       <div style={{ 
//         backgroundColor: 'white',
//         borderRadius: '12px',
//         boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//         marginBottom: '25px',
//         overflow: 'hidden'
//       }}>
//         <div style={{ 
//           padding: '25px 30px',
//           background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
//           color: 'white',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//             <div style={{ 
//               width: '60px', 
//               height: '60px', 
//               backgroundColor: 'white', 
//               borderRadius: '10px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: '#d32f2f',
//               fontSize: '28px',
//               fontWeight: 'bold'
//             }}>
//               🚜
//             </div>
//             <div>
//               <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Equipment Breakdown Reporting</h1>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
//                 <span style={{ fontSize: '16px', fontWeight: '500' }}>Report and track equipment breakdowns</span>
//               </div>
//             </div>
//           </div>
          
//           <div style={{ display: 'flex', gap: '15px' }}>
//             <button 
//               onClick={onBack}
//               style={{ 
//                 padding: '10px 20px',
//                 backgroundColor: 'rgba(255,255,255,0.1)',
//                 color: 'white',
//                 border: '1px solid rgba(255,255,255,0.3)',
//                 borderRadius: '8px',
//                 cursor: 'pointer',
//                 fontWeight: '600',
//                 fontSize: '14px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}
//             >
//               ← Back to Dashboard
//             </button>
            
//             <div style={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               gap: '10px',
//               padding: '10px 20px',
//               backgroundColor: 'rgba(255,255,255,0.1)',
//               borderRadius: '8px'
//             }}>
//               <span>👤</span>
//               <span style={{ fontSize: '14px' }}>{user?.fullName || 'Operator'}</span>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '0 30px',
//           borderBottom: '1px solid #e0e0e0',
//           display: 'flex',
//           gap: '0'
//         }}>
//           <button
//             onClick={() => setActiveView('new')}
//             style={{ 
//               padding: '18px 25px',
//               backgroundColor: activeView === 'new' ? '#ffebee' : 'transparent',
//               color: activeView === 'new' ? '#d32f2f' : '#666',
//               border: 'none',
//               borderBottom: activeView === 'new' ? '3px solid #d32f2f' : 'none',
//               cursor: 'pointer',
//               fontWeight: activeView === 'new' ? '600' : '500',
//               fontSize: '15px',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '10px'
//             }}
//           >
//             🚨 New Breakdown Report
//           </button>
          
//           <button
//             onClick={() => {
//               loadReports();
//               setActiveView('history');
//             }}
//             style={{ 
//               padding: '18px 25px',
//               backgroundColor: activeView === 'history' ? '#f0f7ff' : 'transparent',
//               color: activeView === 'history' ? '#1976d2' : '#666',
//               border: 'none',
//               borderBottom: activeView === 'history' ? '3px solid #1976d2' : 'none',
//               cursor: 'pointer',
//               fontWeight: activeView === 'history' ? '600' : '500',
//               fontSize: '15px',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '10px'
//             }}
//           >
//             📋 Report History
//           </button>
//         </div>
//       </div>

//       {/* Statistics Cards */}
//       <div style={{ 
//         display: 'grid', 
//         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//         gap: '20px', 
//         marginBottom: '30px' 
//       }}>
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '25px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '20px'
//         }}>
//           <div style={{ 
//             width: '60px', 
//             height: '60px', 
//             backgroundColor: '#ffebee',
//             borderRadius: '12px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '28px',
//             color: '#d32f2f'
//           }}>
//             📋
//           </div>
//           <div>
//             <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
//               {stats.totalReports}
//             </div>
//             <div style={{ fontSize: '14px', color: '#666' }}>
//               Total Reports
//             </div>
//           </div>
//         </div>

//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '25px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '20px'
//         }}>
//           <div style={{ 
//             width: '60px', 
//             height: '60px', 
//             backgroundColor: '#e8f5e9',
//             borderRadius: '12px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '28px',
//             color: '#4caf50'
//           }}>
//             📅
//           </div>
//           <div>
//             <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
//               {stats.todayReports}
//             </div>
//             <div style={{ fontSize: '14px', color: '#666' }}>
//               Today's Reports
//             </div>
//           </div>
//         </div>

//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '25px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '20px'
//         }}>
//           <div style={{ 
//             width: '60px', 
//             height: '60px', 
//             backgroundColor: '#fff3e0',
//             borderRadius: '12px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '28px',
//             color: '#ff9800'
//           }}>
//             ⏱️
//           </div>
//           <div>
//             <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
//               {stats.avgDowntime}
//             </div>
//             <div style={{ fontSize: '14px', color: '#666' }}>
//               Avg. Downtime (hrs)
//             </div>
//           </div>
//         </div>

//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '25px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '20px'
//         }}>
//           <div style={{ 
//             width: '60px', 
//             height: '60px', 
//             backgroundColor: '#e3f2fd',
//             borderRadius: '12px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '28px',
//             color: '#1976d2'
//           }}>
//             ✅
//           </div>
//           <div>
//             <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
//               {stats.resolvedReports}
//             </div>
//             <div style={{ fontSize: '14px', color: '#666' }}>
//               Resolved
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       {activeView === 'new' ? (
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '30px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           marginBottom: '30px'
//         }}>
//           <h2 style={{ margin: '0 0 25px 0', color: '#d32f2f' }}>
//             🚨 New Breakdown Report
//           </h2>

//           {/* Step 1: Plant Number */}
//           <div style={{ 
//             backgroundColor: '#f8f9fa', 
//             padding: '20px', 
//             borderRadius: '10px',
//             marginBottom: '25px'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//               <div>
//                 <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Step 1: Plant Number</h3>
//                 <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
//                   Scan the plant number QR code or enter manually
//                 </p>
//               </div>
//               <button 
//                 onClick={() => setShowQRScanner(true)}
//                 style={{ 
//                   padding: '10px 20px',
//                   backgroundColor: '#1976d2',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px'
//                 }}
//               >
//                 📷 Scan QR Code
//               </button>
//             </div>
            
//             <input
//               type="text"
//               value={formData.plantNumber}
//               onChange={(e) => handleInputChange('plantNumber', e.target.value)}
//               placeholder="Enter plant number or scan QR code"
//               style={{ 
//                 width: '100%', 
//                 padding: '12px', 
//                 borderRadius: '6px', 
//                 border: '2px solid #ccc',
//                 fontSize: '16px'
//               }}
//             />
//           </div>

//           {/* Step 2: Date and Time Details */}
//           <div style={{ 
//             backgroundColor: '#f8f9fa', 
//             padding: '20px', 
//             borderRadius: '10px',
//             marginBottom: '25px'
//           }}>
//             <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Step 2: Date & Time Details</h3>
            
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
//               gap: '20px',
//               marginBottom: '15px'
//             }}>
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                   Breakdown Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.breakdownDate}
//                   onChange={(e) => handleInputChange('breakdownDate', e.target.value)}
//                   style={{ 
//                     width: '100%', 
//                     padding: '12px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc',
//                     fontSize: '16px'
//                   }}
//                 />
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                   Hours In *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.1"
//                   value={formData.hoursIn}
//                   onChange={(e) => handleInputChange('hoursIn', e.target.value)}
//                   placeholder="e.g., 1250.5"
//                   style={{ 
//                     width: '100%', 
//                     padding: '12px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc',
//                     fontSize: '16px'
//                   }}
//                 />
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                   Hours Out *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.1"
//                   value={formData.hoursOut}
//                   onChange={(e) => handleInputChange('hoursOut', e.target.value)}
//                   placeholder="e.g., 1252.5"
//                   style={{ 
//                     width: '100%', 
//                     padding: '12px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc',
//                     fontSize: '16px'
//                   }}
//                 />
//               </div>
//             </div>
            
//             <div style={{ 
//               backgroundColor: '#fff3e0', 
//               padding: '15px', 
//               borderRadius: '6px',
//               border: '1px solid #ff9800'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div>
//                   <div style={{ fontWeight: '600', color: '#333' }}>Downtime Calculation</div>
//                   <div style={{ fontSize: '14px', color: '#666' }}>
//                     {formData.hoursIn && formData.hoursOut 
//                       ? `Breakdown duration: ${(parseFloat(formData.hoursOut) - parseFloat(formData.hoursIn)).toFixed(1)} hours`
//                       : 'Enter hours in and hours out to calculate downtime'
//                     }
//                   </div>
//                 </div>
//                 <div style={{ 
//                   fontSize: '24px', 
//                   fontWeight: 'bold',
//                   color: formData.hoursIn && formData.hoursOut ? '#d32f2f' : '#666'
//                 }}>
//                   ⏱️
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Step 3: Breakdown Details */}
//           <div style={{ 
//             backgroundColor: '#f8f9fa', 
//             padding: '20px', 
//             borderRadius: '10px',
//             marginBottom: '25px'
//           }}>
//             <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Step 3: Breakdown Details</h3>
            
//             <div style={{ marginBottom: '15px' }}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                 Reason for Breakdown *
//               </label>
//               <input
//                 type="text"
//                 value={formData.reason}
//                 onChange={(e) => handleInputChange('reason', e.target.value)}
//                 placeholder="Brief description of the breakdown reason"
//                 style={{ 
//                   width: '100%', 
//                   padding: '12px', 
//                   borderRadius: '6px', 
//                   border: '1px solid #ccc',
//                   fontSize: '16px'
//                 }}
//               />
//             </div>
            
//             <div style={{ marginBottom: '15px' }}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                 Detailed Description
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) => handleInputChange('description', e.target.value)}
//                 placeholder="Provide detailed description of the breakdown, symptoms, actions taken, etc."
//                 rows="4"
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: '1px solid #ddd',
//                   borderRadius: '8px',
//                   fontSize: '14px',
//                   resize: 'vertical'
//                 }}
//               />
//             </div>
            
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
//               gap: '20px'
//             }}>
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                   Severity Level
//                 </label>
//                 <select
//                   value={formData.severity}
//                   onChange={(e) => handleInputChange('severity', e.target.value)}
//                   style={{ 
//                     width: '100%', 
//                     padding: '12px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc',
//                     fontSize: '14px'
//                   }}
//                 >
//                   <option value="LOW">Low - Minor issue</option>
//                   <option value="MEDIUM">Medium - Significant issue</option>
//                   <option value="HIGH">High - Major breakdown</option>
//                   <option value="CRITICAL">Critical - Complete stoppage</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                   Category
//                 </label>
//                 <select
//                   value={formData.category}
//                   onChange={(e) => handleInputChange('category', e.target.value)}
//                   style={{ 
//                     width: '100%', 
//                     padding: '12px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc',
//                     fontSize: '14px'
//                 }}
//                 >
//                   <option value="MECHANICAL">Mechanical</option>
//                   <option value="ELECTRICAL">Electrical</option>
//                   <option value="HYDRAULIC">Hydraulic</option>
//                   <option value="PNEUMATIC">Pneumatic</option>
//                   <option value="OPERATOR_ERROR">Operator Error</option>
//                   <option value="OTHER">Other</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Step 4: Additional Information */}
//           <div style={{ 
//             backgroundColor: '#f8f9fa', 
//             padding: '20px', 
//             borderRadius: '10px',
//             marginBottom: '25px'
//           }}>
//             <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Step 4: Additional Information</h3>
            
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
//               gap: '20px',
//               marginBottom: '15px'
//             }}>
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                   Department
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.department}
//                   onChange={(e) => handleInputChange('department', e.target.value)}
//                   placeholder="e.g., Production, Maintenance"
//                   style={{ 
//                     width: '100%', 
//                     padding: '12px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>
              
//               <div>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
//                   Location
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.location}
//                   onChange={(e) => handleInputChange('location', e.target.value)}
//                   placeholder="e.g., Line 3, Area B"
//                   style={{ 
//                     width: '100%', 
//                     padding: '12px', 
//                     borderRadius: '6px', 
//                     border: '1px solid #ccc',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>
//             </div>
            
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
//               gap: '20px'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                 <input
//                   type="checkbox"
//                   id="supervisorNotified"
//                   checked={formData.supervisorNotified}
//                   onChange={(e) => handleInputChange('supervisorNotified', e.target.checked)}
//                   style={{ transform: 'scale(1.2)' }}
//                 />
//                 <label htmlFor="supervisorNotified" style={{ color: '#333' }}>
//                   Supervisor Notified
//                 </label>
//               </div>
              
//               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                 <input
//                   type="checkbox"
//                   id="machineStopped"
//                   checked={formData.machineStopped}
//                   onChange={(e) => handleInputChange('machineStopped', e.target.checked)}
//                   style={{ transform: 'scale(1.2)' }}
//                 />
//                 <label htmlFor="machineStopped" style={{ color: '#333' }}>
//                   Machine Stopped
//                 </label>
//               </div>
              
//               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                 <input
//                   type="checkbox"
//                   id="safetyChecked"
//                   checked={formData.safetyChecked}
//                   onChange={(e) => handleInputChange('safetyChecked', e.target.checked)}
//                   style={{ transform: 'scale(1.2)' }}
//                 />
//                 <label htmlFor="safetyChecked" style={{ color: '#333' }}>
//                   Safety Checked
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Step 5: Photos */}
//           <div style={{ 
//             backgroundColor: '#f8f9fa', 
//             padding: '20px', 
//             borderRadius: '10px',
//             marginBottom: '25px'
//           }}>
//             <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Step 5: Photos (Optional)</h3>
            
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={(e) => handlePhotoUpload(Array.from(e.target.files))}
//               style={{ display: 'none' }}
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               style={{
//                 width: '100%',
//                 padding: '12px',
//                 backgroundColor: '#4caf50',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 fontSize: '14px',
//                 cursor: 'pointer',
//                 marginBottom: '15px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '8px'
//               }}
//             >
//               📸 Upload Breakdown Photos
//             </button>
            
//             {formData.photos.length > 0 && (
//               <div style={{ 
//                 backgroundColor: '#e8f5e9', 
//                 padding: '15px', 
//                 borderRadius: '8px',
//                 border: '1px solid #4caf50'
//               }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//                   <strong style={{ color: '#1b5e20' }}>Uploaded Photos ({formData.photos.length}):</strong>
//                   <button 
//                     onClick={() => handleInputChange('photos', [])}
//                     style={{ 
//                       padding: '5px 10px',
//                       backgroundColor: '#d32f2f',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer',
//                       fontSize: '12px'
//                     }}
//                   >
//                     Clear All
//                   </button>
//                 </div>
//                 <div style={{ 
//                   display: 'grid', 
//                   gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
//                   gap: '10px',
//                   maxHeight: '200px',
//                   overflowY: 'auto'
//                 }}>
//                   {formData.photos.map((photo, index) => (
//                     <div key={index} style={{ position: 'relative' }}>
//                       <img 
//                         src={photo.base64Data} 
//                         alt={`Breakdown ${index + 1}`}
//                         style={{
//                           width: '100%',
//                           height: '100px',
//                           objectFit: 'cover',
//                           borderRadius: '6px',
//                           border: '1px solid #ddd'
//                         }}
//                       />
//                       <div style={{ 
//                         position: 'absolute', 
//                         top: '5px', 
//                         right: '5px',
//                         backgroundColor: 'rgba(0,0,0,0.7)',
//                         color: 'white',
//                         fontSize: '10px',
//                         padding: '2px 6px',
//                         borderRadius: '4px'
//                       }}>
//                         {index + 1}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Step 6: Signature & Submission */}
//           <div style={{ 
//             backgroundColor: '#f8f9fa', 
//             padding: '20px', 
//             borderRadius: '10px',
//             marginBottom: '25px'
//           }}>
//             <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Step 6: Acknowledgement & Signature *</h3>
            
//             <div style={{ 
//               backgroundColor: 'white', 
//               padding: '20px',
//               borderRadius: '8px',
//               border: '1px solid #ddd',
//               marginBottom: '15px'
//             }}>
//               <div style={{ marginBottom: '15px' }}>
//                 <p style={{ color: '#666', margin: '0 0 10px 0' }}>
//                   I hereby acknowledge that:
//                 </p>
//                 <ul style={{ color: '#666', margin: '0 0 15px 0', paddingLeft: '20px' }}>
//                   <li>The information provided is accurate and complete</li>
//                   <li>All safety protocols have been followed</li>
//                   <li>The breakdown has been reported to the relevant supervisor</li>
//                   <li>The equipment has been properly isolated if required</li>
//                 </ul>
//               </div>
              
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div>
//                   <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>Signature Required</div>
//                   <div style={{ fontSize: '13px', color: '#666' }}>
//                     {formData.signature ? '✅ Signature provided' : '✍️ Please provide your signature'}
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => setShowSignaturePad(true)}
//                   style={{ 
//                     padding: '10px 20px',
//                     backgroundColor: formData.signature ? '#4caf50' : '#1b5e20',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '6px',
//                     cursor: 'pointer',
//                     fontSize: '14px',
//                     fontWeight: '500',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '8px'
//                   }}
//                 >
//                   {formData.signature ? '✍️ Update Signature' : '✍️ Provide Signature'}
//                 </button>
//               </div>
              
//               {formData.signature && (
//                 <div style={{ 
//                   marginTop: '15px', 
//                   paddingTop: '15px', 
//                   borderTop: '1px solid #eee',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '15px'
//                 }}>
//                   <div style={{ fontSize: '12px', color: '#666' }}>Signature Preview:</div>
//                   <img 
//                     src={formData.signature} 
//                     alt="Signature" 
//                     style={{ 
//                       height: '50px',
//                       backgroundColor: 'white',
//                       border: '1px solid #ccc',
//                       borderRadius: '4px'
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
            
//             <div style={{ 
//               display: 'flex', 
//               gap: '15px',
//               paddingTop: '15px',
//               borderTop: '1px solid #ddd'
//             }}>
//               <button 
//                 onClick={handleSubmit}
//                 disabled={submitting}
//                 style={{ 
//                   flex: 1,
//                   padding: '15px 20px', 
//                   backgroundColor: submitting ? '#ccc' : '#d32f2f', 
//                   color: 'white', 
//                   border: 'none',
//                   borderRadius: '8px', 
//                   cursor: submitting ? 'not-allowed' : 'pointer',
//                   fontSize: '16px',
//                   fontWeight: '600',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '10px'
//                 }}
//               >
//                 {submitting ? 'Submitting...' : '🚨 Submit Breakdown Report'}
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : activeView === 'history' ? (
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '30px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           marginBottom: '30px'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//             <h2 style={{ margin: 0, color: '#1976d2' }}>
//               📋 Breakdown Report History
//             </h2>
//             <button 
//               onClick={() => setActiveView('new')}
//               style={{ 
//                 padding: '10px 20px',
//                 backgroundColor: '#d32f2f',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}
//             >
//               🚨 New Report
//             </button>
//           </div>
          
//           {isLoading ? (
//             <div style={{ textAlign: 'center', padding: '40px' }}>
//               <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
//               <h3 style={{ color: '#666' }}>Loading Reports...</h3>
//             </div>
//           ) : reports.length === 0 ? (
//             <div style={{ textAlign: 'center', padding: '40px' }}>
//               <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
//               <h3 style={{ color: '#666' }}>No Breakdown Reports Found</h3>
//               <p style={{ color: '#666' }}>Submit your first breakdown report using the "New Report" button</p>
//             </div>
//           ) : (
//             <div style={{ overflowX: 'auto' }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
//                 <thead>
//                   <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
//                     <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Date</th>
//                     <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Plant #</th>
//                     <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Reason</th>
//                     <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Severity</th>
//                     <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Downtime</th>
//                     <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
//                     <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reports.map((report) => (
//                     <tr 
//                       key={report.reportId} 
//                       style={{ 
//                         borderBottom: '1px solid #eee',
//                         cursor: 'pointer',
//                         transition: 'background-color 0.2s'
//                       }}
//                       onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
//                       onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
//                     >
//                       <td style={{ padding: '15px', color: '#666' }}>
//                         {formatDate(report.timestamp)}
//                       </td>
//                       <td style={{ padding: '15px', fontWeight: '600', color: '#333' }}>
//                         {report.plantNumber}
//                       </td>
//                       <td style={{ padding: '15px', maxWidth: '300px' }}>
//                         <div style={{ fontWeight: '600', color: '#333' }}>
//                           {report.reason.substring(0, 50)}...
//                         </div>
//                         <div style={{ fontSize: '12px', color: '#666' }}>
//                           {report.category}
//                         </div>
//                       </td>
//                       <td style={{ padding: '15px' }}>
//                         <span style={{ 
//                           padding: '4px 10px',
//                           backgroundColor: getSeverityColor(report.severity) + '15',
//                           color: getSeverityColor(report.severity),
//                           borderRadius: '20px',
//                           fontSize: '12px',
//                           fontWeight: '600'
//                         }}>
//                           {report.severity}
//                         </span>
//                       </td>
//                       <td style={{ padding: '15px', color: '#666', fontWeight: '600' }}>
//                         {report.downtimeHours ? `${report.downtimeHours.toFixed(1)} hrs` : 'N/A'}
//                       </td>
//                       <td style={{ padding: '15px' }}>
//                         <span style={{ 
//                           padding: '4px 10px',
//                           backgroundColor: report.status === 'RESOLVED' ? '#4caf5015' : '#ff980015',
//                           color: report.status === 'RESOLVED' ? '#4caf50' : '#ff9800',
//                           borderRadius: '20px',
//                           fontSize: '12px',
//                           fontWeight: '600'
//                         }}>
//                           {report.status}
//                         </span>
//                       </td>
//                       <td style={{ padding: '15px' }}>
//                         <button 
//                           onClick={() => handleViewReport(report)}
//                           style={{ 
//                             padding: '6px 12px',
//                             backgroundColor: '#1976d2',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '4px',
//                             cursor: 'pointer',
//                             fontSize: '12px'
//                           }}
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       ) : (
//         // Report Details View
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '30px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//           marginBottom: '30px'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//             <h2 style={{ margin: 0, color: '#333' }}>
//               📄 Breakdown Report Details
//             </h2>
//             <div style={{ display: 'flex', gap: '10px' }}>
//               <button 
//                 onClick={() => setActiveView('history')}
//                 style={{ 
//                   padding: '10px 20px',
//                   backgroundColor: '#f5f5f5',
//                   color: '#333',
//                   border: '1px solid #ddd',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   fontSize: '14px'
//                 }}
//               >
//                 ← Back to List
//               </button>
//               <button 
//                 onClick={() => setActiveView('new')}
//                 style={{ 
//                   padding: '10px 20px',
//                   backgroundColor: '#d32f2f',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   fontSize: '14px'
//                 }}
//               >
//                 🚨 New Report
//               </button>
//             </div>
//           </div>
          
//           {selectedReport ? (
//             <div>
//               {/* Report Header */}
//               <div style={{ 
//                 backgroundColor: '#f8f9fa', 
//                 padding: '25px', 
//                 borderRadius: '10px',
//                 marginBottom: '25px'
//               }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
//                   <div>
//                     <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Report ID</div>
//                     <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
//                       #{selectedReport.reportId?.toString().substring(0, 8)}
//                     </div>
//                   </div>
//                   <div style={{ 
//                     padding: '8px 16px',
//                     backgroundColor: selectedReport.status === 'RESOLVED' ? '#4caf5015' : '#ff980015',
//                     color: selectedReport.status === 'RESOLVED' ? '#4caf50' : '#ff9800',
//                     borderRadius: '20px',
//                     fontSize: '14px',
//                     fontWeight: '600'
//                   }}>
//                     {selectedReport.status}
//                   </div>
//                 </div>
                
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
//                   <div>
//                     <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Plant Number</div>
//                     <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
//                       {selectedReport.plantNumber}
//                     </div>
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Reported Date</div>
//                     <div style={{ fontSize: '16px', color: '#333' }}>
//                       {formatDate(selectedReport.timestamp)}
//                     </div>
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Reported By</div>
//                     <div style={{ fontSize: '16px', color: '#333' }}>
//                       {selectedReport.reportedBy}
//                     </div>
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Severity</div>
//                     <div style={{ 
//                       padding: '4px 10px',
//                       backgroundColor: getSeverityColor(selectedReport.severity) + '15',
//                       color: getSeverityColor(selectedReport.severity),
//                       borderRadius: '20px',
//                       fontSize: '12px',
//                       fontWeight: '600',
//                       display: 'inline-block'
//                     }}>
//                       {selectedReport.severity}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Breakdown Details */}
//               <div style={{ 
//                 display: 'grid', 
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
//                 gap: '25px',
//                 marginBottom: '25px'
//               }}>
//                 {/* Left Column */}
//                 <div>
//                   <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Breakdown Details</h3>
                  
//                   <div style={{ marginBottom: '20px' }}>
//                     <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Reason</div>
//                     <div style={{ 
//                       backgroundColor: '#fff3e0', 
//                       padding: '15px', 
//                       borderRadius: '8px',
//                       fontSize: '16px',
//                       fontWeight: '600',
//                       color: '#333'
//                     }}>
//                       {selectedReport.reason}
//                     </div>
//                   </div>
                  
//                   <div style={{ marginBottom: '20px' }}>
//                     <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Description</div>
//                     <div style={{ 
//                       backgroundColor: '#f8f9fa', 
//                       padding: '15px', 
//                       borderRadius: '8px',
//                       fontSize: '14px',
//                       color: '#333'
//                     }}>
//                       {selectedReport.description || 'No detailed description provided'}
//                     </div>
//                   </div>
                  
//                   <div style={{ marginBottom: '20px' }}>
//                     <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Category</div>
//                     <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
//                       {selectedReport.category}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column */}
//                 <div>
//                   <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Time & Downtime</h3>
                  
//                   <div style={{ 
//                     backgroundColor: '#e8f5e9', 
//                     padding: '20px', 
//                     borderRadius: '10px',
//                     marginBottom: '20px'
//                   }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//                       <div>
//                         <div style={{ fontSize: '14px', color: '#666' }}>Total Downtime</div>
//                         <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d32f2f' }}>
//                           {selectedReport.downtimeHours ? `${selectedReport.downtimeHours.toFixed(1)}` : '0'} hrs
//                         </div>
//                       </div>
//                       <div style={{ fontSize: '48px', color: '#d32f2f' }}>⏱️</div>
//                     </div>
                    
//                     <div style={{ 
//                       display: 'grid', 
//                       gridTemplateColumns: '1fr 1fr', 
//                       gap: '15px'
//                     }}>
//                       <div>
//                         <div style={{ fontSize: '12px', color: '#666' }}>Hours In</div>
//                         <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
//                           {selectedReport.hoursIn}
//                         </div>
//                       </div>
//                       <div>
//                         <div style={{ fontSize: '12px', color: '#666' }}>Hours Out</div>
//                         <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
//                           {selectedReport.hoursOut}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div style={{ marginBottom: '20px' }}>
//                     <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Breakdown Date</div>
//                     <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
//                       {selectedReport.breakdownDate}
//                     </div>
//                   </div>
                  
//                   <div style={{ marginBottom: '20px' }}>
//                     <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Department/Location</div>
//                     <div style={{ fontSize: '16px', color: '#333' }}>
//                       {selectedReport.department || 'Not specified'} / {selectedReport.location || 'Not specified'}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Safety Checks */}
//               <div style={{ 
//                 backgroundColor: '#f0f7ff', 
//                 padding: '20px', 
//                 borderRadius: '10px',
//                 marginBottom: '25px'
//               }}>
//                 <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Safety & Actions</h3>
                
//                 <div style={{ 
//                   display: 'grid', 
//                   gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//                   gap: '15px'
//                 }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                     <div style={{ 
//                       width: '20px', 
//                       height: '20px', 
//                       borderRadius: '50%',
//                       backgroundColor: selectedReport.supervisorNotified ? '#4caf50' : '#ff9800',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       color: 'white',
//                       fontSize: '12px'
//                     }}>
//                       {selectedReport.supervisorNotified ? '✓' : '✗'}
//                     </div>
//                     <span style={{ color: '#333' }}>Supervisor Notified</span>
//                   </div>
                  
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                     <div style={{ 
//                       width: '20px', 
//                       height: '20px', 
//                       borderRadius: '50%',
//                       backgroundColor: selectedReport.machineStopped ? '#4caf50' : '#ff9800',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       color: 'white',
//                       fontSize: '12px'
//                     }}>
//                       {selectedReport.machineStopped ? '✓' : '✗'}
//                     </div>
//                     <span style={{ color: '#333' }}>Machine Stopped</span>
//                   </div>
                  
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                     <div style={{ 
//                       width: '20px', 
//                       height: '20px', 
//                       borderRadius: '50%',
//                       backgroundColor: selectedReport.safetyChecked ? '#4caf50' : '#ff9800',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       color: 'white',
//                       fontSize: '12px'
//                     }}>
//                       {selectedReport.safetyChecked ? '✓' : '✗'}
//                     </div>
//                     <span style={{ color: '#333' }}>Safety Checked</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Photos */}
//               {(selectedReport.photos && selectedReport.photos.length > 0) && (
//                 <div style={{ marginBottom: '25px' }}>
//                   <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📷 Photos ({selectedReport.photos.length})</h3>
//                   <div style={{ 
//                     display: 'grid', 
//                     gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
//                     gap: '15px'
//                   }}>
//                     {selectedReport.photos.map((photo, index) => (
//                       <div key={index} style={{ position: 'relative' }}>
//                         <img 
//                           src={photo.base64Data} 
//                           alt={`Breakdown evidence ${index + 1}`}
//                           style={{
//                             width: '100%',
//                             height: '150px',
//                             objectFit: 'cover',
//                             borderRadius: '8px',
//                             border: '2px solid #ddd'
//                           }}
//                         />
//                         <div style={{ 
//                           position: 'absolute', 
//                           top: '5px', 
//                           right: '5px',
//                           backgroundColor: 'rgba(0,0,0,0.7)',
//                           color: 'white',
//                           fontSize: '10px',
//                           padding: '2px 6px',
//                           borderRadius: '4px'
//                         }}>
//                           {index + 1}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Signature */}
//               {selectedReport.signature && (
//                 <div style={{ 
//                   backgroundColor: '#f8f9fa', 
//                   padding: '20px', 
//                   borderRadius: '10px'
//                 }}>
//                   <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Signature</h3>
//                   <div style={{ 
//                     backgroundColor: 'white', 
//                     padding: '20px',
//                     borderRadius: '8px',
//                     border: '1px solid #ddd',
//                     display: 'inline-block'
//                   }}>
//                     <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Operator Acknowledgement</div>
//                     <img 
//                       src={selectedReport.signature} 
//                       alt="Operator signature" 
//                       style={{ 
//                         height: '60px',
//                         backgroundColor: 'white',
//                         border: '1px solid #ccc',
//                         borderRadius: '4px'
//                       }}
//                     />
//                     <div style={{ fontSize: '14px', color: '#333', marginTop: '10px' }}>
//                       Signed by: <strong>{selectedReport.reportedBy}</strong>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div style={{ textAlign: 'center', padding: '40px' }}>
//               <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
//               <h3 style={{ color: '#666' }}>Report details not found</h3>
//             </div>
//           )}
//         </div>
//       )}

//       {/* QR Scanner Modal */}
//       {showQRScanner && (
//         <QRScannerModal
//           onScan={handleQRScan}
//           onClose={() => setShowQRScanner(false)}
//         />
//       )}

//       {/* Signature Pad Modal */}
//       {showSignaturePad && (
//         <SignaturePad
//           onSave={handleSignatureSave}
//           onClose={() => setShowSignaturePad(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default BreakdownReportComponent;

import React, { useState, useEffect, useRef } from 'react';
import { plantMasterList } from './plantMasterList';
// Add this import at the top
import jsQR from 'jsqr';

// ==================== WEB CAMERA TEST COMPONENT ====================
const WebcamTest = ({ onClose }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const initCamera = async () => {
      try {
        console.log('Testing camera access...');
        
        const constraintsList = [
          { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
          { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } },
          { video: true }
        ];
        
        let stream = null;
        let lastError = null;
        
        for (const constraint of constraintsList) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraint);
            console.log('Camera access granted with constraint:', constraint);
            break;
          } catch (err) {
            lastError = err;
            console.log('Constraint failed:', constraint, err);
          }
        }
        
        if (!stream) {
          throw lastError || new Error('No camera available');
        }
        
        if (videoRef.current) {
          console.log('Setting video stream...');
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
          
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(playErr => {
              console.log('Auto-play prevented, trying alternative...');
            });
          }
        }
        
      } catch (err) {
        console.error('Camera test error:', err);
        setError(`Camera error: ${err.name} - ${err.message}`);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
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
      zIndex: 2000,
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
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1976d2' }}>🎥 Camera Test</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '28px', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>
        
        {error ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', color: '#ff6b6b' }}>📵</div>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>Camera Error</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '14px'
            }}>
              <p><strong>To fix:</strong></p>
              <ol style={{ paddingLeft: '20px', margin: '10px 0' }}>
                <li>Allow camera permissions when prompted</li>
                <li>Ensure no other app is using the camera</li>
                <li>Refresh the page and try again</li>
                <li>Check browser settings for camera access</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            <div style={{ 
              width: '100%', 
              height: '400px',
              backgroundColor: '#000',
              borderRadius: '8px',
              marginBottom: '20px',
              overflow: 'hidden'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
              />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                If you can see yourself above, your camera is working correctly!
              </p>
              <button 
                onClick={onClose}
                style={{ 
                  padding: '12px 30px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                ✅ Camera Working - Close Test
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== ENHANCED QR SCANNER WITH REAL DETECTION ====================
const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Start camera
  const startCamera = async () => {
    try {
      console.log('QRScanner: Starting camera...');
      setError('');
      setCameraActive(false);

      // Clean up any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Get camera stream
      let cameraStream = null;
      const constraintsList = [
        { 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        },
        { 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        },
        { video: true }
      ];
      
      for (const constraint of constraintsList) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('QRScanner: Got stream with constraint:', constraint);
          break;
        } catch (err) {
          console.log('QRScanner: Constraint failed:', constraint, err);
        }
      }
      
      if (!cameraStream) {
        throw new Error('Could not access any camera');
      }
      
      setStream(cameraStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        // Wait for video to be ready
        videoRef.current.onloadeddata = () => {
          videoRef.current.play().then(() => {
            setCameraActive(true);
            console.log('QRScanner: Camera active and playing');
            startQRDetection();
          }).catch(playErr => {
            console.error('QRScanner: Play error:', playErr);
            setError('Failed to start camera video');
          });
        };
      }
      
    } catch (err) {
      console.error('QRScanner: Camera error:', err);
      setError(`Camera error: ${err.name || 'Unknown error'}`);
      setCameraActive(false);
    }
  };

  // QR Code Detection
  const startQRDetection = () => {
    let animationFrameId;
    
    const detectQR = () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        animationFrameId = requestAnimationFrame(detectQR);
        return;
      }
      
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for QR detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Detect QR code using jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code && code.data) {
          console.log('QR Code detected:', code.data);
          
          // Process the scanned data
          processScannedData(code.data);
          return;
        }
      } catch (err) {
        console.error('QR detection error:', err);
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

  // Process the scanned data
  const processScannedData = (scannedData) => {
    console.log('Processing scanned data:', scannedData);
    
    if (!scannedData) {
      setError('No data found in QR code');
      return;
    }
    
    let plantNumber = '';
    let plantInfo = null;

    try {
      // Try to parse as JSON
      const parsedData = JSON.parse(scannedData);
      console.log('Parsed as JSON:', parsedData);
      
      plantNumber = parsedData.plantNumber || parsedData.id || parsedData.number || scannedData;
      
      if (plantMasterList[plantNumber]) {
        plantInfo = plantMasterList[plantNumber];
      } else {
        plantInfo = {
          name: parsedData.plantName || parsedData.name || plantNumber,
          type: parsedData.plantType || parsedData.type || 'Equipment',
          fuelType: parsedData.fuelType || 'Diesel',
          category: parsedData.category || 'general'
        };
      }
    } catch (error) {
      // Not JSON, treat as plain plant number
      console.log('Not JSON, treating as plant number:', scannedData);
      plantNumber = scannedData;
      
      if (plantMasterList[plantNumber]) {
        plantInfo = plantMasterList[plantNumber];
      } else {
        // Try case-insensitive match
        const foundKey = Object.keys(plantMasterList).find(key => 
          key.toLowerCase() === plantNumber.toLowerCase()
        );
        if (foundKey) {
          plantNumber = foundKey;
          plantInfo = plantMasterList[foundKey];
        } else {
          plantInfo = {
            name: plantNumber,
            type: 'Unknown Equipment',
            fuelType: 'Diesel',
            category: 'general'
          };
        }
      }
    }

    if (plantNumber && plantInfo) {
      console.log('Successfully processed:', plantNumber, plantInfo);
      setScannedData({ plantNumber, plantInfo });
      setScanning(false);
      setError('');
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Auto-accept after 2 seconds
      setTimeout(() => {
        onScan(plantNumber);
        onClose();
      }, 2000);
    } else {
      setError('Could not identify plant from scanned data');
    }
  };

  useEffect(() => {
    if (scanning) {
      startCamera();
    }

    return () => {
      if (stream) {
        console.log('QRScanner: Cleaning up stream');
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [scanning]);

  // Manual input handler
  const handleManualInput = () => {
    const manualInput = prompt('Enter plant number manually (e.g., A-APB05):');
    if (manualInput && manualInput.trim()) {
      processScannedData(manualInput.trim().toUpperCase());
    }
  };

  // Demo scan handler
  const handleDemoScan = () => {
    const demoPlants = ['A-APB05', 'A-APD06', 'A-EXK38', 'A-THS10', 'A-BTH100'];
    const randomPlant = demoPlants[Math.floor(Math.random() * demoPlants.length)];
    processScannedData(randomPlant);
  };

  // Quick select handler
  const handleQuickSelect = (plantNumber) => {
    processScannedData(plantNumber);
  };

  const handleRescan = () => {
    setScannedData(null);
    setScanning(true);
    setError('');
    setCameraActive(false);
  };

  const handleRetryCamera = () => {
    setError('');
    setCameraActive(false);
    setScanning(false);
    setTimeout(() => setScanning(true), 100);
  };

  // Get actual plant numbers for quick select
  const actualPlantNumbers = Object.keys(plantMasterList).filter(key => 
    key.includes('-') && /^[A-Z]-\w+/.test(key)
  );

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
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20' }}>📱 Scan Plant QR Code</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '28px', 
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
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #ef9a9a',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {!scannedData ? (
          <>
            <div style={{ 
              width: '100%', 
              height: '300px',
              backgroundColor: '#000',
              borderRadius: '8px',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
              />
              
              {!cameraActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }}>
                  <div style={{ 
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #4caf50',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                  }} />
                  <div>Starting camera...</div>
                </div>
              )}
              
              {cameraActive && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '250px',
                  height: '250px',
                  border: '3px solid #4caf50',
                  borderRadius: '8px',
                  animation: 'pulse 2s infinite',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: '#4caf50',
                    animation: 'scan 2s linear infinite',
                    boxShadow: '0 0 10px #4caf50'
                  }} />
                </div>
              )}
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                {cameraActive 
                  ? 'Position QR code within frame' 
                  : 'Camera not available - Use manual input'}
              </p>
            </div>

            {/* Quick Plant Selector */}
            {actualPlantNumbers.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Or select from common plants:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {actualPlantNumbers.slice(0, 6).map((plant, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSelect(plant)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e8f5e8',
                        color: '#1b5e20',
                        border: '1px solid #4caf50',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {plant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleManualInput}
                style={{ 
                  flex: 1,
                  padding: '14px 20px', 
                  backgroundColor: '#757575', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ⌨️ Manual Input
              </button>
              
              <button 
                onClick={handleDemoScan}
                style={{ 
                  flex: 1,
                  padding: '14px 20px', 
                  backgroundColor: '#1b5e20', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🎯 Demo Scan
              </button>
            </div>
            
            {/* Hidden canvas for QR processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        ) : (
          <>
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '25px', 
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '2px solid #4caf50'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '15px', color: '#4caf50' }}>✅</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1b5e20', marginBottom: '15px' }}>
                PLANT SCANNED SUCCESSFULLY
              </div>
              
              <div style={{ 
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '6px',
                marginBottom: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1b5e20', marginBottom: '8px' }}>
                  {scannedData.plantNumber}
                </div>
                <div style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>
                  {scannedData.plantInfo.name}
                </div>
                <div style={{ fontSize: '16px', color: '#666', marginBottom: '4px' }}>
                  Type: {scannedData.plantInfo.type}
                </div>
                <div style={{ fontSize: '14px', color: '#757575' }}>
                  Fuel: {scannedData.plantInfo.fuelType || 'N/A'}
                </div>
              </div>
              
              <div style={{ 
                fontSize: '14px', 
                color: '#666', 
                fontStyle: 'italic',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: '8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                Auto-accepting in 2 seconds...
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleRescan}
                style={{ 
                  flex: 1,
                  padding: '14px 20px', 
                  backgroundColor: '#757575', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔄 Rescan
              </button>
              
              <button 
                onClick={() => {
                  onScan(scannedData.plantNumber);
                  onClose();
                }}
                style={{ 
                  flex: 1,
                  padding: '14px 20px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ✅ Accept Now
              </button>
            </div>
          </>
        )}
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 247px; }
          100% { top: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { border-color: #4caf50; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); }
          50% { border-color: #81c784; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ==================== SIGNATURE PAD COMPONENT ====================
const SignaturePadModal = ({ onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    e.preventDefault();
    if (!context) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !context) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!context || !canvasRef.current) return;
    const canvas = canvasRef.current;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
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
          <h3 style={{ margin: 0, color: '#333' }}>✍️ Sign Here</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '28px', 
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
            Please sign in the box below using your mouse or touch
          </p>
        </div>
        
        <div style={{
          width: '100%',
          height: '200px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#fff'
        }}>
          <canvas
            ref={canvasRef}
            width={560}
            height={200}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '6px',
              cursor: 'crosshair'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} };
              startDrawing(fakeEvent);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} };
              draw(fakeEvent);
            }}
            onTouchEnd={stopDrawing}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={clearSignature}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🗑️ Clear
          </button>
          
          <button 
            onClick={saveSignature}
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              backgroundColor: '#4caf50', 
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
      </div>
    </div>
  );
};

// ==================== MAIN MACHINE LOG BOOK COMPONENT ====================
const MachineLogBook = ({ user, onBack }) => {
  const [activeView, setActiveView] = useState('new');
  const [logEntries, setLogEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterPlant, setFilterPlant] = useState('');
  
  const [formData, setFormData] = useState({
    plantNumber: '',
    plantName: '',
    plantType: '',
    logDate: new Date().toISOString().split('T')[0],
    hoursIn: '',
    hoursOut: '',
    reason: '',
    reportedBy: user?.fullName || 'Operator',
    signature: null,
    acknowledged: false
  });
  
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showWebcamTest, setShowWebcamTest] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [commonReasons] = useState([
    'Mechanical failure',
    'Electrical fault',
    'Hydraulic issue',
    'Pneumatic problem',
    'Lubrication needed',
    'Scheduled maintenance',
    'Operator training',
    'Safety inspection',
    'Cleaning required',
    'Calibration needed',
    'Waiting for parts',
    'Software update',
    'Fuel system issue',
    'Cooling system problem'
  ]);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (formData.plantNumber && plantMasterList[formData.plantNumber]) {
      const plantData = plantMasterList[formData.plantNumber];
      setFormData(prev => ({
        ...prev,
        plantName: plantData.name,
        plantType: plantData.type
      }));
    } else if (formData.plantNumber === '') {
      setFormData(prev => ({
        ...prev,
        plantName: '',
        plantType: ''
      }));
    }
  }, [formData.plantNumber]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const savedLogs = localStorage.getItem('machine_log_entries');
      const allLogs = savedLogs ? JSON.parse(savedLogs) : [];
      setLogEntries(allLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
      setError('Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };

  // ENHANCED QR SCAN HANDLER
  const handleQRScan = (scannedPlantNumber) => {
    if (!scannedPlantNumber) {
      setError('No plant number scanned');
      return;
    }

    let plantNumber = scannedPlantNumber.toString().trim().toUpperCase();
    let plantInfo = null;

    // Try to find the plant in master list
    if (plantMasterList[plantNumber]) {
      plantInfo = plantMasterList[plantNumber];
    } else {
      // Try case-insensitive match
      const foundKey = Object.keys(plantMasterList).find(key => 
        key.toLowerCase() === plantNumber.toLowerCase()
      );
      if (foundKey) {
        plantNumber = foundKey;
        plantInfo = plantMasterList[foundKey];
      } else {
        // Try partial match
        const partialMatch = Object.keys(plantMasterList).find(key => 
          key.includes(plantNumber) || plantNumber.includes(key)
        );
        if (partialMatch) {
          if (window.confirm(`Did you mean "${partialMatch}"?`)) {
            plantNumber = partialMatch;
            plantInfo = plantMasterList[partialMatch];
          } else {
            setError(`Plant "${plantNumber}" not found.`);
            return;
          }
        } else {
          // Create default entry
          plantInfo = {
            name: plantNumber,
            type: 'Unknown Equipment',
            fuelType: 'Diesel',
            category: 'general'
          };
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      plantNumber: plantNumber,
      plantName: plantInfo.name,
      plantType: plantInfo.type,
      acknowledged: false
    }));

    setShowQRScanner(false);
    setSuccessMessage(`✅ Plant scanned: ${plantNumber} - ${plantInfo.name}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignatureSave = (signatureData) => {
    setFormData(prev => ({
      ...prev,
      signature: signatureData
    }));
    setShowSignaturePad(false);
  };

  const validateForm = () => {
    if (!formData.plantNumber) return 'Please scan or select a plant number';
    if (!formData.logDate) return 'Please select a date';
    if (!formData.hoursIn) return 'Please enter hours in';
    if (!formData.hoursOut) return 'Please enter hours out';
    if (parseFloat(formData.hoursOut) <= parseFloat(formData.hoursIn)) {
      return 'Hours out must be greater than hours in';
    }
    if (!formData.reason) return 'Please enter a reason';
    if (!formData.signature) return 'Please provide your signature';
    if (!formData.acknowledged) return 'Please acknowledge that the information is correct';
    return '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const hoursIn = parseFloat(formData.hoursIn);
      const hoursOut = parseFloat(formData.hoursOut);
      const downtimeHours = hoursOut - hoursIn;
      
      const logData = {
        ...formData,
        downtimeHours: downtimeHours.toFixed(2),
        reportedBy: user?.fullName || 'Operator',
        userId: user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        logId: Date.now(),
        status: 'submitted'
      };
      
      const savedLogs = localStorage.getItem('machine_log_entries');
      const allLogs = savedLogs ? JSON.parse(savedLogs) : [];
      allLogs.unshift(logData);
      localStorage.setItem('machine_log_entries', JSON.stringify(allLogs));
      
      setFormData({
        plantNumber: '',
        plantName: '',
        plantType: '',
        logDate: new Date().toISOString().split('T')[0],
        hoursIn: '',
        hoursOut: '',
        reason: '',
        reportedBy: user?.fullName || 'Operator',
        signature: null,
        acknowledged: false
      });
      
      await loadLogs();
      setSuccessMessage('✅ Log entry submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setActiveView('history');
      
    } catch (error) {
      console.error('Error submitting log:', error);
      setError(`Failed to submit log: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = (logId) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      const updatedLogs = logEntries.filter(log => log.logId !== logId);
      localStorage.setItem('machine_log_entries', JSON.stringify(updatedLogs));
      setLogEntries(updatedLogs);
      setSuccessMessage('✅ Log entry deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const filteredLogs = logEntries.filter(log => {
    const matchesDate = !filterDate || log.logDate === filterDate;
    const matchesPlant = !filterPlant || 
      log.plantNumber.toLowerCase().includes(filterPlant.toLowerCase()) ||
      log.plantName.toLowerCase().includes(filterPlant.toLowerCase());
    return matchesDate && matchesPlant;
  });

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            color: '#1976d2',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            🏭 Machine Log Book
          </h1>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Operator: <strong>{user?.fullName || 'Not logged in'}</strong> | 
            Date: {new Date().toLocaleDateString()}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={onBack}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '25px',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => setActiveView('new')}
          style={{ 
            flex: 1,
            padding: '15px 20px',
            backgroundColor: activeView === 'new' ? '#1976d2' : 'transparent',
            color: activeView === 'new' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          📝 New Log Entry
        </button>
        <button 
          onClick={() => {
            setActiveView('history');
            loadLogs();
          }}
          style={{ 
            flex: 1,
            padding: '15px 20px',
            backgroundColor: activeView === 'history' ? '#1976d2' : 'transparent',
            color: activeView === 'history' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          📋 View History
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ef9a9a',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          backgroundColor: '#e8f5e8',
          color: '#1b5e20',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #a5d6a7',
          fontSize: '14px'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Main Content */}
      {activeView === 'new' ? (
        <div style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            margin: '0 0 30px 0', 
            color: '#1976d2',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            📝 New Log Entry
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Plant Selection */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '15px'
              }}>
                Plant Number *
              </label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  value={formData.plantNumber}
                  onChange={(e) => handleInputChange('plantNumber', e.target.value)}
                  placeholder="Scan or enter plant number (e.g., A-APB05)"
                  style={{ 
                    flex: 1, 
                    padding: '14px', 
                    border: formData.plantNumber ? '2px solid #4caf50' : '1px solid #ddd', 
                    borderRadius: '8px', 
                    fontSize: '15px'
                  }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowQRScanner(true)}
                  style={{ 
                    padding: '14px 24px',
                    backgroundColor: '#1b5e20',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    minWidth: '120px'
                  }}
                >
                  📱 Scan QR
                </button>
              </div>
              
              {formData.plantNumber && !formData.plantName && (
                <div style={{ 
                  backgroundColor: '#fff3e0',
                  padding: '10px',
                  borderRadius: '6px',
                  marginTop: '10px',
                  fontSize: '14px',
                  color: '#f57c00'
                }}>
                  ⚠️ Plant not found in database. You can still proceed with manual entry.
                </div>
              )}
              
              {formData.plantName && (
                <div style={{ 
                  marginTop: '15px',
                  padding: '20px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '8px',
                  borderLeft: '4px solid #4caf50'
                }}>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Plant Number</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1b5e20' }}>{formData.plantNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Plant Name</div>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{formData.plantName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Type</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{formData.plantType}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date and Hours */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.logDate}
                  onChange={(e) => handleInputChange('logDate', e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '6px', 
                    fontSize: '14px' 
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  Hours In *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hoursIn}
                  onChange={(e) => handleInputChange('hoursIn', e.target.value)}
                  placeholder="e.g., 1250.5"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '6px', 
                    fontSize: '14px' 
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  Hours Out *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hoursOut}
                  onChange={(e) => handleInputChange('hoursOut', e.target.value)}
                  placeholder="e.g., 1251.0"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '6px', 
                    fontSize: '14px' 
                  }}
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
                Reason for Downtime *
              </label>
              <div style={{ marginBottom: '10px' }}>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Describe the reason for downtime..."
                  rows="4"
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                  required
                />
              </div>
              
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                Common reasons:
              </div>
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '15px'
              }}>
                {commonReasons.map((reason, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleInputChange('reason', reason)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Acknowledgment Section */}
            <div style={{ 
              backgroundColor: '#fff8e1', 
              padding: '25px', 
              borderRadius: '10px',
              marginBottom: '25px',
              border: '2px solid #ffb300'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#ffb300',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>Operator Acknowledgment *</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Confirm that all information is accurate before submission
                  </div>
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ffcc80'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.acknowledged}
                    onChange={(e) => handleInputChange('acknowledged', e.target.checked)}
                    style={{ 
                      width: '22px', 
                      height: '22px',
                      marginTop: '3px',
                      accentColor: '#ff9800'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '15px', marginBottom: '10px' }}>
                      ✅ I confirm that all information entered is correct and accurate
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                      • I have verified the plant number matches the equipment<br/>
                      • Hours readings are accurate and verified<br/>
                      • Reason for downtime is correctly recorded<br/>
                      • Date and time are correct<br/>
                      • All details have been double-checked
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Signature Section */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '25px', 
              borderRadius: '10px',
              marginBottom: '30px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#333', fontSize: '16px', marginBottom: '5px' }}>
                    Operator Signature *
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {formData.signature ? '✅ Signature provided' : '✍️ Required for submission'}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowSignaturePad(true)}
                  style={{ 
                    padding: '12px 24px',
                    backgroundColor: formData.signature ? '#4caf50' : '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    minWidth: '120px'
                  }}
                >
                  {formData.signature ? 'Update Signature' : 'Add Signature'}
                </button>
              </div>
              
              {formData.signature && (
                <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    Your signature:
                  </div>
                  <img 
                    src={formData.signature} 
                    alt="Signature" 
                    style={{ 
                      height: '80px',
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={submitting}
              style={{ 
                width: '100%',
                padding: '18px 20px', 
                backgroundColor: submitting ? '#ccc' : '#1976d2', 
                color: 'white', 
                border: 'none',
                borderRadius: '8px', 
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {submitting ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '10px' }}>
                    ⏳
                  </span>
                  Submitting...
                </>
              ) : '📝 Submit Log Entry'}
            </button>
          </form>
        </div>
      ) : (
        /* History View */
        <div style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            margin: '0 0 30px 0', 
            color: '#1976d2',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            📋 Log History
          </h2>
          
          {/* Filters */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px', 
                  fontSize: '14px' 
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                Filter by Plant
              </label>
              <input
                type="text"
                value={filterPlant}
                onChange={(e) => setFilterPlant(e.target.value)}
                placeholder="Plant number or name..."
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px', 
                  fontSize: '14px' 
                }}
              />
            </div>
            
            <button 
              onClick={() => {
                setFilterDate('');
                setFilterPlant('');
              }}
              style={{ 
                padding: '12px 20px',
                backgroundColor: '#757575',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                alignSelf: 'flex-end'
              }}
            >
              Clear Filters
            </button>
          </div>
          
          {/* Logs Table */}
          {isLoading ? (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              color: '#666',
              fontSize: '16px'
            }}>
              <div style={{ 
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }} />
              Loading logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              color: '#666',
              fontSize: '16px'
            }}>
              📭 No log entries found
              {filterDate || filterPlant ? ' with current filters' : ''}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#f5f5f5',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>Date</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>Plant</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>Hours</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>Downtime (hrs)</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>Reason</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>Reported By</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={log.logId} style={{ 
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                    }}>
                      <td style={{ padding: '15px', fontSize: '14px' }}>
                        <div style={{ fontWeight: '500', color: '#333' }}>
                          {new Date(log.logDate).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>
                        <div style={{ fontWeight: '500', color: '#333' }}>{log.plantNumber}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{log.plantName}</div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>
                        <div>In: <strong>{log.hoursIn}</strong></div>
                        <div>Out: <strong>{log.hoursOut}</strong></div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>
                        <div style={{ 
                          backgroundColor: '#e8f5e8',
                          color: '#1b5e20',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {log.downtimeHours}
                        </div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px', maxWidth: '250px' }}>
                        <div style={{ 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedLog(log)}
                        title={log.reason}
                        >
                          {log.reason}
                        </div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>
                        <div>{log.reportedBy}</div>
                        {log.signature && (
                          <div style={{ fontSize: '12px', color: '#4caf50', marginTop: '5px' }}>
                            ✅ Signed
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setSelectedLog(log)}
                            style={{ 
                              padding: '6px 12px',
                              backgroundColor: '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDeleteLog(log.logId)}
                            style={{ 
                              padding: '6px 12px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Summary */}
          {filteredLogs.length > 0 && (
            <div style={{ 
              marginTop: '25px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666' }}>Total Entries</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                  {filteredLogs.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666' }}>Total Downtime</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>
                  {filteredLogs.reduce((sum, log) => sum + parseFloat(log.downtimeHours || 0), 0).toFixed(2)} hrs
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
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
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, color: '#1976d2', fontSize: '22px' }}>📋 Log Details</h3>
              <button 
                onClick={() => setSelectedLog(null)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '28px', 
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Plant Number</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{selectedLog.plantNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Plant Name</div>
                <div style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{selectedLog.plantName}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Date</div>
                <div style={{ fontSize: '16px', color: '#333' }}>{selectedLog.logDate}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Plant Type</div>
                <div style={{ fontSize: '16px', color: '#333' }}>{selectedLog.plantType}</div>
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
                Hours Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Hours In</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>{selectedLog.hoursIn}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Hours Out</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>{selectedLog.hoursOut}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Downtime</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1b5e20' }}>{selectedLog.downtimeHours} hrs</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Reason for Downtime</div>
              <div style={{ 
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '6px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {selectedLog.reason}
              </div>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Reported By</div>
                <div style={{ fontSize: '16px', color: '#333' }}>{selectedLog.reportedBy}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Submitted</div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            {selectedLog.signature && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>Operator Signature</div>
                <img 
                  src={selectedLog.signature} 
                  alt="Signature" 
                  style={{ 
                    maxWidth: '300px',
                    height: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '10px'
                  }}
                />
              </div>
            )}
            
            {selectedLog.acknowledged && (
              <div style={{ 
                backgroundColor: '#e8f5e8',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ fontSize: '20px', color: '#4caf50' }}>✅</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1b5e20' }}>Acknowledged</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Operator confirmed information accuracy</div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => {
                  handleDeleteLog(selectedLog.logId);
                  setSelectedLog(null);
                }}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Delete Log
              </button>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: '#757575',
                  color: 'white',
                  border: 'none',
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
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <SignaturePadModal
          onSave={handleSignatureSave}
          onClose={() => setShowSignaturePad(false)}
        />
      )}

      {/* Webcam Test Modal */}
      {showWebcamTest && (
        <WebcamTest onClose={() => setShowWebcamTest(false)} />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MachineLogBook;