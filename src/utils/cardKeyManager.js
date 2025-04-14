/**
 * 卡密管理工具 - 管理卡密的生成、验证和使用
 */

// 导入文件存储服务
import { fileStorage } from './fileStorage';
import validator from './validator';

// 默认卡密数据
const defaultCardKeys = [];

// 初始化文件存储中的卡密数据
const initializeCardKeys = async () => {
  try {
    console.log('开始检查卡密数据...');
    const cardKeys = await fileStorage.getData('cardKeys');
    if (!cardKeys) {
      console.log('初始化卡密数据...');
      const result = await fileStorage.saveData('cardKeys', defaultCardKeys);
      console.log('卡密数据初始化结果:', result);
      if (result) {
        console.log('卡密数据初始化成功');
      } else {
        console.error('卡密数据初始化失败');
      }
    } else {
      console.log('卡密数据已存在，无需初始化');
    }
  } catch (error) {
    console.error('初始化卡密数据失败:', error);
  }
};

// 延迟初始化卡密数据
// 不在模块加载时立即执行，而是在需要时才初始化
let initialized = false;

const lazyInitialize = async () => {
  if (initialized) return;

  console.log('执行卡密数据延迟初始化...');
  await initializeCardKeys();
  // 添加测试卡密，确保有可用的卡密
  await createTestCardKeys();

  initialized = true;
  console.log('卡密数据初始化完成');
};

