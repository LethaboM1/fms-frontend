// import React, { useState, useEffect } from 'react';
// import QRScanner from '../qr/QRScanner';
// import QRGenerator from '../qr/QRGenerator';
// import TransactionHistory from '../transactions/TransactionHistory';
// import StockManagement from '../stock/StockManagement';
// import ReportingDashboard from '../reports/ReportingDashboard';
// import UserManagement from '../admin/UserManagement';

// const AttendantDashboard = ({ user, onLogout }) => {
//   const [formData, setFormData] = useState({
//     // Fuel Store Selection
//     fuelStoreCategory: '',
//     plantNumber: '',
    
//     // Date
//     transactionDate: new Date().toISOString().split('T')[0],
    
//     // Meter Readings
//     previousMeterReading: '',
//     currentMeterReading: '',
//     meterUnit: '',
//     consumption: '',
    
//     // Contract Details
//     contract: '',
//     customContract: '',
    
//     // Store Transaction Details
//     vatType: 'Inclusive',
//     store: '',
//     stockItem: '',
//     description: '',
//     inStock: '',
//     rate: '',
//     stockUnit: '',
    
//     // Currency and Quantities
//     currency: 'ZAR',
//     issueUnit: '',
//     convertBy: '1',
//     quantity: '',
//     convertQuantity: '',
//     amount: '',
//     total: '',
//     vat: '',
    
//     // Ledger Code
//     ledgerCode: ''
//   });

//   // Enhanced state management
//   const [showQRScanner, setShowQRScanner] = useState(false);
//   const [showQRGenerator, setShowQRGenerator] = useState(false);
//   const [selectedPlantForQR, setSelectedPlantForQR] = useState('');
//   const [activeTab, setActiveTab] = useState('newTransaction');
//   const [loading, setLoading] = useState(false);
//   const [stockData, setStockData] = useState([]);
//   const [realTimeUpdates, setRealTimeUpdates] = useState(null);
//   const [ledgerCodes, setLedgerCodes] = useState([]);
//   const [meterReadings, setMeterReadings] = useState([]);

//   // API Base URL - Replace with your ASP.NET API endpoint
//   const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7000/api';

//   // FUEL STORES DATA - EXACTLY AS YOU SPECIFIED
//   const fuelStores = {
//     service_trucks: [
//       { id: 'FSH01-01', name: 'FSH01 - 01', currentStock: 1500, capacity: 2000, fuelType: 'Diesel' },
//       { id: 'FSH02-01', name: 'FSH02 - 01', currentStock: 1800, capacity: 2000, fuelType: 'Diesel' },
//       { id: 'FSH03-01', name: 'FSH03 - 01', currentStock: 1200, capacity: 2000, fuelType: 'Diesel' },
//       { id: 'FSH04-01', name: 'FSH04 - 01', currentStock: 1900, capacity: 2000, fuelType: 'Diesel' }
//     ],
//     fuel_trailers: [
//       { id: 'SLD02', name: 'SLD 02', currentStock: 5000, capacity: 10000, fuelType: 'Diesel' },
//       { id: 'SLD07', name: 'SLD 07', currentStock: 7500, capacity: 10000, fuelType: 'Diesel' },
//       { id: 'SLD09', name: 'SLD 09', currentStock: 3000, capacity: 10000, fuelType: 'Diesel' }
//     ],
//     underground_tanks: [
//       { id: 'UDT49', name: 'UDT 49', currentStock: 15000, capacity: 50000, fuelType: 'Diesel' },
//       { id: 'UPT49', name: 'UPT 49', currentStock: 25000, capacity: 50000, fuelType: 'Petrol' },
//       { id: 'UDT890', name: 'UDT 890', currentStock: 18000, capacity: 50000, fuelType: 'Diesel' },
//       { id: 'STD02', name: 'STD 02', currentStock: 22000, capacity: 50000, fuelType: 'Diesel' },
//       { id: 'STD05', name: 'STD 05', currentStock: 19000, capacity: 50000, fuelType: 'Petrol' }
//     ]
//   };

//   // PLANT EQUIPMENT DATA - ALL YOUR EQUIPMENT EXACTLY AS YOU PROVIDED
//   const plantEquipment = {
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

//     // Fuel Trailers (Your original ones)
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

//     // Scania Tippers with Trailers
//     'A-THS07': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS08': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS09': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS10': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS11': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS12': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS13': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS14': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS15': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS16': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS17': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS18': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS19': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS20': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS21': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS22': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS23': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS24': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS25': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS26': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS27': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS28': { name: 'SCANIA 8x4 15m3 Tipper Only', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS29': { name: 'SCANIA 8x4 15m3 Tipper Only', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

//     // Benz Tippers
//     'A-TIB69': { name: 'BENZ 33-35 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIB70': { name: 'BENZ 33-35 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

//     // Scania P410 Tippers
//     'A-TIS47': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS48': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS49': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS50': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS51': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS52': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS68': { name: 'SCANIA P360 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

//     // Scania G460 Tippers
//     'A-TIS71': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS72': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS74': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

//     // TLBs and Manitou
//     'A-TLJ29': { name: 'TLB JCB 3CX 4X4 6.4t', type: 'TLB', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-TLJ31': { name: 'TLB JCB 3CX 4X4 6.4t', type: 'TLB', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-TLM01': { name: 'MANITOU MT932', type: 'Telehandler', fuelType: 'Diesel', category: 'material_handling' },

//     // Fuso Tippers
//     'A-TSF31': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSF32': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSF33': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

//     // VW Tippers
//     'A-TSV45': { name: 'VW 17-250 4x2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSV46': { name: 'VW 17-250 4x2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

//     // Water Tankers
//     'A-WTB36': { name: 'WATER TANKER MERC 2628', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM21': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM23': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM27': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM30': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM32': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM33': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM34': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM35': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTM38': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
//     'A-WTS37': { name: 'WATER TANKER 30KL SCANIA P410 8X4', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },

//     // Small Equipment and Tools
//     'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },

//     // Bitumen Pumps
//     'A-ZBP01': { name: 'BITUMEN PUMP', type: 'Bitumen Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP02': { name: 'BITUMEN PUMP 2"', type: 'Bitumen Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP03': { name: 'BITUMEN PUMP 2"', type: 'Bitumen Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP05': { name: 'BITUMEN PUMP 2"', type: 'Bitumen Pump', fuelType: 'Diesel', category: 'paving' },

//     // Concrete Saws
//     'A-ZCH07': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCH08': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCH09': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },

//     // Conveyors
//     'A-ZCJ01': { name: 'CONVEYOR TRAILER', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },
//     'A-ZCJ02': { name: 'CONVEYOR TRAILER', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },
//     'A-ZCT03': { name: 'CONVEYOR BELT', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },

//     // More Concrete Saws
//     'A-ZCT04': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCT05': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCT06': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCV07': { name: 'CONCRETE SAW HONDA', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },

//     // Fire Fighting Units
//     'A-ZFF01': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
//     'A-ZFF02': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
//     'A-ZFF03': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },

//     // Floor Grinders and Power Floats
//     'A-ZFH01': { name: 'FLOOR GRINDER', type: 'Floor Grinder', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFH02': { name: 'FLOOR GRINDER', type: 'Floor Grinder', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR01': { name: 'POWER FLOAT', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR02': { name: 'POWER FLOAT BRIGGS & STRATTON', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR03': { name: 'POWER FLOAT ROBIN', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR04': { name: 'POWER FLOAT ROBIN', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },

//     // Generators - Various types and sizes
//     'A-ZGB10': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB12': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB14': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB15': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB25': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB28': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB30': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB64': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },

//     // Large Generators
//     'A-ZGC17': { name: 'GENSET 100kVA CATERPILLAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD57': { name: 'GENSET DUETZ 100kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD59': { name: 'GENSET DUETZ 30kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD60': { name: 'GENSET DUETZ 30kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },

//     // Honda Generators
//     'A-ZGH20': { name: 'GENERATOR HONDA GX160', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH22': { name: 'GENSET HONDA SPOT LIGHT TRAILER', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH27': { name: 'GENERATOR HONDA 2.2KVA GX160', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH31': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH33': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH37': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH45': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH48': { name: 'GENERATOR 10KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGH69': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGH70': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },

//     // Other Generators
//     'A-ZGK01': { name: 'GENERATOR 8KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGP47': { name: 'GEN KING 60kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },

