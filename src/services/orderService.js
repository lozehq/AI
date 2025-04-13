// 订单服务 - 管理订单的创建、存储和检索
import { transactionManager, TRANSACTION_TYPES } from '../utils/transactionManager';

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
  // 从 localStorage 中获取服务价格
  let pricing = {};
  try {
    const servicesData = localStorage.getItem('services');
    if (servicesData) {
      const servicesObj = JSON.parse(servicesData);
      Object.keys(servicesObj).forEach(key => {
        pricing[key] = servicesObj[key].price;
      });
    }
  } catch (error) {
    console.error('获取服务价格失败:', error);
    // 默认价格
    pricing = {
      likes: 0.1,
      views: 0.1,
      comments: 0.1,
      shares: 0.1,
      followers: 0.1,
      completionRate: 0.1,
      saves: 0.1,
      coins: 0.1,
      reads: 0.1
    };
  }

  let total = 0;
  for (const [key, value] of Object.entries(services)) {
    if (value > 0 && pricing[key]) {
      total += value * pricing[key];
    }
  }

  return parseFloat(total.toFixed(2));
};

// 创建新订单
const createOrder = (platform, services, videoUrl, userId) => {
  try {
    // 验证参数
    if (!platform) {
      throw new Error('平台不能为空');
    }

    if (!services || typeof services !== 'object' || Object.keys(services).length === 0) {
      throw new Error('服务项不能为空');
    }

    if (!videoUrl) {
      throw new Error('视频链接不能为空');
    }

    if (!userId) {
      throw new Error('用户ID不能为空');
    }

    // 检查是否有有效的服务项
    const hasValidServices = Object.values(services).some(value => value > 0);
    if (!hasValidServices) {
      throw new Error('至少需要选择一项服务');
    }

    const orderId = generateOrderId();
    const timestamp = getCurrentTimestamp();
    const totalAmount = calculateOrderTotal(services);

    // 计算总数量
    const totalQuantity = Object.values(services).reduce((sum, value) => sum + value, 0);

    // 检查用户余额
    try {
      const userDataStr = localStorage.getItem('currentUser');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData.balance < totalAmount) {
          throw new Error(`账户余额不足，当前余额：￥${userData.balance?.toFixed(2) || '0.00'}，需要：￥${totalAmount.toFixed(2)}`);
        }
      }
    } catch (balanceError) {
      console.error('检查用户余额失败:', balanceError);
      // 如果是余额不足的错误，则向上抛出
      if (balanceError.message && balanceError.message.includes('账户余额不足')) {
        throw balanceError;
      }
      // 其他错误继续执行，不阻止订单创建
    }

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
      userId // 添加用户ID
    };

    // 保存到本地存储
    const saveResult = saveOrder(order);

    if (!saveResult) {
      throw new Error('保存订单失败');
    }

    // 创建消费交易记录
    if (userId) {
      // 生成服务项描述
      const serviceDesc = Object.entries(services)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => {
          const serviceNames = {
            views: '播放量',
            likes: '点赞数',
            shares: '分享数',
            comments: '评论数',
            followers: '粉丝数',
            completionRate: '完播率',
            saves: '收藏量',
            coins: '投币数',
            reads: '阅读量'
          };
          return `${serviceNames[key] || key}: ${value}`;
        })
        .join(', ');

      // 创建交易记录
      try {
        transactionManager.createTransaction(
          userId,
          -totalAmount, // 负数表示支出
          TRANSACTION_TYPES.CONSUMPTION,
          `购买服务: ${platform} (${serviceDesc})`,
          orderId
        );
      } catch (transactionError) {
        console.error('创建交易记录失败:', transactionError);
        // 交易记录创建失败不应该阻止订单创建
      }

      // 更新用户余额
      try {
        const userDataStr = localStorage.getItem('currentUser');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          userData.balance = (userData.balance || 0) - totalAmount;
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
      } catch (updateBalanceError) {
        console.error('更新用户余额失败:', updateBalanceError);
        // 更新余额失败不应该阻止订单创建
      }
    }

    return order;
  } catch (error) {
    console.error('创建订单失败:', error);
    throw error; // 将错误向上抛出，以便调用者可以处理
  }
};

// 保存订单到本地存储
const saveOrder = (order) => {
  try {
    // 验证订单对象
    if (!order || typeof order !== 'object') {
      throw new Error('无效的订单对象');
    }

    if (!order.orderId) {
      throw new Error('订单ID不能为空');
    }

    // 获取现有订单
    const existingOrders = getOrders();

    // 检查是否已存在相同订单ID
    const isDuplicate = existingOrders.some(existingOrder =>
      existingOrder.orderId === order.orderId || existingOrder.id === order.orderId
    );

    if (isDuplicate) {
      console.warn('订单ID重复:', order.orderId);
      // 生成新的订单ID
      order.orderId = generateOrderId();
    }

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
    if (!orders) {
      return [];
    }

    try {
      const parsedOrders = JSON.parse(orders);

      // 验证是否为数组
      if (!Array.isArray(parsedOrders)) {
        console.error('订单数据不是数组格式');
        return [];
      }

      // 过滤无效的订单
      return parsedOrders.filter(order => {
        if (!order || typeof order !== 'object') {
          return false;
        }
        // 至少要有订单ID或id字段
        return order.orderId || order.id;
      });
    } catch (parseError) {
      console.error('解析订单数据失败:', parseError);
      // 如果解析失败，清除损坏的数据
      localStorage.removeItem('orders');
      return [];
    }
  } catch (error) {
    console.error('获取订单失败:', error);
    return [];
  }
};

// 获取单个订单
const getOrderById = (orderId) => {
  try {
    if (!orderId) {
      console.error('订单ID不能为空');
      return null;
    }

    const orders = getOrders();

    // 先尝试用orderId字段查找
    let order = orders.find(order => order.orderId === orderId);

    // 如果没找到，尝试用id字段查找
    if (!order) {
      order = orders.find(order => order.id === orderId);
    }

    return order || null;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return null;
  }
};

// 更新订单状态
const updateOrderStatus = (orderId, status, progress = null) => {
  try {
    // 验证参数
    if (!orderId) {
      console.error('订单ID不能为空');
      return false;
    }

    if (!status) {
      console.error('状态不能为空');
      return false;
    }

    // 验证状态是否有效
    const validStatuses = ['waiting', 'processing', 'completed', 'cancelled', 'pending', 'in_progress'];
    if (!validStatuses.includes(status)) {
      console.error('无效的订单状态:', status);
      return false;
    }

    // 验证进度是否有效
    if (progress !== null) {
      const progressNum = Number(progress);
      if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        console.error('无效的进度值:', progress);
        return false;
      }
    }

    const orders = getOrders();

    // 先尝试用orderId字段查找
    let orderIndex = orders.findIndex(order => order.orderId === orderId);

    // 如果没找到，尝试用id字段查找
    if (orderIndex === -1) {
      orderIndex = orders.findIndex(order => order.id === orderId);
    }

    if (orderIndex === -1) {
      console.error('未找到订单:', orderId);
      return false;
    }

    // 更新状态
    orders[orderIndex].status = status;

    // 如果提供了进度，也更新进度
    if (progress !== null) {
      orders[orderIndex].progress = Number(progress);
    }

    // 更新时间戳
    orders[orderIndex].updatedAt = getCurrentTimestamp();

    // 保存回本地存储
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (storageError) {
      console.error('保存订单数据失败:', storageError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return false;
  }
};

// 删除订单
const deleteOrder = (orderId) => {
  try {
    // 验证参数
    if (!orderId) {
      console.error('订单ID不能为空');
      return false;
    }

    let orders = getOrders();

    // 检查订单是否存在
    const orderExists = orders.some(order =>
      order.orderId === orderId || order.id === orderId
    );

    if (!orderExists) {
      console.warn('要删除的订单不存在:', orderId);
      return true; // 如果订单不存在，也返回true，因为结果上订单已经不存在了
    }

    // 过滤掉要删除的订单
    orders = orders.filter(order =>
      order.orderId !== orderId && order.id !== orderId
    );

    // 保存回本地存储
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (storageError) {
      console.error('保存订单数据失败:', storageError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('删除订单失败:', error);
    return false;
  }
};

// 模拟订单进度更新（在实际应用中，这将由后端服务处理）
const simulateOrderProgress = (orderId, callback) => {
  try {
    // 验证参数
    if (!orderId) {
      console.error('订单ID不能为空');
      return null;
    }

    const order = getOrderById(orderId);

    if (!order) {
      console.error('未找到订单:', orderId);
      return null;
    }

    // 检查订单状态
    if (order.status === 'completed' || order.status === 'cancelled') {
      console.warn('订单已完成或已取消，无法模拟进度:', orderId);
      return null;
    }

    // 更新订单状态为"处理中"
    const updateResult = updateOrderStatus(orderId, 'processing', 0);

    if (!updateResult) {
      console.error('更新订单状态失败:', orderId);
      return null;
    }

    // 设置初始进度
    let progress = 0;

    // 创建一个间隔，模拟进度更新
    const interval = setInterval(() => {
      try {
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
        if (callback && typeof callback === 'function') {
          const updatedOrder = getOrderById(orderId);
          if (updatedOrder) {
            callback(updatedOrder);
          }
        }
      } catch (intervalError) {
        console.error('模拟进度更新失败:', intervalError);
        clearInterval(interval);
      }
    }, 3000); // 每3秒更新一次

    return interval;
  } catch (error) {
    console.error('模拟订单进度失败:', error);
    return null;
  }
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
