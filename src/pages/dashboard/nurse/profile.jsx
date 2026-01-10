import React from 'react';
import Layout from '../../../components/Layout';
import { nurseSidebar } from '../../../constants/sidebarItems/nurseSidebar';
import StaffProfile from '../../../components/staff/StaffProfile';

const NurseProfile = () => {
    return (
        <Layout sidebarItems={nurseSidebar} role="nurse">
            <StaffProfile />
        </Layout>
    );
};

export default NurseProfile;
