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
  InputAdornment
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
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';

// 导入数据管理工具
import { orderManager } from '../utils/dataManager';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // 加载用户数据
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        // 加载用户的订单
        // 在实际应用中，这里应该从后端获取用户的订单
        // 目前使用空数组，等待后端集成
      } catch (err) {
        console.error('Failed to parse user data:', err);
        // 如果没有登录，重定向到首页
        navigate('/');
      }
    } else {
      // 如果没有登录，重定向到首页
      navigate('/');
    }
  }, [navigate]);

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

  // 充值功能
  const handleRecharge = () => {
    if (!currentUser) return;

    // 模拟充值操作
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + 100 // 每次充值100元
    };

    // 更新本地存储
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);

    // 显示成功消息
    alert('充值成功！已添加100元到您的账户');
  };

  // 提现功能
  const handleWithdraw = () => {
    if (!currentUser || currentUser.balance < 50) {
      alert('余额不足，无法提现');
      return;
    }

    // 模拟提现操作
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance - 50 // 每次提现50元
    };

    // 更新本地存储
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);

    // 显示成功消息
    alert('提现申请已提交，50元将在1-3个工作日到账');
  };

  // Filter orders based on search term
  const filteredOrders = orders.length > 0 ? orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.platformName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.url && order.url.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  return (
    <Box sx={{ py: 6, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid sm={12} md={3}>
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
          <Grid sm={12} md={9}>
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

                    <Grid container spacing={2}>
                      <Grid xs={12} sm={6}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={handleRecharge}
                        >
                          充值
                        </Button>
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={handleWithdraw}
                        >
                          提现
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>

                  <Typography variant="h6" gutterBottom>
                    交易记录
                  </Typography>

                  <Card className="glass-panel">
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        暂无交易记录
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h5" component="h1" gutterBottom>
                    账户设置
                  </Typography>

                  <Card
                    className="glass-panel"
                    sx={{ mb: 4 }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        个人信息
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="用户名"
                            defaultValue={currentUser?.name || ''}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="电子邮箱"
                            defaultValue={currentUser?.email || ""}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="手机号码"
                            defaultValue={currentUser?.phone || ""}
                            margin="normal"
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Button
                          variant="contained"
                          color="primary"
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
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="当前密码"
                              type="password"
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="新密码"
                              type="password"
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="确认新密码"
                              type="password"
                              margin="normal"
                            />
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, textAlign: 'right' }}>
                          <Button
                            variant="contained"
                            color="primary"
                          >
                            更新密码
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserDashboard;
