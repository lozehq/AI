/**
 * Data management utility for storage of users, orders, and services
 * This simulates a database using file storage for persistence
 */

// 导入文件存储服务
import { fileStorage } from './fileStorage';
import validator from './validator';

// 默认用户数据
const defaultUsers = [
  {
    "id": "admin_1",
    "name": "admin",
    "email": "admin@example.com",
    "phone": "13800000000",
    "password": "admin123",
    "balance": 1000.00,
    "isAdmin": true,
    "createdAt": new Date().toISOString()
  }
];

// 默认订单数据
const defaultOrders = [];

// 默认服务价格数据
const defaultServices = {};

// Initialize file storage with default data if not exists
const initializeStorage = async () => {
  // Users data
  const users = await fileStorage.getData('users');
  if (!users) {
    await fileStorage.saveData('users', defaultUsers);
  }

  // Orders data
  const orders = await fileStorage.getData('orders');
  if (!orders) {
    await fileStorage.saveData('orders', defaultOrders);
  }

  // Services pricing data
  const services = await fileStorage.getData('services');
  if (!services) {
    await fileStorage.saveData('services', defaultServices);
  }
};

// 延迟初始化，避免在模块加载时执行
let initialized = false;

const lazyInitialize = async () => {
  if (initialized) return;

  console.log('开始延迟初始化数据存储...');
  await initializeStorage();
  initialized = true;
  console.log('数据存储初始化完成');
};

/**
 * User related functions
 */
export const userManager = {
  // Get all users
  getAllUsers: async () => {
    await lazyInitialize();
    return await fileStorage.getData('users') || [];
  },

  // Get user by ID
  getUserById: async (userId) => {
    await lazyInitialize();
    const users = await fileStorage.getData('users') || [];
    return users.find(user => user.id === userId) || null;
  },

  // Create new user
  createUser: async (userData) => {
    await lazyInitialize();

    // 验证用户数据
    const validation = validator.validateUser(userData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const users = await fileStorage.getData('users') || [];

    // 检查用户名或邮箱是否已存在
    const existingUser = users.find(user =>
      user.name === userData.name ||
      (userData.email && user.email === userData.email)
    );

    if (existingUser) {
      return {
        success: false,
        errors: {
          general: '用户名或邮箱已存在'
        }
      };
    }

    const newUser = {
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      balance: 0,
      isAdmin: false, // 默认非管理员
      ...userData
    };

    users.push(newUser);
    await fileStorage.saveData('users', users);
    return { success: true, user: newUser };
  },

  // Update user
  updateUser: async (userId, userData) => {
    // 验证用户数据（如果包含关键字段）
    if (userData.name || userData.email || userData.password) {
      // 获取当前用户数据，与更新数据合并后验证
      const currentUser = await userManager.getUserById(userId);
      if (!currentUser) {
        return { success: false, errors: { general: '用户不存在' } };
      }

      const dataToValidate = { ...currentUser, ...userData };
      const validation = validator.validateUser(dataToValidate);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      // 检查用户名或邮箱是否已存在（如果要更改）
      if (userData.name || userData.email) {
        const users = await fileStorage.getData('users') || [];
        const existingUser = users.find(user =>
          user.id !== userId && (
            (userData.name && user.name === userData.name) ||
            (userData.email && user.email === userData.email)
          )
        );

        if (existingUser) {
          return {
            success: false,
            errors: {
              general: '用户名或邮箱已存在'
            }
          };
        }
      }
    }

    const users = await fileStorage.getData('users') || [];
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return { success: false, errors: { general: '用户不存在' } };
    }

    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;
    await fileStorage.saveData('users', users);
    return { success: true, user: updatedUser };
  },

  // Update user balance
  updateBalance: async (userId, amount) => {
    // 验证金额
    if (isNaN(amount)) {
      return { success: false, errors: { amount: '金额必须是数字' } };
    }

    const users = await fileStorage.getData('users') || [];
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return { success: false, errors: { general: '用户不存在' } };
    }

    // 如果是扣款，检查余额是否足够
    if (amount < 0 && users[userIndex].balance + amount < 0) {
      return { success: false, errors: { amount: '余额不足' } };
    }

    users[userIndex].balance += amount;
    await fileStorage.saveData('users', users);
    return { success: true, user: users[userIndex] };
  },

  // Check if user is admin
  isAdmin: async (userId) => {
    const users = await fileStorage.getData('users') || [];
    const user = users.find(user => user.id === userId);
    return user ? !!user.isAdmin : false;
  },

  // Get current user
  getCurrentUser: () => {
    try {
      // 使用与 AuthContext 一致的键名 'current_user'
      const currentUser = localStorage.getItem('current_user');
      console.log('dataManager.getCurrentUser 从 localStorage 获取用户:', currentUser);
      return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }
};

