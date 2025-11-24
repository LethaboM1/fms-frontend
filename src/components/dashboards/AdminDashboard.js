// // import React, { useState, useEffect } from 'react';
// // import QRScanner from '../qr/QRScanner';
// // import QRGenerator from '../qr/QRGenerator';
// // import * as XLSX from 'xlsx';

// // const Admin = ({ user, onLogout }) => {
// //   const [formData, setFormData] = useState({
// //     // Fuel Store Selection
// //     fuelStoreCategory: '',
// //     selectedFuelStore: '',
    
// //     // Plant Number (from QR scan)
// //     plantNumber: '',
    
// //     // Meter Readings
// //     previousMeterReading: '',
// //     currentMeterReading: '',
// //     meterDifference: '',
    
// //     // Odometer/Hours from QR Scan
// //     odometerReading: '',
// //     hoursReading: '',
    
// //     // Contract/Site Allocation
// //     contractType: '',
// //     customSiteNumber: '',
    
// //     // Transaction Type (Ledger Codes)
// //     transactionType: '',
    
// //     // Fuel Details
// //     fuelQuantity: '',
// //     fuelType: 'Diesel',
    
// //     // Date
// //     transactionDate: new Date().toISOString().split('T')[0],
    
// //     // Additional details
// //     attendantName: user?.fullName || '',
// //     receiverName: '',
// //     receiverCompany: '',
// //     employmentNumber: '',
// //     remarks: '',
    
// //     // Stock readings for PDF
// //     previousDip: '1500',
// //     currentDip: '1450',
// //     deliveryReceived: '5000',
// //     openingReading: '12000',
// //     closingReading: '12500',
// //     variance: '2.5'
// //   });

// //   const [showQRScanner, setShowQRScanner] = useState(false);
// //   const [showOdometerScanner, setShowOdometerScanner] = useState(false);
// //   const [showQRGenerator, setShowQRGenerator] = useState(false);
// //   const [selectedPlantForQR, setSelectedPlantForQR] = useState('');
// //   const [transactions, setTransactions] = useState([]);
// //   const [customSites, setCustomSites] = useState([]);

// //   // Fuel Stores Data
// //   const fuelStores = {
// //     service_trucks: [
// //       'FSH01 - 01',
// //       'FSH02 - 01', 
// //       'FSH03 - 01',
// //       'FSH04 - 01'
// //     ],
// //     fuel_trailers: [
// //       'SLD 02 (1000L)',
// //       'SLD 07 (2000L)',
// //       'SLD 09 (1000L)'
// //     ],
// //     underground_tanks: [
// //       'UDT 49',
// //       'UPT 49',
// //       'UDT 890',
// //       'STD 02',
// //       'STD 05'
// //     ]
// //   };

// //   // Transaction Types (Ledger Codes)
// //   const transactionTypes = [
// //     'Plant Fuel to Contract',
// //     'Plant Fuel Return from Contract',
// //     'Stock Issue to Balance Sheet',
// //     'Stock Issue to Contracts',
// //     'Stock Issue to Overheads',
// //     'Stock Issue Plant',
// //     'Stock Receipt from Supplier',
// //     'Stock Return from Balance Sheet',
// //     'Stock Return from Contract',
// //     'Stock Return from Plant',
// //     'Stock Return from Overheads',
// //     'Stock Return to Supplier',
// //     'Stock Take On'
// //   ];

// //   // Contract/Site Options
// //   const contractOptions = [
// //     'AMPLANT 49',
// //     'HILLARY (Site 2163)',
// //     'HILLARY (Site 2102)',
// //     'Polokwane Surfacing 890',
// //     'Sundries',
// //     'Custom Site'
// //   ];

// //   // Plant Equipment Master List
// //   const plantMasterList = {
// //     // Asphalt Pavers
// //     'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
// //     'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
// //     'A-APD07': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
// //     'A-APD08': { name: 'ASPHALT PAVER DYNAPAC F161-8W', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
// //     'A-APD09': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
// //     'A-APD11': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
// //     'A-APN01': { name: 'ASPHALT PAVER NIGATA', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
// //     'A-APV10': { name: 'ASPHALT PAVER VOGELE 1800 SPRAY JET', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },

// //     // Asphalt Plants
// //     'A-APP02': { name: 'ASPHALT MIXING PLANT MOBILE 40tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
// //     'A-APP03': { name: 'ASPHALT MIXING PLANT MOBILE 60tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
// //     'A-APP04': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
// //     'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
// //     'A-APP06': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },

// //     // Shuttle Buggies
// //     'A-ASR01': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
// //     'A-ASR02': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },

// //     // Buses
// //     'A-BBS03': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
// //     'A-BBS04': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },

// //     // Bitumen Equipment
// //     'A-BDT02': { name: 'BITUMEN TRAILER 1kl', type: 'Bitumen Trailer', fuelType: 'Bitumen', category: 'specialized' },
// //     'A-BDT06': { name: 'CRACKSEALING TRAILER', type: 'Cracksealing Trailer', fuelType: 'Diesel', category: 'specialized' },
// //     'A-BEP01': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
// //     'A-BEP02': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },

// //     // Bakkies and Light Vehicles
// //     'A-BNS08': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
// //     'A-BNS09': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
// //     'A-BNS10': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
// //     'A-BOC106': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
// //     'A-BOC107': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
// //     'A-BOC108': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },

// //     // Brooms
// //     'A-BRM11': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
// //     'A-BRM12': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
// //     'A-BRM13': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
// //     'A-BRM14': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },

// //     // Heavy Bakkies
// //     'A-BTH100': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
// //     'A-BTH104': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
// //     'A-BTH115': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },

// //     // Crushers
// //     'A-CCK05': { name: 'KLEEMANN MOBICONE MCO 9 S EVO CONE', type: 'Cone Crusher', fuelType: 'Diesel', category: 'crushing' },
// //     'A-CHR03': { name: 'RM HORIZONTAL IMPACT CRUSHER 100GO', type: 'Impact Crusher', fuelType: 'Diesel', category: 'crushing' },
// //     'A-CJK06': { name: 'KLEEMANN MOBICAT MC 110 R EVO JAW', type: 'Jaw Crusher', fuelType: 'Diesel', category: 'crushing' },

// //     // Screens
// //     'A-CSK01': { name: 'KLEEMANN MOBICAT MC 703 EVO SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
// //     'A-CSM02': { name: 'METSO ST2.8 SCALPER SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
// //     'A-CSC03': { name: 'CHIEFTAIN 600, DOUBLE DECK SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },

// //     // Chipsreaders
// //     'A-CSE07': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
// //     'A-CSE08': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
// //     'A-CSE09': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
// //     'A-CSE10': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },

// //     // Dozers
// //     'A-DOK13': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
// //     'A-DOK15': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
// //     'A-DOK16': { name: 'DOZER KOMATSU D155 40t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },

// //     // Excavators
// //     'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
// //     'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
// //     'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
// //     'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },

// //     // Flatdecks and Trucks
// //     'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
// //     'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
// //     'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },

// //     // Fuel Trailers
// //     'SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
// //     'SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
// //     'SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
// //     'SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
// //     'SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },

// //     // Static Tanks
// //     'STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
// //     'STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
// //     'STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },

// //     // Articulated Dump Trucks (ADTs)
// //     'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
// //     'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
// //     'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
// //     'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
// //     'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
// //     'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    
// //     // Small Equipment and Tools
// //     'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
// //     'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
// //     'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
// //   };

// //   // Handle form input changes
// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
    
// //     setFormData(prev => {
// //       const newData = {
// //         ...prev,
// //         [name]: value
// //       };

// //       // Calculate meter difference when both readings are entered
// //       if ((name === 'previousMeterReading' || name === 'currentMeterReading') && 
// //           newData.previousMeterReading && newData.currentMeterReading) {
// //         const prev = parseFloat(newData.previousMeterReading) || 0;
// //         const current = parseFloat(newData.currentMeterReading) || 0;
// //         newData.meterDifference = (current - prev).toFixed(2);
// //       }

// //       // Reset selected fuel store when category changes
// //       if (name === 'fuelStoreCategory') {
// //         newData.selectedFuelStore = '';
// //       }

// //       return newData;
// //     });
// //   };

// //   // Handle Plant QR Scan
// //   const handleQRScan = (scannedData) => {
// //     const plantInfo = plantMasterList[scannedData] || {
// //       name: scannedData,
// //       type: 'Unknown Equipment',
// //       fuelType: 'Diesel',
// //       category: 'general'
// //     };

// //     setFormData(prev => ({
// //       ...prev,
// //       plantNumber: scannedData,
// //       plantName: plantInfo.name,
// //       plantType: plantInfo.type,
// //       fuelType: plantInfo.fuelType
// //     }));

// //     setShowQRScanner(false);
// //   };

// //   // Handle Odometer/Hours QR Scan
// //   const handleOdometerScan = (scannedData) => {
// //     try {
// //       // Expected format: "KM:1234.5,HRS:56.7" or similar
// //       const data = scannedData.split(',');
// //       let km = '';
// //       let hrs = '';

// //       data.forEach(item => {
// //         if (item.includes('KM:') || item.includes('km:') || item.includes('KILOS:')) {
// //           km = item.split(':')[1];
// //         }
// //         if (item.includes('HRS:') || item.includes('hrs:') || item.includes('HOURS:')) {
// //           hrs = item.split(':')[1];
// //         }
// //       });

// //       setFormData(prev => ({
// //         ...prev,
// //         odometerReading: km || '',
// //         hoursReading: hrs || ''
// //       }));

// //       setShowOdometerScanner(false);
      
// //       if (!km && !hrs) {
// //         alert('No odometer or hours data found in QR code. Please scan again or enter manually.');
// //       }
// //     } catch (error) {
// //       console.error('Error parsing odometer QR:', error);
// //       alert('Error reading odometer QR code. Please try again or enter manually.');
// //     }
// //   };

// //   // Handle adding custom site
// //   const handleAddCustomSite = () => {
// //     if (formData.customSiteNumber && !customSites.includes(formData.customSiteNumber)) {
// //       setCustomSites(prev => [...prev, formData.customSiteNumber]);
// //       setFormData(prev => ({
// //         ...prev,
// //         contractType: formData.customSiteNumber,
// //         customSiteNumber: ''
// //       }));
// //     }
// //   };

// //   // Handle form submission
// //   const handleSubmit = (e) => {
// //     e.preventDefault();
    
// //     // Validate date - cannot be previous date
// //     const selectedDate = new Date(formData.transactionDate);
// //     const today = new Date();
// //     today.setHours(0, 0, 0, 0);
    
// //     if (selectedDate < today) {
// //       alert('Cannot select previous dates. Please select today or a future date.');
// //       return;
// //     }

// //     // Validate meter readings
// //     if (parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading)) {
// //       alert('Current meter reading must be greater than previous reading.');
// //       return;
// //     }

// //     // Create transaction object
// //     const transaction = {
// //       id: Date.now(),
// //       timestamp: new Date().toISOString(),
// //       ...formData,
// //       attendantName: user.fullName,
// //       userId: user.id
// //     };

// //     // Add to transactions
// //     setTransactions(prev => [transaction, ...prev]);
    
// //     // Reset form (keep stock readings for PDF)
// //     setFormData(prev => ({
// //       fuelStoreCategory: '',
// //       selectedFuelStore: '',
// //       plantNumber: '',
// //       previousMeterReading: '',
// //       currentMeterReading: '',
// //       meterDifference: '',
// //       odometerReading: '',
// //       hoursReading: '',
// //       contractType: '',
// //       customSiteNumber: '',
// //       transactionType: '',
// //       fuelQuantity: '',
// //       fuelType: 'Diesel',
// //       transactionDate: new Date().toISOString().split('T')[0],
// //       attendantName: user.fullName,
// //       receiverName: '',
// //       receiverCompany: '',
// //       employmentNumber: '',
// //       remarks: '',
// //       // Keep stock readings for PDF
// //       previousDip: prev.previousDip,
// //       currentDip: prev.currentDip,
// //       deliveryReceived: prev.deliveryReceived,
// //       openingReading: prev.openingReading,
// //       closingReading: prev.closingReading,
// //       variance: prev.variance
// //     }));

// //     alert('Transaction recorded successfully!');
// //   };

// //   // Simple Excel download
// //   const downloadTransactionsExcel = () => {
// //     if (transactions.length === 0) {
// //       alert('No transactions to download.');
// //       return;
// //     }

// //     try {
// //       const { utils, writeFile } = XLSX;
      
// //       // Prepare data for Excel
// //       const excelData = transactions.map(transaction => ({
// //         'Transaction ID': transaction.id,
// //         'Date': transaction.transactionDate,
// //         'Plant Number': transaction.plantNumber,
// //         'Plant Name': transaction.plantName || '',
// //         'Fuel Store': transaction.selectedFuelStore,
// //         'Previous Reading': transaction.previousMeterReading,
// //         'Current Reading': transaction.currentMeterReading,
// //         'Difference': transaction.meterDifference,
// //         'Odometer (KM)': transaction.odometerReading,
// //         'Hours': transaction.hoursReading,
// //         'Transaction Type': transaction.transactionType,
// //         'Contract/Site': transaction.contractType,
// //         'Fuel Quantity (L)': transaction.fuelQuantity,
// //         'Fuel Type': transaction.fuelType,
// //         'Receiver Name': transaction.receiverName,
// //         'Receiver Company': transaction.receiverCompany,
// //         'Employment Number': transaction.employmentNumber,
// //         'Attendant': transaction.attendantName,
// //         'Remarks': transaction.remarks || ''
// //       }));

// //       const ws = utils.json_to_sheet(excelData);
// //       const wb = utils.book_new();
// //       utils.book_append_sheet(wb, ws, 'Fuel Transactions');
      
// //       // Generate and download the file
// //       writeFile(wb, `fuel-transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
      
// //     } catch (error) {
// //       console.error('Excel download failed:', error);
// //       alert('Excel download failed. Please try again.');
// //     }
// //   };

// //   // Function to populate your existing FUEL SHEET.xlsx template
// //   const populateTemplateExcel = async () => {
// //     try {
// //       const { utils, writeFile } = XLSX;

// //       // Create workbook with your exact template structure
// //       const wb = utils.book_new();

// //       // SHEET 1: STOCK READINGS (exact template layout)
// //       const stockReadingsData = [
// //         ['FUEL MANAGEMENT SYSTEM - STOCK READINGS'],
// //         [''],
// //         ['STOCK READINGS', 'VALUE', '', 'METERS & CALCULATIONS', 'VALUE', ''],
// //         ['PREVIOUS DIP/PROBE', formData.previousDip || '', 'CHECK ☑ ⮽', 'PREVIOUS CLOSING READING', formData.previousMeterReading || '', 'CHECK ☑ ⮽'],
// //         ['DIP/PROBE START', formData.currentDip || '', '', '', '', ''],
// //         ['DELIVERY RECEIVED', formData.deliveryReceived || '', '% Variance =', formData.variance || '', '', ''],
// //         ['Dips/Readings OPEN READING', formData.openingReading || '', '', 'TOTAL ISSUED FROM OLD METER', '', ''],
// //         ['DIP/PROBE END', formData.currentDip || '', '', 'CLOSING READING', formData.closingReading || '', '% Variance ='],
// //         ['∑ Old/Readings', '', '', '', '', ''],
// //         ['TOTAL ISSUED FROM DIPS', '', '', '', '', ''],
// //         ['% / %', '', 'TOTAL ISSUED FROM READINGS', '', 'TOTAL ISSUED FROM IQ TECH METER', ''],
// //         ['', '', '', '', '%', '']
// //       ];

// //       const stockWs = utils.aoa_to_sheet(stockReadingsData);
// //       utils.book_append_sheet(wb, stockWs, 'Stock Readings');

// //       // SHEET 2: TRANSACTIONS (exact template columns)
// //       const transactionsData = [
// //         ['FLEET TRANSACTIONS RECORD'],
// //         [''],
// //         ['FLEET NO', 'HR / KM', 'OPENING READING', 'CLOSING READING', 'FUEL ISSUED', 'SITE ALLOC', 'RECEIVER\'S NAME', 'EMPLOYMENT NO', 'SIGNATURE', 'REMARKS', 'Old', 'IQ Tech']
// //       ];

// //       // Add transaction rows
// //       transactions.forEach(transaction => {
// //         transactionsData.push([
// //           transaction.plantNumber || '',
// //           transaction.hoursReading ? 
// //             `${transaction.odometerReading || ''}KM / ${transaction.hoursReading}HRS` : 
// //             transaction.odometerReading ? `${transaction.odometerReading}KM` : '',
// //           transaction.previousMeterReading || '',
// //           transaction.currentMeterReading || '',
// //           transaction.fuelQuantity ? `${transaction.fuelQuantity}L` : '',
// //           transaction.contractType || '',
// //           transaction.receiverName || '',
// //           transaction.employmentNumber || '',
// //           '', // Signature column (empty)
// //           transaction.remarks || '',
// //           'Old',
// //           'IQ Tech'
// //         ]);
// //       });

// //       const transactionsWs = utils.aoa_to_sheet(transactionsData);
// //       utils.book_append_sheet(wb, transactionsWs, 'Transactions');

// //       // Generate the file
// //       writeFile(wb, 'FUEL SHEET.xlsx');

// //     } catch (error) {
// //       console.error('Template population failed:', error);
// //       // Fallback to simple Excel download
// //       downloadTransactionsExcel();
// //     }
// //   };

// //   // Simple PDF download
// //   const downloadTransactionsPDF = () => {
// //     if (transactions.length === 0) {
// //       alert('No transactions to download.');
// //       return;
// //     }

// //     // Simple dynamic import that always works
// //     import('jspdf').then(({ jsPDF }) => {
// //       const doc = new jsPDF();
      
// //       // Title
// //       doc.setFontSize(16);
// //       doc.text('FUEL TRANSACTIONS REPORT', 20, 20);
      
// //       // Details
// //       doc.setFontSize(10);
// //       doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
// //       doc.text(`Generated by: ${user.fullName}`, 20, 37);
// //       doc.text(`Total Transactions: ${transactions.length}`, 20, 44);
      
// //       const totalFuel = transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0);
// //       doc.text(`Total Fuel: ${totalFuel.toFixed(2)}L`, 20, 51);
      
// //       // Stock Readings Summary
// //       doc.text('STOCK READINGS:', 20, 65);
// //       doc.text(`Previous Dip: ${formData.previousDip || 'N/A'}`, 20, 72);
// //       doc.text(`Current Dip: ${formData.currentDip || 'N/A'}`, 20, 79);
// //       doc.text(`Delivery Received: ${formData.deliveryReceived || 'N/A'}`, 20, 86);
      
// //       // Transactions List
// //       let yPos = 100;
// //       doc.text('RECENT TRANSACTIONS:', 20, yPos);
// //       yPos += 10;
      
// //       transactions.slice(0, 15).forEach((transaction, index) => {
// //         if (yPos > 270) {
// //           doc.addPage();
// //           yPos = 20;
// //         }
        
