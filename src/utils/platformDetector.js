/**
 * Utility function to detect the platform from a video URL
 * @param {string} url - The video URL to analyze
 * @returns {string|null} - The detected platform code or null if not detected
 */
export const detectPlatform = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Douyin detection
    if (hostname.includes('douyin.com') || hostname.includes('iesdouyin.com')) {
      return 'douyin';
    }
    
    // Xiaohongshu detection
    if (hostname.includes('xiaohongshu.com') || hostname.includes('xhslink.com')) {
      return 'xiaohongshu';
    }
    
    // Bilibili detection
    if (hostname.includes('bilibili.com') || hostname.includes('b23.tv')) {
      return 'bilibili';
    }
    
    // Kuaishou detection
    if (hostname.includes('kuaishou.com') || hostname.includes('gifshow.com') || hostname.includes('chenzhongtech.com')) {
      return 'kuaishou';
    }
    
    // WeChat detection (public accounts and video channels)
    if (hostname.includes('weixin.qq.com') || hostname.includes('mp.weixin.qq.com')) {
      return 'wechat';
    }
    
    // If no platform is detected
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

/**
 * Get platform display name from platform code
 * @param {string} platformCode - The platform code
 * @returns {string} - The display name of the platform
 */
export const getPlatformName = (platformCode) => {
  const platformNames = {
    douyin: '抖音',
    xiaohongshu: '小红书',
    bilibili: '哔哩哔哩',
    kuaishou: '快手',
    wechat: '微信公众号/视频号'
  };
  
  return platformNames[platformCode] || '未知平台';
};

/**
 * Get available services for a specific platform
 * @param {string} platformCode - The platform code
 * @returns {Object} - Object with service keys and display names
 */
export const getPlatformServices = (platformCode) => {
  const commonServices = {
    views: '播放量',
    likes: '点赞数',
    shares: '分享数',
    saves: '收藏量'
  };
  
  switch (platformCode) {
    case 'douyin':
      return { ...commonServices, completionRate: '完播率' };
    case 'xiaohongshu':
      return { ...commonServices, comments: '评论数' };
    case 'bilibili':
      return { ...commonServices, completionRate: '完播率', coins: '投币数' };
    case 'kuaishou':
      return { ...commonServices, completionRate: '完播率' };
    case 'wechat':
      return { ...commonServices, reads: '阅读量' };
    default:
      return commonServices;
  }
};
