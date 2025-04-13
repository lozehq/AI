import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
import RefreshIcon from '@mui/icons-material/Refresh';

// 导入 apiService 以共享离线状态
import apiService from '../services/apiService';

// 离线状态指示器组件
const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(false);

  // 检查服务器连接状态
  const checkServerConnection = async () => {
    try {
      // 使用 apiService 中的方法检查连接状态
      const response = await fetch('http://localhost:3030/api/keys', {
        method: 'HEAD',
        timeout: 3000
      });

      // 更新本地状态
      setIsOffline(false);

      // 如果 apiService 中的离线模式为 true，尝试重置
      if (window.isOfflineMode === true) {
        console.log('检测到服务器连接恢复，重置离线模式');
        window.isOfflineMode = false;
      }

      return true;
    } catch (error) {
      // 更新本地状态
      setIsOffline(true);

      // 设置全局离线模式
      window.isOfflineMode = true;

      return false;
    }
  };

  // 手动刷新连接状态
  const handleRefresh = () => {
    checkServerConnection().then(isConnected => {
      if (isConnected) {
        // 如果连接恢复，刷新页面
        window.location.reload();
      }
    });
  };

  // 初始化和定期检查连接状态
  useEffect(() => {
    // 检查全局离线模式状态
    if (typeof window.isOfflineMode !== 'undefined') {
      setIsOffline(window.isOfflineMode);
    }

    // 初始检查
    checkServerConnection();

    // 每30秒检查一次
    const interval = setInterval(checkServerConnection, 30000);

    // 监听在线/离线事件
    const handleOnline = () => {
      console.log('浏览器检测到网络连接恢复');
      checkServerConnection();
    };

    const handleOffline = () => {
      console.log('浏览器检测到网络连接断开');
      setIsOffline(true);
      window.isOfflineMode = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 监听全局离线模式状态变化
    const checkGlobalOfflineMode = () => {
      if (typeof window.isOfflineMode !== 'undefined' && isOffline !== window.isOfflineMode) {
        setIsOffline(window.isOfflineMode);
      }
    };

    // 每秒检查一次全局离线模式状态
    const offlineModeInterval = setInterval(checkGlobalOfflineMode, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(offlineModeInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  // 如果在线，不显示任何内容
  if (!isOffline) {
    return null;
  }

  // 离线时显示指示器
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1
      }}
    >
      <Chip
        icon={<WifiOffIcon />}
        label="离线模式"
        color="warning"
        variant="filled"
        onClick={handleRefresh}
        deleteIcon={<RefreshIcon />}
        onDelete={handleRefresh}
        sx={{
          background: 'rgba(255, 152, 0, 0.9)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          '& .MuiChip-icon': { color: 'white' },
          '& .MuiChip-deleteIcon': { color: 'white' },
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: 'white',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '2px 8px',
          borderRadius: 1,
          backdropFilter: 'blur(4px)'
        }}
      >
        点击刷新连接
      </Typography>
    </Box>
  );
};

export default OfflineIndicator;
