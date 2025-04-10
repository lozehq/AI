/**
 * Utility function to detect the platform from a video URL
 * @param {string} url - The video URL to analyze
 * @returns {string|null} - The detected platform code or null if not detected
 */
export const detectPlatform = (url) => {
  // 如果URL为空或不是字符串，直接返回null
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.warn('Invalid URL provided to detectPlatform:', url);
    return null;
  }

  try {
    // 处理特殊字符和空格
    let cleanUrl = url.trim();

    // 确保URL有协议前缀
    let normalizedUrl = cleanUrl;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + cleanUrl;
    }

    // 尝试解析URL
    let urlObj;
    try {
      urlObj = new URL(normalizedUrl);
    } catch (urlError) {
      console.warn('Failed to parse URL:', normalizedUrl, urlError);

      // 尝试直接从文本中检测平台
      const lowerUrl = normalizedUrl.toLowerCase();

      if (lowerUrl.includes('douyin') || lowerUrl.includes('tiktok')) {
        return 'douyin';
      }
      if (lowerUrl.includes('xiaohongshu') || lowerUrl.includes('xhs')) {
        return 'xiaohongshu';
      }
      if (lowerUrl.includes('bilibili') || lowerUrl.includes('b23')) {
        return 'bilibili';
      }
      if (lowerUrl.includes('kuaishou') || lowerUrl.includes('gifshow')) {
        return 'kuaishou';
      }
      if (lowerUrl.includes('weixin') || lowerUrl.includes('wechat')) {
        return 'wechat';
      }

      return null;
    }

    const hostname = urlObj.hostname.toLowerCase();

    // Douyin detection
    if (hostname.includes('douyin.com') || hostname.includes('iesdouyin.com') || hostname.includes('tiktok.com')) {
      return 'douyin';
    }

    // Xiaohongshu detection
    if (hostname.includes('xiaohongshu.com') || hostname.includes('xhslink.com') || hostname.includes('xhs.com')) {
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
    if (hostname.includes('weixin.qq.com') || hostname.includes('mp.weixin.qq.com') || hostname.includes('wechat.com')) {
      return 'wechat';
    }

    // 如果还是无法检测，尝试从路径中检测
    const fullPath = (urlObj.pathname + urlObj.search + urlObj.hash).toLowerCase();

    if (fullPath.includes('douyin') || fullPath.includes('tiktok')) {
      return 'douyin';
    }
    if (fullPath.includes('xiaohongshu') || fullPath.includes('xhs')) {
      return 'xiaohongshu';
    }
    if (fullPath.includes('bilibili') || fullPath.includes('b23')) {
      return 'bilibili';
    }
    if (fullPath.includes('kuaishou') || fullPath.includes('gifshow')) {
      return 'kuaishou';
    }
    if (fullPath.includes('weixin') || fullPath.includes('wechat')) {
      return 'wechat';
    }

    // If no platform is detected
    console.warn('No platform detected for URL:', url);
    return null;
  } catch (error) {
    console.error('Error in detectPlatform:', error, 'for URL:', url);
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
