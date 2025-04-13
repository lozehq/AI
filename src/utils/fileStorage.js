// 文件存储服务
// 使用后端 API 存储数据到项目目录中

import apiService from '../services/apiService';
import { fileSystemService } from '../services/fileSystemService';

// 内存缓存，减少 API 调用
const cache = new Map();

// 初始化缓存
const initCache = async () => {
  try {
    // 获取所有数据键
    const keys = await apiService.getAllKeys();
    console.log('初始化缓存，获取到数据键:', keys);

    // 逐个加载数据
    for (const key of keys) {
      try {
        // 先尝试从文件系统加载
        let data = null;
        try {
          data = await fileSystemService.readFile(key);
          if (data !== null) {
            console.log(`从文件系统加载数据 ${key} 成功`);
          }
        } catch (fileError) {
          console.warn(`从文件系统加载数据 ${key} 失败:`, fileError);
        }

        // 如果文件系统加载失败，尝试从 API 加载
        if (data === null) {
          data = await apiService.getData(key);
          if (data !== null) {
            console.log(`从 API 加载数据 ${key} 成功`);

            // 保存到文件系统
            try {
              await fileSystemService.writeFile(key, data);
              console.log(`数据 ${key} 保存到文件系统成功`);
            } catch (saveError) {
              console.error(`数据 ${key} 保存到文件系统失败:`, saveError);
            }
          }
        }

        // 如果数据加载成功，保存到缓存
        if (data !== null) {
          cache.set(key, data);
        }
      } catch (error) {
        console.error(`初始化缓存时加载数据 ${key} 失败:`, error);
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

    // 先尝试从文件系统获取数据
    try {
      const fileData = await fileSystemService.readFile(key);
      if (fileData !== null) {
        console.log(`从文件系统获取数据 ${key} 成功`);

        // 更新缓存
        cache.set(key, fileData);

        return fileData;
      }
    } catch (fileError) {
      console.warn(`从文件系统获取数据 ${key} 失败:`, fileError);
    }

    // 如果文件系统获取失败，尝试从 API 获取数据
    const data = await apiService.getData(key);

    // 更新缓存
    if (data !== null) {
      cache.set(key, data);

      // 保存到文件系统
      try {
        await fileSystemService.writeFile(key, data);
        console.log(`数据 ${key} 保存到文件系统成功`);
      } catch (saveError) {
        console.error(`数据 ${key} 保存到文件系统失败:`, saveError);
      }
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

    // 先保存到文件系统
    try {
      const fileResult = await fileSystemService.writeFile(key, data);
      console.log(`数据 ${key} 保存到文件系统结果:`, fileResult);

      if (!fileResult) {
        console.warn(`数据 ${key} 保存到文件系统失败，将尝试保存到 API`);
      }
    } catch (fileError) {
      console.error(`数据 ${key} 保存到文件系统失败:`, fileError);
    }

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

    // 先从文件系统删除
    try {
      const fileResult = await fileSystemService.deleteFile(key);
      console.log(`从文件系统删除数据 ${key} 结果:`, fileResult);

      if (!fileResult) {
        console.warn(`从文件系统删除数据 ${key} 失败，将尝试从 API 删除`);
      }
    } catch (fileError) {
      console.error(`从文件系统删除数据 ${key} 失败:`, fileError);
    }

    // 从 API 删除
    const success = await apiService.deleteData(key);
    return success;
  } catch (error) {
    console.error(`删除数据 ${key} 失败:`, error);
    return false;
  }
};

// 初始化
initCache();

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
