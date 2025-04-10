/**
 * 卡密管理工具 - 管理卡密的生成、验证和使用
 */

// 生成随机卡密
const generateRandomKey = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 格式化卡密显示（每4个字符加一个连字符）
export const formatCardKey = (key) => {
  if (!key) return '';
  return key.replace(/(.{4})/g, '$1-').slice(0, -1);
};

export const cardKeyManager = {
  // 获取所有卡密
  getAllCardKeys: () => {
    try {
      return JSON.parse(localStorage.getItem('cardKeys') || '[]');
    } catch (error) {
      console.error('获取卡密列表失败:', error);
      return [];
    }
  },

  // 获取卡密详情
  getCardKeyByCode: (code) => {
    try {
      const cardKeys = JSON.parse(localStorage.getItem('cardKeys') || '[]');
      return cardKeys.find(key => key.code === code) || null;
    } catch (error) {
      console.error('获取卡密详情失败:', error);
      return null;
    }
  },

  // 创建新卡密
  createCardKey: (amount, count = 1, expiresInDays = 30) => {
    try {
      if (!amount || amount <= 0) {
        return { success: false, message: '金额必须大于0' };
      }

      const cardKeys = JSON.parse(localStorage.getItem('cardKeys') || '[]');
      const newCardKeys = [];

      // 设置过期时间
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // 生成指定数量的卡密
      for (let i = 0; i < count; i++) {
        // 生成唯一卡密
        let code;
        do {
          code = generateRandomKey();
        } while (cardKeys.some(key => key.code === code));

        const newCardKey = {
          id: `card_${Date.now()}_${i}`,
          code,
          amount,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          isUsed: false,
          usedAt: null,
          usedBy: null
        };

        cardKeys.push(newCardKey);
        newCardKeys.push(newCardKey);
      }

      localStorage.setItem('cardKeys', JSON.stringify(cardKeys));
      return { 
        success: true, 
        message: `成功生成${count}张卡密`, 
        cardKeys: newCardKeys 
      };
    } catch (error) {
      console.error('生成卡密失败:', error);
      return { success: false, message: '生成卡密失败: ' + error.message };
    }
  },

  // 验证卡密
  validateCardKey: (code) => {
    try {
      if (!code) return { valid: false, message: '卡密不能为空' };

      // 移除可能的格式化字符（如连字符）
      code = code.replace(/-/g, '');

      const cardKeys = JSON.parse(localStorage.getItem('cardKeys') || '[]');
      const cardKey = cardKeys.find(key => key.code === code);

      if (!cardKey) {
        return { valid: false, message: '无效的卡密' };
      }

      // 检查是否已使用
      if (cardKey.isUsed) {
        return { valid: false, message: '卡密已被使用' };
      }

      // 检查是否过期
      const now = new Date();
      const expiresAt = new Date(cardKey.expiresAt);
      if (now > expiresAt) {
        return { valid: false, message: '卡密已过期' };
      }

      return { 
        valid: true, 
        message: '卡密有效', 
        amount: cardKey.amount 
      };
    } catch (error) {
      console.error('验证卡密失败:', error);
      return { valid: false, message: '验证卡密时出错' };
    }
  },

  // 使用卡密
  useCardKey: (code, userId) => {
    try {
      if (!code || !userId) return { success: false, message: '参数不完整' };

      // 移除可能的格式化字符（如连字符）
      code = code.replace(/-/g, '');

      // 先验证卡密
      const validationResult = cardKeyManager.validateCardKey(code);
      if (!validationResult.valid) {
        return { success: false, message: validationResult.message };
      }

      const cardKeys = JSON.parse(localStorage.getItem('cardKeys') || '[]');
      const cardKeyIndex = cardKeys.findIndex(key => key.code === code);

      if (cardKeyIndex === -1) {
        return { success: false, message: '找不到卡密' };
      }

      // 标记卡密为已使用
      cardKeys[cardKeyIndex] = {
        ...cardKeys[cardKeyIndex],
        isUsed: true,
        usedAt: new Date().toISOString(),
        usedBy: userId
      };

      localStorage.setItem('cardKeys', JSON.stringify(cardKeys));

      return { 
        success: true, 
        message: '卡密使用成功', 
        amount: cardKeys[cardKeyIndex].amount 
      };
    } catch (error) {
      console.error('使用卡密失败:', error);
      return { success: false, message: '使用卡密时出错: ' + error.message };
    }
  },

  // 删除卡密
  deleteCardKey: (id) => {
    try {
      if (!id) return false;

      const cardKeys = JSON.parse(localStorage.getItem('cardKeys') || '[]');
      const updatedCardKeys = cardKeys.filter(key => key.id !== id);

      if (updatedCardKeys.length === cardKeys.length) {
        return false; // 没有找到要删除的卡密
      }

      localStorage.setItem('cardKeys', JSON.stringify(updatedCardKeys));
      return true;
    } catch (error) {
      console.error('删除卡密失败:', error);
      return false;
    }
  }
};
