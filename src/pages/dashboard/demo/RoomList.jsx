import Layout from '@/components/Layout';
import RoomList from '@/components/Rooms/RoomList';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';

const RoomListPage = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <RoomList />
    </Layout>
  );
};

export default RoomListPage;
