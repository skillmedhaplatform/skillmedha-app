import TpoAuthGuard from "./TpoAuthGuard";
import TpoSidebarToggle from "./TpoSidebarToggle";

export default function GroupLayout({ children }) {
  return (
    <TpoAuthGuard>
      <TpoSidebarToggle>
        {children}
      </TpoSidebarToggle>
    </TpoAuthGuard>
  );
}