//     // Robin Generators
//     'A-ZGR04': { name: 'GENSET ROBIN CORE DRILL', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR05': { name: 'GENSET ROBIN CORE DRILL', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR59': { name: 'GENSET ROBIN', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR60': { name: 'GENSET ROBIN', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR61': { name: 'GENERATOR 8KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },

//     // Scania Generators
//     'A-ZGS49': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS50': { name: 'GENSET SKY-GO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS52': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS53': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS58': { name: 'GENSET 400kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },

//     // Volvo Generators
//     'A-ZGV06': { name: 'GENSET VOLVO 60kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGV15': { name: 'GENSET 200kVA VOLVO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGV32': { name: 'GENSET 400kVA VOLVO', type: 'Generator', fuelType: 'Diesel', category: 'power' },

//     // Yanmar Generators
//     'A-ZGY23': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGY64': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGY65': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },

//     // Hand Tools and Small Equipment
//     'A-ZHBS01': { name: 'HAND HELD BROOM STIHL', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZHBS02': { name: 'HAND HELD BROOM STIHL', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },

//     // Concrete Breakers
//     'A-ZJB07': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },
//     'A-ZJB09': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },
//     'A-ZJB10': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },
//     'A-ZJB11': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },
//     'A-ZJH12': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },

//     // Lab Equipment
//     'A-ZLC01': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'testing' },
//     'A-ZLC02': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'testing' },
//     'A-ZLC03': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'testing' },
//     'A-ZLC04': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'testing' },

//     // Tower Lights
//     'A-ZLH01': { name: 'TOWER LIGHT HONDA HOME BUILT', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLG02': { name: 'TOWER LIGHT GENERAC VTEVO', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLG03': { name: 'TOWER LIGHT GENERAC VTEVO', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLY04': { name: 'TOWER LIGHT YANMAR HOME BUILD', type: 'Tower Light', fuelType: 'Diesel', category: 'lighting' },
//     'A-ZLY05': { name: 'TOWER LIGHT YANMAR HOME BUILD', type: 'Tower Light', fuelType: 'Diesel', category: 'lighting' },

//     // Water Pumps - Various types and sizes
//     'A-ZPB40': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB43': { name: 'WATER PUMP 4" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB49': { name: 'WATER PUMP 2" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB51': { name: 'WATER PUMP 2" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB72': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB73': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB80': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },

//     // Plate Compactors
//     'A-ZPCB01': { name: 'PLATE COMPACTOR', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH02': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH03': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH04': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH05': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },

//     // Poker Vibrators
//     'A-ZPD01': { name: 'POKER DIASTAR KS20', type: 'Poker Vibrator', fuelType: 'Petrol', category: 'concrete' },

//     // More Water Pumps
//     'A-ZPF01': { name: 'WATER PUMP 6" FORD', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF02': { name: 'WATER PUMP VARIABLE FIAT', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF03': { name: 'WATER PUMP 3 INCH PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF04': { name: 'WATER PUMP 4" FIAT', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },

//     // Honda Water Pumps
//     'A-ZPH35': { name: 'WATER PUMP 3" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH45': { name: 'WATER PUMP 4" HOFFMANN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH47': { name: 'WATER PUMP 4" HOFFMANN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH52': { name: 'WATER PUMP 3 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH61': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH74': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH75': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH76': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH77': { name: 'WATER PUMP 2 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH81': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH82': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH83': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH86': { name: 'WATER PUMP 2 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH87': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH88': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH89': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPH90': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },

//     // Other Pumps
//     'A-ZPK63': { name: 'WATER PUMP 4" Electrical', type: 'Water Pump', fuelType: 'Electric', category: 'pumping' },
//     'A-ZPL28': { name: 'WATER PUMP 3" LAUNTOP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPL3': { name: 'WATER PUMP DRIVE UNIT LISTER DIESEL', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPL62': { name: 'WATER PUMP 3 INCH LAUNTOP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },

//     // Perkins Pumps
//     'A-ZPP01': { name: 'WATER PUMP 3" PETTER', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP03': { name: 'WATER PUMP 3" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP04': { name: 'WATER PUMP 3" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP59': { name: 'WATER PUMP 6" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },

//     // Robin and Other Pumps
//     'A-ZPR60': { name: 'WATER PUMP 4" ROBIN SLUDGE', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },

//     // Pressure Washers
//     'A-ZPWH06': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH07': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH08': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH74': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },

//     // Yanmar Pumps
//     'A-ZPY53': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPY84': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPY85': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },

//     // Walk-behind Rollers
//     'A-ZRB21': { name: 'WALK-BEHIND ROLL BOMAG BW65', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB23': { name: 'WALK-BEHIND ROLL BOMAG BW65', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB25': { name: 'WALK-BEHIND ROLL BOMAG BW65H', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB38': { name: 'WALK-BEHIND ROLL BOMAG BW65H', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB39': { name: 'WALK-BEHIND ROLL BOMAG BW61', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB40': { name: 'WALK-BEHIND ROLL BOMAG BW61', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },

//     // Rammers
//     'A-ZRH52': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRH53': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM43': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM44': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM45': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM46': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM47': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },

//     // Paint Stripper
//     'A-ZRS01': { name: 'PAINT STRIPPER', type: 'Paint Stripper', fuelType: 'Petrol', category: 'surface_prep' },

//     // Wacker Plates
//     'A-ZRW31': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW33': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW36': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW54': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW55': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW56': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW57': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW58': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW59': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW60': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW61': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW62': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW63': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },

//     // Yamaha Rammers
//     'A-ZRY38': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRY48': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRY49': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },

//     // Hoffmann Rammers
//     'A-ZRH50': { name: 'RAMMER HOFFMANN', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRH51': { name: 'RAMMER HOFFMANN', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },

//     // Submersible Pump
//     'A-ZSF01': { name: 'SUBMERSIBLE PUMP', type: 'Submersible Pump', fuelType: 'Electric', category: 'pumping' },

//     // Hompie Pompies (assuming these are small pumps)
//     'A-ZTS05': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS06': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS07': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS08': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS09': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS10': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS12': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS13': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS14': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS15': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS16': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS17': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS18': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS19': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS20': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS21': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS22': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },

//     // Drive Units
//     'A-ZVB05': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB10': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB15': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB16': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB19': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB21': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB36': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

//     // Other Drive Units
//     'A-ZVD12': { name: 'DRIVE UNIT DEK', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

//     // Honda Drive Units
//     'A-ZVH23': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH27': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH32': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH38': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH39': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

//     // Robin Drive Units
//     'A-ZVR22': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR31': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR33': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR43': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR44': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

//     // Yanmar Drive Units
//     'A-ZVY40': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY41': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY42': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY62': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },

//     // Wacker Drive Unit
//     'A-ZVW35': { name: 'DRIVE UNIT WACKER', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

//     // Welder Generators
//     'A-ZWH21': { name: 'GENSET WELDER HONDA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
//     'A-ZWH56': { name: 'GENSET WELDER HONDA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },

//     // Honda Wacker Plates
//     'A-ZWH24': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH25': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH32': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH42': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH43': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH44': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH45': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH46': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },

//     // Yamaha Welder
//     'A-ZWY01': { name: 'GENSET WELDER YAMAHA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
//   };

//   const contracts = ['Amplant', 'Sundries', 'Musina'];
//   const meterUnits = ['Liters', 'Kilometers', 'Hours'];

//   // API Service Functions
//   const apiService = {
//     // Transaction APIs
//     async saveTransaction(transactionData) {
//       const response = await fetch(`${API_BASE_URL}/transactions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${user.token}`
//         },
//         body: JSON.stringify(transactionData)
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to save transaction');
//       }
      
//       return await response.json();
//     },

//     async getTransactions(filters = {}) {
//       const queryParams = new URLSearchParams(filters).toString();
//       const response = await fetch(`${API_BASE_URL}/transactions?${queryParams}`, {
//         headers: {
//           'Authorization': `Bearer ${user.token}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch transactions');
//       }
      
//       return await response.json();
//     },

//     // Stock APIs
//     async getStockData() {
//       const response = await fetch(`${API_BASE_URL}/stock`, {
//         headers: {
//           'Authorization': `Bearer ${user.token}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch stock data');
//       }
      
//       return await response.json();
//     },

//     async updateStock(stockData) {
//       const response = await fetch(`${API_BASE_URL}/stock/${stockData.plantId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${user.token}`
//         },
//         body: JSON.stringify({
//           newStock: stockData.newStock,
//           updatedBy: user.fullName
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to update stock');
//       }
      
//       return await response.json();
//     },

