// pages/dashboard/admin/profile.jsx
import Layout from '../../../components/Layout';
import UserProfilePage from '../../../components/user/UserProfilePage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Profile = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <UserProfilePage />
    </Layout>
  );
};

export default Profile;
