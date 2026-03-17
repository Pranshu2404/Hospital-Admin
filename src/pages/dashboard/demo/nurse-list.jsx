import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import NurseList from '../../../components/staff/NurseList';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const NurseListPage = () => {
    return (
        <Layout sidebarItems={demoSidebar} section="Demo User">
            <NurseList />
        </Layout>
    );
};

export default NurseListPage;
