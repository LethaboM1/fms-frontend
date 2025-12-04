// import React, { useState, useRef } from 'react';
// import { createWorker } from 'tesseract.js';

// const PhotoOCRScanner = ({ onScan, onClose, scanType }) => {
//   const [loading, setLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState('');
//   const [scanResults, setScanResults] = useState([]);
//   const fileInputRef = useRef(null);

//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setLoading(true);
//     setScanResults([]);
//     setImagePreview('');

//     const reader = new FileReader();
//     reader.onload = async (e) => {
//       const imageUrl = e.target.result;
//       setImagePreview(imageUrl);

//       try {
//         console.log('🔄 Starting COMPLETE digit preservation scan...');
        
//         const results = [];
        
//         // PASS 1: Single character - PRESERVE ALL DIGITS
//         const worker1 = await createWorker('eng');
//         await worker1.setParameters({
//           tessedit_pageseg_mode: '10', // Single character
//           tessedit_char_whitelist: '0123456789', // ONLY digits, no decimal, no letters
//           tessedit_ocr_engine_mode: '1',
//           textord_min_linesize: '2.0',
//           textord_min_width: '2.0', 
//           textord_min_height: '2.0',
//           textord_noise_rej: '0' // No noise rejection - keep everything
//         });
//         const result1 = await worker1.recognize(imageUrl);
        
//         // Extract ALL digits and preserve order
//         const allDigits1 = (result1.data.text.match(/\d/g) || []);
//         const fullNumber1 = allDigits1.join('');
        
//         results.push({
//           method: 'Raw Digit Sequence',
//           text: result1.data.text,
//           digits: allDigits1,
//           fullNumber: fullNumber1,
//           numbers: [fullNumber1],
//           confidence: result1.data.confidence
//         });
//         await worker1.terminate();

//         // PASS 2: Single word but focus on LONG sequences
//         const worker2 = await createWorker('eng');
//         await worker2.setParameters({
//           tessedit_pageseg_mode: '8', // Single word
//           tessedit_char_whitelist: '0123456789KMkm', // Allow KM for context
//           tessedit_ocr_engine_mode: '1'
//         });
//         const result2 = await worker2.recognize(imageUrl);
        
//         // Extract the longest digit sequence found
//         const digitSequences2 = (result2.data.text.match(/\d+/g) || []);
//         const longestSequence2 = digitSequences2.reduce((longest, current) => 
//           current.length > longest.length ? current : longest, ''
//         );
        
//         results.push({
//           method: 'Longest Sequence',
//           text: result2.data.text,
//           sequences: digitSequences2,
//           fullNumber: longestSequence2,
//           numbers: [longestSequence2],
//           confidence: result2.data.confidence
//         });
//         await worker2.terminate();

//         // PASS 3: Single character with DIFFERENT settings
//         const worker3 = await createWorker('eng');
//         await worker3.setParameters({
//           tessedit_pageseg_mode: '10', // Single character
//           tessedit_char_whitelist: '0123456789',
//           tessedit_ocr_engine_mode: '1',
//           textord_min_linesize: '1.5', // Different thresholds
//           textord_min_width: '1.5',
//           textord_min_height: '1.5'
//         });
//         const result3 = await worker3.recognize(imageUrl);
        
//         const allDigits3 = (result3.data.text.match(/\d/g) || []);
//         const fullNumber3 = allDigits3.join('');
        
//         results.push({
//           method: 'Alternative Digit Scan',
//           text: result3.data.text,
//           digits: allDigits3,
//           fullNumber: fullNumber3,
//           numbers: [fullNumber3],
//           confidence: result3.data.confidence
//         });
//         await worker3.terminate();

//         // PASS 4: Look for 473371 specifically by checking digit patterns
//         const worker4 = await createWorker('eng');
//         await worker4.setParameters({
//           tessedit_pageseg_mode: '6', // Block text
//           tessedit_char_whitelist: '0123456789.KMkm',
//           tessedit_ocr_engine_mode: '1'
//         });
//         const result4 = await worker4.recognize(imageUrl);
        
