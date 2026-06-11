"use client";

import {
  Building2,
  GraduationCap,
  Users,
  FolderTree,
  Briefcase,
  Eye,
  BookOpen,
  UserCog,
} from "lucide-react";
import styles from "./OrganizationsTable.module.scss";

export default function OrganizationsTable({ organizations, loading }) {
  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <Building2 size={48} className={styles.emptyIcon} />
          <h3>No Organizations Found</h3>
          <p>There are no organizations to display at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Type</th>
              <th>Status</th>
              <th>Students</th>
              <th>TPOs / HRs</th>
              <th>Departments</th>
              <th>Jobs</th>
              <th>Courses</th>
              <th>Internships</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org._id}>
                <td>
                  <div className={styles.orgInfo}>
                    {org.type === "college" ? (
                      <GraduationCap size={20} className={styles.orgIcon} />
                    ) : (
                      <Building2 size={20} className={styles.orgIcon} />
                    )}
                    <div>
                      <div className={styles.orgName}>{org.orgName}</div>
                      <div className={styles.orgEmail}>{org.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles[org.type]}`}>
                    {org.type}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.status} ${
                      org.active ? styles.active : styles.inactive
                    }`}
                  >
                    <span className={styles.dot}></span>
                    {org.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className={styles.statItem}>
                    <Users size={16} />
                    {org.stats?.studentCount || 0}
                  </div>
                </td>
                <td>
                  <div className={styles.statItem}>
                    {org.type === "college" ? (
                      <>
                        <Users size={16} />
                        {org.stats?.tpoCount || 0}
                      </>
                    ) : (
                      <>
                        <UserCog size={16} />
                        {org.stats?.hrCount || 0}
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.statItem}>
                    <FolderTree size={16} />
                    {org.stats?.departmentCount || 0}
                  </div>
                </td>
                <td>
                  <div className={styles.statItem}>
                    <Briefcase size={16} />
                    {org.stats?.jobCount || 0}
                  </div>
                </td>
                <td>
                  <div className={styles.statItem}>
                    <BookOpen size={16} />
                    {org.stats?.courseCount || 0}
                  </div>
                </td>
                <td>
                  <div className={styles.statItem}>
                    <Briefcase size={16} />
                    {org.stats?.internshipCount || 0}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
