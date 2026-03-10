import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import AppointmentList from '../../../components/appointments/AppointmentList';
import AddAppointmentModal from '../../../components/appointments/AddAppointmentModal';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { Button } from '../../../components/common/FormElements';

const AppointmentsPage = () => {
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // const location = useLocation();
  // const params = new URLSearchParams(location.search);
  // const type = params.get('type'); // Get the type from URL params
  // const navigate = useNavigate();

  // // Automatically open modal if type is present in URL
  // useEffect(() => {
  //   if (type && ['opd', 'ipd'].includes(type.toLowerCase())) {
  //     setIsAddModalOpen(true);
  //   } else {
  //     setIsAddModalOpen(false);
  //   }
  // }, [type]);

  // const handleCloseModal = () => {
  //   setIsAddModalOpen(false);
  //   // Remove the type parameter when closing modal
  //   navigate('/dashboard/admin/appointments');
  // };

  return (
    <Layout sidebarItems={adminSidebar}>
      {/* <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <div className="space-x-2">
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard/admin/appointments/opd')}
          >
            + Add OPD Appointment
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard/admin/appointments/ipd')}
          >
            + Add IPD Appointment
          </Button>
        </div>
      </div> */}
      
      <AppointmentList />
      
      {/* {type && (
        <AddAppointmentModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          type={type.toLowerCase()}
        />
      )} */}
    </Layout>
  );
};

export default AppointmentsPage;
          