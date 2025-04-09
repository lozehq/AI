/**
 * Data management utility for local storage of users, orders, and services
 * This simulates a database using localStorage for persistence
 */

// 默认用户数据
const defaultUsers = [
  {
    "id": "user_1",
    "name": "用户123456",
    "email": "user@example.com",
    "phone": "13800138000",
    "password": "123456",
    "balance": 500.00,
    "createdAt": "2025-03-15T08:30:00Z"
  }
];

// 默认订单数据
const defaultOrders = [
  {
    "id": "ORD-123456",
    "userId": "user_1",
    "platform": "douyin",
    "platformName": "抖音",
    "date": "2025-04-09",
    "status": "completed",
    "services": {
      "views": 1000,
      "likes": 200
    },
    "progress": 100,
    "price": 140.00,
    "url": "https://v.douyin.com/example1",
    "createdAt": "2025-04-09T10:15:00Z"
  },
  {
    "id": "ORD-123457",
    "userId": "user_1",
    "platform": "xiaohongshu",
    "platformName": "小红书",
    "date": "2025-04-08",
    "status": "in_progress",
    "services": {
      "views": 2000,
      "likes": 300,
      "saves": 100
    },
    "progress": 65,
    "price": 290.00,
    "url": "https://www.xiaohongshu.com/example2",
    "createdAt": "2025-04-08T14:30:00Z"
  },
  {
    "id": "ORD-123458",
    "userId": "user_1",
    "platform": "bilibili",
    "platformName": "哔哩哔哩",
    "date": "2025-04-07",
    "status": "pending",
    "services": {
      "views": 5000,
      "likes": 500,
      "shares": 200
    },
    "progress": 0,
    "price": 670.00,
    "url": "https://www.bilibili.com/example3",
    "createdAt": "2025-04-07T09:45:00Z"
  }
];

// 默认服务价格数据
const defaultServices = {
  views: { price: 0.1, name: '播放量' },
  likes: { price: 0.2, name: '点赞数' },
  completionRate: { price: 0.3, name: '完播率' },
  shares: { price: 0.2, name: '分享数' },
  saves: { price: 0.2, name: '收藏量' },
  comments: { price: 0.3, name: '评论数' },
  coins: { price: 0.3, name: '投币数' },
  reads: { price: 0.1, name: '阅读量' }
};

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
