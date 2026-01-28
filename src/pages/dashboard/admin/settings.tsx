// pages/dashboard/admin/settings.jsx
import Layout from '../../../components/Layout';
import SettingsPage from '../../../components/settings/SettingsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Settings = () => {
  return (
    <Layout sidebarItems={adminSidebar} section={adminSidebar} resetProgress={() => {}}>
      <SettingsPage />
    </Layout>
  );
};

export default Settings;
