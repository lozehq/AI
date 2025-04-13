/**
 * 邀请码管理工具
 * 用于管理普通邀请码和管理员邀请码
 */

// 导入文件存储服务
import { fileStorage } from './fileStorage';

// 默认邀请码数据
const defaultInviteCodes = [
  {
    "code": "WELCOME2024",
    "isAdmin": false,
    "usageLimit": 100,
    "usedCount": 0,
    "createdAt": new Date().toISOString(),
    "expiresAt": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() // 一年后过期
  },
  {
    "code": "ADMIN2024",
    "isAdmin": true,
    "usageLimit": 5,
    "usedCount": 0,
    "createdAt": new Date().toISOString(),
    "expiresAt": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() // 一年后过期
  }
];

// 初始化文件存储中的邀请码数据
const initializeInviteCodes = async () => {
  const inviteCodes = await fileStorage.getData('inviteCodes');
  if (!inviteCodes) {
    await fileStorage.saveData('inviteCodes', defaultInviteCodes);
  }
};

// 初始化
initializeInviteCodes();

/**
 * 邀请码相关功能
 */
export const inviteCodeManager = {
  // 获取所有邀请码
  getAllInviteCodes: async () => {
    try {
      return await fileStorage.getData('inviteCodes') || [];
    } catch (error) {
      console.error('获取邀请码失败:', error);
      return [];
    }
  },

  // 验证邀请码
  validateInviteCode: async (code) => {
    try {
      if (!code) return { valid: false, message: '邀请码不能为空', isAdmin: false };

      const inviteCodes = await fileStorage.getData('inviteCodes') || [];
      const inviteCode = inviteCodes.find(ic => ic.code === code);

      if (!inviteCode) {
        return { valid: false, message: '无效的邀请码', isAdmin: false };
      }

      // 检查使用次数
      if (inviteCode.usedCount >= inviteCode.usageLimit) {
        return { valid: false, message: '邀请码已达到使用上限', isAdmin: false };
      }

      // 检查过期时间
      const now = new Date();
      const expiresAt = new Date(inviteCode.expiresAt);
      if (now > expiresAt) {
        return { valid: false, message: '邀请码已过期', isAdmin: false };
      }

      return {
        valid: true,
        message: '邀请码有效' + (inviteCode.isAdmin ? ' (管理员)' : ''),
        isAdmin: inviteCode.isAdmin
      };
    } catch (error) {
      console.error('验证邀请码失败:', error);
      return { valid: false, message: '验证邀请码时出错', isAdmin: false };
    }
  },

  // 使用邀请码（增加使用次数）
  useInviteCode: async (code) => {
    try {
      if (!code) return { success: false, message: '邀请码不能为空' };

      const inviteCodes = await fileStorage.getData('inviteCodes') || [];
      const index = inviteCodes.findIndex(ic => ic.code === code);

      if (index === -1) return { success: false, message: '无效的邀请码' };

      // 检查使用次数
      if (inviteCodes[index].usedCount >= inviteCodes[index].usageLimit) {
        return { success: false, message: '邀请码已达到使用上限' };
      }

      // 检查过期时间
      const now = new Date();
      const expiresAt = new Date(inviteCodes[index].expiresAt);
      if (now > expiresAt) {
        return { success: false, message: '邀请码已过期' };
      }

      // 增加使用次数
      inviteCodes[index].usedCount += 1;
      await fileStorage.saveData('inviteCodes', inviteCodes);

      return {
        success: true,
        message: '邀请码使用成功',
        isAdmin: inviteCodes[index].isAdmin
      };
    } catch (error) {
      console.error('使用邀请码失败:', error);
      return { success: false, message: '使用邀请码时出错: ' + error.message };
    }
  },

  // 创建新邀请码
  createInviteCode: async (codeData) => {
    try {
      const inviteCodes = await fileStorage.getData('inviteCodes') || [];

      // 检查邀请码是否已存在
      if (inviteCodes.some(ic => ic.code === codeData.code)) {
        return { success: false, message: '邀请码已存在' };
      }

      // 创建新邀请码
      const newInviteCode = {
        code: codeData.code,
        isAdmin: !!codeData.isAdmin,
        usageLimit: codeData.usageLimit || 10,
        usedCount: 0,
        createdAt: new Date().toISOString(),
        expiresAt: codeData.expiresAt || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      };

      inviteCodes.push(newInviteCode);
      await fileStorage.saveData('inviteCodes', inviteCodes);

      return { success: true, message: '邀请码创建成功', inviteCode: newInviteCode };
    } catch (error) {
      console.error('创建邀请码失败:', error);
      return { success: false, message: '创建邀请码失败: ' + error.message };
    }
  },

  // 删除邀请码
  deleteInviteCode: async (code) => {
    try {
      if (!code) return false;

      const inviteCodes = await fileStorage.getData('inviteCodes') || [];
      const filteredCodes = inviteCodes.filter(ic => ic.code !== code);

      if (filteredCodes.length === inviteCodes.length) {
        return false; // 没有找到要删除的邀请码
      }

      await fileStorage.saveData('inviteCodes', filteredCodes);
      return true;
    } catch (error) {
      console.error('删除邀请码失败:', error);
      return false;
    }
  },

  // 重置所有邀请码
  resetInviteCodes: async () => {
    try {
      await fileStorage.saveData('inviteCodes', defaultInviteCodes);
      return true;
    } catch (error) {
      console.error('重置邀请码失败:', error);
      return false;
    }
  }
};
