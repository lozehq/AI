// IndexedDB服务 - 提供离线数据存储功能
const DB_NAME = 'AICommunityDB';
const DB_VERSION = 2; // 升级数据库版本以触发升级事件

// 初始化数据库
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => {
      console.error('数据库打开失败:', event);
      reject('数据库打开失败');
    };

    request.onsuccess = event => {
      console.log('IndexedDB数据库打开成功');
      resolve(event.target.result);
    };

    request.onupgradeneeded = event => {
      const db = event.target.result;

      // 创建用户表
      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id' });
        usersStore.createIndex('name', 'name', { unique: true });
        usersStore.createIndex('email', 'email', { unique: true });

        // 添加默认管理员用户
        try {
          usersStore.add({
            id: 'admin_1',
            name: 'admin',
            email: 'admin@example.com',
            phone: '13800000000',
            password: 'admin123',
            balance: 1000,
            isAdmin: true,
            createdAt: new Date().toISOString()
          });
          console.log('默认管理员用户添加成功');
        } catch (error) {
          console.warn('默认管理员用户添加失败，可能已存在:', error);
        }
      }

      // 创建服务表
      if (!db.objectStoreNames.contains('services')) {
        db.createObjectStore('services', { keyPath: 'id', autoIncrement: true });
      }

      // 创建订单表
      if (!db.objectStoreNames.contains('orders')) {
        const ordersStore = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        ordersStore.createIndex('userId', 'userId', { unique: false });
      }

      // 创建邀请码表
      if (!db.objectStoreNames.contains('inviteCodes')) {
        const inviteCodesStore = db.createObjectStore('inviteCodes', { keyPath: 'code' });

        // 添加默认管理员邀请码
        try {
          inviteCodesStore.add({
            code: 'ADMIN2023',
            isAdmin: true,
            used: false,
            createdAt: new Date().toISOString()
          });
          console.log('默认管理员邀请码添加成功');
        } catch (error) {
          console.warn('默认管理员邀请码添加失败，可能已存在:', error);
        }
      }

      // 创建交易记录表
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionsStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        transactionsStore.createIndex('userId', 'userId', { unique: false });
      }

      // 创建通知表
      if (!db.objectStoreNames.contains('notifications')) {
        const notificationsStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        notificationsStore.createIndex('userId', 'userId', { unique: false });
      }

      // 创建卡密表
      if (!db.objectStoreNames.contains('cardKeys')) {
        const cardKeysStore = db.createObjectStore('cardKeys', { keyPath: 'id' });
        cardKeysStore.createIndex('code', 'code', { unique: true });
        cardKeysStore.createIndex('isUsed', 'isUsed', { unique: false });
      }

      console.log('IndexedDB数据库结构初始化完成');
    };
  });
};

// 获取数据库连接
export const getDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => {
      console.error('数据库打开失败:', event);
      reject('数据库打开失败');
    };

    request.onsuccess = event => {
      resolve(event.target.result);
    };
  });
};

// 通用CRUD操作
export const dbOperations = {
  // 添加数据
  add: async (storeName, data) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        // 先检查是否已存在
        let keyValue = null;
        if (storeName === 'users' && data.id) {
          keyValue = data.id;
        } else if (storeName === 'inviteCodes' && data.code) {
          keyValue = data.code;
        } else if (data.id) {
          keyValue = data.id;
        }

        if (keyValue) {
          const getRequest = store.get(keyValue);

          getRequest.onsuccess = () => {
            if (getRequest.result) {
              // 如果已存在，尝试更新
              const updateRequest = store.put(data);
              updateRequest.onsuccess = () => resolve(updateRequest.result);
              updateRequest.onerror = () => reject(updateRequest.error);
            } else {
              // 如果不存在，添加
              const addRequest = store.add(data);
              addRequest.onsuccess = () => resolve(addRequest.result);
              addRequest.onerror = () => reject(addRequest.error);
            }
          };

          getRequest.onerror = () => {
            // 获取失败，尝试直接添加
            const addRequest = store.add(data);
            addRequest.onsuccess = () => resolve(addRequest.result);
            addRequest.onerror = () => reject(addRequest.error);
          };
        } else {
          // 没有主键，直接添加
          const request = store.add(data);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }

        transaction.oncomplete = () => db.close();
        transaction.onerror = (event) => {
          console.error(`事务错误 (${storeName}):`, event);
          reject(event.target.error);
        };
      } catch (error) {
        console.error(`添加数据到 ${storeName} 时发生异常:`, error);
        reject(error);
      }
    });
  },

  // 获取所有数据
  getAll: async (storeName) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  },

  // 根据ID获取数据
  getById: async (storeName, id) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  },

  // 根据索引获取数据
  getByIndex: async (storeName, indexName, value) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  },

  // 更新数据
  update: async (storeName, data) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  },

  // 删除数据
  delete: async (storeName, id) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  },

  // 清空存储
  clear: async (storeName) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  }
};

// 用户相关操作
export const userOperations = {
  // 用户登录
  login: async (username, password) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const nameIndex = store.index('name');
      const emailIndex = store.index('email');

      // 先尝试用用户名查找
      const nameRequest = nameIndex.get(username);

      nameRequest.onsuccess = () => {
        if (nameRequest.result && nameRequest.result.password === password) {
          resolve(nameRequest.result);
        } else {
          // 如果用户名不匹配，尝试用邮箱查找
          const emailRequest = emailIndex.get(username);

          emailRequest.onsuccess = () => {
            if (emailRequest.result && emailRequest.result.password === password) {
              resolve(emailRequest.result);
            } else {
              resolve(null); // 用户名/密码不匹配
            }
          };

          emailRequest.onerror = () => reject(emailRequest.error);
        }
      };

      nameRequest.onerror = () => reject(nameRequest.error);

      transaction.oncomplete = () => db.close();
    });
  },

  // 更新用户余额
  updateBalance: async (userId, amount) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.get(userId);

      request.onsuccess = () => {
        const user = request.result;
        if (user) {
          user.balance = (user.balance || 0) + amount;
          const updateRequest = store.put(user);

          updateRequest.onsuccess = () => resolve(user);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('用户不存在'));
        }
      };

      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  }
};

// 初始化数据库
initDB().catch(error => console.error('初始化IndexedDB失败:', error));
