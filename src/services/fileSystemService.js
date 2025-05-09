/**
 * 文件系统服务
 * 用于将数据保存在项目文件夹中
 */

// 模拟文件系统路径
const DATA_DIR = 'data';

// 导入 Node.js 的 fs 模块（如果在 Node.js 环境中）
let fs;
try {
  fs = require('fs');
} catch (error) {
  console.warn('fs 模块不可用，将使用模拟文件系统');
  fs = null;
}

// 导入 Node.js 的 path 模块（如果在 Node.js 环境中）
let path;
try {
  path = require('path');
} catch (error) {
  console.warn('path 模块不可用，将使用模拟文件系统');
  path = null;
}

// 检查是否在 Node.js 环境中
const isNodeEnvironment = typeof process !== 'undefined' && process.versions && process.versions.node;

// 模拟文件系统（用于浏览器环境）
const mockFileSystem = {
  files: {},

  // 初始化目录
  initDirectory: (dirPath) => {
    // 在浏览器环境中，我们不需要真正创建目录
    // 只需要确保我们记录了这个目录的存在
    console.log(`初始化模拟目录: ${dirPath}`);
    return true;
  },

  // 读取文件
  readFile: (filePath) => {
    console.log(`模拟读取文件: ${filePath}`);
    return mockFileSystem.files[filePath] || null;
  },

  // 写入文件
  writeFile: (filePath, data) => {
    console.log(`模拟写入文件: ${filePath}`);
    mockFileSystem.files[filePath] = data;
    return true;
  },

  // 删除文件
  deleteFile: (filePath) => {
    console.log(`模拟删除文件: ${filePath}`);
    if (mockFileSystem.files[filePath]) {
      delete mockFileSystem.files[filePath];
      return true;
    }
    return false;
  },

  // 检查文件是否存在
  existsFile: (filePath) => {
    const exists = !!mockFileSystem.files[filePath];
    console.log(`检查模拟文件是否存在: ${filePath}, 结果: ${exists}`);
    return exists;
  },

  // 获取所有文件
  getAllFiles: () => {
    const files = Object.keys(mockFileSystem.files);
    console.log(`获取所有模拟文件: ${files.length} 个文件`);
    return files;
  }
};

/**
 * 文件系统服务
 */