//     // Ledger Code APIs
//     async getLedgerCodes(filters = {}) {
//       const queryParams = new URLSearchParams(filters).toString();
//       const response = await fetch(`${API_BASE_URL}/ledgercodes?${queryParams}`, {
//         headers: {
//           'Authorization': `Bearer ${user.token}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch ledger codes');
//       }
      
//       return await response.json();
//     },

//     // Meter Reading APIs
//     async getLatestMeterReading(plantNumber) {
//       const response = await fetch(`${API_BASE_URL}/meterreadings/plant/${plantNumber}/latest`, {
//         headers: {
//           'Authorization': `Bearer ${user.token}`
//         }
//       });
      
//       if (!response.ok) {
//         return null;
//       }
      
//       return await response.json();
//     },

//     async saveMeterReading(readingData) {
//       const response = await fetch(`${API_BASE_URL}/meterreadings`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${user.token}`
//         },
//         body: JSON.stringify(readingData)
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to save meter reading');
//       }
      
//       return await response.json();
//     },

//     // User Management APIs
//     async getUsers() {
//       const response = await fetch(`${API_BASE_URL}/users`, {
//         headers: {
//           'Authorization': `Bearer ${user.token}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch users');
//       }
      
//       return await response.json();
//     },

//     async createUser(userData) {
//       const response = await fetch(`${API_BASE_URL}/users`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${user.token}`
//         },
//         body: JSON.stringify(userData)
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to create user');
//       }
      
//       return await response.json();
//     },

//     // Vehicle verification API
//     async verifyVehicle(qrData) {
//       const response = await fetch(`${API_BASE_URL}/vehicles/verify`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${user.token}`
//         },
//         body: JSON.stringify({ qrData })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to verify vehicle');
//       }
      
//       return await response.json();
//     }
//   };

//   // Load initial data
//   useEffect(() => {
//     loadInitialData();
//     const cleanup = setupRealTimeUpdates();
//     return cleanup;
//   }, []);

//   const loadInitialData = async () => {
//     try {
//       setLoading(true);
//       // Load stock data from API
//       const stockData = await apiService.getStockData();
//       setStockData(stockData);
      
//       // Load ledger codes
//       const ledgerCodesData = await apiService.getLedgerCodes();
//       setLedgerCodes(ledgerCodesData);
      
//     } catch (error) {
//       console.error('Error loading initial data:', error);
//       // Fallback to local data if API fails
//       const allStock = Object.values(fuelStores).flat();
//       setStockData(allStock);
      
//       // Fallback ledger codes
//       setLedgerCodes([
//         { id: 1, code: 'DIESEL001', description: 'Diesel - Service Trucks', category: 'Fuel', fuelType: 'Diesel' },
//         { id: 2, code: 'DIESEL002', description: 'Diesel - Fuel Trailers', category: 'Fuel', fuelType: 'Diesel' },
//         { id: 3, code: 'DIESEL003', description: 'Diesel - Underground Tanks', category: 'Fuel', fuelType: 'Diesel' },
//         { id: 4, code: 'PETROL001', description: 'Petrol - Service Vehicles', category: 'Fuel', fuelType: 'Petrol' },
//         { id: 5, code: 'PETROL002', description: 'Petrol - Underground Tanks', category: 'Fuel', fuelType: 'Petrol' },
//         { id: 6, code: 'SUNDRY001', description: 'Sundries - Lubricants', category: 'Sundries', fuelType: '' },
//         { id: 7, code: 'SUNDRY002', description: 'Sundries - Maintenance', category: 'Sundries', fuelType: '' },
//         { id: 8, code: 'SUNDRY003', description: 'Sundries - Cleaning', category: 'Sundries', fuelType: '' }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Real-time updates using WebSocket or polling
//   const setupRealTimeUpdates = () => {
//     const interval = setInterval(async () => {
//       try {
//         const updates = await apiService.getStockData();
//         setStockData(updates);
//         setRealTimeUpdates(new Date().toLocaleTimeString());
//       } catch (error) {
//         console.error('Error fetching real-time updates:', error);
//       }
//     }, 30000);

//     return () => clearInterval(interval);
//   };

//   // Enhanced QR scan handler with API integration
//   const handleQRScan = async (qrData) => {
//     try {
//       // Verify QR data with backend
//       const vehicleData = await apiService.verifyVehicle(qrData);
      
//       // Get latest meter reading for this plant
//       const latestReading = await apiService.getLatestMeterReading(vehicleData.plantNumber);
      
//       setFormData(prev => ({
//         ...prev,
//         plantNumber: vehicleData.plantNumber,
//         previousMeterReading: latestReading ? latestReading.readingValue.toString() : '0',
//         meterUnit: latestReading ? latestReading.unit : 'Kilometers'
//       }));
      
//     } catch (error) {
//       console.error('Error verifying QR code:', error);
//       alert('Invalid QR code or error scanning. Please try again.');
//     } finally {
//       setShowQRScanner(false);
//     }
//   };

//   // Enhanced form change handler with real-time validation
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Real-time calculations
//     if (name === 'quantity' || name === 'rate') {
//       calculateAmounts();
//     }
//     if (name === 'currentMeterReading' && formData.previousMeterReading) {
//       calculateConsumption();
//     }
//     if (name === 'fuelStoreCategory' || name === 'plantNumber') {
//       updateStockInfo();
//       updateLedgerCodes();
//     }
//   };

//   // Update stock information when plant is selected
//   const updateStockInfo = () => {
//     if (formData.fuelStoreCategory && formData.plantNumber) {
//       const plants = getPlantNumbers();
//       const selectedPlant = plants.find(p => p.id === formData.plantNumber);
      
//       if (selectedPlant) {
//         setFormData(prev => ({
//           ...prev,
//           inStock: selectedPlant.currentStock,
//           store: selectedPlant.name,
//           stockItem: selectedPlant.fuelType
//         }));
//       }
//     }
//   };

//   // Update available ledger codes based on selected fuel type
//   const updateLedgerCodes = () => {
//     if (formData.fuelStoreCategory && formData.plantNumber) {
//       const plants = getPlantNumbers();
//       const selectedPlant = plants.find(p => p.id === formData.plantNumber);
      
//       if (selectedPlant) {
//         // Filter ledger codes by fuel type
//         const filteredLedgerCodes = ledgerCodes.filter(
//           code => code.fuelType === '' || code.fuelType === selectedPlant.fuelType
//         );
        
//         // Auto-select the first matching ledger code
//         if (filteredLedgerCodes.length > 0 && !formData.ledgerCode) {
//           setFormData(prev => ({
//             ...prev,
//             ledgerCode: filteredLedgerCodes[0].code
//           }));
//         }
//       }
//     }
//   };

//   const calculateAmounts = () => {
//     const quantity = parseFloat(formData.quantity) || 0;
//     const rate = parseFloat(formData.rate) || 0;
//     const amount = quantity * rate;
//     const vat = formData.vatType === 'Inclusive' ? amount * (15/115) : amount * 0.15;
//     const total = formData.vatType === 'Inclusive' ? amount : amount + vat;

//     setFormData(prev => ({
//       ...prev,
//       amount: amount.toFixed(2),
//       vat: vat.toFixed(2),
//       total: total.toFixed(2),
//       convertQuantity: quantity.toString()
//     }));
//   };

//   const calculateConsumption = () => {
//     const previous = parseFloat(formData.previousMeterReading) || 0;
//     const current = parseFloat(formData.currentMeterReading) || 0;
    
//     if (current > previous) {
//       const consumption = current - previous;
//       setFormData(prev => ({
//         ...prev,
//         consumption: consumption.toFixed(2)
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         consumption: ''
//       }));
//     }
//   };

//   // Enhanced submit handler with API integration
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Validate meter readings
//       if (parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading)) {
//         alert('Current meter reading must be greater than previous reading');
//         return;
//       }

//       const transaction = {
//         ...formData,
//         attendantId: user.id,
//         attendantName: user.fullName,
//         station: user.station,
//         timestamp: new Date().toISOString(),
//         status: 'completed'
//       };

//       // Save transaction to API
//       const savedTransaction = await apiService.saveTransaction(transaction);
      
//       // Save meter reading
//       await apiService.saveMeterReading({
//         plantNumber: formData.plantNumber,
//         readingDate: formData.transactionDate,
//         readingValue: parseFloat(formData.currentMeterReading),
//         unit: formData.meterUnit,
//         readingType: 'Regular',
//         takenBy: user.fullName,
//         notes: `Transaction: ${savedTransaction.id}`
//       });

