import apiService from './apiService';
import { fileStorage } from '../utils/fileStorage';

// 认证服务
const authService = {
  // 当前登录的用户
  currentUser: null,
  
  // 登录状态监听器
  listeners: [],
  
  // 初始化认证服务
  init: async () => {
    try {
      // 从服务器获取当前会话
      const session = await apiService.getData('current_session');
      if (session && session.userId) {
        // 获取用户信息
        const users = await fileStorage.getData('users') || [];
        const user = users.find(u => u.id === session.userId);
        
        if (user) {
          // 设置当前用户
          authService.currentUser = user;
          // 通知所有监听器
          authService.notifyListeners();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('初始化认证服务失败:', error);
      return false;
    }
  },
  
  // 登录
  login: async (username, password) => {
    try {
      // 获取所有用户
      const users = await fileStorage.getData('users') || [];
      
      // 查找匹配的用户
      const user = users.find(u => 
        (u.name === username || u.email === username) && 
        u.password === password
      );
      
      if (user) {
        // 创建会话
        const session = {
          id: `session_${Date.now()}`,
          userId: user.id,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
        };
        
        // 保存会话到服务器
        await apiService.saveData('current_session', session);
        
        // 设置当前用户
        authService.currentUser = user;
        
        // 通知所有监听器
        authService.notifyListeners();
        
        return { success: true, user };
      } else {
        return { success: false, message: '用户名或密码错误' };
      }
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, message: '登录失败，请重试' };
    }
  },
  
  // 注销
  logout: async () => {
    try {
      // 删除会话
      await apiService.deleteData('current_session');
      
      // 清除当前用户
      authService.currentUser = null;
      
      // 通知所有监听器
      authService.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('注销失败:', error);
      return false;
    }
  },
  
  // 获取当前用户
  getCurrentUser: () => {
    return authService.currentUser;
  },
  
  // 检查用户是否已登录
  isLoggedIn: () => {
    return !!authService.currentUser;
  },
  
  // 检查用户是否是管理员
  isAdmin: () => {
    return authService.currentUser ? !!authService.currentUser.isAdmin : false;
  },
  
  // 添加登录状态监听器
  addListener: (listener) => {
    authService.listeners.push(listener);
    return () => {
      authService.listeners = authService.listeners.filter(l => l !== listener);
    };
  },
  
  // 通知所有监听器
  notifyListeners: () => {
    for (const listener of authService.listeners) {
      listener(authService.currentUser);
    }
  }
};

// 初始化认证服务
authService.init();

export default authService;