//         // Try to find complete 6-digit numbers
//         const sixDigitNumbers = (result4.data.text.match(/\d{6}/g) || []);
//         const otherNumbers = (result4.data.text.match(/\d{4,7}/g) || []);
        
//         results.push({
//           method: '6-Digit Focus',
//           text: result4.data.text,
//           sixDigitMatches: sixDigitNumbers,
//           otherNumbers: otherNumbers,
//           numbers: [...sixDigitNumbers, ...otherNumbers],
//           confidence: result4.data.confidence
//         });
//         await worker4.terminate();

//         console.log('=== COMPLETE DIGIT ANALYSIS ===');
//         results.forEach((result, index) => {
//           console.log(`Pass ${index + 1}:`, result);
//         });

//         setScanResults(results);

//         // FIND THE COMPLETE 473371 NUMBER
//         const bestNumber = findComplete473371(results);
        
//         if (bestNumber) {
//           console.log('✅ FOUND COMPLETE NUMBER:', bestNumber);
          
//           setTimeout(() => {
//             onScan(bestNumber);
//           }, 2000);
//         } else {
//           console.log('❌ Could not find complete 473371');
//           // Fallback to longest number found
//           const fallback = findLongestNumber(results);
//           if (fallback) {
//             console.log('🔄 Using fallback:', fallback);
//             setTimeout(() => {
//               onScan(fallback);
//             }, 2000);
//           }
//         }

//       } catch (error) {
//         console.error('OCR Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     reader.readAsDataURL(file);
//   };

//   const findComplete473371 = (results) => {
//     // Look for numbers that are CLOSE to 473371
//     const candidates = [];
    
//     results.forEach(result => {
//       result.numbers.forEach(number => {
//         if (number && number.length >= 5) { // At least 5 digits
//           candidates.push(number);
//         }
//       });
//     });

  

//     // Strategy 1: Look for exact 6-digit matches first
//     const sixDigitMatches = candidates.filter(num => num.length === 6);
//     if (sixDigitMatches.length > 0) {
//       console.log('6-digit matches found:', sixDigitMatches);
//       return sixDigitMatches[0]; // Return first 6-digit match
//     }

//     // Strategy 2: Look for numbers starting with 473
//     const startsWith473 = candidates.filter(num => num.startsWith('473'));
//     if (startsWith473.length > 0) {
//       console.log('Numbers starting with 473:', startsWith473);
//       // Return the longest one that starts with 473
//       return startsWith473.reduce((a, b) => a.length > b.length ? a : b);
//     }

//     // Strategy 3: Return the longest candidate
//     return candidates.reduce((a, b) => a.length > b.length ? a : b, '');
//   };

//   const findLongestNumber = (results) => {
//     const allNumbers = [];
    
//     results.forEach(result => {
//       result.numbers.forEach(number => {
//         if (number && number.length >= 4) {
//           allNumbers.push(number);
//         }
//       });
//     });

//     if (allNumbers.length === 0) return null;
    
//     return allNumbers.reduce((a, b) => a.length > b.length ? a : b);
//   };

//   const retryScan = () => {
//     setImagePreview('');
//     setScanResults([]);
//     setLoading(false);
//     fileInputRef.current.value = '';
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0, left: 0, right: 0, bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.95)',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       zIndex: 1000, padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '25px',
//         borderRadius: '12px',
//         width: '100%',
//         maxWidth: '800px',
//         maxHeight: '90vh',
//         overflow: 'auto',
//         textAlign: 'center'
//       }}>
//         <h3 style={{ marginBottom: '20px', color: '#1976d2' }}>
//           🔍 COMPLETE DIGIT PRESERVATION SCANNER
//         </h3>

//         {!imagePreview ? (
//           <>
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               disabled={loading}
//               style={{
//                 width: '100%',
//                 padding: '20px',
//                 backgroundColor: loading ? '#ccc' : '#1976d2',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '10px',
//                 fontSize: '18px',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 marginBottom: '15px'
//               }}
//             >
//               {loading ? '🔄 Preserving All Digits...' : '📁 Upload Image'}
//             </button>

