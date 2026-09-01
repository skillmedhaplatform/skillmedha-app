"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { MonitorSmartphone } from "lucide-react";

export function useMobileEditBlocker() {
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 768px is typically the breakpoint for mobile devices. Tablets are >= 768px.
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkEditClick = (callback) => {
    if (isMobile) {
      setShowModal(true);
    } else {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };

  const MobileEditModal = (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B' }}>
          <MonitorSmartphone color="#3B82F6" size={20} />
          <span>Desktop View Required</span>
        </div>
      }
      open={showModal}
      onCancel={() => setShowModal(false)}
      footer={null}
      centered
      width={400}
    >
      <div style={{ padding: '16px 0' }}>
        <p style={{ color: '#475569', marginBottom: '20px', lineHeight: '1.6' }}>
          Profile editing is only supported in Desktop View. To edit your profile, please use a PC or switch to <strong>Desktop Site</strong> in your browser settings.
        </p>
        <button
          onClick={() => setShowModal(false)}
          style={{
            width: '100%',
            padding: '10px 0',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            fontWeight: '600',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#DBEAFE'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#EFF6FF'}
        >
          Understood
        </button>
      </div>
    </Modal>
  );

  return { isMobile, checkEditClick, MobileEditModal };
}
