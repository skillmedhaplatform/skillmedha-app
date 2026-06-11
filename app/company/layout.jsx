import CompanyAuthGuard from "./CompanyAuthGuard";
import CompanySidebarShell from "./CompanySidebarShell";

export default function CompanyLayout({ children }) {
  return (
    <CompanyAuthGuard>
      <CompanySidebarShell>
        {children}
      </CompanySidebarShell>
    </CompanyAuthGuard>
  );
}
