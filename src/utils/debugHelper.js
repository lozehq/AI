/**
 * 调试工具函数
 */

// 打印 localStorage 中的所有数据
export const printLocalStorage = () => {
  console.log('===== localStorage 内容 =====');

  // 用户数据
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('用户数据:', users);
  } catch (error) {
    console.error('解析用户数据失败:', error);
  }

  // 订单数据
  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    console.log('订单数据:', orders);
  } catch (error) {
    console.error('解析订单数据失败:', error);
  }

  // 服务数据
  try {
    const services = JSON.parse(localStorage.getItem('services') || '{}');
    console.log('服务数据:', services);
  } catch (error) {
    console.error('解析服务数据失败:', error);
  }

  // 当前用户
  try {
    const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
    console.log('当前用户 (current_user):', currentUser);

    // 同时检查旧的键名
    const oldCurrentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log('当前用户 (currentUser - 旧键名):', oldCurrentUser);

    // 检查令牌
    const token = localStorage.getItem('auth_token');
    console.log('认证令牌:', token);
  } catch (error) {
    console.error('解析当前用户数据失败:', error);
  }

  console.log('===== localStorage 内容结束 =====');
};

// 重置 localStorage 数据
export const resetLocalStorage = () => {
  localStorage.clear();
  console.log('localStorage 已清空');
};

// 添加管理员用户
export const addAdminUser = () => {
  try {
    const adminUser = {
      "id": "admin_1",
      "name": "admin",
      "email": "admin@example.com",
      "phone": "13800000000",
      "password": "admin123",
      "balance": 1000.00,
      "isAdmin": true,
      "createdAt": new Date().toISOString()
    };

    // 获取现有用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // 检查是否已存在管理员
    const adminExists = users.some(user => user.id === 'admin_1' || (user.name === 'admin' && user.isAdmin));

    if (!adminExists) {
      users.push(adminUser);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('管理员用户已添加');
    } else {
      console.log('管理员用户已存在');
    }

    return adminExists ? '管理员用户已存在' : '管理员用户已添加';
  } catch (error) {
    console.error('添加管理员用户失败:', error);
    return '添加管理员用户失败: ' + error.message;
  }
};

// 直接登录为管理员
export const loginAsAdmin = () => {
  try {
    // 先添加管理员用户
    addAdminUser();

    // 创建管理员用户对象
    const adminUser = {
      "id": "admin_1",
      "name": "admin",
      "email": "admin@example.com",
      "phone": "13800000000",
      "password": "admin123",
      "balance": 1000.00,
      "isAdmin": true,
      "createdAt": new Date().toISOString()
    };

    // 直接将管理员用户存入 localStorage - 使用与 AuthContext 一致的键名
    localStorage.setItem('current_user', JSON.stringify(adminUser));
    localStorage.setItem('auth_token', `token_${Date.now()}`); // 添加令牌

    console.log('已直接登录为管理员用户');
    return '已直接登录为管理员用户，请刷新页面';
  } catch (error) {
    console.error('登录为管理员失败:', error);
    return '登录为管理员失败: ' + error.message;
  }
};
