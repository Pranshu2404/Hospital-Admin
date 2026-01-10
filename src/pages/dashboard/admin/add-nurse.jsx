import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddNurseForm from '../../../components/staff/AddNurseForm';

const AddNursePage = () => {
    return (
        <Layout sidebarItems={adminSidebar}>
            <AddNurseForm />
        </Layout>
    );
};

export default AddNursePage;
