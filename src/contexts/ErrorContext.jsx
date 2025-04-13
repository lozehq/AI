import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

// 创建错误上下文
const ErrorContext = createContext();

// 错误提供者组件
export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [severity, setSeverity] = useState('error');
  const [open, setOpen] = useState(false);
  const [autoHideDuration, setAutoHideDuration] = useState(6000);

  // 显示错误
  const showError = (message, severity = 'error', duration = 6000) => {
    setError(message);
    setSeverity(severity);
    setAutoHideDuration(duration);
    setOpen(true);
  };

  // 关闭错误提示
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  // 上下文值
  const value = {
    showError,
    error,
    severity
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {severity === 'error' && <AlertTitle>错误</AlertTitle>}
          {severity === 'warning' && <AlertTitle>警告</AlertTitle>}
          {severity === 'info' && <AlertTitle>提示</AlertTitle>}
          {severity === 'success' && <AlertTitle>成功</AlertTitle>}
          {error}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

// 自定义钩子，用于访问错误上下文
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;