// //         const line = `${transaction.plantNumber} | ${transaction.fuelQuantity}L | ${transaction.transactionType}`;
// //         doc.text(line, 20, yPos);
// //         yPos += 7;
// //       });
      
// //       doc.save(`fuel-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
// //     }).catch((error) => {
// //       console.error('PDF failed:', error);
// //       alert('PDF generation failed. Please try downloading Excel instead.');
// //     });
// //   };

// //   // Generate QR for specific plant
// //   const generateQRForPlant = (plantNumber) => {
// //     if (plantNumber) {
// //       setSelectedPlantForQR(plantNumber);
// //       setShowQRGenerator(true);
// //     }
// //   };

// //   return (
// //     <div style={{ 
// //       padding: '20px', 
// //       maxWidth: '1400px', 
// //       margin: '0 auto',
// //       backgroundColor: '#f5f5f5',
// //       minHeight: '100vh'
// //     }}>
// //       {/* Header */}
// //       <div style={{ 
// //         display: 'flex', 
// //         justifyContent: 'space-between', 
// //         alignItems: 'center',
// //         marginBottom: '30px',
// //         backgroundColor: 'white',
// //         padding: '20px',
// //         borderRadius: '8px',
// //         boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
// //       }}>
// //         <div>
// //           <p style={{ margin: 0, color: '#666' }}>Clerk/Attendant Dashboard</p>
// //         </div>
// //         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
// //           <span style={{ color: '#333' }}>Welcome, {user.fullName}</span>
// //           <button 
// //             onClick={onLogout}
// //             style={{ 
// //               padding: '8px 16px', 
// //               backgroundColor: '#d32f2f',
// //               color: 'white',
// //               border: 'none',
// //               borderRadius: '4px',
// //               cursor: 'pointer'
// //             }}
// //           >
// //             Logout
// //           </button>
// //         </div>
// //       </div>

// //       <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
// //         {/* Main Content */}
// //         <div>
// //           {/* Transaction Form */}
// //           <div style={{ 
// //             backgroundColor: 'white', 
// //             padding: '30px', 
// //             borderRadius: '8px',
// //             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
// //             marginBottom: '20px'
// //           }}>
// //             <h2 style={{ color: '#1b5e20', marginBottom: '25px' }}>New Fuel Transaction</h2>
            
// //             <form onSubmit={handleSubmit}>
// //               {/* QR Scan Sections */}
// //               <div style={{ marginBottom: '25px' }}>
// //                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Equipment & Readings Scan</h3>
// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Plant Number (QR Scan):
// //                     </label>
// //                     <div style={{ display: 'flex', gap: '10px' }}>
// //                       <input
// //                         type="text"
// //                         name="plantNumber"
// //                         value={formData.plantNumber}
// //                         onChange={handleInputChange}
// //                         placeholder="Scan plant QR code"
// //                         style={{ 
// //                           flex: 1,
// //                           padding: '10px',
// //                           border: '1px solid #ddd',
// //                           borderRadius: '4px'
// //                         }}
// //                         required
// //                       />
// //                       <button
// //                         type="button"
// //                         onClick={() => setShowQRScanner(true)}
// //                         style={{
// //                           padding: '10px',
// //                           backgroundColor: '#1b5e20',
// //                           color: 'white',
// //                           border: 'none',
// //                           borderRadius: '4px',
// //                           cursor: 'pointer',
// //                           whiteSpace: 'nowrap'
// //                         }}
// //                       >
// //                         📱 Scan Plant
// //                       </button>
// //                     </div>
// //                     {formData.plantName && (
// //                       <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
// //                         {formData.plantName} - {formData.plantType}
// //                       </small>
// //                     )}
// //                   </div>

// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Odometer & Hours (QR Scan):
// //                     </label>
// //                     <div style={{ display: 'flex', gap: '10px' }}>
// //                       <input
// //                         type="text"
// //                         value={formData.odometerReading || formData.hoursReading ? 
// //                           `KM: ${formData.odometerReading} | HRS: ${formData.hoursReading}` : ''}
// //                         placeholder="Scan odometer/hours QR"
// //                         readOnly
// //                         style={{ 
// //                           flex: 1,
// //                           padding: '10px',
// //                           border: '1px solid #ddd',
// //                           borderRadius: '4px',
// //                           backgroundColor: '#f9f9f9'
// //                         }}
// //                       />
// //                       <button
// //                         type="button"
// //                         onClick={() => setShowOdometerScanner(true)}
// //                         style={{
// //                           padding: '10px',
// //                           backgroundColor: '#1976d2',
// //                           color: 'white',
// //                           border: 'none',
// //                           borderRadius: '4px',
// //                           cursor: 'pointer',
// //                           whiteSpace: 'nowrap'
// //                         }}
// //                       >
// //                         📱 Scan Meter
// //                       </button>
// //                     </div>
// //                     <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
// //                       Scans both kilometers and hours from equipment QR
// //                     </small>
// //                   </div>
// //                 </div>

// //                 {/* Manual Odometer/Hours Input */}
// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Odometer (KM) - Manual:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="odometerReading"
// //                       value={formData.odometerReading}
// //                       onChange={handleInputChange}
// //                       step="0.1"
// //                       placeholder="Or enter manually"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                   </div>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Hours - Manual:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="hoursReading"
// //                       value={formData.hoursReading}
// //                       onChange={handleInputChange}
// //                       step="0.1"
// //                       placeholder="Or enter manually"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Fuel Store Selection */}
// //               <div style={{ marginBottom: '25px' }}>
// //                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Fuel Store Selection</h3>
// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Fuel Store Category:
// //                     </label>
// //                     <select
// //                       name="fuelStoreCategory"
// //                       value={formData.fuelStoreCategory}
// //                       onChange={handleInputChange}
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     >
// //                       <option value="">Select Category</option>
// //                       <option value="service_trucks">Service Trucks</option>
// //                       <option value="fuel_trailers">Fuel Trailers</option>
// //                       <option value="underground_tanks">Underground Tanks</option>
// //                     </select>
// //                   </div>

// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Specific Store:
// //                     </label>
// //                     <select
// //                       name="selectedFuelStore"
// //                       value={formData.selectedFuelStore}
// //                       onChange={handleInputChange}
// //                       disabled={!formData.fuelStoreCategory}
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     >
// //                       <option value="">Select Store</option>
// //                       {formData.fuelStoreCategory && fuelStores[formData.fuelStoreCategory]?.map(store => (
// //                         <option key={store} value={store}>{store}</option>
// //                       ))}
// //                     </select>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Meter Readings */}
// //               <div style={{ marginBottom: '25px' }}>
// //                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Meter Readings</h3>
// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Previous Reading:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="previousMeterReading"
// //                       value={formData.previousMeterReading}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Current Reading:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="currentMeterReading"
// //                       value={formData.currentMeterReading}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       min={parseFloat(formData.previousMeterReading) + 0.01 || 0}
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading) 
// //                           ? '2px solid red' : '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Difference:
// //                     </label>
// //                     <input
// //                       type="text"
// //                       value={formData.meterDifference || ''}
// //                       readOnly
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px',
// //                         backgroundColor: '#f5f5f5',
// //                         fontWeight: 'bold',
// //                         color: formData.meterDifference ? '#1b5e20' : '#666'
// //                       }}
// //                       placeholder="Auto-calculated"
// //                     />
// //                   </div>
// //                 </div>
// //                 {formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading) && (
// //                   <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
// //                     Current reading must be greater than previous reading
// //                   </small>
// //                 )}
// //               </div>

// //               {/* Transaction Type and Contract/Site */}
// //               <div style={{ marginBottom: '25px' }}>
// //                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Transaction & Site Details</h3>
// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Transaction Type (Ledger Code):
// //                     </label>
// //                     <select
// //                       name="transactionType"
// //                       value={formData.transactionType}
// //                       onChange={handleInputChange}
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     >
// //                       <option value="">Select Transaction Type</option>
// //                       {transactionTypes.map(type => (
// //                         <option key={type} value={type}>{type}</option>
// //                       ))}
// //                     </select>
// //                   </div>

// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Contract/Site:
// //                     </label>
// //                     <select
// //                       name="contractType"
// //                       value={formData.contractType}
// //                       onChange={handleInputChange}
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     >
// //                       <option value="">Select Contract/Site</option>
// //                       {contractOptions.map(contract => (
// //                         <option key={contract} value={contract}>{contract}</option>
// //                       ))}
// //                       {customSites.map(site => (
// //                         <option key={site} value={site}>{site} (Custom)</option>
// //                       ))}
// //                     </select>
// //                   </div>
// //                 </div>

// //                 <div style={{ marginTop: '15px' }}>
// //                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                     Add Custom Site:
// //                   </label>
// //                   <div style={{ display: 'flex', gap: '10px' }}>
// //                     <input
// //                       type="text"
// //                       name="customSiteNumber"
// //                       value={formData.customSiteNumber}
// //                       onChange={handleInputChange}
// //                       placeholder="e.g., 2501/05"
// //                       style={{ 
// //                         flex: 1,
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                     <button
// //                       type="button"
// //                       onClick={handleAddCustomSite}
// //                       disabled={!formData.customSiteNumber}
// //                       style={{
// //                         padding: '10px 15px',
// //                         backgroundColor: formData.customSiteNumber ? '#1b5e20' : '#ccc',
// //                         color: 'white',
// //                         border: 'none',
// //                         borderRadius: '4px',
// //                         cursor: formData.customSiteNumber ? 'pointer' : 'not-allowed'
// //                       }}
// //                     >
// //                       Add Site
// //                     </button>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Stock Readings Section */}
// //               <div style={{ marginBottom: '25px' }}>
// //                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Stock Readings (For PDF Report)</h3>
// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Previous Dip/Probe:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="previousDip"
// //                       value={formData.previousDip}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                   </div>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Current Dip/Probe:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="currentDip"
// //                       value={formData.currentDip}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                   </div>
// //                 </div>
                
// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Delivery Received:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="deliveryReceived"
// //                       value={formData.deliveryReceived}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                   </div>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Opening Reading:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="openingReading"
// //                       value={formData.openingReading}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                   </div>
// //                 </div>

// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Closing Reading:
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="closingReading"
// //                       value={formData.closingReading}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                   </div>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Variance (%):
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="variance"
// //                       value={formData.variance}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     />
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Additional Details */}
// //               <div style={{ marginBottom: '25px' }}>
// //                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Additional Details</h3>
// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Fuel Quantity (L):
// //                     </label>
// //                     <input
// //                       type="number"
// //                       name="fuelQuantity"
// //                       value={formData.fuelQuantity}
// //                       onChange={handleInputChange}
// //                       step="0.01"
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Fuel Type:
// //                     </label>
// //                     <select
// //                       name="fuelType"
// //                       value={formData.fuelType}
// //                       onChange={handleInputChange}
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                     >
// //                       <option value="Diesel">Diesel</option>
// //                       <option value="Petrol">Petrol</option>
// //                     </select>
// //                   </div>
// //                 </div>

// //                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Receiver Name:
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="receiverName"
// //                       value={formData.receiverName}
// //                       onChange={handleInputChange}
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                       Employment Number:
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="employmentNumber"
// //                       value={formData.employmentNumber}
// //                       onChange={handleInputChange}
// //                       style={{ 
// //                         width: '100%', 
// //                         padding: '10px',
// //                         border: '1px solid #ddd',
// //                         borderRadius: '4px'
// //                       }}
// //                       required
// //                     />
// //                   </div>
// //                 </div>

// //                 <div style={{ marginTop: '15px' }}>
// //                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                     Receiver Company:
// //                   </label>
// //                   <input
// //                     type="text"
// //                     name="receiverCompany"
// //                     value={formData.receiverCompany}
// //                     onChange={handleInputChange}
// //                     style={{ 
// //                       width: '100%', 
// //                       padding: '10px',
// //                       border: '1px solid #ddd',
// //                       borderRadius: '4px'
// //                     }}
// //                     required
// //                   />
// //                 </div>

// //                 <div style={{ marginTop: '15px' }}>
// //                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                     Transaction Date:
// //                   </label>
// //                   <input
// //                     type="date"
// //                     name="transactionDate"
// //                     value={formData.transactionDate}
// //                     onChange={handleInputChange}
// //                     max={new Date().toISOString().split('T')[0]}
// //                     style={{ 
// //                       width: '100%', 
// //                       padding: '10px',
// //                       border: '1px solid #ddd',
// //                       borderRadius: '4px'
// //                     }}
// //                     required
// //                   />
// //                 </div>

// //                 <div style={{ marginTop: '15px' }}>
// //                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                     Remarks:
// //                   </label>
// //                   <textarea
// //                     name="remarks"
// //                     value={formData.remarks}
// //                     onChange={handleInputChange}
// //                     rows="3"
// //                     style={{ 
// //                       width: '100%', 
// //                       padding: '10px',
// //                       border: '1px solid #ddd',
// //                       borderRadius: '4px',
// //                       resize: 'vertical'
// //                     }}
// //                     placeholder="Additional notes or comments..."
// //                   />
// //                 </div>
// //               </div>

// //               {/* Submit Button */}
// //               <div style={{ textAlign: 'center' }}>
// //                 <button 
// //                   type="submit"
// //                   style={{ 
// //                     padding: '15px 40px',
// //                     backgroundColor: '#1b5e20',
// //                     color: 'white',
// //                     border: 'none',
// //                     borderRadius: '4px',
// //                     fontSize: '16px',
// //                     cursor: 'pointer',
// //                     fontWeight: 'bold'
// //                   }}
// //                 >
// //                   Record Fuel Transaction
// //                 </button>
// //               </div>
// //             </form>
// //           </div>

// //           {/* Recent Transactions */}
// //           <div style={{ 
// //             backgroundColor: 'white', 
// //             padding: '20px', 
// //             borderRadius: '8px',
// //             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
// //           }}>
// //             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
// //               <h3 style={{ color: '#1b5e20', margin: 0 }}>Recent Transactions</h3>
// //               <div style={{ display: 'flex', gap: '10px' }}>
// //                 <button
// //                   onClick={downloadTransactionsExcel}
// //                   disabled={transactions.length === 0}
// //                   style={{
// //                     padding: '8px 16px',
// //                     backgroundColor: transactions.length === 0 ? '#ccc' : '#1b5e20',
// //                     color: 'white',
// //                     border: 'none',
// //                     borderRadius: '4px',
// //                     cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
// //                   }}
// //                 >
// //                   📊 Download Excel
// //                 </button>
// //                 {/* <button
// //                   onClick={populateTemplateExcel}
// //                   disabled={transactions.length === 0}
// //                   style={{
// //                     padding: '8px 16px',
// //                     backgroundColor: transactions.length === 0 ? '#ccc' : '#1976d2',
// //                     color: 'white',
// //                     border: 'none',
// //                     borderRadius: '4px',
// //                     cursor: transactions.length === 0 ? 'not-allowed' : 'pointer',
// //                     marginLeft: '10px'
// //                   }}
// //                 >
// //                   📋 Populate Template
// //                 </button> */}
// //                 <button
// //                   onClick={downloadTransactionsPDF}
// //                   disabled={transactions.length === 0}
// //                   style={{
// //                     padding: '8px 16px',
// //                     backgroundColor: transactions.length === 0 ? '#ccc' : '#d32f2f',
// //                     color: 'white',
// //                     border: 'none',
// //                     borderRadius: '4px',
// //                     cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
// //                   }}
// //                 >
// //                   📄 Download PDF
// //                 </button>
// //               </div>
// //             </div>
            
// //             {transactions.length === 0 ? (
// //               <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
// //                 No transactions recorded yet.
// //               </p>
// //             ) : (
// //               <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
// //                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
// //                   <thead>
// //                     <tr style={{ backgroundColor: '#f5f5f5' }}>
// //                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
// //                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Plant</th>
// //                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Trans Type</th>
// //                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fuel Qty</th>
// //                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Odometer/Hours</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {transactions.slice(0, 10).map(transaction => (
// //                       <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
// //                         <td style={{ padding: '10px' }}>{transaction.transactionDate}</td>
// //                         <td style={{ padding: '10px' }}>{transaction.plantNumber}</td>
// //                         <td style={{ padding: '10px' }}>{transaction.transactionType}</td>
// //                         <td style={{ padding: '10px' }}>{transaction.fuelQuantity}L</td>
// //                         <td style={{ padding: '10px' }}>
// //                           {transaction.odometerReading && `${transaction.odometerReading}KM`}
// //                           {transaction.odometerReading && transaction.hoursReading && ' / '}
// //                           {transaction.hoursReading && `${transaction.hoursReading}HRS`}
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Sidebar */}
// //         <div>
// //           {/* QR Tools */}
// //           <div style={{ 
// //             backgroundColor: 'white', 
// //             padding: '20px', 
// //             borderRadius: '8px',
// //             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
// //             marginBottom: '20px'
// //           }}>
// //             <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>QR Code Tools</h3>
            
// //             <div style={{ marginBottom: '15px' }}>
// //               <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
// //                 Generate QR for Plant:
// //               </label>
// //               <select
// //                 value={selectedPlantForQR}
// //                 onChange={(e) => setSelectedPlantForQR(e.target.value)}
// //                 style={{ 
// //                   width: '100%', 
// //                   padding: '10px',
// //                   border: '1px solid #ddd',
// //                   borderRadius: '4px',
// //                   marginBottom: '10px'
// //                 }}
// //               >
// //                 <option value="">Select Plant Number</option>
// //                 {Object.keys(plantMasterList).map(plantNumber => (
// //                   <option key={plantNumber} value={plantNumber}>
// //                     {plantNumber} - {plantMasterList[plantNumber].name}
// //                   </option>
// //                 ))}
// //               </select>
// //               <button
// //                 onClick={() => generateQRForPlant(selectedPlantForQR)}
// //                 disabled={!selectedPlantForQR}
// //                 style={{
// //                   width: '100%',
// //                   padding: '10px',
// //                   backgroundColor: !selectedPlantForQR ? '#ccc' : '#1b5e20',
// //                   color: 'white',
// //                   border: 'none',
// //                   borderRadius: '4px',
// //                   cursor: !selectedPlantForQR ? 'not-allowed' : 'pointer'
// //                 }}
// //               >
// //                 Generate QR Code
// //               </button>
// //             </div>

// //             <div style={{ display: 'grid', gap: '10px' }}>
// //               <button
// //                 onClick={() => setShowQRScanner(true)}
// //                 style={{
// //                   width: '100%',
// //                   padding: '12px',
// //                   backgroundColor: '#1976d2',
// //                   color: 'white',
// //                   border: 'none',
// //                   borderRadius: '4px',
// //                   cursor: 'pointer'
// //                 }}
// //               >
// //                 📱 Scan Plant QR
// //               </button>
              
// //               <button
// //                 onClick={() => setShowOdometerScanner(true)}
// //                 style={{
// //                   width: '100%',
// //                   padding: '12px',
// //                   backgroundColor: '#1976d2',
// //                   color: 'white',
// //                   border: 'none',
// //                   borderRadius: '4px',
// //                   cursor: 'pointer'
// //                 }}
// //               >
// //                 📊 Scan Odometer/Hours
// //               </button>
// //             </div>
// //           </div>

