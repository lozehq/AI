import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Chip,
  LinearProgress,
  Slider,
  MenuItem,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Key as KeyIcon,
  VpnKey as VpnKeyIcon,
  ContentCopy as ContentCopyIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  OpenInNew as OpenInNewIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

// 导入数据管理工具
import { userManager, orderManager, serviceManager } from '../utils/dataManager';
import { inviteCodeManager } from '../utils/inviteCodeManager';
import { cardKeyManager, formatCardKey } from '../utils/cardKeyManager';
import { notificationManager } from '../utils/notificationManager';
import { formatCurrency } from '../utils/formatters';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState({});
  const [inviteCodes, setInviteCodes] = useState([]);
  const [cardKeys, setCardKeys] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // 编辑用户对话框
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 编辑服务对话框
  const [editServiceDialog, setEditServiceDialog] = useState(false);
  const [currentService, setCurrentService] = useState({
    key: '',
    name: '',
    price: 0,
    minPurchase: 1,  // 最小购买量
    maxPurchase: 0   // 最大购买量，0表示无限制
  });

  // 编辑邀请码对话框
  const [editInviteCodeDialog, setEditInviteCodeDialog] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState({
    code: '',
    isAdmin: false,
    usageLimit: 10,
    expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  // 生成卡密对话框
  const [createCardKeyDialog, setCreateCardKeyDialog] = useState(false);
  const [cardKeyForm, setCardKeyForm] = useState({
    amount: 100,
    count: 1,
    expiresInDays: 30
  });

  // 通知对话框
  const [createNotificationDialog, setCreateNotificationDialog] = useState(false);
  const [currentNotification, setCurrentNotification] = useState({
    title: '',
    content: '',
    type: 'info',
    isGlobal: true
  });

  // 新生成的卡密列表
  const [newCardKeys, setNewCardKeys] = useState([]);

  // 编辑订单对话框
  const [editOrderDialog, setEditOrderDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    id: '',
    status: 'pending',
    progress: 0,
    platform: '',
    totalAmount: 0,
    createdAt: ''
  });

  // 使用 AuthContext 中的 isAdmin 方法
  const { isAdmin } = useAuth();

  // 显示提示消息 - 先定义，因为 loadData 依赖它
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // 加载数据 - 使用 useCallback 包装以避免依赖项警告
  // 先定义 loadData 函数，再在 useEffect 中使用
  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      // 加载用户数据 - 正确处理异步调用
      const userData = await userManager.getAllUsers();
      console.log('加载用户数据:', userData);
      setUsers(Array.isArray(userData) ? userData : []);

      // 加载订单数据
      const orderData = await orderManager.getAllOrders();
      setOrders(Array.isArray(orderData) ? orderData : []);

      // 加载服务数据
      const serviceData = await serviceManager.getAllServices();
      setServices(serviceData || {});

      // 加载邀请码数据
      try {
        const inviteCodeData = await inviteCodeManager.getAllInviteCodes();
        console.log('加载邀请码数据:', inviteCodeData);

        // 确保数据是数组
        if (Array.isArray(inviteCodeData)) {
          setInviteCodes(inviteCodeData);
        } else {
          console.warn('邀请码数据不是数组:', inviteCodeData);
          setInviteCodes([]);
        }
      } catch (inviteCodeError) {
        console.error('加载邀请码数据失败:', inviteCodeError);
        setInviteCodes([]);
      }

      // 加载卡密数据
      const cardKeyData = await cardKeyManager.getAllCardKeys();
      setCardKeys(Array.isArray(cardKeyData) ? cardKeyData : []);

      // 加载通知数据
      const notificationData = await notificationManager.getAllNotifications();
      setNotifications(Array.isArray(notificationData) ? notificationData : []);
    } catch (error) {
      console.error('加载数据失败:', error);
      showSnackbar('加载数据失败', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar]);

  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 处理搜索
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // 检查管理员权限并加载数据
  useEffect(() => {
    const checkAdmin = async () => {
      // 检查管理员权限
      const isUserAdmin = isAdmin();
      console.log('管理员面板 - 检查管理员权限:', isUserAdmin);

      if (!isUserAdmin) {
        // 如果不是管理员，重定向到首页
        console.log('非管理员用户尝试访问管理员面板，重定向到首页');
        navigate('/');
        return;
      }

      // 加载数据 - 正确处理异步函数
      console.log('管理员权限验证通过，加载数据');
      await loadData();
    };

    checkAdmin();
  }, [navigate, isAdmin, loadData]);

  // 删除重复的 showSnackbar 函数定义

  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 过滤用户 - 添加空数组检查
  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // 过滤订单 - 添加空数组检查
  const filteredOrders = Array.isArray(orders) ? orders.filter(order =>
    (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.platform || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // 编辑用户
  const handleEditUser = (user) => {
    setCurrentUser({ ...user });
    setEditUserDialog(true);
  };

  // 保存用户编辑
  const handleSaveUser = () => {
    try {
      const result = userManager.updateUser(currentUser.id, currentUser);
      if (result) {
        showSnackbar('用户信息已更新', 'success');
        loadData();
      } else {
        showSnackbar('更新用户信息失败', 'error');
      }
    } catch (error) {
      console.error('保存用户信息失败:', error);
      showSnackbar('保存用户信息失败', 'error');
    }

    setEditUserDialog(false);
  };

  // 删除用户
  const handleDeleteUser = (userId) => {
    if (window.confirm('确定要删除此用户吗？此操作不可撤销。')) {
      try {
        // 使用 userManager 删除用户
        const result = userManager.deleteUser(userId);
        if (result) {
          showSnackbar('用户已删除', 'success');
          loadData();
        } else {
          showSnackbar('删除用户失败', 'error');
        }
      } catch (error) {
        console.error('删除用户失败:', error);
        showSnackbar('删除用户失败', 'error');
      }
    }
  };

  // 编辑服务
  const handleEditService = (key, service) => {
    setCurrentService({
      key,
      name: service.name,
      price: service.price,
      minPurchase: service.minPurchase || 1,
      maxPurchase: service.maxPurchase || 0
    });
    setEditServiceDialog(true);
  };

  // 添加新服务
  const handleAddService = () => {
    setCurrentService({
      key: '',
      name: '',
      price: 0,
      minPurchase: 1,
      maxPurchase: 0
    });
    setEditServiceDialog(true);
  };

  // 保存服务编辑
  const handleSaveService = () => {
    try {
      const updatedServices = { ...services };

      // 如果是新服务，检查key是否已存在
      if (!currentService.key) {
        showSnackbar('服务标识不能为空', 'error');
        return;
      }

      // 更新或添加服务
      updatedServices[currentService.key] = {
        name: currentService.name,
        price: parseFloat(currentService.price),
        minPurchase: parseInt(currentService.minPurchase) || 1,
        maxPurchase: parseInt(currentService.maxPurchase) || 0
      };

      // 使用 serviceManager 保存服务
      const result = serviceManager.saveServices(updatedServices);
      if (result) {
        showSnackbar('服务信息已更新', 'success');
        loadData();
      } else {
        showSnackbar('保存服务信息失败', 'error');
      }
    } catch (error) {
      console.error('保存服务信息失败:', error);
      showSnackbar('保存服务信息失败', 'error');
    }

    setEditServiceDialog(false);
  };

  // 删除服务
  const handleDeleteService = (key) => {
    if (window.confirm('确定要删除此服务吗？此操作不可撤销。')) {
      try {
        const updatedServices = { ...services };
        delete updatedServices[key];

        // 使用 serviceManager 保存更新后的服务
        const result = serviceManager.saveServices(updatedServices);
        if (result) {
          showSnackbar('服务已删除', 'success');
          loadData();
        } else {
          showSnackbar('删除服务失败', 'error');
        }
      } catch (error) {
        console.error('删除服务失败:', error);
        showSnackbar('删除服务失败', 'error');
      }
    }
  };

  // 删除订单
  const handleDeleteOrder = (orderId) => {
    if (window.confirm('确定要删除此订单吗？此操作不可撤销。')) {
      try {
        const result = orderManager.deleteOrder(orderId);
        if (result) {
          showSnackbar('订单已删除', 'success');
          loadData();
        } else {
          showSnackbar('删除订单失败', 'error');
        }
      } catch (error) {
        console.error('删除订单失败:', error);
        showSnackbar('删除订单失败', 'error');
      }
    }
  };

  // 处理卡密表单变化
  const handleCardKeyFormChange = (e) => {
    const { name, value } = e.target;
    setCardKeyForm({
      ...cardKeyForm,
      [name]: name === 'amount' || name === 'count' || name === 'expiresInDays' ? parseInt(value) : value
    });
  };

  // 生成卡密
  const handleCreateCardKey = async () => {
    try {
      // 验证表单
      if (!cardKeyForm.amount || cardKeyForm.amount <= 0) {
        showSnackbar('金额必须大于0', 'warning');
        return;
      }

      if (!cardKeyForm.count || cardKeyForm.count <= 0 || cardKeyForm.count > 100) {
        showSnackbar('生成数量必须在1-100之间', 'warning');
        return;
      }

      if (!cardKeyForm.expiresInDays || cardKeyForm.expiresInDays <= 0) {
        showSnackbar('过期天数必须大于0', 'warning');
        return;
      }

      // 生成卡密 - 正确处理异步操作
      console.log('开始生成卡密...');
      const result = await cardKeyManager.createCardKey(
        cardKeyForm.amount,
        cardKeyForm.count,
        cardKeyForm.expiresInDays
      );
      console.log('生成卡密结果:', result);

      if (result && result.success) {
        showSnackbar(result.message, 'success');
        setNewCardKeys(result.cardKeys);
        // 重新加载数据
        await loadData();
      } else {
        const errorMsg = result ? (result.message || '生成卡密失败') : '生成卡密失败';
        console.error('生成卡密失败:', errorMsg);
        showSnackbar(errorMsg, 'error');
      }
    } catch (error) {
      console.error('生成卡密失败:', error);
      showSnackbar('生成卡密失败: ' + (error.message || '未知错误'), 'error');
    }
  };

  // 删除卡密
  const handleDeleteCardKey = async (id) => {
    if (window.confirm('确定要删除此卡密吗？此操作不可撤销。')) {
      try {
        console.log('开始删除卡密:', id);
        const result = await cardKeyManager.deleteCardKey(id);
        console.log('删除卡密结果:', result);

        if (result) {
          showSnackbar('卡密已删除', 'success');
          await loadData();
        } else {
          showSnackbar('删除卡密失败', 'error');
        }
      } catch (error) {
        console.error('删除卡密失败:', error);
        showSnackbar('删除卡密失败: ' + (error.message || '未知错误'), 'error');
      }
    }
  };

  // 创建新通知
  const handleCreateNotification = () => {
    setCurrentNotification({
      title: '',
      content: '',
      type: 'info',
      isGlobal: true
    });
    setCreateNotificationDialog(true);
  };

  // 保存通知
  const handleSaveNotification = () => {
    try {
      const { title, content, type, isGlobal } = currentNotification;

      if (!title.trim()) {
        showSnackbar('通知标题不能为空', 'error');
        return;
      }

      if (!content.trim()) {
        showSnackbar('通知内容不能为空', 'error');
        return;
      }

      // 获取当前管理员用户
      const currentAdmin = userManager.getCurrentUser();
      if (!currentAdmin || !currentAdmin.id) {
        showSnackbar('管理员信息不完整，无法创建通知', 'error');
        return;
      }

      const result = notificationManager.createNotification(title, content, type, isGlobal, currentAdmin.id);

      if (result) {
        showSnackbar('通知创建成功', 'success');
        setCreateNotificationDialog(false);
        loadData();
      } else {
        showSnackbar('创建通知失败', 'error');
      }
    } catch (error) {
      console.error('创建通知失败:', error);
      showSnackbar('创建通知失败', 'error');
    }
  };

  // 删除通知
  const handleDeleteNotification = (notificationId) => {
    if (window.confirm('确定要删除此通知吗？此操作不可撤销。')) {
      try {
        const result = notificationManager.deleteNotification(notificationId);

        if (result) {
          showSnackbar('通知已删除', 'success');
          loadData();
        } else {
          showSnackbar('删除通知失败', 'error');
        }
      } catch (error) {
        console.error('删除通知失败:', error);
        showSnackbar('删除通知失败', 'error');
      }
    }
  };

  // 编辑订单
  const handleEditOrder = (order) => {
    setCurrentOrder({
      id: order.id || order.orderId,
      status: order.status || 'pending',
      progress: order.progress || 0,
      platform: order.platform || '',
      totalAmount: order.totalAmount || order.price || 0,
      createdAt: order.createdAt || new Date().toISOString(),
      videoUrl: order.videoUrl || order.url || '',
      userId: order.userId || '',
      services: order.services || {}
    });
    setEditOrderDialog(true);
  };

  // 保存订单编辑
  const handleSaveOrderEdit = () => {
    try {
      // 验证表单
      if (!currentOrder.id) {
        showSnackbar('订单ID不能为空', 'error');
        return;
      }

      // 验证进度值
      const progress = parseInt(currentOrder.progress);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        showSnackbar('进度必须是0-100之间的数字', 'error');
        return;
      }

      // 更新订单状态
      const result = orderManager.updateOrderStatus(
        currentOrder.id,
        currentOrder.status,
        progress
      );

      if (result) {
        showSnackbar('订单已更新', 'success');
        setEditOrderDialog(false);
        loadData();
      } else {
        showSnackbar('更新订单失败', 'error');
      }
    } catch (error) {
      console.error('更新订单失败:', error);
      showSnackbar('更新订单失败', 'error');
    }
  };

  // 处理订单状态变化
  const handleOrderStatusChange = (e) => {
    const { value } = e.target;
    setCurrentOrder({
      ...currentOrder,
      status: value,
      // 如果状态是已完成，自动设置进度为100%
      progress: value === 'completed' ? 100 : currentOrder.progress
    });
  };

  // 处理订单进度变化
  const handleOrderProgressChange = (e) => {
    const { value } = e.target;
    const progress = parseInt(value);
    if (!isNaN(progress)) {
      setCurrentOrder({
        ...currentOrder,
        progress,
        // 如果进度是100%，自动设置状态为已完成
        status: progress === 100 ? 'completed' :
                progress > 0 ? 'in_progress' : currentOrder.status
      });
    }
  };

  // 快速开始处理订单
  const handleStartProcessing = (orderId) => {
    try {
      const result = orderManager.updateOrderStatus(orderId, 'in_progress', 10);
      if (result) {
        showSnackbar('订单已开始处理', 'success');
        loadData();
      } else {
        showSnackbar('更新订单状态失败', 'error');
      }
    } catch (error) {
      console.error('开始处理订单失败:', error);
      showSnackbar('开始处理订单失败', 'error');
    }
  };

  // 快速完成订单
  const handleCompleteOrder = (orderId) => {
    try {
      const result = orderManager.updateOrderStatus(orderId, 'completed', 100);
      if (result) {
        showSnackbar('订单已完成', 'success');
        loadData();
      } else {
        showSnackbar('更新订单状态失败', 'error');
      }
    } catch (error) {
      console.error('完成订单失败:', error);
      showSnackbar('完成订单失败', 'error');
    }
  };

  // 快速取消订单
  const handleCancelOrder = (orderId) => {
    try {
      const result = orderManager.updateOrderStatus(orderId, 'failed', 0);
      if (result) {
        showSnackbar('订单已取消', 'success');
        loadData();
      } else {
        showSnackbar('更新订单状态失败', 'error');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      showSnackbar('取消订单失败', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          borderBottom: '1px solid',
          borderColor: 'rgba(60, 255, 220, 0.3)',
          pb: 2
        }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: 'Orbitron',
              color: 'primary.main',
              textShadow: '0 0 10px rgba(60, 255, 220, 0.5)'
            }}
          >
            管理员面板
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="搜索..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: 'rgba(60, 255, 220, 0.7)', mr: 1 }} />
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(60, 255, 220, 0.3)',
                  '&:hover': {
                    border: '1px solid rgba(60, 255, 220, 0.5)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.primary',
                  }
                }
              }}
            />

            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={loadData}
              sx={{
                borderRadius: 2,
                border: '1px solid rgba(60, 255, 220, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(60, 255, 220, 0.1)',
                  border: '1px solid rgba(60, 255, 220, 0.5)',
                }
              }}
            >
              刷新
            </Button>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            bgcolor: 'rgba(3, 11, 23, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(60, 255, 220, 0.2)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(60, 255, 220, 0.2)' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontFamily: 'Rajdhani',
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  boxShadow: '0 0 10px rgba(60, 255, 220, 0.7)'
                }
              }}
            >
              <Tab icon={<PersonIcon />} label="用户管理" />
              <Tab icon={<ShoppingCartIcon />} label="订单管理" />
              <Tab icon={<SettingsIcon />} label="服务设置" />
              <Tab icon={<KeyIcon />} label="邀请码管理" />
              <Tab icon={<VpnKeyIcon />} label="卡密管理" />
              <Tab icon={<NotificationsIcon />} label="通知管理" />
              <Tab icon={<DashboardIcon />} label="系统概览" />
            </Tabs>
          </Box>

          {/* 用户管理 */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>用户ID</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>用户名</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>邮箱</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>电话</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>余额</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>管理员</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body1" color="text.secondary">
                            暂无用户数据
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{formatCurrency(user.balance || 0)}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Typography color="primary.main">是</Typography>
                            ) : (
                              <Typography color="text.secondary">否</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditUser(user)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.isAdmin} // 禁止删除管理员
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 订单管理 */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>订单ID</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>平台</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>状态</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>进度</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>金额</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>创建时间</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body1" color="text.secondary">
                            暂无订单数据
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.orderId || order.id}>
                          <TableCell>{order.orderId || order.id}</TableCell>
                          <TableCell>{order.platform}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status === 'completed' ? '已完成' :
                                    order.status === 'in_progress' ? '进行中' :
                                    order.status === 'pending' ? '待处理' :
                                    order.status === 'failed' ? '失败' : order.status}
                              color={order.status === 'completed' ? 'success' :
                                    order.status === 'in_progress' ? 'info' :
                                    order.status === 'pending' ? 'warning' :
                                    order.status === 'failed' ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={order.progress || 0}
                                sx={{
                                  flexGrow: 1,
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: order.status === 'completed' ? 'success.main' :
                                             order.status === 'in_progress' ? 'info.main' :
                                             order.status === 'pending' ? 'warning.main' :
                                             order.status === 'failed' ? 'error.main' : 'primary.main',
                                  }
                                }}
                              />
                              <Typography variant="body2">{order.progress || 0}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{formatCurrency(order.totalAmount || order.price || 0)}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {/* 快速操作按钮 */}
                              {order.status === 'pending' && (
                                <Tooltip title="开始处理">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    onClick={() => handleStartProcessing(order.orderId || order.id)}
                                  >
                                    <PlayArrowIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {(order.status === 'pending' || order.status === 'in_progress') && (
                                <Tooltip title="完成订单">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleCompleteOrder(order.orderId || order.id)}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {(order.status === 'pending' || order.status === 'in_progress') && (
                                <Tooltip title="取消订单">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => handleCancelOrder(order.orderId || order.id)}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* 编辑和删除按钮 */}
                              <Tooltip title="编辑订单">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEditOrder(order)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="删除订单">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteOrder(order.orderId || order.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 服务设置 */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddService}
                >
                  添加服务
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>服务标识</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>服务名称</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>单价(元)</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>最小购买量</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>最大购买量</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(services).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body1" color="text.secondary">
                            暂无服务数据
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      Object.entries(services).map(([key, service]) => (
                        <TableRow key={key}>
                          <TableCell>{key}</TableCell>
                          <TableCell>{service.name}</TableCell>
                          <TableCell>{service.price}</TableCell>
                          <TableCell>{service.minPurchase || 1}</TableCell>
                          <TableCell>
                            {service.maxPurchase ? service.maxPurchase : '无限制'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditService(key, service)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteService(key)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 邀请码管理 */}
          {tabValue === 3 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setCurrentInviteCode({
                      code: '',
                      isAdmin: false,
                      usageLimit: 10,
                      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                    });
                    setEditInviteCodeDialog(true);
                  }}
                >
                  创建邀请码
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>邀请码</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>类型</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>使用次数</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>使用上限</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>过期时间</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inviteCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body1" color="text.secondary">
                            暂无邀请码数据
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      inviteCodes.map((inviteCode) => (
                        <TableRow key={inviteCode.code}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: inviteCode.isAdmin ? 'primary.main' : 'text.primary'
                              }}
                            >
                              {inviteCode.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {inviteCode.isAdmin ? (
                              <Typography color="primary.main" fontWeight="bold">管理员</Typography>
                            ) : (
                              <Typography color="text.secondary">普通用户</Typography>
                            )}
                          </TableCell>
                          <TableCell>{inviteCode.usedCount || 0}</TableCell>
                          <TableCell>{inviteCode.usageLimit}</TableCell>
                          <TableCell>{new Date(inviteCode.expiresAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={async () => {
                                  if (window.confirm('确定要删除此邀请码吗？此操作不可撤销。')) {
                                    try {
                                      // 正确处理异步调用
                                      const result = await inviteCodeManager.deleteInviteCode(inviteCode.code);
                                      console.log('删除邀请码结果:', result);

                                      if (result) {
                                        showSnackbar('邀请码已删除', 'success');
                                        await loadData();
                                      } else {
                                        showSnackbar('删除邀请码失败', 'error');
                                      }
                                    } catch (error) {
                                      console.error('删除邀请码时发生错误:', error);
                                      showSnackbar('删除邀请码失败: ' + (error.message || '未知错误'), 'error');
                                    }
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 卡密管理 */}
          {tabValue === 4 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2" color="primary.main">
                  卡密管理
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setCardKeyForm({
                      amount: 100,
                      count: 1,
                      expiresInDays: 30
                    });
                    setNewCardKeys([]);
                    setCreateCardKeyDialog(true);
                  }}
                >
                  生成卡密
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>卡密</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>金额</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>状态</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>创建时间</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>过期时间</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cardKeys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body1" color="text.secondary">
                            暂无卡密数据
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      cardKeys.map((cardKey) => (
                        <TableRow key={cardKey.id}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: cardKey.isUsed ? 'text.disabled' : 'primary.main'
                              }}
                            >
                              {formatCardKey(cardKey.code)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography color={cardKey.isUsed ? 'text.disabled' : 'primary.main'} fontWeight="bold">
                              {formatCurrency(cardKey.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {cardKey.isUsed ? (
                              <Typography color="text.disabled">已使用</Typography>
                            ) : (
                              <Typography color="success.main">未使用</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(cardKey.createdAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(cardKey.expiresAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCardKey(cardKey.id)}
                              disabled={cardKey.isUsed}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 通知管理 */}
          {tabValue === 5 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2" color="primary.main">
                  通知管理
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNotification}
                >
                  发送通知
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>标题</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>内容</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>类型</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>创建时间</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body1" color="text.secondary">
                            暂无通知数据
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      notifications.map((notification) => {
                        // 根据通知类型选择图标和颜色
                        let typeIcon, typeColor;
                        switch (notification.type) {
                          case 'success':
                            typeIcon = <CheckCircleIcon />;
                            typeColor = 'success.main';
                            break;
                          case 'warning':
                            typeIcon = <WarningIcon />;
                            typeColor = 'warning.main';
                            break;
                          case 'error':
                            typeIcon = <ErrorIcon />;
                            typeColor = 'error.main';
                            break;
                          default: // info
                            typeIcon = <InfoIcon />;
                            typeColor = 'info.main';
                        }

                        return (
                          <TableRow key={notification.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {notification.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {notification.content}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', color: typeColor }}>
                                {typeIcon}
                                <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                                  {notification.type}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(notification.createdAt).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 系统概览 */}
          {tabValue === 6 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* 用户统计卡片 */}
                <Grid item xs={12} md={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card sx={{
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 3,
                      bgcolor: 'rgba(10, 25, 41, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(60, 255, 220, 0.3)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(60, 255, 220, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(60, 255, 220, 0.2)',
                        '& .stat-icon': {
                          transform: 'scale(1.1) rotate(10deg)',
                          opacity: 0.8,
                        }
                      }
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        opacity: 0.2,
                        transition: 'all 0.3s ease',
                      }} className="stat-icon">
                        <PersonIcon sx={{ fontSize: 120, color: 'primary.main' }} />
                      </Box>
                      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                        <Typography variant="h6" sx={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: 'linear-gradient(90deg, #3CFFDC, #3C9EFF)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <PersonIcon fontSize="small" sx={{ color: '#3CFFDC' }} />
                          用户统计
                        </Typography>

                        <Typography variant="h2" sx={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          my: 2,
                          fontSize: '3.5rem',
                          color: '#fff',
                          textShadow: '0 0 10px rgba(60, 255, 220, 0.5)'
                        }}>
                          {users.length}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                          总用户数
                        </Typography>

                        <Box sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(60, 255, 220, 0.1)',
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              管理员
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#3CFFDC' }}>
                              {users.filter(user => user.isAdmin).length}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              普通用户
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#3C9EFF' }}>
                              {users.filter(user => !user.isAdmin).length}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* 订单统计卡片 */}
                <Grid item xs={12} md={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Card sx={{
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 3,
                      bgcolor: 'rgba(10, 25, 41, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(60, 255, 220, 0.3)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(60, 255, 220, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(60, 255, 220, 0.2)',
                        '& .stat-icon': {
                          transform: 'scale(1.1) rotate(10deg)',
                          opacity: 0.8,
                        }
                      }
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        opacity: 0.2,
                        transition: 'all 0.3s ease',
                      }} className="stat-icon">
                        <ShoppingCartIcon sx={{ fontSize: 120, color: 'primary.main' }} />
                      </Box>
                      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                        <Typography variant="h6" sx={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: 'linear-gradient(90deg, #3CFFDC, #3C9EFF)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <ShoppingCartIcon fontSize="small" sx={{ color: '#3CFFDC' }} />
                          订单统计
                        </Typography>

                        <Typography variant="h2" sx={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          my: 2,
                          fontSize: '3.5rem',
                          color: '#fff',
                          textShadow: '0 0 10px rgba(60, 255, 220, 0.5)'
                        }}>
                          {orders.length}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                          总订单数
                        </Typography>

                        <Box sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(60, 255, 220, 0.1)',
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              完成订单
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#3CFFDC' }}>
                              {orders.filter(order => order.status === 'completed').length}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              进行中订单
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#3C9EFF' }}>
                              {orders.filter(order => order.status === 'processing' || order.status === 'in_progress').length}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              待处理订单
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF7C3C' }}>
                              {orders.filter(order => order.status === 'waiting' || order.status === 'pending').length}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* 服务统计卡片 */}
                <Grid item xs={12} md={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Card sx={{
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 3,
                      bgcolor: 'rgba(10, 25, 41, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(60, 255, 220, 0.3)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(60, 255, 220, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(60, 255, 220, 0.2)',
                        '& .stat-icon': {
                          transform: 'scale(1.1) rotate(10deg)',
                          opacity: 0.8,
                        }
                      }
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        opacity: 0.2,
                        transition: 'all 0.3s ease',
                      }} className="stat-icon">
                        <SettingsIcon sx={{ fontSize: 120, color: 'primary.main' }} />
                      </Box>
                      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                        <Typography variant="h6" sx={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: 'linear-gradient(90deg, #3CFFDC, #3C9EFF)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <SettingsIcon fontSize="small" sx={{ color: '#3CFFDC' }} />
                          服务统计
                        </Typography>

                        <Typography variant="h2" sx={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          my: 2,
                          fontSize: '3.5rem',
                          color: '#fff',
                          textShadow: '0 0 10px rgba(60, 255, 220, 0.5)'
                        }}>
                          {Object.keys(services).length}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                          总服务数
                        </Typography>

                        <Box sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(60, 255, 220, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            平均价格
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#3CFFDC' }}>
                            {
                              Object.values(services).length > 0
                                ? formatCurrency(Object.values(services).reduce((sum, service) => sum + service.price, 0) / Object.values(services).length)
                                : formatCurrency(0)
                            }
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* 邀请码统计卡片 */}
                <Grid item xs={12} md={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Card sx={{
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 3,
                      bgcolor: 'rgba(10, 25, 41, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(60, 255, 220, 0.3)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(60, 255, 220, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(60, 255, 220, 0.2)',
                        '& .stat-icon': {
                          transform: 'scale(1.1) rotate(10deg)',
                          opacity: 0.8,
                        }
                      }
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        opacity: 0.2,
                        transition: 'all 0.3s ease',
                      }} className="stat-icon">
                        <VpnKeyIcon sx={{ fontSize: 120, color: 'primary.main' }} />
                      </Box>
                      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                        <Typography variant="h6" sx={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: 'linear-gradient(90deg, #3CFFDC, #3C9EFF)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <VpnKeyIcon fontSize="small" sx={{ color: '#3CFFDC' }} />
                          邀请码统计
                        </Typography>

                        <Typography variant="h2" sx={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          my: 2,
                          fontSize: '3.5rem',
                          color: '#fff',
                          textShadow: '0 0 10px rgba(60, 255, 220, 0.5)'
                        }}>
                          {inviteCodes.length}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                          总邀请码数
                        </Typography>

                        <Box sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(60, 255, 220, 0.1)',
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              管理员邀请码
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#3CFFDC' }}>
                              {inviteCodes.filter(code => code.isAdmin).length}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              普通邀请码
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#3C9EFF' }}>
                              {inviteCodes.filter(code => !code.isAdmin).length}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              已使用次数
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF7C3C' }}>
                              {inviteCodes.reduce((sum, code) => sum + (code.usedCount || 0), 0)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* 编辑用户对话框 */}
      <Dialog open={editUserDialog} onClose={() => setEditUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑用户</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="用户名"
                fullWidth
                value={currentUser.name || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
              />
              <TextField
                label="邮箱"
                fullWidth
                value={currentUser.email || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
              />
              <TextField
                label="电话"
                fullWidth
                value={currentUser.phone || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
              />
              <TextField
                label="余额"
                fullWidth
                type="number"
                value={currentUser.balance || 0}
                onChange={(e) => setCurrentUser({ ...currentUser, balance: parseFloat(e.target.value) })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={!!currentUser.isAdmin}
                    onChange={(e) => setCurrentUser({ ...currentUser, isAdmin: e.target.checked })}
                    color="primary"
                  />
                }
                label="管理员权限"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>取消</Button>
          <Button onClick={handleSaveUser} color="primary">保存</Button>
        </DialogActions>
      </Dialog>

      {/* 编辑服务对话框 */}
      <Dialog open={editServiceDialog} onClose={() => setEditServiceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentService.key ? '编辑服务' : '添加服务'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="服务标识"
              fullWidth
              value={currentService.key || ''}
              onChange={(e) => setCurrentService({ ...currentService, key: e.target.value })}
              disabled={!!currentService.key} // 如果是编辑现有服务，不允许修改key
              helperText="服务的唯一标识，如views、likes等"
            />
            <TextField
              label="服务名称"
              fullWidth
              value={currentService.name || ''}
              onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
              helperText="服务的显示名称，如播放量、点赞数等"
            />
            <TextField
              label="单价"
              fullWidth
              type="number"
              value={currentService.price || 0}
              onChange={(e) => setCurrentService({ ...currentService, price: parseFloat(e.target.value) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              }}
              helperText="每单位服务的价格"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="最小购买量"
                fullWidth
                type="number"
                value={currentService.minPurchase || 1}
                onChange={(e) => setCurrentService({ ...currentService, minPurchase: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
                helperText="单次购买的最小数量"
              />
              <TextField
                label="最大购买量"
                fullWidth
                type="number"
                value={currentService.maxPurchase || 0}
                onChange={(e) => setCurrentService({ ...currentService, maxPurchase: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
                helperText="单次购买的最大数量（0表示无限制）"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditServiceDialog(false)}>取消</Button>
          <Button onClick={handleSaveService} color="primary">保存</Button>
        </DialogActions>
      </Dialog>

      {/* 邀请码对话框 */}
      <Dialog open={editInviteCodeDialog} onClose={() => setEditInviteCodeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentInviteCode.code ? '编辑邀请码' : '创建邀请码'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="邀请码"
              fullWidth
              value={currentInviteCode.code || ''}
              onChange={(e) => setCurrentInviteCode({ ...currentInviteCode, code: e.target.value })}
              helperText="请输入唯一的邀请码，建议使用大写字母和数字的组合"
            />
            <TextField
              label="使用上限"
              fullWidth
              type="number"
              value={currentInviteCode.usageLimit || 10}
              onChange={(e) => setCurrentInviteCode({ ...currentInviteCode, usageLimit: parseInt(e.target.value) })}
              helperText="此邀请码最多可以被使用的次数"
            />
            <TextField
              label="过期时间"
              fullWidth
              type="date"
              value={currentInviteCode.expiresAt}
              onChange={(e) => setCurrentInviteCode({ ...currentInviteCode, expiresAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="邀请码的过期时间"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!currentInviteCode.isAdmin}
                  onChange={(e) => setCurrentInviteCode({ ...currentInviteCode, isAdmin: e.target.checked })}
                  color="primary"
                />
              }
              label="管理员邀请码"
            />
            {currentInviteCode.isAdmin && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                警告：使用此邀请码注册的用户将获得管理员权限！
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditInviteCodeDialog(false)}>取消</Button>
          <Button
            onClick={async () => {
              // 验证表单
              if (!currentInviteCode.code) {
                showSnackbar('邀请码不能为空', 'error');
                return;
              }

              console.log('开始创建邀请码:', currentInviteCode);

              // 确保 usageLimit 是数字
              const inviteCodeData = {
                ...currentInviteCode,
                usageLimit: parseInt(currentInviteCode.usageLimit) || 10
              };

              console.log('处理后的邀请码数据:', inviteCodeData);

              try {
                // 创建邀请码 - 正确处理异步调用
                const result = await inviteCodeManager.createInviteCode(inviteCodeData);
                console.log('创建邀请码结果:', result);

                if (result && result.success) {
                  showSnackbar('邀请码创建成功', 'success');
                  setEditInviteCodeDialog(false);

                  // 重新加载数据
                  console.log('重新加载数据...');
                  await loadData();
                  console.log('数据加载完成');
                } else {
                  const errorMsg = result ? (result.message || '创建邀请码失败') : '创建邀请码失败';
                  console.error('创建邀请码失败:', errorMsg);
                  showSnackbar(errorMsg, 'error');
                }
              } catch (error) {
                console.error('创建邀请码时发生错误:', error);
                showSnackbar('创建邀请码失败: ' + (error.message || '未知错误'), 'error');
              }
            }}
            color="primary"
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 生成卡密对话框 */}
      <Dialog open={createCardKeyDialog} onClose={() => setCreateCardKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>生成卡密</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="卡密金额"
              fullWidth
              type="number"
              name="amount"
              value={cardKeyForm.amount}
              onChange={handleCardKeyFormChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              }}
              helperText="卡密充值金额"
            />
            <TextField
              label="生成数量"
              fullWidth
              type="number"
              name="count"
              value={cardKeyForm.count}
              onChange={handleCardKeyFormChange}
              helperText="一次生成的卡密数量，最多100个"
              inputProps={{ min: 1, max: 100 }}
            />
            <TextField
              label="过期天数"
              fullWidth
              type="number"
              name="expiresInDays"
              value={cardKeyForm.expiresInDays}
              onChange={handleCardKeyFormChange}
              helperText="卡密有效期（天）"
              inputProps={{ min: 1 }}
            />
          </Box>

          {newCardKeys.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom color="primary.main">
                新生成的卡密：
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'rgba(3, 11, 23, 0.7)', maxHeight: 200, overflow: 'auto' }}>
                {newCardKeys.map((key, index) => (
                  <Typography
                    key={key.id}
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      mb: 1,
                      color: 'primary.main',
                      fontWeight: 'bold'
                    }}
                  >
                    {index + 1}. {formatCardKey(key.code)} - {formatCurrency(key.amount)}
                  </Typography>
                ))}
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                请立即复制保存这些卡密，关闭对话框后将无法再次查看完整卡密。
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCardKeyDialog(false)}>关闭</Button>
          <Button onClick={handleCreateCardKey} color="primary" disabled={newCardKeys.length > 0}>
            生成卡密
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知创建对话框 */}
      <Dialog open={createNotificationDialog} onClose={() => setCreateNotificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>发送新通知</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="通知标题"
              fullWidth
              value={currentNotification.title}
              onChange={(e) => setCurrentNotification({ ...currentNotification, title: e.target.value })}
              placeholder="输入通知标题"
              required
            />

            <TextField
              label="通知内容"
              fullWidth
              multiline
              rows={4}
              value={currentNotification.content}
              onChange={(e) => setCurrentNotification({ ...currentNotification, content: e.target.value })}
              placeholder="输入通知内容"
              required
            />

            <TextField
              select
              label="通知类型"
              fullWidth
              value={currentNotification.type}
              onChange={(e) => setCurrentNotification({ ...currentNotification, type: e.target.value })}
            >
              <MenuItem value="info">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                  信息
                </Box>
              </MenuItem>
              <MenuItem value="success">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                  成功
                </Box>
              </MenuItem>
              <MenuItem value="warning">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                  警告
                </Box>
              </MenuItem>
              <MenuItem value="error">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                  错误
                </Box>
              </MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={currentNotification.isGlobal}
                  onChange={(e) => setCurrentNotification({ ...currentNotification, isGlobal: e.target.checked })}
                  color="primary"
                />
              }
              label="全局通知（所有用户可见）"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateNotificationDialog(false)}>取消</Button>
          <Button onClick={handleSaveNotification} color="primary" variant="contained">发送通知</Button>
        </DialogActions>
      </Dialog>

      {/* 订单编辑对话框 */}
      <Dialog open={editOrderDialog} onClose={() => setEditOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑订单</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="订单ID"
              fullWidth
              value={currentOrder.id}
              disabled
              margin="normal"
            />

            <TextField
              label="平台"
              fullWidth
              value={currentOrder.platform}
              disabled
              margin="normal"
            />

            <TextField
              label="视频链接"
              fullWidth
              value={currentOrder.videoUrl}
              margin="normal"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="复制链接">
                      <IconButton
                        edge="end"
                        onClick={() => {
                          navigator.clipboard.writeText(currentOrder.videoUrl);
                          showSnackbar('链接已复制到剪贴板', 'success');
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {currentOrder.videoUrl && (
                      <Tooltip title="在新标签页打开">
                        <IconButton
                          edge="end"
                          onClick={() => window.open(currentOrder.videoUrl, '_blank')}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="状态"
              fullWidth
              value={currentOrder.status}
              onChange={handleOrderStatusChange}
              margin="normal"
            >
              <MenuItem value="pending">待处理</MenuItem>
              <MenuItem value="in_progress">进行中</MenuItem>
              <MenuItem value="completed">已完成</MenuItem>
              <MenuItem value="failed">失败</MenuItem>
            </TextField>

            <Box>
              <Typography variant="body2" gutterBottom>
                进度: {currentOrder.progress}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Slider
                  value={currentOrder.progress}
                  onChange={handleOrderProgressChange}
                  aria-labelledby="order-progress-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                  sx={{
                    color: currentOrder.status === 'completed' ? 'success.main' :
                           currentOrder.status === 'in_progress' ? 'info.main' :
                           currentOrder.status === 'pending' ? 'warning.main' :
                           currentOrder.status === 'failed' ? 'error.main' : 'primary.main',
                  }}
                />
                <TextField
                  type="number"
                  value={currentOrder.progress}
                  onChange={handleOrderProgressChange}
                  inputProps={{ min: 0, max: 100, step: 5 }}
                  sx={{ width: 80 }}
                />
              </Box>
            </Box>

            <TextField
              label="金额"
              fullWidth
              value={formatCurrency(currentOrder.totalAmount)}
              disabled
              margin="normal"
            />

            <TextField
              label="创建时间"
              fullWidth
              value={new Date(currentOrder.createdAt).toLocaleString()}
              disabled
              margin="normal"
            />

            {/* 服务详情 */}
            {currentOrder.services && Object.keys(currentOrder.services).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  服务详情
                </Typography>
                <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>服务类型</TableCell>
                        <TableCell align="right">数量</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(currentOrder.services)
                        .filter(([_, value]) => value > 0)
                        .map(([key, value]) => {
                          const serviceNames = {
                            likes: '点赞数',
                            views: '播放量',
                            comments: '评论数',
                            shares: '分享数',
                            followers: '粉丝数',
                            completionRate: '完播率',
                            saves: '收藏数'
                          };
                          return (
                            <TableRow key={key}>
                              <TableCell>{serviceNames[key] || key}</TableCell>
                              <TableCell align="right">{value}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Box>
            {currentOrder.status === 'pending' && (
              <Button
                variant="contained"
                color="info"
                startIcon={<PlayArrowIcon />}
                onClick={() => {
                  handleStartProcessing(currentOrder.id);
                  setEditOrderDialog(false);
                }}
                sx={{ mr: 1 }}
              >
                开始处理
              </Button>
            )}

            {(currentOrder.status === 'pending' || currentOrder.status === 'in_progress') && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  handleCompleteOrder(currentOrder.id);
                  setEditOrderDialog(false);
                }}
                sx={{ mr: 1 }}
              >
                完成订单
              </Button>
            )}

            {(currentOrder.status === 'pending' || currentOrder.status === 'in_progress') && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<CancelIcon />}
                onClick={() => {
                  handleCancelOrder(currentOrder.id);
                  setEditOrderDialog(false);
                }}
              >
                取消订单
              </Button>
            )}
          </Box>

          <Box>
            <Button onClick={() => setEditOrderDialog(false)}>关闭</Button>
            <Button onClick={handleSaveOrderEdit} color="primary" variant="contained">保存更改</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;
