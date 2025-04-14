import axios from 'axios';
import { dbOperations, userOperations, initDB } from './indexedDBService';
import { fileSystemService } from './fileSystemService';

// API 基础 URL
const API_BASE_URL = 'http://localhost:3030/api';

// 离线模式状态 - 使用全局变量以便与其他组件共享
window.isOfflineMode = window.isOfflineMode || false;

// 本地引用，便于使用
let isOfflineMode = window.isOfflineMode;

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 设置请求超时时间，以便快速检测服务器状态
  timeout: 5000
});

// 检查服务器连接状态
const checkServerConnection = async () => {
  try {
    console.log('检查服务器连接状态...');
    await axios.head(`${API_BASE_URL}/keys`, { timeout: 3000 });
    if (isOfflineMode) {
      console.log('服务器连接恢复，切换到在线模式');
    }
    // 更新本地和全局离线模式状态
    isOfflineMode = false;
    window.isOfflineMode = false;
    return true;
  } catch (error) {
    if (!isOfflineMode) {
      console.log('服务器连接失败，切换到离线模式:', error.message);
    }
    // 更新本地和全局离线模式状态
    isOfflineMode = true;
    window.isOfflineMode = true;
    return false;
  }
};

// 初始化离线模式
const initOfflineMode = async () => {
  console.log('初始化离线模式支持...');

  // 初始化 IndexedDB
  try {
    await initDB();
    console.log('IndexedDB 初始化成功');
  } catch (dbError) {
    console.error('IndexedDB 初始化失败:', dbError);
  }

  // 检查服务器连接
  try {
    const isConnected = await checkServerConnection();
    console.log('服务器连接状态:', isConnected ? '在线' : '离线');

    // 同步本地和全局离线模式状态
    isOfflineMode = !isConnected;
    window.isOfflineMode = !isConnected;
  } catch (error) {
    console.error('检查服务器连接失败:', error);
    isOfflineMode = true;
    window.isOfflineMode = true;
  }

  // 定期检查服务器连接
  const intervalId = setInterval(async () => {
    try {
      await checkServerConnection();
    } catch (error) {
      console.error('定期检查服务器连接失败:', error);
    }
  }, 30000);

  // 将定时器ID存储在全局变量中，以便需要时可以清除
  window.serverCheckIntervalId = intervalId;

  console.log('离线模式支持初始化完成，当前状态:', isOfflineMode ? '离线' : '在线');
};

// 启动离线模式
initOfflineMode();

// 添加请求拦截器
api.interceptors.request.use(config => {
  // 从 localStorage 获取令牌
  const token = localStorage.getItem('auth_token');
  console.log('发送请求，令牌:', token, '离线模式:', isOfflineMode);

  if (token) {
    config.headers['Authorization'] = token;
    console.log('设置请求头部:', config.headers);
  }
  return config;
});

