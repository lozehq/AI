const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3030;

// 数据目录
const DATA_DIR = path.join(__dirname, 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的方法
  allowedHeaders: ['Content-Type', 'Authorization'] // 允许的头部
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('dist')); // 为前端构建文件提供服务

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 添加路由别名，将 /auth/* 路由到 /api/auth/*
app.use('/auth', (req, res, next) => {
  console.log(`路由别名: /auth${req.url} -> /api/auth${req.url}`);
  req.url = `/api/auth${req.url}`;
  next('route');
});

// 生成随机令牌
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 会话存储
const sessions = {};

// 会话中间件
app.use((req, res, next) => {
  // 打印请求头部信息，用于调试
  console.log('请求头部:', req.headers);

  // 获取令牌
  const token = req.headers['authorization'];
  console.log('收到的令牌:', token);

  if (token && sessions[token]) {
    // 检查会话是否过期
    const now = new Date();
    const expiresAt = new Date(sessions[token].expiresAt);

    if (now > expiresAt) {
      // 会话已过期，删除会话
      console.log('会话已过期:', token);
      delete sessions[token];
    } else {
      // 会话有效，设置用户ID
      req.session = sessions[token];
      req.userId = sessions[token].userId;
      console.log('当前用户ID:', req.userId);
    }
  }

  next();
});

// 获取所有数据存储键
app.get('/api/keys', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR);
    const keys = files.map(file => path.basename(file, '.json'));
    res.json({ success: true, keys });
  } catch (error) {
    console.error('获取数据键失败:', error);
    res.status(500).json({ success: false, message: '获取数据键失败', error: error.message });
  }
});

// 获取数据
app.get('/api/data/:key', (req, res) => {
  try {
    const { key } = req.params;
    const filePath = path.join(DATA_DIR, `${key}.json`);

    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, data: null });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({ success: true, data });
  } catch (error) {
    console.error(`获取数据 ${req.params.key} 失败:`, error);
    res.status(500).json({ success: false, message: '获取数据失败', error: error.message });
  }
});

// 保存数据
app.post('/api/data/:key', (req, res) => {
  try {
    const { key } = req.params;
    const { data } = req.body;
    const filePath = path.join(DATA_DIR, `${key}.json`);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true, message: '数据保存成功' });
  } catch (error) {
    console.error(`保存数据 ${req.params.key} 失败:`, error);
    res.status(500).json({ success: false, message: '保存数据失败', error: error.message });
  }
});

// 删除数据
app.delete('/api/data/:key', (req, res) => {
  try {
    const { key } = req.params;
    const filePath = path.join(DATA_DIR, `${key}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: '数据删除成功' });
  } catch (error) {
    console.error(`删除数据 ${req.params.key} 失败:`, error);
    res.status(500).json({ success: false, message: '删除数据失败', error: error.message });
  }
});

// 认证相关的API

// 登录
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // 读取用户数据
    const filePath = path.join(DATA_DIR, 'users.json');
    if (!fs.existsSync(filePath)) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const users = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const user = users.find(u =>
      (u.name === username || u.email === username) &&
      u.password === password
    );

    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 创建会话
    const token = generateToken();
    sessions[token] = {
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
    };

    // 返回用户信息和令牌
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword, token });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败，请重试' });
  }
});

// 注销
app.post('/api/auth/logout', (req, res) => {
  try {
    const token = req.headers['authorization'];
    console.log('注销请求，令牌:', token);

    if (token && sessions[token]) {
      delete sessions[token];
      console.log('已删除会话:', token);
    } else {
      console.log('未找到会话或令牌无效');
    }
    res.json({ success: true });
  } catch (error) {
    console.error('注销失败:', error);
    res.status(500).json({ success: false, message: '注销失败，请重试' });
  }
});

// 获取当前用户
app.get('/api/auth/me', (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    // 读取用户数据
    const filePath = path.join(DATA_DIR, 'users.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const users = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('获取当前用户失败:', error);
    res.status(500).json({ success: false, message: '获取当前用户失败，请重试' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
