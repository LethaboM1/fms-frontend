// ==================== INDEXEDDB PHOTO STORAGE ====================

const initPhotoDatabase = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PhotoStorageDatabase', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create photos store
      if (!db.objectStoreNames.contains('photos')) {
        const store = db.createObjectStore('photos', { keyPath: 'photoId', autoIncrement: true });
        store.createIndex('machineNumber', 'machineNumber', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('folderPath', 'folderPath', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
      }
      
      // Create thumbnails store for faster loading
      if (!db.objectStoreNames.contains('thumbnails')) {
        const thumbStore = db.createObjectStore('thumbnails', { keyPath: 'photoId', autoIncrement: false });
        thumbStore.createIndex('originalPhotoId', 'originalPhotoId', { unique: false });
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

// Save photo to database
export const savePhotoToDatabase = async (photoData) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');
      
      const photoWithDefaults = {
        ...photoData,
        photoId: photoData.photoId || Date.now() + Math.random(),
        timestamp: photoData.timestamp || new Date().toISOString(),
        uploadedAt: new Date().toISOString()
      };
      
      const request = store.add(photoWithDefaults);
      
      request.onsuccess = () => {
        const savedPhotoId = request.result;
        const savedPhoto = { ...photoWithDefaults, photoId: savedPhotoId };
        
        // Also create and save thumbnail
        createAndSaveThumbnail(savedPhoto);
        
        transaction.oncomplete = () => {
          db.close();
        };
        
        resolve(savedPhoto);
      };
      
      request.onerror = (event) => {
        console.error('Error saving photo:', event.target.error);
        reject(new Error('Failed to save photo'));
      };
    });
  } catch (error) {
    console.error('Database error in savePhotoToDatabase:', error);
    throw error;
  }
};

// Get all photos for a machine
export const getPhotosForMachine = async (machineNumber, options = {}) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const index = store.index('machineNumber');
      const request = index.getAll(machineNumber);
      
      request.onsuccess = () => {
        let photos = request.result;
        
        // Apply filters
        if (options.startDate) {
          photos = photos.filter(photo => new Date(photo.timestamp) >= new Date(options.startDate));
        }
        if (options.endDate) {
          photos = photos.filter(photo => new Date(photo.timestamp) <= new Date(options.endDate));
        }
        if (options.type) {
          photos = photos.filter(photo => photo.type === options.type);
        }
        
        // Sort by timestamp (newest first by default)
        const sortOrder = options.sortOrder || 'desc';
        photos.sort((a, b) => {
          return sortOrder === 'asc' 
            ? new Date(a.timestamp) - new Date(b.timestamp)
            : new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Apply limit if specified
        if (options.limit && options.limit > 0) {
          photos = photos.slice(0, options.limit);
        }
        
        transaction.oncomplete = () => {
          db.close();
        };
        
        resolve(photos);
      };
      
      request.onerror = (event) => {
        console.error('Error loading photos:', event.target.error);
        reject(new Error('Failed to load photos'));
      };
    });
  } catch (error) {
    console.error('Error in getPhotosForMachine:', error);
    return [];
  }
};

// Get all photos from database (with optional filters)
export const getAllPhotosFromDatabase = async (options = {}) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const request = store.getAll();
      
      request.onsuccess = () => {
        let photos = request.result;
        
        // Apply filters
        if (options.machineNumber) {
          photos = photos.filter(photo => photo.machineNumber === options.machineNumber);
        }
        if (options.startDate) {
          photos = photos.filter(photo => new Date(photo.timestamp) >= new Date(options.startDate));
        }
        if (options.endDate) {
          photos = photos.filter(photo => new Date(photo.timestamp) <= new Date(options.endDate));
        }
        if (options.type) {
          photos = photos.filter(photo => photo.type === options.type);
        }
        if (options.userId) {
          photos = photos.filter(photo => photo.userId === options.userId);
        }
        
        // Sort by timestamp (newest first by default)
        const sortOrder = options.sortOrder || 'desc';
        photos.sort((a, b) => {
          return sortOrder === 'asc' 
            ? new Date(a.timestamp) - new Date(b.timestamp)
            : new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Apply limit if specified
        if (options.limit && options.limit > 0) {
          photos = photos.slice(0, options.limit);
        }
        
        transaction.oncomplete = () => {
          db.close();
        };
        
        resolve(photos);
      };
      
      request.onerror = (event) => {
        console.error('Error loading all photos:', event.target.error);
        reject(new Error('Failed to load photos'));
      };
    });
  } catch (error) {
    console.error('Error in getAllPhotosFromDatabase:', error);
    return [];
  }
};