//       console.log('Transaction and meter reading saved:', savedTransaction);
//       alert('Fuel transaction recorded successfully!');
      
//       // Reset form
//       resetForm();
      
//     } catch (error) {
//       console.error('Error saving transaction:', error);
//       alert('Error saving transaction. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       fuelStoreCategory: '',
//       plantNumber: '',
//       transactionDate: new Date().toISOString().split('T')[0],
//       previousMeterReading: '',
//       currentMeterReading: '',
//       meterUnit: '',
//       consumption: '',
//       contract: '',
//       customContract: '',
//       vatType: 'Inclusive',
//       store: '',
//       stockItem: '',
//       description: '',
//       inStock: '',
//       rate: '',
//       stockUnit: '',
//       currency: 'ZAR',
//       issueUnit: '',
//       convertBy: '1',
//       quantity: '',
//       convertQuantity: '',
//       amount: '',
//       total: '',
//       vat: '',
//       ledgerCode: ''
//     });
//   };

//   const generateQRForPlant = (plantNumber) => {
//     if (plantNumber) {
//       setSelectedPlantForQR(plantNumber);
//       setShowQRGenerator(true);
//     }
//   };

//   const getPlantNumbers = () => {
//     switch (formData.fuelStoreCategory) {
//       case 'service_trucks':
//         return fuelStores.service_trucks;
//       case 'fuel_trailers':
//         return fuelStores.fuel_trailers;
//       case 'underground_tanks':
//         return fuelStores.underground_tanks;
//       default:
//         return [];
//     }
//   };

//   // Get filtered ledger codes based on selected fuel type
//   const getFilteredLedgerCodes = () => {
//     if (formData.plantNumber) {
//       const plants = getPlantNumbers();
//       const selectedPlant = plants.find(p => p.id === formData.plantNumber);
      
//       if (selectedPlant) {
//         return ledgerCodes.filter(
//           code => code.fuelType === '' || code.fuelType === selectedPlant.fuelType
//         );
//       }
//     }
//     return ledgerCodes;
//   };

//   // Get all plant numbers for QR generation dropdown
//   const getAllPlantNumbers = () => {
//     return Object.values(fuelStores).flat();
//   };

//   // Mobile-responsive styles
//   const isMobile = window.innerWidth < 768;
//   const containerStyle = {
//     padding: isMobile ? '10px' : '20px',
//     maxWidth: '1200px',
//     margin: '0 auto'
//   };

//   const gridStyle = {
//     display: 'grid',
//     gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
//     gap: isMobile ? '10px' : '20px'
//   };

//   const threeColumnGrid = {
//     display: 'grid',
//     gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
//     gap: isMobile ? '10px' : '15px'
//   };

//   return (
//     <div style={containerStyle}>
//       {/* Enhanced Header */}
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '20px',
//         backgroundColor: '#0288d1',
//         color: 'white',
//         padding: '15px',
//         borderRadius: '8px',
//         flexDirection: isMobile ? 'column' : 'row',
//         gap: isMobile ? '10px' : '0'
//       }}>
//         <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
//           <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px' }}>Attendant Dashboard</h1>
//           <p style={{ margin: 0, opacity: 0.9, fontSize: isMobile ? '14px' : '16px' }}>
//             Fuel Management System {realTimeUpdates && `• Updated: ${realTimeUpdates}`}
//           </p>
//         </div>
//         <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
//           <span style={{ fontSize: '14px' }}>
//             {user.fullName} ({user.role})
//           </span>
//           <button 
//             onClick={onLogout}
//             style={{ 
//               padding: '8px 16px', 
//               border: '1px solid #fff',
//               backgroundColor: 'transparent',
//               color: 'white',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               fontSize: '14px'
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Enhanced Navigation Tabs */}
//       <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
//         <div style={{ 
//           display: 'flex', 
//           borderBottom: '2px solid #ddd',
//           minWidth: isMobile ? '500px' : 'auto'
//         }}>
//           {[
//             { id: 'newTransaction', label: 'New Transaction' },
//             { id: 'history', label: 'Transaction History' },
//             { id: 'stock', label: 'Stock Management' },
//             { id: 'reports', label: 'Reports' },
//             ...(user.role === 'admin' ? [{ id: 'users', label: 'User Management' }] : []),
//             { id: 'qrTools', label: 'QR Tools' }
//           ].map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               style={{
//                 padding: isMobile ? '10px 16px' : '12px 24px',
//                 backgroundColor: activeTab === tab.id ? '#0288d1' : 'transparent',
//                 color: activeTab === tab.id ? 'white' : '#0288d1',
//                 border: 'none',
//                 borderBottom: activeTab === tab.id ? '2px solid #0288d1' : 'none',
//                 cursor: 'pointer',
//                 fontWeight: 'bold',
//                 fontSize: isMobile ? '12px' : '14px',
//                 whiteSpace: 'nowrap'
//               }}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading && (
//         <div style={{
//           position: 'fixed',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           backgroundColor: 'rgba(0,0,0,0.8)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '8px',
//           zIndex: 1000
//         }}>
//           Loading...
//         </div>
//       )}

//       {/* Tab Content */}
//       {activeTab === 'newTransaction' && (
//         <NewTransactionForm 
//           formData={formData}
//           loading={loading}
//           showQRScanner={showQRScanner}
//           setShowQRScanner={setShowQRScanner}
//           handleChange={handleChange}
//           handleSubmit={handleSubmit}
//           getPlantNumbers={getPlantNumbers}
//           getFilteredLedgerCodes={getFilteredLedgerCodes}
//           isMobile={isMobile}
//           gridStyle={gridStyle}
//           threeColumnGrid={threeColumnGrid}
//           meterUnits={meterUnits}
//           contracts={contracts}
//         />
//       )}

//       {activeTab === 'history' && (
//         <TransactionHistory user={user} apiService={apiService} />
//       )}

//       {activeTab === 'stock' && (
//         <StockManagement 
//           user={user} 
//           stockData={stockData} 
//           apiService={apiService}
//           onStockUpdate={setStockData}
//         />
//       )}

//       {activeTab === 'reports' && (
//         <ReportingDashboard user={user} apiService={apiService} />
//       )}

//       {activeTab === 'users' && user.role === 'admin' && (
//         <UserManagement user={user} apiService={apiService} />
//       )}

//       {activeTab === 'qrTools' && (
//         <QRTools 
//           loading={loading}
//           showQRScanner={showQRScanner}
//           setShowQRScanner={setShowQRScanner}
//           generateQRForPlant={generateQRForPlant}
//           getAllPlantNumbers={getAllPlantNumbers}
//           selectedPlantForQR={selectedPlantForQR}
//           isMobile={isMobile}
//         />
//       )}

//       {/* QR Scanner Modal */}
//       {showQRScanner && (
//         <QRScanner 
//           onScan={handleQRScan}
//           onClose={() => setShowQRScanner(false)}
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

// // Extracted New Transaction Form Component
// const NewTransactionForm = ({ 
//   formData, 
//   loading, 
//   showQRScanner, 
//   setShowQRScanner, 
//   handleChange, 
//   handleSubmit, 
//   getPlantNumbers,
//   getFilteredLedgerCodes,
//   isMobile,
//   gridStyle,
//   threeColumnGrid,
//   meterUnits,
//   contracts
// }) => (
//   <div style={{ 
//     backgroundColor: 'white', 
//     padding: isMobile ? '15px' : '30px', 
//     borderRadius: '8px', 
//     border: '1px solid #ddd' 
//   }}>
//     <h2 style={{ 
//       marginBottom: '20px', 
//       color: '#0288d1',
//       fontSize: isMobile ? '18px' : '24px',
//       textAlign: isMobile ? 'center' : 'left'
//     }}>
//       Fuel Transaction Form
//     </h2>
    
//     {/* QR Scan Button */}
//     <div style={{ marginBottom: '20px', textAlign: 'center' }}>
//       <button
//         onClick={() => setShowQRScanner(true)}
//         disabled={loading}
//         style={{
//           padding: '12px 24px',
//           backgroundColor: loading ? '#ccc' : '#2e7d32',
//           color: 'white',
//           border: 'none',
//           borderRadius: '4px',
//           cursor: loading ? 'not-allowed' : 'pointer',
//           fontSize: '16px',
//           fontWeight: 'bold',
//           width: isMobile ? '100%' : 'auto'
//         }}
//       >
//         📱 Scan QR Code
//       </button>
//     </div>
    