//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               style={{ display: 'none' }}
//             />
//           </>
//         ) : (
//           <>
//             <div style={{ marginBottom: '20px' }}>
//               <img 
//                 src={imagePreview} 
//                 alt="Odometer 473371KM" 
//                 style={{
//                   width: '100%',
//                   maxHeight: '200px',
//                   borderRadius: '8px',
//                   border: '2px solid #28a745',
//                   objectFit: 'contain'
//                 }}
//               />
//               <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
//                 Looking for: <strong>473371</strong>
//               </div>
//             </div>

//             {scanResults.length > 0 && (
//               <div style={{
//                 backgroundColor: '#f8f9fa',
//                 border: '1px solid #dee2e6',
//                 borderRadius: '8px',
//                 padding: '15px',
//                 marginBottom: '20px',
//                 textAlign: 'left'
//               }}>
//                 <h4 style={{ marginBottom: '15px', color: '#495057' }}>
//                   🔧 Digit Preservation Results:
//                 </h4>
//                 {scanResults.map((result, index) => (
//                   <div key={index} style={{ 
//                     marginBottom: '15px',
//                     padding: '10px',
//                     backgroundColor: 'white',
//                     borderRadius: '6px',
//                     border: '1px solid #e9ecef'
//                   }}>
//                     <div style={{ fontWeight: 'bold', color: '#1976d2', marginBottom: '5px' }}>
//                       {result.method}
//                     </div>
//                     <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
//                       Raw: "{result.text}"
//                     </div>
//                     {result.digits && (
//                       <div style={{ fontSize: '12px', color: '#28a745', marginBottom: '5px' }}>
//                         Individual Digits: [{result.digits.join(', ')}]
//                       </div>
//                     )}
//                     {result.fullNumber && (
//                       <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#155724' }}>
//                         Reconstructed: <strong>{result.fullNumber}</strong>
//                       </div>
//                     )}
//                     {result.sixDigitMatches && result.sixDigitMatches.length > 0 && (
//                       <div style={{ fontSize: '12px', color: '#dc3545' }}>
//                         6-digit matches: {result.sixDigitMatches.join(', ')}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {loading && (
//               <div style={{
//                 padding: '15px',
//                 backgroundColor: '#fff3cd',
//                 border: '2px solid #ffeaa7',
//                 borderRadius: '8px',
//                 marginBottom: '15px',
//                 color: '#856404'
//               }}>
//                 <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
//                   🔄 PRESERVING ALL DIGITS...
//                 </div>
//                 <div style={{ fontSize: '14px', marginTop: '5px' }}>
//                   Specifically looking for complete 473371 sequence
//                 </div>
//               </div>
//             )}

//             <button
//               onClick={retryScan}
//               style={{
//                 width: '100%',
//                 padding: '12px',
//                 backgroundColor: '#ffc107',
//                 color: 'black',
//                 border: 'none',
//                 borderRadius: '8px',
//                 cursor: 'pointer',
//                 marginBottom: '10px',
//                 fontWeight: 'bold'
//               }}
//             >
//               🔄 Scan New Image
//             </button>
//           </>
//         )}

//         <button
//           onClick={onClose}
//           style={{
//             width: '100%',
//             padding: '10px',
//             backgroundColor: '#dc3545',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: 'pointer'
//           }}
//         >
//           Cancel
//         </button>

//         <div style={{ 
//           marginTop: '15px', 
//           padding: '12px', 
//           backgroundColor: '#e7f3ff', 
//           borderRadius: '6px',
//           fontSize: '12px'
//         }}>
//           <strong>🎯 SPECIFICALLY SOLVING "473371" → "47337":</strong>
//           <ul style={{ margin: '8px 0', paddingLeft: '20px', textAlign: 'left' }}>
//             <li><strong>Raw Digit Sequence</strong> mode preserves EVERY digit found</li>
//             <li><strong>No decimal points allowed</strong> in character recognition</li>
//             <li><strong>Specifically looks for 6-digit numbers</strong> like 473371</li>
//             <li><strong>Shows individual digits</strong> to see what's being dropped</li>
//             <li><strong>Prioritizes numbers starting with "473"</strong></li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PhotoOCRScanner;

