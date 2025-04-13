/**
 * 紧急重置工具 - 用于解决登录/退出问题
 *
 * 这个文件提供了一个紧急重置功能，可以在用户遇到登录/退出问题时使用。
 * 它会清除所有本地存储、会话存储和IndexedDB数据，然后重新加载页面。
 */

// 清除所有本地存储
const clearLocalStorage = () => {
  console.log('清除所有本地存储...');
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('清除本地存储失败:', error);
    return false;
  }
};

// 清除所有会话存储
const clearSessionStorage = () => {
  console.log('清除所有会话存储...');
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('清除会话存储失败:', error);
    return false;
  }
};

// 重置全局状态
const resetGlobalState = () => {
  console.log('重置全局状态...');
  try {
    // 重置离线模式状态
    window.isOfflineMode = false;

    // 清除服务器连接检查定时器
    if (window.serverCheckIntervalId) {
      clearInterval(window.serverCheckIntervalId);
      window.serverCheckIntervalId = null;
    }

    return true;
  } catch (error) {
    console.error('重置全局状态失败:', error);
    return false;
  }
};

// 清除IndexedDB数据
const clearIndexedDB = async () => {
  console.log('清除IndexedDB数据...');
  try {
    const DB_NAME = 'AICommunityDB';

    // 检查IndexedDB是否可用
    if (!window.indexedDB) {
      console.warn('IndexedDB不可用');
      return false;
    }

    // 删除数据库
    return new Promise((resolve) => {
      const request = window.indexedDB.deleteDatabase(DB_NAME);

      request.onsuccess = () => {
        console.log('IndexedDB数据库删除成功');
        resolve(true);
      };

      request.onerror = (event) => {
        console.error('IndexedDB数据库删除失败:', event);
        resolve(false);
      };

      request.onblocked = (event) => {
        console.warn('IndexedDB数据库删除被阻塞，请关闭所有标签页后重试:', event);
        resolve(false);
      };
    });
  } catch (error) {
    console.error('清除IndexedDB数据失败:', error);
    return false;
  }
};

// 紧急重置
export const emergencyReset = async () => {
  console.log('开始紧急重置...');

  try {
    // 清除所有存储
    const localStorageCleared = clearLocalStorage();
    const sessionStorageCleared = clearSessionStorage();
    const globalStateReset = resetGlobalState();
    const indexedDBCleared = await clearIndexedDB();

    console.log('紧急重置结果:', {
      localStorageCleared,
      sessionStorageCleared,
      globalStateReset,
      indexedDBCleared
    });

    // 添加额外的清除操作
    try {
      // 清除所有 cookie
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });

      // 清除应用缓存
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }

      console.log('额外清除操作完成');
    } catch (extraError) {
      console.warn('额外清除操作失败:', extraError);
    }

    // 添加额外的清除操作 - 尝试清除服务器工作线程缓存
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        console.log('已发送清除缓存消息给服务器工作线程');
      }
    } catch (swError) {
      console.warn('清除服务器工作线程缓存失败:', swError);
    }

    // 重新加载页面，使用硬性刷新忽略缓存
    console.log('准备重新加载页面...');

    // 添加延迟，确保所有清除操作完成
    setTimeout(() => {
      try {
        // 尝试使用 fetch 强制刷新页面缓存
        fetch(window.location.href, { cache: 'reload', mode: 'no-cors' })
          .then(() => {
            console.log('页面缓存已刷新');
          })
          .catch(err => {
            console.warn('刷新页面缓存失败:', err);
          })
          .finally(() => {
            // 尝试使用 location.replace 进行完全的页面替换
            console.log('执行页面替换...');
            window.location.replace(window.location.origin + '/login?reset=true&t=' + new Date().getTime());
          });
      } catch (reloadError) {
        console.warn('使用 fetch 刷新缓存失败，尝试直接替换:', reloadError);
        window.location.replace(window.location.origin + '/login?reset=true&t=' + new Date().getTime());
      }
    }, 1000);
  } catch (error) {
    console.error('紧急重置过程中发生错误:', error);

    // 即使出错，也尝试重新加载页面
    alert('重置过程中发生错误，将尝试刷新页面。如果问题仍然存在，请尝试清除浏览器缓存和 Cookie。');
    window.location.reload(true);
  }
};

// 添加到全局对象，以便可以从控制台调用
window.emergencyReset = emergencyReset;

export default emergencyReset;
