import React from 'react';
import { Skeleton } from 'antd';
import styles from './CourseCardSkeleton.module.scss';

const CourseCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.thumbWrapper}>
        <Skeleton.Image className={styles.skeletonImage} active />
      </div>

      <div className={styles.content}>
        <div style={{ width: '100%', marginBottom: '8px' }}>
          <Skeleton.Button active size="small" style={{ width: '80%', height: '24px' }} shape="round" />
        </div>

        <div className={styles.metaRow}>
          <Skeleton.Button active size="small" style={{ width: '60px', height: '24px' }} shape="round" />
          <Skeleton.Button active size="small" style={{ width: '60px', height: '24px' }} shape="round" />
          <Skeleton.Button active size="small" style={{ width: '80px', height: '24px' }} shape="round" />
        </div>

        <div style={{ height: '60px', marginBottom: '8px', overflow: 'hidden' }}>
          <Skeleton active paragraph={{ rows: 2, width: ['100%', '80%'] }} title={false} />
        </div>

        <div className={styles.footer}>
          <Skeleton.Button active size="small" style={{ width: '80px', height: '20px' }} shape="square" />
          <Skeleton.Button active size="medium" style={{ width: '100px', height: '32px' }} shape="round" />
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