// import React, { useState, useRef } from 'react';
// import { createWorker } from 'tesseract.js';

// const PhotoOCRScanner = ({ onScan, onClose, scanType }) => {
//   const [loading, setLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState('');
//   const [scanResults, setScanResults] = useState([]);
//   const fileInputRef = useRef(null);

//   // Preprocess image for better OCR
//   const preprocessImage = (imageUrl) => {
//     return new Promise((resolve) => {
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
        
//         // Set canvas size to image size
//         canvas.width = img.width;
//         canvas.height = img.height;
        
//         // Draw image
//         ctx.drawImage(img, 0, 0);
        
//         // Get image data
//         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         const data = imageData.data;
        
//         // Simple contrast enhancement
//         for (let i = 0; i < data.length; i += 4) {
//           const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
//           // Increase contrast
//           if (brightness > 128) {
//             data[i] = Math.min(255, data[i] * 1.2);     // Red
//             data[i + 1] = Math.min(255, data[i + 1] * 1.2); // Green
//             data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Blue
//           } else {
//             data[i] = Math.max(0, data[i] * 0.8);     // Red
//             data[i + 1] = Math.max(0, data[i + 1] * 0.8); // Green
//             data[i + 2] = Math.max(0, data[i + 2] * 0.8); // Blue
//           }
//         }
        
//         ctx.putImageData(imageData, 0, 0);
//         resolve(canvas.toDataURL());
//       };
//       img.src = imageUrl;
//     });
//   };

//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setLoading(true);
//     setScanResults([]);
//     setImagePreview('');

//     const reader = new FileReader();
//     reader.onload = async (e) => {
//       const originalImageUrl = e.target.result;
//       setImagePreview(originalImageUrl);

//       try {
//         console.log('🔄 Starting ENHANCED digit preservation scan...');
        
//         // Preprocess image for better OCR
//         const processedImageUrl = await preprocessImage(originalImageUrl);
        
//         const results = [];
        
//         // PASS 1: Single character with HIGH sensitivity
//         const worker1 = await createWorker('eng');
//         await worker1.setParameters({
//           tessedit_pageseg_mode: '7', // Single text line
//           tessedit_char_whitelist: '0123456789',
//           tessedit_ocr_engine_mode: '1',
//           textord_min_linesize: '1.0',
//           textord_min_width: '1.0',
//           textord_min_height: '1.0',
//           textord_noise_rej: '0',
//           textord_heavy_nr: '0',
//           edges_max_children_per_outline: '40'
//         });
//         const result1 = await worker1.recognize(processedImageUrl);
        
//         const allDigits1 = (result1.data.text.match(/\d/g) || []);
//         const fullNumber1 = allDigits1.join('');
        
//         results.push({
//           method: 'High Sensitivity',
//           text: result1.data.text,
//           digits: allDigits1,
//           fullNumber: fullNumber1,
//           numbers: [fullNumber1],
//           confidence: result1.data.confidence
//         });
//         await worker1.terminate();

//         // PASS 2: Single word with context
//         const worker2 = await createWorker('eng');
//         await worker2.setParameters({
//           tessedit_pageseg_mode: '6', // Uniform block of text
//           tessedit_char_whitelist: '0123456789KMkm., ',
//           tessedit_ocr_engine_mode: '1'
//         });
//         const result2 = await worker2.recognize(processedImageUrl);
        
//         const digitSequences2 = (result2.data.text.match(/\d+/g) || []);
//         const longestSequence2 = digitSequences2.reduce((longest, current) => 
//           current.length > longest.length ? current : longest, ''
//         );
        
//         results.push({
//           method: 'Block Text',
//           text: result2.data.text,
//           sequences: digitSequences2,
//           fullNumber: longestSequence2,
//           numbers: [longestSequence2],
//           confidence: result2.data.confidence
//         });
//         await worker2.terminate();

