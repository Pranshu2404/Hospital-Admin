// pages/dashboard/admin/settings.jsx
import Layout from '../../../components/Layout';
import SettingsPage from '../../../components/settings/SettingsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const Settings = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <SettingsPage />
    </Layout>
  );
};

export default Settings;
