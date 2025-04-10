// 订单服务 - 管理订单的创建、存储和检索

// 生成唯一的订单ID
const generateOrderId = () => {
  const prefix = 'ORD-';
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
};

// 获取当前时间戳
const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

// 计算订单总价
const calculateOrderTotal = (services) => {
  const pricing = {
    likes: 0.001, // 点赞单价
    views: 0.0005, // 播放量单价
    comments: 0.002, // 评论单价
    shares: 0.002, // 分享单价
    followers: 0.005, // 粉丝单价
    completionRate: 0.01, // 完播率单价 (每百分比)
  };

  let total = 0;
  for (const [key, value] of Object.entries(services)) {
    if (value > 0 && pricing[key]) {
      total += value * pricing[key];
    }
  }

  return parseFloat(total.toFixed(2));
};

// 创建新订单
const createOrder = (platform, services, videoUrl) => {
  const orderId = generateOrderId();
  const timestamp = getCurrentTimestamp();
  const totalAmount = calculateOrderTotal(services);

  // 计算总数量
  const totalQuantity = Object.values(services).reduce((sum, value) => sum + value, 0);

  // 创建订单对象
  const order = {
    orderId,
    timestamp,
    platform,
    services,
    videoUrl,
    totalAmount,
    status: 'waiting', // 等待处理
    progress: 0,
    totalQuantity,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // 保存到本地存储
  saveOrder(order);

  return order;
};

// 保存订单到本地存储
const saveOrder = (order) => {
  try {
    // 获取现有订单
    const existingOrders = getOrders();

    // 添加新订单
    existingOrders.push(order);

    // 保存回本地存储
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    return true;
  } catch (error) {
    console.error('保存订单失败:', error);
    return false;
  }
};

// 获取所有订单
const getOrders = () => {
  try {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('获取订单失败:', error);
    return [];
  }
};

// 获取单个订单
const getOrderById = (orderId) => {
  const orders = getOrders();
  return orders.find(order => order.orderId === orderId);
};

// 更新订单状态
const updateOrderStatus = (orderId, status, progress = null) => {
  try {
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.orderId === orderId);

    if (orderIndex === -1) {
      return false;
    }

    // 更新状态
    orders[orderIndex].status = status;

    // 如果提供了进度，也更新进度
    if (progress !== null) {
      orders[orderIndex].progress = progress;
    }

    // 更新时间戳
    orders[orderIndex].updatedAt = getCurrentTimestamp();

    // 保存回本地存储
    localStorage.setItem('orders', JSON.stringify(orders));

    return true;
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return false;
  }
};

// 删除订单
const deleteOrder = (orderId) => {
  try {
    let orders = getOrders();
    orders = orders.filter(order => order.orderId !== orderId);

    // 保存回本地存储
    localStorage.setItem('orders', JSON.stringify(orders));

    return true;
  } catch (error) {
    console.error('删除订单失败:', error);
    return false;
  }
};

// 模拟订单进度更新（在实际应用中，这将由后端服务处理）
const simulateOrderProgress = (orderId, callback) => {
  const order = getOrderById(orderId);

  if (!order || order.status === 'completed' || order.status === 'cancelled') {
    return;
  }

  // 更新订单状态为"处理中"
  updateOrderStatus(orderId, 'processing', 0);

  // 设置初始进度
  let progress = 0;

  // 创建一个间隔，模拟进度更新
  const interval = setInterval(() => {
    // 随机增加进度
    progress += Math.random() * 10;

    // 确保不超过100%
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      // 更新订单状态为"已完成"
      updateOrderStatus(orderId, 'completed', 100);
    } else {
      // 更新进度
      updateOrderStatus(orderId, 'processing', Math.floor(progress));
    }

    // 如果提供了回调，调用它
    if (callback) {
      callback(getOrderById(orderId));
    }
  }, 3000); // 每3秒更新一次

  return interval;
};

// 获取订单状态的中文描述
const getStatusText = (status) => {
  const statusMap = {
    'waiting': '待处理',
    'processing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消',
    'pending': '待处理',
    'in_progress': '进行中'
  };

  return statusMap[status] || status;
};

// 导出所有函数
export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  simulateOrderProgress,
  calculateOrderTotal,
  getStatusText
};
