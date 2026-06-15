import React from 'react';
import { motion } from 'framer-motion';

export default function PromoStatCard({ stat }) {
    return (
        <div className="flex flex-col p-3 2xl:p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md hover:-translate-y-1 shadow-lg">
            <span className="text-xl 2xl:text-2xl font-bold text-white mb-1">{stat.value}</span>
            <span className="text-xs text-slate-400 font-medium mb-1 2xl:mb-3">{stat.label}</span>
            <span className="text-[11px] text-emerald-400 font-medium">{stat.growth}</span>
        </div>
    );
}