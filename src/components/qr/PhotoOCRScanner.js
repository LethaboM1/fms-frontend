import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';

const PhotoOCRScanner = ({ onScan, onClose, scanType }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Simple and effective image preprocessing
  const preprocessImage = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale up for better recognition (2x)
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        
        // Draw original image scaled up
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // High contrast enhancement for digital displays
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // Apply high contrast
          const contrast = 3.0; // Very high contrast for digital displays
          const adjusted = ((gray - 128) * contrast) + 128;
          const final = Math.max(0, Math.min(255, adjusted));
          
          // Set RGB to the contrasted value
          data[i] = final;     // Red
          data[i + 1] = final; // Green
          data[i + 2] = final; // Blue
          // Alpha remains the same
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = imageUrl;
    });
  };

  // Clean and extract numbers from text
  const extractNumbers = (text) => {
    if (!text) return null;
    
    console.log('Raw OCR text:', text);
    
    // Remove all non-digit characters except decimal point
    const cleanText = text.replace(/[^\d.]/g, '');
    
    // Find all number sequences
    const numberSequences = cleanText.match(/\d+/g) || [];
    
    console.log('Number sequences found:', numberSequences);
    
    if (numberSequences.length === 0) return null;
    
    // For odometer/hours, we typically want the longest number sequence
    // (digital displays usually show the main number clearly)
    const longestSequence = numberSequences.reduce((longest, current) => {
      return current.length > longest.length ? current : longest;
    }, '');
    
    return longestSequence || numberSequences[0] || null;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setImagePreview('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalImageUrl = e.target.result;
      setImagePreview(originalImageUrl);

      try {
        console.log('🔄 Starting OCR scan...');
        
        // Step 1: Preprocess image for better recognition
        setProgress(30);
        const processedImage = await preprocessImage(originalImageUrl);
        
        // Step 2: Initialize Tesseract with progress tracking
        const worker = await createWorker('eng');
        
        worker.onProgress = (p) => {
          setProgress(30 + (p.progress * 70));
        };

        // Configure for digital display reading
        await worker.setParameters({
          tessedit_pageseg_mode: '7', // Single text line
          tessedit_char_whitelist: '0123456789.',
          tessedit_ocr_engine_mode: '1' // Neural nets LSTM engine
        });

        // Step 3: Perform OCR
        setProgress(50);
        const result = await worker.recognize(processedImage);
        
        // Step 4: Clean up
        await worker.terminate();
        setProgress(100);

        console.log('📊 OCR Result:', result.data.text);
        
        // Step 5: Extract and validate the number
        const detectedNumber = extractNumbers(result.data.text);
        
        if (detectedNumber) {
          console.log('✅ Detected number:', detectedNumber);
          
          // Show confirmation with context
          setTimeout(() => {
            const confirmed = window.confirm(
              `Detected ${scanType === 'kilos' ? 'Kilometers' : 'Hours'}: ${detectedNumber}\n\n` +
              `Is this correct?\n\n` +
              `Click OK to confirm or Cancel to enter manually.`
            );
            
            if (confirmed) {
              onScan(detectedNumber);
            } else {
              showManualInput(detectedNumber);
            }
          }, 500);
          
        } else {
          console.log('❌ No numbers detected in OCR result');
          showManualInput();
        }

      } catch (error) {
        console.error('OCR Processing Error:', error);
        showManualInput();
      } finally {
        setLoading(false);
        setProgress(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const showManualInput = (defaultValue = '') => {
    const promptText = scanType === 'kilos' 
      ? 'Please enter the kilometers reading:'
      : 'Please enter the hours reading:';
    
    const manualInput = window.prompt(promptText, defaultValue);
    if (manualInput !== null) {
      // Clean the input - only allow numbers and decimal point
      const cleanInput = manualInput.replace(/[^\d.]/g, '');
      if (cleanInput) {
        onScan(cleanInput);
      }
    }
  };

  const retryScan = () => {
    setImagePreview('');
    setLoading(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1976d2' }}>
          📷 {scanType === 'kilos' ? 'Kilometers Scanner' : 'Hours Scanner'}
        </h3>

        {!imagePreview ? (
          <>
            <button
              onClick={triggerFileInput}
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: loading ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '15px'
              }}
            >
              {loading ? '🔄 Processing...' : '📸 Take Photo'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {/* Progress bar when loading */}
            {loading && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#4caf50',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Processing... {Math.round(progress)}%
                </div>
              </div>
            )}

            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: '#e8f5e8', 
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'left'
            }}>
              <strong style={{ display: 'block', marginBottom: '10px' }}>📝 Tips for Best Results:</strong>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li><strong>Fill the frame</strong> with the number display</li>
                <li><strong>Avoid glare</strong> on digital screens</li>
                <li><strong>Hold steady</strong> to prevent blur</li>
                <li><strong>Good lighting</strong> is essential</li>
                <li><strong>Direct angle</strong> facing the display</li>
              </ul>
            </div>

            {/* Manual input option */}
            <button
              onClick={() => showManualInput()}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              ✍️ Enter Manually
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <img 
                src={imagePreview} 
                alt="Scan" 
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  border: '2px solid #28a745',
                  objectFit: 'contain'
                }}
              />
            </div>

            {loading && (
              <div style={{
                padding: '15px',
                backgroundColor: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#1565c0' }}>
                  🔍 Analyzing Image...
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#bbdefb',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '5px'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#2196f3',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{ fontSize: '12px', color: '#1565c0' }}>
                  Progress: {Math.round(progress)}%
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={retryScan}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: loading ? '#ccc' : '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                🔄 Retry Scan
              </button>
              
              <button
                onClick={() => showManualInput()}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ✍️ Manual Input
              </button>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          Cancel
        </button>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '10px',
            color: '#666',
            textAlign: 'left'
          }}>
            <strong>Debug:</strong> Scan Type: {scanType}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoOCRScanner;