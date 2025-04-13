/**
 * 数据验证工具
 * 用于验证数据的完整性和安全性
 */

// 验证用户数据
export const validateUser = (userData) => {
  const errors = {};

  // 验证用户名
  if (!userData.name) {
    errors.name = '用户名不能为空';
  } else if (userData.name.length < 2) {
    errors.name = '用户名至少需要2个字符';
  } else if (userData.name.length > 20) {
    errors.name = '用户名不能超过20个字符';
  }

  // 验证邮箱
  if (!userData.email) {
    errors.email = '邮箱不能为空';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.email = '邮箱格式不正确';
  }

  // 验证密码
  if (!userData.password) {
    errors.password = '密码不能为空';
  } else if (userData.password.length < 6) {
    errors.password = '密码至少需要6个字符';
  }

  // 验证手机号
  if (userData.phone && !/^1[3-9]\d{9}$/.test(userData.phone)) {
    errors.phone = '手机号格式不正确';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 验证订单数据
export const validateOrder = (orderData) => {
  const errors = {};

  // 验证用户ID
  if (!orderData.userId) {
    errors.userId = '用户ID不能为空';
  }

  // 验证平台
  if (!orderData.platform) {
    errors.platform = '平台不能为空';
  }

  // 验证URL
  if (!orderData.url) {
    errors.url = 'URL不能为空';
  } else if (!/^https?:\/\//.test(orderData.url)) {
    errors.url = 'URL格式不正确';
  }

  // 验证服务
  if (!orderData.services || Object.keys(orderData.services).length === 0) {
    errors.services = '至少需要选择一项服务';
  } else {
    // 验证每项服务的数量
    for (const [key, value] of Object.entries(orderData.services)) {
      if (isNaN(value) || value <= 0) {
        errors[`services.${key}`] = '服务数量必须大于0';
      }
    }
  }

  // 验证总价
  if (!orderData.totalPrice || orderData.totalPrice <= 0) {
    errors.totalPrice = '订单总价必须大于0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 验证卡密数据
export const validateCardKey = (cardKeyData) => {
  const errors = {};

  // 验证卡密代码
  if (!cardKeyData.code) {
    errors.code = '卡密代码不能为空';
  } else if (cardKeyData.code.length !== 16) {
    errors.code = '卡密代码必须为16位';
  }

  // 验证金额
  if (!cardKeyData.amount || cardKeyData.amount <= 0) {
    errors.amount = '卡密金额必须大于0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 验证交易记录数据
export const validateTransaction = (transactionData) => {
  const errors = {};

  // 验证用户ID
  if (!transactionData.userId) {
    errors.userId = '用户ID不能为空';
  }

  // 验证金额
  if (transactionData.amount === undefined || transactionData.amount === null) {
    errors.amount = '交易金额不能为空';
  }

  // 验证交易类型
  if (!transactionData.type) {
    errors.type = '交易类型不能为空';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 验证服务数据
export const validateService = (serviceData) => {
  const errors = {};

  // 验证服务名称
  if (!serviceData.name) {
    errors.name = '服务名称不能为空';
  }

  // 验证服务价格
  if (!serviceData.price || serviceData.price <= 0) {
    errors.price = '服务价格必须大于0';
  }

  // 验证服务描述
  if (!serviceData.description) {
    errors.description = '服务描述不能为空';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 验证通知数据
export const validateNotification = (notificationData) => {
  const errors = {};

  // 验证标题
  if (!notificationData.title) {
    errors.title = '通知标题不能为空';
  }

  // 验证内容
  if (!notificationData.content) {
    errors.content = '通知内容不能为空';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateUser,
  validateOrder,
  validateCardKey,
  validateTransaction,
  validateService,
  validateNotification
};
