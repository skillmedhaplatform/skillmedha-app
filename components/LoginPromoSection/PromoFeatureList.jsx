import React from 'react';
import { BookOpen, Briefcase, Bot, Globe, Star, ShieldCheck } from 'lucide-react';

const ICON_MAP = {
    courses: BookOpen,
    briefcase: Briefcase,
    ai: Bot,
    globe: Globe,
    star: Star,
    shield: ShieldCheck
};

export default function PromoFeatureList({ features }) {
    if (!features || !features.length) return null;

    return (
        <div className="space-y-2 2xl:space-y-3 mt-4 2xl:mt-6">
            {features.map((feature, index) => {
                const IconComponent = ICON_MAP[feature.icon] || BookOpen;

                return (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 2xl:p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300 backdrop-blur-md group"
                    >
                        <div className="flex items-center space-x-3 2xl:space-x-4">
                            <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                <IconComponent className="w-4 h-4 2xl:w-5 2xl:h-5" />
                            </div>
                            <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{feature.title}</span>
                        </div>
                        <span className="text-white font-bold tracking-wide">{feature.value}</span>
                    </div>
                );
            })}
        </div>
    );
}