// 共享存储服务
// 模拟服务器存储，使所有浏览器都能访问相同的数据

// 使用 window.name 作为共享存储
// 注意：这只是一个演示用的解决方案，不适合生产环境
// 在实际应用中，应该使用真正的后端服务器和数据库

// 初始化共享存储
const initSharedStorage = () => {
  try {
    // 如果 window.name 为空或不是有效的 JSON，则初始化为空对象
    if (!window.name || window.name === 'null' || window.name === 'undefined') {
      window.name = JSON.stringify({});
    } else {
      // 尝试解析 window.name
      try {
        JSON.parse(window.name);
      } catch (e) {
        console.error('无法解析 window.name，重置为空对象', e);
        window.name = JSON.stringify({});
      }
    }
  } catch (error) {
    console.error('初始化共享存储失败', error);
    window.name = JSON.stringify({});
  }
};

// 获取共享存储中的数据
const getSharedData = (key) => {
  try {
    const storage = JSON.parse(window.name);
    return storage[key] || null;
  } catch (error) {
    console.error(`获取共享数据 ${key} 失败`, error);
    return null;
  }
};

// 设置共享存储中的数据
const setSharedData = (key, value) => {
  try {
    const storage = JSON.parse(window.name);
    storage[key] = value;
    window.name = JSON.stringify(storage);
    return true;
  } catch (error) {
    console.error(`设置共享数据 ${key} 失败`, error);
    return false;
  }
};

// 删除共享存储中的数据
const removeSharedData = (key) => {
  try {
    const storage = JSON.parse(window.name);
    delete storage[key];
    window.name = JSON.stringify(storage);
    return true;
  } catch (error) {
    console.error(`删除共享数据 ${key} 失败`, error);
    return false;
  }
};

// 清空共享存储
const clearSharedStorage = () => {
  try {
    window.name = JSON.stringify({});
    return true;
  } catch (error) {
    console.error('清空共享存储失败', error);
    return false;
  }
};

// 初始化共享存储
initSharedStorage();

// 导出共享存储服务
export const sharedStorage = {
  getSharedData,
  setSharedData,
  removeSharedData,
  clearSharedStorage
};