// //           {/* Quick Stats */}
// //           <div style={{ 
// //             backgroundColor: 'white', 
// //             padding: '20px', 
// //             borderRadius: '8px',
// //             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
// //           }}>
// //             <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Quick Stats</h3>
// //             <div style={{ display: 'grid', gap: '10px' }}>
// //               <div style={{ 
// //                 padding: '15px', 
// //                 backgroundColor: '#e8f5e8', 
// //                 borderRadius: '4px',
// //                 textAlign: 'center'
// //               }}>
// //                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>
// //                   {transactions.length}
// //                 </div>
// //                 <div style={{ color: '#666', fontSize: '14px' }}>Total Transactions</div>
// //               </div>
              
// //               <div style={{ 
// //                 padding: '15px', 
// //                 backgroundColor: '#e3f2fd', 
// //                 borderRadius: '4px',
// //                 textAlign: 'center'
// //               }}>
// //                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
// //                   {new Set(transactions.map(t => t.plantNumber)).size}
// //                 </div>
// //                 <div style={{ color: '#666', fontSize: '14px' }}>Unique Equipment</div>
// //               </div>

// //               <div style={{ 
// //                 padding: '15px', 
// //                 backgroundColor: '#fff3e0', 
// //                 borderRadius: '4px',
// //                 textAlign: 'center'
// //               }}>
// //                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef6c00' }}>
// //                   {transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0).toFixed(0)}L
// //                 </div>
// //                 <div style={{ color: '#666', fontSize: '14px' }}>Total Fuel</div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* QR Scanner Modal */}
// //       {showQRScanner && (
// //         <QRScanner 
// //           onScan={handleQRScan}
// //           onClose={() => setShowQRScanner(false)}
// //         />
// //       )}

// //       {/* Odometer Scanner Modal */}
// //       {showOdometerScanner && (
// //         <QRScanner 
// //           onScan={handleOdometerScan}
// //           onClose={() => setShowOdometerScanner(false)}
// //           title="Scan Odometer & Hours QR"
// //           description="Scan QR code containing kilometers and hours data"
// //         />
// //       )}

// //       {/* QR Generator Modal */}
// //       {showQRGenerator && (
// //         <QRGenerator 
// //           plantNumber={selectedPlantForQR}
// //           onClose={() => setShowQRGenerator(false)}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default Admin;


// import React, { useState, useEffect } from 'react';
// import QRScanner from '../qr/QRScanner';
// import QRGenerator from '../qr/QRGenerator';
// import * as XLSX from 'xlsx';

// const Admin = ({ user, onLogout }) => {
//   const [formData, setFormData] = useState({
//     // Fuel Store Selection
//     fuelStoreCategory: '',
//     selectedFuelStore: '',
    
//     // Plant Number (from QR scan)
//     plantNumber: '',
//     plantName: '',
//     plantType: '',
    
//     // Meter Readings
//     previousMeterReading: '',
//     currentMeterReading: '',
//     meterDifference: '',
    
//     // Odometer/Hours from QR Scan
//     odometerReading: '',
//     hoursReading: '',
    
//     // Contract/Site Allocation
//     contractType: '',
//     customSiteNumber: '',
    
//     // Transaction Type (Ledger Codes)
//     transactionType: '',
    
//     // Fuel Details
//     fuelQuantity: '',
//     fuelType: 'Diesel',
    
//     // Date
//     transactionDate: new Date().toISOString().split('T')[0],
    
//     // Additional details
//     attendantName: user?.fullName || '',
//     receiverName: '',
//     receiverCompany: '',
//     employmentNumber: '',
//     remarks: '',
    
//     // Stock readings for PDF
//     previousDip: '1500',
//     currentDip: '1450',
//     deliveryReceived: '5000',
//     openingReading: '12000',
//     closingReading: '12500',
//     variance: '2.5'
//   });

//   const [showQRScanner, setShowQRScanner] = useState(false);
//   const [showOdometerScanner, setShowOdometerScanner] = useState(false);
//   const [showQRGenerator, setShowQRGenerator] = useState(false);
//   const [selectedPlantForQR, setSelectedPlantForQR] = useState('');
//   const [transactions, setTransactions] = useState([]);
//   const [customSites, setCustomSites] = useState([]);

//   // Fuel Stores Data
//   const fuelStores = {
//     service_trucks: [
//       'FSH01 - 01',
//       'FSH02 - 01', 
//       'FSH03 - 01',
//       'FSH04 - 01'
//     ],
//     fuel_trailers: [
//       'SLD 02 (1000L)',
//       'SLD 07 (2000L)',
//       'SLD 09 (1000L)'
//     ],
//     underground_tanks: [
//       'UDT 49',
//       'UPT 49',
//       'UDT 890',
//       'STD 02',
//       'STD 05'
//     ]
//   };

//   // Transaction Types (Ledger Codes)
//   const transactionTypes = [
//     'Plant Fuel to Contract',
//     'Plant Fuel Return from Contract',
//     'Stock Issue to Balance Sheet',
//     'Stock Issue to Contracts',
//     'Stock Issue to Overheads',
//     'Stock Issue Plant',
//     'Stock Receipt from Supplier',
//     'Stock Return from Balance Sheet',
//     'Stock Return from Contract',
//     'Stock Return from Plant',
//     'Stock Return from Overheads',
//     'Stock Return to Supplier',
//     'Stock Take On'
//   ];

//   // Contract/Site Options
//   const contractOptions = [
//     'AMPLANT 49',
//     'HILLARY (Site 2163)',
//     'HILLARY (Site 2102)',
//     'Polokwane Surfacing 890',
//     'Sundries',
//     'Custom Site'
//   ];

//   // Plant Equipment Master List
//   const plantMasterList = {
//     // Asphalt Pavers
//     'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD07': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD08': { name: 'ASPHALT PAVER DYNAPAC F161-8W', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD09': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD11': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APN01': { name: 'ASPHALT PAVER NIGATA', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APV10': { name: 'ASPHALT PAVER VOGELE 1800 SPRAY JET', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },

//     // Asphalt Plants
//     'A-APP02': { name: 'ASPHALT MIXING PLANT MOBILE 40tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP03': { name: 'ASPHALT MIXING PLANT MOBILE 60tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP04': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP06': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },

//     // Shuttle Buggies
//     'A-ASR01': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
//     'A-ASR02': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },

//     // Buses
//     'A-BBS03': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
//     'A-BBS04': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },

//     // Bitumen Equipment
//     'A-BDT02': { name: 'BITUMEN TRAILER 1kl', type: 'Bitumen Trailer', fuelType: 'Bitumen', category: 'specialized' },
//     'A-BDT06': { name: 'CRACKSEALING TRAILER', type: 'Cracksealing Trailer', fuelType: 'Diesel', category: 'specialized' },
//     'A-BEP01': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-BEP02': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },

//     // Bakkies and Light Vehicles
//     'A-BNS08': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BNS09': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BNS10': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC106': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC107': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC108': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },

//     // Brooms
//     'A-BRM11': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM12': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM13': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM14': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },

//     // Heavy Bakkies
//     'A-BTH100': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH104': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH115': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },

//     // Crushers
//     'A-CCK05': { name: 'KLEEMANN MOBICONE MCO 9 S EVO CONE', type: 'Cone Crusher', fuelType: 'Diesel', category: 'crushing' },
//     'A-CHR03': { name: 'RM HORIZONTAL IMPACT CRUSHER 100GO', type: 'Impact Crusher', fuelType: 'Diesel', category: 'crushing' },
//     'A-CJK06': { name: 'KLEEMANN MOBICAT MC 110 R EVO JAW', type: 'Jaw Crusher', fuelType: 'Diesel', category: 'crushing' },

//     // Screens
//     'A-CSK01': { name: 'KLEEMANN MOBICAT MC 703 EVO SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
//     'A-CSM02': { name: 'METSO ST2.8 SCALPER SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
//     'A-CSC03': { name: 'CHIEFTAIN 600, DOUBLE DECK SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },

//     // Chipsreaders
//     'A-CSE07': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE08': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE09': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE10': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },

//     // Dozers
//     'A-DOK13': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-DOK15': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-DOK16': { name: 'DOZER KOMATSU D155 40t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },

//     // Excavators
//     'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },

//     // Flatdecks and Trucks
//     'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },

//     // Fuel Trailers
//     'SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },

//     // Static Tanks
//     'STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },

//     // Articulated Dump Trucks (ADTs)
//     'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    
//     // Small Equipment and Tools
//     'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
    
//     setFormData(prev => {
//       const newData = {
//         ...prev,
//         [name]: value
//       };

//       // Calculate meter difference when both readings are entered
//       if ((name === 'previousMeterReading' || name === 'currentMeterReading') && 
//           newData.previousMeterReading && newData.currentMeterReading) {
//         const prev = parseFloat(newData.previousMeterReading) || 0;
//         const current = parseFloat(newData.currentMeterReading) || 0;
//         newData.meterDifference = (current - prev).toFixed(2);
//       }

//       // Reset selected fuel store when category changes
//       if (name === 'fuelStoreCategory') {
//         newData.selectedFuelStore = '';
//       }

//       return newData;
//     });
//   };

//   // Handle Plant QR Scan
//   const handleQRScan = (scannedData) => {
//     const plantInfo = plantMasterList[scannedData] || {
//       name: scannedData,
//       type: 'Unknown Equipment',
//       fuelType: 'Diesel',
//       category: 'general'
//     };

//     setFormData(prev => ({
//       ...prev,
//       plantNumber: scannedData,
//       plantName: plantInfo.name,
//       plantType: plantInfo.type,
//       fuelType: plantInfo.fuelType
//     }));

//     setShowQRScanner(false);
//   };

//   // Handle Odometer/Hours QR Scan
//   const handleOdometerScan = (scannedData) => {
//     try {
//       // Expected format: "KM:1234.5,HRS:56.7" or similar
//       const data = scannedData.split(',');
//       let km = '';
//       let hrs = '';

//       data.forEach(item => {
//         if (item.includes('KM:') || item.includes('km:') || item.includes('KILOS:')) {
//           km = item.split(':')[1];
//         }
//         if (item.includes('HRS:') || item.includes('hrs:') || item.includes('HOURS:')) {
//           hrs = item.split(':')[1];
//         }
//       });

//       setFormData(prev => ({
//         ...prev,
//         odometerReading: km || '',
//         hoursReading: hrs || ''
//       }));

//       setShowOdometerScanner(false);
      
//       if (!km && !hrs) {
//         alert('No odometer or hours data found in QR code. Please scan again or enter manually.');
//       }
//     } catch (error) {
//       console.error('Error parsing odometer QR:', error);
//       alert('Error reading odometer QR code. Please try again or enter manually.');
//     }
//   };

//   // Handle adding custom site
//   const handleAddCustomSite = () => {
//     if (formData.customSiteNumber && !customSites.includes(formData.customSiteNumber)) {
//       setCustomSites(prev => [...prev, formData.customSiteNumber]);
//       setFormData(prev => ({
//         ...prev,
//         contractType: formData.customSiteNumber,
//         customSiteNumber: ''
//       }));
//     }
//   };

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Validate date - cannot be previous date
//     const selectedDate = new Date(formData.transactionDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     if (selectedDate < today) {
//       alert('Cannot select previous dates. Please select today or a future date.');
//       return;
//     }

//     // Validate meter readings
//     if (parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading)) {
//       alert('Current meter reading must be greater than previous reading.');
//       return;
//     }

//     // Create transaction object
//     const transaction = {
//       id: Date.now(),
//       timestamp: new Date().toISOString(),
//       ...formData,
//       attendantName: user.fullName,
//       userId: user.id
//     };

//     // Add to transactions
//     setTransactions(prev => [transaction, ...prev]);
    
//     // Reset form (keep stock readings for PDF)
//     setFormData(prev => ({
//       fuelStoreCategory: '',
//       selectedFuelStore: '',
//       plantNumber: '',
//       plantName: '',
//       plantType: '',
//       previousMeterReading: '',
//       currentMeterReading: '',
//       meterDifference: '',
//       odometerReading: '',
//       hoursReading: '',
//       contractType: '',
//       customSiteNumber: '',
//       transactionType: '',
//       fuelQuantity: '',
//       fuelType: 'Diesel',
//       transactionDate: new Date().toISOString().split('T')[0],
//       attendantName: user.fullName,
//       receiverName: '',
//       receiverCompany: '',
//       employmentNumber: '',
//       remarks: '',
//       // Keep stock readings for PDF
//       previousDip: prev.previousDip,
//       currentDip: prev.currentDip,
//       deliveryReceived: prev.deliveryReceived,
//       openingReading: prev.openingReading,
//       closingReading: prev.closingReading,
//       variance: prev.variance
//     }));

//     alert('Transaction recorded successfully!');
//   };

//   // Simple Excel download
//   const downloadTransactionsExcel = () => {
//     if (transactions.length === 0) {
//       alert('No transactions to download.');
//       return;
//     }

//     try {
//       const { utils, writeFile } = XLSX;
      
//       // Prepare data for Excel
//       const excelData = transactions.map(transaction => ({
//         'Transaction ID': transaction.id,
//         'Date': transaction.transactionDate,
//         'Plant Number': transaction.plantNumber,
//         'Plant Name': transaction.plantName || '',
//         'Fuel Store': transaction.selectedFuelStore,
//         'Previous Reading': transaction.previousMeterReading,
//         'Current Reading': transaction.currentMeterReading,
//         'Difference': transaction.meterDifference,
//         'Odometer (KM)': transaction.odometerReading,
//         'Hours': transaction.hoursReading,
//         'Transaction Type': transaction.transactionType,
//         'Contract/Site': transaction.contractType,
//         'Fuel Quantity (L)': transaction.fuelQuantity,
//         'Fuel Type': transaction.fuelType,
//         'Receiver Name': transaction.receiverName,
//         'Receiver Company': transaction.receiverCompany,
//         'Employment Number': transaction.employmentNumber,
//         'Attendant': transaction.attendantName,
//         'Remarks': transaction.remarks || ''
//       }));

//       const ws = utils.json_to_sheet(excelData);
//       const wb = utils.book_new();
//       utils.book_append_sheet(wb, ws, 'Fuel Transactions');
      
//       // Generate and download the file
//       writeFile(wb, `fuel-transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
      
//     } catch (error) {
//       console.error('Excel download failed:', error);
//       alert('Excel download failed. Please try again.');
//     }
//   };

//   // Simple PDF download
//   const downloadTransactionsPDF = () => {
//     if (transactions.length === 0) {
//       alert('No transactions to download.');
//       return;
//     }

//     // Simple dynamic import that always works
//     import('jspdf').then(({ jsPDF }) => {
//       const doc = new jsPDF();
      
//       // Title
//       doc.setFontSize(16);
//       doc.text('FUEL TRANSACTIONS REPORT', 20, 20);
      
//       // Details
//       doc.setFontSize(10);
//       doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
//       doc.text(`Generated by: ${user.fullName}`, 20, 37);
//       doc.text(`Total Transactions: ${transactions.length}`, 20, 44);
      
//       const totalFuel = transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0);
//       doc.text(`Total Fuel: ${totalFuel.toFixed(2)}L`, 20, 51);
      
//       // Stock Readings Summary
//       doc.text('STOCK READINGS:', 20, 65);
//       doc.text(`Previous Dip: ${formData.previousDip || 'N/A'}`, 20, 72);
//       doc.text(`Current Dip: ${formData.currentDip || 'N/A'}`, 20, 79);
//       doc.text(`Delivery Received: ${formData.deliveryReceived || 'N/A'}`, 20, 86);
      
//       // Transactions List
//       let yPos = 100;
//       doc.text('RECENT TRANSACTIONS:', 20, yPos);
//       yPos += 10;
      
//       transactions.slice(0, 15).forEach((transaction, index) => {
//         if (yPos > 270) {
//           doc.addPage();
//           yPos = 20;
//         }
        
//         const line = `${transaction.plantNumber} | ${transaction.fuelQuantity}L | ${transaction.transactionType}`;
//         doc.text(line, 20, yPos);
//         yPos += 7;
//       });
      
//       doc.save(`fuel-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
//     }).catch((error) => {
//       console.error('PDF failed:', error);
//       alert('PDF generation failed. Please try downloading Excel instead.');
//     });
//   };

//   // Generate QR for specific plant
//   const generateQRForPlant = (plantNumber) => {
//     if (plantNumber) {
//       setSelectedPlantForQR(plantNumber);
//       setShowQRGenerator(true);
//     }
//   };

//   // Function to get user initials for avatar
//   const getUserInitials = (fullName) => {
//     if (!fullName) return 'U';
//     return fullName
//       .split(' ')
//       .map(name => name[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   // Function to get random color for avatar based on user name
//   const getAvatarColor = (name) => {
//     const colors = [
//       '#1b5e20', '#1976d2', '#d32f2f', '#7b1fa2', 
//       '#ff9800', '#0097a7', '#388e3c', '#5d4037'
//     ];
//     if (!name) return colors[0];
//     const index = name.charCodeAt(0) % colors.length;
//     return colors[index];
//   };

//   return (
//     <div style={{ 
//       padding: '20px', 
//       maxWidth: '1400px', 
//       margin: '0 auto',
//       backgroundColor: '#f5f5f5',
//       minHeight: '100vh'
//     }}>
//       {/* Header with Logo and User Profile */}
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '30px',
//         backgroundColor: 'white',
//         padding: '15px 25px',
//         borderRadius: '12px',
//         boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//         border: '1px solid #e1e5e9'
//       }}>
//         {/* Logo Section - Left */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//           <div style={{
//             width: '90px',
//             height: '90px',
//             borderRadius: '50%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             overflow: 'hidden',
//             backgroundColor: 'white',
//             border: '0px solid #e1e5e9'
//           }}>
//             <img 
//               src="/fuel2.jpg" 
//               alt="FMS Logo"
//               style={{
//                 width: '100%',
//                 height: '130%',
//                 objectFit: 'cover',
//                 borderRadius: '50%'
//               }}
//               onError={(e) => {
//                 // Fallback if image doesn't load
//                 e.target.style.display = 'none';
//                 e.target.nextSibling.style.display = 'flex';
//               }}
//             />
//             <div style={{
//               width: '100%',
//               height: '100%',
//               backgroundColor: '#28a745',
//               borderRadius: '50%',
//               display: 'none',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'white',
//               fontSize: '16px',
//               fontWeight: 'bold'
//             }}>
//               FMS
//             </div>
//           </div>
//           <div>
//             <h2 style={{ 
//               margin: 0, 
//               color: '#1b5e20',
//               fontSize: '20px',
//               fontWeight: '600'
//             }}>
//               Fuel Management System
//             </h2>
//             <p style={{ 
//               margin: 0, 
//               color: '#666',
//               fontSize: '14px'
//             }}>
//               Clerk/Attendant Dashboard
//             </p>
//           </div>
//         </div>

