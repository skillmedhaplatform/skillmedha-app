"use client";
import React from "react";
import { Skeleton, Divider } from "antd";
import styles from "@/universalUtils/DynamicLearningPage/page.module.scss";

const LearningSkeleton = () => {
    return (
        <div className={styles.container}>
            {/* Header / Titles Bar Skeleton */}
            <div className={styles.titlesBar} style={{ backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Skeleton.Input active size="small" style={{ width: 300 }} />
                    <Skeleton.Node active style={{ width: 16, height: 16, borderRadius: '50%' }} />
                    <Skeleton.Input active size="small" style={{ width: 100 }} />
                </div>
                <Skeleton.Button active style={{ width: 120, height: 40 }} />
            </div>

            <div className={styles.bodyStyles}>
                {/* Content Area (Main Video/Notes) Skeleton */}
                <div className={styles.bodyStylesRight} style={{ padding: '2rem' }}>
                    {/* Video Placeholder */}
                    <div style={{ width: '100%', height: '400px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Skeleton.Button active style={{ width: 64, height: 64, borderRadius: '50%' }} />
                    </div>

                    {/* Navigation/Tabs Skeleton */}
                    <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
                        <Skeleton.Button active size="small" style={{ width: 80 }} />
                        <Skeleton.Button active size="small" style={{ width: 60 }} />
                        <Skeleton.Button active size="small" style={{ width: 90 }} />
                    </div>

                    {/* Content Details Skeleton */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Skeleton active paragraph={{ rows: 4 }} title={{ width: '30%' }} />
                    </div>
                </div>

                {/* Sidebar (Course Content List) Skeleton */}
                <div className={styles.bodyStylesLeft} style={{ padding: '1rem' }}>
                    {/* Sidebar Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <Skeleton.Button active size="small" style={{ width: 120 }} />
                        <Skeleton.Button active size="small" style={{ width: 100 }} />
                    </div>

                    {/* Sections */}
                    {[1, 2, 3].map((unit) => (
                        <div key={unit} style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <Skeleton active paragraph={false} title={{ width: '60%' }} />
                            </div>
                            {[1, 2, 3].map((topic) => (
                                <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem' }}>
                                    <Skeleton.Node active style={{ width: 16, height: 16, borderRadius: '4px' }} />
                                    <Skeleton active paragraph={false} title={{ width: '70%' }} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LearningSkeleton;