//     {/* Main Transaction Form */}
//     <form onSubmit={handleSubmit}>
//       {/* Section 1: Fuel Store Selection */}
//       <div style={{ 
//         marginBottom: '20px', 
//         padding: '15px', 
//         border: '1px solid #eee', 
//         borderRadius: '8px' 
//       }}>
//         <h3 style={{ color: '#0288d1', marginBottom: '15px' }}>1. Fuel Store Selection</h3>
        
//         <div style={gridStyle}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Fuel Store Category:
//             </label>
//             <select
//               name="fuelStoreCategory"
//               value={formData.fuelStoreCategory}
//               onChange={handleChange}
//               required
//               disabled={loading}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             >
//               <option value="">Select Category</option>
//               <option value="service_trucks">Service Trucks</option>
//               <option value="fuel_trailers">Fuel Trailers</option>
//               <option value="underground_tanks">Underground Tanks</option>
//             </select>
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Plant Number:
//             </label>
//             <select
//               name="plantNumber"
//               value={formData.plantNumber}
//               onChange={handleChange}
//               required
//               disabled={!formData.fuelStoreCategory || loading}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             >
//               <option value="">Select Plant Number</option>
//               {getPlantNumbers().map(plant => (
//                 <option key={plant.id} value={plant.id}>
//                   {plant.name} (Stock: {plant.currentStock}L)
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div style={{ marginTop: '15px' }}>
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//             Transaction Date:
//           </label>
//           <input
//             type="date"
//             name="transactionDate"
//             value={formData.transactionDate}
//             onChange={handleChange}
//             required
//             disabled={loading}
//             style={{ 
//               width: '100%', 
//               padding: '10px',
//               border: '1px solid #ddd',
//               borderRadius: '4px'
//             }}
//           />
//         </div>
//       </div>

//       {/* Section 2: Meter Readings */}
//       <div style={{ 
//         marginBottom: '20px', 
//         padding: '15px', 
//         border: '1px solid #eee', 
//         borderRadius: '8px' 
//       }}>
//         <h3 style={{ color: '#0288d1', marginBottom: '15px' }}>2. Meter Readings</h3>
        
//         <div style={threeColumnGrid}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Previous Meter Reading:
//             </label>
//             <input
//               type="number"
//               name="previousMeterReading"
//               value={formData.previousMeterReading}
//               onChange={handleChange}
//               required
//               min="0"
//               step="0.01"
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 backgroundColor: '#f5f5f5'
//               }}
//               readOnly
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Current Meter Reading:
//             </label>
//             <input
//               type="number"
//               name="currentMeterReading"
//               value={formData.currentMeterReading}
//               onChange={handleChange}
//               required
//               min={parseFloat(formData.previousMeterReading) + 0.01 || 0}
//               step="0.01"
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading) 
//                   ? '2px solid red' : '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//             {formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading) && (
//               <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
//                 Current reading must be greater than previous reading
//               </small>
//             )}
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Unit:
//             </label>
//             <select
//               name="meterUnit"
//               value={formData.meterUnit}
//               onChange={handleChange}
//               required
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             >
//               <option value="">Select Unit</option>
//               {meterUnits.map(unit => (
//                 <option key={unit} value={unit}>{unit}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Consumption Display */}
//         {formData.consumption && (
//           <div style={{ 
//             marginTop: '15px', 
//             padding: '10px', 
//             backgroundColor: '#e8f5e8', 
//             border: '1px solid #4caf50',
//             borderRadius: '4px',
//             textAlign: 'center'
//           }}>
//             <strong>Consumption: {formData.consumption} {formData.meterUnit}</strong>
//           </div>
//         )}
//       </div>

//       {/* Section 3: Contract Details */}
//       <div style={{ 
//         marginBottom: '20px', 
//         padding: '15px', 
//         border: '1px solid #eee', 
//         borderRadius: '8px' 
//       }}>
//         <h3 style={{ color: '#0288d1', marginBottom: '15px' }}>3. Contract Details</h3>
        
//         <div style={gridStyle}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Contract:
//             </label>
//             <select
//               name="contract"
//               value={formData.contract}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             >
//               <option value="">Select Contract</option>
//               {contracts.map(contract => (
//                 <option key={contract} value={contract}>{contract}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Custom Contract (if Sundries):
//             </label>
//             <input
//               type="text"
//               name="customContract"
//               value={formData.customContract}
//               onChange={handleChange}
//               disabled={formData.contract !== 'Sundries'}
//               placeholder="Enter custom contract details"
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Section 4: Store Transaction Details */}
//       <div style={{ 
//         marginBottom: '20px', 
//         padding: '15px', 
//         border: '1px solid #eee', 
//         borderRadius: '8px' 
//       }}>
//         <h3 style={{ color: '#0288d1', marginBottom: '15px' }}>4. Store Transaction Details</h3>
        
//         <div style={threeColumnGrid}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               VAT Type:
//             </label>
//             <select
//               name="vatType"
//               value={formData.vatType}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             >
//               <option value="Inclusive">Inclusive</option>
//               <option value="Exclusive">Exclusive</option>
//             </select>
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Store:
//             </label>
//             <input
//               type="text"
//               name="store"
//               value={formData.store}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Stock Item:
//             </label>
//             <input
//               type="text"
//               name="stockItem"
//               value={formData.stockItem}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>
//         </div>

//         <div style={{ ...threeColumnGrid, marginTop: '15px' }}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Description:
//             </label>
//             <input
//               type="text"
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               In Stock:
//             </label>
//             <input
//               type="number"
//               name="inStock"
//               value={formData.inStock}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Stock Unit:
//             </label>
//             <input
//               type="text"
//               name="stockUnit"
//               value={formData.stockUnit}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Section 5: Currency and Quantities */}
//       <div style={{ 
//         marginBottom: '20px', 
//         padding: '15px', 
//         border: '1px solid #eee', 
//         borderRadius: '8px' 
//       }}>
//         <h3 style={{ color: '#0288d1', marginBottom: '15px' }}>5. Currency and Quantities</h3>
        
//         <div style={threeColumnGrid}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Currency:
//             </label>
//             <select
//               name="currency"
//               value={formData.currency}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             >
//               <option value="ZAR">ZAR</option>
//             </select>
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Issue/Del Unit:
//             </label>
//             <input
//               type="text"
//               name="issueUnit"
//               value={formData.issueUnit}
//               onChange={handleChange}
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Rate:
//             </label>
//             <input
//               type="number"
//               name="rate"
//               value={formData.rate}
//               onChange={handleChange}
//               step="0.01"
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>
//         </div>

//         <div style={{ ...threeColumnGrid, marginTop: '15px' }}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Quantity:
//             </label>
//             <input
//               type="number"
//               name="quantity"
//               value={formData.quantity}
//               onChange={handleChange}
//               step="0.01"
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Convert Quantity:
//             </label>
//             <input
//               type="number"
//               name="convertQuantity"
//               value={formData.convertQuantity}
//               readOnly
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 backgroundColor: '#f5f5f5'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Amount:
//             </label>
//             <input
//               type="number"
//               name="amount"
//               value={formData.amount}
//               readOnly
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 backgroundColor: '#f5f5f5'
//               }}
//             />
//           </div>
//         </div>

//         <div style={{ ...gridStyle, marginTop: '15px' }}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               VAT:
//             </label>
//             <input
//               type="number"
//               name="vat"
//               value={formData.vat}
//               readOnly
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 backgroundColor: '#f5f5f5'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Total:
//             </label>
//             <input
//               type="number"
//               name="total"
//               value={formData.total}
//               readOnly
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 backgroundColor: '#f5f5f5',
//                 fontSize: '16px',
//                 fontWeight: 'bold'
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Section 6: Ledger Code */}
//       <div style={{ 
//         marginBottom: '20px', 
//         padding: '15px', 
//         border: '1px solid #eee', 
//         borderRadius: '8px' 
//       }}>
//         <h3 style={{ color: '#0288d1', marginBottom: '15px' }}>6. Ledger Code</h3>
        
