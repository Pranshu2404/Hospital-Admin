import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import NurseList from '../../../components/staff/NurseList';

const NurseListPage = () => {
    return (
        <Layout sidebarItems={adminSidebar}>
            <NurseList />
        </Layout>
    );
};

export default NurseListPage;
