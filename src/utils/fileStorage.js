// 文件存储服务
// 使用后端 API 存储数据到项目目录中

import apiService from '../services/apiService';

// 内存缓存，减少 API 调用
const cache = new Map();

// 初始化缓存
const initCache = async () => {
  try {
    // 获取所有数据键
    const keys = await apiService.getAllKeys();

    // 预加载所有数据到缓存
    for (const key of keys) {
      const data = await apiService.getData(key);
      if (data !== null) {
        cache.set(key, data);
      }
    }

    console.log('文件存储缓存初始化完成');
    return true;
  } catch (error) {
    console.error('初始化文件存储缓存失败:', error);
    return false;
  }
};

// 获取数据
const getData = async (key) => {
  try {
    // 如果缓存中有数据，直接返回
    if (cache.has(key)) {
      return cache.get(key);
    }

    // 从 API 获取数据
    const data = await apiService.getData(key);

    // 更新缓存
    if (data !== null) {
      cache.set(key, data);
    }

    return data;
  } catch (error) {
    console.error(`获取数据 ${key} 失败:`, error);
    return null;
  }
};

// 保存数据
const saveData = async (key, data) => {
  try {
    // 更新缓存
    cache.set(key, data);

    // 保存到 API
    const success = await apiService.saveData(key, data);
    return success;
  } catch (error) {
    console.error(`保存数据 ${key} 失败:`, error);
    return false;
  }
};

// 删除数据
const deleteData = async (key) => {
  try {
    // 从缓存中删除
    cache.delete(key);

    // 从 API 删除
    const success = await apiService.deleteData(key);
    return success;
  } catch (error) {
    console.error(`删除数据 ${key} 失败:`, error);
    return false;
  }
};

// 初始化
// 使用延迟执行，确保其他模块已加载
setTimeout(() => {
  console.log('开始初始化文件存储缓存...');
  initCache();
}, 500);

// 获取所有数据键
const getAllKeys = async () => {
  try {
    // 从 API 获取所有键
    const keys = await apiService.getAllKeys();
    return keys;
  } catch (error) {
    console.error('获取所有数据键失败:', error);
    return [];
  }
};

// 导出文件存储服务
export const fileStorage = {
  getData,
  saveData,
  deleteData,
  initCache,
  getAllKeys
};
