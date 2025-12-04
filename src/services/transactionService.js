class TransactionService {
  constructor() {
    this.STORAGE_KEY = 'fuelTransactions';
  }

  // Save transaction with role information
  saveTransaction(transactionData, user) {
    const transaction = {
      ...transactionData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      userStation: user.station || 'Main Station',
      source: user.role // Using role as source identifier
    };

    // Get existing transactions
    const existingTransactions = this.getAllTransactions();
    
    // Add new transaction
    const updatedTransactions = [transaction, ...existingTransactions];
    
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTransactions));
    
    return transaction;
  }

  // Get all transactions
  getAllTransactions() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  // Get transactions by role
  getTransactionsByRole(role) {
    const transactions = this.getAllTransactions();
    return transactions.filter(t => t.userRole === role);
  }

  // Get transactions by date range
  getTransactionsByDateRange(startDate, endDate) {
    const transactions = this.getAllTransactions();
    return transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate || t.timestamp);
      return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    });
  }

  // Get statistics
  getStatistics() {
    const transactions = this.getAllTransactions();
    
    const totalFuel = transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0);
    const totalTransactions = transactions.length;
    
    // Group by role
    const roleStats = transactions.reduce((acc, t) => {
      const role = t.userRole || 'unknown';
      if (!acc[role]) {
        acc[role] = { count: 0, fuel: 0, users: new Set() };
      }
      acc[role].count++;
      acc[role].fuel += parseFloat(t.fuelQuantity) || 0;
      acc[role].users.add(t.userName);
      return acc;
    }, {});

    // Convert roleStats to array
    const roleStatsArray = Object.entries(roleStats).map(([role, stats]) => ({
      role,
      count: stats.count,
      fuel: stats.fuel.toFixed(0),
      uniqueUsers: stats.users.size,
      percentage: ((stats.count / totalTransactions) * 100).toFixed(1)
    }));

    return {
      totalFuel: totalFuel.toFixed(0),
      totalTransactions,
      roleStats: roleStatsArray
    };
  }

  // Clear all transactions (for testing)
  clearAllTransactions() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

const transactionService = new TransactionService();
export default transactionService;