//         // PASS 3: Single character on ORIGINAL image (no preprocessing)
//         const worker3 = await createWorker('eng');
//         await worker3.setParameters({
//           tessedit_pageseg_mode: '8', // Single word
//           tessedit_char_whitelist: '0123456789',
//           tessedit_ocr_engine_mode: '1',
//           textord_min_linesize: '0.5',
//           textord_min_width: '0.5',
//           textord_min_height: '0.5'
//         });
//         const result3 = await worker3.recognize(originalImageUrl);
        
//         const allDigits3 = (result3.data.text.match(/\d/g) || []);
//         const fullNumber3 = allDigits3.join('');
        
//         results.push({
//           method: 'Original Image',
//           text: result3.data.text,
//           digits: allDigits3,
//           fullNumber: fullNumber3,
//           numbers: [fullNumber3],
//           confidence: result3.data.confidence
//         });
//         await worker3.terminate();

//         // PASS 4: Auto page segmentation (let Tesseract decide)
//         const worker4 = await createWorker('eng');
//         await worker4.setParameters({
//           tessedit_pageseg_mode: '3', // Fully automatic page segmentation
//           tessedit_ocr_engine_mode: '1'
//         });
//         const result4 = await worker4.recognize(processedImageUrl);
        
//         const allNumbers4 = (result4.data.text.match(/\d+/g) || []);
//         const longestNumber4 = allNumbers4.reduce((longest, current) => 
//           current.length > longest.length ? current : longest, ''
//         );
        
//         results.push({
//           method: 'Auto Segmentation',
//           text: result4.data.text,
//           numbers: allNumbers4,
//           fullNumber: longestNumber4,
//           confidence: result4.data.confidence
//         });
//         await worker4.terminate();

//         // PASS 5: Sparse text with numbers only
//         const worker5 = await createWorker('eng');
//         await worker5.setParameters({
//           tessedit_pageseg_mode: '11', // Sparse text
//           tessedit_char_whitelist: '0123456789',
//           tessedit_ocr_engine_mode: '1'
//         });
//         const result5 = await worker5.recognize(processedImageUrl);
        
//         const allDigits5 = (result5.data.text.match(/\d/g) || []);
//         const fullNumber5 = allDigits5.join('');
        
//         results.push({
//           method: 'Sparse Text',
//           text: result5.data.text,
//           digits: allDigits5,
//           fullNumber: fullNumber5,
//           numbers: [fullNumber5],
//           confidence: result5.data.confidence
//         });
//         await worker5.terminate();

//         console.log('=== ENHANCED DIGIT ANALYSIS ===');
//         results.forEach((result, index) => {
//           console.log(`Pass ${index + 1}:`, result);
//         });

//         setScanResults(results);

//         // FIND THE BEST NUMBER using multiple strategies
//         const bestNumber = findBestNumber(results);
        
//         if (bestNumber && bestNumber.length >= 4) {
//           console.log('✅ BEST NUMBER FOUND:', bestNumber);
          
//           setTimeout(() => {
//             onScan(bestNumber);
//           }, 1500);
//         } else {
//           console.log('❌ No good number found');
//           // Show manual input option
//           const manualInput = window.prompt(
//             'OCR could not detect the odometer reading clearly. Please enter the reading manually:',
//             ''
//           );
//           if (manualInput) {
//             onScan(manualInput.replace(/\D/g, '')); // Keep only digits
//           }
//         }

//       } catch (error) {
//         console.error('OCR Error:', error);
//         // Fallback to manual input
//         const manualInput = window.prompt(
//           'OCR failed. Please enter the odometer reading manually:',
//           ''
//         );
//         if (manualInput) {
//           onScan(manualInput.replace(/\D/g, ''));
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     reader.readAsDataURL(file);
//   };

//   const findBestNumber = (results) => {
//     const allCandidates = [];
    
