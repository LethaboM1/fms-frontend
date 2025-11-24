// import React from 'react';

// const ManagerDashboard = ({ user, onLogout }) => {
//   return (
//     <div style={{ padding: '20px' }}>
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '30px',
//         backgroundColor: '#ed6c02',
//         color: 'white',
//         padding: '20px',
//         borderRadius: '8px'
//       }}>
//         <div>
//           <h1 style={{ margin: 0 }}>Manager Dashboard</h1>
//           <p style={{ margin: 0, opacity: 0.9 }}>Team and Operations Management</p>
//         </div>
//         <button 
//           onClick={onLogout}
//           style={{ 
//             padding: '10px 20px', 
//             border: '1px solid #fff',
//             backgroundColor: 'transparent',
//             color: 'white',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Logout
//         </button>
//       </div>

//       <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
//         <h3>Welcome, {user.fullName}!</h3>
//         <p><strong>Role:</strong> {user.role}</p>
//         <p><strong>Email:</strong> {user.email}</p>
//         <p><strong>Department:</strong> Operations Management</p>
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
//         <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
//           <h3>Team Overview</h3>
//           <p><strong>Active Drivers:</strong> 12</p>
//           <p><strong>Fuel Attendants:</strong> 3</p>
//           <p><strong>On Duty:</strong> 8</p>
//         </div>

//         <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
//           <h3>Fuel Consumption</h3>
//           <p><strong>This Month:</strong> 5,200L</p>
//           <p><strong>Cost:</strong> R 85,000</p>
//           <p><strong>Alerts:</strong> 2 vehicles</p>
//         </div>

//         <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
//           <h3>Vehicle Status</h3>
//           <p><strong>Active:</strong> 15 vehicles</p>
//           <p><strong>Maintenance:</strong> 2 vehicles</p>
//           <p><strong>Available:</strong> 10 vehicles</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManagerDashboard;