//         {/* User Profile Section - Right */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//           <div style={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: '12px',
//             padding: '8px 16px',
//             backgroundColor: '#f8f9fa',
//             borderRadius: '25px',
//             border: '1px solid #e1e5e9'
//           }}>
//             {/* User Avatar */}
//             <div style={{
//               width: '40px',
//               height: '40px',
//               borderRadius: '50%',
//               backgroundColor: getAvatarColor(user?.fullName),
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'white',
//               fontSize: '14px',
//               fontWeight: 'bold',
//               border: '2px solid white',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//             }}>
//               {getUserInitials(user?.fullName)}
//             </div>
            
//             {/* User Info */}
//             <div style={{ textAlign: 'right' }}>
//               <div style={{ 
//                 fontSize: '14px', 
//                 fontWeight: '600', 
//                 color: '#333',
//                 lineHeight: '1.2'
//               }}>
//                 {user?.fullName || 'User'}
//               </div>
//               <div style={{ 
//                 fontSize: '12px', 
//                 color: '#666',
//                 lineHeight: '1.2'
//               }}>
//                 {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Clerk/Attendant'}
//               </div>
//             </div>
//           </div>

//           {/* Logout Button */}
//           <button 
//             onClick={onLogout}
//             style={{ 
//               padding: '10px 20px', 
//               backgroundColor: '#d32f2f',
//               color: 'white',
//               border: 'none',
//               borderRadius: '25px',
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '600',
//               transition: 'all 0.2s',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#b71c1c';
//               e.target.style.transform = 'translateY(-1px)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#d32f2f';
//               e.target.style.transform = 'translateY(0)';
//             }}
//           >
//             <span>🚪</span>
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
//         {/* Main Content */}
//         <div>
//           {/* Transaction Form */}
//           <div style={{ 
//             backgroundColor: 'white', 
//             padding: '30px', 
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//             marginBottom: '20px'
//           }}>
//             <h2 style={{ color: '#1b5e20', marginBottom: '25px' }}>New Fuel Transaction</h2>
            
//             <form onSubmit={handleSubmit}>
//               {/* QR Scan Sections */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Equipment & Readings Scan</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Plant Number (QR Scan):
//                     </label>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <input
//                         type="text"
//                         name="plantNumber"
//                         value={formData.plantNumber}
//                         onChange={handleInputChange}
//                         placeholder="Scan plant QR code"
//                         style={{ 
//                           flex: 1,
//                           padding: '10px',
//                           border: '1px solid #ddd',
//                           borderRadius: '4px'
//                         }}
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowQRScanner(true)}
//                         style={{
//                           padding: '10px',
//                           backgroundColor: '#1b5e20',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '4px',
//                           cursor: 'pointer',
//                           whiteSpace: 'nowrap'
//                         }}
//                       >
//                         📱 Scan Plant
//                       </button>
//                     </div>
//                     {formData.plantName && (
//                       <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
//                         {formData.plantName} - {formData.plantType}
//                       </small>
//                     )}
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Odometer & Hours (QR Scan):
//                     </label>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <input
//                         type="text"
//                         value={formData.odometerReading || formData.hoursReading ? 
//                           `KM: ${formData.odometerReading} | HRS: ${formData.hoursReading}` : ''}
//                         placeholder="Scan odometer/hours QR"
//                         readOnly
//                         style={{ 
//                           flex: 1,
//                           padding: '10px',
//                           border: '1px solid #ddd',
//                           borderRadius: '4px',
//                           backgroundColor: '#f9f9f9'
//                         }}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowOdometerScanner(true)}
//                         style={{
//                           padding: '10px',
//                           backgroundColor: '#1976d2',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '4px',
//                           cursor: 'pointer',
//                           whiteSpace: 'nowrap'
//                         }}
//                       >
//                         📱 Scan Meter
//                       </button>
//                     </div>
//                     <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
//                       Scans both kilometers and hours from equipment QR
//                     </small>
//                   </div>
//                 </div>

//                 {/* Manual Odometer/Hours Input */}
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Odometer (KM) - Manual:
//                     </label>
//                     <input
//                       type="number"
//                       name="odometerReading"
//                       value={formData.odometerReading}
//                       onChange={handleInputChange}
//                       step="0.1"
//                       placeholder="Or enter manually"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Hours - Manual:
//                     </label>
//                     <input
//                       type="number"
//                       name="hoursReading"
//                       value={formData.hoursReading}
//                       onChange={handleInputChange}
//                       step="0.1"
//                       placeholder="Or enter manually"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Fuel Store Selection */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Fuel Store Selection</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Fuel Store Category:
//                     </label>
//                     <select
//                       name="fuelStoreCategory"
//                       value={formData.fuelStoreCategory}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     >
//                       <option value="">Select Category</option>
//                       <option value="service_trucks">Service Trucks</option>
//                       <option value="fuel_trailers">Fuel Trailers</option>
//                       <option value="underground_tanks">Underground Tanks</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Specific Store:
//                     </label>
//                     <select
//                       name="selectedFuelStore"
//                       value={formData.selectedFuelStore}
//                       onChange={handleInputChange}
//                       disabled={!formData.fuelStoreCategory}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     >
//                       <option value="">Select Store</option>
//                       {formData.fuelStoreCategory && fuelStores[formData.fuelStoreCategory]?.map(store => (
//                         <option key={store} value={store}>{store}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Meter Readings */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Meter Readings</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Previous Reading:
//                     </label>
//                     <input
//                       type="number"
//                       name="previousMeterReading"
//                       value={formData.previousMeterReading}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Current Reading:
//                     </label>
//                     <input
//                       type="number"
//                       name="currentMeterReading"
//                       value={formData.currentMeterReading}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       min={parseFloat(formData.previousMeterReading) + 0.01 || 0}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading) 
//                           ? '2px solid red' : '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Difference:
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.meterDifference || ''}
//                       readOnly
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px',
//                         backgroundColor: '#f5f5f5',
//                         fontWeight: 'bold',
//                         color: formData.meterDifference ? '#1b5e20' : '#666'
//                       }}
//                       placeholder="Auto-calculated"
//                     />
//                   </div>
//                 </div>
//                 {formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading) && (
//                   <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
//                     Current reading must be greater than previous reading
//                   </small>
//                 )}
//               </div>

//               {/* Transaction Type and Contract/Site */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Transaction & Site Details</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Transaction Type (Ledger Code):
//                     </label>
//                     <select
//                       name="transactionType"
//                       value={formData.transactionType}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     >
//                       <option value="">Select Transaction Type</option>
//                       {transactionTypes.map(type => (
//                         <option key={type} value={type}>{type}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Contract/Site:
//                     </label>
//                     <select
//                       name="contractType"
//                       value={formData.contractType}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     >
//                       <option value="">Select Contract/Site</option>
//                       {contractOptions.map(contract => (
//                         <option key={contract} value={contract}>{contract}</option>
//                       ))}
//                       {customSites.map(site => (
//                         <option key={site} value={site}>{site} (Custom)</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Add Custom Site:
//                   </label>
//                   <div style={{ display: 'flex', gap: '10px' }}>
//                     <input
//                       type="text"
//                       name="customSiteNumber"
//                       value={formData.customSiteNumber}
//                       onChange={handleInputChange}
//                       placeholder="e.g., 2501/05"
//                       style={{ 
//                         flex: 1,
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                     <button
//                       type="button"
//                       onClick={handleAddCustomSite}
//                       disabled={!formData.customSiteNumber}
//                       style={{
//                         padding: '10px 15px',
//                         backgroundColor: formData.customSiteNumber ? '#1b5e20' : '#ccc',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         cursor: formData.customSiteNumber ? 'pointer' : 'not-allowed'
//                       }}
//                     >
//                       Add Site
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Stock Readings Section */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Stock Readings (For PDF Report)</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Previous Dip/Probe:
//                     </label>
//                     <input
//                       type="number"
//                       name="previousDip"
//                       value={formData.previousDip}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Current Dip/Probe:
//                     </label>
//                     <input
//                       type="number"
//                       name="currentDip"
//                       value={formData.currentDip}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                 </div>
                
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Delivery Received:
//                     </label>
//                     <input
//                       type="number"
//                       name="deliveryReceived"
//                       value={formData.deliveryReceived}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Opening Reading:
//                     </label>
//                     <input
//                       type="number"
//                       name="openingReading"
//                       value={formData.openingReading}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Closing Reading:
//                     </label>
//                     <input
//                       type="number"
//                       name="closingReading"
//                       value={formData.closingReading}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Variance (%):
//                     </label>
//                     <input
//                       type="number"
//                       name="variance"
//                       value={formData.variance}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Details */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Additional Details</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Fuel Quantity (L):
//                     </label>
//                     <input
//                       type="number"
//                       name="fuelQuantity"
//                       value={formData.fuelQuantity}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Fuel Type:
//                     </label>
//                     <select
//                       name="fuelType"
//                       value={formData.fuelType}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     >
//                       <option value="Diesel">Diesel</option>
//                       <option value="Petrol">Petrol</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Receiver Name:
//                     </label>
//                     <input
//                       type="text"
//                       name="receiverName"
//                       value={formData.receiverName}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Employment Number:
//                     </label>
//                     <input
//                       type="text"
//                       name="employmentNumber"
//                       value={formData.employmentNumber}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Receiver Company:
//                   </label>
//                   <input
//                     type="text"
//                     name="receiverCompany"
//                     value={formData.receiverCompany}
//                     onChange={handleInputChange}
//                     style={{ 
//                       width: '100%', 
//                       padding: '10px',
//                       border: '1px solid #ddd',
//                       borderRadius: '4px'
//                     }}
//                     required
//                   />
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Transaction Date:
//                   </label>
//                   <input
//                     type="date"
//                     name="transactionDate"
//                     value={formData.transactionDate}
//                     onChange={handleInputChange}
//                     max={new Date().toISOString().split('T')[0]}
//                     style={{ 
//                       width: '100%', 
//                       padding: '10px',
//                       border: '1px solid #ddd',
//                       borderRadius: '4px'
//                     }}
//                     required
//                   />
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Remarks:
//                   </label>
//                   <textarea
//                     name="remarks"
//                     value={formData.remarks}
//                     onChange={handleInputChange}
//                     rows="3"
//                     style={{ 
//                       width: '100%', 
//                       padding: '10px',
//                       border: '1px solid #ddd',
//                       borderRadius: '4px',
//                       resize: 'vertical'
//                     }}
//                     placeholder="Additional notes or comments..."
//                   />
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div style={{ textAlign: 'center' }}>
//                 <button 
//                   type="submit"
//                   style={{ 
//                     padding: '15px 40px',
//                     backgroundColor: '#1b5e20',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     fontSize: '16px',
//                     cursor: 'pointer',
//                     fontWeight: 'bold'
//                   }}
//                 >
//                   Record Fuel Transaction
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Recent Transactions */}
//           <div style={{ 
//             backgroundColor: 'white', 
//             padding: '20px', 
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//               <h3 style={{ color: '#1b5e20', margin: 0 }}>Recent Transactions</h3>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button
//                   onClick={downloadTransactionsExcel}
//                   disabled={transactions.length === 0}
//                   style={{
//                     padding: '8px 16px',
//                     backgroundColor: transactions.length === 0 ? '#ccc' : '#1b5e20',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   📊 Download Excel
//                 </button>
//                 <button
//                   onClick={downloadTransactionsPDF}
//                   disabled={transactions.length === 0}
//                   style={{
//                     padding: '8px 16px',
//                     backgroundColor: transactions.length === 0 ? '#ccc' : '#d32f2f',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   📄 Download PDF
//                 </button>
//               </div>
//             </div>
            
//             {transactions.length === 0 ? (
//               <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
//                 No transactions recorded yet.
//               </p>
//             ) : (
//               <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                   <thead>
//                     <tr style={{ backgroundColor: '#f5f5f5' }}>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Plant</th>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Trans Type</th>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fuel Qty</th>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Odometer/Hours</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {transactions.slice(0, 10).map(transaction => (
//                       <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
//                         <td style={{ padding: '10px' }}>{transaction.transactionDate}</td>
//                         <td style={{ padding: '10px' }}>{transaction.plantNumber}</td>
//                         <td style={{ padding: '10px' }}>{transaction.transactionType}</td>
//                         <td style={{ padding: '10px' }}>{transaction.fuelQuantity}L</td>
//                         <td style={{ padding: '10px' }}>
//                           {transaction.odometerReading && `${transaction.odometerReading}KM`}
//                           {transaction.odometerReading && transaction.hoursReading && ' / '}
//                           {transaction.hoursReading && `${transaction.hoursReading}HRS`}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div>
//           {/* QR Tools */}
//           <div style={{ 
//             backgroundColor: 'white', 
//             padding: '20px', 
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//             marginBottom: '20px'
//           }}>
//             <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>QR Code Tools</h3>
            
//             <div style={{ marginBottom: '15px' }}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                 Generate QR for Plant:
//               </label>
//               <select
//                 value={selectedPlantForQR}
//                 onChange={(e) => setSelectedPlantForQR(e.target.value)}
//                 style={{ 
//                   width: '100%', 
//                   padding: '10px',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   marginBottom: '10px'
//                 }}
//               >
//                 <option value="">Select Plant Number</option>
//                 {Object.keys(plantMasterList).map(plantNumber => (
//                   <option key={plantNumber} value={plantNumber}>
//                     {plantNumber} - {plantMasterList[plantNumber].name}
//                   </option>
//                 ))}
//               </select>
//               <button
//                 onClick={() => generateQRForPlant(selectedPlantForQR)}
//                 disabled={!selectedPlantForQR}
//                 style={{
//                   width: '100%',
//                   padding: '10px',
//                   backgroundColor: !selectedPlantForQR ? '#ccc' : '#1b5e20',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: !selectedPlantForQR ? 'not-allowed' : 'pointer'
//                 }}
//               >
//                 Generate QR Code
//               </button>
//             </div>

//             <div style={{ display: 'grid', gap: '10px' }}>
//               <button
//                 onClick={() => setShowQRScanner(true)}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   backgroundColor: '#1976d2',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 📱 Scan Plant QR
//               </button>
              
