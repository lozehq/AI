/**
 * 认证状态修复工具 - 用于修复登录/退出问题
 * 
 * 这个文件提供了一系列工具函数，用于修复登录/退出过程中可能出现的问题。
 * 它可以检测和修复认证状态不一致的情况，并提供紧急登录和退出功能。
 */

// 检查认证状态是否一致
export const checkAuthState = () => {
  console.log('检查认证状态一致性...');
  
  const token = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('current_user');
  
  // 检查令牌和用户信息是否同时存在或同时不存在
  if ((token && !userJson) || (!token && userJson)) {
    console.warn('认证状态不一致: 令牌和用户信息不匹配');
    return false;
  }
  
  // 如果有用户信息，检查其是否为有效的JSON
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (!user || typeof user !== 'object' || !user.id) {
        console.warn('用户信息无效:', user);
        return false;
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return false;
    }
  }
  
  return true;
};

// 修复认证状态
export const fixAuthState = () => {
  console.log('修复认证状态...');
  
  const token = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('current_user');
  
  // 如果只有令牌但没有用户信息，清除令牌
  if (token && !userJson) {
    console.log('清除孤立的令牌');
    localStorage.removeItem('auth_token');
    return true;
  }
  
  // 如果只有用户信息但没有令牌，清除用户信息
  if (!token && userJson) {
    console.log('清除孤立的用户信息');
    localStorage.removeItem('current_user');
    return true;
  }
  
  // 如果有用户信息，检查其是否为有效的JSON
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (!user || typeof user !== 'object' || !user.id) {
        console.warn('用户信息无效，清除认证状态');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        return true;
      }
    } catch (error) {
      console.error('解析用户信息失败，清除认证状态');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      return true;
    }
  }
  
  return false; // 没有需要修复的问题
};

// 强制退出登录
export const forceLogout = () => {
  console.log('强制退出登录...');
  
  // 清除所有本地存储
  localStorage.clear();
  sessionStorage.clear();
  
  // 重置离线模式状态
  window.isOfflineMode = false;
  
  // 尝试清除 IndexedDB 中的会话数据
  try {
    const request = indexedDB.deleteDatabase('AICommunityDB');
    request.onsuccess = () => console.log('IndexedDB 数据库已删除');
    request.onerror = () => console.error('IndexedDB 数据库删除失败');
  } catch (dbError) {
    console.error('删除 IndexedDB 数据库失败:', dbError);
  }
  
  // 清除所有 cookie
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  });
  
  return true;
};

// 强制登录为管理员
export const forceAdminLogin = () => {
  console.log('强制登录为管理员...');
  
  // 先强制退出
  forceLogout();
  
  // 等待短暂时间确保清除操作完成
  setTimeout(() => {
    try {
      // 创建管理员用户
      const adminUser = {
        id: 'admin_emergency_' + Date.now(),  // 添加时间戳避免冲突
        name: 'admin',
        email: 'admin@example.com',
        isAdmin: true,
        balance: 1000,
        createdAt: new Date().toISOString()
      };
      
      // 生成离线令牌
      const token = `offline_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // 存储到本地
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(adminUser));
      
      // 设置离线模式
      window.isOfflineMode = true;
      
      console.log('强制登录成功');
      
      // 刷新页面
      window.location.replace(window.location.origin + '/dashboard?t=' + new Date().getTime());
    } catch (error) {
      console.error('强制登录失败:', error);
      alert('强制登录失败，将尝试刷新页面');
      window.location.reload(true);
    }
  }, 500);
};

// 自动修复认证状态
export const autoFixAuthState = () => {
  if (!checkAuthState()) {
    console.log('检测到认证状态不一致，自动修复...');
    return fixAuthState();
  }
  return false;
};

// 添加到全局对象，以便可以从控制台调用
window.authFixer = {
  checkAuthState,
  fixAuthState,
  forceLogout,
  forceAdminLogin,
  autoFixAuthState
};

// 在页面加载时自动检查和修复认证状态
setTimeout(autoFixAuthState, 0);

export default {
  checkAuthState,
  fixAuthState,
  forceLogout,
  forceAdminLogin,
  autoFixAuthState
};