// API 服务
const apiService = {
  // 认证相关
  async login(username, password) {
    try {
      console.log('尝试登录，用户名:', username, '离线模式:', isOfflineMode);

      // 离线模式登录
      if (isOfflineMode) {
        console.log('使用离线模式登录');
        try {
          // 使用 IndexedDB 进行用户验证
          const user = await userOperations.login(username, password);

          if (user) {
            console.log('离线模式登录成功:', user);
            // 生成离线令牌
            const offlineToken = `offline_${Date.now()}_${Math.random().toString(36).substring(2)}`;
            // 存储令牌和用户信息
            localStorage.setItem('auth_token', offlineToken);
            localStorage.setItem('current_user', JSON.stringify(user));

            // 返回成功响应
            const { password: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword, token: offlineToken };
          } else {
            console.log('离线模式登录失败：用户名或密码错误');
            return { success: false, message: '用户名或密码错误' };
          }
        } catch (dbError) {
          console.error('离线模式登录错误:', dbError);
          return { success: false, message: '登录失败，请重试' };
        }
      }

      // 在线模式登录
      try {
        // 注意：这里不需要加上 '/api' 前缀，因为已经在 baseURL 中指定了
        const response = await api.post('/auth/login', { username, password });
        console.log('登录响应:', response.data);

        if (response.data.success && response.data.token) {
          // 将令牌和用户信息存储到 localStorage
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('current_user', JSON.stringify(response.data.user));

          // 同步到 IndexedDB
          try {
            const existingUser = await dbOperations.getById('users', response.data.user.id);
            if (!existingUser) {
              // 如果用户不存在，添加到 IndexedDB
              await dbOperations.add('users', {
                ...response.data.user,
                password: password // 存储密码以便离线登录
              });
            } else {
              // 如果用户已存在，更新信息
              await dbOperations.update('users', {
                ...existingUser,
                ...response.data.user,
                password: password // 更新密码
              });
            }
          } catch (dbError) {
            console.error('同步用户到 IndexedDB 失败:', dbError);
          }
        }

        return response.data;
      } catch (apiError) {
        console.error('在线登录失败:', apiError);

        // 如果在线登录失败，切换到离线模式并尝试离线登录
        isOfflineMode = true;
        window.isOfflineMode = true;

        // 直接尝试离线登录，而不是递归调用
        try {
          // 使用 IndexedDB 进行用户验证
          const user = await userOperations.login(username, password);

          if (user) {
            console.log('离线模式登录成功:', user);
            // 生成离线令牌
            const offlineToken = `offline_${Date.now()}_${Math.random().toString(36).substring(2)}`;
            // 存储令牌和用户信息
            localStorage.setItem('auth_token', offlineToken);
            localStorage.setItem('current_user', JSON.stringify(user));

            // 返回成功响应
            const { password: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword, token: offlineToken };
          } else {
            console.log('离线模式登录失败：用户名或密码错误');
            return { success: false, message: '用户名或密码错误' };
          }
        } catch (dbError) {
          console.error('离线模式登录错误:', dbError);
          return { success: false, message: '登录失败，请重试' };
        }
      }
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, message: error.response?.data?.message || '登录失败，请重试' };
    }
  },

  async logout() {
    try {
      console.log('尝试注销，离线模式:', isOfflineMode);

      // 先清除本地存储，无论是否离线模式
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');

      // 如果不是离线模式，尝试调用服务器 API
      if (!isOfflineMode) {
        try {
          console.log('尝试调用注销 API');
          // 注意：这里不需要加上 '/api' 前缀，因为已经在 baseURL 中指定了
          await api.post('/auth/logout');
          console.log('注销 API 调用成功');
        } catch (apiError) {
          // 即使 API 调用失败，也继续执行
          console.warn('注销 API 调用失败，但本地存储已清除:', apiError);
        }
      } else {
        console.log('离线模式注销，跳过 API 调用');
      }

      return { success: true, message: '注销成功' };
    } catch (error) {
      console.error('注销失败:', error);
      // 即使出错，也尝试清除本地存储
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      } catch (localStorageError) {
        console.error('清除本地存储失败:', localStorageError);
      }
      return { success: true, message: '注销成功' }; // 即使出错，也返回成功，因为本地存储已清除
    }
  },

  async getCurrentUser() {
    try {
      console.log('获取当前用户信息，离线模式:', isOfflineMode);

      // 获取本地存储的用户信息
      const token = localStorage.getItem('auth_token');
      const userJson = localStorage.getItem('current_user');

      // 如果没有令牌，返回未登录状态
      if (!token) {
        console.log('未找到令牌，用户未登录');
        return { success: false, message: '未登录' };
      }

      // 离线模式下使用本地存储的用户信息
      if (isOfflineMode) {
        console.log('离线模式，使用本地存储的用户信息');

        if (userJson) {
          const user = JSON.parse(userJson);
          console.log('从本地存储获取到用户:', user);
          return { success: true, user };
        } else {
          // 如果有令牌但没有用户信息，尝试从 IndexedDB 获取
          try {
            // 从令牌中提取用户ID（如果是离线令牌，可能需要其他方式获取用户ID）
            const users = await dbOperations.getAll('users');
            if (users && users.length > 0) {
              // 使用第一个用户（如果有多个）
              const user = users[0];
              const { password: _, ...userWithoutPassword } = user;

              // 更新本地存储
              localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));

              console.log('从 IndexedDB 获取到用户:', userWithoutPassword);
              return { success: true, user: userWithoutPassword };
            }
          } catch (dbError) {
            console.error('从 IndexedDB 获取用户失败:', dbError);
          }

          // 如果仍然无法获取用户信息，清除令牌
          localStorage.removeItem('auth_token');
          return { success: false, message: '会话已过期，请重新登录' };
        }
      }

      // 在线模式下从服务器获取用户信息
      try {
        // 注意：这里不需要加上 '/api' 前缀，因为已经在 baseURL 中指定了
        const response = await api.get('/auth/me');
        console.log('从服务器获取到用户响应:', response.data);

        if (response.data.success && response.data.user) {
          // 更新本地存储
          localStorage.setItem('current_user', JSON.stringify(response.data.user));

          // 同步到 IndexedDB（但不包含密码）
          try {
            const existingUser = await dbOperations.getById('users', response.data.user.id);
            if (existingUser) {
              // 保留原密码，更新其他信息
              await dbOperations.update('users', {
                ...existingUser,
                ...response.data.user,
                password: existingUser.password
              });
            }
          } catch (dbError) {
            console.error('同步用户到 IndexedDB 失败:', dbError);
          }
        }

        return response.data;
      } catch (apiError) {
        console.error('从服务器获取用户失败:', apiError);

        // 如果 API 调用失败，切换到离线模式
        isOfflineMode = true;
        window.isOfflineMode = true;

        // 直接从本地存储获取用户信息，而不是递归调用
        if (userJson) {
          const user = JSON.parse(userJson);
          console.log('从本地存储获取到用户:', user);
          return { success: true, user };
        } else {
          // 清除令牌
          localStorage.removeItem('auth_token');
          return { success: false, message: '会话已过期，请重新登录' };
        }
      }
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return { success: false, message: error.response?.data?.message || '获取当前用户失败，请重试' };
    }
  },

  // 数据相关
  async getData(key) {
    console.log(`获取数据 ${key}，离线模式: ${isOfflineMode}`);

    // 先尝试从文件系统获取数据
    try {
      const fileData = await fileSystemService.readFile(key);
      if (fileData) {
        console.log(`从文件系统获取数据 ${key}:`, fileData);
        return fileData;
      }
    } catch (fileError) {
      console.warn(`从文件系统获取数据 ${key} 失败:`, fileError);
    }

    // 如果文件系统获取失败，尝试从 IndexedDB 获取
    if (isOfflineMode) {
      try {
        const data = await dbOperations.getAll(key);
        console.log(`从 IndexedDB 获取数据 ${key}:`, data);

        // 将数据保存到文件系统
        if (data && data.length > 0) {
          try {
            await fileSystemService.writeFile(key, data);
            console.log(`数据 ${key} 保存到文件系统成功`);
          } catch (saveError) {
            console.error(`数据 ${key} 保存到文件系统失败:`, saveError);
          }
        }

        return data;
      } catch (dbError) {
        console.error(`从 IndexedDB 获取数据 ${key} 失败:`, dbError);
        return [];
      }
    }

    // 在线模式下从服务器获取数据
    try {
      const response = await api.get(`/data/${key}`);
      console.log(`从服务器获取数据 ${key}:`, response.data);

      // 如果成功，同步到文件系统和 IndexedDB
      if (response.data.success && response.data.data) {
        const data = response.data.data;

        // 保存到文件系统
        try {
          await fileSystemService.writeFile(key, data);
          console.log(`数据 ${key} 保存到文件系统成功`);
        } catch (fileError) {
          console.error(`数据 ${key} 保存到文件系统失败:`, fileError);
        }

        // 同步到 IndexedDB
        try {
          // 清除现有数据
          await dbOperations.clear(key);

          // 如果是数组，逐个添加
          if (Array.isArray(data)) {
            for (const item of data) {
              try {
                // 先尝试更新，如果失败再添加
                if (item.id || item.code) {
                  const keyValue = item.id || item.code;
                  const existingItem = await dbOperations.getById(key, keyValue);
                  if (existingItem) {
                    // 如果已存在，更新
                    await dbOperations.update(key, item);
                    continue;
                  }
                }
                // 如果不存在或没有ID/code，添加
                await dbOperations.add(key, item);
              } catch (itemError) {
                console.warn(`添加/更新数据项到 ${key} 失败:`, itemError, item);
                // 继续处理下一项，不中断整个过程
              }
            }
          } else {
            // 如果是对象，先尝试更新，如果失败再添加
            try {
              if (data.id || data.code) {
                const keyValue = data.id || data.code;
                const existingItem = await dbOperations.getById(key, keyValue);
                if (existingItem) {
                  // 如果已存在，更新
                  await dbOperations.update(key, data);
                } else {
                  // 如果不存在，添加
                  await dbOperations.add(key, data);
                }
              } else {
                // 没有ID/code，直接添加
                await dbOperations.add(key, data);
              }
            } catch (objError) {
              console.warn(`添加/更新对象到 ${key} 失败:`, objError, data);
            }
          }

          console.log(`数据 ${key} 同步到 IndexedDB 成功`);
        } catch (syncError) {
          console.error(`数据 ${key} 同步到 IndexedDB 失败:`, syncError);
        }
      }

      return response.data.data;
    } catch (error) {
      console.error(`从服务器获取数据 ${key} 失败:`, error);

      // 如果服务器请求失败，切换到离线模式
      isOfflineMode = true;
      window.isOfflineMode = true;
      // 直接从文件存储获取数据，而不是递归调用
      return await fileStorage.getData(key) || [];
    }
  },

  // 保存数据
  async saveData(key, data) {
    console.log(`保存数据 ${key}，离线模式: ${isOfflineMode}`, data);

    // 检查数据有效性
    if (!data) {
      console.error(`保存数据 ${key} 失败: 数据为空`);
      return false;
    }

    // 先保存到文件系统
    try {
      const fileResult = await fileSystemService.writeFile(key, data);
      console.log(`数据 ${key} 保存到文件系统结果:`, fileResult);

      if (!fileResult) {
        console.warn(`数据 ${key} 保存到文件系统失败，将尝试保存到 IndexedDB`);
      }
    } catch (fileError) {
      console.error(`数据 ${key} 保存到文件系统失败:`, fileError);
    }

    // 无论文件系统保存是否成功，都尝试保存到 IndexedDB
    try {
      // 如果是数组，逐个添加
      if (Array.isArray(data)) {
        // 清除现有数据
        await dbOperations.clear(key);

        for (const item of data) {
          try {
            // 先尝试更新，如果失败再添加
            if (item.id || item.code) {
              const keyValue = item.id || item.code;
              const existingItem = await dbOperations.getById(key, keyValue);
              if (existingItem) {
                // 如果已存在，更新
                await dbOperations.update(key, item);
                continue;
              }
            }
            // 如果不存在或没有ID/code，添加
            await dbOperations.add(key, item);
          } catch (itemError) {
            console.warn(`添加/更新数据项到 ${key} 失败:`, itemError, item);
            // 继续处理下一项，不中断整个过程
          }
        }
      } else {
        // 如果是对象，先尝试更新，如果失败再添加
        try {
          if (data.id || data.code) {
            const keyValue = data.id || data.code;
            const existingItem = await dbOperations.getById(key, keyValue);
            if (existingItem) {
              // 如果已存在，更新
              await dbOperations.update(key, data);
            } else {
              // 如果不存在，添加
              await dbOperations.add(key, data);
            }
          } else {
            // 没有ID/code，直接添加
            await dbOperations.add(key, data);
          }
        } catch (objError) {
          console.warn(`添加/更新对象到 ${key} 失败:`, objError, data);
        }
      }

      console.log(`数据 ${key} 保存到 IndexedDB 成功`);
    } catch (dbError) {
      console.error(`数据 ${key} 保存到 IndexedDB 失败:`, dbError);
      // 如果文件系统和 IndexedDB 都保存失败，返回失败
      return false;
    }

    // 如果是离线模式，不尝试保存到服务器
    if (isOfflineMode) {
      console.log(`离线模式，数据 ${key} 仅保存到本地`);
      return true;
    }

    // 在线模式下尝试保存到服务器
    try {
      const response = await api.post(`/data/${key}`, { data });
      console.log(`数据 ${key} 保存到服务器成功:`, response.data);
      return true; // 始终返回成功，因为数据已保存到文件系统和 IndexedDB
    } catch (error) {
      console.error(`数据 ${key} 保存到服务器失败:`, error);
      // 即使服务器保存失败，也返回成功，因为数据已保存到本地
      isOfflineMode = true; // 切换到离线模式
      window.isOfflineMode = true;
      return true;
    }
  },

  // 删除数据
  async deleteData(key) {
    console.log(`删除数据 ${key}，离线模式: ${isOfflineMode}`);

    // 先从文件系统删除
    try {
      const fileResult = await fileSystemService.deleteFile(key);
      console.log(`从文件系统删除数据 ${key} 结果:`, fileResult);
    } catch (fileError) {
      console.error(`从文件系统删除数据 ${key} 失败:`, fileError);
    }

    // 无论文件系统删除是否成功，都尝试从 IndexedDB 删除
    try {
      await dbOperations.clear(key);
      console.log(`从 IndexedDB 删除数据 ${key} 成功`);
    } catch (dbError) {
      console.error(`从 IndexedDB 删除数据 ${key} 失败:`, dbError);
    }

    // 如果是离线模式，不尝试从服务器删除
    if (isOfflineMode) {
      console.log(`离线模式，数据 ${key} 仅从本地删除`);
      return true;
    }

    // 在线模式下尝试从服务器删除
    try {
      const response = await api.delete(`/data/${key}`);
      console.log(`从服务器删除数据 ${key} 成功:`, response.data);
      return true;
    } catch (error) {
      console.error(`从服务器删除数据 ${key} 失败:`, error);
      // 即使服务器删除失败，也返回成功，因为数据已从本地删除
      isOfflineMode = true; // 切换到离线模式
      window.isOfflineMode = true;
      return true;
    }
  },

  // 获取所有数据键
  async getAllKeys() {
    console.log(`获取所有数据键，离线模式: ${isOfflineMode}`);

    // 先尝试从文件系统获取所有键
    try {
      const fileKeys = await fileSystemService.getAllFiles();
      if (fileKeys && fileKeys.length > 0) {
        console.log('从文件系统获取数据键成功:', fileKeys);
        return fileKeys;
      }
    } catch (fileError) {
      console.warn('从文件系统获取数据键失败:', fileError);
    }

    // 离线模式下返回预定义的键列表
    if (isOfflineMode) {
      // 预定义的数据存储键
      const predefinedKeys = ['users', 'services', 'orders', 'inviteCodes', 'transactions', 'notifications'];
      console.log('离线模式，返回预定义的数据键:', predefinedKeys);
      return predefinedKeys;
    }

    // 在线模式下从服务器获取数据键
    try {
      const response = await api.get('/keys');
      console.log('从服务器获取数据键成功:', response.data);

      // 将数据键保存到文件系统
      if (response.data.keys && response.data.keys.length > 0) {
        try {
          // 创建一个特殊的文件来存储所有的键
          await fileSystemService.writeFile('_keys', response.data.keys);
          console.log('数据键保存到文件系统成功');
        } catch (saveError) {
          console.error('数据键保存到文件系统失败:', saveError);
        }
      }

      return response.data.keys || [];
    } catch (error) {
      console.error('从服务器获取数据键失败:', error);

      // 如果服务器请求失败，切换到离线模式
      isOfflineMode = true;
      window.isOfflineMode = true;

      // 直接返回预定义的键列表，而不是递归调用
      const predefinedKeys = ['users', 'services', 'orders', 'inviteCodes', 'transactions', 'notifications', 'cardKeys'];
      console.log('离线模式，返回预定义的数据键:', predefinedKeys);
      return predefinedKeys;
    }
  }
};

export default apiService;
