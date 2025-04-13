// 交易记录管理器
// 用于管理用户的交易记录，包括充值和消费

// 导入文件存储服务
import { fileStorage } from './fileStorage';
import validator from './validator';

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// 获取当前时间的ISO字符串
const getCurrentTime = () => {
  return new Date().toISOString();
};

// 交易类型
export const TRANSACTION_TYPES = {
  RECHARGE: 'recharge',  // 充值
  CONSUMPTION: 'consumption',  // 消费
  REFUND: 'refund',  // 退款
  WITHDRAWAL: 'withdrawal'  // 提现
};

// 交易记录管理器
export const transactionManager = {
  // 创建新交易记录
  createTransaction: async (userId, amount, type, description, relatedId = null) => {
    try {
      // 验证参数
      if (!userId) {
        return { success: false, errors: { userId: '用户ID不能为空' } };
      }

      if (amount === undefined || amount === null || isNaN(amount)) {
        return { success: false, errors: { amount: '金额必须是有效数字' } };
      }

      // 验证交易类型
      const validTypes = Object.values(TRANSACTION_TYPES);
      if (!validTypes.includes(type)) {
        return { success: false, errors: { type: '无效的交易类型' } };
      }

      // 验证描述
      if (!description) {
        return { success: false, errors: { description: '交易描述不能为空' } };
      }

      const transactions = await transactionManager.getUserTransactions(userId);

      const newTransaction = {
        id: generateId(),
        userId,
        amount,
        type,
        description,
        relatedId,  // 关联ID，如订单ID、卡密ID等
        createdAt: getCurrentTime()
      };

      // 验证交易数据
      const validation = validator.validateTransaction(newTransaction);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      transactions.push(newTransaction);

      // 保存到文件存储
      await fileStorage.saveData(`transactions_${userId}`, transactions);

      return { success: true, transaction: newTransaction };
    } catch (error) {
      console.error('创建交易记录失败:', error);
      return { success: false, errors: { general: '创建交易记录失败' } };
    }
  },

  // 获取用户的所有交易记录
  getUserTransactions: async (userId) => {
    try {
      return await fileStorage.getData(`transactions_${userId}`) || [];
    } catch (error) {
      console.error('获取交易记录失败:', error);
      return [];
    }
  },

  // 获取所有交易记录（管理员功能）
  getAllTransactions: async () => {
    try {
      // 获取所有数据键
      const allKeys = await fileStorage.getAllKeys();
      const allTransactions = [];

      // 遍历所有交易记录键
      for (const key of allKeys) {
        if (key && key.startsWith('transactions_')) {
          const userId = key.replace('transactions_', '');
          const userTransactions = await transactionManager.getUserTransactions(userId);

          // 添加到总交易记录中
          allTransactions.push(...userTransactions);
        }
      }

      // 按时间排序，最新的在前面
      return allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('获取所有交易记录失败:', error);
      return [];
    }
  },

  // 获取交易记录详情
  getTransactionById: async (userId, transactionId) => {
    try {
      const transactions = await transactionManager.getUserTransactions(userId);
      return transactions.find(transaction => transaction.id === transactionId) || null;
    } catch (error) {
      console.error('获取交易记录详情失败:', error);
      return null;
    }
  },

  // 删除交易记录（管理员功能）
  deleteTransaction: async (userId, transactionId) => {
    try {
      const transactions = await transactionManager.getUserTransactions(userId);
      const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);

      // 保存到文件存储
      await fileStorage.saveData(`transactions_${userId}`, updatedTransactions);

      return true;
    } catch (error) {
      console.error('删除交易记录失败:', error);
      return false;
    }
  }
};

export default transactionManager;
