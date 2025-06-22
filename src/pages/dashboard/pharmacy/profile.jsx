// pages/dashboard/admin/profile.jsx
import Layout from '../../../components/Layout';
import UserProfilePage from '../../../components/user/UserProfilePage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const Profile = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <UserProfilePage />
    </Layout>
  );
};

export default Profile;
