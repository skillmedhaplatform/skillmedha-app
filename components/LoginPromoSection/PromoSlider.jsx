import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';
import PromoFeatureList from './PromoFeatureList';

export default function PromoSlider({ slides }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto rotate every 5 seconds
    useEffect(() => {
        if (!slides || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides]);

    if (!slides || slides.length === 0) return null;

    const currentSlide = slides[currentIndex];

    return (
        <div className="relative z-10 w-full max-w-xl mx-auto my-auto pt-12 pb-2 px-4">
            <div className="backdrop-blur-2xl bg-slate-900/40 border border-white/10 p-6 2xl:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                {/* Floating Icon */}
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl mb-4 2xl:mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Rocket className="w-7 h-7 text-white" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Titles */}
                        <h2 className="text-3xl 2xl:text-4xl font-extrabold mb-3 text-white leading-tight tracking-tight">
                            {currentSlide.title} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                                {currentSlide.subtitle}
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            {currentSlide.description}
                        </p>

                        {/* Features */}
                        <PromoFeatureList features={currentSlide.features} />
                    </motion.div>
                </AnimatePresence>

                {/* Indicators */}
                {slides.length > 1 && (
                    <div className="flex items-center space-x-2 mt-4 2xl:mt-6">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}