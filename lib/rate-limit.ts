/**
 * 高级限流器 (生产环境建议使用 Redis)
 * 支持多维度限流: IP、用户代理、全局
 */

interface RateLimitConfig {
  windowMs: number;    // 时间窗口 (毫秒)
  maxRequests: number; // 最大请求数
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

class AdvancedRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 每 5 分钟清理一次过期数据
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * 检查限流
   * @param key 限流键 (IP、用户ID等)
   * @param config 限流配置
   * @returns 是否允许请求
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    // 不存在或已过期,创建新记录
    if (!entry || now - entry.firstRequest > config.windowMs) {
      this.store.set(key, {
        count: 1,
        firstRequest: now
      });
      return true;
    }

    // 检查是否超过限制
    if (entry.count >= config.maxRequests) {
      return false;
    }

    // 增加计数
    entry.count++;
    return true;
  }

  /**
   * 获取剩余请求数
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const entry = this.store.get(key);
    if (!entry) return config.maxRequests;
    
    const now = Date.now();
    if (now - entry.firstRequest > config.windowMs) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * 获取重置时间 (毫秒)
   */
  getResetTime(key: string, config: RateLimitConfig): number {
    const entry = this.store.get(key);
    if (!entry) return Date.now();
    
    return entry.firstRequest + config.windowMs;
  }

  /**
   * 清理过期数据
   */
  private cleanup() {
    const now = Date.now();
    const maxWindow = 24 * 60 * 60 * 1000; // 24 小时

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.firstRequest > maxWindow) {
        this.store.delete(key);
      }
    }

    console.log(`[Rate Limiter] 清理完成, 当前条目数: ${this.store.size}`);
  }

  /**
   * 销毁清理定时器
   */
  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// 导出单例
export const rateLimiter = new AdvancedRateLimiter();

// 预定义限流配置
export const LIMIT_CONFIGS = {
  // API 创建秘密: 每 15 分钟 50 次
  CREATE_SECRET: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50
  },
  
  // API 解密: 每 15 分钟 100 次
  DECRYPT: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  },
  
  // 全局 IP 限制: 每小时 200 次
  GLOBAL_IP: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 200
  },
  
  // 严格模式: 每分钟 10 次 (用于可疑 IP)
  STRICT: {
    windowMs: 60 * 1000,
    maxRequests: 10
  }
};