//               <button
//                 onClick={() => setShowOdometerScanner(true)}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   backgroundColor: '#1976d2',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 📊 Scan Odometer/Hours
//               </button>
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div style={{ 
//             backgroundColor: 'white', 
//             padding: '20px', 
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//           }}>
//             <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Quick Stats</h3>
//             <div style={{ display: 'grid', gap: '10px' }}>
//               <div style={{ 
//                 padding: '15px', 
//                 backgroundColor: '#e8f5e8', 
//                 borderRadius: '4px',
//                 textAlign: 'center'
//               }}>
//                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>
//                   {transactions.length}
//                 </div>
//                 <div style={{ color: '#666', fontSize: '14px' }}>Total Transactions</div>
//               </div>
              
//               <div style={{ 
//                 padding: '15px', 
//                 backgroundColor: '#e3f2fd', 
//                 borderRadius: '4px',
//                 textAlign: 'center'
//               }}>
//                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
//                   {new Set(transactions.map(t => t.plantNumber)).size}
//                 </div>
//                 <div style={{ color: '#666', fontSize: '14px' }}>Unique Equipment</div>
//               </div>

//               <div style={{ 
//                 padding: '15px', 
//                 backgroundColor: '#fff3e0', 
//                 borderRadius: '4px',
//                 textAlign: 'center'
//               }}>
//                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef6c00' }}>
//                   {transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0).toFixed(0)}L
//                 </div>
//                 <div style={{ color: '#666', fontSize: '14px' }}>Total Fuel</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* QR Scanner Modal */}
//       {showQRScanner && (
//         <QRScanner 
//           onScan={handleQRScan}
//           onClose={() => setShowQRScanner(false)}
//         />
//       )}

//       {/* Odometer Scanner Modal */}
//       {showOdometerScanner && (
//         <QRScanner 
//           onScan={handleOdometerScan}
//           onClose={() => setShowOdometerScanner(false)}
//           title="Scan Odometer & Hours QR"
//           description="Scan QR code containing kilometers and hours data"
//         />
//       )}

//       {/* QR Generator Modal */}
//       {showQRGenerator && (
//         <QRGenerator 
//           plantNumber={selectedPlantForQR}
//           onClose={() => setShowQRGenerator(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Admin;

// import React, { useState, useEffect } from 'react';
// import QRScanner from '../qr/QRScanner';
// import QRGenerator from '../qr/QRGenerator';
// import * as XLSX from 'xlsx';

// const Admin = ({ user, onLogout }) => {
//   const [formData, setFormData] = useState({
//     // Fuel Store Selection
//     fuelStoreCategory: '',
//     selectedFuelStore: '',
    
//     // Plant Number (from QR scan)
//     plantNumber: '',
//     plantName: '',
//     plantType: '',
    
//     // Separate Odometer Readings
//     odometerKilos: '',        // For kilometers
//     odometerHours: '',        // For hours
    
//     // Meter Readings - Before and After Refueling
//     previousMeterReading: '', // Previous reading (readonly - from last transaction)
//     currentMeterReadingBefore: '', // Current reading before refueling
//     fuelQuantity: '',         // Liters refilled
//     currentMeterReadingAfter: '',  // Auto-calculated: before + fuel quantity
    
//     // Validation flags
//     meterVarianceFlag: false, // Flag if current before doesn't match previous
//     meterVarianceMessage: '', // Message explaining variance
    
//     // Contract/Site Allocation
//     contractType: '',
//     customSiteNumber: '',
    
//     // Transaction Type (Ledger Codes)
//     transactionType: '',
    
//     // Fuel Details
//     fuelType: 'Diesel',
    
//     // Date
//     transactionDate: new Date().toISOString().split('T')[0],
    
//     // Additional details
//     attendantName: user?.fullName || '',
//     receiverName: '',
//     receiverCompany: '',
//     employmentNumber: '',
//     remarks: '',
    
//     // Stock readings for PDF
//     previousDip: '1500',
//     currentDip: '1450',
//     deliveryReceived: '5000',
//     openingReading: '12000',
//     closingReading: '12500',
//     variance: '2.5'
//   });

//   const [showQRScanner, setShowQRScanner] = useState(false);
//   const [showOdometerKilosScanner, setShowOdometerKilosScanner] = useState(false);
//   const [showOdometerHoursScanner, setShowOdometerHoursScanner] = useState(false);
//   const [showQRGenerator, setShowQRGenerator] = useState(false);
//   const [selectedPlantForQR, setSelectedPlantForQR] = useState('');
//   const [transactions, setTransactions] = useState([]);
//   const [customSites, setCustomSites] = useState([]);
//   const [storeReadings, setStoreReadings] = useState({}); // Track store readings
//   const [isFirstTransaction, setIsFirstTransaction] = useState(true); // Track if it's first transaction for the plant

//   // Fuel Stores Data
//   const fuelStores = {
//     service_trucks: [
//       'FSH01 - 01',
//       'FSH02 - 01', 
//       'FSH03 - 01',
//       'FSH04 - 01'
//     ],
//     fuel_trailers: [
//       'SLD 02 (1000L)',
//       'SLD 07 (2000L)',
//       'SLD 09 (1000L)'
//     ],
//     underground_tanks: [
//       'UDT 49 (Workshop Underground Tank)',
//       'UPT 49 (Workshop Petrol Underground Tank)',
//       'UDT 890 (Palmiet Underground Tank)',
//       'STD 02 (Musina Static Tank)',
//       'STD 05 (Musina Static Tank)'
//     ]
//   };

//   // Transaction Types (Ledger Codes)
//   const transactionTypes = [
//     'Plant Fuel to Contract',
//     'Plant Fuel Return from Contract',
//     'Stock Issue to Balance Sheet',
//     'Stock Issue to Contracts',
//     'Stock Issue to Overheads',
//     'Stock Issue Plant',
//     'Stock Receipt from Supplier',
//     'Stock Return from Balance Sheet',
//     'Stock Return from Contract',
//     'Stock Return from Plant',
//     'Stock Return from Overheads',
//     'Stock Return to Supplier',
//     'Stock Take On'
//   ];

//   // Contract/Site Options
//   const contractOptions = [
//     'AMPLANT 49',
//     'HILLARY (Site 2163)',
//     'HILLARY (Site 2102)',
//     'Polokwane Surfacing 890',
//     'Sundries',
//     'Custom Site'
//   ];

//   // Plant Equipment Master List
//   const plantMasterList = {
//     // Asphalt Pavers
//     'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD07': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD08': { name: 'ASPHALT PAVER DYNAPAC F161-8W', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD09': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APD11': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APN01': { name: 'ASPHALT PAVER NIGATA', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
//     'A-APV10': { name: 'ASPHALT PAVER VOGELE 1800 SPRAY JET', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },

//     // Asphalt Plants
//     'A-APP02': { name: 'ASPHALT MIXING PLANT MOBILE 40tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP03': { name: 'ASPHALT MIXING PLANT MOBILE 60tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP04': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-APP06': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },

//     // Shuttle Buggies
//     'A-ASR01': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
//     'A-ASR02': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },

//     // Buses
//     'A-BBS03': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
//     'A-BBS04': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },

//     // Bitumen Equipment
//     'A-BDT02': { name: 'BITUMEN TRAILER 1kl', type: 'Bitumen Trailer', fuelType: 'Bitumen', category: 'specialized' },
//     'A-BDT06': { name: 'CRACKSEALING TRAILER', type: 'Cracksealing Trailer', fuelType: 'Diesel', category: 'specialized' },
//     'A-BEP01': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
//     'A-BEP02': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },

//     // Bakkies and Light Vehicles
//     'A-BNS08': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BNS09': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BNS10': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC106': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC107': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-BOC108': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },

//     // Brooms
//     'A-BRM11': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM12': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM13': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
//     'A-BRM14': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },

//     // Heavy Bakkies
//     'A-BTH100': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH104': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH115': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },

//     // Crushers
//     'A-CCK05': { name: 'KLEEMANN MOBICONE MCO 9 S EVO CONE', type: 'Cone Crusher', fuelType: 'Diesel', category: 'crushing' },
//     'A-CHR03': { name: 'RM HORIZONTAL IMPACT CRUSHER 100GO', type: 'Impact Crusher', fuelType: 'Diesel', category: 'crushing' },
//     'A-CJK06': { name: 'KLEEMANN MOBICAT MC 110 R EVO JAW', type: 'Jaw Crusher', fuelType: 'Diesel', category: 'crushing' },

//     // Screens
//     'A-CSK01': { name: 'KLEEMANN MOBICAT MC 703 EVO SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
//     'A-CSM02': { name: 'METSO ST2.8 SCALPER SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
//     'A-CSC03': { name: 'CHIEFTAIN 600, DOUBLE DECK SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },

//     // Chipsreaders
//     'A-CSE07': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE08': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE09': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
//     'A-CSE10': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },

//     // Dozers
//     'A-DOK13': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-DOK15': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-DOK16': { name: 'DOZER KOMATSU D155 40t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },

//     // Excavators
//     'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },

//     // Flatdecks and Trucks
//     'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },

//     // Fuel Trailers
//     'SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },

//     // Static Tanks
//     'STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },

//     // Articulated Dump Trucks (ADTs)
//     'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    
//     // Small Equipment and Tools
//     'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//   };

//   // Helper function to get last meter reading from transactions
//   const getLastMeterReading = (plantNumber) => {
//     if (!plantNumber) return null;
    
//     // Check localStorage for previous transactions
//     const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
//     const plantTransactions = savedTransactions.filter(t => t.plantNumber === plantNumber);
    
//     if (plantTransactions.length === 0) {
//       return null; // No previous transactions for this plant
//     }
    
//     const lastTransaction = plantTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
//     return lastTransaction ? parseFloat(lastTransaction.currentMeterReadingAfter) : null;
//   };

//   // Helper function to get last store reading
//   const getLastStoreReading = (storeName) => {
//     if (!storeName) return null;
    
//     const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
//     return savedStoreReadings[storeName] || null;
//   };

//   // Check if it's first transaction for the plant
//   const checkIfFirstTransaction = (plantNumber) => {
//     if (!plantNumber) return true;
    
//     const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
//     const plantTransactions = savedTransactions.filter(t => t.plantNumber === plantNumber);
//     return plantTransactions.length === 0;
//   };

//   // Function to validate meter readings and calculate current reading after
//   const validateMeterReadings = (newData) => {
//     const prev = parseFloat(newData.previousMeterReading) || 0;
//     const currentBefore = parseFloat(newData.currentMeterReadingBefore) || 0;
//     const fuelQty = parseFloat(newData.fuelQuantity) || 0;
    
//     let varianceFlag = false;
//     let varianceMessage = '';
    
//     // For subsequent transactions, current reading before must match previous reading
//     if (!isFirstTransaction && currentBefore !== prev) {
//       varianceFlag = true;
//       varianceMessage = `Current reading before (${currentBefore}) must match previous reading (${prev})`;
//     }
    
//     // Calculate current reading after: before + fuel quantity
//     if (currentBefore && fuelQty) {
//       const currentAfter = currentBefore + fuelQty;
//       newData.currentMeterReadingAfter = currentAfter.toFixed(2);
//     } else {
//       newData.currentMeterReadingAfter = '';
//     }
    
//     return {
//       ...newData,
//       meterVarianceFlag: varianceFlag,
//       meterVarianceMessage: varianceMessage
//     };
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
    
//     setFormData(prev => {
//       const newData = {
//         ...prev,
//         [name]: value
//       };

//       // Validate meter readings and calculate current reading after when relevant fields change
//       if (name.includes('MeterReading') || name === 'fuelQuantity' || name === 'plantNumber') {
//         return validateMeterReadings(newData);
//       }

//       // Reset selected fuel store when category changes
//       if (name === 'fuelStoreCategory') {
//         newData.selectedFuelStore = '';
//       }

//       // Update store readings when fuel store is selected
//       if (name === 'selectedFuelStore' && value) {
//         const lastStoreReading = getLastStoreReading(value);
//         if (lastStoreReading) {
//           newData.previousDip = lastStoreReading;
//         }
//       }

//       return newData;
//     });
//   };

//   // Handle Plant QR Scan
//   const handleQRScan = (scannedData) => {
//     const plantInfo = plantMasterList[scannedData] || {
//       name: scannedData,
//       type: 'Unknown Equipment',
//       fuelType: 'Diesel',
//       category: 'general'
//     };

//     // Get last meter reading for this plant and check if it's first transaction
//     const lastMeterReading = getLastMeterReading(scannedData);
//     const firstTransaction = checkIfFirstTransaction(scannedData);

//     setIsFirstTransaction(firstTransaction);

//     setFormData(prev => ({
//       ...prev,
//       plantNumber: scannedData,
//       plantName: plantInfo.name,
//       plantType: plantInfo.type,
//       fuelType: plantInfo.fuelType,
//       previousMeterReading: lastMeterReading ? lastMeterReading.toString() : '0', // Set previous reading automatically
//       // For subsequent transactions, auto-set current reading before to match previous
//       currentMeterReadingBefore: !firstTransaction && lastMeterReading ? lastMeterReading.toString() : prev.currentMeterReadingBefore
//     }));

//     setShowQRScanner(false);
//   };

//   // Handle Odometer Kilometers QR Scan
//   const handleOdometerKilosScan = (scannedData) => {
//     try {
//       // Extract kilometers from various formats
//       let km = '';
      
//       if (scannedData.includes('KM:') || scannedData.includes('km:') || scannedData.includes('KILOS:')) {
//         km = scannedData.split(':')[1];
//       } else if (scannedData.includes(',')) {
//         // Handle combined format but extract only KM
//         const data = scannedData.split(',');
//         data.forEach(item => {
//           if (item.includes('KM:') || item.includes('km:') || item.includes('KILOS:')) {
//             km = item.split(':')[1];
//           }
//         });
//       } else {
//         // Assume it's just kilometers
//         km = scannedData;
//       }

//       setFormData(prev => ({
//         ...prev,
//         odometerKilos: km || ''
//       }));

//       setShowOdometerKilosScanner(false);
      
//       if (!km) {
//         window.alert('No kilometers data found in QR code. Please scan again or enter manually.');
//       } else {
//         window.alert(`Kilometers scanned: ${km}`);
//       }
//     } catch (error) {
//       console.error('Error parsing odometer kilometers QR:', error);
//       window.alert('Error reading odometer kilometers QR code. Please try again or enter manually.');
//     }
//   };

//   // Handle Odometer Hours QR Scan
//   const handleOdometerHoursScan = (scannedData) => {
//     try {
//       // Extract hours from various formats
//       let hrs = '';
      
//       if (scannedData.includes('HRS:') || scannedData.includes('hrs:') || scannedData.includes('HOURS:')) {
//         hrs = scannedData.split(':')[1];
//       } else if (scannedData.includes(',')) {
//         // Handle combined format but extract only HRS
//         const data = scannedData.split(',');
//         data.forEach(item => {
//           if (item.includes('HRS:') || item.includes('hrs:') || item.includes('HOURS:')) {
//             hrs = item.split(':')[1];
//           }
//         });
//       } else {
//         // Assume it's just hours
//         hrs = scannedData;
//       }

//       setFormData(prev => ({
//         ...prev,
//         odometerHours: hrs || ''
//       }));

//       setShowOdometerHoursScanner(false);
      
//       if (!hrs) {
//         window.alert('No hours data found in QR code. Please scan again or enter manually.');
//       } else {
//         window.alert(`Hours scanned: ${hrs}`);
//       }
//     } catch (error) {
//       console.error('Error parsing odometer hours QR:', error);
//       window.alert('Error reading odometer hours QR code. Please try again or enter manually.');
//     }
//   };

//   // Handle adding custom site
//   const handleAddCustomSite = () => {
//     if (formData.customSiteNumber && !customSites.includes(formData.customSiteNumber)) {
//       setCustomSites(prev => [...prev, formData.customSiteNumber]);
//       setFormData(prev => ({
//         ...prev,
//         contractType: formData.customSiteNumber,
//         customSiteNumber: ''
//       }));
//     }
//   };

//   // Update store readings after transaction
//   const updateStoreReadings = (storeName, fuelQuantity) => {
//     if (!storeName) return;
    
//     const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
//     const currentReading = parseFloat(savedStoreReadings[storeName] || '0');
//     const newReading = currentReading - parseFloat(fuelQuantity);
    
//     const updatedReadings = {
//       ...savedStoreReadings,
//       [storeName]: Math.max(0, newReading).toString()
//     };
    
//     localStorage.setItem('storeReadings', JSON.stringify(updatedReadings));
//     setStoreReadings(updatedReadings);
//   };

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Validate date - cannot be previous date
//     const selectedDate = new Date(formData.transactionDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     if (selectedDate < today) {
//       window.alert('Cannot select previous dates. Please select today or a future date.');
//       return;
//     }

//     // Validate required fields
//     if (!formData.currentMeterReadingBefore || !formData.fuelQuantity) {
//       window.alert('Please enter both current reading before and fuel quantity.');
//       return;
//     }

//     // For subsequent transactions, enforce that current reading before must match previous reading
//     if (!isFirstTransaction) {
//       const prev = parseFloat(formData.previousMeterReading) || 0;
//       const currentBefore = parseFloat(formData.currentMeterReadingBefore) || 0;
      
//       if (currentBefore !== prev) {
//         window.alert(`For subsequent transactions, current reading before (${currentBefore}) must match previous reading (${prev}). Please correct the values.`);
//         return;
//       }
//     }

//     // Warn about variance but allow submission (only for first transaction)
//     if (formData.meterVarianceFlag && isFirstTransaction) {
//       const proceed = window.confirm(`Meter reading variance detected:\n${formData.meterVarianceMessage}\n\nDo you want to proceed anyway?`);
//       if (!proceed) {
//         return;
//       }
//     }

//     // Create transaction object
//     const transaction = {
//       id: Date.now(),
//       timestamp: new Date().toISOString(),
//       ...formData,
//       attendantName: user.fullName,
//       userId: user.id,
//       isFirstTransaction: isFirstTransaction
//     };

//     // Add to transactions
//     setTransactions(prev => [transaction, ...prev]);
    
//     // Save to localStorage
//     const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
//     savedTransactions.unshift(transaction);
//     localStorage.setItem('fuelTransactions', JSON.stringify(savedTransactions));
    
//     // Update store readings
//     if (formData.selectedFuelStore && formData.fuelQuantity) {
//       updateStoreReadings(formData.selectedFuelStore, formData.fuelQuantity);
//     }
    
//     // Reset form (keep stock readings for PDF)
//     setFormData(prev => ({
//       fuelStoreCategory: '',
//       selectedFuelStore: '',
//       plantNumber: '',
//       plantName: '',
//       plantType: '',
//       odometerKilos: '',
//       odometerHours: '',
//       previousMeterReading: '', // Reset - will be auto-populated on next plant scan
//       currentMeterReadingBefore: '',
//       fuelQuantity: '',
//       currentMeterReadingAfter: '',
//       meterVarianceFlag: false,
//       meterVarianceMessage: '',
//       contractType: '',
//       customSiteNumber: '',
//       transactionType: '',
//       fuelType: 'Diesel',
//       transactionDate: new Date().toISOString().split('T')[0],
//       attendantName: user.fullName,
//       receiverName: '',
//       receiverCompany: '',
//       employmentNumber: '',
//       remarks: '',
//       // Keep stock readings for PDF
//       previousDip: prev.previousDip,
//       currentDip: prev.currentDip,
//       deliveryReceived: prev.deliveryReceived,
//       openingReading: prev.openingReading,
//       closingReading: prev.closingReading,
//       variance: prev.variance
//     }));

//     // Reset first transaction flag
//     setIsFirstTransaction(true);

//     window.alert('Transaction recorded successfully!');
//   };

//   // Load transactions and store readings from localStorage on component mount
//   useEffect(() => {
//     const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
//     setTransactions(savedTransactions);
    
//     const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
//     setStoreReadings(savedStoreReadings);
//   }, []);

//   // Simple Excel download
//   const downloadTransactionsExcel = () => {
//     if (transactions.length === 0) {
//       window.alert('No transactions to download.');
//       return;
//     }

//     try {
//       const { utils, writeFile } = XLSX;
      
//       // Prepare data for Excel
//       const excelData = transactions.map(transaction => ({
//         'Transaction ID': transaction.id,
//         'Date': transaction.transactionDate,
//         'Plant Number': transaction.plantNumber,
//         'Plant Name': transaction.plantName || '',
//         'Fuel Store': transaction.selectedFuelStore,
//         'Previous Reading': transaction.previousMeterReading,
//         'Current Reading Before': transaction.currentMeterReadingBefore,
//         'Fuel Quantity (L)': transaction.fuelQuantity,
//         'Current Reading After': transaction.currentMeterReadingAfter,
//         'Odometer (KM)': transaction.odometerKilos,
//         'Hours': transaction.odometerHours,
//         'Transaction Type': transaction.transactionType,
//         'Contract/Site': transaction.contractType,
//         'Fuel Type': transaction.fuelType,
//         'Receiver Name': transaction.receiverName,
//         'Receiver Company': transaction.receiverCompany,
//         'Employment Number': transaction.employmentNumber,
//         'Attendant': transaction.attendantName,
//         'Remarks': transaction.remarks || '',
//         'First Transaction': transaction.isFirstTransaction ? 'Yes' : 'No'
//       }));

//       const ws = utils.json_to_sheet(excelData);
//       const wb = utils.book_new();
//       utils.book_append_sheet(wb, ws, 'Fuel Transactions');
      
//       // Generate and download the file
//       writeFile(wb, `fuel-transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
      
//     } catch (error) {
//       console.error('Excel download failed:', error);
//       window.alert('Excel download failed. Please try again.');
//     }
//   };

//   // Simple PDF download
//   const downloadTransactionsPDF = () => {
//     if (transactions.length === 0) {
//       window.alert('No transactions to download.');
//       return;
//     }

//     // Simple dynamic import that always works
//     import('jspdf').then(({ jsPDF }) => {
//       const doc = new jsPDF();
      
//       // Title
//       doc.setFontSize(16);
//       doc.text('FUEL TRANSACTIONS REPORT', 20, 20);
      
//       // Details
//       doc.setFontSize(10);
//       doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
//       doc.text(`Generated by: ${user.fullName}`, 20, 37);
//       doc.text(`Total Transactions: ${transactions.length}`, 20, 44);
      
//       const totalFuel = transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0);
//       doc.text(`Total Fuel: ${totalFuel.toFixed(2)}L`, 20, 51);
      
//       // Stock Readings Summary
//       doc.text('STOCK READINGS:', 20, 65);
//       doc.text(`Previous Dip: ${formData.previousDip || 'N/A'}`, 20, 72);
//       doc.text(`Current Dip: ${formData.currentDip || 'N/A'}`, 20, 79);
//       doc.text(`Delivery Received: ${formData.deliveryReceived || 'N/A'}`, 20, 86);
      
//       // Transactions List
//       let yPos = 100;
//       doc.text('RECENT TRANSACTIONS:', 20, yPos);
//       yPos += 10;
      
//       transactions.slice(0, 15).forEach((transaction, index) => {
//         if (yPos > 270) {
//           doc.addPage();
//           yPos = 20;
//         }
        
//         const line = `${transaction.plantNumber} | ${transaction.fuelQuantity}L | ${transaction.transactionType}`;
//         doc.text(line, 20, yPos);
//         yPos += 7;
//       });
      
//       doc.save(`fuel-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
//     }).catch((error) => {
//       console.error('PDF failed:', error);
//       window.alert('PDF generation failed. Please try downloading Excel instead.');
//     });
//   };

//   // Generate QR for specific plant
//   const generateQRForPlant = (plantNumber) => {
//     if (plantNumber) {
//       setSelectedPlantForQR(plantNumber);
//       setShowQRGenerator(true);
//     }
//   };

//   // Function to get user initials for avatar
//   const getUserInitials = (fullName) => {
//     if (!fullName) return 'U';
//     return fullName
//       .split(' ')
//       .map(name => name[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   // Function to get random color for avatar based on user name
//   const getAvatarColor = (name) => {
//     const colors = [
//       '#1b5e20', '#1976d2', '#d32f2f', '#7b1fa2', 
//       '#ff9800', '#0097a7', '#388e3c', '#5d4037'
//     ];
//     if (!name) return colors[0];
//     const index = name.charCodeAt(0) % colors.length;
//     return colors[index];
//   };

//   return (
//     <div style={{ 
//       padding: '20px', 
//       maxWidth: '1400px', 
//       margin: '0 auto',
//       backgroundColor: '#f5f5f5',
//       minHeight: '100vh'
//     }}>
//       {/* Header with Logo and User Profile */}
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '30px',
//         backgroundColor: 'white',
//         padding: '15px 25px',
//         borderRadius: '12px',
//         boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//         border: '1px solid #e1e5e9'
//       }}>
//         {/* Logo Section - Left */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//           <div style={{
//             width: '90px',
//             height: '90px',
//             borderRadius: '50%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             overflow: 'hidden',
//             backgroundColor: 'white',
//             border: '0px solid #e1e5e9'
//           }}>
//             <img 
//               src="/fuel2.jpg" 
//               alt="FMS Logo"
//               style={{
//                 width: '100%',
//                 height: '130%',
//                 objectFit: 'cover',
//                 borderRadius: '50%'
//               }}
//               onError={(e) => {
//                 // Fallback if image doesn't load
//                 e.target.style.display = 'none';
//                 e.target.nextSibling.style.display = 'flex';
//               }}
//             />
//             <div style={{
//               width: '100%',
//               height: '100%',
//               backgroundColor: '#28a745',
//               borderRadius: '50%',
//               display: 'none',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'white',
//               fontSize: '16px',
//               fontWeight: 'bold'
//             }}>
//               FMS
//             </div>
//           </div>
//           <div>
//             <h2 style={{ 
//               margin: 0, 
//               color: '#1b5e20',
//               fontSize: '20px',
//               fontWeight: '600'
//             }}>
//               Fuel Management System
//             </h2>
//             <p style={{ 
//               margin: 0, 
//               color: '#666',
//               fontSize: '14px'
//             }}>
//               Clerk/Attendant Dashboard
//             </p>
//           </div>
//         </div>

//         {/* User Profile Section - Right */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//           <div style={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: '12px',
//             padding: '8px 16px',
//             backgroundColor: '#f8f9fa',
//             borderRadius: '25px',
//             border: '1px solid #e1e5e9'
//           }}>
//             {/* User Avatar */}
//             <div style={{
//               width: '40px',
//               height: '40px',
//               borderRadius: '50%',
//               backgroundColor: getAvatarColor(user?.fullName),
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'white',
//               fontSize: '14px',
//               fontWeight: 'bold',
//               border: '2px solid white',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//             }}>
//               {getUserInitials(user?.fullName)}
//             </div>
            
//             {/* User Info */}
//             <div style={{ textAlign: 'right' }}>
//               <div style={{ 
//                 fontSize: '14px', 
//                 fontWeight: '600', 
//                 color: '#333',
//                 lineHeight: '1.2'
//               }}>
//                 {user?.fullName || 'User'}
//               </div>
//               <div style={{ 
//                 fontSize: '12px', 
//                 color: '#666',
//                 lineHeight: '1.2'
//               }}>
//                 {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Clerk/Attendant'}
//               </div>
//             </div>
//           </div>

//           {/* Logout Button */}
//           <button 
//             onClick={onLogout}
//             style={{ 
//               padding: '10px 20px', 
//               backgroundColor: '#d32f2f',
//               color: 'white',
//               border: 'none',
//               borderRadius: '25px',
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '600',
//               transition: 'all 0.2s',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#b71c1c';
//               e.target.style.transform = 'translateY(-1px)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#d32f2f';
//               e.target.style.transform = 'translateY(0)';
//             }}
//           >
//             <span>🚪</span>
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
//         {/* Main Content */}
//         <div>
//           {/* Transaction Form */}
//           <div style={{ 
//             backgroundColor: 'white', 
//             padding: '30px', 
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//             marginBottom: '20px'
//           }}>
//             <h2 style={{ color: '#1b5e20', marginBottom: '25px' }}>New Fuel Transaction</h2>
            
//             <form onSubmit={handleSubmit}>
//               {/* QR Scan Sections */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Equipment & Readings Scan</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Plant Number (QR Scan):
//                     </label>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <input
//                         type="text"
//                         name="plantNumber"
//                         value={formData.plantNumber}
//                         onChange={handleInputChange}
//                         placeholder="Scan plant QR code"
//                         style={{ 
//                           flex: 1,
//                           padding: '10px',
//                           border: '1px solid #ddd',
//                           borderRadius: '4px'
//                         }}
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowQRScanner(true)}
//                         style={{
//                           padding: '10px',
//                           backgroundColor: '#1b5e20',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '4px',
//                           cursor: 'pointer',
//                           whiteSpace: 'nowrap'
//                         }}
//                       >
//                         📱 Scan Plant
//                       </button>
//                     </div>
//                     {formData.plantName && (
//                       <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
//                         {formData.plantName} - {formData.plantType}
//                         {isFirstTransaction ? ' (First Transaction)' : ' (Subsequent Transaction)'}
//                       </small>
//                     )}
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Store Current Reading:
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.selectedFuelStore && storeReadings[formData.selectedFuelStore] 
//                         ? `${storeReadings[formData.selectedFuelStore]}L` 
//                         : 'Select store to see reading'}
//                       readOnly
//                       style={{ 
//                         width: '100%',
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px',
//                         backgroundColor: '#f9f9f9'
//                       }}
//                     />
//                     <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
//                       Store reading updates automatically after transactions
//                     </small>
//                   </div>
//                 </div>

//                 {/* Separate Odometer Scanners */}
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Odometer Kilometers:
//                     </label>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <input
//                         type="number"
//                         name="odometerKilos"
//                         value={formData.odometerKilos}
//                         onChange={handleInputChange}
//                         step="0.1"
//                         placeholder="Enter or scan kilometers"
//                         style={{ 
//                           flex: 1,
//                           padding: '10px',
//                           border: '1px solid #ddd',
//                           borderRadius: '4px'
//                         }}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowOdometerKilosScanner(true)}
//                         style={{
//                           padding: '10px',
//                           backgroundColor: '#1976d2',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '4px',
//                           cursor: 'pointer',
//                           whiteSpace: 'nowrap'
//                         }}
//                       >
//                         📱 Scan KM
//                       </button>
//                     </div>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Odometer Hours:
//                     </label>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <input
//                         type="number"
//                         name="odometerHours"
//                         value={formData.odometerHours}
//                         onChange={handleInputChange}
//                         step="0.1"
//                         placeholder="Enter or scan hours"
//                         style={{ 
//                           flex: 1,
//                           padding: '10px',
//                           border: '1px solid #ddd',
//                           borderRadius: '4px'
//                         }}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowOdometerHoursScanner(true)}
//                         style={{
//                           padding: '10px',
//                           backgroundColor: '#1976d2',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '4px',
//                           cursor: 'pointer',
//                           whiteSpace: 'nowrap'
//                         }}
//                       >
//                         📱 Scan HRS
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Fuel Store Selection */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Fuel Store Selection</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Fuel Store Category:
//                     </label>
//                     <select
//                       name="fuelStoreCategory"
//                       value={formData.fuelStoreCategory}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     >
//                       <option value="">Select Category</option>
//                       <option value="service_trucks">Service Trucks</option>
//                       <option value="fuel_trailers">Fuel Trailers</option>
//                       <option value="underground_tanks">Static Tanks</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Specific Store:
//                     </label>
//                     <select
//                       name="selectedFuelStore"
//                       value={formData.selectedFuelStore}
//                       onChange={handleInputChange}
//                       disabled={!formData.fuelStoreCategory}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     >
//                       <option value="">Select Store</option>
//                       {formData.fuelStoreCategory && fuelStores[formData.fuelStoreCategory]?.map(store => (
//                         <option key={store} value={store}>{store}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Meter Readings */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Meter Readings</h3>
                
//                 {/* Variance Warning */}
//                 {formData.meterVarianceFlag && (
//                   <div style={{
//                     backgroundColor: '#fff3e0',
//                     border: '1px solid #ffb74d',
//                     borderRadius: '4px',
//                     padding: '10px',
//                     marginBottom: '15px',
//                     color: '#e65100'
//                   }}>
//                     ⚠️ {formData.meterVarianceMessage}
//                   </div>
//                 )}
                
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Previous Reading:
//                     </label>
//                     <input
//                       type="number"
//                       name="previousMeterReading"
//                       value={formData.previousMeterReading}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       readOnly={!isFirstTransaction}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: formData.meterVarianceFlag ? '2px solid #ff9800' : '1px solid #ddd',
//                         borderRadius: '4px',
//                         backgroundColor: isFirstTransaction ? 'white' : '#f5f5f5',
//                         color: isFirstTransaction ? '#333' : '#666'
//                       }}
//                       required
//                     />
//                     <small style={{ color: '#666' }}>
//                       {isFirstTransaction 
//                         ? 'Enter initial reading for first transaction' 
//                         : 'Auto-populated from last transaction (readonly)'}
//                     </small>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Current Reading (Before):
//                     </label>
//                     <input
//                       type="number"
//                       name="currentMeterReadingBefore"
//                       value={formData.currentMeterReadingBefore}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: formData.meterVarianceFlag ? '2px solid #ff9800' : '1px solid #ddd',
//                         borderRadius: '4px',
//                         backgroundColor: formData.meterVarianceFlag ? '#fff3e0' : 'white'
//                       }}
//                       required
//                     />
//                     <small style={{ color: '#666' }}>
//                       {isFirstTransaction 
//                         ? 'Reading before refueling' 
//                         : 'Must match previous reading for consistency'}
//                     </small>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Fuel Quantity (L):
//                     </label>
//                     <input
//                       type="number"
//                       name="fuelQuantity"
//                       value={formData.fuelQuantity}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     />
//                     <small style={{ color: '#666' }}>
//                       Liters refilled - updates store reading
//                     </small>
//                   </div>
//                 </div>

//                 {/* Current Reading After Display */}
//                 <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Current Reading (After) - Auto-calculated:
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.currentMeterReadingAfter || ''}
//                       readOnly
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px',
//                         backgroundColor: '#f5f5f5',
//                         fontWeight: 'bold',
//                         color: formData.currentMeterReadingAfter ? '#1b5e20' : '#666'
//                       }}
//                       placeholder="Before + Fuel Quantity"
//                     />
//                     <small style={{ color: '#666' }}>
//                       Calculated: {formData.currentMeterReadingBefore || 0} + {formData.fuelQuantity || 0} = {formData.currentMeterReadingAfter || 0}
//                     </small>
//                   </div>
//                 </div>
//               </div>

