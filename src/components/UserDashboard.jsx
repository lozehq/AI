import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../contexts/ErrorContext';

// 导入数据管理工具
import { orderManager, userManager } from '../utils/dataManager';
import { cardKeyManager, formatCardKey } from '../utils/cardKeyManager';
import { transactionManager, TRANSACTION_TYPES } from '../utils/transactionManager';
import { formatCurrency } from '../utils/formatters';

// 空的订单数组
const mockOrders = [];

// Service name mapping
const serviceNames = {
  views: '播放量',
  likes: '点赞数',
  shares: '分享数',
  saves: '收藏量',
  completionRate: '完播率'
};

// Status mapping
const statusColors = {
  completed: 'success',
  in_progress: 'info',
  pending: 'warning',
  failed: 'error'
};

const statusLabels = {
  completed: '已完成',
  in_progress: '进行中',
  pending: '待处理',
  failed: '失败'
};

const UserDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 获取URL参数中的标签值
  const tabParam = searchParams.get('tab');

  // 根据URL参数设置初始标签值
  const getInitialTabValue = () => {
    if (tabParam === 'wallet') return 1;
    if (tabParam === 'settings') return 2;
    return 0; // 默认显示订单记录
  };

  const [tabValue, setTabValue] = useState(getInitialTabValue());
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, setCurrentUser } = useAuth();
  const { showError } = useError();

  // 成功提示函数
  const showSuccess = (message, severity = 'success') => {
    showError(message, severity);
  };

  // 个人信息表单状态
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // 密码表单状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 不再需要单独的提示消息状态，使用 ErrorContext 代替

  // 加载用户数据
  useEffect(() => {
    if (currentUser) {
      // 初始化个人信息表单
      setUserForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });

      // 加载用户的订单和交易记录
      const loadUserData = async () => {
        try {
          // 加载用户的订单
          const userOrders = await orderManager.getOrdersByUserId(currentUser.id);
          setOrders(userOrders);

          // 加载用户的交易记录
          const userTransactions = await transactionManager.getUserTransactions(currentUser.id);
          setTransactions(userTransactions);
        } catch (error) {
          console.error('加载用户数据失败:', error);
          showError('加载用户数据失败，请重试', 'error');
        }
      };

      loadUserData();
    }
  }, [currentUser, showError]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    // 更新URL参数
    let tabParam = '';
    if (newValue === 1) tabParam = 'wallet';
    if (newValue === 2) tabParam = 'settings';

    if (tabParam) {
      navigate(`/dashboard?tab=${tabParam}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // 不再需要显示提示消息的函数，因为使用 ErrorContext 处理

  // 不再需要关闭提示消息的函数，因为使用 ErrorContext 处理

  // 处理个人信息表单变化
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value
    });
  };

  // 处理密码表单变化
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  // 保存个人信息
  const handleSaveUserInfo = () => {
    if (!currentUser) return;

    try {
      // 更新用户信息
      const updatedUser = {
        ...currentUser,
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone
      };

      // 使用userManager更新用户信息
      const result = userManager.updateUser(currentUser.id, {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone
      });

      if (result) {
        // 不再需要更新本地存储，因为使用 AuthContext 管理用户状态
        // 只需要更新当前组件中的用户状态
        setCurrentUser(updatedUser);
        showError('个人信息已成功更新', 'success');
      } else {
        showError('更新个人信息失败', 'error');
      }
    } catch (error) {
      console.error('保存个人信息失败:', error);
      showError('保存个人信息失败', 'error');
    }
  };

  // 更新密码
  const handleUpdatePassword = () => {
    if (!currentUser) return;

    // 验证表单
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showError('请填写所有密码字段', 'warning');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('新密码与确认密码不一致', 'warning');
      return;
    }

    // 验证当前密码
    if (passwordForm.currentPassword !== currentUser.password) {
      showError('当前密码不正确', 'error');
      return;
    }

    try {
      // 更新用户密码
      const updatedUser = {
        ...currentUser,
        password: passwordForm.newPassword
      };

      // 使用userManager更新用户密码
      const result = userManager.updateUser(currentUser.id, {
        password: passwordForm.newPassword
      });

      if (result) {
        // 不再需要更新本地存储，因为使用 AuthContext 管理用户状态
        // 只需要更新当前组件中的用户状态
        setCurrentUser(updatedUser);

        // 重置密码表单
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        showError('密码已成功更新', 'success');
      } else {
        showError('更新密码失败', 'error');
      }
    } catch (error) {
      console.error('更新密码失败:', error);
      showError('更新密码失败', 'error');
    }
  };

  // 卡密充值表单状态
  const [cardKeyForm, setCardKeyForm] = useState({
    code: ''
  });

  // 卡密充值对话框
  const [rechargeDialog, setRechargeDialog] = useState(false);

  // 处理卡密表单变化
  const handleCardKeyFormChange = (e) => {
    const { name, value } = e.target;
    setCardKeyForm({
      ...cardKeyForm,
      [name]: value
    });
  };

  // 充值功能
  const handleRecharge = () => {
    if (!currentUser) return;

    // 打开充值对话框
    setCardKeyForm({ code: '' });
    setRechargeDialog(true);
  };

  // 使用卡密充值
  const handleUseCardKey = async () => {
    if (!currentUser) return;

    // 验证卡密
    if (!cardKeyForm.code.trim()) {
      showError('请输入卡密', 'warning');
      return;
    }

    // 显示加载中状态
    setIsLoading(true);

    try {
      // 清除卡密中的连字符
      const cleanCode = cardKeyForm.code.replace(/-/g, '');
      console.log('开始验证卡密:', cleanCode);

      // 验证卡密是否有效
      const validationResult = await cardKeyManager.validateCardKey(cleanCode);
      console.log('卡密验证结果:', validationResult);

      if (!validationResult.valid) {
        showError(validationResult.message, 'error');
        setIsLoading(false);
        return;
      }

      // 使用卡密
      console.log('开始使用卡密...');
      const result = await cardKeyManager.useCardKey(cleanCode, currentUser.id);
      console.log('卡密使用结果:', result);

      if (result.success) {
        // 更新用户余额
        const updatedUser = {
          ...currentUser,
          balance: (currentUser.balance || 0) + result.amount
        };

        // 更新本地存储中的用户信息
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        // 更新当前用户状态
        setCurrentUser(updatedUser);

        // 创建充值交易记录
        console.log('开始创建交易记录...');
        const transactionResult = await transactionManager.createTransaction(
          currentUser.id,
          result.amount,
          TRANSACTION_TYPES.RECHARGE,
          `卡密充值: ${formatCardKey(result.cardKey.code)}`,
          result.cardKey.id
        );
        console.log('创建交易记录结果:', transactionResult);

        if (!transactionResult.success) {
          // 如果有错误，显示错误信息
          const errorMessage = transactionResult.errors?.general || Object.values(transactionResult.errors || {}).join(', ');
          showError(errorMessage || '创建充值交易记录失败', 'error');
          setIsLoading(false);
          return;
        }

        // 更新交易记录列表
        setTransactions(prev => [transactionResult.transaction, ...prev]);

        // 显示成功消息
        showSuccess(`充值成功！已充值 ${formatCurrency(result.amount)}`, 'success');

        // 关闭充值对话框
        setRechargeDialog(false);

        // 尝试更新历史卡密状态
        try {
          const savedCardKeys = JSON.parse(localStorage.getItem('generatedCardKeys') || '[]');
          const updatedCardKeys = savedCardKeys.map(key => {
            if (key.code === cleanCode) {
              return { ...key, isUsed: true, usedAt: new Date().toISOString(), usedBy: currentUser.id };
            }
            return key;
          });
          localStorage.setItem('generatedCardKeys', JSON.stringify(updatedCardKeys));
        } catch (storageError) {
          console.error('更新历史卡密状态失败:', storageError);
        }
      } else {
        showError(result.message || '卡密无效或已被使用', 'error');
      }
      // 关闭加载中状态
      setIsLoading(false);
    } catch (error) {
      console.error('充值失败:', error);
      showError('充值失败，请重试', 'error');
      setIsLoading(false);
      return;
    }
  };

  // 提现功能
  const handleWithdraw = async () => {
    if (!currentUser || currentUser.balance < 50) {
      showError('余额不足，无法提现', 'warning');
      return;
    }

    // 提现金额
    const withdrawAmount = 50;

    // 模拟提现操作
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance - withdrawAmount
    };

    // 不再需要更新本地存储，因为使用 AuthContext 管理用户状态
    // 只需要更新当前组件中的用户状态
    setCurrentUser(updatedUser);

    // 创建提现交易记录
    try {
      const result = await transactionManager.createTransaction(
        currentUser.id,
        -withdrawAmount, // 负数表示支出
        TRANSACTION_TYPES.WITHDRAWAL,
        `提现申请: ${formatCurrency(withdrawAmount)}`,
        null
      );

      if (!result.success) {
        // 如果有错误，显示错误信息
        const errorMessage = result.errors?.general || Object.values(result.errors || {}).join(', ');
        showError(errorMessage || '提现申请失败', 'error');
        return;
      }

      // 更新交易记录列表
      setTransactions(prev => [result.transaction, ...prev]);
    } catch (error) {
      console.error('创建提现交易记录失败:', error);
      showError('提现申请失败，请重试', 'error');
      return;
    }

    // 显示成功消息
    showError(`提现申请已提交，${formatCurrency(withdrawAmount)}将在1-3个工作日到账`, 'success');
  };

  // Filter orders based on search term
  const filteredOrders = orders.length > 0 ? orders.filter(order => {
    // 确保所有属性都存在再进行搜索
    const orderId = order.id || order.orderId || '';
    const platform = order.platformName || order.platform || '';
    const url = order.url || order.videoUrl || '';

    return orderId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
           platform.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
           url.toString().toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  return (
    <Box sx={{ py: 6, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} sm={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className="glass-panel"
                sx={{ mb: 3 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)'
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 50 }} />
                  </Avatar>

                  <Typography variant="h6" gutterBottom>
                    {currentUser?.name || '用户123456'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    注册时间: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '2025-03-15'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      账户余额:
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                      ¥{currentUser?.balance?.toFixed(2) || '500.00'}
                    </Typography>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mb: 1 }}
                      onClick={handleRecharge}
                    >
                      充值
                    </Button>

                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={handleWithdraw}
                    >
                      提现
                    </Button>
                  </Box>
                </CardContent>
              </Card>


              <Card className="glass-panel">
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  orientation="vertical"
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      py: 2
                    }
                  }}
                >
                  <Tab
                    icon={<HistoryIcon />}
                    iconPosition="start"
                    label="订单记录"
                  />
                  <Tab
                    icon={<AccountBalanceWalletIcon />}
                    iconPosition="start"
                    label="账户余额"
                  />
                  <Tab
                    icon={<SettingsIcon />}
                    iconPosition="start"
                    label="账户设置"
                  />
                </Tabs>
              </Card>
            </motion.div>
          </Grid>

          {/* Main content */}
          <Grid item xs={12} sm={9}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tabValue === 0 && (
                <>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Typography variant="h5" component="h1">
                      订单记录
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        placeholder="搜索订单..."
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: 200 }}
                      />

                      <IconButton color="primary">
                        <FilterListIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <TableContainer
                    component={Paper}
                    sx={{
                      background: 'rgba(10, 18, 41, 0.7)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
                      mb: 4
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>订单编号</TableCell>
                          <TableCell>平台</TableCell>
                          <TableCell>服务</TableCell>
                          <TableCell>状态</TableCell>
                          <TableCell>进度</TableCell>
                          <TableCell>金额</TableCell>
                          <TableCell>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                              <InboxIcon sx={{ fontSize: 60, opacity: 0.5 }} />
                              <Typography variant="body1" color="text.secondary">
                                暂无订单记录
                              </Typography>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/service')}
                                startIcon={<AddIcon />}
                              >
                                创建第一个订单
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/service')}
                    >
                      创建新订单
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate('/orders')}
                    >
                      查看全部订单
                    </Button>
                  </Box>
                </>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h5" component="h1" gutterBottom>
                    账户余额
                  </Typography>

                  <Card
                    className="glass-panel"
                    sx={{ mb: 4, p: 3 }}
                  >
                    <Typography variant="h4" color="primary.main" gutterBottom>
                      ¥{currentUser?.balance?.toFixed(2) || '0.00'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      可用余额
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={handleRecharge}
                        >
                          充值
                        </Button>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={handleWithdraw}
                        >
                          提现
                        </Button>
                      </Box>
                    </Box>
                  </Card>

                  <Typography variant="h6" gutterBottom>
                    交易记录
                  </Typography>

                  <Card className="glass-panel">
                    {transactions.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>时间</TableCell>
                              <TableCell>类型</TableCell>
                              <TableCell>描述</TableCell>
                              <TableCell align="right">金额</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {transactions.map((transaction) => {
                              // 格式化日期
                              const date = new Date(transaction.createdAt);
                              const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

                              // 交易类型图标和颜色
                              let icon, color;
                              if (transaction.type === TRANSACTION_TYPES.RECHARGE) {
                                icon = <ArrowUpwardIcon fontSize="small" />;
                                color = 'success.main';
                              } else if (transaction.type === TRANSACTION_TYPES.CONSUMPTION) {
                                icon = <ShoppingCartIcon fontSize="small" />;
                                color = 'error.main';
                              } else if (transaction.type === TRANSACTION_TYPES.WITHDRAWAL) {
                                icon = <ArrowDownwardIcon fontSize="small" />;
                                color = 'error.main';
                              } else if (transaction.type === TRANSACTION_TYPES.REFUND) {
                                icon = <PaymentIcon fontSize="small" />;
                                color = 'info.main';
                              }

                              // 交易类型文本
                              const typeText = {
                                [TRANSACTION_TYPES.RECHARGE]: '充值',
                                [TRANSACTION_TYPES.CONSUMPTION]: '消费',
                                [TRANSACTION_TYPES.WITHDRAWAL]: '提现',
                                [TRANSACTION_TYPES.REFUND]: '退款'
                              }[transaction.type] || '其他';

                              return (
                                <TableRow key={transaction.id}>
                                  <TableCell>{formattedDate}</TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ color }}>{icon}</Box>
                                      {typeText}
                                    </Box>
                                  </TableCell>
                                  <TableCell>{transaction.description}</TableCell>
                                  <TableCell align="right" sx={{ color: transaction.amount >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <ReceiptIcon sx={{ fontSize: 60, opacity: 0.5 }} />
                          <Typography variant="body1" color="text.secondary">
                            暂无交易记录
                          </Typography>
                        </Box>
                      </CardContent>
                    )}
                  </Card>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h5" component="h1" gutterBottom>
                    账户设置
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card className="glass-panel">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          个人信息
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                            <Box sx={{ flex: 1, width: { xs: '100%', sm: '50%' } }}>
                              <TextField
                                fullWidth
                                label="用户名"
                                name="name"
                                value={userForm.name}
                                onChange={handleUserFormChange}
                                margin="normal"
                              />
                            </Box>
                            <Box sx={{ flex: 1, width: { xs: '100%', sm: '50%' } }}>
                              <TextField
                                fullWidth
                                label="电子邮箱"
                                name="email"
                                value={userForm.email}
                                onChange={handleUserFormChange}
                                margin="normal"
                              />
                            </Box>
                          </Box>
                          <Box>
                            <TextField
                              fullWidth
                              label="手机号码"
                              name="phone"
                              value={userForm.phone}
                              onChange={handleUserFormChange}
                              margin="normal"
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mt: 3, textAlign: 'right' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveUserInfo}
                          >
                            保存修改
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>

                    <Card className="glass-panel">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          安全设置
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body1" gutterBottom>
                            修改密码
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                              <TextField
                                fullWidth
                                label="当前密码"
                                name="currentPassword"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordFormChange}
                                margin="normal"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                              <Box sx={{ flex: 1, width: { xs: '100%', sm: '50%' } }}>
                                <TextField
                                  fullWidth
                                  label="新密码"
                                  name="newPassword"
                                  type="password"
                                  value={passwordForm.newPassword}
                                  onChange={handlePasswordFormChange}
                                  margin="normal"
                                />
                              </Box>
                              <Box sx={{ flex: 1, width: { xs: '100%', sm: '50%' } }}>
                                <TextField
                                  fullWidth
                                  label="确认新密码"
                                  name="confirmPassword"
                                  type="password"
                                  value={passwordForm.confirmPassword}
                                  onChange={handlePasswordFormChange}
                                  margin="normal"
                                />
                              </Box>
                            </Box>
                          </Box>

                          <Box sx={{ mt: 3, textAlign: 'right' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleUpdatePassword}
                            >
                              更新密码
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Container>
      {/* 卡密充值对话框 */}
      <Dialog open={rechargeDialog} onClose={() => setRechargeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>卡密充值</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              请输入您的充值卡密，卡密格式为16位字母数字组合，可以带有连字符。
            </Typography>

            <TextField
              label="卡密"
              fullWidth
              name="code"
              value={cardKeyForm.code}
              onChange={handleCardKeyFormChange}
              margin="normal"
              placeholder="例如：ABCD-1234-EFGH-5678"
              InputProps={{
                sx: { fontFamily: 'monospace' }
              }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              卡密仅能使用一次，请妥善保管您的卡密。
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRechargeDialog(false)} disabled={isLoading}>取消</Button>
          <Button
            onClick={handleUseCardKey}
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? '处理中...' : '充值'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 不再需要 Snackbar，因为使用 ErrorContext 处理 */}
    </Box>
  );
};

export default UserDashboard;
