// pages/dashboard/admin/settings.jsx
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import SettingsPage from '../../../components/settings/SettingsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Settings = () => {
  return (
    <Layout sidebarItems={demoSidebar} section={adminSidebar} resetProgress={() => {}}>
      <SettingsPage />
    </Layout>
  );
};

export default Settings;