// Delete photo from database
export const deletePhotoFromDatabase = async (photoId) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos', 'thumbnails'], 'readwrite');
      const photosStore = transaction.objectStore('photos');
      const thumbnailsStore = transaction.objectStore('thumbnails');
      
      // Delete from photos store
      const deletePhotoRequest = photosStore.delete(photoId);
      
      // Also delete thumbnail if exists
      const deleteThumbnailRequest = thumbnailsStore.delete(photoId);
      
      transaction.oncomplete = () => {
        db.close();
        resolve(true);
      };
      
      transaction.onerror = (event) => {
        console.error('Error deleting photo:', event.target.error);
        reject(new Error('Failed to delete photo'));
      };
    });
  } catch (error) {
    console.error('Error in deletePhotoFromDatabase:', error);
    throw error;
  }
};

// Create and save thumbnail
const createAndSaveThumbnail = async (photoData) => {
  try {
    // Create thumbnail (150x150)
    const thumbnailData = await createThumbnail(photoData.base64Data, 150, 150);
    
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['thumbnails'], 'readwrite');
      const store = transaction.objectStore('thumbnails');
      
      const thumbnail = {
        photoId: photoData.photoId,
        originalPhotoId: photoData.photoId,
        base64Data: thumbnailData,
        timestamp: photoData.timestamp,
        machineNumber: photoData.machineNumber,
        filename: `thumb_${photoData.filename}`
      };
      
      const request = store.add(thumbnail);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error saving thumbnail:', event.target.error);
        reject(new Error('Failed to save thumbnail'));
      };
    });
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    // Don't throw error for thumbnail creation failure
  }
};

// Create thumbnail from base64 image
const createThumbnail = (base64Image, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    
    img.onerror = reject;
    img.src = base64Image;
  });
};

// Get thumbnail for a photo
export const getThumbnail = async (photoId) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['thumbnails'], 'readonly');
      const store = transaction.objectStore('thumbnails');
      const request = store.get(photoId);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.base64Data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (event) => {
        console.error('Error loading thumbnail:', event.target.error);
        reject(new Error('Failed to load thumbnail'));
      };
    });
  } catch (error) {
    console.error('Error in getThumbnail:', error);
    return null;
  }
};

// Get photos by folder path
export const getPhotosByFolderPath = async (folderPath) => {
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
      
      request.onerror = (event) => {
        console.error('Error loading photos by folder:', event.target.error);
        reject(new Error('Failed to load photos'));
      };
    });
  } catch (error) {
    console.error('Error in getPhotosByFolderPath:', error);
    return [];
  }
};

// Get photo count for a machine
export const getPhotoCountForMachine = async (machineNumber) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const index = store.index('machineNumber');
      const countRequest = index.count(machineNumber);
      
      countRequest.onsuccess = () => {
        resolve(countRequest.result);
      };
      
      countRequest.onerror = (event) => {
        console.error('Error counting photos:', event.target.error);
        reject(new Error('Failed to count photos'));
      };
    });
  } catch (error) {
    console.error('Error in getPhotoCountForMachine:', error);
    return 0;
  }
};

// Get photo by ID
export const getPhotoById = async (photoId) => {
  try {
    const db = await initPhotoDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const request = store.get(photoId);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('Error loading photo:', event.target.error);
        reject(new Error('Failed to load photo'));
      };
    });
  } catch (error) {
    console.error('Error in getPhotoById:', error);
    return null;
  }
};