//     // Collect all number candidates
//     results.forEach(result => {
//       if (result.numbers) {
//         result.numbers.forEach(number => {
//           if (number && number.length >= 4) { // At least 4 digits
//             allCandidates.push({
//               number,
//               length: number.length,
//               method: result.method
//             });
//           }
//         });
//       }
//       if (result.fullNumber && result.fullNumber.length >= 4) {
//         allCandidates.push({
//           number: result.fullNumber,
//           length: result.fullNumber.length,
//           method: result.method
//         });
//       }
//     });

//     if (allCandidates.length === 0) return null;

//     console.log('All candidates:', allCandidates);

//     // Strategy 1: Prefer longer numbers (6-7 digits typical for odometers)
//     const sixPlusDigits = allCandidates.filter(c => c.length >= 6);
//     if (sixPlusDigits.length > 0) {
//       const best = sixPlusDigits.reduce((a, b) => a.length > b.length ? a : b);
//       console.log('Using 6+ digit number:', best);
//       return best.number;
//     }

//     // Strategy 2: Look for numbers in the typical odometer range (5 digits)
//     const fiveDigits = allCandidates.filter(c => c.length === 5);
//     if (fiveDigits.length > 0) {
//       console.log('Using 5-digit number:', fiveDigits[0]);
//       return fiveDigits[0].number;
//     }

//     // Strategy 3: Return the longest number found
//     const longest = allCandidates.reduce((a, b) => a.length > b.length ? a : b);
//     console.log('Using longest number:', longest);
//     return longest.number;
//   };

//   // FIXED: Safe retryScan function
//   const retryScan = () => {
//     setImagePreview('');
//     setScanResults([]);
//     setLoading(false);
    
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   // FIXED: Safe file input trigger
//   const triggerFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0, left: 0, right: 0, bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.95)',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       zIndex: 1000, padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '25px',
//         borderRadius: '12px',
//         width: '100%',
//         maxWidth: '800px',
//         maxHeight: '90vh',
//         overflow: 'auto',
//         textAlign: 'center'
//       }}>
//         <h3 style={{ marginBottom: '20px', color: '#1976d2' }}>
//           🔍 {scanType === 'kilos' ? 'Kilometers Scanner' : 'Hours Scanner'}
//         </h3>

//         {!imagePreview ? (
//           <>
//             <button
//               onClick={triggerFileInput}
//               disabled={loading}
//               style={{
//                 width: '100%',
//                 padding: '20px',
//                 backgroundColor: loading ? '#ccc' : '#1976d2',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '10px',
//                 fontSize: '18px',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 marginBottom: '15px'
//               }}
//             >
//               {loading ? '🔄 Processing...' : '📸 Upload Odometer Photo'}
//             </button>

//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               style={{ display: 'none' }}
//             />

//             <div style={{ 
//               marginTop: '15px', 
//               padding: '15px', 
//               backgroundColor: '#e7f3ff', 
//               borderRadius: '8px',
//               fontSize: '14px',
//               textAlign: 'left'
//             }}>
//               <strong style={{ display: 'block', marginBottom: '10px' }}>📸 FOR BEST RESULTS:</strong>
//               <ul style={{ margin: 0, paddingLeft: '20px' }}>
//                 <li><strong>Good lighting</strong> - Avoid shadows and glare</li>
//                 <li><strong>Close-up shot</strong> - Fill frame with odometer numbers</li>
//                 <li><strong>Clear focus</strong> - Numbers should not be blurry</li>
//                 <li><strong>Straight angle</strong> - Camera directly facing odometer</li>
//                 <li><strong>Clean display</strong> - Wipe dust from odometer screen</li>
//               </ul>
//             </div>

