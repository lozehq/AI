/**
 * 状态验证工具 - 用于检查和修复应用状态
 * 
 * 这个文件提供了一个状态验证功能，可以在应用启动时自动检查和修复状态。
 * 它会检查本地存储、会话存储和全局变量的一致性，并在发现问题时进行修复。
 */

// 检查令牌和用户信息的一致性
const validateAuthState = () => {
  console.log('检查认证状态一致性...');
  
  const token = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('current_user');
  
  // 检查令牌和用户信息是否同时存在或同时不存在
  if ((token && !userJson) || (!token && userJson)) {
    console.warn('认证状态不一致: 令牌和用户信息不匹配');
    
    // 如果只有令牌但没有用户信息，清除令牌
    if (token && !userJson) {
      console.log('清除孤立的令牌');
      localStorage.removeItem('auth_token');
    }
    
    // 如果只有用户信息但没有令牌，清除用户信息
    if (!token && userJson) {
      console.log('清除孤立的用户信息');
      localStorage.removeItem('current_user');
    }
    
    return false;
  }
  
  // 如果有用户信息，检查其是否为有效的JSON
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (!user || typeof user !== 'object' || !user.id) {
        console.warn('用户信息无效:', user);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        return false;
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      return false;
    }
  }
  
  return true;
};

// 检查离线模式状态的一致性
const validateOfflineMode = () => {
  console.log('检查离线模式状态一致性...');
  
  // 如果全局变量未定义，初始化为false
  if (typeof window.isOfflineMode === 'undefined') {
    console.log('初始化离线模式状态为false');
    window.isOfflineMode = false;
  }
  
  return true;
};

// 检查IndexedDB是否可用
const validateIndexedDB = () => {
  console.log('检查IndexedDB可用性...');
  
  if (!window.indexedDB) {
    console.warn('IndexedDB不可用');
    return false;
  }
  
  return true;
};

// 主验证函数
export const validateAppState = async () => {
  console.log('开始验证应用状态...');
  
  const authStateValid = validateAuthState();
  const offlineModeValid = validateOfflineMode();
  const indexedDBValid = validateIndexedDB();
  
  console.log('应用状态验证结果:', {
    authStateValid,
    offlineModeValid,
    indexedDBValid
  });
  
  return authStateValid && offlineModeValid && indexedDBValid;
};

// 自动执行状态验证
const autoValidateState = async () => {
  try {
    await validateAppState();
  } catch (error) {
    console.error('自动状态验证失败:', error);
  }
};

// 在应用启动时自动执行状态验证
setTimeout(autoValidateState, 0);

export default validateAppState;
