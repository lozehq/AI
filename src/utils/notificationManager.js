// 通知管理器
// 用于管理系统通知，包括创建、获取、标记已读等功能

// 导入文件存储服务
import { fileStorage } from './fileStorage';

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// 获取当前时间的ISO字符串
const getCurrentTime = () => {
  return new Date().toISOString();
};

// 通知管理器
export const notificationManager = {
  // 创建新通知
  createNotification: async (title, content, type = 'info', isGlobal = true, creatorId = null) => {
    try {
      const notifications = await notificationManager.getAllNotifications();

      const newNotification = {
        id: generateId(),
        title,
        content,
        type, // 'info', 'success', 'warning', 'error'
        isGlobal, // 是否全局通知
        createdAt: getCurrentTime(),
        isRead: false,
        creatorId // 创建者ID
      };

      notifications.push(newNotification);
      await fileStorage.saveData('notifications', notifications);

      console.log('创建新通知:', newNotification);
      return newNotification;
    } catch (error) {
      console.error('创建通知失败:', error);
      return null;
    }
  },

  // 获取所有通知
  getAllNotifications: async () => {
    try {
      return await fileStorage.getData('notifications') || [];
    } catch (error) {
      console.error('获取通知失败:', error);
      return [];
    }
  },

  // 获取用户可见的通知
  getUserNotifications: async (userId) => {
    try {
      const allNotifications = await notificationManager.getAllNotifications();

      // 过滤出用户可见的通知：全局通知或者用户自己创建的通知
      return allNotifications.filter(notification => {
        return notification.isGlobal || notification.creatorId === userId;
      });
    } catch (error) {
      console.error('获取用户通知失败:', error);
      return [];
    }
  },

  // 获取用户未读通知
  getUnreadNotifications: async (userId) => {
    try {
      const userNotifications = await notificationManager.getUserNotifications(userId);
      const userReadStatus = await notificationManager.getUserReadStatus(userId);

      // 过滤出用户未读的通知
      return userNotifications.filter(notification => {
        // 如果通知ID不在已读列表中，则为未读
        return !userReadStatus.includes(notification.id);
      });
    } catch (error) {
      console.error('获取未读通知失败:', error);
      return [];
    }
  },

  // 获取用户已读通知ID列表
  getUserReadStatus: async (userId) => {
    try {
      if (!userId) {
        console.warn('获取已读状态时用户ID为空');
        return [];
      }

      const key = `notification_read_${userId}`;
      console.log(`获取用户已读状态，键名: ${key}`);

      // 先尝试从 localStorage 获取缓存的已读状态
      try {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          console.log(`从 localStorage 获取到已读状态: ${parsedData.length} 条`);
          return parsedData;
        }
      } catch (cacheError) {
        console.warn('从 localStorage 获取已读状态失败:', cacheError);
      }

      // 如果缓存中没有，从文件存储获取
      const data = await fileStorage.getData(key) || [];
      console.log(`从文件存储获取到已读状态: ${data.length} 条`);

      // 将数据缓存到 localStorage
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (cacheError) {
        console.warn('将已读状态缓存到 localStorage 失败:', cacheError);
      }

      return data;
    } catch (error) {
      console.error('获取用户已读状态失败:', error);
      return [];
    }
  },

  // 标记通知为已读
  markAsRead: async (userId, notificationId) => {
    try {
      if (!userId || !notificationId) {
        console.warn('标记通知已读时用户ID或通知ID为空');
        return false;
      }

      const key = `notification_read_${userId}`;
      console.log(`标记通知已读，键名: ${key}, 通知ID: ${notificationId}`);

      const readStatus = await notificationManager.getUserReadStatus(userId);
      console.log('当前已读状态:', readStatus);

      // 如果通知ID不在已读列表中，添加它
      if (!readStatus.includes(notificationId)) {
        readStatus.push(notificationId);

        // 保存到文件存储
        const saveResult = await fileStorage.saveData(key, readStatus);
        console.log('保存已读状态到文件存储结果:', saveResult);

        // 同时更新 localStorage 缓存
        try {
          localStorage.setItem(key, JSON.stringify(readStatus));
          console.log('已读状态已缓存到 localStorage');
        } catch (cacheError) {
          console.warn('将已读状态缓存到 localStorage 失败:', cacheError);
        }
      } else {
        console.log(`通知 ${notificationId} 已经标记为已读，无需重复标记`);
      }

      return true;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      return false;
    }
  },

  // 标记所有通知为已读
  markAllAsRead: async (userId) => {
    try {
      if (!userId) {
        console.warn('标记所有通知已读时用户ID为空');
        return false;
      }

      const key = `notification_read_${userId}`;
      console.log(`标记所有通知已读，键名: ${key}`);

      const userNotifications = await notificationManager.getUserNotifications(userId);
      console.log(`用户有 ${userNotifications.length} 条通知需要标记为已读`);

      const allIds = userNotifications.map(notification => notification.id);

      // 保存到文件存储
      const saveResult = await fileStorage.saveData(key, allIds);
      console.log('保存所有已读状态到文件存储结果:', saveResult);

      // 同时更新 localStorage 缓存
      try {
        localStorage.setItem(key, JSON.stringify(allIds));
        console.log('所有已读状态已缓存到 localStorage');
      } catch (cacheError) {
        console.warn('将所有已读状态缓存到 localStorage 失败:', cacheError);
      }

      return true;
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      return false;
    }
  },

  // 删除通知
  deleteNotification: async (notificationId) => {
    try {
      const notifications = await notificationManager.getAllNotifications();
      const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);

      await fileStorage.saveData('notifications', updatedNotifications);
      return true;
    } catch (error) {
      console.error('删除通知失败:', error);
      return false;
    }
  },

  // 获取通知详情
  getNotificationById: async (notificationId) => {
    try {
      const notifications = await notificationManager.getAllNotifications();
      return notifications.find(notification => notification.id === notificationId) || null;
    } catch (error) {
      console.error('获取通知详情失败:', error);
      return null;
    }
  }
};

export default notificationManager;