//         <div style={gridStyle}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Ledger Code:
//             </label>
//             <select
//               name="ledgerCode"
//               value={formData.ledgerCode}
//               onChange={handleChange}
//               required
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             >
//               <option value="">Select Ledger Code</option>
//               {getFilteredLedgerCodes().map(code => (
//                 <option key={code.id} value={code.code}>
//                   {code.code} - {code.description} {code.fuelType ? `(${code.fuelType})` : ''}
//                 </option>
//               ))}
//             </select>
//             <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
//               {formData.plantNumber ? 'Filtered by vehicle fuel type' : 'Select a vehicle first'}
//             </small>
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//               Total Amount:
//             </label>
//             <input
//               type="number"
//               name="total"
//               value={formData.total}
//               readOnly
//               style={{ 
//                 width: '100%', 
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 backgroundColor: '#f5f5f5',
//                 fontSize: '16px',
//                 fontWeight: 'bold'
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Submit Button */}
//       <div style={{ textAlign: 'center', marginTop: '20px' }}>
//         <button 
//           type="submit"
//           disabled={loading || (formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading))}
//           style={{ 
//             padding: '15px 40px',
//             backgroundColor: loading || (formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading)) ? '#ccc' : '#2e7d32',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             fontSize: '16px',
//             cursor: loading || (formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading)) ? 'not-allowed' : 'pointer',
//             fontWeight: 'bold',
//             width: isMobile ? '100%' : 'auto'
//           }}
//         >
//           {loading ? 'Processing...' : 'Submit Fuel Transaction'}
//         </button>
//       </div>
//     </form>
//   </div>
// );

// // Extracted QR Tools Component
// const QRTools = ({ 
//   loading, 
//   showQRScanner, 
//   setShowQRScanner, 
//   generateQRForPlant, 
//   getAllPlantNumbers, 
//   selectedPlantForQR,
//   isMobile 
// }) => (
//   <div style={{ 
//     backgroundColor: 'white', 
//     padding: isMobile ? '15px' : '30px', 
//     borderRadius: '8px', 
//     border: '1px solid #ddd' 
//   }}>
//     <h3 style={{ 
//       marginBottom: '20px', 
//       color: '#0288d1',
//       textAlign: isMobile ? 'center' : 'left'
//     }}>
//       QR Code Tools
//     </h3>
    
//     <div style={{
//       display: 'grid',
//       gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
//       gap: '15px'
//     }}>
//       <div style={{ 
//         textAlign: 'center', 
//         padding: '20px', 
//         border: '1px solid #ddd', 
//         borderRadius: '8px' 
//       }}>
//         <h4>Scan QR Code</h4>
//         <p>Scan vehicle QR codes to automatically fill plant numbers</p>
//         <button
//           onClick={() => setShowQRScanner(true)}
//           disabled={loading}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: loading ? '#ccc' : '#1976d2',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: loading ? 'not-allowed' : 'pointer',
//             marginTop: '10px',
//             width: isMobile ? '100%' : 'auto'
//           }}
//         >
//           Open Scanner
//         </button>
//       </div>

//       <div style={{ 
//         textAlign: 'center', 
//         padding: '20px', 
//         border: '1px solid #ddd', 
//         borderRadius: '8px' 
//       }}>
//         <h4>Generate QR Codes</h4>
//         <p>Create QR codes for plant numbers</p>
//         <select
//           onChange={(e) => generateQRForPlant(e.target.value)}
//           value={selectedPlantForQR}
//           disabled={loading}
//           style={{
//             width: '100%',
//             padding: '10px',
//             border: '1px solid #ddd',
//             borderRadius: '4px',
//             marginTop: '10px',
//             marginBottom: '10px'
//           }}
//         >
//           <option value="">Select Plant Number</option>
//           {getAllPlantNumbers().map(plant => (
//             <option key={plant.id} value={plant.id}>
//               {plant.name}
//             </option>
//           ))}
//         </select>
//         <button
//           onClick={() => generateQRForPlant(selectedPlantForQR)}
//           disabled={!selectedPlantForQR || loading}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: (!selectedPlantForQR || loading) ? '#ccc' : '#1976d2',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: (!selectedPlantForQR || loading) ? 'not-allowed' : 'pointer',
//             width: isMobile ? '100%' : 'auto'
//           }}
//         >
//           Generate QR Code
//         </button>
//       </div>
//     </div>
//   </div>
// );

// export default AttendantDashboard;

import React, { useState, useEffect } from 'react';
import QRScanner from '../qr/QRScanner';
import QRGenerator from '../qr/QRGenerator';
import TransactionHistory from '../transactions/TransactionHistory';
import StockManagement from '../stock/StockManagement';
import ReportingDashboard from '../reports/ReportingDashboard';
import UserManagement from '../admin/UserManagement';