//               {/* Transaction Type and Contract/Site */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Transaction & Site Details</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Transaction Type (Ledger Code):
//                     </label>
//                     <select
//                       name="transactionType"
//                       value={formData.transactionType}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     >
//                       <option value="">Select Transaction Type</option>
//                       {transactionTypes.map(type => (
//                         <option key={type} value={type}>{type}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Contract/Site:
//                     </label>
//                     <select
//                       name="contractType"
//                       value={formData.contractType}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     >
//                       <option value="">Select Contract/Site</option>
//                       {contractOptions.map(contract => (
//                         <option key={contract} value={contract}>{contract}</option>
//                       ))}
//                       {customSites.map(site => (
//                         <option key={site} value={site}>{site} (Custom)</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Add Custom Site:
//                   </label>
//                   <div style={{ display: 'flex', gap: '10px' }}>
//                     <input
//                       type="text"
//                       name="customSiteNumber"
//                       value={formData.customSiteNumber}
//                       onChange={handleInputChange}
//                       placeholder="e.g., 2501/05"
//                       style={{ 
//                         flex: 1,
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                     <button
//                       type="button"
//                       onClick={handleAddCustomSite}
//                       disabled={!formData.customSiteNumber}
//                       style={{
//                         padding: '10px 15px',
//                         backgroundColor: formData.customSiteNumber ? '#1b5e20' : '#ccc',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         cursor: formData.customSiteNumber ? 'pointer' : 'not-allowed'
//                       }}
//                     >
//                       Add Site
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Stock Readings Section */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Stock Readings</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Previous Dip/Probe:
//                     </label>
//                     <input
//                       type="number"
//                       name="previousDip"
//                       value={formData.previousDip}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Current Dip/Probe:
//                     </label>
//                     <input
//                       type="number"
//                       name="currentDip"
//                       value={formData.currentDip}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                 </div>
                
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Delivery Received:
//                     </label>
//                     <input
//                       type="number"
//                       name="deliveryReceived"
//                       value={formData.deliveryReceived}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Opening Reading:
//                     </label>
//                     <input
//                       type="number"
//                       name="openingReading"
//                       value={formData.openingReading}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Closing Reading:
//                     </label>
//                     <input
//                       type="number"
//                       name="closingReading"
//                       value={formData.closingReading}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Variance (%):
//                     </label>
//                     <input
//                       type="number"
//                       name="variance"
//                       value={formData.variance}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Details */}
//               <div style={{ marginBottom: '25px' }}>
//                 <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Additional Details</h3>

//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Receiver Name:
//                     </label>
//                     <input
//                       type="text"
//                       name="receiverName"
//                       value={formData.receiverName}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                       Employment Number:
//                     </label>
//                     <input
//                       type="text"
//                       name="employmentNumber"
//                       value={formData.employmentNumber}
//                       onChange={handleInputChange}
//                       style={{ 
//                         width: '100%', 
//                         padding: '10px',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Receiver Company:
//                   </label>
//                   <input
//                     type="text"
//                     name="receiverCompany"
//                     value={formData.receiverCompany}
//                     onChange={handleInputChange}
//                     style={{ 
//                       width: '100%', 
//                       padding: '10px',
//                       border: '1px solid #ddd',
//                       borderRadius: '4px'
//                     }}
//                     required
//                   />
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Fuel Type:
//                   </label>
//                   <select
//                     name="fuelType"
//                     value={formData.fuelType}
//                     onChange={handleInputChange}
//                     style={{ 
//                       width: '100%', 
//                       padding: '10px',
//                       border: '1px solid #ddd',
//                       borderRadius: '4px'
//                     }}
//                   >
//                     <option value="Diesel">Diesel</option>
//                     <option value="Petrol">Petrol</option>
//                   </select>
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Transaction Date:
//                   </label>
//                   <input
//                     type="date"
//                     name="transactionDate"
//                     value={formData.transactionDate}
//                     onChange={handleInputChange}
//                     max={new Date().toISOString().split('T')[0]}
//                     style={{ 
//                       width: '100%', 
//                       padding: '10px',
//                       border: '1px solid #ddd',
//                       borderRadius: '4px'
//                     }}
//                     required
//                   />
//                 </div>

//                 <div style={{ marginTop: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                     Remarks:
//                   </label>
//                   <textarea
//                     name="remarks"
//                     value={formData.remarks}
//                     onChange={handleInputChange}
//                     rows="3"
//                     style={{ 
//                       width: '100%', 
//                       padding: '10px',
//                       border: '1px solid #ddd',
//                       borderRadius: '4px',
//                       resize: 'vertical'
//                     }}
//                     placeholder="Additional notes or comments..."
//                   />
//                 </div>
//               </div>

//             {/* In your form, add a plant info display section */}
//             {formData.plantNumber && (
//               <div style={{
//                 backgroundColor: '#e8f5e8',
//                 padding: '15px',
//                 borderRadius: '4px',
//                 marginBottom: '20px',
//                 border: '1px solid #c8e6c9'
//               }}>
//                 <h4 style={{ color: '#1b5e20', margin: '0 0 10px 0' }}>Scanned Plant Information</h4>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//                   <div>
//                     <strong>Plant Number:</strong> {formData.plantNumber}
//                   </div>
//                   <div>
//                     <strong>Name:</strong> {formData.plantName}
//                   </div>
//                   <div>
//                     <strong>Type:</strong> {formData.plantType}
//                   </div>
//                   <div>
//                     <strong>Fuel Type:</strong> {formData.fuelType}
//                   </div>
//                 </div>
//                 {formData.qrScannedData && (
//                   <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
//                     <strong>QR Generated:</strong> {formData.qrScannedData.timestamp ? new Date(formData.qrScannedData.timestamp).toLocaleString() : 'Unknown'}
//                   </div>
//                 )}
//               </div>
//             )}
//               {/* Submit Button */}
//               <div style={{ textAlign: 'center' }}>
//                 <button 
//                   type="submit"
//                   style={{ 
//                     padding: '15px 40px',
//                     backgroundColor: '#1b5e20',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     fontSize: '16px',
//                     cursor: 'pointer',
//                     fontWeight: 'bold'
//                   }}
//                 >
//                   Record Fuel Transaction
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Recent Transactions */}
//           <div style={{ 
//             backgroundColor: 'white', 
//             padding: '20px', 
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//               <h3 style={{ color: '#1b5e20', margin: 0 }}>Recent Transactions</h3>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button
//                   onClick={downloadTransactionsExcel}
//                   disabled={transactions.length === 0}
//                   style={{
//                     padding: '8px 16px',
//                     backgroundColor: transactions.length === 0 ? '#ccc' : '#1b5e20',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   📊 Download Excel
//                 </button>
//                 <button
//                   onClick={downloadTransactionsPDF}
//                   disabled={transactions.length === 0}
//                   style={{
//                     padding: '8px 16px',
//                     backgroundColor: transactions.length === 0 ? '#ccc' : '#d32f2f',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   📄 Download PDF
//                 </button>
//               </div>
//             </div>
            
//             {transactions.length === 0 ? (
//               <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
//                 No transactions recorded yet.
//               </p>
//             ) : (
//               <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                   <thead>
//                     <tr style={{ backgroundColor: '#f5f5f5' }}>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Plant</th>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Trans Type</th>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fuel Qty</th>
//                       <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Odometer/Hours</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {transactions.slice(0, 10).map(transaction => (
//                       <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
//                         <td style={{ padding: '10px' }}>{transaction.transactionDate}</td>
//                         <td style={{ padding: '10px' }}>{transaction.plantNumber}</td>
//                         <td style={{ padding: '10px' }}>{transaction.transactionType}</td>
//                         <td style={{ padding: '10px' }}>{transaction.fuelQuantity}L</td>
//                         <td style={{ padding: '10px' }}>
//                           {transaction.odometerKilos && `${transaction.odometerKilos}KM`}
//                           {transaction.odometerKilos && transaction.odometerHours && ' / '}
//                           {transaction.odometerHours && `${transaction.odometerHours}HRS`}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div>
//           {/* QR Tools */}
//           <div style={{ 
//             backgroundColor: 'white', 
//             padding: '20px', 
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//             marginBottom: '20px'
//           }}>
//             <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>QR Code Tools</h3>
            
