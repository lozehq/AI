/**
 * Data management utility for local storage of users, orders, and services
 * This simulates a database using localStorage for persistence
 */

// 默认用户数据
const defaultUsers = [];

// 默认订单数据
const defaultOrders = [];

// 默认服务价格数据
const defaultServices = {};

// Initialize local storage with default data if not exists
const initializeStorage = () => {
  // Users data
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }

  // Orders data
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(defaultOrders));
  }

  // Services pricing data
  if (!localStorage.getItem('services')) {
    localStorage.setItem('services', JSON.stringify(defaultServices));
  }
};

// Initialize on module load
initializeStorage();

/**
 * User related functions
 */
export const userManager = {
  // Get all users
  getAllUsers: () => {
    return JSON.parse(localStorage.getItem('users') || '[]');
  },

  // Get user by ID
  getUserById: (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.id === userId) || null;
  },

  // Create new user
  createUser: (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newUser = {
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      balance: 0,
      ...userData
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  },

  // Update user
  updateUser: (userId, userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return null;
    }

    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    return updatedUser;
  },

  // Update user balance
  updateBalance: (userId, amount) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return null;
    }

    users[userIndex].balance += amount;
    localStorage.setItem('users', JSON.stringify(users));
    return users[userIndex];
  }
};

/**
 * Order related functions
 */
export const orderManager = {
  // Get all orders
  getAllOrders: () => {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  },

  // Get orders by user ID
  getOrdersByUserId: (userId) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.filter(order => order.userId === userId);
  },

  // Get order by ID
  getOrderById: (orderId) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.find(order => order.id === orderId) || null;
  },

  // Create new order
  createOrder: (orderData) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 1000000)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      progress: 0,
      ...orderData
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
  },

  // Update order status
  updateOrderStatus: (orderId, status, progress = null) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return null;
    }

    orders[orderIndex].status = status;
    if (progress !== null) {
      orders[orderIndex].progress = progress;
    }

    localStorage.setItem('orders', JSON.stringify(orders));
    return orders[orderIndex];
  }
};

/**
 * Service related functions
 */
export const serviceManager = {
  // Get all services with pricing
  getAllServices: () => {
    return JSON.parse(localStorage.getItem('services') || '{}');
  },

  // Get price for a specific service
  getServicePrice: (serviceKey) => {
    const services = JSON.parse(localStorage.getItem('services') || '{}');
    return services[serviceKey]?.price || 0;
  },

  // Calculate total price for selected services
  calculateTotalPrice: (selectedServices) => {
    const services = JSON.parse(localStorage.getItem('services') || '{}');
    let total = 0;

    for (const [key, amount] of Object.entries(selectedServices)) {
      if (services[key] && amount > 0) {
        total += amount * services[key].price;
      }
    }

    return total;
  }
};
