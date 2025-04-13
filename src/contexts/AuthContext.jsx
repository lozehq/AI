import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/apiService';

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('开始初始化认证状态');

        // 检查是否有令牌
        const token = localStorage.getItem('auth_token');
        console.log('当前令牌:', token);

        // 检查是否有本地存储的用户信息
        const userJson = localStorage.getItem('current_user');
        console.log('本地存储的用户信息:', userJson ? '存在' : '不存在');

        if (!token) {
          console.log('没有令牌，设置未登录状态');
          setLoading(false);
          return;
        }

        // 如果有本地存储的用户信息，先使用它初始化状态
        if (userJson) {
          try {
            const localUser = JSON.parse(userJson);
            console.log('使用本地存储的用户信息初始化状态:', localUser);
            // 确保用户对象有效
            if (localUser && (localUser.id || localUser.name)) {
              setCurrentUser(localUser);
            } else {
              console.warn('本地存储的用户信息无效:', localUser);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('current_user');
            }
          } catch (parseError) {
            console.error('解析本地用户信息失败:', parseError);
            // 清除无效的本地存储
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
          }
        }

        // 尝试从服务器获取最新的用户信息
        try {
          console.log('尝试从服务器获取当前用户信息');
          const response = await apiService.getCurrentUser();
          console.log('从服务器获取当前用户响应:', response);

          if (response.success && response.user) {
            console.log('从服务器获取用户成功，更新当前用户:', response.user);
            setCurrentUser(response.user);
          } else if (!userJson) {
            // 只有在没有本地用户信息的情况下，才清除令牌
            console.log('从服务器获取用户失败，且没有本地用户信息，清除令牌');
            localStorage.removeItem('auth_token');
            setCurrentUser(null);
          }
        } catch (serverError) {
          console.error('从服务器获取用户信息失败:', serverError);
          // 如果服务器请求失败但有本地用户信息，保持当前状态
          if (!userJson) {
            console.log('没有本地用户信息，清除令牌');
            localStorage.removeItem('auth_token');
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        setError('初始化认证状态失败，请重试');

        // 如果出错且没有本地用户信息，清除令牌
        const userJson = localStorage.getItem('current_user');
        if (!userJson) {
          try {
            localStorage.removeItem('auth_token');
          } catch (clearError) {
            console.error('清除令牌失败:', clearError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('开始登录请求，用户名:', username);
      const response = await apiService.login(username, password);
      console.log('登录响应:', response);

      if (response.success && response.user) {
        console.log('登录成功，设置当前用户:', response.user);
        setCurrentUser(response.user);
        return { success: true };
      } else {
        console.log('登录失败:', response.message);
        setError(response.message || '登录失败，请重试');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('登录失败:', error);
      setError('登录失败，请重试');
      return { success: false, message: '登录失败，请重试' };
    } finally {
      setLoading(false);
    }
  };

  // 注销
  const logout = async () => {
    try {
      setLoading(true);
      console.log('开始注销请求');

      // 先手动清除本地存储，确保即使 API 调用失败也能正常注销
      console.log('手动清除本地存储');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('current_user');

      // 重置离线模式状态
      window.isOfflineMode = false;

      // 清除内存中的用户状态
      console.log('清除当前用户状态');
      setCurrentUser(null);

      // 然后调用 API 注销
      try {
        const response = await apiService.logout();
        console.log('注销 API 响应:', response);
      } catch (apiError) {
        console.warn('注销 API 调用失败，但本地状态已清除:', apiError);
        // 即使 API 调用失败，也继续执行
      }

      return { success: true, message: '注销成功' };
    } catch (error) {
      console.error('注销失败:', error);
      setError('注销失败，请重试');

      // 即使出错，也尝试清除所有状态
      try {
        // 清除本地存储
        localStorage.clear();
        sessionStorage.clear();

        // 重置离线模式状态
        window.isOfflineMode = false;

        // 清除内存中的用户状态
        setCurrentUser(null);
      } catch (clearError) {
        console.error('清除状态失败:', clearError);
      }

      // 即使出错，也返回成功，因为我们已经尝试清除了所有状态
      return { success: true, message: '注销成功' };
    } finally {
      setLoading(false);
    }
  };

  // 检查用户是否已登录
  const isLoggedIn = () => {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');
    const isOffline = window.isOfflineMode;

    console.log('检查用户是否已登录:', {
      currentUser,
      token,
      localUser: userJson ? '存在' : '不存在',
      isOffline
    });

    // 强制检查本地存储状态
    if (!token || !userJson) {
      console.log('本地存储中没有有效的登录信息，返回未登录状态');
      // 确保内存中的状态也被清除
      if (currentUser) {
        // 注意：这里使用异步方式设置，不会立即生效
        setTimeout(() => setCurrentUser(null), 0);
      }
      return false;
    }

    // 如果内存中没有用户对象，但本地存储中有用户信息，尝试加载到内存
    if (!currentUser && userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        console.log('从本地存储加载用户信息:', parsedUser);

        // 异步设置用户状态，不会立即生效，但会在下一个渲染周期生效
        setTimeout(() => {
          console.log('将用户信息设置到内存状态:', parsedUser);
          setCurrentUser(parsedUser);
        }, 0);

        return true;
      } catch (error) {
        console.error('解析本地用户信息失败:', error);
        // 如果解析失败，清除本地存储
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        return false;
      }
    }

    // 如果内存中有用户对象，返回已登录状态
    return !!currentUser;
  };

  // 检查用户是否是管理员
  const isAdmin = () => {
    // 如果内存中有用户对象，直接检查其管理员状态
    if (currentUser) {
      return !!currentUser.isAdmin;
    }

    // 如果内存中没有用户对象，尝试从本地存储中获取
    const userJson = localStorage.getItem('current_user');
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        console.log('从本地存储检查管理员状态:', parsedUser);
        return !!parsedUser.isAdmin;
      } catch (error) {
        console.error('解析本地用户信息失败:', error);
        return false;
      }
    }

    // 如果没有用户信息，返回 false
    return false;
  };

  // 上下文值
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isLoggedIn,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，用于访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