//             <div style={{ marginBottom: '15px' }}>
//               <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                 Generate QR for Plant:
//               </label>
//               <select
//                 value={selectedPlantForQR}
//                 onChange={(e) => setSelectedPlantForQR(e.target.value)}
//                 style={{ 
//                   width: '100%', 
//                   padding: '10px',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   marginBottom: '10px'
//                 }}
//               >
//                 <option value="">Select Plant Number</option>
//                 {Object.keys(plantMasterList).map(plantNumber => (
//                   <option key={plantNumber} value={plantNumber}>
//                     {plantNumber} - {plantMasterList[plantNumber].name}
//                   </option>
//                 ))}
//               </select>
//               <button
//                 onClick={() => generateQRForPlant(selectedPlantForQR)}
//                 disabled={!selectedPlantForQR}
//                 style={{
//                   width: '100%',
//                   padding: '10px',
//                   backgroundColor: !selectedPlantForQR ? '#ccc' : '#1b5e20',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: !selectedPlantForQR ? 'not-allowed' : 'pointer'
//                 }}
//               >
//                 Generate QR Code
//               </button>
//             </div>

//             <div style={{ display: 'grid', gap: '10px' }}>
//               <button
//                 onClick={() => setShowQRScanner(true)}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   backgroundColor: '#1976d2',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 📱 Scan Plant QR
//               </button>
              
//               <button
//                 onClick={() => setShowOdometerKilosScanner(true)}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   backgroundColor: '#1976d2',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 📊 Scan Kilometers
//               </button>

