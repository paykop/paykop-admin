import DevToolsTab from "@/components/DevToolsTab";
import RequireAdminPage from "@/components/RequireAdminPage";

export default function DevPage() {
  return (
    <RequireAdminPage>
      <DevToolsTab />
    </RequireAdminPage>
  );
}