// 创建测试卡密
const createTestCardKeys = async () => {
  try {
    // 检查是否已有卡密
    const existingCardKeys = await fileStorage.getData('cardKeys') || [];

    // 如果已有卡密，不再创建测试卡密
    if (existingCardKeys.length > 0) {
      console.log('已存在卡密，无需创建测试卡密');
      return;
    }

    console.log('创建测试卡密...');
    // 创建一些测试卡密
    const testCardKeys = [
      {
        id: `card_test_1`,
        code: 'TEST1234ABCD5678',
        amount: 100,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        isUsed: false,
        usedAt: null,
        usedBy: null
      },
      {
        id: `card_test_2`,
        code: 'ABCD5678TEST1234',
        amount: 200,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        isUsed: false,
        usedAt: null,
        usedBy: null
      }
    ];

    // 保存测试卡密
    await fileStorage.saveData('cardKeys', testCardKeys);
    console.log('测试卡密创建成功');
  } catch (error) {
    console.error('创建测试卡密失败:', error);
  }
};

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
  getAllCardKeys: async () => {
    try {
      // 确保卡密数据已初始化
      await lazyInitialize();
      return await fileStorage.getData('cardKeys') || [];
    } catch (error) {
      console.error('获取卡密列表失败:', error);
      return [];
    }
  },

  // 获取卡密详情
  getCardKeyByCode: async (code) => {
    try {
      // 确保卡密数据已初始化
      await lazyInitialize();
      const cardKeys = await fileStorage.getData('cardKeys') || [];
      return cardKeys.find(key => key.code === code) || null;
    } catch (error) {
      console.error('获取卡密详情失败:', error);
      return null;
    }
  },

  // 创建新卡密
  createCardKey: async (amount, count = 1, expiresInDays = 30) => {
    try {
      // 确保卡密数据已初始化
      await lazyInitialize();

      // 验证参数
      if (!amount || isNaN(amount) || amount <= 0) {
        return { success: false, errors: { amount: '金额必须大于0' } };
      }

      if (!count || isNaN(count) || count <= 0 || count > 100) {
        return { success: false, errors: { count: '生成数量必须在1-100之间' } };
      }

      if (!expiresInDays || isNaN(expiresInDays) || expiresInDays <= 0) {
        return { success: false, errors: { expiresInDays: '过期天数必须大于0' } };
      }

      console.log('开始获取卡密数据...');
      const cardKeys = await fileStorage.getData('cardKeys') || [];
      console.log('当前卡密数量:', cardKeys.length);
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

      console.log('开始保存卡密数据...');
      const saveResult = await fileStorage.saveData('cardKeys', cardKeys);
      console.log('卡密数据保存结果:', saveResult);

      // 保存成功后的处理
      if (saveResult) {
        console.log('卡密数据保存成功');
      }

      return {
        success: saveResult,
        message: saveResult ? `成功生成${count}张卡密` : '生成卡密失败',
        cardKeys: newCardKeys
      };
    } catch (error) {
      console.error('生成卡密失败:', error);
      return { success: false, message: '生成卡密失败: ' + error.message };
    }
  },

  // 验证卡密
  validateCardKey: async (code) => {
    try {
      // 确保卡密数据已初始化
      await lazyInitialize();

      // 验证卡密格式
      if (!code) {
        return { valid: false, message: '卡密不能为空' };
      }

      // 移除可能的格式化字符（如连字符）
      code = code.replace(/-/g, '');

      // 验证卡密长度
      if (code.length !== 16) {
        return { valid: false, message: '卡密必须为16位' };
      }

      // 验证卡密格式（只允许大写字母和数字）
      if (!/^[A-Z0-9]+$/.test(code)) {
        return { valid: false, message: '卡密格式不正确，只允许大写字母和数字' };
      }

      // 直接从文件存储获取卡密数据
      console.log('从文件存储获取卡密数据...');
      const cardKeys = await fileStorage.getData('cardKeys') || [];
      console.log('从文件存储获取到卡密数量:', cardKeys.length);

      console.log('当前卡密数量:', cardKeys.length);
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
  useCardKey: async (code, userId) => {
    try {
      // 确保卡密数据已初始化
      await lazyInitialize();

      // 验证参数
      if (!code) {
        return { success: false, errors: { code: '卡密不能为空' } };
      }

      if (!userId) {
        return { success: false, errors: { userId: '用户ID不能为空' } };
      }

      // 移除可能的格式化字符（如连字符）
      code = code.replace(/-/g, '');

      console.log(`开始验证卡密: ${code}`);
      // 先验证卡密
      const validationResult = await cardKeyManager.validateCardKey(code);
      console.log('卡密验证结果:', validationResult);

      if (!validationResult.valid) {
        return { success: false, message: validationResult.message };
      }

      console.log('开始获取卡密数据...');
      const cardKeys = await fileStorage.getData('cardKeys') || [];
      console.log('当前卡密数量:', cardKeys.length);

      const cardKeyIndex = cardKeys.findIndex(key => key.code === code);
      console.log('卡密索引:', cardKeyIndex);

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

      console.log('开始保存更新后的卡密数据...');
      const saveResult = await fileStorage.saveData('cardKeys', cardKeys);
      console.log('卡密数据保存结果:', saveResult);

      if (saveResult) {
        console.log('卡密状态更新成功');
      } else {
        return { success: false, message: '保存卡密状态失败' };
      }

      return {
        success: true,
        message: '卡密使用成功',
        amount: cardKeys[cardKeyIndex].amount,
        cardKey: cardKeys[cardKeyIndex]
      };
    } catch (error) {
      console.error('使用卡密失败:', error);
      return { success: false, message: '使用卡密时出错: ' + error.message };
    }
  },

  // 删除卡密
  deleteCardKey: async (id) => {
    try {
      // 确保卡密数据已初始化
      await lazyInitialize();

      if (!id) return false;

      console.log('开始获取卡密数据...');
      const cardKeys = await fileStorage.getData('cardKeys') || [];
      console.log('当前卡密数量:', cardKeys.length);

      const updatedCardKeys = cardKeys.filter(key => key.id !== id);

      if (updatedCardKeys.length === cardKeys.length) {
        console.log('没有找到要删除的卡密:', id);
        return false; // 没有找到要删除的卡密
      }

      console.log('开始保存更新后的卡密数据...');
      const saveResult = await fileStorage.saveData('cardKeys', updatedCardKeys);
      console.log('卡密数据保存结果:', saveResult);

      if (saveResult) {
        console.log('卡密删除成功');
        return true;
      } else {
        console.error('保存更新后的卡密数据失败');
        return false;
      }
    } catch (error) {
      console.error('删除卡密失败:', error);
      return false;
    }
  }
};
