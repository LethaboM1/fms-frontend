import React, { useState, useEffect } from 'react';

const ReportingDashboard = ({ user, apiService }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const transactions = await apiService.getTransactions();
      generateReports(transactions);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReports = (transactions) => {
    // Generate mock reports from transactions
    const fuelConsumption = transactions.reduce((acc, transaction) => {
      const fuelType = transaction.stockItem || 'Unknown';
      if (!acc[fuelType]) {
        acc[fuelType] = { total: 0, count: 0 };
      }
      acc[fuelType].total += parseFloat(transaction.quantity) || 0;
      acc[fuelType].count += 1;
      return acc;
    }, {});

    const revenueReport = transactions.reduce((acc, transaction) => {
      const date = transaction.transactionDate;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(transaction.total) || 0;
      return acc;
    }, {});

    setReports([
      {
        id: 1,
        title: 'Fuel Consumption Summary',
        type: 'consumption',
        data: fuelConsumption,
        chartType: 'bar'
      },
      {
        id: 2,
        title: 'Revenue Report',
        type: 'revenue',
        data: revenueReport,
        chartType: 'line'
      }
    ]);
  };

  const renderChart = (report) => {
    // Simple chart rendering - in real app, use a charting library
    const dataEntries = Object.entries(report.data);
    if (dataEntries.length === 0) return null;

    const maxValue = Math.max(...dataEntries.map(([_, value]) => 
      value.total || value
    ));

    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '10px', marginTop: '20px' }}>
        {dataEntries.map(([key, value], index) => {
          const chartValue = value.total || value;
          const height = maxValue > 0 ? (chartValue / maxValue) * 150 : 0;
          
          return (
            <div key={key} style={{ textAlign: 'center', flex: 1 }}>
              <div
                style={{
                  height: `${height}px`,
                  backgroundColor: `hsl(${index * 40}, 70%, 50%)`,
                  borderRadius: '4px 4px 0 0'
                }}
              />
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                {key}
              </div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                {chartValue.toFixed(1)}L
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#0288d1', marginBottom: '20px' }}>Reporting Dashboard</h2>
      
      {/* Date Range Filter */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>From:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>To:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <button
          onClick={loadReports}
          disabled={loading}
          style={{
            padding: '8px 15px',
            backgroundColor: loading ? '#ccc' : '#0288d1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Reports Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {reports.map(report => (
          <div 
            key={report.id}
            style={{ 
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>{report.title}</h3>
            
            {renderChart(report)}
            
            <div style={{ marginTop: '20px', fontSize: '14px' }}>
              <strong>Summary:</strong>
              <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                {Object.entries(report.data).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value.total ? value.total.toFixed(2) : value.toFixed(2)}
                    {report.type === 'consumption' && 'L'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No report data available for the selected period
        </div>
      )}
    </div>
  );
};

export default ReportingDashboard;