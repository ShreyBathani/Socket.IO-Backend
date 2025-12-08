// Sales Dashboard Example - Backend Logic

// Static sales data for last 2 months
const initialSalesData = [
  // November 2025
  { id: 1, date: '2025-11-01', product: 'Laptop', category: 'Electronics', amount: 1200, quantity: 2, region: 'North', salesperson: 'John' },
  { id: 2, date: '2025-11-02', product: 'Phone', category: 'Electronics', amount: 800, quantity: 1, region: 'South', salesperson: 'Sarah' },
  { id: 3, date: '2025-11-03', product: 'Tablet', category: 'Electronics', amount: 600, quantity: 3, region: 'East', salesperson: 'Mike' },
  { id: 4, date: '2025-11-05', product: 'Headphones', category: 'Accessories', amount: 150, quantity: 5, region: 'West', salesperson: 'John' },
  { id: 5, date: '2025-11-07', product: 'Monitor', category: 'Electronics', amount: 400, quantity: 2, region: 'North', salesperson: 'Sarah' },
  { id: 6, date: '2025-11-10', product: 'Keyboard', category: 'Accessories', amount: 100, quantity: 4, region: 'South', salesperson: 'Mike' },
  { id: 7, date: '2025-11-12', product: 'Mouse', category: 'Accessories', amount: 50, quantity: 8, region: 'East', salesperson: 'John' },
  { id: 8, date: '2025-11-15', product: 'Laptop', category: 'Electronics', amount: 2400, quantity: 2, region: 'West', salesperson: 'Sarah' },
  { id: 9, date: '2025-11-18', product: 'Phone', category: 'Electronics', amount: 1600, quantity: 2, region: 'North', salesperson: 'Mike' },
  { id: 10, date: '2025-11-20', product: 'Tablet', category: 'Electronics', amount: 800, quantity: 4, region: 'South', salesperson: 'John' },
  { id: 11, date: '2025-11-22', product: 'Headphones', category: 'Accessories', amount: 200, quantity: 10, region: 'East', salesperson: 'Sarah' },
  { id: 12, date: '2025-11-25', product: 'Monitor', category: 'Electronics', amount: 600, quantity: 3, region: 'West', salesperson: 'Mike' },
  { id: 13, date: '2025-11-28', product: 'Keyboard', category: 'Accessories', amount: 150, quantity: 6, region: 'North', salesperson: 'John' },
  
  // December 2025
  { id: 14, date: '2025-12-01', product: 'Laptop', category: 'Electronics', amount: 1800, quantity: 3, region: 'South', salesperson: 'Sarah' },
  { id: 15, date: '2025-12-03', product: 'Phone', category: 'Electronics', amount: 1200, quantity: 3, region: 'East', salesperson: 'Mike' },
  { id: 16, date: '2025-12-05', product: 'Tablet', category: 'Electronics', amount: 400, quantity: 2, region: 'West', salesperson: 'John' },
  { id: 17, date: '2025-12-07', product: 'Headphones', category: 'Accessories', amount: 180, quantity: 6, region: 'North', salesperson: 'Sarah' },
  { id: 18, date: '2025-12-08', product: 'Monitor', category: 'Electronics', amount: 800, quantity: 4, region: 'South', salesperson: 'Mike' },
];

let salesData = [...initialSalesData];
let nextId = salesData.length + 1;

// Calculate dashboard metrics
const calculateMetrics = () => {
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = salesData.length;
  const totalQuantity = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  // Sales by category
  const categoryData = {};
  salesData.forEach(sale => {
    if (!categoryData[sale.category]) {
      categoryData[sale.category] = 0;
    }
    categoryData[sale.category] += sale.amount;
  });

  // Sales by region
  const regionData = {};
  salesData.forEach(sale => {
    if (!regionData[sale.region]) {
      regionData[sale.region] = 0;
    }
    regionData[sale.region] += sale.amount;
  });

  // Top products
  const productData = {};
  salesData.forEach(sale => {
    if (!productData[sale.product]) {
      productData[sale.product] = { revenue: 0, quantity: 0 };
    }
    productData[sale.product].revenue += sale.amount;
    productData[sale.product].quantity += sale.quantity;
  });

  // Sales trend (daily)
  const trendData = {};
  salesData.forEach(sale => {
    if (!trendData[sale.date]) {
      trendData[sale.date] = 0;
    }
    trendData[sale.date] += sale.amount;
  });

  // Top salespeople
  const salespersonData = {};
  salesData.forEach(sale => {
    if (!salespersonData[sale.salesperson]) {
      salespersonData[sale.salesperson] = { revenue: 0, orders: 0 };
    }
    salespersonData[sale.salesperson].revenue += sale.amount;
    salespersonData[sale.salesperson].orders += 1;
  });

  return {
    kpis: {
      totalRevenue,
      totalOrders,
      totalQuantity,
      avgOrderValue: Math.round(avgOrderValue),
    },
    charts: {
      categoryData,
      regionData,
      productData,
      trendData,
      salespersonData,
    },
    recentSales: salesData.slice(-10).reverse(), // Last 10 sales
  };
};

const salesDashboardHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('📊 Sales Dashboard: User connected');

    // Send initial dashboard data
    socket.emit('dashboardData', calculateMetrics());

    // Handle explicit request for dashboard data (for route navigation)
    socket.on('getDashboardData', () => {
      console.log('📊 Dashboard data requested');
      socket.emit('dashboardData', calculateMetrics());
    });

    // Handle new sale submission
    socket.on('newSale', (saleData) => {
      const newSale = {
        id: nextId++,
        date: new Date().toISOString().split('T')[0],
        product: saleData.product,
        category: saleData.category,
        amount: parseFloat(saleData.amount),
        quantity: parseInt(saleData.quantity),
        region: saleData.region,
        salesperson: saleData.salesperson,
      };

      salesData.push(newSale);
      console.log('💰 New sale added:', newSale);

      // Broadcast updated dashboard to ALL connected users
      const updatedMetrics = calculateMetrics();
      io.emit('dashboardData', updatedMetrics);
      
      // Send confirmation to submitter
      socket.emit('saleSubmitted', { success: true, sale: newSale });
    });

    // Handle reset request
    socket.on('resetDashboard', () => {
      salesData = [...initialSalesData];
      nextId = salesData.length + 1;
      console.log('🔄 Dashboard reset to initial data');
      
      io.emit('dashboardData', calculateMetrics());
    });
  });
};

module.exports = { salesDashboardHandler };
