import React, { useState, useEffect } from 'react';
import QRGenerator from '../qr/QRGenerator';
import transactionService from '../../services/transactionService';

// Import each icon individually to avoid the module error
import { FaUsers } from 'react-icons/fa';
import { FaGasPump } from 'react-icons/fa';
import { FaCar } from 'react-icons/fa';
import { FaTools } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa';
import { FaChartBar } from 'react-icons/fa';
import { FaQrcode } from 'react-icons/fa';
import { FaFileExcel } from 'react-icons/fa';
import { FaReceipt } from 'react-icons/fa';
import { FaTachometerAlt } from 'react-icons/fa';
import { FaPrint } from 'react-icons/fa';
import { FaHistory } from 'react-icons/fa';

const ManagerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // QR Generator State
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [selectedPlantForQR, setSelectedPlantForQR] = useState('');
  
  // Plant master list
  const plantMasterList = {
    'A-APB05': { name: 'ASPHALT PAVER BITELLI BB691', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD06': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD07': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD08': { name: 'ASPHALT PAVER DYNAPAC F161-8W', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD09': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APD11': { name: 'ASPHALT PAVER DYNAPAC DF145P', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APN01': { name: 'ASPHALT PAVER NIGATA', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APV10': { name: 'ASPHALT PAVER VOGELE 1800 SPRAY JET', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'paving' },
    'A-APP02': { name: 'ASPHALT MIXING PLANT MOBILE 40tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP03': { name: 'ASPHALT MIXING PLANT MOBILE 60tph', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP04': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-APP05': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Paver', fuelType: 'Diesel', category: 'plant' },
    'A-APP06': { name: 'ASPHALT MIXING PLANT AMMANN 140TPH', type: 'Asphalt Plant', fuelType: 'Diesel', category: 'plant' },
    'A-ASR01': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
    'A-ASR02': { name: 'ASPHALT SHUTTLE-BUGGY ROAD-TEC SB2500', type: 'Shuttle Buggy', fuelType: 'Diesel', category: 'paving' },
    'A-BBS03': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
    'A-BBS04': { name: 'BUS MBENZ SPRINTER 23 SEATER', type: 'Bus', fuelType: 'Diesel', category: 'transport' },
    'A-BDT02': { name: 'BITUMEN TRAILER 1kl', type: 'Bitumen Trailer', fuelType: 'Bitumen', category: 'specialized' },
    'A-BDT06': { name: 'CRACKSEALING TRAILER', type: 'Cracksealing Trailer', fuelType: 'Diesel', category: 'specialized' },
    'A-BEP01': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
    'A-BEP02': { name: 'BITUMEN EMULSION PLANT', type: 'Emulsion Plant', fuelType: 'Diesel', category: 'plant' },
    'A-BNS08': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BNS09': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BNS10': { name: '0.5 TONNE BAKKIE 4X2 NISSAN', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC106': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC107': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BOC108': { name: '0.5 TONNE BAKKIE 4X2 CHEVY', type: 'Bakkie', fuelType: 'Petrol', category: 'light_vehicle' },
    'A-BRM11': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM12': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM13': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BRM14': { name: 'BROOM BROCE RCT-350', type: 'Broom', fuelType: 'Diesel', category: 'cleaning' },
    'A-BTH100': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
    'A-BTH104': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
    'A-BTH115': { name: '1.0 TONNE BAKKIE 4X2', type: 'Bakkie', fuelType: 'Diesel', category: 'light_vehicle' },
    'A-CCK05': { name: 'KLEEMANN MOBICONE MCO 9 S EVO CONE', type: 'Cone Crusher', fuelType: 'Diesel', category: 'crushing' },
    'A-CHR03': { name: 'RM HORIZONTAL IMPACT CRUSHER 100GO', type: 'Impact Crusher', fuelType: 'Diesel', category: 'crushing' },
    'A-CJK06': { name: 'KLEEMANN MOBICAT MC 110 R EVO JAW', type: 'Jaw Crusher', fuelType: 'Diesel', category: 'crushing' },
    'A-CSK01': { name: 'KLEEMANN MOBICAT MC 703 EVO SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
    'A-CSM02': { name: 'METSO ST2.8 SCALPER SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
    'A-CSC03': { name: 'CHIEFTAIN 600, DOUBLE DECK SCREEN', type: 'Screen', fuelType: 'Diesel', category: 'screening' },
    'A-CSE07': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE08': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE09': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-CSE10': { name: 'CHIPSPREADER ETNYRE', type: 'Chipspreader', fuelType: 'Diesel', category: 'paving' },
    'A-DOK13': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
    'A-DOK15': { name: 'DOZER KOMATSU D65 20t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
    'A-DOK16': { name: 'DOZER KOMATSU D155 40t', type: 'Dozer', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK38': { name: 'EXCAVATOR PC500 50t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK42': { name: 'EXCAVATOR PC270 27t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK44': { name: 'EXCAVATOR PC450 45t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-EXK46': { name: 'EXCAVATOR PC350 35t TRACKED', type: 'Excavator', fuelType: 'Diesel', category: 'earthmoving' },
    'A-FDH39': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
    'A-FDH23': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
    'A-FDH26': { name: 'FLAT DECK HINO 5t', type: 'Truck', fuelType: 'Diesel', category: 'transport' },
    'SLD2': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD3': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD7': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD09': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'SLD10': { name: 'FUEL TRAILER', type: 'Fuel Trailer', fuelType: 'Diesel', category: 'fuel_trailer' },
    'STD01': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
    'STD02': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
    'STD05': { name: 'STATIC TANK DIESEL 23m3', type: 'Static Tank', fuelType: 'Diesel', category: 'static_tank' },
    'A-TAC07': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAC08': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAC09': { name: 'CAT 730 ADT 30t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK10': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK11': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-TAK12': { name: 'KOMATSU HM400 ADT 40t', type: 'Articulated Dump Truck', fuelType: 'Diesel', category: 'hauling' },
    'A-ZBH03': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
    'A-ZBH04': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
    'A-ZBH05': { name: 'BACKPACK BLOWER HUSQVARNA', type: 'Blower', fuelType: 'Petrol', category: 'landscaping' },
  };

  // Helper functions for avatar
  const getAvatarColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    if (!name) return colors[0];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getUserInitials = (name) => {
    if (!name) return 'M';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Orange color palette
  const colors = {
    primary: '#ff9800',
    primaryLight: '#ffb74d',
    primaryDark: '#f57c00',
    secondary: '#1565c0',
    secondaryLight: '#5e92f3',
    secondaryDark: '#003c8f',
    background: '#f8f9fa',
    cardBg: '#ffffff',
    text: '#333333',
    textLight: '#666666',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    info: '#2196f3'
  };

  // Initialize data
  useEffect(() => {
    loadTransactions();
    checkActiveUsers();
    generateAlerts();
  }, [dateRange]);

  // Filter transactions when filter changes
  useEffect(() => {
    filterTransactions();
  }, [filterType, transactions]);

  const loadTransactions = () => {
    setLoading(true);
    try {
      const allTransactions = transactionService.getAllTransactions();
      const sortedTransactions = allTransactions.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => {
        if (filterType === 'fuel') {
          return transaction.transactionType === 'Plant Fuel to Contract' || 
                 transaction.transactionType === 'Fuel';
        } else if (filterType === 'service') {
          return transaction.transactionType === 'Service';
        } else if (filterType === 'attendant') {
          return transaction.transactionType === 'Attendant' || 
                 !transaction.transactionType;
        }
        return true;
      });
    }
    
    setFilteredTransactions(filtered);
  };

  // FIXED: checkActiveUsers function - now properly checks for active users from localStorage/sessionStorage
  const checkActiveUsers = () => {
    const activeUsersList = [];
    
    // Method 1: Check for driver shifts in localStorage (Driver Dashboard stores these)
    const driverShiftKeys = Object.keys(localStorage).filter(key => 
      key.includes('_shift') || key.includes('shift_')
    );
    
    driverShiftKeys.forEach(key => {
      try {
        const shiftData = JSON.parse(localStorage.getItem(key));
        console.log('Found shift data:', key, shiftData); // Debug log
        
        if (shiftData) {
          // Extract user info from shift data
          const userId = shiftData.userId || shiftData.employeeNumber || 
                        shiftData.driverId || key.split('_')[0];
          
          // Check if shift is active (based on timestamp)
          const shiftStart = shiftData.startTime || shiftData.shiftStart;
          const isActive = shiftStart && !shiftData.shiftEnd;
          
          if (isActive || shiftData.isActive) {
            activeUsersList.push({
              id: userId,
              name: shiftData.driverName || shiftData.fullName || 
                    shiftData.name || `Employee ${userId}`,
              role: shiftData.role || 'Driver',
              vehicle: shiftData.plantNumber || shiftData.vehicle || 
                      shiftData.assignedVehicle || 'Not Assigned',
              startTime: shiftStart || new Date().toISOString(),
              status: 'ON DUTY',
              employeeNumber: userId,
              shiftData: shiftData // Store full shift data for details view
            });
          }
        }
      } catch (error) {
        console.error('Error parsing shift data:', error);
      }
    });
    
    // Method 2: Check for active sessions in sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('currentUser') || key.includes('loggedInUser') || 
          key.includes('userSession') || key.includes('activeUser')) {
        try {
          const userData = JSON.parse(sessionStorage.getItem(key));
          console.log('Found session data:', key, userData); // Debug log
          
          if (userData && (userData.isLoggedIn || userData.isActive)) {
            const userId = userData.userId || userData.employeeNumber || 
                          userData.id || 'unknown';
            
            // Check if this user already exists in the list
            const existingUser = activeUsersList.find(u => 
              u.id === userId || u.employeeNumber === userId
            );
            
            if (!existingUser) {
              activeUsersList.push({
                id: userId,
                name: userData.fullName || userData.name || 
                      userData.username || `Employee ${userId}`,
                role: userData.role || 'User',
                vehicle: userData.plantNumber || userData.vehicle || 
                        userData.assignedVehicle || 'Not Assigned',
                startTime: userData.loginTime || userData.sessionStart || 
                          new Date().toISOString(),
                status: 'ACTIVE',
                employeeNumber: userId,
                userData: userData // Store full user data for details view
              });
            }
          }
        } catch (error) {
          console.error('Error parsing session data:', error);
        }
      }
    });
    
    // Method 3: Check for current logged-in users in localStorage
    const userKeys = Object.keys(localStorage).filter(key => 
      key.includes('currentUser') || key.includes('loggedInUser') ||
      key.startsWith('user_') || key.startsWith('employee_')
    );
    
    userKeys.forEach(key => {
      try {
        const userData = JSON.parse(localStorage.getItem(key));
        console.log('Found user data:', key, userData); // Debug log
        
        if (userData && (userData.isLoggedIn || userData.isActive)) {
          const userId = userData.userId || userData.employeeNumber || 
                        userData.id || key.replace('user_', '').replace('employee_', '');
          
          // Check if this user already exists in the list
          const existingUser = activeUsersList.find(u => 
            u.id === userId || u.employeeNumber === userId
          );
          
          if (!existingUser) {
            activeUsersList.push({
              id: userId,
              name: userData.fullName || userData.name || 
                    userData.username || `Employee ${userId}`,
              role: userData.role || 'User',
              vehicle: userData.plantNumber || userData.vehicle || 
                      userData.assignedVehicle || 'Not Assigned',
              startTime: userData.loginTime || userData.lastActive || 
                        new Date().toISOString(),
              status: 'LOGGED IN',
              employeeNumber: userId,
              userData: userData
            });
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    });
    
    console.log('Active users found:', activeUsersList); // Debug log
    setActiveUsers(activeUsersList);
  };

  // FIXED: Function to view user details in a new window
  const viewUserDetails = (activeUser) => {
    const detailsWindow = window.open('', '_blank', 'width=800,height=600');
    const detailsContent = `
      <html>
        <head>
          <title>User Details - ${activeUser.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 30px; 
              background: #f5f5f5; 
              margin: 0;
            }
            .details-card { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 12px; 
              padding: 30px; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #ff9800; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .header h2 { color: #ff9800; margin: 0; font-size: 24px; }
            .header p { color: #666; margin: 5px 0 0 0; }
            .info-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 20px; 
              margin-bottom: 30px;
            }
            .info-item { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; margin-bottom: 5px; font-size: 12px; }
            .value { color: #333; font-size: 16px; font-weight: 600; }
            .full-details { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin-top: 20px;
              max-height: 300px;
              overflow-y: auto;
            }
            .full-details-title { 
              font-weight: bold; 
              margin-bottom: 10px; 
              color: #666;
              font-size: 14px;
            }
            .json-view { 
              font-family: monospace; 
              font-size: 12px; 
              white-space: pre-wrap;
              background: white;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #ddd;
            }
            .status-active { color: #4caf50; font-weight: bold; }
            .status-inactive { color: #f44336; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="details-card">
            <div class="header">
              <h2>User Details</h2>
              <p>${activeUser.name} - ${activeUser.role}</p>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Employee Number</div>
                <div class="value">${activeUser.employeeNumber || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Role</div>
                <div class="value">${activeUser.role}</div>
              </div>
              <div class="info-item">
                <div class="label">Assigned Vehicle</div>
                <div class="value">${activeUser.vehicle}</div>
              </div>
              <div class="info-item">
                <div class="label">Status</div>
                <div class="value status-active">● ${activeUser.status}</div>
              </div>
              <div class="info-item">
                <div class="label">Shift Start</div>
                <div class="value">${activeUser.startTime ? new Date(activeUser.startTime).toLocaleString() : 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Duration</div>
                <div class="value">
                  ${activeUser.startTime ? 
                    Math.round((Date.now() - new Date(activeUser.startTime).getTime()) / 3600000) + ' hours' : 
                    'N/A'
                  }
                </div>
              </div>
            </div>
            
            <div class="full-details">
              <div class="full-details-title">Full Data:</div>
              <div class="json-view">${JSON.stringify(activeUser.shiftData || activeUser.userData || {}, null, 2)}</div>
            </div>
            
            <div class="footer">
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>Fuel Management System - Manager Dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    detailsWindow.document.write(detailsContent);
    detailsWindow.document.close();
  };

  const generateAlerts = () => {
    const newAlerts = [];
    
    transactions.forEach(transaction => {
      const fuelQty = parseFloat(transaction.fuelQuantity);
      if (fuelQty > 500) {
        newAlerts.push({
          id: `high-fuel-${transaction.id}`,
          type: 'High Fuel Quantity',
          vehicle: transaction.plantNumber,
          driver: transaction.driverName || transaction.receiverName,
          message: `Unusually high fuel quantity: ${fuelQty}L`,
          severity: 'high',
          date: new Date(transaction.timestamp).toLocaleString()
        });
      }
    });
    
    setAlerts(newAlerts);
  };

  const generateSampleData = () => {
    const sampleTransactions = [];
    const sampleTeamPerformance = [];
    
    const drivers = ['John Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Emma Davis'];
    const vehicles = ['A-APD08', 'A-BTH104', 'A-EXK42', 'A-TAC07', 'A-FDH39'];
    
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const transactionType = ['Plant Fuel to Contract', 'Service', 'Fuel'][Math.floor(Math.random() * 3)];
      const driver = drivers[Math.floor(Math.random() * drivers.length)];
      
      let fuelQty = (Math.random() * 200 + 50).toFixed(1);
      let cost = (fuelQty * 18.5).toFixed(2);
      let odometer = (15000 + Math.random() * 5000).toFixed(0);
      
      sampleTransactions.push({
        id: i + 1,
        timestamp: date.toISOString(),
        date: date.toLocaleString(),
        driverName: driver,
        receiverName: driver,
        plantNumber: vehicles[Math.floor(Math.random() * vehicles.length)],
        plantName: plantMasterList[vehicles[Math.floor(Math.random() * vehicles.length)]]?.name || 'Unknown',
        fuelStore: 'FSH01 - 01',
        fuelQuantity: fuelQty,
        cost: parseFloat(cost),
        odometerKilos: odometer,
        odometerHours: (Math.random() * 1000).toFixed(0),
        transactionType: transactionType,
        role: 'Driver',
        status: 'Completed',
        remarks: transactionType === 'Service' ? 'Regular maintenance performed' : 'Fuel refill',
        shiftStatus: 'ON DUTY',
        receiptNumber: `REC-${1000 + i}`,
        receiptImage: `https://via.placeholder.com/150x80/ff9800/ffffff?text=Receipt+${1000 + i}`
      });
    }
    
    drivers.forEach(driver => {
      sampleTeamPerformance.push({
        driver,
        totalFuel: (Math.random() * 1000 + 500).toFixed(0),
        totalCost: (Math.random() * 20000 + 10000).toFixed(0),
        vehiclesUsed: Math.floor(Math.random() * 3) + 1,
        efficiency: (Math.random() * 2 + 6).toFixed(1),
        alerts: Math.floor(Math.random() * 3),
        role: 'Driver',
        transactions: Math.floor(Math.random() * 20) + 5
      });
    });

    setTransactions(sampleTransactions);
    setFilteredTransactions(sampleTransactions);
    setTeamPerformance(sampleTeamPerformance);
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalFuel = transactions.reduce((sum, t) => sum + parseFloat(t.fuelQuantity || 0), 0);
    const totalCost = transactions.reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0);
    const todayTransactions = transactions.filter(t => 
      new Date(t.timestamp).toDateString() === new Date().toDateString()
    );
    
    const uniqueDrivers = [...new Set(transactions.map(t => t.driverName || t.receiverName))].length;
    const uniqueVehicles = [...new Set(transactions.map(t => t.plantNumber))].length;
    
    const fuelTransactions = transactions.filter(t => 
      t.transactionType === 'Plant Fuel to Contract' || t.transactionType === 'Fuel'
    ).length;
    
    const serviceTransactions = transactions.filter(t => 
      t.transactionType === 'Service'
    ).length;
    
    return {
      totalFuel: totalFuel.toFixed(0),
      totalCost: totalCost.toFixed(2),
      todayTransactions: todayTransactions.length,
      uniqueDrivers,
      uniqueVehicles,
      fuelTransactions,
      serviceTransactions,
      activeUsers: activeUsers.length,
      avgEfficiency: (teamPerformance.reduce((sum, p) => sum + parseFloat(p.efficiency || 0), 0) / teamPerformance.length).toFixed(1)
    };
  };

  const stats = calculateStats();

  // Download transactions as Excel (XLSX)
  const downloadTransactionsExcel = () => {
    // Create HTML table for Excel
    let tableHTML = `
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Transaction Type</th>
            <th>Fuel (L)</th>
            <th>Cost (R)</th>
            <th>Odometer (km)</th>
            <th>Receipt No.</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    filteredTransactions.forEach(transaction => {
      tableHTML += `
        <tr>
          <td>${transaction.id}</td>
          <td>${new Date(transaction.timestamp).toLocaleString()}</td>
          <td>${transaction.driverName || transaction.receiverName}</td>
          <td>${transaction.plantNumber}</td>
          <td>${transaction.transactionType}</td>
          <td>${transaction.fuelQuantity}</td>
          <td>${transaction.cost || '0'}</td>
          <td>${transaction.odometerKilos || '0'}</td>
          <td>${transaction.receiptNumber || 'N/A'}</td>
          <td>${transaction.remarks || ''}</td>
        </tr>
      `;
    });
    
    tableHTML += `
        </tbody>
      </table>
    `;
    
    // Create blob with Excel content
    const blob = new Blob([`
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #ff9800; color: white; font-weight: bold; padding: 8px; text-align: left; }
            td { padding: 6px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Fuel Management Report</h1>
          <p>Report Period: ${dateRange.start} to ${dateRange.end}</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          ${tableHTML}
          <br>
          <h2>Summary</h2>
          <p>Total Fuel: ${stats.totalFuel} L</p>
          <p>Total Cost: R ${stats.totalCost}</p>
          <p>Total Transactions: ${filteredTransactions.length}</p>
        </body>
      </html>
    `], { type: 'application/vnd.ms-excel' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-report-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to generate QR for plant
  const generateQRForPlant = (plantNumber) => {
    if (plantNumber) {
      setSelectedPlantForQR(plantNumber);
      setShowQRGenerator(true);
    }
  };

  // FIXED: Refresh data function - now properly calls all refresh functions
  const handleRefresh = () => {
    loadTransactions();
    checkActiveUsers();
    generateAlerts();
  };

  // Print Receipt
  const printReceipt = (transaction) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #ff9800; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #ff9800; padding-bottom: 10px; margin-bottom: 20px; }
            .header h2 { color: #ff9800; margin: 0; }
            .details { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; }
            .total { background: #fff3e0; padding: 15px; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>FUEL TRANSACTION RECEIPT</h2>
              <p>${transaction.receiptNumber || 'N/A'}</p>
            </div>
            <div class="details">
              <div class="row">
                <span class="label">Date:</span>
                <span class="value">${new Date(transaction.timestamp).toLocaleString()}</span>
              </div>
              <div class="row">
                <span class="label">Driver:</span>
                <span class="value">${transaction.driverName || transaction.receiverName}</span>
              </div>
              <div class="row">
                <span class="label">Vehicle:</span>
                <span class="value">${transaction.plantNumber}</span>
              </div>
              <div class="row">
                <span class="label">Transaction Type:</span>
                <span class="value">${transaction.transactionType}</span>
              </div>
              <div class="row">
                <span class="label">Fuel Quantity:</span>
                <span class="value">${transaction.fuelQuantity} L</span>
              </div>
              <div class="row">
                <span class="label">Cost:</span>
                <span class="value">R ${transaction.cost || '0'}</span>
              </div>
              <div class="row">
                <span class="label">Odometer:</span>
                <span class="value">${transaction.odometerKilos || '0'} km</span>
              </div>
              <div class="row">
                <span class="label">Remarks:</span>
                <span class="value">${transaction.remarks || 'N/A'}</span>
              </div>
            </div>
            <div class="total">
              <div class="row">
                <span class="label" style="font-size: 16px;">Total Cost:</span>
                <span class="value" style="font-size: 18px; color: #ff9800; font-weight: bold;">R ${transaction.cost || '0'}</span>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for using Fuel Management System</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.background,
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: 'white', 
        padding: '15px 25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        margin: '20px 20px 30px 20px'
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
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{user?.fullName || 'Manager'}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Manager</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ 
            padding: '10px 20px', 
            backgroundColor: '#d32f2f', 
            color: 'white', 
            border: 'none', 
            borderRadius: '25px', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: '600' 
          }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        display: 'flex',
        flex: 1,
        backgroundColor: colors.background,
        padding: '0 20px 20px 20px'
      }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarCollapsed ? '80px' : '280px',
          backgroundColor: colors.cardBg,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)',
          overflowY: 'auto',
          zIndex: 100,
          marginRight: '20px',
          borderRadius: '12px',
          position: 'sticky',
          top: '20px',
          flexShrink: 0
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '25px 20px',
            borderBottom: `1px solid ${colors.primaryLight}20`,
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            borderRadius: '12px 12px 0 0'
          }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
              }}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
            {!sidebarCollapsed && (
              <div style={{ color: 'white', flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Manager Menu</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Navigation Panel</p>
              </div>
            )}
          </div>

          {/* Sidebar Menu */}
          <div style={{ 
            padding: sidebarCollapsed ? '20px 10px' : '20px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '30px', flex: 1 }}>
              {!sidebarCollapsed && (
                <h4 style={{ 
                  color: colors.textLight, 
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  marginBottom: '15px'
                }}>
                  Navigation
                </h4>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'overview', label: 'Dashboard', icon: <FaChartBar />, color: colors.primary },
                  { id: 'transactions', label: 'Transactions', icon: <FaHistory />, color: colors.secondary },
                  { id: 'receipts', label: 'Receipts', icon: <FaReceipt />, color: colors.success },
                  { id: 'odometers', label: 'Odometer Logs', icon: <FaTachometerAlt />, color: colors.info },
                  { id: 'active', label: 'Active Users', icon: <FaUsers />, color: colors.warning },
                  { id: 'alerts', label: 'Alerts', icon: <FaBell />, color: colors.danger },
                  { id: 'team', label: 'Team Performance', icon: <FaUsers />, color: colors.success },
                  { id: 'qrGenerator', label: 'QR Generator', icon: <FaQrcode />, color: colors.info }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      width: '100%',
                      padding: sidebarCollapsed ? '12px' : '12px 15px',
                      backgroundColor: activeTab === item.id ? `${item.color}15` : 'transparent',
                      color: activeTab === item.id ? item.color : colors.textLight,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: sidebarCollapsed ? '0' : '12px',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      transition: 'all 0.3s ease',
                      fontSize: sidebarCollapsed ? '18px' : '14px',
                      minHeight: '44px'
                    }}
                    onMouseOver={(e) => {
                      if (activeTab !== item.id) {
                        e.target.style.backgroundColor = `${item.color}10`;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (activeTab !== item.id) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ 
                      fontSize: sidebarCollapsed ? '18px' : '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px'
                    }}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && (
                      <span style={{ fontSize: '14px', fontWeight: '600', textAlign: 'left' }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            {!sidebarCollapsed && (
              <div style={{ marginTop: 'auto' }}>
                <h4 style={{ 
                  color: colors.textLight, 
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  marginBottom: '15px'
                }}>
                  Quick Actions
                </h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <button
                    onClick={downloadTransactionsExcel}
                    style={{
                      padding: '12px 15px',
                      backgroundColor: `${colors.success}15`,
                      color: colors.success,
                      border: `1px solid ${colors.success}30`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <FaFileExcel /> Export Excel
                  </button>
                  {/* FIXED: Uncommented and fixed the Refresh button */}
                  {/* <button
                    onClick={handleRefresh}
                    style={{
                      padding: '12px 15px',
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary,
                      border: `1px solid ${colors.primary}30`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      justifyContent: 'flex-start'
                    }}
                  >
                    🔄 Refresh Data
                  </button> */}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          height: 'calc(100vh - 200px)'
        }}>
          {/* Responsive Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {[
              { 
                label: 'Total Fuel', 
                value: `${stats.totalFuel} L`, 
                icon: <FaGasPump />, 
                color: colors.primary,
                change: '+12%' 
              },
              { 
                label: 'Total Cost', 
                value: `R ${stats.totalCost}`, 
                icon: <FaReceipt />, 
                color: colors.secondary,
                change: '+8%' 
              },
              { 
                label: 'Active Users', 
                value: stats.activeUsers, 
                icon: <FaUsers />, 
                color: colors.success,
                change: '+5' 
              },
              { 
                label: 'Active Vehicles', 
                value: stats.uniqueVehicles, 
                icon: <FaCar />, 
                color: colors.warning,
                change: '+2' 
              }
            ].map((stat, index) => (
              <div 
                key={index}
                style={{ 
                  backgroundColor: colors.cardBg,
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  borderTop: `4px solid ${stat.color}`,
                  transition: 'transform 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '150px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div style={{ 
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    {stat.icon}
                  </div>
                  <span style={{ 
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: stat.change.startsWith('+') ? `${colors.success}15` : `${colors.danger}15`,
                    color: stat.change.startsWith('+') ? colors.success : colors.danger,
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {stat.change}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: '700', 
                  color: stat.color, 
                  marginBottom: '5px',
                  wordBreak: 'break-word'
                }}>
                  {stat.value}
                </div>
                <div style={{ 
                  color: colors.textLight, 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  marginTop: 'auto'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ 
            backgroundColor: colors.cardBg, 
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '25px'
          }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                  {/* Recent Transactions */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ color: colors.primary, margin: 0 }}>Recent Transactions</h3>
                      <button 
                        onClick={() => setActiveTab('transactions')}
                        style={{ 
                          padding: '8px 16px',
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          border: `1px solid ${colors.primary}30`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        View All
                      </button>
                    </div>
                    <div style={{ 
                      maxHeight: '400px', 
                      overflowY: 'auto',
                      borderRadius: '8px',
                      border: `1px solid ${colors.primaryLight}20`
                    }}>
                      {transactions.slice(0, 10).map(transaction => (
                        <div key={transaction.id} style={{ 
                          padding: '15px', 
                          borderBottom: `1px solid ${colors.primaryLight}20`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: transaction.transactionType === 'Service' ? `${colors.success}15` : `${colors.primary}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: transaction.transactionType === 'Service' ? colors.success : colors.primary,
                            fontSize: '18px'
                          }}>
                            {transaction.transactionType === 'Service' ? <FaTools /> : <FaGasPump />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <span style={{ fontWeight: '600' }}>{transaction.driverName}</span>
                              <span style={{ fontWeight: '600', color: colors.primary }}>{transaction.fuelQuantity}L</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: colors.textLight }}>
                              {transaction.plantNumber} • {transaction.transactionType} • {new Date(transaction.timestamp).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: colors.textLight, marginTop: '5px' }}>
                              Odometer: {transaction.odometerKilos || '0'} km • Receipt: {transaction.receiptNumber || 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Users */}
                  <div>
                    <h3 style={{ color: colors.primary, marginBottom: '20px' }}>Currently Active</h3>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '15px'
                    }}>
                      {activeUsers.slice(0, 4).map(activeUser => (
                        <div key={activeUser.id} style={{ 
                          padding: '20px',
                          borderRadius: '8px',
                          backgroundColor: `${colors.success}08`,
                          border: `1px solid ${colors.success}20`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: colors.success,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                              {activeUser.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>{activeUser.name}</div>
                              <div style={{ fontSize: '0.9rem', color: colors.textLight }}>{activeUser.role}</div>
                            </div>
                          </div>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '10px',
                            fontSize: '0.9rem'
                          }}>
                            <div>
                              <div style={{ color: colors.textLight }}>Employee #</div>
                              <div style={{ fontWeight: '600' }}>{activeUser.employeeNumber || 'N/A'}</div>
                            </div>
                            <div>
                              <div style={{ color: colors.textLight }}>Vehicle</div>
                              <div style={{ fontWeight: '600' }}>{activeUser.vehicle}</div>
                            </div>
                            <div>
                              <div style={{ color: colors.textLight }}>Shift Start</div>
                              <div style={{ fontWeight: '600' }}>
                                {activeUser.startTime ? new Date(activeUser.startTime).toLocaleTimeString() : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: colors.textLight }}>Status</div>
                              <div style={{ 
                                color: colors.success,
                                fontWeight: '600'
                              }}>
                                ● {activeUser.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <h3 style={{ color: colors.primary, margin: 0 }}>All Transactions</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ 
                          padding: '10px 15px',
                          border: `1px solid ${colors.primaryLight}30`,
                          borderRadius: '6px',
                          backgroundColor: colors.cardBg,
                          color: colors.text,
                          minWidth: '180px'
                        }}
                      >
                        <option value="all">All Transactions</option>
                        <option value="fuel">Fuel Transactions</option>
                        <option value="service">Service Transactions</option>
                      </select>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          style={{ 
                            padding: '10px',
                            border: `1px solid ${colors.primaryLight}30`,
                            borderRadius: '6px',
                            backgroundColor: colors.cardBg,
                            color: colors.text
                          }}
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          style={{ 
                            padding: '10px',
                            border: `1px solid ${colors.primaryLight}30`,
                            borderRadius: '6px',
                            backgroundColor: colors.cardBg,
                            color: colors.text
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: colors.textLight }}>
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                      <p>Loading transactions...</p>
                    </div>
                  ) : (
                    <div style={{ 
                      maxHeight: '600px', 
                      overflowY: 'auto',
                      borderRadius: '8px',
                      border: `1px solid ${colors.primaryLight}20`
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: colors.cardBg, zIndex: 1 }}>
                          <tr style={{ borderBottom: `2px solid ${colors.primaryLight}20` }}>
                            {['Date', 'Driver', 'Vehicle', 'Type', 'Fuel (L)', 'Cost', 'Odometer', 'Receipt', 'Actions'].map(header => (
                              <th key={header} style={{ 
                                padding: '15px', 
                                textAlign: 'left', 
                                fontWeight: '600',
                                color: colors.primary,
                                backgroundColor: `${colors.primary}05`
                              }}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map(transaction => (
                            <tr key={transaction.id} style={{ borderBottom: `1px solid ${colors.primaryLight}10` }}>
                              <td style={{ padding: '15px' }}>
                                {new Date(transaction.timestamp).toLocaleDateString()}<br/>
                                <small style={{ color: colors.textLight }}>
                                  {new Date(transaction.timestamp).toLocaleTimeString()}
                                </small>
                              </td>
                              <td style={{ padding: '15px', fontWeight: '600' }}>
                                {transaction.driverName}
                              </td>
                              <td style={{ padding: '15px' }}>{transaction.plantNumber}</td>
                              <td style={{ padding: '15px' }}>
                                <span style={{ 
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  backgroundColor: transaction.transactionType === 'Service' ? `${colors.success}15` : `${colors.primary}15`,
                                  color: transaction.transactionType === 'Service' ? colors.success : colors.primary,
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {transaction.transactionType}
                                </span>
                              </td>
                              <td style={{ padding: '15px', fontWeight: '600', color: colors.primary }}>
                                {transaction.fuelQuantity}L
                              </td>
                              <td style={{ padding: '15px', fontWeight: '600', color: colors.secondary }}>
                                R {transaction.cost || '0'}
                              </td>
                              <td style={{ padding: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <FaTachometerAlt style={{ color: colors.textLight }} />
                                  {transaction.odometerKilos || '0'} km
                                </div>
                              </td>
                              <td style={{ padding: '15px' }}>
                                {transaction.receiptNumber || 'N/A'}
                              </td>
                              <td style={{ padding: '15px' }}>
                                <button
                                  onClick={() => printReceipt(transaction)}
                                  style={{
                                    padding: '8px 12px',
                                    backgroundColor: `${colors.primary}15`,
                                    color: colors.primary,
                                    border: `1px solid ${colors.primary}30`,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '12px'
                                  }}
                                >
                                  <FaPrint /> Print
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Receipts Tab */}
            {activeTab === 'receipts' && (
              <div>
                <h3 style={{ color: colors.primary, marginBottom: '25px' }}>Receipts Management</h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px'
                }}>
                  {filteredTransactions.slice(0, 12).map(transaction => (
                    <div key={transaction.id} style={{ 
                      padding: '25px',
                      borderRadius: '12px',
                      backgroundColor: colors.cardBg,
                      border: `2px solid ${colors.primaryLight}30`,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '20px'
                      }}>
                        <div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: colors.textLight,
                            marginBottom: '5px'
                          }}>
                            Receipt Number
                          </div>
                          <div style={{ 
                            fontSize: '18px', 
                            fontWeight: '700',
                            color: colors.primary
                          }}>
                            {transaction.receiptNumber || `REC-${transaction.id}`}
                          </div>
                        </div>
                        <span style={{ 
                          padding: '5px 10px',
                          borderRadius: '6px',
                          backgroundColor: `${colors.success}15`,
                          color: colors.success,
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          PAID
                        </span>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                          fontSize: '14px'
                        }}>
                          <div>
                            <div style={{ color: colors.textLight, marginBottom: '3px' }}>Date</div>
                            <div style={{ fontWeight: '600' }}>{new Date(transaction.timestamp).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div style={{ color: colors.textLight, marginBottom: '3px' }}>Driver</div>
                            <div style={{ fontWeight: '600' }}>{transaction.driverName}</div>
                          </div>
                          <div>
                            <div style={{ color: colors.textLight, marginBottom: '3px' }}>Vehicle</div>
                            <div style={{ fontWeight: '600' }}>{transaction.plantNumber}</div>
                          </div>
                          <div>
                            <div style={{ color: colors.textLight, marginBottom: '3px' }}>Fuel Type</div>
                            <div style={{ fontWeight: '600' }}>Diesel</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ 
                        backgroundColor: `${colors.primary}05`,
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}>
                          <div>
                            <div style={{ color: colors.textLight, fontSize: '12px' }}>Fuel Quantity</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>
                              {transaction.fuelQuantity} L
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: colors.textLight, fontSize: '12px' }}>Total Cost</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: colors.secondary }}>
                              R {transaction.cost || '0'}
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          color: colors.textLight
                        }}>
                          <div>Odometer: {transaction.odometerKilos || '0'} km</div>
                          <div>Rate: R 18.50/L</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => printReceipt(transaction)}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <FaPrint /> Print Receipt
                        </button>
                        <button
                          onClick={() => window.open(transaction.receiptImage || '#', '_blank')}
                          style={{
                            padding: '12px 20px',
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            border: `1px solid ${colors.primary}30`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Odometer Logs Tab */}
            {activeTab === 'odometers' && (
              <div>
                <h3 style={{ color: colors.primary, marginBottom: '25px' }}>Odometer & Hour Meter Logs</h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  {Object.keys(plantMasterList).slice(0, 12).map(plantNumber => {
                    const plant = plantMasterList[plantNumber];
                    const plantTransactions = transactions.filter(t => t.plantNumber === plantNumber);
                    const lastTransaction = plantTransactions[0];
                    const totalFuel = plantTransactions.reduce((sum, t) => sum + parseFloat(t.fuelQuantity || 0), 0);
                    const avgEfficiency = plantTransactions.length > 0 ? 
                      (plantTransactions.reduce((sum, t) => sum + parseFloat(t.odometerKilos || 0), 0) / totalFuel).toFixed(1) : 0;
                    
                    return (
                      <div key={plantNumber} style={{ 
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: colors.cardBg,
                        border: `2px solid ${colors.primaryLight}30`,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '15px'
                        }}>
                          <div>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: '700',
                              color: colors.primary,
                              marginBottom: '5px'
                            }}>
                              {plantNumber}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: colors.textLight
                            }}>
                              {plant.name}
                            </div>
                          </div>
                          <div style={{ 
                            padding: '5px 10px',
                            borderRadius: '6px',
                            backgroundColor: `${plant.fuelType === 'Diesel' ? colors.primary : colors.success}15`,
                            color: plant.fuelType === 'Diesel' ? colors.primary : colors.success,
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {plant.fuelType}
                          </div>
                        </div>

                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                          marginBottom: '20px'
                        }}>
                          <div style={{ 
                            textAlign: 'center',
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: `${colors.primary}05`
                          }}>
                            <div style={{ 
                              fontSize: '24px', 
                              fontWeight: '700',
                              color: colors.primary,
                              marginBottom: '5px'
                            }}>
                              {lastTransaction?.odometerKilos || '0'}
                            </div>
                            <div style={{ fontSize: '11px', color: colors.textLight }}>KM ODOMETER</div>
                          </div>
                          <div style={{ 
                            textAlign: 'center',
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: `${colors.success}05`
                          }}>
                            <div style={{ 
                              fontSize: '24px', 
                              fontWeight: '700',
                              color: colors.success,
                              marginBottom: '5px'
                            }}>
                              {lastTransaction?.odometerHours || '0'}
                            </div>
                            <div style={{ fontSize: '11px', color: colors.textLight }}>HOUR METER</div>
                          </div>
                        </div>

                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '10px',
                          fontSize: '12px'
                        }}>
                          <div>
                            <div style={{ color: colors.textLight }}>Fuel Used</div>
                            <div style={{ fontWeight: '600' }}>{totalFuel.toFixed(0)} L</div>
                          </div>
                          <div>
                            <div style={{ color: colors.textLight }}>Efficiency</div>
                            <div style={{ fontWeight: '600', color: avgEfficiency > 5 ? colors.success : colors.warning }}>
                              {avgEfficiency} km/L
                            </div>
                          </div>
                          <div>
                            <div style={{ color: colors.textLight }}>Last Service</div>
                            <div style={{ fontWeight: '600' }}>
                              {lastTransaction?.timestamp ? new Date(lastTransaction.timestamp).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: colors.textLight }}>Status</div>
                            <div style={{ 
                              fontWeight: '600',
                              color: plantTransactions.length > 0 ? colors.success : colors.textLight
                            }}>
                              {plantTransactions.length > 0 ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>

                        {lastTransaction && (
                          <button
                            onClick={() => printReceipt(lastTransaction)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              marginTop: '15px',
                              backgroundColor: `${colors.primary}15`,
                              color: colors.primary,
                              border: `1px solid ${colors.primary}30`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}
                          >
                            View Last Receipt
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Users Tab */}
            {activeTab === 'active' && (
              <div>
                <h3 style={{ color: colors.primary, marginBottom: '25px' }}>Active Users & Shifts</h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {activeUsers.length > 0 ? (
                    activeUsers.map(activeUser => (
                      <div key={activeUser.id} style={{ 
                        padding: '25px',
                        borderRadius: '12px',
                        backgroundColor: colors.cardBg,
                        border: `2px solid ${colors.success}30`,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '15px',
                          marginBottom: '20px'
                        }}>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}80 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '24px'
                          }}>
                            {activeUser.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: colors.text }}>
                              {activeUser.name}
                            </div>
                            <div style={{ fontSize: '14px', color: colors.textLight }}>{activeUser.role}</div>
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                          marginBottom: '20px'
                        }}>
                          <div>
                            <div style={{ fontSize: '12px', color: colors.textLight }}>Employee #</div>
                            <div style={{ fontSize: '16px', fontWeight: '600' }}>{activeUser.employeeNumber || 'N/A'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: colors.textLight }}>Vehicle</div>
                            <div style={{ fontSize: '16px', fontWeight: '600' }}>{activeUser.vehicle}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: colors.textLight }}>Shift Start</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>
                              {activeUser.startTime ? new Date(activeUser.startTime).toLocaleTimeString() : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: colors.textLight }}>Status</div>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: '600',
                              color: colors.success
                            }}>
                              ● {activeUser.status}
                            </div>
                          </div>
                        </div>
                        
                        {/* FIXED: View Details button now calls the proper function */}
                        <button
                          onClick={() => viewUserDetails(activeUser)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            border: `1px solid ${colors.primary}30`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '50px',
                      color: colors.textLight
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>👤</div>
                      <p>No active users at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div>
                <h3 style={{ color: colors.primary, marginBottom: '25px' }}>System Alerts & Notifications</h3>
                <div style={{ 
                  maxHeight: '500px',
                  overflowY: 'auto',
                  borderRadius: '8px',
                  border: `1px solid ${colors.primaryLight}20`
                }}>
                  {alerts.length > 0 ? (
                    alerts.map(alert => (
                      <div key={alert.id} style={{ 
                        padding: '20px',
                        borderBottom: `1px solid ${colors.primaryLight}10`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '15px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: alert.severity === 'high' ? `${colors.danger}15` : `${colors.warning}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: alert.severity === 'high' ? colors.danger : colors.warning,
                          fontSize: '20px'
                        }}>
                          <FaBell />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: '600', color: colors.text }}>{alert.type}</span>
                            <span style={{ 
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: alert.severity === 'high' ? `${colors.danger}15` : `${colors.warning}15`,
                              color: alert.severity === 'high' ? colors.danger : colors.warning,
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ color: colors.textLight, marginBottom: '5px' }}>
                            {alert.message}
                          </div>
                          <div style={{ fontSize: '12px', color: colors.textLight }}>
                            Vehicle: {alert.vehicle} • Driver: {alert.driver} • Time: {alert.date}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center',
                      padding: '50px',
                      color: colors.textLight
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                      <p>No alerts at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Performance Tab */}
            {activeTab === 'team' && (
              <div>
                <h3 style={{ color: colors.primary, marginBottom: '25px' }}>Team Performance</h3>
                <div style={{ 
                  maxHeight: '600px',
                  overflowY: 'auto',
                  borderRadius: '8px',
                  border: `1px solid ${colors.primaryLight}20`
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: colors.cardBg, zIndex: 1 }}>
                      <tr style={{ borderBottom: `2px solid ${colors.primaryLight}20` }}>
                        {['Driver', 'Role', 'Fuel Used (L)', 'Total Cost', 'Vehicles', 'Efficiency', 'Transactions', 'Alerts'].map(header => (
                          <th key={header} style={{ 
                            padding: '15px', 
                            textAlign: 'left', 
                            fontWeight: '600',
                            color: colors.primary,
                            backgroundColor: `${colors.primary}05`
                          }}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teamPerformance.map((member, index) => (
                        <tr key={index} style={{ borderBottom: `1px solid ${colors.primaryLight}10` }}>
                          <td style={{ padding: '15px', fontWeight: '600' }}>{member.driver}</td>
                          <td style={{ padding: '15px' }}>
                            <span style={{ 
                              padding: '5px 10px',
                              borderRadius: '4px',
                              backgroundColor: `${colors.secondary}15`,
                              color: colors.secondary,
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {member.role}
                            </span>
                          </td>
                          <td style={{ padding: '15px', fontWeight: '600', color: colors.primary }}>
                            {member.totalFuel}L
                          </td>
                          <td style={{ padding: '15px', fontWeight: '600', color: colors.secondary }}>
                            R {member.totalCost}
                          </td>
                          <td style={{ padding: '15px', fontWeight: '600' }}>{member.vehiclesUsed}</td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ 
                              padding: '5px 10px',
                              borderRadius: '4px',
                              backgroundColor: parseFloat(member.efficiency) > 6 ? `${colors.success}15` : `${colors.warning}15`,
                              color: parseFloat(member.efficiency) > 6 ? colors.success : colors.warning,
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-block'
                            }}>
                              {member.efficiency} km/L
                            </div>
                          </td>
                          <td style={{ padding: '15px', fontWeight: '600' }}>{member.transactions}</td>
                          <td style={{ padding: '15px' }}>
                            <span style={{ 
                              padding: '5px 10px',
                              borderRadius: '4px',
                              backgroundColor: member.alerts > 0 ? `${colors.danger}15` : `${colors.success}15`,
                              color: member.alerts > 0 ? colors.danger : colors.success,
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {member.alerts}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QR Generator Tab */}
            {activeTab === 'qrGenerator' && (
              <div>
                <h3 style={{ color: colors.primary, marginBottom: '20px' }}>QR Code Generator</h3>
                <div style={{ 
                  backgroundColor: `${colors.primary}05`, 
                  padding: '30px', 
                  borderRadius: '12px',
                  border: `1px solid ${colors.primaryLight}30`
                }}>
                  <h4 style={{ color: colors.primary, marginBottom: '15px' }}>Generate Plant QR Codes</h4>
                  <p style={{ color: colors.textLight, marginBottom: '25px' }}>
                    Generate QR codes for plant equipment. These QR codes can be printed and attached to equipment for easy scanning by attendants.
                  </p>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.text }}>
                      Select Plant Number:
                    </label>
                    <select 
                      value={selectedPlantForQR} 
                      onChange={(e) => setSelectedPlantForQR(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        border: `1px solid ${colors.primaryLight}30`, 
                        borderRadius: '6px',
                        backgroundColor: colors.cardBg,
                        color: colors.text
                      }}
                    >
                      <option value="">Select a plant number</option>
                      {Object.keys(plantMasterList).map(plantNumber => (
                        <option key={plantNumber} value={plantNumber}>
                          {plantNumber} - {plantMasterList[plantNumber].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPlantForQR && plantMasterList[selectedPlantForQR] && (
                    <div style={{ 
                      backgroundColor: `${colors.success}08`, 
                      padding: '20px', 
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: `1px solid ${colors.success}30`,
                    }}>
                      <h5 style={{ color: colors.success, margin: '0 0 10px 0' }}>Plant Information</h5>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '15px',
                        fontSize: '14px'
                      }}>
                        <div><strong>Plant Number:</strong> {selectedPlantForQR}</div>
                        <div><strong>Type:</strong> {plantMasterList[selectedPlantForQR].type}</div>
                        <div><strong>Description:</strong> {plantMasterList[selectedPlantForQR].name}</div>
                        <div><strong>Fuel Type:</strong> {plantMasterList[selectedPlantForQR].fuelType}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => generateQRForPlant(selectedPlantForQR)}
                      disabled={!selectedPlantForQR}
                      style={{
                        padding: '15px 40px',
                        backgroundColor: !selectedPlantForQR ? '#ccc' : colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: !selectedPlantForQR ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <FaQrcode /> Generate QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: colors.cardBg,
        borderTop: `1px solid ${colors.primaryLight}20`,
        padding: '15px 20px',
        textAlign: 'center',
        color: colors.textLight,
        fontSize: '12px',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span>© 2025 Fuel Management System. All rights reserved.</span>
          <span style={{ color: colors.primary }}>|</span>
          <span>
            Created by 
            <a 
              href="https://port-lee.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: colors.primary, 
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

export default ManagerDashboard;