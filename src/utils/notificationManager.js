// 通知管理器
// 用于管理系统通知，包括创建、获取、标记已读等功能

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
  createNotification: (title, content, type = 'info', isGlobal = true) => {
    try {
      const notifications = notificationManager.getAllNotifications();
      
      const newNotification = {
        id: generateId(),
        title,
        content,
        type, // 'info', 'success', 'warning', 'error'
        isGlobal, // 是否全局通知
        createdAt: getCurrentTime(),
        isRead: false
      };
      
      notifications.push(newNotification);
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      return newNotification;
    } catch (error) {
      console.error('创建通知失败:', error);
      return null;
    }
  },
  
  // 获取所有通知
  getAllNotifications: () => {
    try {
      const notificationsData = localStorage.getItem('notifications');
      return notificationsData ? JSON.parse(notificationsData) : [];
    } catch (error) {
      console.error('获取通知失败:', error);
      return [];
    }
  },
  
  // 获取用户未读通知
  getUnreadNotifications: (userId) => {
    try {
      const allNotifications = notificationManager.getAllNotifications();
      const userReadStatus = notificationManager.getUserReadStatus(userId);
      
      // 过滤出用户未读的通知
      return allNotifications.filter(notification => {
        // 如果通知ID不在已读列表中，则为未读
        return !userReadStatus.includes(notification.id);
      });
    } catch (error) {
      console.error('获取未读通知失败:', error);
      return [];
    }
  },
  
  // 获取用户已读通知ID列表
  getUserReadStatus: (userId) => {
    try {
      const key = `notification_read_${userId}`;
      const readStatusData = localStorage.getItem(key);
      return readStatusData ? JSON.parse(readStatusData) : [];
    } catch (error) {
      console.error('获取用户已读状态失败:', error);
      return [];
    }
  },
  
  // 标记通知为已读
  markAsRead: (userId, notificationId) => {
    try {
      const key = `notification_read_${userId}`;
      const readStatus = notificationManager.getUserReadStatus(userId);
      
      // 如果通知ID不在已读列表中，添加它
      if (!readStatus.includes(notificationId)) {
        readStatus.push(notificationId);
        localStorage.setItem(key, JSON.stringify(readStatus));
      }
      
      return true;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      return false;
    }
  },
  
  // 标记所有通知为已读
  markAllAsRead: (userId) => {
    try {
      const key = `notification_read_${userId}`;
      const allNotifications = notificationManager.getAllNotifications();
      const allIds = allNotifications.map(notification => notification.id);
      
      localStorage.setItem(key, JSON.stringify(allIds));
      return true;
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      return false;
    }
  },
  
  // 删除通知
  deleteNotification: (notificationId) => {
    try {
      const notifications = notificationManager.getAllNotifications();
      const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return true;
    } catch (error) {
      console.error('删除通知失败:', error);
      return false;
    }
  },
  
  // 获取通知详情
  getNotificationById: (notificationId) => {
    try {
      const notifications = notificationManager.getAllNotifications();
      return notifications.find(notification => notification.id === notificationId) || null;
    } catch (error) {
      console.error('获取通知详情失败:', error);
      return null;
    }
  }
};

export default notificationManager;
