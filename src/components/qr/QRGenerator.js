import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRGenerator = ({ plantNumber, onClose }) => {
  const [qrData, setQrData] = useState('');
  const [qrMode, setQrMode] = useState('enhanced'); // 'simple' or 'enhanced'

  // Plant info data
  const plantInfo = {
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

    // Fuel Trailers (Your original ones)
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

  // Scania Tippers with Trailers
  'A-THS07': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS08': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS09': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS10': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS11': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS12': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS13': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS14': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS15': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS16': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS17': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS18': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS19': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS20': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS21': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS22': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS23': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS24': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS25': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS26': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS27': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS28': { name: 'SCANIA 8x4 15m3 Tipper Only', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-THS29': { name: 'SCANIA 8x4 15m3 Tipper Only', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

  // Benz Tippers
  'A-TIB69': { name: 'BENZ 33-35 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIB70': { name: 'BENZ 33-35 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

  // Scania P410 Tippers
  'A-TIS47': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIS48': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIS49': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIS50': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIS51': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIS52': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIS68': { name: 'SCANIA P360 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

  // Scania G460 Tippers
  'A-TIS71': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIS72': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TIS74': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

  // TLBs and Manitou
  'A-TLJ29': { name: 'TLB JCB 3CX 4X4 6.4t', type: 'TLB', fuelType: 'Diesel', category: 'earthmoving' },
  'A-TLJ31': { name: 'TLB JCB 3CX 4X4 6.4t', type: 'TLB', fuelType: 'Diesel', category: 'earthmoving' },
  'A-TLM01': { name: 'MANITOU MT932', type: 'Telehandler', fuelType: 'Diesel', category: 'material_handling' },

  // Fuso Tippers
  'A-TSF31': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TSF32': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TSF33': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

  // VW Tippers
  'A-TSV45': { name: 'VW 17-250 4x2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
  'A-TSV46': { name: 'VW 17-250 4x2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },

  // Water Tankers
  'A-WTB36': { name: 'WATER TANKER MERC 2628', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM21': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM23': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM27': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM30': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM32': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM33': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM34': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM35': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTM38': { name: 'WATER TANKER 16KL MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },
  'A-WTS37': { name: 'WATER TANKER 30KL SCANIA P410 8X4', type: 'Water Tanker', fuelType: 'Diesel', category: 'water_supply' },

  // Small Equipment and Tools
  'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },

  // Bitumen Pumps
  'A-ZBP01': { name: 'BITUMEN PUMP', type: 'Bitumen Pump', fuelType: 'Diesel', category: 'paving' },
  'A-ZBP02': { name: 'BITUMEN PUMP 2"', type: 'Bitumen Pump', fuelType: 'Diesel', category: 'paving' },
  'A-ZBP03': { name: 'BITUMEN PUMP 2"', type: 'Bitumen Pump', fuelType: 'Diesel', category: 'paving' },
  'A-ZBP05': { name: 'BITUMEN PUMP 2"', type: 'Bitumen Pump', fuelType: 'Diesel', category: 'paving' },

  // Concrete Saws
  'A-ZCH07': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
  'A-ZCH08': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
  'A-ZCH09': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },

  // Conveyors
  'A-ZCJ01': { name: 'CONVEYOR TRAILER', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },
  'A-ZCJ02': { name: 'CONVEYOR TRAILER', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },
  'A-ZCT03': { name: 'CONVEYOR BELT', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },

  // More Concrete Saws
  'A-ZCT04': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
  'A-ZCT05': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
  'A-ZCT06': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
  'A-ZCV07': { name: 'CONCRETE SAW HONDA', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },

  // Fire Fighting Units
  'A-ZFF01': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
  'A-ZFF02': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
  'A-ZFF03': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },

  // Floor Grinders and Power Floats
  'A-ZFH01': { name: 'FLOOR GRINDER', type: 'Floor Grinder', fuelType: 'Petrol', category: 'concrete' },
  'A-ZFH02': { name: 'FLOOR GRINDER', type: 'Floor Grinder', fuelType: 'Petrol', category: 'concrete' },
  'A-ZFR01': { name: 'POWER FLOAT', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
  'A-ZFR02': { name: 'POWER FLOAT BRIGGS & STRATTON', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
  'A-ZFR03': { name: 'POWER FLOAT ROBIN', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
  'A-ZFR04': { name: 'POWER FLOAT ROBIN', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },

  // Generators - Various types and sizes
  'A-ZGB10': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGB12': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGB14': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGB15': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGB25': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGB28': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGB30': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGB64': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },

  // Large Generators
  'A-ZGC17': { name: 'GENSET 100kVA CATERPILLAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGD57': { name: 'GENSET DUETZ 100kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGD59': { name: 'GENSET DUETZ 30kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGD60': { name: 'GENSET DUETZ 30kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },

  // Honda Generators
  'A-ZGH20': { name: 'GENERATOR HONDA GX160', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGH22': { name: 'GENSET HONDA SPOT LIGHT TRAILER', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGH27': { name: 'GENERATOR HONDA 2.2KVA GX160', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGH31': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGH33': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGH37': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGH45': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGH48': { name: 'GENERATOR 10KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGH69': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGH70': { name: 'GENSET HONDA', type: 'Generator', fuelType: 'Petrol', category: 'power' },

  // Other Generators
  'A-ZGK01': { name: 'GENERATOR 8KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGP47': { name: 'GEN KING 60kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },

  // Robin Generators
  'A-ZGR04': { name: 'GENSET ROBIN CORE DRILL', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGR05': { name: 'GENSET ROBIN CORE DRILL', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGR59': { name: 'GENSET ROBIN', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGR60': { name: 'GENSET ROBIN', type: 'Generator', fuelType: 'Petrol', category: 'power' },
  'A-ZGR61': { name: 'GENERATOR 8KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },

  // Scania Generators
  'A-ZGS49': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGS50': { name: 'GENSET SKY-GO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGS52': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGS53': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGS58': { name: 'GENSET 400kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },

  // Volvo Generators
  'A-ZGV06': { name: 'GENSET VOLVO 60kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGV15': { name: 'GENSET 200kVA VOLVO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGV32': { name: 'GENSET 400kVA VOLVO', type: 'Generator', fuelType: 'Diesel', category: 'power' },

  // Yanmar Generators
  'A-ZGY23': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGY64': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
  'A-ZGY65': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },

  // Hand Tools and Small Equipment
  'A-ZHBS01': { name: 'HAND HELD BROOM STIHL', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  'A-ZHBS02': { name: 'HAND HELD BROOM STIHL', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },

  // Concrete Breakers
  'A-ZJB07': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },
  'A-ZJB09': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },
  'A-ZJB10': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },
  'A-ZJB11': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },
  'A-ZJH12': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Petrol', category: 'demolition' },

  // Lab Equipment
  'A-ZLC01': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'testing' },
  'A-ZLC02': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'testing' },
  'A-ZLC03': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'testing' },
  'A-ZLC04': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'testing' },

  // Tower Lights
  'A-ZLH01': { name: 'TOWER LIGHT HONDA HOME BUILT', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
  'A-ZLG02': { name: 'TOWER LIGHT GENERAC VTEVO', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
  'A-ZLG03': { name: 'TOWER LIGHT GENERAC VTEVO', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
  'A-ZLY04': { name: 'TOWER LIGHT YANMAR HOME BUILD', type: 'Tower Light', fuelType: 'Diesel', category: 'lighting' },
  'A-ZLY05': { name: 'TOWER LIGHT YANMAR HOME BUILD', type: 'Tower Light', fuelType: 'Diesel', category: 'lighting' },

  // Water Pumps - Various types and sizes
  'A-ZPB40': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPB43': { name: 'WATER PUMP 4" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPB49': { name: 'WATER PUMP 2" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPB51': { name: 'WATER PUMP 2" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPB72': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPB73': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPB80': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },

  // Plate Compactors
  'A-ZPCB01': { name: 'PLATE COMPACTOR', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
  'A-ZPCH02': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
  'A-ZPCH03': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
  'A-ZPCH04': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
  'A-ZPCH05': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },

  // Poker Vibrators
  'A-ZPD01': { name: 'POKER DIASTAR KS20', type: 'Poker Vibrator', fuelType: 'Petrol', category: 'concrete' },

  // More Water Pumps
  'A-ZPF01': { name: 'WATER PUMP 6" FORD', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPF02': { name: 'WATER PUMP VARIABLE FIAT', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPF03': { name: 'WATER PUMP 3 INCH PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPF04': { name: 'WATER PUMP 4" FIAT', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },

  // Honda Water Pumps
  'A-ZPH35': { name: 'WATER PUMP 3" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH45': { name: 'WATER PUMP 4" HOFFMANN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH47': { name: 'WATER PUMP 4" HOFFMANN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH52': { name: 'WATER PUMP 3 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH61': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH74': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH75': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH76': { name: 'WATER PUMP 3 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH77': { name: 'WATER PUMP 2 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH81': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH82': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH83': { name: 'WATER PUMP 4" HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH86': { name: 'WATER PUMP 2 INCH HONDA', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH87': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH88': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH89': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPH90': { name: 'WATER PUMP 4 INCH HOFFMAN', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },

  // Other Pumps
  'A-ZPK63': { name: 'WATER PUMP 4" Electrical', type: 'Water Pump', fuelType: 'Electric', category: 'pumping' },
  'A-ZPL28': { name: 'WATER PUMP 3" LAUNTOP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZPL3': { name: 'WATER PUMP DRIVE UNIT LISTER DIESEL', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPL62': { name: 'WATER PUMP 3 INCH LAUNTOP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },

  // Perkins Pumps
  'A-ZPP01': { name: 'WATER PUMP 3" PETTER', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPP03': { name: 'WATER PUMP 3" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPP04': { name: 'WATER PUMP 3" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPP59': { name: 'WATER PUMP 6" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },

  // Robin and Other Pumps
  'A-ZPR60': { name: 'WATER PUMP 4" ROBIN SLUDGE', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },

  // Pressure Washers
  'A-ZPWH06': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
  'A-ZPWH07': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
  'A-ZPWH08': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
  'A-ZPWH74': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },

  // Yanmar Pumps
  'A-ZPY53': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPY84': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
  'A-ZPY85': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },

  // Walk-behind Rollers
  'A-ZRB21': { name: 'WALK-BEHIND ROLL BOMAG BW65', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
  'A-ZRB23': { name: 'WALK-BEHIND ROLL BOMAG BW65', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
  'A-ZRB25': { name: 'WALK-BEHIND ROLL BOMAG BW65H', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
  'A-ZRB38': { name: 'WALK-BEHIND ROLL BOMAG BW65H', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
  'A-ZRB39': { name: 'WALK-BEHIND ROLL BOMAG BW61', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
  'A-ZRB40': { name: 'WALK-BEHIND ROLL BOMAG BW61', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },

  // Rammers
  'A-ZRH52': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRH53': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRM43': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRM44': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRM45': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRM46': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRM47': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },

  // Paint Stripper
  'A-ZRS01': { name: 'PAINT STRIPPER', type: 'Paint Stripper', fuelType: 'Petrol', category: 'surface_prep' },

  // Wacker Plates
  'A-ZRW31': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW33': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW36': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW54': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW55': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW56': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW57': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW58': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW59': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW60': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW61': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW62': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRW63': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },

  // Yamaha Rammers
  'A-ZRY38': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRY48': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRY49': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },

  // Hoffmann Rammers
  'A-ZRH50': { name: 'RAMMER HOFFMANN', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
  'A-ZRH51': { name: 'RAMMER HOFFMANN', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },

  // Submersible Pump
  'A-ZSF01': { name: 'SUBMERSIBLE PUMP', type: 'Submersible Pump', fuelType: 'Electric', category: 'pumping' },

  // Hompie Pompies (assuming these are small pumps)
  'A-ZTS05': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS06': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS07': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS08': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS09': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS10': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS12': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS13': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS14': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS15': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS16': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS17': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS18': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS19': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS20': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS21': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },
  'A-ZTS22': { name: 'HOMPIE POMPIE', type: 'Small Pump', fuelType: 'Petrol', category: 'pumping' },

  // Drive Units
  'A-ZVB05': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVB10': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVB15': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVB16': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVB19': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVB21': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVB36': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

  // Other Drive Units
  'A-ZVD12': { name: 'DRIVE UNIT DEK', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

  // Honda Drive Units
  'A-ZVH23': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVH27': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVH32': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVH38': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVH39': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

  // Robin Drive Units
  'A-ZVR22': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVR31': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVR33': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVR43': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
  'A-ZVR44': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

  // Yanmar Drive Units
  'A-ZVY40': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
  'A-ZVY41': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
  'A-ZVY42': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
  'A-ZVY62': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },

  // Wacker Drive Unit
  'A-ZVW35': { name: 'DRIVE UNIT WACKER', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },

  // Welder Generators
  'A-ZWH21': { name: 'GENSET WELDER HONDA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
  'A-ZWH56': { name: 'GENSET WELDER HONDA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },

  // Honda Wacker Plates
  'A-ZWH24': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZWH25': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZWH32': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZWH42': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZWH43': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZWH44': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZWH45': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },
  'A-ZWH46': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibrating Plate', fuelType: 'Petrol', category: 'compaction' },

  // Yamaha Welder
  'A-ZWY01': { name: 'GENSET WELDER YAMAHA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
  };
  // Set QR data when plantNumber or mode changes
  useEffect(() => {
    if (plantNumber) {
      const currentPlant = plantInfo[plantNumber] || { 
        name: plantNumber, 
        type: 'Equipment', 
        fuelType: 'Diesel', 
        category: 'general'
      };

      if (qrMode === 'simple') {
        // SIMPLE MODE: Only plant number
        setQrData(plantNumber);
      } else {
        // ENHANCED MODE: Full equipment data as JSON
        const enhancedData = {
          plantNumber: plantNumber,
          plantName: currentPlant.name,
          plantType: currentPlant.type,
          fuelType: currentPlant.fuelType,
          category: currentPlant.category,
          timestamp: new Date().toISOString(),
          generatedBy: 'Fuel Management System'
        };
        setQrData(JSON.stringify(enhancedData));
      }
    }
  }, [plantNumber, qrMode]);

  const currentPlant = plantInfo[plantNumber] || { 
    name: plantNumber, 
    type: 'Equipment', 
    fuelType: 'Diesel', 
    category: 'general'
  };

  // Test function to see QR content
  const testQRContent = () => {
    if (qrData) {
      console.log('QR Code Content:', qrData);
      
      if (qrMode === 'simple') {
        alert(`QR Content (Simple Mode):\n\n${qrData}`);
      } else {
        try {
          const parsedData = JSON.parse(qrData);
          alert(`QR Content (Enhanced Mode):\n\n${JSON.stringify(parsedData, null, 2)}`);
        } catch (e) {
          alert(`QR Content:\n\n${qrData}`);
        }
      }
    }
  };

  const downloadQRCode = () => {
    // Create a canvas to combine QR code and equipment info
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 600;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#1b5e20';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EQUIPMENT QR CODE', width / 2, 40);

    // Company/System info
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText('Fuel Management System', width / 2, 65);

    // QR Code Mode Badge
    ctx.fillStyle = qrMode === 'simple' ? '#1976d2' : '#ff9800';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`MODE: ${qrMode.toUpperCase()}`, width / 2, 85);

    // QR Code (we'll draw the SVG onto canvas)
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Draw QR code
      ctx.drawImage(img, width / 2 - 100, 110, 200, 200);

      // QR Code Content Box
      ctx.fillStyle = '#f0f7ff';
      ctx.fillRect(50, 330, width - 100, qrMode === 'simple' ? 60 : 120);
      ctx.strokeStyle = '#bbdefb';
      ctx.lineWidth = 1;
      ctx.strokeRect(50, 330, width - 100, qrMode === 'simple' ? 60 : 120);

      // QR Code Content
      ctx.fillStyle = '#1976d2';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE CONTENT', width / 2, 350);
      
      if (qrMode === 'simple') {
        ctx.fillStyle = '#333';
        ctx.font = '18px monospace';
        ctx.fillText(plantNumber, width / 2, 375);
      } else {
        ctx.fillStyle = '#333';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        
        const contentLines = [
          `Plant Number: ${plantNumber}`,
          `Description: ${currentPlant.name}`,
          `Type: ${currentPlant.type}`,
          `Fuel Type: ${currentPlant.fuelType}`,
          `Category: ${currentPlant.category}`
        ];
        
        contentLines.forEach((line, index) => {
          ctx.fillText(line, 80, 375 + (index * 20));
        });
      }

      // Equipment Information Box
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(50, qrMode === 'simple' ? 410 : 470, width - 100, 280);
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, qrMode === 'simple' ? 410 : 470, width - 100, 280);

      // Equipment Information Title
      ctx.fillStyle = '#1b5e20';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EQUIPMENT INFORMATION', width / 2, qrMode === 'simple' ? 445 : 505);

      // Equipment Details
      ctx.fillStyle = '#333';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      
      const details = [
        `Fleet Number: ${plantNumber}`,
        `Description: ${currentPlant.name}`,
        `Type: ${currentPlant.type}`,
        `Fuel Type: ${currentPlant.fuelType}`,
        `Category: ${currentPlant.category}`,
        `QR Mode: ${qrMode.toUpperCase()}`,
        `Generated: ${new Date().toLocaleDateString()}`,
        `Time: ${new Date().toLocaleTimeString()}`
      ];

      details.forEach((detail, index) => {
        ctx.fillText(detail, 80, qrMode === 'simple' ? 490 + (index * 30) : 550 + (index * 30));
      });

      // Footer
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Scan QR code with mobile app to automatically fill equipment details', width / 2, height - 30);

      // Convert to image and download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `equipment-${plantNumber}-${qrMode}-qrcode.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ color: '#1b5e20', marginBottom: '20px' }}>
          QR Code - {plantNumber}
        </h2>
        
        {/* QR Mode Selector */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setQrMode('simple')}
            style={{
              padding: '8px 16px',
              backgroundColor: qrMode === 'simple' ? '#1976d2' : '#f5f5f5',
              color: qrMode === 'simple' ? 'white' : '#333',
              border: '2px solid #1976d2',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: qrMode === 'simple' ? 'bold' : 'normal'
            }}
          >
            Simple Mode
          </button>
          <button
            onClick={() => setQrMode('enhanced')}
            style={{
              padding: '8px 16px',
              backgroundColor: qrMode === 'enhanced' ? '#ff9800' : '#f5f5f5',
              color: qrMode === 'enhanced' ? 'white' : '#333',
              border: '2px solid #ff9800',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: qrMode === 'enhanced' ? 'bold' : 'normal'
            }}
          >
            Enhanced Mode
          </button>
        </div>

        {/* QR Code */}
        <div style={{ 
          display: 'inline-block', 
          padding: '20px', 
          backgroundColor: 'white',
          borderRadius: '12px',
          border: `2px solid ${qrMode === 'simple' ? '#1976d2' : '#ff9800'}`,
          marginBottom: '20px',
          position: 'relative'
        }}>
          {/* Mode Badge */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: qrMode === 'simple' ? '#1976d2' : '#ff9800',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {qrMode.toUpperCase()} MODE
          </div>
          
          <QRCodeSVG
            id="qr-code-svg"
            value={qrData || plantNumber} 
            size={200}
            level="H"
            includeMargin={true}
            fgColor={qrMode === 'simple' ? '#1976d2' : '#1b5e20'}
            bgColor="#ffffff"
          />
        </div>

        {/* QR Code Content Display */}
        <div style={{
          backgroundColor: qrMode === 'simple' ? '#f0f7ff' : '#fff3e0',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `2px solid ${qrMode === 'simple' ? '#bbdefb' : '#ffcc80'}`
        }}>
          <h4 style={{ 
            color: qrMode === 'simple' ? '#1976d2' : '#e65100', 
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {qrMode === 'simple' ? '🔵 Simple Mode' : '🟠 Enhanced Mode'}
          </h4>
          
          <div style={{
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px',
            fontSize: qrMode === 'simple' ? '24px' : '14px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: qrMode === 'simple' ? '#1976d2' : '#e65100',
            border: '1px solid #ddd',
            textAlign: qrMode === 'simple' ? 'center' : 'left',
            minHeight: qrMode === 'simple' ? 'auto' : '80px',
            overflow: 'auto'
          }}>
            {qrMode === 'simple' ? (
              plantNumber
            ) : (
              <div>
                <div><strong>Plant Number:</strong> {plantNumber}</div>
                <div><strong>Description:</strong> {currentPlant.name}</div>
                <div><strong>Type:</strong> {currentPlant.type}</div>
                <div><strong>Fuel Type:</strong> {currentPlant.fuelType}</div>
                <div><strong>Category:</strong> {currentPlant.category}</div>
              </div>
            )}
          </div>
          
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
            {qrMode === 'simple' 
              ? 'This QR code contains only the fleet number for quick scanning' 
              : 'This QR code contains full equipment details for automatic form filling'
            }
          </p>
        </div>

        {/* Equipment Information - For Display Only */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ color: '#1b5e20', marginBottom: '10px' }}>Equipment Information</h4>
          <div style={{ textAlign: 'left' }}>
            <div style={{ margin: '8px 0' }}><strong>Fleet Number:</strong> {plantNumber}</div>
            <div style={{ margin: '8px 0' }}><strong>Description:</strong> {currentPlant.name}</div>
            <div style={{ margin: '8px 0' }}><strong>Type:</strong> {currentPlant.type}</div>
            <div style={{ margin: '8px 0' }}><strong>Fuel Type:</strong> {currentPlant.fuelType}</div>
            <div style={{ margin: '8px 0' }}><strong>Category:</strong> {currentPlant.category}</div>
            <div style={{ margin: '8px 0' }}><strong>QR Mode:</strong> <span style={{ 
              color: qrMode === 'simple' ? '#1976d2' : '#ff9800',
              fontWeight: 'bold'
            }}>{qrMode.toUpperCase()}</span></div>
          </div>
        </div>

        {/* QR Content Preview */}
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #c8e6c9'
        }}>
          <h5 style={{ color: '#1b5e20', marginBottom: '10px' }}>Raw QR Content Preview</h5>
          <div style={{
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            textAlign: 'left',
            maxHeight: '120px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {qrData ? qrData : 'No QR data generated yet'}
          </div>
          <button
            onClick={testQRContent}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Test QR Content
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={downloadQRCode}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1b5e20',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Download QR Code
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
          <p><strong>Simple Mode:</strong> QR contains only fleet number (faster scanning)</p>
          <p><strong>Enhanced Mode:</strong> QR contains full equipment details (automatic form filling)</p>
          <p>Your scanning system supports both formats!</p>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;