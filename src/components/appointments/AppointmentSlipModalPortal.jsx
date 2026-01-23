import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import AppointmentSlipModal from './AppointmentSlipModal';

const AppointmentSlipModalPortal = ({ isOpen, onClose, appointmentData, hospitalInfo }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return ReactDOM.createPortal(
    <AppointmentSlipModal
      isOpen={isOpen}
      onClose={onClose}
      appointmentData={appointmentData}
      hospitalInfo={hospitalInfo}
    />,
    document.body
  );
};

export default AppointmentSlipModalPortal;