import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddNurseForm from '../../../components/staff/AddNurseForm';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const AddNursePage = () => {
    return (
        <Layout sidebarItems={demoSidebar} section="Demo User">
            <AddNurseForm />
        </Layout>
    );
};

export default AddNursePage;
