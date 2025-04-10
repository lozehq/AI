import React, { useState, useEffect } from 'react';
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
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

// 导入数据管理工具
import { userManager, orderManager, serviceManager } from '../utils/dataManager';
import { formatCurrency } from '../utils/formatters';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // 编辑用户对话框
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // 编辑服务对话框
  const [editServiceDialog, setEditServiceDialog] = useState(false);
  const [currentService, setCurrentService] = useState({ key: '', name: '', price: 0 });

  // 检查当前用户是否是管理员
  useEffect(() => {
    const checkAdmin = () => {
      const user = userManager.getCurrentUser();
      if (!user || !user.isAdmin) {
        // 如果不是管理员，重定向到首页
        navigate('/');
        return;
      }
      
      // 加载数据
      loadData();
    };
    
    checkAdmin();
  }, [navigate]);
  
  // 加载数据
  const loadData = () => {
    setIsLoading(true);
    
    // 加载用户数据
    const userData = userManager.getAllUsers();
    setUsers(userData);
    
    // 加载订单数据
    const orderData = orderManager.getAllOrders();
    setOrders(orderData);
    
    // 加载服务数据
    const serviceData = serviceManager.getAllServices();
    setServices(serviceData);
    
    setIsLoading(false);
  };
  
  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 处理搜索
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // 显示提示消息
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };
  
  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // 过滤用户
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 过滤订单
  const filteredOrders = orders.filter(order => 
    (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.platform || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
        // 这里应该有一个删除用户的方法，但目前dataManager中没有
        // 临时实现：获取所有用户，过滤掉要删除的用户，然后保存回localStorage
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        showSnackbar('用户已删除', 'success');
        loadData();
      } catch (error) {
        console.error('删除用户失败:', error);
        showSnackbar('删除用户失败', 'error');
      }
    }
  };
  
  // 编辑服务
  const handleEditService = (key, service) => {
    setCurrentService({ key, name: service.name, price: service.price });
    setEditServiceDialog(true);
  };
  
  // 添加新服务
  const handleAddService = () => {
    setCurrentService({ key: '', name: '', price: 0 });
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
        price: parseFloat(currentService.price)
      };
      
      // 保存到localStorage
      localStorage.setItem('services', JSON.stringify(updatedServices));
      showSnackbar('服务信息已更新', 'success');
      loadData();
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
        
        // 保存到localStorage
        localStorage.setItem('services', JSON.stringify(updatedServices));
        showSnackbar('服务已删除', 'success');
        loadData();
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
                          <TableCell>{order.status}</TableCell>
                          <TableCell>{order.progress || 0}%</TableCell>
                          <TableCell>{formatCurrency(order.totalAmount || order.price || 0)}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteOrder(order.orderId || order.id)}
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
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(services).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
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

          {/* 系统概览 */}
          {tabValue === 3 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    bgcolor: 'rgba(10, 25, 41, 0.7)',
                    border: '1px solid rgba(60, 255, 220, 0.2)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" color="primary.main" gutterBottom>
                        用户统计
                      </Typography>
                      <Typography variant="h3" color="text.primary">
                        {users.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        总用户数
                      </Typography>
                      <Divider sx={{ my: 2, borderColor: 'rgba(60, 255, 220, 0.1)' }} />
                      <Typography variant="body2" color="text.secondary">
                        管理员: {users.filter(user => user.isAdmin).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        普通用户: {users.filter(user => !user.isAdmin).length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    bgcolor: 'rgba(10, 25, 41, 0.7)',
                    border: '1px solid rgba(60, 255, 220, 0.2)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" color="primary.main" gutterBottom>
                        订单统计
                      </Typography>
                      <Typography variant="h3" color="text.primary">
                        {orders.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        总订单数
                      </Typography>
                      <Divider sx={{ my: 2, borderColor: 'rgba(60, 255, 220, 0.1)' }} />
                      <Typography variant="body2" color="text.secondary">
                        完成订单: {orders.filter(order => order.status === 'completed').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        进行中订单: {orders.filter(order => order.status === 'processing' || order.status === 'in_progress').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        待处理订单: {orders.filter(order => order.status === 'waiting' || order.status === 'pending').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    bgcolor: 'rgba(10, 25, 41, 0.7)',
                    border: '1px solid rgba(60, 255, 220, 0.2)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" color="primary.main" gutterBottom>
                        服务统计
                      </Typography>
                      <Typography variant="h3" color="text.primary">
                        {Object.keys(services).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        总服务数
                      </Typography>
                      <Divider sx={{ my: 2, borderColor: 'rgba(60, 255, 220, 0.1)' }} />
                      <Typography variant="body2" color="text.secondary">
                        平均价格: {
                          Object.values(services).length > 0 
                            ? formatCurrency(Object.values(services).reduce((sum, service) => sum + service.price, 0) / Object.values(services).length)
                            : formatCurrency(0)
                        }
                      </Typography>
                    </CardContent>
                  </Card>
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
            />
            <TextField
              label="服务名称"
              fullWidth
              value={currentService.name || ''}
              onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
            />
            <TextField
              label="单价"
              fullWidth
              type="number"
              value={currentService.price || 0}
              onChange={(e) => setCurrentService({ ...currentService, price: parseFloat(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditServiceDialog(false)}>取消</Button>
          <Button onClick={handleSaveService} color="primary">保存</Button>
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
