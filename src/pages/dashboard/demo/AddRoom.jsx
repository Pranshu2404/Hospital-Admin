import Layout from '@/components/Layout';
import AddRoom from '@/components/Rooms/AddRoomForm';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const AddRoomPage = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <AddRoom />
    </Layout>
  );
};

export default AddRoomPage;
