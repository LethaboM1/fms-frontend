class TransactionService {
  constructor() {
    this.STORAGE_KEY = 'fuelTransactions';
    this.SHIFT_CLOSURES_KEY = 'shiftClosures'; // Add key for shift closures
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

  // Save shift closure
  saveShiftClosure(shiftData, user) {
    const shiftClosure = {
      ...shiftData,
      id: `shift_closure_${Date.now()}_${user.id}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      userStation: user.station || 'Main Station',
      closureType: 'SHIFT_END',
      status: 'COMPLETED'
    };

    // Get existing closures
    const existingClosures = this.getAllShiftClosures();
    
    // Add new closure
    const updatedClosures = [shiftClosure, ...existingClosures];
    
    // Save to localStorage
    localStorage.setItem(this.SHIFT_CLOSURES_KEY, JSON.stringify(updatedClosures));
    
    // Also save as a transaction for reporting
    this.saveTransaction({
      plantNumber: shiftData.plantNumber,
      plantName: shiftData.plantName,
      plantType: shiftData.plantType,
      fuelQuantity: 0,
      fuelStore: 'SHIFT_CLOSURE',
      odometerKilos: shiftData.endOdometerKilos,
      odometerHours: shiftData.endOdometerHours,
      transactionType: 'Shift Closure',
      contractType: 'Internal',
      receiverName: user.fullName,
      receiverCompany: user.company,
      employmentNumber: user.employeeNumber,
      transactionDate: new Date().toISOString().split('T')[0],
      remarks: `SHIFT CLOSED: ${shiftData.closingRemarks || 'No remarks'} | Breakdowns: ${shiftData.totalBreakdownHours || 0}h | Duration: ${shiftData.duration || 'N/A'}`,
      shiftStatus: 'SHIFT_ENDED',
      shiftId: shiftData.id,
      driverName: user.fullName,
      signature: shiftData.signature,
      breakdownFlag: (shiftData.breakdowns && shiftData.breakdowns.length > 0),
      isShiftClosure: true,
      originalShiftClosureId: shiftClosure.id
    }, user);
    
    return shiftClosure;
  }

  // Get all shift closures
  getAllShiftClosures() {
    return JSON.parse(localStorage.getItem(this.SHIFT_CLOSURES_KEY) || '[]');
  }

  // Get shift closures by driver
  getShiftClosuresByDriver(driverId) {
    const closures = this.getAllShiftClosures();
    return closures.filter(closure => closure.userId === driverId);
  }

  // Get shift closures by date range
  getShiftClosuresByDateRange(startDate, endDate) {
    const closures = this.getAllShiftClosures();
    return closures.filter(c => {
      const closureDate = new Date(c.timestamp || c.endTime);
      return closureDate >= new Date(startDate) && closureDate <= new Date(endDate);
    });
  }

  // Get all transactions (existing method)
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
    const shiftClosures = this.getAllShiftClosures();
    
    const totalFuel = transactions.reduce((sum, t) => sum + (parseFloat(t.fuelQuantity) || 0), 0);
    const totalTransactions = transactions.length;
    const totalShifts = shiftClosures.length;
    
    // Calculate total breakdown hours from all shifts
    const totalBreakdownHours = shiftClosures.reduce((sum, c) => sum + (parseFloat(c.totalBreakdownHours) || 0), 0);
    
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
      totalShifts,
      totalBreakdownHours: totalBreakdownHours.toFixed(1),
      roleStats: roleStatsArray
    };
  }

  // Clear all transactions (for testing)
  clearAllTransactions() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SHIFT_CLOSURES_KEY);
  }

  // Export all data for backup
  exportAllData() {
    return {
      transactions: this.getAllTransactions(),
      shiftClosures: this.getAllShiftClosures(),
      exportedAt: new Date().toISOString()
    };
  }

  // Import data from backup
  importAllData(data) {
    if (data.transactions) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.transactions));
    }
    if (data.shiftClosures) {
      localStorage.setItem(this.SHIFT_CLOSURES_KEY, JSON.stringify(data.shiftClosures));
    }
  }
}

const transactionService = new TransactionService();
export default transactionService;
