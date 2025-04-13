import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { notificationManager } from '../utils/notificationManager';
import { userManager } from '../utils/dataManager';
import ProtectedRoute from '../components/ProtectedRoute';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const user = userManager.getCurrentUser();

  // 加载通知
  const loadNotifications = () => {
    if (!user) return;

    const userNotifications = notificationManager.getUserNotifications(user.id);
    setNotifications(userNotifications);
    console.log('通知页面加载的通知:', userNotifications);
  };

  // 初始加载
  useEffect(() => {
    loadNotifications();
  }, []);

  // 查看通知详情
  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);

    // 标记为已读
    if (user) {
      notificationManager.markAsRead(user.id, notification.id);
      loadNotifications(); // 重新加载通知以更新未读状态
    }
  };

  // 关闭通知详情
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = () => {
    if (user) {
      notificationManager.markAllAsRead(user.id);
      loadNotifications();
    }
  };

  // 获取通知图标
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default: // info
        return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  // 获取通知颜色
  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default: // info
        return 'info.main';
    }
  };

  // 检查通知是否已读
  const isNotificationRead = (notificationId) => {
    if (!user) return true;

    const userReadStatus = notificationManager.getUserReadStatus(user.id);
    return userReadStatus.includes(notificationId);
  };

  // 获取未读通知数量
  const getUnreadCount = () => {
    if (!user) return 0;

    const userReadStatus = notificationManager.getUserReadStatus(user.id);
    return notifications.filter(notification => !userReadStatus.includes(notification.id)).length;
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: 'Orbitron',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #3CFFDC, #3C9EFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(60, 255, 220, 0.4)'
              }}
            >
              通知中心
            </Typography>

            {getUnreadCount() > 0 && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<MarkEmailReadIcon />}
                onClick={handleMarkAllAsRead}
              >
                标记所有为已读
              </Button>
            )}
          </Box>

          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: 'rgba(3, 11, 23, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(60, 255, 220, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
            }}
          >
            {notifications.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  暂无通知
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => {
                  const isRead = isNotificationRead(notification.id);

                  return (
                    <React.Fragment key={notification.id}>
                      {index > 0 && <Divider sx={{ opacity: 0.1 }} />}
                      <ListItem
                        button
                        onClick={() => handleViewNotification(notification)}
                        sx={{
                          py: 2,
                          px: 3,
                          bgcolor: isRead ? 'transparent' : 'rgba(60, 255, 220, 0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(60, 255, 220, 0.1)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: isRead ? 'normal' : 'bold',
                                  color: isRead ? 'text.primary' : 'primary.main',
                                }}
                              >
                                {notification.title}
                              </Typography>

                              {!isRead && (
                                <Chip
                                  label="新"
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: 'primary.main',
                                    color: 'black',
                                    fontWeight: 'bold'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {notification.content}
                            </Typography>
                          }
                        />
                        <Box sx={{ ml: 2, textAlign: 'right' }}>
                          <Chip
                            label={notification.type}
                            size="small"
                            sx={{
                              mb: 1,
                              bgcolor: `${getNotificationColor(notification.type)}20`,
                              color: getNotificationColor(notification.type),
                              borderRadius: '4px',
                              textTransform: 'capitalize'
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Paper>
        </motion.div>
      </Container>

      {/* 通知详情对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'rgba(3, 11, 23, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(60, 255, 220, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
          }
        }}
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getNotificationIcon(selectedNotification.type)}
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: getNotificationColor(selectedNotification.type) }}>
                  {selectedNotification.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedNotification.content}
              </Typography>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={selectedNotification.type}
                  size="small"
                  sx={{
                    bgcolor: `${getNotificationColor(selectedNotification.type)}20`,
                    color: getNotificationColor(selectedNotification.type),
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}
                />

                <Typography variant="caption" color="text.secondary">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                关闭
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </ProtectedRoute>
  );
};

export default NotificationsPage;
