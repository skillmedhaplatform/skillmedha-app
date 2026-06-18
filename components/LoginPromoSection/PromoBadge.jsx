import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PromoBadge({ studentCount }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-8 left-8 z-20"
        >
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-300">
                    Trusted by <span className="text-white font-bold">{studentCount}+</span> students across India
                </span>
            </div>
        </motion.div>
    );
}