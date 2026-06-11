import React from "react";
import styles from "@/modules/admin/styles/skeleton.module.scss";

export default function Loading() {
  return (
    <div className={styles.layoutSkeleton}>
      <header className={styles.header}>
        <div className={styles.headerBlock} />
      </header>
      <div className={styles.mainBody}>
        <aside className={styles.sidebar}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.sidebarItem} />
          ))}
        </aside>
        <main className={styles.content}>
          <div className={styles.breadcrumb} />
          <div className={styles.title} />
          <div className={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.card} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
