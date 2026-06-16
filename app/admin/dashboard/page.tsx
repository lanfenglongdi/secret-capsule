"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Secret {
  id: string;
  created_at: string;
  retention_period: string | null;
  expires_at: string | null;
  created_by: string | null;
}

const RETENTION_OPTIONS = [
  { value: '1month', label: '1个月' },
  { value: '1year', label: '1年' },
  { value: '3years', label: '3年' },
  { value: 'permanent', label: '永久保存' }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expiredCount, setExpiredCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRetention, setSelectedRetention] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSecrets();
  }, []);

  async function fetchSecrets() {
    try {
      const res = await fetch("/api/admin/secrets");
      
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "获取数据失败");
      }

      setSecrets(data.secrets || []);
      setExpiredCount(data.expired_count || 0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error("退出失败", err);
    }
  }

  async function handleUpdateRetention(id: string) {
    if (!selectedRetention) {
      alert("请选择保存期限");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/admin/update-retention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, retention_period: selectedRetention })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "更新失败");
      }

      alert("✅ 保存期限已更新");
      setEditingId(null);
      fetchSecrets(); // 刷新列表
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  // 格式化保存期限显示
  function formatRetention(period: string | null, expiresAt: string | null): string {
    if (period === 'permanent') return '永久';
    if (period === '1month') return '1个月';
    if (period === '1year') return '1年';
    if (period === '3years') return '3年';
    
    // 如果没有设置保存期限，默认显示1个月
    if (expiresAt) {
      const expDate = new Date(expiresAt);
      const now = new Date();
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return '已过期';
      if (diffDays === 0) return '今天过期';
      return `${diffDays}天后过期`;
    }
    
    // 默认显示1个月
    return '1个月';
  }

  // 过滤秘密列表（仅按编号搜索）
  const filteredSecrets = secrets.filter(secret => {
    return secret.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p style={{ fontSize: 18, color: "#666" }}>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5"
    }}>
      {/* 顶部导航栏 */}
      <div style={{
        backgroundColor: "#0070f3",
        color: "white",
        padding: "16px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>
          🔐 管理员仪表板
        </h1>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>共 {secrets.length} 个秘密</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            🚪 退出登录
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 40
      }}>
        {/* 统计卡片 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 30
        }}>
          <div style={{
            padding: 24,
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>秘密总数</div>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#0070f3" }}>{secrets.length}</div>
          </div>
          <div style={{
            padding: 24,
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>今日新增</div>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#4caf50" }}>
              {secrets.filter(s => {
                const today = new Date();
                const created = new Date(s.created_at);
                return created.toDateString() === today.toDateString();
              }).length}
            </div>
          </div>
          <div style={{
            padding: 24,
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>过期数量</div>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#f44336" }}>{expiredCount}</div>
            <div style={{ fontSize: 12, color: "#4caf50", marginTop: 8 }}>
              ✅ 过期秘密自动永久删除
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div style={{
          marginBottom: 20,
          padding: 20,
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "#666", fontWeight: "bold" }}>
                🔍 按秘密编号搜索
              </label>
              <input
                type="text"
                placeholder="输入秘密编号，如 SC-XXXXXX"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{
            marginBottom: 20,
            padding: 16,
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: 6,
            border: "1px solid #ffcdd2"
          }}>
            ❌ {error}
          </div>
        )}

        {/* 秘密列表 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid #eee",
            fontWeight: "bold",
            color: "#333"
          }}>
            📋 秘密列表（默认保存1个月）
          </div>

          {filteredSecrets.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: "center",
              color: "#999"
            }}>
              {searchTerm ? "没有找到匹配的秘密" : "暂无秘密数据"}
            </div>
          ) : (
            <div style={{ maxHeight: 600, overflowY: "auto", overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      fontSize: 14,
                      color: "#666",
                      fontWeight: "600"
                    }}>
                      秘密编号
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      fontSize: 14,
                      color: "#666",
                      fontWeight: "600"
                    }}>
                      创建时间
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      fontSize: 14,
                      color: "#666",
                      fontWeight: "600"
                    }}>
                      创建人
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      fontSize: 14,
                      color: "#666",
                      fontWeight: "600"
                    }}>
                      保存期限
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      fontSize: 14,
                      color: "#666",
                      fontWeight: "600"
                    }}>
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSecrets.map((secret) => (
                    <tr key={secret.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <code style={{
                          backgroundColor: "#f0f7ff",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 14,
                          color: "#0070f3",
                          fontWeight: "bold"
                        }}>
                          {secret.id}
                        </code>
                      </td>
                      <td style={{
                        padding: "12px 16px",
                        color: "#666",
                        fontSize: 14
                      }}>
                        {new Date(secret.created_at).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{
                        padding: "12px 16px",
                        fontSize: 13
                      }}>
                        {(() => {
                          const creator = secret.created_by;
                          // 如果没有创建人信息，默认为管理员
                          if (!creator) {
                            return <span style={{ color: "#0070f3" }}>👤 管理员</span>;
                          }
                          // 显示IP地址
                          return <span style={{ color: "#999" }}>{creator}</span>;
                        })()}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {editingId === secret.id ? (
                          <select
                            value={selectedRetention}
                            onChange={(e) => setSelectedRetention(e.target.value)}
                            style={{
                              padding: "6px 10px",
                              fontSize: 13,
                              border: "1px solid #ddd",
                              borderRadius: 4
                            }}
                          >
                            {RETENTION_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{
                            fontSize: 13,
                            color: secret.retention_period === 'permanent' ? '#4caf50' :
                                   secret.expires_at && new Date(secret.expires_at) <= new Date() ? '#f44336' : '#666'
                          }}>
                            {formatRetention(secret.retention_period, secret.expires_at)}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {editingId === secret.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateRetention(secret.id)}
                              disabled={updating}
                              style={{
                                padding: "6px 12px",
                                fontSize: 13,
                                backgroundColor: updating ? "#ccc" : "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: updating ? "not-allowed" : "pointer",
                                marginRight: 4
                              }}
                            >
                              {updating ? "保存中..." : "保存"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{
                                padding: "6px 12px",
                                fontSize: 13,
                                backgroundColor: "transparent",
                                color: "#666",
                                border: "1px solid #ddd",
                                borderRadius: 4,
                                cursor: "pointer"
                              }}
                            >
                              取消
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(secret.id);
                              setSelectedRetention(secret.retention_period || '1month');
                            }}
                            style={{
                              padding: "6px 12px",
                              fontSize: 13,
                              backgroundColor: "#ff9800",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer"
                            }}
                          >
                            修改期限
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 底部说明 */}
        <div style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: "#e3f2fd",
          borderRadius: 8,
          border: "1px solid #bbdefb",
          fontSize: 13,
          color: "#1565c0"
        }}>
          💡 提示：新创建的秘密默认保存期限为1个月。管理员可以修改每个秘密的保存期限（1个月/1年/3年/永久）。过期秘密会自动从数据库中永久删除，不留任何痕迹，与用户本人删除效果相同。
        </div>
      </div>
    </div>
  );
}