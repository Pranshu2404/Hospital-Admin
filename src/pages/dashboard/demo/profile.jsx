// pages/dashboard/admin/profile.jsx
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import UserProfilePage from '../../../components/user/UserProfilePage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Profile = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <UserProfilePage />
    </Layout>
  );
};

export default Profile;
