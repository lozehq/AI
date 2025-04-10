// 格式化货币
export const formatCurrency = (amount) => {
  return `¥${amount.toFixed(2)}`;
};

// 格式化日期
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化数字（添加千位分隔符）
export const formatNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 格式化百分比
export const formatPercentage = (value) => {
  return `${value}%`;
};

// 截断文本
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
