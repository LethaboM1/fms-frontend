import React, { useState, useEffect } from 'react';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  // Load transactions from localStorage
  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('fuelTransactions') || '[]');
    setTransactions(savedTransactions);
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.fuelStoreCategory === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#2e7d32';
      case 'pending': return '#ed6c02';
      case 'flagged': return '#d32f2f';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Transaction History</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="all">All Transactions</option>
          <option value="service_trucks">Service Trucks</option>
          <option value="fuel_trailers">Fuel Trailers</option>
          <option value="underground_tanks">Underground Tanks</option>
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No transactions found</p>
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Plant Number</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Quantity</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{formatDate(transaction.transactionDate)}</td>
                  <td style={{ padding: '12px' }}>
                    <strong>{transaction.plantNumber}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{transaction.fuelStoreCategory}</small>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {transaction.quantity} {transaction.stockUnit}
                  </td>
                  <td style={{ padding: '12px' }}>
                    R {parseFloat(transaction.total).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: getStatusColor(transaction.status || 'completed'),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {transaction.status || 'completed'.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;