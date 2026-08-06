"use client";
import React, { useEffect, useState } from 'react';
import { MonitorX } from 'lucide-react';
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

export default function DeviceBlocker({ children, strict = true, returnPath = '/student/tests', returnText = 'Return to Tests' }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (!strict) return;

    const checkDevice = () => {
      // 1. Check User Agent for mobile/tablet keywords
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

      // 2. Check touch points (catches iPads masquerading as Macs)
      // Desktop Macs usually have 0 maxTouchPoints.
      const hasTouch = navigator.maxTouchPoints > 0;
      
      // If it's a Mac with touch points, it's an iPad
      const isIPadPro = /Macintosh/.test(userAgent) && hasTouch;

      // 3. Screen dimensions (physical)
      const screenWidth = window.screen.width;
      
      // 4. Block condition:
      // - It identifies as a mobile OS
      // - OR it pretends to be Mac but has touch (iPad desktop mode)
      // - OR it has touch and the physical screen is smaller than a typical 11-inch laptop screen
      if (isMobileAgent || isIPadPro || (hasTouch && screenWidth < 1024)) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Also periodically check in case they somehow toggle tools dynamically
    const interval = setInterval(checkDevice, 2000);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      clearInterval(interval);
    };
  }, [strict]);

  // Avoid hydration mismatch by waiting for client render
  if (!isClient) return null;

  if (isBlocked) {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#EFF5FB] overflow-hidden overscroll-none">
        <StudentPageHeader title="Access Restricted" subtitle="Desktop Required" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <MonitorX className="w-24 h-24 text-gray-400 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Desktop or Laptop Required</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-20 text-[15px] leading-relaxed">
            For security and proctoring purposes, this assessment must be taken on a desktop or laptop computer. 
            Mobile devices and tablets (including Desktop Mode) are not supported.
          </p>
          <Button 
            type="primary" 
            size="large"
            style={{ marginTop: '40px' }}
            onClick={() => {
              if (returnPath === 'back') {
                router.back();
              } else {
                router.push(returnPath);
              }
            }}
            className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white font-bold px-10 h-11 rounded-lg shadow-md"
          >
            {returnText}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
