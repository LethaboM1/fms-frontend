import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { plantMasterList } from './plantMasterList';

// ==================== QR CODE GENERATOR COMPONENTS ====================

const PlantQRGenerator = ({ user, onClose }) => {
   // Plant master list
//  const plantMasterList = {
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
//     'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
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
//     'A-BTH116': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH118': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH119': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH122': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH123': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH125': { name: '1.0 TONNE BAKKIE 4X2 DC', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH127': { name: '1.0 TONNE BAKKIE 4X2 HI RISE', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH129': { name: '1.0 TONNE BAKKIE 4X2 HI RISE', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH130': { name: '1.0 TONNE BAKKIE 4X2 HI RISE', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH131': { name: '1.0 TONNE BAKKIE 4X2 HI RISE', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH134': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH135': { name: '1.0 TONNE BAKKIE 4X2 DC', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH80': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH81': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH91': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH92': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH94': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH95': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH96': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH97': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTH99': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
//     'A-BTL08': { name: 'TOYOTA LANDCRUISER', type: 'SUV', fuelType: 'Petrol', category: 'light_vehicle' },
//     'A-CFH04': { name: 'CRUSHER FIXED HATFIELD', type: 'Crusher', fuelType: 'Diesel', category: 'crushing' },
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
//     'A-DUT07': { name: 'DUMPER B2000', type: 'Dumper', fuelType: 'Diesel', category: 'hauling' },
//     'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH28': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH35': { name: 'FLAT DECK HINO 5t DOUBLE CAB', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDH36': { name: 'FLAT DECK HINO 5t DOUBLE CAB', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FDM31': { name: 'FLATBED MAN 26-280 15t CRANE 6t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FLM03': { name: 'MAHAND 3.5TON FORKLIFT', type: 'Forklift', fuelType: 'Diesel', category: 'material_handling' },
//     'A-FLT02': { name: '2.5T FORK LIFT TOYOTA', type: 'Forklift', fuelType: 'Diesel', category: 'material_handling' },
//     'A-FSH01': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FSH02': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FSH03': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FSH04': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
//     'A-FSN05': { name: 'FLAT DECK NISSAN FUEL TANKER 10000L', type: 'Fuel Tanker', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-FSI06': { name: 'FLAT DECK ISUZU FUEL TANKER 4000L', type: 'Fuel Tanker', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-GRC27': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC28': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC30': { name: 'GRADER CAT 140K with Trimble', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC32': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC33': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRK34': { name: 'GRADER KOMATSU GD675-5', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-GRC35': { name: 'GRADER CAT 140K', type: 'Grader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-HOB11': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-HOB12': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-HOB13': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-HOB14': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-HOB15': { name: 'HORSE + 26t TIP TRAILER', type: 'Truck & Trailer', fuelType: 'Diesel', category: 'hauling' },
//     'A-LLP02': { name: 'POWER PLANT LISTER 55kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-LOC16': { name: 'LOADER CAT 950GC    3,1m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-LOK18': { name: 'LOADER KOMATSU WA250-6    2,3m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-LOK19': { name: 'LOADER KOMATSU WA250-6    2,3m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-LOK20': { name: 'LOADER KOMATSU WA380-6    3m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-LOK21': { name: 'LOADER KOMATSU WA250-6    2,3m³ bucket', type: 'Loader', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-MCL01': { name: 'MOBILE CRANE 35t LIEBHERR', type: 'Crane', fuelType: 'Diesel', category: 'lifting' },
//     'A-MIB11': { name: 'MIXER BARFORD 330R DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIB14': { name: 'MIXER BRIGGS AND STRATTON 175', type: 'Mixer', fuelType: 'Petrol', category: 'concrete' },
//     'A-MIL01': { name: 'MIXER LISTER 175 DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIL17': { name: 'MIXER LISTER 500R', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIL18': { name: 'MIXER LISTER 500R', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIW03': { name: 'MIXER WINGET 175 DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIW05': { name: 'MIXER WINGET 175TE DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIW12': { name: 'MIXER WINGET 330T DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MIW13': { name: 'MIXER WINGET 330T DIESEL', type: 'Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-MPW03': { name: 'ASPHALT MILL WIRTGEN W100F', type: 'Milling Machine', fuelType: 'Diesel', category: 'paving' },
//     'A-MPW04': { name: 'ASPHALT MILL WIRTGEN W200', type: 'Milling Machine', fuelType: 'Diesel', category: 'paving' },
//     'A-MRB07': { name: 'RECYCLER Bell MPH125', type: 'Recycler', fuelType: 'Diesel', category: 'paving' },
//     'A-MRW04': { name: 'RECYCLER WIRTGEN WR2000', type: 'Recycler', fuelType: 'Diesel', category: 'paving' },
//     'A-MRW05': { name: 'RECYCLER WIRTGEN WR240', type: 'Recycler', fuelType: 'Diesel', category: 'paving' },
//     'A-MRW06': { name: 'RECYCLER WIRTGEN WR240', type: 'Recycler', fuelType: 'Diesel', category: 'paving' },
//     'A-MTM03': { name: 'MAN CONCRETE MIXER 6x4 - 6m3', type: 'Concrete Mixer Truck', fuelType: 'Diesel', category: 'concrete' },
//     'A-MTS04': { name: 'SCANIA CONCRETE MIXER 6x4 - 6m3', type: 'Concrete Mixer Truck', fuelType: 'Diesel', category: 'concrete' },
//     'A-MTB06': { name: 'M/B REIMER CONCRETE MIXER 8x4 - 8m3', type: 'Concrete Mixer Truck', fuelType: 'Diesel', category: 'concrete' },
//     'A-MTB06-1': { name: 'REIMER CONCRETE MIXER DONKEY ENGINE', type: 'Concrete Mixer', fuelType: 'Diesel', category: 'concrete' },
//     'A-RPA16': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPA17': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPA18': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPA21': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPA22': { name: 'PNEUMATIC AMMANN 24t AP240', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPC19': { name: 'PNEUMATIC CAT CW34', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPC20': { name: 'PNEUMATIC CAT CW34', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD10': { name: 'PNEUMATIC DYNAPAC 20t CP221', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD11': { name: 'PNEUMATIC DYNAPAC 20t CP221', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD12': { name: 'PNEUMATIC DYNAPAC 27t CP271', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD14': { name: 'PNEUMATIC DYNAPAC 27t CP271', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPD15': { name: 'PNEUMATIC DYNAPAC 24t CP224', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RPH13': { name: 'PNEUMATIC HAMM 20t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RSD05': { name: 'STATIC DYNAPAC 3-Point 12t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RSD06': { name: 'STATIC DYNAPAC 3-Point 12t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RSD07': { name: 'STATIC DYNAPAC 3-Point 12t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTA10': { name: 'VIBRATING TANDEM AMMANN 9t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH11': { name: 'VIBRATING TANDEM HAMM 4t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH13': { name: 'VIBRATING TANDEM HAMM 2,5t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH14': { name: 'VIBRATING TANDEM HAMM 9t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH15': { name: 'VIBRATING TANDEM HAMM 2,7t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RTH16': { name: 'VIBRATING TANDEM HAMM 2,7t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA25': { name: 'VIBRATING AMMANN ASC 100 10t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA26': { name: 'VIBRATING AMMANN ACE PRO ASC 110 12t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA28': { name: 'VIBRATING AMMANN ASC 170 17t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA30': { name: 'VIBRATING AMMANN ASC 200 19t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA31': { name: 'VIBRATING AMMANN ASC 200 19t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA33': { name: 'VIBRATING AMMANN ACE 100 10t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVA34': { name: 'VIBRATING AMMANN ACE 100 10t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVD19': { name: 'VIBRATING DYNAPAC CA512-D 17t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVD22': { name: 'VIBRATING DYNAPAC CA602 19t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVH29': { name: 'VIBRATING HAMM 3510 10t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-RVH32': { name: 'VIBRATING HAMM 3520 20t', type: 'Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-SLTD08': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS(WATER)', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD09': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD10': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD11': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD12': { name: 'GRW 29KL DRAWBAR TRAILERS', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLTD13': { name: 'TANKER CLINIC 32KL DRAWBAR TRAILERS(WATER)', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW01': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW03': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW04': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW05': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW06': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW08': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SLW09': { name: 'WATER TRAILER', type: 'Water Trailer', fuelType: 'Water', category: 'water_trailer' },
//     'A-SMB11': { name: 'SLURRY MIXER BENZ 3340', type: 'Slurry Mixer', fuelType: 'Diesel', category: 'paving' },
//     'A-SMB11-1': { name: 'SLURRY MIXER BENZ 3340 DONKEY ENGINE', type: 'Slurry Mixer', fuelType: 'Diesel', category: 'paving' },
//     'A-SMR12': { name: 'MOBILE RADIO TRAILERS', type: 'Radio Trailer', fuelType: 'None', category: 'support' },
//     'A-SPW01': { name: 'PRESSURE WASHER TRAILER', type: 'Pressure Washer', fuelType: 'Diesel', category: 'cleaning' },
//     'A-SPW02': { name: 'PRESSURE WASHER TRAILER', type: 'Pressure Washer', fuelType: 'Diesel', category: 'cleaning' },
//     'A-SPW03': { name: 'PRESSURE WASHER TRAILER', type: 'Pressure Washer', fuelType: 'Diesel', category: 'cleaning' },
//     'A-SPW04': { name: 'PRESSURE WASHER TRAILER', type: 'Pressure Washer', fuelType: 'Diesel', category: 'cleaning' },
//     'A-SSP03': { name: 'SEMI TRAILER MOBILE WORKSHOP', type: 'Mobile Workshop', fuelType: 'None', category: 'support' },
//     'A-STH14': { name: 'HINO SERVICE TRUCKS', type: 'Service Truck', fuelType: 'Diesel', category: 'support' },
//     'A-STL23': { name: 'GENERATOR TRAILER', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'A-STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'A-STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
//     'A-STT10': { name: 'HINO SERVICE TRUCKS', type: 'Service Truck', fuelType: 'Diesel', category: 'support' },
//     'A-TAD01': { name: 'DOOSAN DA30 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAD02': { name: 'DOOSAN DA30 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAD03': { name: 'DOOSAN DA30 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC04': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC05': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC06': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
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
//     'A-THS07': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS08': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-THS09': { name: 'SCANIA 8x4 15m3 Tipper & Trailer', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIB69': { name: 'BENZ 33-35 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIB70': { name: 'BENZ 33-35 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS47': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS48': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS49': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS50': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS51': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS52': { name: 'SCANIA P410 17M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS68': { name: 'SCANIA P360 12M3 TIPPER 6X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS71': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS72': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TIS74': { name: 'SCANIA G460 20M3 TIPPER 8X4', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TLJ29': { name: 'TLB JCB 3CX 4X4 6.4t', type: 'TLB', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-TLJ31': { name: 'TLB JCB 3CX 4X4 6.4t', type: 'TLB', fuelType: 'Diesel', category: 'earthmoving' },
//     'A-TLM01': { name: 'MANITOU MT932', type: 'Telehandler', fuelType: 'Diesel', category: 'material_handling' },
//     'A-TSF31': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSF32': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSF33': { name: 'FUSO 4X2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSV45': { name: 'VW 17-250 4x2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-TSV46': { name: 'VW 17-250 4x2 6M3 TIPPER', type: 'Tipper Truck', fuelType: 'Diesel', category: 'hauling' },
//     'A-WTB36': { name: 'WATER TANKER MERC 2628', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM21': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM23': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM27': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM30': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM32': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM33': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM34': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM35': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTM38': { name: 'WATER TANKER 16KL  MAN CLA 26,280', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-WTS37': { name: 'WATER TANKER 30KL  SCANIA P410 8X4', type: 'Water Tanker', fuelType: 'Water', category: 'water_trailer' },
//     'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
//     'A-ZBP01': { name: 'BITUMEN PUMP', type: 'Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP02': { name: 'BITUMEN PUMP 2"', type: 'Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP03': { name: 'BITUMEN PUMP 2"', type: 'Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZBP05': { name: 'BITUMEN PUMP 2"', type: 'Pump', fuelType: 'Diesel', category: 'paving' },
//     'A-ZCFD01': { name: 'CARRIER FRAME DIESEL TANK 5000L', type: 'Fuel Tank', fuelType: 'Diesel', category: 'fuel_trailer' },
//     'A-ZCH07': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCH08': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCH09': { name: 'CONCRETE SAW HONDA GX240', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCJ01': { name: 'CONVEYOR TRAILER', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },
//     'A-ZCJ02': { name: 'CONVEYOR TRAILER', type: 'Conveyor', fuelType: 'Diesel', category: 'material_handling' },
//     'A-ZCT03': { name: 'CONVEYOR BELT', type: 'Conveyor', fuelType: 'Electric', category: 'material_handling' },
//     'A-ZCT04': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCT05': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCT06': { name: 'CONCRETE SAW TURNER MORRIS', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZCV07': { name: 'CONCRETE SAW HONDA', type: 'Concrete Saw', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFF01': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
//     'A-ZFF02': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
//     'A-ZFF03': { name: 'FIRE FIGHTING UNIT', type: 'Fire Fighting Unit', fuelType: 'Diesel', category: 'safety' },
//     'A-ZFH01': { name: 'FLOOR GRINDER', type: 'Floor Grinder', fuelType: 'Electric', category: 'concrete' },
//     'A-ZFH02': { name: 'FLOOR GRINDER', type: 'Floor Grinder', fuelType: 'Electric', category: 'concrete' },
//     'A-ZFR01': { name: 'POWER FLOAT', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR02': { name: 'POWER FLOAT BRIGGS & STRATTON', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR03': { name: 'POWER FLOAT ROBIN', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZFR04': { name: 'POWER FLOAT ROBIN', type: 'Power Float', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZGB10': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB12': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB14': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB15': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB25': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB28': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB30': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGB64': { name: 'GENSET 220V B & STRATTON', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGC17': { name: 'GENSET 100kVA CATERPILLAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD57': { name: 'GENSET DUETZ 100kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD59': { name: 'GENSET DUETZ 30kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGD60': { name: 'GENSET DUETZ 30kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGE41': { name: 'GENSET ELEGEN', type: 'Generator', fuelType: 'Diesel', category: 'power' },
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
//     'A-ZGK01': { name: 'GENERATOR 8KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGP47': { name: 'GEN KING 60kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGR04': { name: 'GENSET ROBIN CORE DRILL', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR05': { name: 'GENSET ROBIN CORE DRILL', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR59': { name: 'GENSET ROBIN', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR60': { name: 'GENSET ROBIN', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGR61': { name: 'GENERATOR 8KVA 3 PHASE', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS49': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS50': { name: 'GENSET SKY-GO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS52': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS53': { name: 'GENSET 500kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGS58': { name: 'GENSET 400kVA SCANIA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGU33': { name: 'GENERATOR UNIPOWER 5500-52 5.5', type: 'Generator', fuelType: 'Petrol', category: 'power' },
//     'A-ZGV06': { name: 'GENSET VOLVO 60kVA', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGV15': { name: 'GENSET 200kVA VOLVO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGV32': { name: 'GENSET 400kVA VOLVO', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGY23': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGY64': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZGY65': { name: 'GENERATOR YANMAR', type: 'Generator', fuelType: 'Diesel', category: 'power' },
//     'A-ZHBS01': { name: 'HAND HELD BROOM STIHL', type: 'Broom', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZHBS02': { name: 'HAND HELD BROOM STIHL', type: 'Broom', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZJB07': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZJB09': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZJB10': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZJB11': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZJH12': { name: 'CONCRETE BREAKER', type: 'Concrete Breaker', fuelType: 'Electric', category: 'demolition' },
//     'A-ZLC01': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'lab' },
//     'A-ZLC02': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'lab' },
//     'A-ZLC03': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'lab' },
//     'A-ZLC04': { name: 'LAB CENTRIFUGE', type: 'Lab Equipment', fuelType: 'Electric', category: 'lab' },
//     'A-ZLH01': { name: 'TOWER LIGHT HONDA HOME BUILT', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLG02': { name: 'TOWER LIGHT GENERAC VTEVO', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLG03': { name: 'TOWER LIGHT GENERAC VTEVO', type: 'Tower Light', fuelType: 'Petrol', category: 'lighting' },
//     'A-ZLY04': { name: 'TOWER LIGHT YANMAR HOME BUILD', type: 'Tower Light', fuelType: 'Diesel', category: 'lighting' },
//     'A-ZLY05': { name: 'TOWER LIGHT YANMAR HOME BUILD', type: 'Tower Light', fuelType: 'Diesel', category: 'lighting' },
//     'A-ZPB40': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB43': { name: 'WATER PUMP 4" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB49': { name: 'WATER PUMP 2" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB51': { name: 'WATER PUMP 2" B & STRATTON', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB72': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB73': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPB80': { name: '3INCH BRIGGS & STRATTON PUMP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPCB01': { name: 'PLATE COMPACTOR', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH02': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH03': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH04': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPCH05': { name: 'PLATE COMPACTOR HOFFMANN', type: 'Plate Compactor', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZPD01': { name: 'POKER DIASTAR KS20', type: 'Poker Vibrator', fuelType: 'Petrol', category: 'concrete' },
//     'A-ZPF01': { name: 'WATER PUMP 6" FORD', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF02': { name: 'WATER PUMP VARIABLE FIAT', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF03': { name: 'WATER PUMP 3 INCH PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPF04': { name: 'WATER PUMP 4" FIAT', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
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
//     'A-ZPK63': { name: 'WATER PUMP 4" Electrical', type: 'Water Pump', fuelType: 'Electric', category: 'pumping' },
//     'A-ZPL28': { name: 'WATER PUMP 3" LAUNTOP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPL3': { name: 'WATER PUMP DRIVE UNIT LISTER DIESEL', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPL62': { name: 'WATER PUMP 3 INCH LAUNTOP', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPP01': { name: 'WATER PUMP 3" PETTER', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP03': { name: 'WATER PUMP 3" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP04': { name: 'WATER PUMP 3" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPP59': { name: 'WATER PUMP 6" PERKINS', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPR60': { name: 'WATER PUMP 4" ROBIN SLUDGE', type: 'Water Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZPWH06': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH07': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH08': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPWH74': { name: 'PRESSURE WASHER', type: 'Pressure Washer', fuelType: 'Petrol', category: 'cleaning' },
//     'A-ZPY53': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPY84': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZPY85': { name: 'WATER PUMP 3" YANMAR', type: 'Water Pump', fuelType: 'Diesel', category: 'pumping' },
//     'A-ZRB21': { name: 'WALK-BEHIND ROLL BOMAG BW65', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB23': { name: 'WALK-BEHIND ROLL BOMAG BW65', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB25': { name: 'WALK-BEHIND ROLL BOMAG BW65H', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB38': { name: 'WALK-BEHIND ROLL BOMAG BW65H', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB39': { name: 'WALK-BEHIND ROLL BOMAG BW61', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRB40': { name: 'WALK-BEHIND ROLL BOMAG BW61', type: 'Walk-Behind Roller', fuelType: 'Diesel', category: 'compaction' },
//     'A-ZRH52': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRH53': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM43': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM44': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM45': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM46': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRM47': { name: 'RAMMER', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRS01': { name: 'PAINT STRIPPER', type: 'Paint Stripper', fuelType: 'Electric', category: 'maintenance' },
//     'A-ZRW31': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW33': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW36': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW54': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW55': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW56': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW57': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW58': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW59': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW60': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW61': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW62': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRW63': { name: 'WACKER-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRY38': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRY48': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRY49': { name: 'RAMMER YAMAHA', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRH50': { name: 'RAMMER HOFFMANN', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZRH51': { name: 'RAMMER HOFFMANN', type: 'Rammer', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZSF01': { name: 'SUBMERSIBLE PUMP', type: 'Submersible Pump', fuelType: 'Electric', category: 'pumping' },
//     'A-ZTS05': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS06': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS07': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS08': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS09': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS10': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS12': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS13': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS14': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS15': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS16': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS17': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS18': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS19': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS20': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS21': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZTS22': { name: 'HOMPIE POMPIE', type: 'Pump', fuelType: 'Petrol', category: 'pumping' },
//     'A-ZVB05': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB10': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB15': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB16': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB19': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB21': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVB36': { name: 'DRIVE UNIT BRIGGS & STRATTON', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVD12': { name: 'DRIVE UNIT DEK', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH23': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH27': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH32': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH38': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVH39': { name: 'DRIVE UNIT HONDA', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR22': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR31': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR33': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR43': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVR44': { name: 'DRIVE UNIT ROBIN', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZVY40': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY41': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY42': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVY62': { name: 'DRIVE UNIT YANMAR', type: 'Drive Unit', fuelType: 'Diesel', category: 'power' },
//     'A-ZVW35': { name: 'DRIVE UNIT WACKER', type: 'Drive Unit', fuelType: 'Petrol', category: 'power' },
//     'A-ZWH21': { name: 'GENSET WELDER HONDA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
//     'A-ZWH24': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH25': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH32': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH42': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH43': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH44': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH45': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH46': { name: 'HONDA-WACKER/ELEPHANT FOOT', type: 'Vibratory Plate', fuelType: 'Petrol', category: 'compaction' },
//     'A-ZWH56': { name: 'GENSET WELDER HONDA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
//     'A-ZWY01': { name: 'GENSET WELDER YAMAHA', type: 'Welder Generator', fuelType: 'Petrol', category: 'welding' },
// };

  const [qrData, setQrData] = useState({
    plantNumber: '',
    plantName: '',
    plantType: '',
    fuelType: 'Diesel',
    category: 'general'
  });
  
  const [generatedQR, setGeneratedQR] = useState(null);
  const [qrHistory, setQrHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [showPlantList, setShowPlantList] = useState(false);

  const plantCategories = [...new Set(Object.values(plantMasterList).map(p => p.category))];
  const fuelTypes = [...new Set(Object.values(plantMasterList).map(p => p.fuelType))];
  const plantTypes = [...new Set(Object.values(plantMasterList).map(p => p.type))];

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('plantQRHistory') || '[]');
    setQrHistory(savedHistory);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = Object.entries(plantMasterList)
        .filter(([plantNumber, plant]) => 
          plantNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plant.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10);
      setFilteredPlants(filtered);
    } else {
      setFilteredPlants([]);
    }
  }, [searchQuery]);

  const handlePlantSelect = (plantNumber, plantData) => {
    setQrData({
      plantNumber: plantNumber,
      plantName: plantData.name,
      plantType: plantData.type,
      fuelType: plantData.fuelType,
      category: plantData.category
    });
    setSearchQuery('');
    setShowPlantList(false);
  };

  const handleGenerateQR = () => {
    if (!qrData.plantNumber.trim()) {
      alert('Please select or enter a plant number');
      return;
    }

    const qrContent = {
      plantNumber: qrData.plantNumber,
      plantName: qrData.plantName,
      plantType: qrData.plantType,
      fuelType: qrData.fuelType,
      category: qrData.category,
      generatedBy: user.fullName,
      generatedDate: new Date().toISOString(),
      type: 'PLANT_QR',
      timestamp: Date.now()
    };

    setGeneratedQR(JSON.stringify(qrContent, null, 2));

    const newHistory = [qrContent, ...qrHistory.slice(0, 49)];
    setQrHistory(newHistory);
    localStorage.setItem('plantQRHistory', JSON.stringify(newHistory));
  };

  const handleDownloadQR = () => {
    if (!generatedQR) return;
    
    const svgElement = document.getElementById('plant-qrcode-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `plant_${qrData.plantNumber}_${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrintQR = () => {
    if (!generatedQR) return;
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Plant QR Code - ${qrData.plantNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .qr-container { text-align: center; margin: 20px 0; }
            .qr-info { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; }
            @media print { 
              button { display: none; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <h2>Plant QR Code</h2>
          <div class="qr-container">
            <svg width="300" height="300" viewBox="0 0 200 200">
              ${document.getElementById('plant-qrcode-svg')?.innerHTML || ''}
            </svg>
          </div>
          <div class="qr-info">
            <p><span class="label">Plant Number:</span> <span class="value">${qrData.plantNumber}</span></p>
            <p><span class="label">Plant Name:</span> <span class="value">${qrData.plantName}</span></p>
            <p><span class="label">Type:</span> <span class="value">${qrData.plantType}</span></p>
            <p><span class="label">Fuel Type:</span> <span class="value">${qrData.fuelType}</span></p>
            <p><span class="label">Category:</span> <span class="value">${qrData.category}</span></p>
            <p><span class="label">Generated By:</span> <span class="value">${user.fullName}</span></p>
            <p><span class="label">Date:</span> <span class="value">${new Date().toLocaleString()}</span></p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const clearForm = () => {
    setQrData({
      plantNumber: '',
      plantName: '',
      plantType: '',
      fuelType: 'Diesel',
      category: 'general'
    });
    setGeneratedQR(null);
    setSearchQuery('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20' }}>
            🏭 Plant QR Code Generator
          </h3>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#333', marginBottom: '15px' }}>Plant Information</h4>
              
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Plant Number *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowPlantList(true);
                      }}
                      onFocus={() => setShowPlantList(true)}
                      placeholder="Search plant number or name..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #1b5e20',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                    {showPlantList && filteredPlants.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 100,
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        {filteredPlants.map(([plantNumber, plant]) => (
                          <div
                            key={plantNumber}
                            onClick={() => handlePlantSelect(plantNumber, plant)}
                            style={{
                              padding: '12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #eee',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <div>
                              <div style={{ fontWeight: '600', color: '#1b5e20' }}>{plantNumber}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>{plant.name}</div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>{plant.type}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {Object.keys(plantMasterList).length} plants available in database
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Plant Name *
                  </label>
                  <input
                    type="text"
                    value={qrData.plantName}
                    onChange={(e) => setQrData({...qrData, plantName: e.target.value})}
                    placeholder="Select from plant list above"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: qrData.plantName ? '#f0f9ff' : 'white'
                    }}
                    readOnly={!!qrData.plantNumber}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Plant Type
                  </label>
                  <select
                    value={qrData.plantType}
                    onChange={(e) => setQrData({...qrData, plantType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: qrData.plantType ? '#f0f9ff' : 'white'
                    }}
                  >
                    <option value="">Select Type</option>
                    {plantTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Fuel Type
                  </label>
                  <select
                    value={qrData.fuelType}
                    onChange={(e) => setQrData({...qrData, fuelType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    {fuelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Category
                  </label>
                  <select
                    value={qrData.category}
                    onChange={(e) => setQrData({...qrData, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    {plantCategories.map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleGenerateQR}
                style={{ 
                  flex: 1,
                  padding: '15px',
                  backgroundColor: '#1b5e20',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Generate QR Code
              </button>
              
              <button 
                onClick={clearForm}
                style={{ 
                  padding: '15px 20px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>QR Code</h4>
            
            {generatedQR ? (
              <div id="plant-qr-print-content" style={{ textAlign: 'center' }}>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <QRCodeSVG
                    id="plant-qrcode-svg"
                    value={generatedQR}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div style={{ 
                  backgroundColor: '#e8f5e8', 
                  padding: '15px', 
                  borderRadius: '6px',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#1b5e20', marginBottom: '8px' }}>
                    Plant Details:
                  </div>
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    <div><strong>Number:</strong> {qrData.plantNumber}</div>
                    <div><strong>Name:</strong> {qrData.plantName}</div>
                    <div><strong>Type:</strong> {qrData.plantType}</div>
                    <div><strong>Fuel:</strong> {qrData.fuelType}</div>
                    <div><strong>Category:</strong> {qrData.category}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleDownloadQR}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    📥 Download SVG
                  </button>
                  
                  <button 
                    onClick={handlePrintQR}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '40px 20px', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏭</div>
                <p>QR code will appear here after generation</p>
                <p style={{ fontSize: '14px', color: '#999' }}>Select plant from database and click "Generate QR Code"</p>
              </div>
            )}
          </div>
        </div>

        {qrHistory.length > 0 && (
          <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>Recent QR Codes ({qrHistory.length})</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {qrHistory.slice(0, 10).map((item, index) => (
                <div 
                  key={item.timestamp} 
                  style={{ 
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{item.plantNumber}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(item.generatedDate).toLocaleDateString()} • {item.plantName?.substring(0, 30) || 'No name'}...
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setQrData({
                        plantNumber: item.plantNumber,
                        plantName: item.plantName || '',
                        plantType: item.plantType || '',
                        fuelType: item.fuelType || 'Diesel',
                        category: item.category || 'general'
                      });
                    }}
                    style={{ 
                      padding: '6px 12px',
                      backgroundColor: '#f5f5f5',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Reuse
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FuelStoreQRGenerator = ({ user, onClose }) => {
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

  const [qrData, setQrData] = useState({
    storeName: '',
    storeCode: '',
    storeType: 'service_truck',
    capacity: '',
    location: '',
    fuelType: 'Diesel',
    status: 'ACTIVE'
  });
  
  const [generatedQR, setGeneratedQR] = useState(null);
  const [qrHistory, setQrHistory] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');

  const storeTypes = [
    { value: 'service_truck', label: 'Service Truck', prefix: 'FSH' },
    { value: 'fuel_trailer', label: 'Fuel Trailer', prefix: 'SLD' },
    { value: 'underground_tank', label: 'Underground Tank', prefix: 'UDT' },
    { value: 'static_tank', label: 'Static Tank', prefix: 'STD' },
    { value: 'petrol_tank', label: 'Petrol Tank', prefix: 'UPT' }
  ];

  const allFuelStores = [
    ...fuelStores.service_trucks.map(store => ({ 
      store, 
      type: 'service_truck', 
      category: 'Service Truck' 
    })),
    ...fuelStores.fuel_trailers.map(store => ({ 
      store, 
      type: 'fuel_trailer', 
      category: 'Fuel Trailer' 
    })),
    ...fuelStores.underground_tanks.map(store => ({ 
      store, 
      type: 'underground_tank', 
      category: 'Underground Tank' 
    }))
  ];

  const fuelTypes = ['Diesel', 'Petrol', 'Bitumen', 'AdBlue', 'Oil', 'Hydraulic', 'Mixed'];

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('fuelStoreQRHistory') || '[]');
    setQrHistory(savedHistory);
  }, []);

  const handleStoreSelect = (store) => {
    const storeItem = allFuelStores.find(s => s.store === store);
    if (!storeItem) return;

    const storeStr = storeItem.store;
    let storeName = '';
    let storeCode = '';
    let capacity = '';
    let location = '';

    if (storeItem.type === 'service_truck') {
      const match = storeStr.match(/(\w+)\s*-\s*(\d+)/);
      if (match) {
        storeCode = match[2];
        storeName = `Service Truck ${match[2]}`;
      }
    } else if (storeItem.type === 'fuel_trailer') {
      const match = storeStr.match(/(\w+)\s+(\d+)\s*\((.*)\)/);
      if (match) {
        storeCode = match[2];
        capacity = match[3];
        storeName = `Fuel Trailer ${match[2]}`;
      }
    } else if (storeItem.type === 'underground_tank') {
      const match = storeStr.match(/(\w+)\s+(\d+)\s*\((.*)\)/);
      if (match) {
        storeCode = match[2];
        storeName = match[3];
        location = match[3].split(' ')[0];
      }
    }

    setQrData({
      storeName: storeName || storeStr,
      storeCode: storeCode,
      storeType: storeItem.type,
      capacity: capacity,
      location: location,
      fuelType: 'Diesel',
      status: 'ACTIVE'
    });
    setSelectedStore(store);
  };

  const handleGenerateQR = () => {
    if (!qrData.storeName.trim() || !qrData.storeCode.trim()) {
      alert('Please select a fuel store from the list');
      return;
    }

    const storeTypeInfo = storeTypes.find(st => st.value === qrData.storeType);
    const fullCode = `${storeTypeInfo?.prefix || ''}${qrData.storeCode.padStart(2, '0')}`;

    const qrContent = {
      storeName: qrData.storeName,
      storeCode: fullCode,
      storeType: qrData.storeType,
      capacity: qrData.capacity,
      location: qrData.location,
      fuelType: qrData.fuelType,
      status: qrData.status,
      generatedBy: user.fullName,
      generatedDate: new Date().toISOString(),
      type: 'FUEL_STORE_QR',
      timestamp: Date.now()
    };

    setGeneratedQR(JSON.stringify(qrContent, null, 2));

    const newHistory = [qrContent, ...qrHistory.slice(0, 49)];
    setQrHistory(newHistory);
    localStorage.setItem('fuelStoreQRHistory', JSON.stringify(newHistory));
  };

  const handleDownloadQR = () => {
    if (!generatedQR) return;
    
    const svgElement = document.getElementById('fuelstore-qrcode-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      const storeTypeInfo = storeTypes.find(st => st.value === qrData.storeType);
      const fullCode = `${storeTypeInfo?.prefix || ''}${qrData.storeCode.padStart(2, '0')}`;
      downloadLink.download = `fuelstore_${fullCode}_${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrintQR = () => {
    if (!generatedQR) return;
    
    const printWindow = window.open('', '_blank');
    const storeTypeInfo = storeTypes.find(st => st.value === qrData.storeType);
    const fullCode = `${storeTypeInfo?.prefix || ''}${qrData.storeCode.padStart(2, '0')}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Fuel Store QR Code - ${fullCode}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .qr-container { text-align: center; margin: 20px 0; }
            .qr-info { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .label { font-weight: bold; color: #333; }
            .value { color: '#666; }
            @media print { 
              button { display: none; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <h2>Fuel Store QR Code</h2>
          <div class="qr-container">
            <svg width="300" height="300" viewBox="0 0 200 200">
              ${document.getElementById('fuelstore-qrcode-svg')?.innerHTML || ''}
            </svg>
          </div>
          <div class="qr-info">
            <p><span class="label">Store Code:</span> <span class="value">${fullCode}</span></p>
            <p><span class="label">Store Name:</span> <span class="value">${qrData.storeName}</span></p>
            <p><span class="label">Type:</span> <span class="value">${storeTypeInfo?.label || qrData.storeType}</span></p>
            <p><span class="label">Capacity:</span> <span class="value">${qrData.capacity || 'N/A'}</span></p>
            <p><span class="label">Location:</span> <span class="value">${qrData.location || 'N/A'}</span></p>
            <p><span class="label">Fuel Type:</span> <span class="value">${qrData.fuelType}</span></p>
            <p><span class="label">Status:</span> <span class="value">${qrData.status}</span></p>
            <p><span class="label">Generated By:</span> <span class="value">${user.fullName}</span></p>
            <p><span class="label">Date:</span> <span class="value">${new Date().toLocaleString()}</span></p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const clearForm = () => {
    setQrData({
      storeName: '',
      storeCode: '',
      storeType: 'service_truck',
      capacity: '',
      location: '',
      fuelType: 'Diesel',
      status: 'ACTIVE'
    });
    setGeneratedQR(null);
    setSelectedStore('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ margin: 0, color: '#ff9800' }}>
            ⛽ Fuel Store QR Code Generator
          </h3>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#333', marginBottom: '15px' }}>Fuel Store Information</h4>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Select Fuel Store *
                </label>
                <div style={{ 
                  border: '2px solid #ff9800',
                  borderRadius: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {Object.entries(fuelStores).map(([category, stores]) => (
                    <div key={category}>
                      <div style={{
                        padding: '10px 15px',
                        backgroundColor: '#fff3e0',
                        color: '#ff9800',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {category.replace('_', ' ').toUpperCase()}
                      </div>
                      {stores.map(store => (
                        <div
                          key={store}
                          onClick={() => handleStoreSelect(store)}
                          style={{
                            padding: '12px 15px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            backgroundColor: selectedStore === store ? '#fff3e0' : 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedStore !== store) {
                              e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedStore !== store) {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div style={{ fontWeight: selectedStore === store ? '600' : 'normal' }}>
                            {store}
                          </div>
                          <div style={{ 
                            padding: '4px 8px',
                            backgroundColor: selectedStore === store ? '#ff9800' : '#e0e0e0',
                            color: selectedStore === store ? 'white' : '#666',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Select
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {allFuelStores.length} fuel stores available
                </div>
              </div>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={qrData.storeName}
                    onChange={(e) => setQrData({...qrData, storeName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: '#f8f9fa'
                    }}
                    readOnly
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Store Code
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      value={qrData.storeType}
                      onChange={(e) => setQrData({...qrData, storeType: e.target.value})}
                      style={{
                        width: '40%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    >
                      {storeTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.prefix}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={qrData.storeCode}
                      onChange={(e) => setQrData({...qrData, storeCode: e.target.value})}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Full Code: {storeTypes.find(st => st.value === qrData.storeType)?.prefix || ''}{qrData.storeCode.padStart(2, '0')}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={qrData.capacity}
                    onChange={(e) => setQrData({...qrData, capacity: e.target.value})}
                    placeholder="e.g., 1000L"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Fuel Type
                  </label>
                  <select
                    value={qrData.fuelType}
                    onChange={(e) => setQrData({...qrData, fuelType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    {fuelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Status
                  </label>
                  <select
                    value={qrData.status}
                    onChange={(e) => setQrData({...qrData, status: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                    <option value="RESERVED">RESERVED</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleGenerateQR}
                style={{ 
                  flex: 1,
                  padding: '15px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Generate QR Code
              </button>
              
              <button 
                onClick={clearForm}
                style={{ 
                  padding: '15px 20px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>QR Code</h4>
            
            {generatedQR ? (
              <div id="fuelstore-qr-print-content" style={{ textAlign: 'center' }}>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <QRCodeSVG
                    id="fuelstore-qrcode-svg"
                    value={generatedQR}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div style={{ 
                  backgroundColor: '#fff3e0', 
                  padding: '15px', 
                  borderRadius: '6px',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
                    Fuel Store Details:
                  </div>
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    <div><strong>Code:</strong> {storeTypes.find(st => st.value === qrData.storeType)?.prefix || ''}{qrData.storeCode.padStart(2, '0')}</div>
                    <div><strong>Name:</strong> {qrData.storeName}</div>
                    <div><strong>Type:</strong> {storeTypes.find(st => st.value === qrData.storeType)?.label || qrData.storeType}</div>
                    <div><strong>Capacity:</strong> {qrData.capacity || 'N/A'}</div>
                    <div><strong>Fuel:</strong> {qrData.fuelType}</div>
                    <div><strong>Status:</strong> {qrData.status}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleDownloadQR}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    📥 Download SVG
                  </button>
                  
                  <button 
                    onClick={handlePrintQR}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '40px 20px', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>⛽</div>
                <p>QR code will appear here after generation</p>
                <p style={{ fontSize: '14px', color: '#999' }}>Select fuel store from list and click "Generate QR Code"</p>
              </div>
            )}
          </div>
        </div>

        {qrHistory.length > 0 && (
          <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>Recent QR Codes ({qrHistory.length})</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {qrHistory.slice(0, 10).map((item, index) => (
                <div 
                  key={item.timestamp} 
                  style={{ 
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{item.storeCode}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(item.generatedDate).toLocaleDateString()} • {item.storeName?.substring(0, 25) || 'No name'}...
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const storeTypeInfo = storeTypes.find(st => st.prefix === item.storeCode.substring(0, 3));
                      const codeWithoutPrefix = item.storeCode.replace(storeTypeInfo?.prefix || '', '');
                      
                      setQrData({
                        storeName: item.storeName || '',
                        storeCode: codeWithoutPrefix,
                        storeType: item.storeType || storeTypeInfo?.value || 'service_truck',
                        capacity: item.capacity || '',
                        location: item.location || '',
                        fuelType: item.fuelType || 'Diesel',
                        status: item.status || 'ACTIVE'
                      });
                      setSelectedStore(item.storeCode);
                    }}
                    style={{ 
                      padding: '6px 12px',
                      backgroundColor: '#f5f5f5',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Reuse
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MANAGER DASHBOARD COMPONENT ====================

const ManagerDashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showPlantQRGenerator, setShowPlantQRGenerator] = useState(false);
  const [showFuelStoreQRGenerator, setShowFuelStoreQRGenerator] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);



  // EMPTY driver-duty tracking state - will be populated from your system
  const [dutyAssignments, setDutyAssignments] = useState([]);

  // Pagination state for vehicles
  const [vehicleCurrentPage, setVehicleCurrentPage] = useState(1);
  const [vehicleItemsPerPage, setVehicleItemsPerPage] = useState(10);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState('all');
  
  // Pagination state for drivers
  const [driverCurrentPage, setDriverCurrentPage] = useState(1);
  const [driverItemsPerPage, setDriverItemsPerPage] = useState(5);
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriverStatus, setSelectedDriverStatus] = useState('all');
  const [selectedDriverRole, setSelectedDriverRole] = useState('all');

  // const plantMasterList = {
  //   'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
  //   'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
  //   'A-APD07': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
  //   'A-APD08': { name: 'ASPHALT PAVER DYNAPAC F161-8W', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
  //   'A-APD09': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
  //   'A-APD11': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
  //   'A-APN01': { name: 'ASPHALT PAVER NIGATA', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
  //   'A-APV10': { name: 'ASPHALT PAVER VOGELE 1800 SPRAY JET', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
  //   'A-APP02': { name: 'ASPHALT MIXING PLANT MOBILE 40tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
  //   'A-APP03': { name: 'ASPHALT MIXING PLANT MOBILE 60tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
  //   'A-APP04': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
  //   'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'plant' },
  //   'A-APP06': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
  //   'A-ASR01': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
  //   'A-ASR02': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
  //   'A-BBS03': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
  //   'A-BBS04': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
  //   'A-BDT02': { name: 'BITUMEN TRAILER 1kl', type: 'Bitumen Trailer', fuelType: 'Bitumen', category: 'specialized' },
  //   'A-BDT06': { name: 'CRACKSEALING TRAILER', type: 'Cracksealing Trailer', fuelType: 'Diesel', category: 'specialized' },
  //   'A-BEP01': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
  //   'A-BEP02': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
  //   'A-BNS08': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
  //   'A-BNS09': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
  //   'A-BNS10': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
  //   'A-BOC106': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
  //   'A-BOC107': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
  //   'A-BOC108': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
  //   'A-BRM11': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
  //   'A-BRM12': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
  //   'A-BRM13': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
  //   'A-BRM14': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
  //   'A-BTH100': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
  //   'A-BTH104': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
  //   'A-BTH115': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
  //   'A-CCK05': { name: 'KLEEMANN MOBICONE MCO 9 S EVO CONE', type: 'Cone Crusher', fuelType: 'Diesel', category: 'crushing' },
  //   'A-CHR03': { name: 'RM HORIZONTAL IMPACT CRUSHER 100GO', type: 'Impact Crusher', fuelType: 'Diesel', category: 'crushing' },
  //   'A-CJK06': { name: 'KLEEMANN MOBICAT MC 110 R EVO JAW', type: 'Jaw Crusher', fuelType: 'Diesel', category: 'crushing' },
  //   'A-CSK01': { name: 'KLEEMANN MOBICAT MC 703 EVO SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
  //   'A-CSM02': { name: 'METSO ST2.8 SCALPER SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
  //   'A-CSC03': { name: 'CHIEFTAIN 600, DOUBLE DECK SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
  //   'A-CSE07': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
  //   'A-CSE08': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
  //   'A-CSE09': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
  //   'A-CSE10': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
  //   'A-DOK13': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
  //   'A-DOK15': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
  //   'A-DOK16': { name: 'DOZER KOMATSU D155 40t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
  //   'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
  //   'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
  //   'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
  //   'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
  //   'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
  //   'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
  //   'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
  //   'SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
  //   'SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
  //   'SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
  //   'SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
  //   'SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
  //   'STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
  //   'STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
  //   'STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
  //   'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
  //   'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
  //   'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
  //   'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
  //   'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
  //   'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
  //   'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  //   'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  //   'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  // };

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

  // Stats - calculate dynamically without dummy drivers
  // const [stats, setStats] = useState({
  //   totalVehicles: Object.keys(plantMasterList).length,
  //   activeVehicles: 0, // Will be updated when drivers are assigned
  //   fuelStores: Object.values(fuelStores).flat().length,
  //   totalFuel: 45000,
  //   totalServices: 245,
  //   pendingServices: 12,
  //   completedToday: 18,
  //   onDutyDrivers: 0, // Will be updated when drivers are assigned
  //   totalDrivers: 0, // Will come from your system
  //   availableVehicles: Object.keys(plantMasterList).length
  // });

  
   const [stats, setStats] = useState({
    totalVehicles: Object.keys(plantMasterList).length, 
    activeVehicles: 0,
    fuelStores: Object.values(fuelStores).flat().length,
    totalFuel: 45000,
    totalServices: 245,
    pendingServices: 12,
    completedToday: 18,
    onDutyDrivers: 0,
    totalDrivers: 0,
    availableVehicles: Object.keys(plantMasterList).length 
  });

  // Update stats when duty assignments change
  useEffect(() => {
    const activeDrivers = dutyAssignments.filter(d => d.status === 'active').length;
    const activeVehicles = dutyAssignments.filter(d => d.status === 'active' && d.vehicle !== 'Not Assigned').length;
    
    setStats(prev => ({
      ...prev,
      activeVehicles: activeVehicles,
      onDutyDrivers: activeDrivers,
      availableVehicles: Object.keys(plantMasterList).length - activeVehicles
    }));
  }, [dutyAssignments]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, type: 'Plant Fuel to Contract', vehicle: 'A-EXK38', quantity: '150L', time: '10:30 AM', status: 'completed' },
    { id: 2, type: 'Stock Issue Plant', vehicle: 'A-APD08', details: 'Routine maintenance', time: '9:15 AM', status: 'completed' },
    { id: 3, type: 'Plant Fuel Return from Contract', vehicle: 'SLD02', quantity: '50L', time: 'Yesterday', status: 'completed' },
    { id: 4, type: 'Stock Return from Plant', vehicle: 'A-APB05', details: 'Hydraulic leak', time: 'Yesterday', status: 'pending' },
    { id: 5, type: 'Plant Fuel to Contract', vehicle: 'A-TAC07', quantity: '200L', time: '2 days ago', status: 'completed' }
  ]);

  // Fix: Ensure all plants have categories and handle undefined
  const vehicleCategories = Object.values(plantMasterList).reduce((acc, plant) => {
    const category = plant.category || 'other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {});

  // Fix: Safe category name formatting
  const categoryArray = Object.entries(vehicleCategories).map(([name, count]) => ({
    name: name ? name.replace('_', ' ').toUpperCase() : 'OTHER',
    originalName: name,
    count,
    color: getCategoryColor(name)
  }));

  function getCategoryColor(category) {
    const colors = {
      earthmoving: '#4caf50',
      hauling: '#2196f3',
      paving: '#ff9800',
      crushing: '#9c27b0',
      screening: '#673ab7',
      transport: '#f44336',
      light_vehicle: '#00bcd4',
      specialized: '#ff5722',
      plant: '#8bc34a',
      cleaning: '#795548',
      landscaping: '#607d8b',
      fuel_trailer: '#9e9e9e',
      static_tank: '#3f51b5',
      other: '#cccccc'
    };
    return colors[category] || '#cccccc';
  }

  // Filter vehicles for inventory
  const filteredVehicles = Object.entries(plantMasterList).filter(([plantNumber, plant]) => {
    const matchesSearch = 
      plantNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      plant.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      plant.type.toLowerCase().includes(vehicleSearch.toLowerCase());
    
    const matchesCategory = selectedVehicleCategory === 'all' || plant.category === selectedVehicleCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate vehicle pagination
  const totalVehiclePages = Math.ceil(filteredVehicles.length / vehicleItemsPerPage);
  const vehicleStartIndex = (vehicleCurrentPage - 1) * vehicleItemsPerPage;
  const vehicleEndIndex = vehicleStartIndex + vehicleItemsPerPage;
  const currentVehicles = filteredVehicles.slice(vehicleStartIndex, vehicleEndIndex);

  // Get unique vehicle categories for filter
  const vehicleCategoriesList = ['all', ...new Set(Object.values(plantMasterList).map(p => p.category).filter(Boolean))];

  // Filter drivers for duty tracking
  const filteredDrivers = dutyAssignments.filter(driver => {
    const matchesSearch = 
      driver.driver?.toLowerCase().includes(driverSearch.toLowerCase()) ||
      driver.vehicle?.toLowerCase().includes(driverSearch.toLowerCase()) ||
      driver.location?.toLowerCase().includes(driverSearch.toLowerCase());
    
    const matchesStatus = selectedDriverStatus === 'all' || driver.status === selectedDriverStatus;
    const matchesRole = selectedDriverRole === 'all' || driver.driverRole === selectedDriverRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Calculate driver pagination
  const totalDriverPages = Math.ceil(filteredDrivers.length / driverItemsPerPage);
  const driverStartIndex = (driverCurrentPage - 1) * driverItemsPerPage;
  const driverEndIndex = driverStartIndex + driverItemsPerPage;
  const currentDrivers = filteredDrivers.slice(driverStartIndex, driverEndIndex);

  const getAvatarColor = (name) => {
    if (!name) return '#4caf50';
    const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#8bc34a'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getUserInitials = (name) => {
    if (!name) return 'M';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#4caf50';
      case 'on_break': return '#ff9800';
      case 'off_duty': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  // Function to get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'On Duty';
      case 'on_break': return 'On Break';
      case 'off_duty': return 'Off Duty';
      default: return 'Unknown';
    }
  };

  // Function to get role text
  const getRoleText = (role) => {
    switch(role) {
      case 'driver': return 'Driver';
      case 'clerk': return 'Clerk';
      case 'service_driver': return 'Service Driver';
      default: return role;
    }
  };

  // Function to handle duty status change
  const handleDutyChange = (driverId, newStatus) => {
    setDutyAssignments(prev => 
      prev.map(driver => 
        driver.id === driverId ? { 
          ...driver, 
          status: newStatus,
          lastUpdated: new Date().toISOString()
        } : driver
      )
    );
  };

  // Function to assign driver to vehicle
  const handleAssignDriver = (driverId, vehicleId) => {
    const vehicle = Object.entries(plantMasterList).find(([num]) => num === vehicleId);
    if (!vehicle) return;

    setDutyAssignments(prev => 
      prev.map(driver => 
        driver.id === driverId ? {
          ...driver,
          vehicle: vehicleId,
          vehicleName: vehicle[1].name,
          vehicleCategory: vehicle[1].category,
          lastUpdated: new Date().toISOString()
        } : driver
      )
    );
  };

  // Function to unassign driver
  const handleUnassignDriver = (driverId) => {
    setDutyAssignments(prev => 
      prev.map(driver => 
        driver.id === driverId ? {
          ...driver,
          vehicle: 'Not Assigned',
          vehicleName: 'No Vehicle Assigned',
          vehicleCategory: '',
          lastUpdated: new Date().toISOString()
        } : driver
      )
    );
  };

  // Function to add a new driver assignment
  const handleAddDriverAssignment = () => {
    // This would normally come from your user system
    // For now, we'll add a placeholder
    const newAssignment = {
      id: Date.now(),
      driver: 'New Driver',
      driverId: Date.now(),
      driverRole: 'driver',
      vehicle: 'Not Assigned',
      vehicleName: 'No Vehicle Assigned',
      vehicleCategory: '',
      status: 'off_duty',
      startTime: '07:00 AM',
      endTime: '04:00 PM',
      shift: 'Day',
      location: 'Not Assigned',
      fuelLevel: '0%',
      lastUpdated: new Date().toISOString()
    };
    
    setDutyAssignments(prev => [...prev, newAssignment]);
  };

  // New function to render driver duty tracking
  const renderDriverDutyView = () => {
    return (
      <div style={{ 
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#1b5e20', marginBottom: '25px', fontSize: '22px' }}>🚦 Driver Duty Tracking</h3>
        
        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { label: 'On Duty', value: dutyAssignments.filter(d => d.status === 'active').length, icon: '🟢', color: '#4caf50' },
            { label: 'On Break', value: dutyAssignments.filter(d => d.status === 'on_break').length, icon: '🟡', color: '#ff9800' },
            { label: 'Off Duty', value: dutyAssignments.filter(d => d.status === 'off_duty').length, icon: '🔴', color: '#f44336' },
            { label: 'Total Drivers', value: dutyAssignments.length, icon: '👷', color: '#2196f3' },
            { label: 'Vehicles in Use', value: dutyAssignments.filter(d => d.status === 'active' && d.vehicle !== 'Not Assigned').length, icon: '🚗', color: '#9c27b0' },
            { label: 'Available Vehicles', value: stats.availableVehicles, icon: '✅', color: '#00bcd4' },
            { label: 'Active Sites', value: new Set(dutyAssignments.filter(d => d.status === 'active').map(d => d.location)).size, icon: '📍', color: '#ff5722' },
            { label: 'Service Drivers', value: dutyAssignments.filter(d => d.driverRole === 'service_driver').length, icon: '⛽', color: '#795548' }
          ].map((stat, index) => (
            <div 
              key={index} 
              style={{ 
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: `${stat.color}15`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: stat.color
              }}>
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <input
            type="text"
            placeholder="Search drivers, vehicles, or locations..."
            value={driverSearch}
            onChange={(e) => setDriverSearch(e.target.value)}
            style={{
              padding: '12px 20px',
              border: '2px solid #1b5e20',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
          
          <select
            value={selectedDriverStatus}
            onChange={(e) => setSelectedDriverStatus(e.target.value)}
            style={{
              padding: '12px 20px',
              border: '2px solid #1b5e20',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">On Duty</option>
            <option value="on_break">On Break</option>
            <option value="off_duty">Off Duty</option>
          </select>
          
          <select
            value={selectedDriverRole}
            onChange={(e) => setSelectedDriverRole(e.target.value)}
            style={{
              padding: '12px 20px',
              border: '2px solid #1b5e20',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Roles</option>
            <option value="driver">Driver</option>
            <option value="clerk">Clerk</option>
            <option value="service_driver">Service Driver</option>
          </select>
          
          <select
            value={driverItemsPerPage}
            onChange={(e) => {
              setDriverItemsPerPage(Number(e.target.value));
              setDriverCurrentPage(1);
            }}
            style={{
              padding: '12px 20px',
              border: '2px solid #1b5e20',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>

        {/* Add Driver Button */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={handleAddDriverAssignment}
            style={{ 
              padding: '12px 24px',
              backgroundColor: '#1b5e20',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>+</span>
            Add Driver Assignment
          </button>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Note: Driver data should come from your user management system
          </div>
        </div>

        {/* Driver Duty Table */}
        {dutyAssignments.length > 0 ? (
          <>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px',
              maxHeight: '500px',
              overflowY: 'auto',
              marginBottom: '20px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1b5e20', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Driver</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Vehicle</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Shift</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDrivers.map((driver, index) => (
                    <tr 
                      key={driver.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            backgroundColor: getAvatarColor(driver.driver), 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontSize: '12px', 
                            fontWeight: 'bold' 
                          }}>
                            {getUserInitials(driver.driver)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#333' }}>{driver.driver}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{driver.startTime} - {driver.endTime}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '6px 12px',
                          backgroundColor: driver.driverRole === 'service_driver' ? '#fff3e0' : 
                                         driver.driverRole === 'clerk' ? '#e8f5e8' : '#e3f2fd',
                          color: driver.driverRole === 'service_driver' ? '#ff9800' : 
                                 driver.driverRole === 'clerk' ? '#1b5e20' : '#2196f3',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {getRoleText(driver.driverRole)}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#333' }}>{driver.vehicle}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{driver.vehicleName}</div>
                          <div style={{ marginTop: '4px' }}>
                            <select
                              value={driver.vehicle}
                              onChange={(e) => handleAssignDriver(driver.id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                width: '100%'
                              }}
                            >
                              <option value="Not Assigned">-- Assign Vehicle --</option>
                              {Object.entries(plantMasterList)
                                .filter(([_, v]) => v.category !== 'static_tank')
                                .map(([vehicleId, vehicle]) => (
                                  <option key={vehicleId} value={vehicleId}>
                                    {vehicleId} - {vehicle.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '6px 12px',
                          backgroundColor: getStatusColor(driver.status) + '15',
                          color: getStatusColor(driver.status),
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {getStatusText(driver.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '600', color: '#333' }}>{driver.shift}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{driver.startTime} - {driver.endTime}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ 
                          padding: '6px 12px',
                          backgroundColor: '#e8f5e8',
                          color: '#1b5e20',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {driver.location}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => handleDutyChange(driver.id, 'active')}
                              style={{ 
                                padding: '4px 8px',
                                backgroundColor: driver.status === 'active' ? '#4caf50' : '#e8f5e8',
                                color: driver.status === 'active' ? 'white' : '#4caf50',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                flex: 1
                              }}
                            >
                              On Duty
                            </button>
                            <button 
                              onClick={() => handleDutyChange(driver.id, 'on_break')}
                              style={{ 
                                padding: '4px 8px',
                                backgroundColor: driver.status === 'on_break' ? '#ff9800' : '#fff3e0',
                                color: driver.status === 'on_break' ? 'white' : '#ff9800',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                flex: 1
                              }}
                            >
                              Break
                            </button>
                            <button 
                              onClick={() => handleDutyChange(driver.id, 'off_duty')}
                              style={{ 
                                padding: '4px 8px',
                                backgroundColor: driver.status === 'off_duty' ? '#f44336' : '#ffebee',
                                color: driver.status === 'off_duty' ? 'white' : '#f44336',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                flex: 1
                              }}
                            >
                              Off
                            </button>
                          </div>
                          {driver.vehicle !== 'Not Assigned' ? (
                            <button 
                              onClick={() => handleUnassignDriver(driver.id)}
                              style={{ 
                                padding: '4px 8px',
                                backgroundColor: '#f5f5f5',
                                color: '#666',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                width: '100%'
                              }}
                            >
                              Unassign Vehicle
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                const availableVehicle = Object.entries(plantMasterList)
                                  .find(([vehicleId]) => 
                                    !dutyAssignments.some(d => d.vehicle === vehicleId && d.status === 'active')
                                  );
                                if (availableVehicle) {
                                  handleAssignDriver(driver.id, availableVehicle[0]);
                                }
                              }}
                              style={{ 
                                padding: '4px 8px',
                                backgroundColor: '#1b5e20',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                width: '100%'
                              }}
                            >
                              Assign Vehicle
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Driver Pagination */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Showing {driverStartIndex + 1}-{Math.min(driverEndIndex, filteredDrivers.length)} of {filteredDrivers.length} drivers
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={() => setDriverCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={driverCurrentPage === 1}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: driverCurrentPage === 1 ? '#f5f5f5' : '#1b5e20',
                    color: driverCurrentPage === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: driverCurrentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Previous
                </button>
                
                <div style={{ display: 'flex', gap: '5px' }}>
                  {Array.from({ length: Math.min(5, totalDriverPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setDriverCurrentPage(pageNum)}
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: driverCurrentPage === pageNum ? '#1b5e20' : '#f5f5f5',
                          color: driverCurrentPage === pageNum ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: driverCurrentPage === pageNum ? '600' : 'normal'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => setDriverCurrentPage(prev => Math.min(prev + 1, totalDriverPages))}
                  disabled={driverCurrentPage === totalDriverPages}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: driverCurrentPage === totalDriverPages ? '#f5f5f5' : '#1b5e20',
                    color: driverCurrentPage === totalDriverPages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: driverCurrentPage === totalDriverPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '40px', 
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>👷</div>
            <h4 style={{ color: '#555', marginBottom: '10px' }}>No Driver Assignments</h4>
            <p>Driver assignments will appear here when drivers are added from your user management system.</p>
            <button 
              onClick={handleAddDriverAssignment}
              style={{ 
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#1b5e20',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Add Sample Driver Assignment
            </button>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <button 
            onClick={() => setActiveView('dashboard')}
            style={{ 
              padding: '12px 24px',
              backgroundColor: '#1b5e20',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ← Back to Dashboard
          </button>
          
          <button 
            onClick={() => setActiveView('vehicles')}
            style={{ 
              padding: '12px 24px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            View Vehicles →
          </button>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#1b5e20', marginBottom: '20px', fontSize: '20px' }}>📊 Key Statistics</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px' 
              }}>
                {[
                  { label: 'Total Vehicles', value: stats.totalVehicles, icon: '🚗', color: '#2196f3', change: `+${Math.floor(stats.totalVehicles * 0.05)}` },
                  { label: 'Vehicles in Use', value: stats.activeVehicles, icon: '🟢', color: '#4caf50', change: `+${Math.floor(stats.activeVehicles * 0.08)}` },
                  { label: 'Available Vehicles', value: stats.availableVehicles, icon: '✅', color: '#00bcd4', change: '-2' },
                  { label: 'Fuel Stores', value: stats.fuelStores, icon: '⛽', color: '#ff9800', change: '+1' },
                  { label: 'Total Fuel (L)', value: stats.totalFuel.toLocaleString(), icon: '📊', color: '#9c27b0', change: '+1500' },
                  { label: 'Total Services', value: stats.totalServices, icon: '🔧', color: '#f44336', change: '+18' },
                  { label: 'Pending Services', value: stats.pendingServices, icon: '⏳', color: '#ff9800', change: '-3' },
                  { label: 'On Duty Drivers', value: stats.onDutyDrivers, icon: '👷', color: '#00bcd4', change: '+1' }
                ].map((stat, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      backgroundColor: 'white',
                      padding: '25px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px'
                    }}
                  >
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: `${stat.color}15`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      color: stat.color
                    }}>
                      {stat.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                        {stat.value}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: stat.change.startsWith('+') ? '#4caf50' : '#f44336',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {stat.change.startsWith('+') ? '↑' : '↓'} {stat.change}
                        <span style={{ color: '#999' }}>this week</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Overview Section */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '30px',
              marginBottom: '30px'
            }}>
              {/* Driver Duty Status */}
              <div style={{ 
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>👷</span>
                  Driver Duty Status
                  <button 
                    onClick={() => setActiveView('driver_duty')}
                    style={{ 
                      marginLeft: 'auto',
                      padding: '8px 16px',
                      backgroundColor: '#1b5e20',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View All
                  </button>
                </h4>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {dutyAssignments
                    .filter(d => d.status === 'active')
                    .slice(0, 5)
                    .map(driver => (
                    <div 
                      key={driver.id}
                      style={{ 
                        padding: '15px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}
                    >
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: getAvatarColor(driver.driver), 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontSize: '14px', 
                        fontWeight: 'bold' 
                      }}>
                        {getUserInitials(driver.driver)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: '600', color: '#333' }}>
                            {driver.driver}
                          </div>
                          <div style={{ 
                            padding: '4px 10px',
                            backgroundColor: getStatusColor(driver.status) + '15',
                            color: getStatusColor(driver.status),
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {getStatusText(driver.status)}
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                          {driver.vehicle} • {driver.location}
                        </div>
                        <div style={{ fontSize: '13px', color: '#999', marginTop: '3px' }}>
                          Shift: {driver.shift} • {driver.startTime} - {driver.endTime}
                        </div>
                      </div>
                    </div>
                  ))}
                  {dutyAssignments.filter(d => d.status === 'active').length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No drivers currently on duty
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Categories */}
              <div style={{ 
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🚗</span>
                  Vehicle Categories
                  <button 
                    onClick={() => setActiveView('vehicles')}
                    style={{ 
                      marginLeft: 'auto',
                      padding: '8px 16px',
                      backgroundColor: '#1b5e20',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View All
                  </button>
                </h4>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {categoryArray.map((category, index) => (
                    <div 
                      key={index}
                      style={{ 
                        padding: '15px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}
                    >
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px',
                        backgroundColor: `${category.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        color: category.color
                      }}>
                        {getCategoryIcon(category.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: '600', color: '#333' }}>
                            {category.name}
                          </div>
                          <div style={{ 
                            padding: '4px 10px',
                            backgroundColor: `${category.color}15`,
                            color: category.color,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {category.count} vehicles
                          </div>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                            <span>Percentage</span>
                            <span>{Math.round((category.count / stats.totalVehicles) * 100)}%</span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '6px', 
                            backgroundColor: '#e0e0e0',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div 
                              style={{ 
                                width: `${(category.count / stats.totalVehicles) * 100}%`, 
                                height: '100%', 
                                backgroundColor: category.color,
                                borderRadius: '3px'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 'vehicles':
        return (
          <div style={{ 
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '25px', fontSize: '22px' }}>🚗 Vehicle Inventory</h3>
            
            {/* Search and Filter */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <input
                type="text"
                placeholder="Search vehicles by number, name, or type..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                style={{
                  padding: '12px 20px',
                  border: '2px solid #1b5e20',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
              
              <select
                value={selectedVehicleCategory}
                onChange={(e) => {
                  setSelectedVehicleCategory(e.target.value);
                  setVehicleCurrentPage(1);
                }}
                style={{
                  padding: '12px 20px',
                  border: '2px solid #1b5e20',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Categories</option>
                {vehicleCategoriesList
                  .filter(cat => cat !== 'all' && cat)
                  .map(cat => (
                    <option key={cat} value={cat}>
                      {cat ? cat.replace('_', ' ').toUpperCase() : 'UNCATEGORIZED'}
                    </option>
                  ))}
              </select>
              
              <select
                value={vehicleItemsPerPage}
                onChange={(e) => {
                  setVehicleItemsPerPage(Number(e.target.value));
                  setVehicleCurrentPage(1);
                }}
                style={{
                  padding: '12px 20px',
                  border: '2px solid #1b5e20',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>

            {/* Vehicle Table */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px',
              maxHeight: '500px',
              overflowY: 'auto',
              marginBottom: '20px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1b5e20', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Plant Number</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Fuel Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVehicles.map(([plantNumber, plant], index) => {
                    const isAssigned = dutyAssignments.some(d => d.vehicle === plantNumber && d.status === 'active');
                    const assignedDriver = dutyAssignments.find(d => d.vehicle === plantNumber && d.status === 'active');
                    
                    return (
                      <tr 
                        key={plantNumber}
                        style={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <td style={{ padding: '12px', fontWeight: '600', color: '#333' }}>{plantNumber}</td>
                        <td style={{ padding: '12px' }}>{plant.name}</td>
                        <td style={{ padding: '12px' }}>{plant.type}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '6px 12px',
                            backgroundColor: plant.fuelType === 'Diesel' ? '#e8f5e8' : 
                                          plant.fuelType === 'Petrol' ? '#fff3e0' : '#e3f2fd',
                            color: plant.fuelType === 'Diesel' ? '#1b5e20' : 
                                  plant.fuelType === 'Petrol' ? '#ff9800' : '#1565c0',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {plant.fuelType}
                        </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '6px 12px',
                            backgroundColor: getCategoryColor(plant.category) + '15',
                            color: getCategoryColor(plant.category),
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {plant.category ? plant.category.replace('_', ' ').toUpperCase() : 'UNCATEGORIZED'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {isAssigned && assignedDriver ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ 
                                padding: '6px 12px',
                                backgroundColor: getStatusColor(assignedDriver.status) + '15',
                                color: getStatusColor(assignedDriver.status),
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {getStatusText(assignedDriver.status)}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {assignedDriver.driver}
                              </div>
                            </div>
                          ) : (
                            <span style={{ 
                              padding: '6px 12px',
                              backgroundColor: '#e8f5e8',
                              color: '#1b5e20',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              Available
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vehicle Pagination */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Showing {vehicleStartIndex + 1}-{Math.min(vehicleEndIndex, filteredVehicles.length)} of {filteredVehicles.length} vehicles
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={() => setVehicleCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={vehicleCurrentPage === 1}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: vehicleCurrentPage === 1 ? '#f5f5f5' : '#1b5e20',
                    color: vehicleCurrentPage === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: vehicleCurrentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Previous
                </button>
                
                <div style={{ display: 'flex', gap: '5px' }}>
                  {Array.from({ length: Math.min(5, totalVehiclePages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setVehicleCurrentPage(pageNum)}
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: vehicleCurrentPage === pageNum ? '#1b5e20' : '#f5f5f5',
                          color: vehicleCurrentPage === pageNum ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: vehicleCurrentPage === pageNum ? '600' : 'normal'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => setVehicleCurrentPage(prev => Math.min(prev + 1, totalVehiclePages))}
                  disabled={vehicleCurrentPage === totalVehiclePages}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: vehicleCurrentPage === totalVehiclePages ? '#f5f5f5' : '#1b5e20',
                    color: vehicleCurrentPage === totalVehiclePages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: vehicleCurrentPage === totalVehiclePages ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Next
                </button>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #eee'
            }}>
              <button 
                onClick={() => setActiveView('dashboard')}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: '#1b5e20',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ← Back to Dashboard
              </button>
              
              <button 
                onClick={() => setActiveView('driver_duty')}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                View Driver Duty →
              </button>
            </div>
          </div>
        );

      case 'driver_duty':
        return renderDriverDutyView();

      case 'reports':
        return (
          <div style={{ 
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '25px', fontSize: '22px' }}>📊 Reports & Analytics</h3>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#333', marginBottom: '15px' }}>Transaction Types Available</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {transactionTypes.map(type => (
                  <div 
                    key={type}
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#e8f5e8',
                      color: '#1b5e20',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#333', marginBottom: '15px' }}>Contract Options</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {contractOptions.map(contract => (
                  <div 
                    key={contract}
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#fff3e0',
                      color: '#ff9800',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}
                  >
                    {contract}
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setActiveView('dashboard')}
              style={{ 
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#1b5e20',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        );

      case 'users':
        return (
          <div style={{ 
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '25px', fontSize: '22px' }}>👥 User Management</h3>
            
            {/* User management placeholder */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '40px', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>👥</div>
              <h4 style={{ color: '#555', marginBottom: '10px' }}>User Management System</h4>
              <p>User management functionality will be integrated with your authentication system.</p>
              <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                Drivers, clerks, and service drivers should be managed through your main user management system.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '20px'
            }}>
              <button 
                onClick={() => setActiveView('dashboard')}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: '#1b5e20',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ← Back to Dashboard
              </button>
              
              <button 
                onClick={() => setActiveView('driver_duty')}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                View Driver Duty →
              </button>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div style={{ 
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '25px', fontSize: '22px' }}>📈 Fuel Analytics</h3>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '40px', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
              <h4 style={{ color: '#555', marginBottom: '10px' }}>Fuel Analytics Section</h4>
              <p>Analyze fuel consumption patterns, identify trends, and optimize fuel usage.</p>
              <button 
                onClick={() => setActiveView('dashboard')}
                style={{ 
                  marginTop: '20px',
                  padding: '12px 24px',
                  backgroundColor: '#1b5e20',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ 
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '25px', fontSize: '22px' }}>Dashboard</h3>
            <p>Select a section from the sidebar</p>
          </div>
        );
    }
  };

  function getCategoryIcon(category) {
    const icons = {
      'EARTHMOVING': '🚜',
      'HAULING': '🚚',
      'PAVING': '🛣️',
      'CRUSHING': '🗜️',
      'SCREENING': '🔲',
      'TRANSPORT': '🚐',
      'LIGHT VEHICLE': '🚙',
      'SPECIALIZED': '🔧',
      'PLANT': '🏭',
      'CLEANING': '🧹',
      'LANDSCAPING': '🌿',
      'FUEL TRAILER': '⛽',
      'STATIC TANK': '📦',
      'OTHER': '🚗',
      'UNCATEGORIZED': '❓'
    };
    return icons[category] || '🚗';
  }

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      display: 'flex'
    }}>
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
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '90px'
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
              fontSize: '18px',
              flexShrink: 0
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            {!sidebarCollapsed && (
              <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                Navigation
              </div>
            )}
            
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
              { id: 'vehicles', label: 'Vehicle Inventory', icon: '🚗' },
              { id: 'driver_duty', label: 'Driver Duty', icon: '👷' },
              { id: 'reports', label: 'Reports', icon: '📊' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'users', label: 'User Management', icon: '👥' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                style={{
                  width: '100%',
                  padding: sidebarCollapsed ? '15px 0' : '15px 20px',
                  backgroundColor: activeView === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== item.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            {!sidebarCollapsed && (
              <div style={{ padding: '0 20px 10px 20px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                Quick Actions
              </div>
            )}
            
            <button
              onClick={() => setShowPlantQRGenerator(true)}
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
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🏭</span>
              {!sidebarCollapsed && <span>Plant QR Generator</span>}
            </button>
            
            <button
              onClick={() => setShowFuelStoreQRGenerator(true)}
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
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>⛽</span>
              {!sidebarCollapsed && <span>Fuel Store QR Generator</span>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        <div style={{ 
          flex: 1,
          padding: '30px',
          overflowY: 'auto'
        }}>
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
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Manager Dashboard</p>
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
                  <div style={{ fontSize: '12px', color: '#666' }}>Manager</div>
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
                  fontWeight: '600' 
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {renderMainContent()}
        </div>

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

      {showPlantQRGenerator && (
        <PlantQRGenerator
          user={user}
          onClose={() => setShowPlantQRGenerator(false)}
        />
      )}

      {showFuelStoreQRGenerator && (
        <FuelStoreQRGenerator
          user={user}
          onClose={() => setShowFuelStoreQRGenerator(false)}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;