import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ManagerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);

  // Sample data - in real app, this would come from API
  useEffect(() => {
    // Generate comprehensive sample data
    const generateSampleData = () => {
      const sampleTransactions = [];
      const sampleAlerts = [];
      const sampleTeamPerformance = [];
      
      const drivers = ['John Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Emma Davis'];
      const vehicles = ['A-APD08', 'A-BTH104', 'A-EXK42', 'A-TAC07', 'A-FDH39'];
      const fuelStores = ['FSH01 - 01', 'SLD 07 (2000L)', 'STD 02'];
      
      // Generate 50 sample transactions
      for (let i = 0; i < 50; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        const fuelQty = (Math.random() * 100 + 20).toFixed(1);
        const cost = (fuelQty * 18.5).toFixed(2);
        
        sampleTransactions.push({
          id: i + 1,
          date: date.toLocaleString(),
          driver: drivers[Math.floor(Math.random() * drivers.length)],
          vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
          fuelStore: fuelStores[Math.floor(Math.random() * fuelStores.length)],
          fuelQuantity: fuelQty,
          cost: parseFloat(cost),
          odometer: (15000 + Math.random() * 5000).toFixed(0),
          type: Math.random() > 0.5 ? 'Refuel' : 'Service',
          status: Math.random() > 0.2 ? 'Completed' : 'Pending'
        });
      }
      
      // Generate alerts
      sampleAlerts.push(
        {
          id: 1,
          type: 'High Consumption',
          vehicle: 'A-APD08',
          driver: 'John Smith',
          message: 'Fuel consumption 25% above average',
          severity: 'high',
          date: new Date().toLocaleString()
        },
        {
          id: 2,
          type: 'Irregular Usage',
          vehicle: 'A-BTH104',
          driver: 'Mike Johnson',
          message: 'Unusual refueling pattern detected',
          severity: 'medium',
          date: new Date().toLocaleString()
        },
        {
          id: 3,
          type: 'Maintenance Due',
          vehicle: 'A-EXK42',
          driver: 'Sarah Wilson',
          message: 'Vehicle due for service in 200km',
          severity: 'low',
          date: new Date().toLocaleString()
        }
      );
      
      // Generate team performance
      drivers.forEach(driver => {
        sampleTeamPerformance.push({
          driver,
          totalFuel: (Math.random() * 1000 + 500).toFixed(0),
          totalCost: (Math.random() * 20000 + 10000).toFixed(0),
          vehiclesUsed: Math.floor(Math.random() * 3) + 1,
          efficiency: (Math.random() * 2 + 6).toFixed(1),
          alerts: Math.floor(Math.random() * 3)
        });
      });

      setTransactions(sampleTransactions);
      setAlerts(sampleAlerts);
      setTeamPerformance(sampleTeamPerformance);
    };

    generateSampleData();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const totalFuel = transactions.reduce((sum, t) => sum + parseFloat(t.fuelQuantity), 0);
    const totalCost = transactions.reduce((sum, t) => sum + t.cost, 0);
    const todayTransactions = transactions.filter(t => 
      new Date(t.date).toDateString() === new Date().toDateString()
    );
    const uniqueDrivers = [...new Set(transactions.map(t => t.driver))].length;
    const uniqueVehicles = [...new Set(transactions.map(t => t.vehicle))].length;
    
    return {
      totalFuel: totalFuel.toFixed(0),
      totalCost: totalCost.toFixed(2),
      todayTransactions: todayTransactions.length,
      uniqueDrivers,
      uniqueVehicles,
      avgEfficiency: (teamPerformance.reduce((sum, p) => sum + parseFloat(p.efficiency), 0) / teamPerformance.length).toFixed(1)
    };
  };

  const stats = calculateStats();

  // Download transactions as CSV
  const downloadTransactionsCSV = () => {
    const headers = [
      'ID', 'Date', 'Driver', 'Vehicle', 'Fuel Store', 'Fuel Quantity (L)', 
      'Cost (R)', 'Odometer', 'Type', 'Status'
    ];

    const csvData = transactions.map(transaction => [
      transaction.id,
      transaction.date,
      transaction.driver,
      transaction.vehicle,
      transaction.fuelStore,
      transaction.fuelQuantity,
      transaction.cost,
      transaction.odometer,
      transaction.type,
      transaction.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manager-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download comprehensive PDF report
  const downloadComprehensivePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('FUEL MANAGEMENT SYSTEM - MANAGER REPORT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, 105, 30, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()} by ${user.fullName}`, 105, 35, { align: 'center' });

    // Executive Summary
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('EXECUTIVE SUMMARY', 20, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const summaryData = [
      ['Total Fuel Consumption', `${stats.totalFuel} L`],
      ['Total Cost', `R ${stats.totalCost}`],
      ['Active Drivers', stats.uniqueDrivers],
      ['Vehicles Tracked', stats.uniqueVehicles],
      ['Today\'s Transactions', stats.todayTransactions],
      ['Average Efficiency', `${stats.avgEfficiency} km/L`]
    ];
    
    doc.autoTable({
      startY: 55,
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // Fuel Consumption Alerts
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('FUEL CONSUMPTION ALERTS', 20, finalY);

    const alertData = alerts.map(alert => [
      alert.type,
      alert.vehicle,
      alert.driver,
      alert.message,
      alert.date.split(',')[0]
    ]);

    doc.autoTable({
      startY: finalY + 5,
      head: [['Alert Type', 'Vehicle', 'Driver', 'Message', 'Date']],
      body: alertData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [231, 76, 60] }
    });

    // Team Performance
    const teamY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('TEAM PERFORMANCE', 20, teamY);

    const teamData = teamPerformance.map(member => [
      member.driver,
      `${member.totalFuel} L`,
      `R ${member.totalCost}`,
      member.vehiclesUsed,
      `${member.efficiency} km/L`,
      member.alerts
    ]);

    doc.autoTable({
      startY: teamY + 5,
      head: [['Driver', 'Total Fuel', 'Total Cost', 'Vehicles', 'Efficiency', 'Alerts']],
      body: teamData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [52, 152, 219] }
    });

    // Recent Transactions
    const transactionY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('RECENT TRANSACTIONS (Last 20)', 20, transactionY);

    const transactionData = transactions.slice(0, 20).map(transaction => [
      transaction.date.split(',')[0],
      transaction.driver,
      transaction.vehicle,
      `${transaction.fuelQuantity} L`,
      `R ${transaction.cost}`,
      transaction.type
    ]);

    doc.autoTable({
      startY: transactionY + 5,
      head: [['Date', 'Driver', 'Vehicle', 'Fuel', 'Cost', 'Type']],
      body: transactionData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [39, 174, 96] },
      pageBreak: 'auto'
    });

    doc.save(`manager-comprehensive-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Monthly consumption data for benchmarks
  const monthlyConsumption = [
    { month: 'Jan', consumption: 5200, benchmark: 5000 },
    { month: 'Feb', consumption: 4800, benchmark: 5000 },
    { month: 'Mar', consumption: 5100, benchmark: 5000 },
    { month: 'Apr', consumption: 4900, benchmark: 5000 },
    { month: 'May', consumption: 5300, benchmark: 5000 },
    { month: 'Jun', consumption: 5500, benchmark: 5000 }
  ];

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #ed6c02 0%, #f57c00 100%)'
      }}>
        <div>
          <h1 style={{ margin: 0, color: 'white', fontSize: '2.2rem', fontWeight: '700' }}>
            Manager Dashboard
          </h1>
          <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            Operations Management & Analytics
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            padding: '10px 20px', 
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600'
          }}>
            👨‍💼 {user.fullName}
          </div>
          <button 
            onClick={onLogout}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { label: 'Total Fuel', value: `${stats.totalFuel} L`, color: '#1976d2', icon: '⛽' },
          { label: 'Total Cost', value: `R ${stats.totalCost}`, color: '#2e7d32', icon: '💰' },
          { label: 'Active Drivers', value: stats.uniqueDrivers, color: '#ed6c02', icon: '👨‍✈️' },
          { label: 'Vehicles', value: stats.uniqueVehicles, color: '#7b1fa2', icon: '🚗' },
          { label: "Today's Transactions", value: stats.todayTransactions, color: '#d32f2f', icon: '📊' },
          { label: 'Avg Efficiency', value: `${stats.avgEfficiency} km/L`, color: '#00796b', icon: '📈' }
        ].map((stat, index) => (
          <div 
            key={index}
            style={{ 
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center',
              borderLeft: `4px solid ${stat.color}`
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: stat.color, marginBottom: '5px' }}>
              {stat.value}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '25px' }}>
        {/* Main Content */}
        <div>
          {/* Tabs Navigation */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '25px'
          }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'transactions', label: '📋 All Transactions', icon: '📋' },
                { id: 'alerts', label: '🚨 Consumption Alerts', icon: '🚨' },
                { id: 'team', label: '👥 Team Performance', icon: '👥' },
                { id: 'analytics', label: '📈 Monthly Analytics', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: activeTab === tab.id ? '#ed6c02' : '#f5f5f5',
                    color: activeTab === tab.id ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            minHeight: '500px'
          }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ color: '#ed6c02', marginBottom: '20px' }}>Operations Overview</h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <h4>Recent Activity</h4>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {transactions.slice(0, 10).map(transaction => (
                          <div key={transaction.id} style={{ 
                            padding: '15px', 
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: '600' }}>{transaction.driver}</div>
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {transaction.vehicle} • {transaction.fuelQuantity}L
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: '600', color: '#2e7d32' }}>
                                R {transaction.cost}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {transaction.date.split(',')[0]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4>Monthly Consumption vs Benchmark</h4>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {monthlyConsumption.map((month, index) => (
                          <div key={index} style={{ 
                            padding: '15px', 
                            borderBottom: '1px solid #eee',
                            marginBottom: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <span style={{ fontWeight: '600' }}>{month.month}</span>
                              <span style={{ 
                                color: month.consumption > month.benchmark ? '#d32f2f' : '#2e7d32',
                                fontWeight: '600'
                              }}>
                                {month.consumption}L / {month.benchmark}L
                              </span>
                            </div>
                            <div style={{ 
                              height: '8px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div 
                                style={{
                                  height: '100%',
                                  backgroundColor: month.consumption > month.benchmark ? '#d32f2f' : '#2e7d32',
                                  width: `${Math.min((month.consumption / month.benchmark) * 100, 100)}%`,
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: '#ed6c02', margin: 0 }}>All Transactions</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        {['Date', 'Driver', 'Vehicle', 'Fuel Store', 'Fuel (L)', 'Cost', 'Type', 'Status'].map(header => (
                          <th key={header} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600' }}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(transaction => (
                        <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{transaction.date.split(',')[0]}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{transaction.driver}</td>
                          <td style={{ padding: '12px' }}>{transaction.vehicle}</td>
                          <td style={{ padding: '12px' }}>{transaction.fuelStore}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{transaction.fuelQuantity}L</td>
                          <td style={{ padding: '12px', color: '#2e7d32', fontWeight: '600' }}>R {transaction.cost}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              backgroundColor: transaction.type === 'Refuel' ? '#e3f2fd' : '#e8f5e8',
                              color: transaction.type === 'Refuel' ? '#1976d2' : '#2e7d32',
                              fontSize: '12px'
                            }}>
                              {transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              backgroundColor: transaction.status === 'Completed' ? '#e8f5e8' : '#fff3e0',
                              color: transaction.status === 'Completed' ? '#2e7d32' : '#ed6c02',
                              fontSize: '12px'
                            }}>
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div>
                <h3 style={{ color: '#ed6c02', marginBottom: '20px' }}>Fuel Consumption Alerts</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {alerts.map(alert => (
                    <div key={alert.id} style={{ 
                      padding: '20px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        alert.severity === 'high' ? '#d32f2f' : 
                        alert.severity === 'medium' ? '#ed6c02' : '#ff9800'
                      }`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{alert.type}</div>
                          <div style={{ color: '#666', marginTop: '5px' }}>
                            {alert.vehicle} • {alert.driver}
                          </div>
                        </div>
                        <span style={{ 
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 
                            alert.severity === 'high' ? '#ffebee' : 
                            alert.severity === 'medium' ? '#fff3e0' : '#e8f5e8',
                          color: 
                            alert.severity === 'high' ? '#d32f2f' : 
                            alert.severity === 'medium' ? '#ed6c02' : '#2e7d32',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: '#666' }}>{alert.message}</p>
                      <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#999' }}>
                        {alert.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Performance Tab */}
            {activeTab === 'team' && (
              <div>
                <h3 style={{ color: '#ed6c02', marginBottom: '20px' }}>Team Performance</h3>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        {['Driver', 'Total Fuel (L)', 'Total Cost (R)', 'Vehicles Used', 'Efficiency (km/L)', 'Alerts'].map(header => (
                          <th key={header} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600' }}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teamPerformance.map((member, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{member.driver}</td>
                          <td style={{ padding: '12px' }}>{member.totalFuel}L</td>
                          <td style={{ padding: '12px', color: '#2e7d32', fontWeight: '600' }}>R {member.totalCost}</td>
                          <td style={{ padding: '12px' }}>{member.vehiclesUsed}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: member.efficiency > 7 ? '#e8f5e8' : '#fff3e0',
                              color: member.efficiency > 7 ? '#2e7d32' : '#ed6c02',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {member.efficiency} km/L
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: member.alerts === 0 ? '#e8f5e8' : '#ffebee',
                              color: member.alerts === 0 ? '#2e7d32' : '#d32f2f',
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

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 style={{ color: '#ed6c02', marginBottom: '20px' }}>Monthly Analytics & Benchmarks</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div>
                    <h4>Monthly Consumption Trends</h4>
                    <div style={{ marginTop: '20px' }}>
                      {monthlyConsumption.map((month, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600' }}>{month.month} 2024</span>
                            <span style={{ fontWeight: '600' }}>
                              {month.consumption}L / {month.benchmark}L
                            </span>
                          </div>
                          <div style={{ display: 'flex', height: '30px', borderRadius: '6px', overflow: 'hidden' }}>
                            <div 
                              style={{
                                flex: month.consumption,
                                backgroundColor: month.consumption <= month.benchmark ? '#4caf50' : '#ff9800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '12px'
                              }}
                            >
                              Actual
                            </div>
                            <div 
                              style={{
                                flex: month.benchmark,
                                backgroundColor: '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666',
                                fontWeight: '600',
                                fontSize: '12px'
                              }}
                            >
                              Benchmark
                            </div>
                          </div>
                          <div style={{ 
                            marginTop: '5px', 
                            fontSize: '12px',
                            color: month.consumption > month.benchmark ? '#d32f2f' : '#2e7d32'
                          }}>
                            {month.consumption > month.benchmark ? 
                              `${(((month.consumption - month.benchmark) / month.benchmark) * 100).toFixed(1)}% above benchmark` :
                              `${(((month.benchmark - month.consumption) / month.benchmark) * 100).toFixed(1)}% below benchmark`
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4>Performance Insights</h4>
                    <div style={{ 
                      backgroundColor: '#e8f5e8',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <h5 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>✅ Positive Trends</h5>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#2e7d32' }}>
                        <li>Average fuel efficiency improved by 8% this quarter</li>
                        <li>3 drivers consistently below consumption benchmarks</li>
                        <li>Maintenance alerts reduced by 15%</li>
                      </ul>
                    </div>
                    <div style={{ 
                      backgroundColor: '#ffebee',
                      padding: '20px',
                      borderRadius: '8px'
                    }}>
                      <h5 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>⚠️ Areas for Improvement</h5>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#d32f2f' }}>
                        <li>2 vehicles showing irregular consumption patterns</li>
                        <li>Heavy equipment fuel usage 12% above target</li>
                        <li>Weekend fuel consumption 25% higher than weekdays</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Quick Actions */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: '#ed6c02', marginBottom: '20px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <button
                onClick={downloadTransactionsCSV}
                style={{
                  padding: '15px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'center'
                }}
              >
                📥 Download CSV Report
              </button>
              
              <button
                onClick={downloadComprehensivePDF}
                style={{
                  padding: '15px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'center'
                }}
              >
                📄 Download PDF Report
              </button>

              <button
                style={{
                  padding: '15px',
                  backgroundColor: '#ed6c02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'center'
                }}
              >
                📧 Email Report
              </button>

              <button
                style={{
                  padding: '15px',
                  backgroundColor: '#7b1fa2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'center'
                }}
              >
                ⚙️ Set Benchmarks
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#ed6c02', marginBottom: '20px' }}>System Status</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                { status: 'Operational', systems: 12, color: '#4caf50' },
                { status: 'Maintenance', systems: 2, color: '#ff9800' },
                { status: 'Offline', systems: 1, color: '#d32f2f' }
              ].map((system, index) => (
                <div key={index} style={{ 
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{system.status}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {system.systems} system{system.systems !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ 
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: system.color
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;