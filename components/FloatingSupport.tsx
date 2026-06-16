"use client";

import { useState, useRef, useEffect } from "react";

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 初始化位置（客户端渲染后）
  useEffect(() => {
    setPosition({ x: window.innerWidth - 52, y: window.innerHeight / 2 });
  }, []);

  // 开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // 展开时不允许拖动
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  // 处理鼠标移动和释放
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      
      // 限制在可视区域内
      const maxX = window.innerWidth - 32;
      const maxY = window.innerHeight - 32;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        ref={buttonRef}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: "#4CAF50",
          border: "none",
          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
          cursor: isDragging ? "grabbing" : isOpen ? "pointer" : "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          transition: isDragging ? "none" : "box-shadow 0.2s",
          padding: 0,
          userSelect: "none"
        }}
      >
        {isOpen ? (
          <span style={{ fontSize: 18, color: "white" }}>✕</span>
        ) : (
          <img 
            src="/support-icon.png" 
            alt="客服"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%"
            }}
            draggable={false}
          />
        )}
      </button>

      {/* 展开的二维码面板 */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            left: position.x - 236,
            top: position.y - 100,
            width: 220,
            padding: 16,
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            zIndex: 9998,
            textAlign: "center"
          }}
        >
          <p style={{
            margin: "0 0 12px 0",
            fontSize: 14,
            color: "#333",
            fontWeight: "bold"
          }}>
            微信扫码联系客服
          </p>
          <img
            src="/wechat-qrcode.png"
            alt="微信客服二维码"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 8
            }}
          />
          <p style={{
            margin: "8px 0 0 0",
            fontSize: 11,
            color: "#999"
          }}>
            扫码添加客服微信
          </p>
        </div>
      )}
    </>
  );
}
