import Layout from '@/components/Layout';
import AddRoom from '@/components/Rooms/AddRoomForm';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';

const AddRoomPage = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <AddRoom />
    </Layout>
  );
};

export default AddRoomPage;