export const fileSystemService = {
  /**
   * 读取文件
   * @param {string} key - 数据键
   * @returns {Promise<any>} - 读取的数据
   */
  readFile: async (key) => {
    try {
      console.log(`开始读取文件 ${key}`);

      // 尝试从 localStorage 读取
      try {
        const localData = localStorage.getItem(`data_${key}`);
        if (localData) {
          console.log(`从 localStorage 成功读取数据: ${key}`);
          return JSON.parse(localData);
        }
      } catch (localError) {
        console.warn(`从 localStorage 读取数据失败: ${localError}`);
      }

      // 构建文件路径
      const filePath = isNodeEnvironment
        ? path.join(DATA_DIR, `${key}.json`)
        : `${DATA_DIR}/${key}.json`;

      // 在 Node.js 环境中使用 fs 模块
      if (isNodeEnvironment && fs) {
        // 确保目录存在
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          console.warn(`文件 ${filePath} 不存在`);
          return null;
        }

        // 读取文件
        const data = fs.readFileSync(filePath, 'utf8');
        console.log(`成功读取文件 ${filePath}`);

        // 解析 JSON 数据
        const parsedData = JSON.parse(data);

        // 只同步到 localStorage
        try {
          localStorage.setItem(`data_${key}`, data);
        } catch (syncError) {
          console.warn(`同步数据到 localStorage 失败: ${syncError}`);
        }

        return parsedData;
      }
      // 在浏览器环境中使用模拟文件系统
      else {
        // 检查文件是否存在
        if (!mockFileSystem.existsFile(filePath)) {
          console.warn(`文件 ${filePath} 不存在`);
          return null;
        }

        // 读取文件
        const data = mockFileSystem.readFile(filePath);
        console.log(`成功读取文件 ${filePath}`);

        // 只同步到 localStorage
        try {
          localStorage.setItem(`data_${key}`, JSON.stringify(data));
        } catch (syncError) {
          console.warn(`同步数据到 localStorage 失败: ${syncError}`);
        }

        return data;
      }
    } catch (error) {
      console.error(`读取文件 ${key} 失败:`, error);
      return null;
    }
  },

  /**
   * 写入文件
   * @param {string} key - 数据键
   * @param {any} data - 要写入的数据
   * @returns {Promise<boolean>} - 是否写入成功
   */
  writeFile: async (key, data) => {
    try {
      console.log(`开始写入文件 ${key}`);
      let success = false;

      // 尝试写入 localStorage
      try {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(`data_${key}`, jsonData);
        console.log(`成功写入数据到 localStorage: ${key}`);
        success = true;
      } catch (localError) {
        console.warn(`写入数据到 localStorage 失败: ${localError}`);
      }

      // 构建文件路径
      const filePath = isNodeEnvironment
        ? path.join(DATA_DIR, `${key}.json`)
        : `${DATA_DIR}/${key}.json`;

      // 在 Node.js 环境中使用 fs 模块
      if (isNodeEnvironment && fs) {
        // 确保目录存在
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        // 将数据转换为 JSON 字符串
        const jsonData = JSON.stringify(data, null, 2);

        // 写入文件
        fs.writeFileSync(filePath, jsonData, 'utf8');
        console.log(`成功写入文件 ${filePath}`);

        return true;
      }
      // 在浏览器环境中使用模拟文件系统
      else {
        // 初始化目录
        mockFileSystem.initDirectory(DATA_DIR);

        // 将数据转换为 JSON 字符串（如果不是字符串）
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

        // 写入文件
        mockFileSystem.writeFile(filePath, data);
        console.log(`成功写入文件 ${filePath}`);

        return true;
      }

      return success;
    } catch (error) {
      console.error(`写入文件 ${key} 失败:`, error);
      return false;
    }
  },

  /**
   * 删除文件
   * @param {string} key - 数据键
   * @returns {Promise<boolean>} - 是否删除成功
   */
  deleteFile: async (key) => {
    try {
      console.log(`开始删除文件 ${key}`);
      let success = false;

      // 删除 localStorage 中的数据
      try {
        localStorage.removeItem(`data_${key}`);
        console.log(`成功从 localStorage 删除数据: ${key}`);
        success = true;
      } catch (localError) {
        console.warn(`从 localStorage 删除数据失败: ${localError}`);
      }

      // 构建文件路径
      const filePath = isNodeEnvironment
        ? path.join(DATA_DIR, `${key}.json`)
        : `${DATA_DIR}/${key}.json`;

      // 在 Node.js 环境中使用 fs 模块
      if (isNodeEnvironment && fs) {
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          console.warn(`文件 ${filePath} 不存在`);
          return success;
        }

        // 删除文件
        fs.unlinkSync(filePath);
        console.log(`成功删除文件 ${filePath}`);

        return true;
      }
      // 在浏览器环境中使用模拟文件系统
      else {
        // 检查文件是否存在
        if (!mockFileSystem.existsFile(filePath)) {
          console.warn(`文件 ${filePath} 不存在`);
          return success;
        }

        // 删除文件
        mockFileSystem.deleteFile(filePath);
        console.log(`成功删除文件 ${filePath}`);

        return true;
      }
    } catch (error) {
      console.error(`删除文件 ${key} 失败:`, error);
      return false;
    }
  },

  /**
   * 获取所有文件
   * @returns {Promise<string[]>} - 所有文件的键
   */
  getAllFiles: async () => {
    try {
      console.log('开始获取所有文件');

      // 在 Node.js 环境中使用 fs 模块
      if (isNodeEnvironment && fs) {
        // 确保目录存在
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
          return [];
        }

        // 读取目录
        const files = fs.readdirSync(DATA_DIR);

        // 过滤出 JSON 文件并提取键
        const keys = files
          .filter(file => file.endsWith('.json'))
          .map(file => file.replace('.json', ''));

        console.log('成功获取所有文件:', keys);

        return keys;
      }
      // 在浏览器环境中使用模拟文件系统
      else {
        // 获取所有文件
        const files = mockFileSystem.getAllFiles();

        // 过滤出指定目录的 JSON 文件并提取键
        const keys = files
          .filter(file => file.startsWith(`${DATA_DIR}/`) && file.endsWith('.json'))
          .map(file => file.replace(`${DATA_DIR}/`, '').replace('.json', ''));

        console.log('成功获取所有文件:', keys);

        return keys;
      }
    } catch (error) {
      console.error('获取所有文件失败:', error);
      return [];
    }
  },

  /**
   * 检查文件是否存在
   * @param {string} key - 数据键
   * @returns {Promise<boolean>} - 文件是否存在
   */
  existsFile: async (key) => {
    try {
      // 构建文件路径
      const filePath = isNodeEnvironment
        ? path.join(DATA_DIR, `${key}.json`)
        : `${DATA_DIR}/${key}.json`;

      // 在 Node.js 环境中使用 fs 模块
      if (isNodeEnvironment && fs) {
        return fs.existsSync(filePath);
      }
      // 在浏览器环境中使用模拟文件系统
      else {
        return mockFileSystem.existsFile(filePath);
      }
    } catch (error) {
      console.error(`检查文件 ${key} 是否存在失败:`, error);
      return false;
    }
  }
};