//               <button
//                 onClick={() => setShowOdometerHoursScanner(true)}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   backgroundColor: '#1976d2',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 ⏱️ Scan Hours
//               </button>
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div style={{ 
//             backgroundColor: 'white', 
//             padding: '20px', 
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//           }}>
//             <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Quick Stats</h3>
//             <div style={{ display: 'grid', gap: '10px' }}>
//               <div style={{ 
//                 padding: '15px', 
//                 backgroundColor: '#e8f5e8', 
//                 borderRadius: '4px',
//                 textAlign: 'center'
//               }}>
//                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>
//                   {transactions.length}
//                 </div>
//                 <div style={{ color: '#666', fontSize: '14px' }}>Total Transactions</div>
//               </div>
              
//               <div style={{ 
//                 padding: '15px', 
//                 backgroundColor: '#e3f2fd', 
//                 borderRadius: '4px',
//                 textAlign: 'center'
//               }}>
//                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
//                   {new Set(transactions.map(t => t.plantNumber)).size}
//                 </div>
//                 <div style={{ color: '#666', fontSize: '14px' }}>Unique Equipment</div>
//               </div>

//               <div style={{ 
//                 padding: '15px', 
//                 backgroundColor: '#fff3e0', 
//                 borderRadius: '4px',
//                 textAlign: 'center'
//               }}>
//                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef6c00' }}>
//                   {transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0).toFixed(0)}L
//                 </div>
//                 <div style={{ color: '#666', fontSize: '14px' }}>Total Fuel</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* QR Scanner Modal */}
//       {showQRScanner && (
//         <QRScanner 
//           onScan={handleQRScan}
//           onClose={() => setShowQRScanner(false)}
//         />
//       )}

//       {/* Odometer Kilometers Scanner Modal */}
//       {showOdometerKilosScanner && (
//         <QRScanner 
//           onScan={handleOdometerKilosScan}
//           onClose={() => setShowOdometerKilosScanner(false)}
//           title="Scan Kilometers QR"
//           description="Scan QR code containing kilometers data"
//         />
//       )}

//       {/* Odometer Hours Scanner Modal */}
//       {showOdometerHoursScanner && (
//         <QRScanner 
//           onScan={handleOdometerHoursScan}
//           onClose={() => setShowOdometerHoursScanner(false)}
//           title="Scan Hours QR"
//           description="Scan QR code containing hours data"
//         />
//       )}

//       {/* QR Generator Modal */}
//       {showQRGenerator && (
//         <QRGenerator 
//           plantNumber={selectedPlantForQR}
//           onClose={() => setShowQRGenerator(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Admin;

import React, { useState, useEffect } from 'react';
import QRScanner from '../qr/QRScanner';
import QRGenerator from '../qr/QRGenerator';
import * as XLSX from 'xlsx';

const Admin = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    // Fuel Store Selection
    fuelStoreCategory: '',
    selectedFuelStore: '',
    
    // Plant Number (from QR scan)
    plantNumber: '',
    plantName: '',
    plantType: '',
    qrScannedData: null, // ADDED: For enhanced QR data
    
    // Separate Odometer Readings
    odometerKilos: '',        // For kilometers
    odometerHours: '',        // For hours
    
    // Meter Readings - Before and After Refueling
    previousMeterReading: '', // Previous reading (readonly - from last transaction)
    currentMeterReadingBefore: '', // Current reading before refueling
    fuelQuantity: '',         // Liters refilled
    currentMeterReadingAfter: '',  // Auto-calculated: before + fuel quantity
    
    // Validation flags
    meterVarianceFlag: false, // Flag if current before doesn't match previous
    meterVarianceMessage: '', // Message explaining variance
    
    // Contract/Site Allocation
    contractType: '',
    customSiteNumber: '',
    
    // Transaction Type (Ledger Codes)
    transactionType: '',
    
    // Fuel Details
    fuelType: 'Diesel',
    
    // Date
    transactionDate: new Date().toISOString().split('T')[0],
    
    // Additional details
    attendantName: user?.fullName || '',
    receiverName: '',
    receiverCompany: '',
    employmentNumber: '',
    remarks: '',
    
    // Stock readings for PDF
    previousDip: '1500',
    currentDip: '1450',
    deliveryReceived: '5000',
    openingReading: '12000',
    closingReading: '12500',
    variance: '2.5'
  });

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showOdometerKilosScanner, setShowOdometerKilosScanner] = useState(false);
  const [showOdometerHoursScanner, setShowOdometerHoursScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [selectedPlantForQR, setSelectedPlantForQR] = useState('');
  const [selectedPlantInfo, setSelectedPlantInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customSites, setCustomSites] = useState([]);
  const [storeReadings, setStoreReadings] = useState({});
  const [isFirstTransaction, setIsFirstTransaction] = useState(true);

  // Fuel Stores Data
  const fuelStores = {
    service_trucks: [
      'FSH01 - 01',
      'FSH02 - 01', 
      'FSH03 - 01',
      'FSH04 - 01'
    ],
    fuel_trailers: [
      'SLD 02 (1000L)',
      'SLD 07 (2000L)',
      'SLD 09 (1000L)'
    ],
    underground_tanks: [
      'UDT 49 (Workshop Underground Tank)',
      'UPT 49 (Workshop Petrol Underground Tank)',
      'UDT 890 (Palmiet Underground Tank)',
      'STD 02 (Musina Static Tank)',
      'STD 05 (Musina Static Tank)'
    ]
  };

  // Transaction Types (Ledger Codes)
  const transactionTypes = [
    'Plant Fuel to Contract',
    'Plant Fuel Return from Contract',
    'Stock Issue to Balance Sheet',
    'Stock Issue to Contracts',
    'Stock Issue to Overheads',
    'Stock Issue Plant',
    'Stock Receipt from Supplier',
    'Stock Return from Balance Sheet',
    'Stock Return from Contract',
    'Stock Return from Plant',
    'Stock Return from Overheads',
    'Stock Return to Supplier',
    'Stock Take On'
  ];

  // Contract/Site Options
  const contractOptions = [
    'AMPLANT 49',
    'HILLARY (Site 2163)',
    'HILLARY (Site 2102)',
    'Polokwane Surfacing 890',
    'Sundries',
    'Custom Site'
  ];

  // Plant Equipment Master List
  const plantMasterList = {
    // Asphalt Pavers
    'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD07': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD08': { name: 'ASPHALT PAVER DYNAPAC F161-8W', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD09': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD11': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APN01': { name: 'ASPHALT PAVER NIGATA', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APV10': { name: 'ASPHALT PAVER VOGELE 1800 SPRAY JET', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },

    // Asphalt Plants
    'A-APP02': { name: 'ASPHALT MIXING PLANT MOBILE 40tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP03': { name: 'ASPHALT MIXING PLANT MOBILE 60tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP04': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP06': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },

    // Shuttle Buggies
    'A-ASR01': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
    'A-ASR02': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },

    // Buses
    'A-BBS03': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
    'A-BBS04': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },

    // Bitumen Equipment
    'A-BDT02': { name: 'BITUMEN TRAILER 1kl', type: 'Bitumen Trailer', fuelType: 'Bitumen', category: 'specialized' },
    'A-BDT06': { name: 'CRACKSEALING TRAILER', type: 'Cracksealing Trailer', fuelType: 'Diesel', category: 'specialized' },
    'A-BEP01': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
    'A-BEP02': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },

    // Bakkies and Light Vehicles
    'A-BNS08': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BNS09': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BNS10': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC106': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC107': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC108': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },

    // Brooms
    'A-BRM11': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM12': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM13': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM14': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },

    // Heavy Bakkies
    'A-BTH100': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
    'A-BTH104': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
    'A-BTH115': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },

    // Crushers
    'A-CCK05': { name: 'KLEEMANN MOBICONE MCO 9 S EVO CONE', type: 'Cone Crusher', fuelType: 'Diesel', category: 'crushing' },
    'A-CHR03': { name: 'RM HORIZONTAL IMPACT CRUSHER 100GO', type: 'Impact Crusher', fuelType: 'Diesel', category: 'crushing' },
    'A-CJK06': { name: 'KLEEMANN MOBICAT MC 110 R EVO JAW', type: 'Jaw Crusher', fuelType: 'Diesel', category: 'crushing' },

    // Screens
    'A-CSK01': { name: 'KLEEMANN MOBICAT MC 703 EVO SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
    'A-CSM02': { name: 'METSO ST2.8 SCALPER SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
    'A-CSC03': { name: 'CHIEFTAIN 600, DOUBLE DECK SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },

    // Chipsreaders
    'A-CSE07': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE08': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE09': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE10': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },

    // Dozers
    'A-DOK13': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
    'A-DOK15': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
    'A-DOK16': { name: 'DOZER KOMATSU D155 40t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },

    // Excavators
    'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },

    // Flatdecks and Trucks
    'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
    'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
    'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },

    // Fuel Trailers
    'SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },

    // Static Tanks
    'STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
    'STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
    'STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },

    // Articulated Dump Trucks (ADTs)
    'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    
    // Small Equipment and Tools
    'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
    'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
    'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  };

  // Helper function to get last meter reading from transactions
  const getLastMeterReading = (plantNumber) => {
    if (!plantNumber) return null;
    
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    const plantTransactions = savedTransactions.filter(t => t.plantNumber === plantNumber);
    
    if (plantTransactions.length === 0) {
      return null;
    }
    
    const lastTransaction = plantTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    return lastTransaction ? parseFloat(lastTransaction.currentMeterReadingAfter) : null;
  };

  // Helper function to get last store reading
  const getLastStoreReading = (storeName) => {
    if (!storeName) return null;
    
    const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
    return savedStoreReadings[storeName] || null;
  };

  // Check if it's first transaction for the plant
  const checkIfFirstTransaction = (plantNumber) => {
    if (!plantNumber) return true;
    
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    const plantTransactions = savedTransactions.filter(t => t.plantNumber === plantNumber);
    return plantTransactions.length === 0;
  };

  // Function to validate meter readings and calculate current reading after
  const validateMeterReadings = (newData) => {
    const prev = parseFloat(newData.previousMeterReading) || 0;
    const currentBefore = parseFloat(newData.currentMeterReadingBefore) || 0;
    const fuelQty = parseFloat(newData.fuelQuantity) || 0;
    
    let varianceFlag = false;
    let varianceMessage = '';
    
    if (!isFirstTransaction && currentBefore !== prev) {
      varianceFlag = true;
      varianceMessage = `Current reading before (${currentBefore}) must match previous reading (${prev})`;
    }
    
    if (currentBefore && fuelQty) {
      const currentAfter = currentBefore + fuelQty;
      newData.currentMeterReadingAfter = currentAfter.toFixed(2);
    } else {
      newData.currentMeterReadingAfter = '';
    }
    
    return {
      ...newData,
      meterVarianceFlag: varianceFlag,
      meterVarianceMessage: varianceMessage
    };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      if (name.includes('MeterReading') || name === 'fuelQuantity' || name === 'plantNumber') {
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

  // FIXED: Handle Plant QR Scan
  const handleQRScan = (scannedData) => {
    let plantInfo;
    let parsedData = null;
    
    try {
      parsedData = JSON.parse(scannedData);
      
      if (parsedData.plantNumber) {
        plantInfo = {
          name: parsedData.plantName || plantMasterList[parsedData.plantNumber]?.name || parsedData.plantNumber,
          type: parsedData.plantType || plantMasterList[parsedData.plantNumber]?.type || 'Unknown Equipment',
          fuelType: parsedData.fuelType || plantMasterList[parsedData.plantNumber]?.fuelType || 'Diesel',
          category: parsedData.category || plantMasterList[parsedData.plantNumber]?.category || 'general',
          scannedTimestamp: parsedData.timestamp
        };
        
        const lastMeterReading = getLastMeterReading(parsedData.plantNumber);
        const firstTransaction = checkIfFirstTransaction(parsedData.plantNumber);
        setIsFirstTransaction(firstTransaction);

        setFormData(prev => ({
          ...prev,
          plantNumber: parsedData.plantNumber,
          plantName: plantInfo.name,
          plantType: plantInfo.type,
          fuelType: plantInfo.fuelType,
          previousMeterReading: lastMeterReading ? lastMeterReading.toString() : '0',
          currentMeterReadingBefore: !firstTransaction && lastMeterReading ? lastMeterReading.toString() : prev.currentMeterReadingBefore,
          qrScannedData: parsedData
        }));

        showEnhancedPlantInfoAlert(plantInfo, parsedData);
      } else {
        throw new Error('Not structured plant data');
      }
    } catch (error) {
      const plantNumber = scannedData;
      plantInfo = plantMasterList[plantNumber] || {
        name: plantNumber,
        type: 'Unknown Equipment',
        fuelType: 'Diesel',
        category: 'general'
      };

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
        currentMeterReadingBefore: !firstTransaction && lastMeterReading ? lastMeterReading.toString() : prev.currentMeterReadingBefore,
        qrScannedData: null
      }));

      showPlantInfoAlert(plantInfo, plantNumber);
    }

    setShowQRScanner(false);
  };

  // FIXED: Function to show enhanced plant info
  const showEnhancedPlantInfoAlert = (plantInfo, scannedData) => {
    const alertMessage = `
🚜 ENHANCED PLANT INFORMATION

Fleet Number: ${scannedData.plantNumber}
Equipment: ${plantInfo.name}
Type: ${plantInfo.type}
Fuel Type: ${plantInfo.fuelType}
Category: ${plantInfo.category}
QR Generated: ${scannedData.timestamp ? new Date(scannedData.timestamp).toLocaleString() : 'Unknown'}

✅ Enhanced QR data scanned successfully!
    `.trim();

    console.log('Enhanced plant data confirmed for transaction');
    
    setTimeout(() => {
      window.alert(`${alertMessage}\n\nPlant data loaded successfully!`);
    }, 100);
  };

  // FIXED: Function to show basic plant info
  const showPlantInfoAlert = (plantInfo, scannedData) => {
    const alertMessage = `
🚜 PLANT INFORMATION

Fleet Number: ${scannedData}
Equipment: ${plantInfo.name}
Type: ${plantInfo.type}
Fuel Type: ${plantInfo.fuelType}
Category: ${plantInfo.category}

✅ Basic plant data scanned successfully!
    `.trim();

    console.log('Basic plant data confirmed for transaction');
    
    setTimeout(() => {
      window.alert(`${alertMessage}\n\nPlant data loaded successfully!`);
    }, 100);
  };

  // Handle Odometer Kilometers QR Scan
  const handleOdometerKilosScan = (scannedData) => {
    try {
      let km = '';
      
      if (scannedData.includes('KM:') || scannedData.includes('km:') || scannedData.includes('KILOS:')) {
        km = scannedData.split(':')[1];
      } else if (scannedData.includes(',')) {
        const data = scannedData.split(',');
        data.forEach(item => {
          if (item.includes('KM:') || item.includes('km:') || item.includes('KILOS:')) {
            km = item.split(':')[1];
          }
        });
      } else {
        km = scannedData;
      }

      setFormData(prev => ({
        ...prev,
        odometerKilos: km || ''
      }));

      setShowOdometerKilosScanner(false);
      
      if (!km) {
        window.alert('No kilometers data found in QR code. Please scan again or enter manually.');
      } else {
        window.alert(`Kilometers scanned: ${km}`);
      }
    } catch (error) {
      console.error('Error parsing odometer kilometers QR:', error);
      window.alert('Error reading odometer kilometers QR code. Please try again or enter manually.');
    }
  };

  // Handle Odometer Hours QR Scan
  const handleOdometerHoursScan = (scannedData) => {
    try {
      let hrs = '';
      
      if (scannedData.includes('HRS:') || scannedData.includes('hrs:') || scannedData.includes('HOURS:')) {
        hrs = scannedData.split(':')[1];
      } else if (scannedData.includes(',')) {
        const data = scannedData.split(',');
        data.forEach(item => {
          if (item.includes('HRS:') || item.includes('hrs:') || item.includes('HOURS:')) {
            hrs = item.split(':')[1];
          }
        });
      } else {
        hrs = scannedData;
      }

      setFormData(prev => ({
        ...prev,
        odometerHours: hrs || ''
      }));

      setShowOdometerHoursScanner(false);
      
      if (!hrs) {
        window.alert('No hours data found in QR code. Please scan again or enter manually.');
      } else {
        window.alert(`Hours scanned: ${hrs}`);
      }
    } catch (error) {
      console.error('Error parsing odometer hours QR:', error);
      window.alert('Error reading odometer hours QR code. Please try again or enter manually.');
    }
  };

  // Handle adding custom site
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

  // Update store readings after transaction
  const updateStoreReadings = (storeName, fuelQuantity) => {
    if (!storeName) return;
    
    const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
    const currentReading = parseFloat(savedStoreReadings[storeName] || '0');
    const newReading = currentReading - parseFloat(fuelQuantity);
    
    const updatedReadings = {
      ...savedStoreReadings,
      [storeName]: Math.max(0, newReading).toString()
    };
    
    localStorage.setItem('storeReadings', JSON.stringify(updatedReadings));
    setStoreReadings(updatedReadings);
  };

  // Handle form submission
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

    if (!isFirstTransaction) {
      const prev = parseFloat(formData.previousMeterReading) || 0;
      const currentBefore = parseFloat(formData.currentMeterReadingBefore) || 0;
      
      if (currentBefore !== prev) {
        window.alert(`For subsequent transactions, current reading before (${currentBefore}) must match previous reading (${prev}). Please correct the values.`);
        return;
      }
    }

    if (formData.meterVarianceFlag && isFirstTransaction) {
      const proceed = window.confirm(`Meter reading variance detected:\n${formData.meterVarianceMessage}\n\nDo you want to proceed anyway?`);
      if (!proceed) {
        return;
      }
    }

    const transaction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...formData,
      attendantName: user.fullName,
      userId: user.id,
      isFirstTransaction: isFirstTransaction
    };

    setTransactions(prev => [transaction, ...prev]);
    
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    savedTransactions.unshift(transaction);
    localStorage.setItem('fuelTransactions', JSON.stringify(savedTransactions));
    
    if (formData.selectedFuelStore && formData.fuelQuantity) {
      updateStoreReadings(formData.selectedFuelStore, formData.fuelQuantity);
    }
    
    setFormData(prev => ({
      fuelStoreCategory: '',
      selectedFuelStore: '',
      plantNumber: '',
      plantName: '',
      plantType: '',
      qrScannedData: null,
      odometerKilos: '',
      odometerHours: '',
      previousMeterReading: '',
      currentMeterReadingBefore: '',
      fuelQuantity: '',
      currentMeterReadingAfter: '',
      meterVarianceFlag: false,
      meterVarianceMessage: '',
      contractType: '',
      customSiteNumber: '',
      transactionType: '',
      fuelType: 'Diesel',
      transactionDate: new Date().toISOString().split('T')[0],
      attendantName: user.fullName,
      receiverName: '',
      receiverCompany: '',
      employmentNumber: '',
      remarks: '',
      previousDip: prev.previousDip,
      currentDip: prev.currentDip,
      deliveryReceived: prev.deliveryReceived,
      openingReading: prev.openingReading,
      closingReading: prev.closingReading,
      variance: prev.variance
    }));

    setIsFirstTransaction(true);

    window.alert('Transaction recorded successfully!');
  };

  // Load transactions and store readings from localStorage on component mount
  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    setTransactions(savedTransactions);
    
    const savedStoreReadings = JSON.parse(localStorage.getItem('storeReadings') || '{}');
    setStoreReadings(savedStoreReadings);
  }, []);

  // Simple Excel download
  const downloadTransactionsExcel = () => {
    if (transactions.length === 0) {
      window.alert('No transactions to download.');
      return;
    }

    try {
      const { utils, writeFile } = XLSX;
      
      const excelData = transactions.map(transaction => ({
        'Transaction ID': transaction.id,
        'Date': transaction.transactionDate,
        'Plant Number': transaction.plantNumber,
        'Plant Name': transaction.plantName || '',
        'Fuel Store': transaction.selectedFuelStore,
        'Previous Reading': transaction.previousMeterReading,
        'Current Reading Before': transaction.currentMeterReadingBefore,
        'Fuel Quantity (L)': transaction.fuelQuantity,
        'Current Reading After': transaction.currentMeterReadingAfter,
        'Odometer (KM)': transaction.odometerKilos,
        'Hours': transaction.odometerHours,
        'Transaction Type': transaction.transactionType,
        'Contract/Site': transaction.contractType,
        'Fuel Type': transaction.fuelType,
        'Receiver Name': transaction.receiverName,
        'Receiver Company': transaction.receiverCompany,
        'Employment Number': transaction.employmentNumber,
        'Attendant': transaction.attendantName,
        'Remarks': transaction.remarks || '',
        'First Transaction': transaction.isFirstTransaction ? 'Yes' : 'No'
      }));

      const ws = utils.json_to_sheet(excelData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Fuel Transactions');
      
      writeFile(wb, `fuel-transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (error) {
      console.error('Excel download failed:', error);
      window.alert('Excel download failed. Please try again.');
    }
  };

  // Simple PDF download
  const downloadTransactionsPDF = () => {
    if (transactions.length === 0) {
      window.alert('No transactions to download.');
      return;
    }

    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('FUEL TRANSACTIONS REPORT', 20, 20);
      
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Generated by: ${user.fullName}`, 20, 37);
      doc.text(`Total Transactions: ${transactions.length}`, 20, 44);
      
      const totalFuel = transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0);
      doc.text(`Total Fuel: ${totalFuel.toFixed(2)}L`, 20, 51);
      
      doc.text('STOCK READINGS:', 20, 65);
      doc.text(`Previous Dip: ${formData.previousDip || 'N/A'}`, 20, 72);
      doc.text(`Current Dip: ${formData.currentDip || 'N/A'}`, 20, 79);
      doc.text(`Delivery Received: ${formData.deliveryReceived || 'N/A'}`, 20, 86);
      
      let yPos = 100;
      doc.text('RECENT TRANSACTIONS:', 20, yPos);
      yPos += 10;
      
      transactions.slice(0, 15).forEach((transaction, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        const line = `${transaction.plantNumber} | ${transaction.fuelQuantity}L | ${transaction.transactionType}`;
        doc.text(line, 20, yPos);
        yPos += 7;
      });
      
      doc.save(`fuel-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    }).catch((error) => {
      console.error('PDF failed:', error);
      window.alert('PDF generation failed. Please try downloading Excel instead.');
    });
  };

  // Generate QR for specific plant
  const generateQRForPlant = (plantNumber) => {
    if (plantNumber) {
      const plantInfo = plantMasterList[plantNumber] || {
        name: plantNumber,
        type: 'Unknown Equipment',
        fuelType: 'Diesel',
        category: 'general'
      };
      
      setSelectedPlantForQR(plantNumber);
      setSelectedPlantInfo(plantInfo);
      setShowQRGenerator(true);
    }
  };

  // Function to get user initials for avatar
  const getUserInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to get random color for avatar based on user name
  const getAvatarColor = (name) => {
    const colors = [
      '#1b5e20', '#1976d2', '#d32f2f', '#7b1fa2', 
      '#ff9800', '#0097a7', '#388e3c', '#5d4037'
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header with Logo and User Profile */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '15px 25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #e1e5e9'
      }}>
        {/* Logo Section - Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: 'white',
            border: '0px solid #e1e5e9'
          }}>
            <img 
              src="/fuel2.jpg" 
              alt="FMS Logo"
              style={{
                width: '100%',
                height: '130%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              FMS
            </div>
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              color: '#1b5e20',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Fuel Management System
            </h2>
            <p style={{ 
              margin: 0, 
              color: '#666',
              fontSize: '14px'
            }}>
              Clerk/Attendant Dashboard
            </p>
          </div>
        </div>

        {/* User Profile Section - Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '25px',
            border: '1px solid #e1e5e9'
          }}>
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
              fontWeight: 'bold',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {getUserInitials(user?.fullName)}
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#333',
                lineHeight: '1.2'
              }}>
                {user?.fullName || 'User'}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                lineHeight: '1.2'
              }}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Clerk/Attendant'}
              </div>
            </div>
          </div>

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
              fontWeight: '600',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#b71c1c';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#d32f2f';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        {/* Main Content */}
        <div>
          {/* Transaction Form */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#1b5e20', marginBottom: '25px' }}>New Fuel Transaction</h2>
            
            <form onSubmit={handleSubmit}>
              {/* Enhanced QR Data Display */}
              {formData.qrScannedData && (
                <div style={{
                  backgroundColor: '#e8f5e8',
                  padding: '15px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  border: '1px solid #c8e6c9'
                }}>
                  <h4 style={{ color: '#1b5e20', margin: '0 0 10px 0' }}>📱 Enhanced QR Data Detected</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div><strong>QR Version:</strong> {formData.qrScannedData.version || '1.0'}</div>
                    <div><strong>System:</strong> {formData.qrScannedData.system || 'Fuel Management System'}</div>
                    <div><strong>QR Generated:</strong> {formData.qrScannedData.timestamp ? new Date(formData.qrScannedData.timestamp).toLocaleString() : 'Unknown'}</div>
                  </div>
                </div>
              )}

              {/* QR Scan Sections */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Equipment & Readings Scan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Plant Number (QR Scan):
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        name="plantNumber"
                        value={formData.plantNumber}
                        onChange={handleInputChange}
                        placeholder="Scan plant QR code"
                        style={{ 
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowQRScanner(true)}
                        style={{
                          padding: '10px',
                          backgroundColor: '#1b5e20',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📱 Scan Plant
                      </button>
                    </div>
                    {formData.plantName && (
                      <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                        {formData.plantName} - {formData.plantType}
                        {isFirstTransaction ? ' (First Transaction)' : ' (Subsequent Transaction)'}
                      </small>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Store Current Reading:
                    </label>
                    <input
                      type="text"
                      value={formData.selectedFuelStore && storeReadings[formData.selectedFuelStore] 
                        ? `${storeReadings[formData.selectedFuelStore]}L` 
                        : 'Select store to see reading'}
                      readOnly
                      style={{ 
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#f9f9f9'
                      }}
                    />
                    <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                      Store reading updates automatically after transactions
                    </small>
                  </div>
                </div>

                {/* Plant Information Display */}
                {formData.plantNumber && (
                  <div style={{
                    backgroundColor: '#e8f5e8',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    border: '1px solid #c8e6c9'
                  }}>
                    <h4 style={{ color: '#1b5e20', margin: '0 0 10px 0' }}>Scanned Plant Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <strong>Plant Number:</strong> {formData.plantNumber}
                      </div>
                      <div>
                        <strong>Name:</strong> {formData.plantName}
                      </div>
                      <div>
                        <strong>Type:</strong> {formData.plantType}
                      </div>
                      <div>
                        <strong>Fuel Type:</strong> {formData.fuelType}
                      </div>
                    </div>
                    {formData.qrScannedData && (
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                        <strong>QR Generated:</strong> {formData.qrScannedData.timestamp ? new Date(formData.qrScannedData.timestamp).toLocaleString() : 'Unknown'}
                      </div>
                    )}
                  </div>
                )}

                {/* Separate Odometer Scanners */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Odometer Kilometers:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="number"
                        name="odometerKilos"
                        value={formData.odometerKilos}
                        onChange={handleInputChange}
                        step="0.1"
                        placeholder="Enter or scan kilometers"
                        style={{ 
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOdometerKilosScanner(true)}
                        style={{
                          padding: '10px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📱 Scan KM
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Odometer Hours:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="number"
                        name="odometerHours"
                        value={formData.odometerHours}
                        onChange={handleInputChange}
                        step="0.1"
                        placeholder="Enter or scan hours"
                        style={{ 
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOdometerHoursScanner(true)}
                        style={{
                          padding: '10px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📱 Scan HRS
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fuel Store Selection */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Fuel Store Selection</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Fuel Store Category:
                    </label>
                    <select
                      name="fuelStoreCategory"
                      value={formData.fuelStoreCategory}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
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

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Specific Store:
                    </label>
                    <select
                      name="selectedFuelStore"
                      value={formData.selectedFuelStore}
                      onChange={handleInputChange}
                      disabled={!formData.fuelStoreCategory}
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
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

              {/* Meter Readings */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Meter Readings</h3>
                
                {/* Variance Warning */}
                {formData.meterVarianceFlag && (
                  <div style={{
                    backgroundColor: '#fff3e0',
                    border: '1px solid #ffb74d',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '15px',
                    color: '#e65100'
                  }}>
                    ⚠️ {formData.meterVarianceMessage}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Previous Reading:
                    </label>
                    <input
                      type="number"
                      name="previousMeterReading"
                      value={formData.previousMeterReading}
                      onChange={handleInputChange}
                      step="0.01"
                      readOnly={!isFirstTransaction}
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: formData.meterVarianceFlag ? '2px solid #ff9800' : '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: isFirstTransaction ? 'white' : '#f5f5f5',
                        color: isFirstTransaction ? '#333' : '#666'
                      }}
                      required
                    />
                    <small style={{ color: '#666' }}>
                      {isFirstTransaction 
                        ? 'Enter initial reading for first transaction' 
                        : 'Auto-populated from last transaction (readonly)'}
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Current Reading (Before):
                    </label>
                    <input
                      type="number"
                      name="currentMeterReadingBefore"
                      value={formData.currentMeterReadingBefore}
                      onChange={handleInputChange}
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: formData.meterVarianceFlag ? '2px solid #ff9800' : '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: formData.meterVarianceFlag ? '#fff3e0' : 'white'
                      }}
                      required
                    />
                    <small style={{ color: '#666' }}>
                      {isFirstTransaction 
                        ? 'Reading before refueling' 
                        : 'Must match previous reading for consistency'}
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Fuel Quantity (L):
                    </label>
                    <input
                      type="number"
                      name="fuelQuantity"
                      value={formData.fuelQuantity}
                      onChange={handleInputChange}
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      required
                    />
                    <small style={{ color: '#666' }}>
                      Liters refilled - updates store reading
                    </small>
                  </div>
                </div>

                {/* Current Reading After Display */}
                <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Current Reading (After) - Auto-calculated:
                    </label>
                    <input
                      type="text"
                      value={formData.currentMeterReadingAfter || ''}
                      readOnly
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                        color: formData.currentMeterReadingAfter ? '#1b5e20' : '#666'
                      }}
                      placeholder="Before + Fuel Quantity"
                    />
                    <small style={{ color: '#666' }}>
                      Calculated: {formData.currentMeterReadingBefore || 0} + {formData.fuelQuantity || 0} = {formData.currentMeterReadingAfter || 0}
                    </small>
                  </div>
                </div>
              </div>

              {/* Transaction Type and Contract/Site */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Transaction & Site Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Transaction Type (Ledger Code):
                    </label>
                    <select
                      name="transactionType"
                      value={formData.transactionType}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      required
                    >
                      <option value="">Select Transaction Type</option>
                      {transactionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Contract/Site:
                    </label>
                    <select
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      required
                    >
                      <option value="">Select Contract/Site</option>
                      {contractOptions.map(contract => (
                        <option key={contract} value={contract}>{contract}</option>
                      ))}
                      {customSites.map(site => (
                        <option key={site} value={site}>{site} (Custom)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Add Custom Site:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      name="customSiteNumber"
                      value={formData.customSiteNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 2501/05"
                      style={{ 
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSite}
                      disabled={!formData.customSiteNumber}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: formData.customSiteNumber ? '#1b5e20' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: formData.customSiteNumber ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Add Site
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Readings Section */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Stock Readings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Previous Dip/Probe:
                    </label>
                    <input
                      type="number"
                      name="previousDip"
                      value={formData.previousDip}
                      onChange={handleInputChange}
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Current Dip/Probe:
                    </label>
                    <input
                      type="number"
                      name="currentDip"
                      value={formData.currentDip}
                      onChange={handleInputChange}
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Delivery Received:
                    </label>
                    <input
                      type="number"
                      name="deliveryReceived"
                      value={formData.deliveryReceived}
                      onChange={handleInputChange}
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Opening Reading:
                    </label>
                    <input
                      type="number"
                      name="openingReading"
                      value={formData.openingReading}
                      onChange={handleInputChange}
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Closing Reading:
                    </label>
                    <input
                      type="number"
                      name="closingReading"
                      value={formData.closingReading}
                      onChange={handleInputChange}
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Variance (%):
                    </label>
                    <input
                      type="number"
                      name="variance"
                      value={formData.variance}
                      onChange={handleInputChange}
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Additional Details</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Receiver Name:
                    </label>
                    <input
                      type="text"
                      name="receiverName"
                      value={formData.receiverName}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Employment Number:
                    </label>
                    <input
                      type="text"
                      name="employmentNumber"
                      value={formData.employmentNumber}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Receiver Company:
                  </label>
                  <input
                    type="text"
                    name="receiverCompany"
                    value={formData.receiverCompany}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Fuel Type:
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                  </select>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Transaction Date:
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    style={{ 
                      width: '100%', 
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Remarks:
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    style={{ 
                      width: '100%', 
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      resize: 'vertical'
                    }}
                    placeholder="Additional notes or comments..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ textAlign: 'center' }}>
                <button 
                  type="submit"
                  style={{ 
                    padding: '15px 40px',
                    backgroundColor: '#1b5e20',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Record Fuel Transaction
                </button>
              </div>
            </form>
          </div>

          {/* Recent Transactions */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#1b5e20', margin: 0 }}>Recent Transactions</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={downloadTransactionsExcel}
                  disabled={transactions.length === 0}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: transactions.length === 0 ? '#ccc' : '#1b5e20',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  📊 Download Excel
                </button>
                <button
                  onClick={downloadTransactionsPDF}
                  disabled={transactions.length === 0}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: transactions.length === 0 ? '#ccc' : '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  📄 Download PDF
                </button>
              </div>
            </div>
            
            {transactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No transactions recorded yet.
              </p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Plant</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Trans Type</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fuel Qty</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Odometer/Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map(transaction => (
                      <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{transaction.transactionDate}</td>
                        <td style={{ padding: '10px' }}>{transaction.plantNumber}</td>
                        <td style={{ padding: '10px' }}>{transaction.transactionType}</td>
                        <td style={{ padding: '10px' }}>{transaction.fuelQuantity}L</td>
                        <td style={{ padding: '10px' }}>
                          {transaction.odometerKilos && `${transaction.odometerKilos}KM`}
                          {transaction.odometerKilos && transaction.odometerHours && ' / '}
                          {transaction.odometerHours && `${transaction.odometerHours}HRS`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* QR Tools */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>QR Code Tools</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Generate QR for Plant:
              </label>
              <select
                value={selectedPlantForQR}
                onChange={(e) => setSelectedPlantForQR(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}
              >
                <option value="">Select Plant Number</option>
                {Object.keys(plantMasterList).map(plantNumber => (
                  <option key={plantNumber} value={plantNumber}>
                    {plantNumber} - {plantMasterList[plantNumber].name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => generateQRForPlant(selectedPlantForQR)}
                disabled={!selectedPlantForQR}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: !selectedPlantForQR ? '#ccc' : '#1b5e20',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !selectedPlantForQR ? 'not-allowed' : 'pointer'
                }}
              >
                Generate QR Code
              </button>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <button
                onClick={() => setShowQRScanner(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📱 Scan Plant QR
              </button>
              
              <button
                onClick={() => setShowOdometerKilosScanner(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📊 Scan Kilometers
              </button>

              <button
                onClick={() => setShowOdometerHoursScanner(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ⏱️ Scan Hours
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Quick Stats</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#e8f5e8', 
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>
                  {transactions.length}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>Total Transactions</div>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#e3f2fd', 
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                  {new Set(transactions.map(t => t.plantNumber)).size}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>Unique Equipment</div>
              </div>

              <div style={{ 
                padding: '15px', 
                backgroundColor: '#fff3e0', 
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef6c00' }}>
                  {transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0).toFixed(0)}L
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>Total Fuel</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner 
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Odometer Kilometers Scanner Modal */}
      {showOdometerKilosScanner && (
        <QRScanner 
          onScan={handleOdometerKilosScan}
          onClose={() => setShowOdometerKilosScanner(false)}
        />
      )}

      {/* Odometer Hours Scanner Modal */}
      {showOdometerHoursScanner && (
        <QRScanner 
          onScan={handleOdometerHoursScan}
          onClose={() => setShowOdometerHoursScanner(false)}
        />
      )}

      {/* QR Generator Modal */}
      {showQRGenerator && (
        <QRGenerator 
          plantNumber={selectedPlantForQR}
          plantInfo={selectedPlantInfo}
          onClose={() => setShowQRGenerator(false)}
        />
      )}
    </div>
  );
};

export default Admin;