import Layout from '@/components/Layout';
import RoomList from '@/components/Rooms/RoomList';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const RoomListPage = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <RoomList />
    </Layout>
  );
};

export default RoomListPage;
