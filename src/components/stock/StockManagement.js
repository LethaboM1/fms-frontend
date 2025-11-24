import React, { useState, useEffect } from 'react';

const StockManagement = ({ user, stockData, apiService, onStockUpdate }) => {
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');

  useEffect(() => {
    if (stockData) {
      const allStock = Object.values(stockData).flat();
      setStockLevels(allStock);
    }
  }, [stockData]);

  const updateStockLevel = async (plantId, newStock) => {
    setLoading(true);
    try {
      await apiService.updateStock({ plantId, newStock });
      // Refresh stock data
      const updatedStock = await apiService.getStockData();
      onStockUpdate(updatedStock);
      alert('Stock level updated successfully!');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock level');
    } finally {
      setLoading(false);
    }
  };

  const getStockPercentage = (current, capacity) => {
    return (current / capacity) * 100;
  };

  const getStockStatus = (percentage) => {
    if (percentage < 20) return 'critical';
    if (percentage < 50) return 'low';
    if (percentage < 80) return 'medium';
    return 'good';
  };

  const filteredStocks = selectedStore 
    ? stockLevels.filter(stock => stock.id.includes(selectedStore))
    : stockLevels;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#0288d1', marginBottom: '20px' }}>Stock Management</h2>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filter by Store:</label>
          <select 
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Stores</option>
            <option value="FSH">Service Trucks</option>
            <option value="SLD">Fuel Trailers</option>
            <option value="UDT">Underground Tanks</option>
            <option value="UPT">Underground Tanks</option>
            <option value="STD">Underground Tanks</option>
          </select>
        </div>
      </div>

      {/* Stock Levels Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredStocks.map(stock => {
          const percentage = getStockPercentage(stock.currentStock, stock.capacity);
          const status = getStockStatus(percentage);
          
          return (
            <div 
              key={stock.id}
              style={{ 
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{stock.name}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>ID: {stock.id}</p>
              
              {/* Stock Progress Bar */}
              <div style={{ margin: '15px 0' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <span>Stock Level</span>
                  <span>{stock.currentStock} / {stock.capacity}L</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: 
                      status === 'critical' ? '#f44336' :
                      status === 'low' ? '#ff9800' :
                      status === 'medium' ? '#ffeb3b' : '#4caf50',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '5px',
                  fontWeight: 'bold',
                  color: 
                    status === 'critical' ? '#f44336' :
                    status === 'low' ? '#ff9800' :
                    status === 'medium' ? '#ff9800' : '#4caf50'
                }}>
                  {percentage.toFixed(1)}% - {status.toUpperCase()}
                </div>
              </div>

              {/* Update Stock Form */}
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Update Stock Level:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    placeholder="New stock level"
                    style={{ 
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const inputValue = e.target.value;
                        if (inputValue) {
                          updateStockLevel(stock.id, parseFloat(inputValue));
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      const inputValue = input.value;
                      if (inputValue) {
                        updateStockLevel(stock.id, parseFloat(inputValue));
                      }
                    }}
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
                    Update
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStocks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No stock data available
        </div>
      )}
    </div>
  );
};

export default StockManagement;