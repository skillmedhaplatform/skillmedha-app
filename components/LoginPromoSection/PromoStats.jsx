import React from 'react';
import { motion } from 'framer-motion';
import PromoStatCard from './PromoStatCard';

export default function PromoStats({ stats }) {
    if (!stats || !stats.length) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full px-8 lg:px-12 z-20 mt-auto mb-6"
        >
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {stats.map((stat) => (
                    <motion.div key={stat.id} variants={itemVariants}>
                        <PromoStatCard stat={stat} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}