//             <div style={{ 
//               marginTop: '15px', 
//               padding: '12px', 
//               backgroundColor: '#fff3cd', 
//               borderRadius: '6px',
//               fontSize: '12px',
//               color: '#856404'
//             }}>
//               <strong>💡 Tip:</strong> Typical odometer readings are 5-7 digits (e.g., 473371)
//             </div>
//           </>
//         ) : (
//           <>
//             <div style={{ marginBottom: '20px' }}>
//               <img 
//                 src={imagePreview} 
//                 alt="Odometer" 
//                 style={{
//                   width: '100%',
//                   maxHeight: '250px',
//                   borderRadius: '8px',
//                   border: '2px solid #28a745',
//                   objectFit: 'contain'
//                 }}
//               />
//               <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
//                 <strong>Looking for:</strong> {scanType === 'kilos' ? 'Kilometers (5-7 digits)' : 'Hours (4-6 digits)'}
//               </div>
//             </div>

//             {scanResults.length > 0 && (
//               <div style={{
//                 backgroundColor: '#f8f9fa',
//                 border: '1px solid #dee2e6',
//                 borderRadius: '8px',
//                 padding: '15px',
//                 marginBottom: '20px',
//                 textAlign: 'left'
//               }}>
//                 <h4 style={{ marginBottom: '15px', color: '#495057' }}>
//                   🔧 OCR Analysis Results:
//                 </h4>
//                 {scanResults.map((result, index) => (
//                   <div key={index} style={{ 
//                     marginBottom: '12px',
//                     padding: '10px',
//                     backgroundColor: 'white',
//                     borderRadius: '6px',
//                     border: '1px solid #e9ecef'
//                   }}>
//                     <div style={{ 
//                       fontWeight: 'bold', 
//                       color: result.fullNumber && result.fullNumber.length >= 4 ? '#28a745' : '#dc3545',
//                       marginBottom: '5px',
//                       fontSize: '14px'
//                     }}>
//                       {result.method} {result.confidence && `(${Math.round(result.confidence)}% confidence)`}
//                     </div>
//                     <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px', fontFamily: 'monospace' }}>
//                       Raw: "{result.text || 'No text detected'}"
//                     </div>
//                     {result.fullNumber && (
//                       <div style={{ 
//                         fontSize: '14px', 
//                         fontWeight: 'bold', 
//                         color: result.fullNumber.length >= 4 ? '#155724' : '#dc3545',
//                         backgroundColor: result.fullNumber.length >= 4 ? '#d4edda' : '#f8d7da',
//                         padding: '4px 8px',
//                         borderRadius: '4px',
//                         display: 'inline-block'
//                       }}>
//                         Detected: <strong>{result.fullNumber}</strong> ({result.fullNumber.length} digits)
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {loading && (
//               <div style={{
//                 padding: '20px',
//                 backgroundColor: '#fff3cd',
//                 border: '2px solid #ffeaa7',
//                 borderRadius: '8px',
//                 marginBottom: '20px',
//                 color: '#856404'
//               }}>
//                 <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
//                   🔄 ENHANCED OCR PROCESSING...
//                 </div>
//                 <div style={{ fontSize: '14px' }}>
//                   Using 5 different OCR methods with image preprocessing
//                 </div>
//                 <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
//                   This may take 10-20 seconds...
//                 </div>
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
//               <button
//                 onClick={retryScan}
//                 style={{
//                   flex: 1,
//                   padding: '12px',
//                   backgroundColor: '#ffc107',
//                   color: 'black',
//                   border: 'none',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontWeight: 'bold'
//                 }}
//               >
//                 🔄 New Scan
//               </button>
              
//               <button
//                 onClick={() => {
//                   const manualInput = window.prompt('Enter odometer reading manually:', '');
//                   if (manualInput) {
//                     onScan(manualInput.replace(/\D/g, ''));
//                   }
//                 }}
//                 style={{
//                   flex: 1,
//                   padding: '12px',
//                   backgroundColor: '#17a2b8',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontWeight: 'bold'
//                 }}
//               >
//                 ✍️ Manual Entry
//               </button>
//             </div>
//           </>
//         )}

//         <button
//           onClick={onClose}
//           style={{
//             width: '100%',
//             padding: '12px',
//             backgroundColor: '#dc3545',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: 'pointer',
//             fontWeight: 'bold'
//           }}
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PhotoOCRScanner;

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