const AttendantDashboard = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    // Fuel Store Selection (WHERE FUEL COMES FROM)
    fuelStoreCategory: '',
    fuelStore: '',
    
    // Plant Number (WHERE FUEL GOES TO)
    plantNumber: '',
    
    // Date
    transactionDate: new Date().toISOString().split('T')[0],
    
    // Meter Readings
    previousMeterReading: '',
    currentMeterReading: '',
    meterUnit: '',
    consumption: '',
    
    // Contract Details
    contract: '',
    customContract: '',
    
    // Store Transaction Details
    vatType: 'Inclusive',
    store: '',
    stockItem: '',
    description: '',
    inStock: '',
    rate: '',
    stockUnit: '',
    
    // Currency and Quantities
    currency: 'ZAR',
    issueUnit: '',
    convertBy: '1',
    quantity: '',
    convertQuantity: '',
    amount: '',
    total: '',
    vat: '',
    
    // Ledger Code
    ledgerCode: ''
  });

  // Enhanced state management
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [selectedPlantForQR, setSelectedPlantForQR] = useState('');
  const [activeTab, setActiveTab] = useState('newTransaction');
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(null);
  const [ledgerCodes, setLedgerCodes] = useState([]);
  const [meterReadings, setMeterReadings] = useState([]);

  // API Base URL - Replace with your ASP.NET API endpoint
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7000/api';

  // FUEL STORES DATA - WHERE FUEL COMES FROM
  const fuelStores = {
    service_trucks: [
      { id: 'FSH01-01', name: 'FSH01 - 01', currentStock: 1500, capacity: 2000, fuelType: 'Diesel' },
      { id: 'FSH02-01', name: 'FSH02 - 01', currentStock: 1800, capacity: 2000, fuelType: 'Diesel' },
      { id: 'FSH03-01', name: 'FSH03 - 01', currentStock: 1200, capacity: 2000, fuelType: 'Diesel' },
      { id: 'FSH04-01', name: 'FSH04 - 01', currentStock: 1900, capacity: 2000, fuelType: 'Diesel' }
    ],
    fuel_trailers: [
      { id: 'SLD02', name: 'SLD 02', currentStock: 5000, capacity: 10000, fuelType: 'Diesel' },
      { id: 'SLD07', name: 'SLD 07', currentStock: 7500, capacity: 10000, fuelType: 'Diesel' },
      { id: 'SLD09', name: 'SLD 09', currentStock: 3000, capacity: 10000, fuelType: 'Diesel' }
    ],
    underground_tanks: [
      { id: 'UDT49', name: 'UDT 49', currentStock: 15000, capacity: 50000, fuelType: 'Diesel' },
      { id: 'UPT49', name: 'UPT 49', currentStock: 25000, capacity: 50000, fuelType: 'Petrol' },
      { id: 'UDT890', name: 'UDT 890', currentStock: 18000, capacity: 50000, fuelType: 'Diesel' },
      { id: 'STD02', name: 'STD 02', currentStock: 22000, capacity: 50000, fuelType: 'Diesel' },
      { id: 'STD05', name: 'STD 05', currentStock: 19000, capacity: 50000, fuelType: 'Petrol' }
    ]
  };

  // PLANT EQUIPMENT DATA - WHERE FUEL GOES TO (ALL YOUR EQUIPMENT)
  const plantEquipment = {
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

    // ... Include ALL your remaining plant equipment here
    // Scania Tippers, Benz Tippers, TLBs, Water Tankers, Generators, Pumps, etc.
    
    // Small Equipment and Tools
    'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
    'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
    'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },

    // Add all remaining equipment from your list...
  };

  const contracts = ['Amplant', 'Sundries', 'Musina'];
  const meterUnits = ['Liters', 'Kilometers', 'Hours'];

  // API Service Functions (same as before)
  const apiService = {
    async saveTransaction(transactionData) {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(transactionData)
      });
      if (!response.ok) throw new Error('Failed to save transaction');
      return await response.json();
    },

    async getTransactions(filters = {}) {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/transactions?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return await response.json();
    },

    async getStockData() {
      const response = await fetch(`${API_BASE_URL}/stock`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch stock data');
      return await response.json();
    },

    async updateStock(stockData) {
      const response = await fetch(`${API_BASE_URL}/stock/${stockData.plantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          newStock: stockData.newStock,
          updatedBy: user.fullName
        })
      });
      if (!response.ok) throw new Error('Failed to update stock');
      return await response.json();
    },

    async getLedgerCodes(filters = {}) {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/ledgercodes?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch ledger codes');
      return await response.json();
    },

    async getLatestMeterReading(plantNumber) {
      const response = await fetch(`${API_BASE_URL}/meterreadings/plant/${plantNumber}/latest`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) return null;
      return await response.json();
    },

    async saveMeterReading(readingData) {
      const response = await fetch(`${API_BASE_URL}/meterreadings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(readingData)
      });
      if (!response.ok) throw new Error('Failed to save meter reading');
      return await response.json();
    },

    async getUsers() {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    },

    async createUser(userData) {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to create user');
      return await response.json();
    },

    async verifyVehicle(qrData) {
      const response = await fetch(`${API_BASE_URL}/vehicles/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ qrData })
      });
      if (!response.ok) throw new Error('Failed to verify vehicle');
      return await response.json();
    }
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const stockData = await apiService.getStockData();
      setStockData(stockData);
      
      const ledgerCodesData = await apiService.getLedgerCodes();
      setLedgerCodes(ledgerCodesData);
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      const allStock = Object.values(fuelStores).flat();
      setStockData(allStock);
      
      setLedgerCodes([
        { id: 1, code: 'DIESEL001', description: 'Diesel - Service Trucks', category: 'Fuel', fuelType: 'Diesel' },
        { id: 2, code: 'DIESEL002', description: 'Diesel - Fuel Trailers', category: 'Fuel', fuelType: 'Diesel' },
        { id: 3, code: 'DIESEL003', description: 'Diesel - Underground Tanks', category: 'Fuel', fuelType: 'Diesel' },
        { id: 4, code: 'PETROL001', description: 'Petrol - Service Vehicles', category: 'Fuel', fuelType: 'Petrol' },
        { id: 5, code: 'PETROL002', description: 'Petrol - Underground Tanks', category: 'Fuel', fuelType: 'Petrol' },
        { id: 6, code: 'SUNDRY001', description: 'Sundries - Lubricants', category: 'Sundries', fuelType: '' },
        { id: 7, code: 'SUNDRY002', description: 'Sundries - Maintenance', category: 'Sundries', fuelType: '' },
        { id: 8, code: 'SUNDRY003', description: 'Sundries - Cleaning', category: 'Sundries', fuelType: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates
  const setupRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      try {
        const updates = await apiService.getStockData();
        setStockData(updates);
        setRealTimeUpdates(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching real-time updates:', error);
      }
    }, 30000);
    return () => clearInterval(interval);
  };

  // QR scan handler
  const handleQRScan = async (qrData) => {
    try {
      const vehicleData = await apiService.verifyVehicle(qrData);
      const latestReading = await apiService.getLatestMeterReading(vehicleData.plantNumber);
      
      setFormData(prev => ({
        ...prev,
        plantNumber: vehicleData.plantNumber,
        previousMeterReading: latestReading ? latestReading.readingValue.toString() : '0',
        meterUnit: latestReading ? latestReading.unit : 'Kilometers'
      }));
      
    } catch (error) {
      console.error('Error verifying QR code:', error);
      alert('Invalid QR code or error scanning. Please try again.');
    } finally {
      setShowQRScanner(false);
    }
  };

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'quantity' || name === 'rate') {
      calculateAmounts();
    }
    if (name === 'currentMeterReading' && formData.previousMeterReading) {
      calculateConsumption();
    }
    if (name === 'fuelStoreCategory') {
      // Reset fuel store when category changes
      setFormData(prev => ({
        ...prev,
        fuelStore: ''
      }));
    }
    if (name === 'plantNumber') {
      updateLedgerCodes();
    }
  };

  // Update available ledger codes based on selected plant
  const updateLedgerCodes = () => {
    if (formData.plantNumber) {
      const selectedPlant = plantEquipment[formData.plantNumber];
      
      if (selectedPlant) {
        const filteredLedgerCodes = ledgerCodes.filter(
          code => code.fuelType === '' || code.fuelType === selectedPlant.fuelType
        );
        
        if (filteredLedgerCodes.length > 0 && !formData.ledgerCode) {
          setFormData(prev => ({
            ...prev,
            ledgerCode: filteredLedgerCodes[0].code
          }));
        }
      }
    }
  };

  const calculateAmounts = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const amount = quantity * rate;
    const vat = formData.vatType === 'Inclusive' ? amount * (15/115) : amount * 0.15;
    const total = formData.vatType === 'Inclusive' ? amount : amount + vat;

    setFormData(prev => ({
      ...prev,
      amount: amount.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2),
      convertQuantity: quantity.toString()
    }));
  };

  const calculateConsumption = () => {
    const previous = parseFloat(formData.previousMeterReading) || 0;
    const current = parseFloat(formData.currentMeterReading) || 0;
    
    if (current > previous) {
      const consumption = current - previous;
      setFormData(prev => ({
        ...prev,
        consumption: consumption.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        consumption: ''
      }));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading)) {
        alert('Current meter reading must be greater than previous reading');
        return;
      }

      const transaction = {
        ...formData,
        attendantId: user.id,
        attendantName: user.fullName,
        station: user.station,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      const savedTransaction = await apiService.saveTransaction(transaction);
      
      await apiService.saveMeterReading({
        plantNumber: formData.plantNumber,
        readingDate: formData.transactionDate,
        readingValue: parseFloat(formData.currentMeterReading),
        unit: formData.meterUnit,
        readingType: 'Regular',
        takenBy: user.fullName,
        notes: `Transaction: ${savedTransaction.id}`
      });

      console.log('Transaction and meter reading saved:', savedTransaction);
      alert('Fuel transaction recorded successfully!');
      
      resetForm();
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fuelStoreCategory: '',
      fuelStore: '',
      plantNumber: '',
      transactionDate: new Date().toISOString().split('T')[0],
      previousMeterReading: '',
      currentMeterReading: '',
      meterUnit: '',
      consumption: '',
      contract: '',
      customContract: '',
      vatType: 'Inclusive',
      store: '',
      stockItem: '',
      description: '',
      inStock: '',
      rate: '',
      stockUnit: '',
      currency: 'ZAR',
      issueUnit: '',
      convertBy: '1',
      quantity: '',
      convertQuantity: '',
      amount: '',
      total: '',
      vat: '',
      ledgerCode: ''
    });
  };

  const generateQRForPlant = (plantNumber) => {
    if (plantNumber) {
      setSelectedPlantForQR(plantNumber);
      setShowQRGenerator(true);
    }
  };

  // Get fuel stores for selected category
  const getFuelStores = () => {
    switch (formData.fuelStoreCategory) {
      case 'service_trucks':
        return fuelStores.service_trucks;
      case 'fuel_trailers':
        return fuelStores.fuel_trailers;
      case 'underground_tanks':
        return fuelStores.underground_tanks;
      default:
        return [];
    }
  };

  // Get all plant numbers for dropdown
  const getPlantNumbers = () => {
    return Object.entries(plantEquipment).map(([id, equipment]) => ({
      id,
      name: equipment.name,
      type: equipment.type,
      fuelType: equipment.fuelType
    }));
  };

  // Get filtered ledger codes based on selected plant
  const getFilteredLedgerCodes = () => {
    if (formData.plantNumber) {
      const selectedPlant = plantEquipment[formData.plantNumber];
      
      if (selectedPlant) {
        return ledgerCodes.filter(
          code => code.fuelType === '' || code.fuelType === selectedPlant.fuelType
        );
      }
    }
    return ledgerCodes;
  };

  // Get all plant numbers for QR generation dropdown
  const getAllPlantNumbers = () => {
    return getPlantNumbers();
  };

  // Mobile-responsive styles
  const isMobile = window.innerWidth < 768;
  const containerStyle = {
    padding: isMobile ? '10px' : '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
    gap: isMobile ? '10px' : '20px'
  };

  const threeColumnGrid = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '10px' : '15px'
  };

  return (
    <div style={containerStyle}>
      {/* Header and Navigation (same as before) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: '#0288d1',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '10px' : '0'
      }}>
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px' }}>Attendant Dashboard</h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: isMobile ? '14px' : '16px' }}>
            Fuel Management System {realTimeUpdates && `• Updated: ${realTimeUpdates}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
          <span style={{ fontSize: '14px' }}>
            {user.fullName} ({user.role})
          </span>
          <button 
            onClick={onLogout}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #fff',
              backgroundColor: 'transparent',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #ddd',
          minWidth: isMobile ? '500px' : 'auto'
        }}>
          {[
            { id: 'newTransaction', label: 'New Transaction' },
            { id: 'history', label: 'Transaction History' },
            { id: 'stock', label: 'Stock Management' },
            { id: 'reports', label: 'Reports' },
            ...(user.role === 'admin' ? [{ id: 'users', label: 'User Management' }] : []),
            { id: 'qrTools', label: 'QR Tools' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: isMobile ? '10px 16px' : '12px 24px',
                backgroundColor: activeTab === tab.id ? '#0288d1' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#0288d1',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #0288d1' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '12px' : '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          Loading...
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'newTransaction' && (
        <NewTransactionForm 
          formData={formData}
          loading={loading}
          showQRScanner={showQRScanner}
          setShowQRScanner={setShowQRScanner}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          getFuelStores={getFuelStores}
          getPlantNumbers={getPlantNumbers}
          getFilteredLedgerCodes={getFilteredLedgerCodes}
          isMobile={isMobile}
          gridStyle={gridStyle}
          threeColumnGrid={threeColumnGrid}
          meterUnits={meterUnits}
          contracts={contracts}
        />
      )}

      {/* Other tabs remain the same */}
      {activeTab === 'history' && <TransactionHistory user={user} apiService={apiService} />}
      {activeTab === 'stock' && <StockManagement user={user} stockData={stockData} apiService={apiService} onStockUpdate={setStockData} />}
      {activeTab === 'reports' && <ReportingDashboard user={user} apiService={apiService} />}
      {activeTab === 'users' && user.role === 'admin' && <UserManagement user={user} apiService={apiService} />}
      {activeTab === 'qrTools' && (
        <QRTools 
          loading={loading}
          showQRScanner={showQRScanner}
          setShowQRScanner={setShowQRScanner}
          generateQRForPlant={generateQRForPlant}
          getAllPlantNumbers={getAllPlantNumbers}
          selectedPlantForQR={selectedPlantForQR}
          isMobile={isMobile}
        />
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner 
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* QR Generator Modal */}
      {showQRGenerator && (
        <QRGenerator 
          plantNumber={selectedPlantForQR}
          onClose={() => setShowQRGenerator(false)}
        />
      )}
    </div>
  );
};

// Updated New Transaction Form Component with TWO SEPARATE DROPDOWNS
const NewTransactionForm = ({ 
  formData, 
  loading, 
  showQRScanner, 
  setShowQRScanner, 
  handleChange, 
  handleSubmit, 
  getFuelStores,
  getPlantNumbers,
  getFilteredLedgerCodes,
  isMobile,
  gridStyle,
  threeColumnGrid,
  meterUnits,
  contracts
}) => (
  <div style={{ 
    backgroundColor: 'white', 
    padding: isMobile ? '15px' : '30px', 
    borderRadius: '8px', 
    border: '1px solid #ddd' 
  }}>
    <h2 style={{ 
      marginBottom: '20px', 
      color: '#0288d1',
      fontSize: isMobile ? '18px' : '24px',
      textAlign: isMobile ? 'center' : 'left'
    }}>
      Fuel Transaction Form
    </h2>
    
    {/* QR Scan Button */}
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
      <button
        onClick={() => setShowQRScanner(true)}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: loading ? '#ccc' : '#2e7d32',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          width: isMobile ? '100%' : 'auto'
        }}
      >
        📱 Scan QR Code
      </button>
    </div>
    
    {/* Main Transaction Form */}
    <form onSubmit={handleSubmit}>
      {/* Section 1: Fuel Source and Destination */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        border: '1px solid #eee', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ color: '#0288d1', marginBottom: '15px' }}>1. Fuel Source and Destination</h3>
        
        <div style={gridStyle}>
          {/* FUEL SOURCE - WHERE FUEL COMES FROM */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Fuel Store Category:
            </label>
            <select
              name="fuelStoreCategory"
              value={formData.fuelStoreCategory}
              onChange={handleChange}
              required
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select Fuel Source Category</option>
              <option value="service_trucks">Service Trucks</option>
              <option value="fuel_trailers">Fuel Trailers</option>
              <option value="underground_tanks">Underground Tanks</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Fuel Store:
            </label>
            <select
              name="fuelStore"
              value={formData.fuelStore}
              onChange={handleChange}
              required
              disabled={!formData.fuelStoreCategory || loading}
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select Fuel Store</option>
              {getFuelStores().map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} (Stock: {store.currentStock}L)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PLANT NUMBER - WHERE FUEL GOES TO */}
        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Plant Number (Equipment/Vehicle):
          </label>
          <select
            name="plantNumber"
            value={formData.plantNumber}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="">Select Plant Number</option>
            {getPlantNumbers().map(plant => (
              <option key={plant.id} value={plant.id}>
                {plant.id} - {plant.name} ({plant.type})
              </option>
            ))}
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
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {/* Rest of the form sections remain the same */}
      {/* Section 2: Meter Readings */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        border: '1px solid #eee', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ color: '#0288d1', marginBottom: '15px' }}>2. Meter Readings</h3>
        
        <div style={threeColumnGrid}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Previous Meter Reading:
            </label>
            <input
              type="number"
              name="previousMeterReading"
              value={formData.previousMeterReading}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5'
              }}
              readOnly
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Current Meter Reading:
            </label>
            <input
              type="number"
              name="currentMeterReading"
              value={formData.currentMeterReading}
              onChange={handleChange}
              required
              min={parseFloat(formData.previousMeterReading) + 0.01 || 0}
              step="0.01"
              style={{ 
                width: '100%', 
                padding: '10px',
                border: formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading) 
                  ? '2px solid red' : '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            {formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading) && (
              <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                Current reading must be greater than previous reading
              </small>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Unit:
            </label>
            <select
              name="meterUnit"
              value={formData.meterUnit}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select Unit</option>
              {meterUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Consumption Display */}
        {formData.consumption && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#e8f5e8', 
            border: '1px solid #4caf50',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            <strong>Consumption: {formData.consumption} {formData.meterUnit}</strong>
          </div>
        )}
      </div>

      {/* Sections 3-6 remain the same as before */}
      {/* ... (Include all the other form sections) */}

      {/* Submit Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          type="submit"
          disabled={loading || (formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading))}
          style={{ 
            padding: '15px 40px',
            backgroundColor: loading || (formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading)) ? '#ccc' : '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading || (formData.currentMeterReading && parseFloat(formData.currentMeterReading) <= parseFloat(formData.previousMeterReading)) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          {loading ? 'Processing...' : 'Submit Fuel Transaction'}
        </button>
      </div>
    </form>
  </div>
);

// QR Tools Component (same as before)
const QRTools = ({ 
  loading, 
  showQRScanner, 
  setShowQRScanner, 
  generateQRForPlant, 
  getAllPlantNumbers, 
  selectedPlantForQR,
  isMobile 
}) => (
  <div style={{ 
    backgroundColor: 'white', 
    padding: isMobile ? '15px' : '30px', 
    borderRadius: '8px', 
    border: '1px solid #ddd' 
  }}>
    <h3 style={{ 
      marginBottom: '20px', 
      color: '#0288d1',
      textAlign: isMobile ? 'center' : 'left'
    }}>
      QR Code Tools
    </h3>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px'
    }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px' 
      }}>
        <h4>Scan QR Code</h4>
        <p>Scan vehicle QR codes to automatically fill plant numbers</p>
        <button
          onClick={() => setShowQRScanner(true)}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          Open Scanner
        </button>
      </div>

      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px' 
      }}>
        <h4>Generate QR Codes</h4>
        <p>Create QR codes for plant numbers</p>
        <select
          onChange={(e) => generateQRForPlant(e.target.value)}
          value={selectedPlantForQR}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginTop: '10px',
            marginBottom: '10px'
          }}
        >
          <option value="">Select Plant Number</option>
          {getAllPlantNumbers().map(plant => (
            <option key={plant.id} value={plant.id}>
              {plant.id} - {plant.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => generateQRForPlant(selectedPlantForQR)}
          disabled={!selectedPlantForQR || loading}
          style={{
            padding: '10px 20px',
            backgroundColor: (!selectedPlantForQR || loading) ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!selectedPlantForQR || loading) ? 'not-allowed' : 'pointer',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          Generate QR Code
        </button>
      </div>
    </div>
  </div>
);

export default AttendantDashboard;