/**
 * Order related functions
 */
export const orderManager = {
  // Get all orders
  getAllOrders: async () => {
    await lazyInitialize();
    return await fileStorage.getData('orders') || [];
  },

  // Get orders by user ID
  getOrdersByUserId: async (userId) => {
    const orders = await fileStorage.getData('orders') || [];
    return orders.filter(order => order.userId === userId);
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const orders = await fileStorage.getData('orders') || [];
    return orders.find(order => order.id === orderId) || null;
  },

  // Create new order
  createOrder: async (orderData) => {
    // 验证订单数据
    const validation = validator.validateOrder(orderData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // 验证用户是否存在
    const user = await userManager.getUserById(orderData.userId);
    if (!user) {
      return { success: false, errors: { userId: '用户不存在' } };
    }

    // 验证用户余额是否足够
    if (user.balance < orderData.totalPrice) {
      return { success: false, errors: { totalPrice: '用户余额不足' } };
    }

    const orders = await fileStorage.getData('orders') || [];
    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 1000000)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      progress: 0,
      ...orderData
    };

    // 扣除用户余额
    const balanceResult = await userManager.updateBalance(orderData.userId, -orderData.totalPrice);
    if (!balanceResult.success) {
      return { success: false, errors: balanceResult.errors };
    }

    orders.push(newOrder);
    await fileStorage.saveData('orders', orders);
    return { success: true, order: newOrder };
  },

  // Update order status
  updateOrderStatus: async (orderId, status, progress = null) => {
    // 验证状态
    const validStatuses = ['pending', 'in_progress', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return { success: false, errors: { status: '无效的订单状态' } };
    }

    // 验证进度
    if (progress !== null) {
      if (isNaN(progress) || progress < 0 || progress > 100) {
        return { success: false, errors: { progress: '进度必须是0-100之间的数字' } };
      }
    }

    const orders = await fileStorage.getData('orders') || [];
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return { success: false, errors: { general: '订单不存在' } };
    }

    orders[orderIndex].status = status;
    if (progress !== null) {
      orders[orderIndex].progress = progress;
    }

    // 如果订单完成，设置进度为100%
    if (status === 'completed' && orders[orderIndex].progress !== 100) {
      orders[orderIndex].progress = 100;
    }

    await fileStorage.saveData('orders', orders);
    return { success: true, order: orders[orderIndex] };
  }
};

/**
 * Service related functions
 */
export const serviceManager = {
  // Get all services with pricing
  getAllServices: async () => {
    await lazyInitialize();
    return await fileStorage.getData('services') || {};
  },

  // Get price for a specific service
  getServicePrice: async (serviceKey) => {
    const services = await fileStorage.getData('services') || {};
    return services[serviceKey]?.price || 0;
  },

  // Add or update a service
  addOrUpdateService: async (serviceKey, serviceData) => {
    // 验证服务数据
    const validation = validator.validateService(serviceData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const services = await fileStorage.getData('services') || {};

    // 更新或添加服务
    services[serviceKey] = serviceData;

    await fileStorage.saveData('services', services);
    return { success: true, service: serviceData };
  },

  // 删除服务
  deleteService: async (serviceKey) => {
    const services = await fileStorage.getData('services') || {};

    if (!services[serviceKey]) {
      return { success: false, errors: { general: '服务不存在' } };
    }

    delete services[serviceKey];
    await fileStorage.saveData('services', services);
    return { success: true };
  },

  // Calculate total price for selected services
  calculateTotalPrice: async (selectedServices) => {
    const services = await fileStorage.getData('services') || {};
    let total = 0;

    for (const [key, amount] of Object.entries(selectedServices)) {
      if (services[key] && amount > 0) {
        total += amount * services[key].price;
      }
    }

    return total;
  }
};
