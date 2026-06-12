"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loginPromoService } from '@/services/loginPromoService';

import PromoBadge from './PromoBadge';
import PromoSlider from './PromoSlider';
import PromoStats from './PromoStats';

export default function LoginPromoSection() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const promoData = await loginPromoService.getPromoData();
                if (isMounted) {
                    setData(promoData);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error loading promo data:", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading || !data) {
        return (
            <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-[#0A1128] flex-col items-center justify-center">
                {/* Simple loader */}
                <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="hidden lg:flex w-[55%] h-screen relative overflow-hidden bg-[#0A1128] flex-col items-center py-6">

            {/* Background Grid Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Radial Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />

            {/* Top Badge */}
            <PromoBadge studentCount={data.badge.studentCount} />

            {/* Main Slider Card */}
            <PromoSlider slides={data.slides} />

            {/* Bottom Stats */}
            <PromoStats stats={data.stats} />

        </div>
    );
}