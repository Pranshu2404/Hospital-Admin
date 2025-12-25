import { useState } from 'react';
import { SidebarItem } from './common/SidebarItem';
import { 
  HomeIcon, 
  AppointmentIcon, 
  PatientIcon, 
  DoctorsIcon, 
  FinanceIcon, 
  MonitorIcon, 
  PagesIcon, 
  UserProfileIcon, 
  SettingsIcon 
} from './common/Icons';

const Sidebar = ({ setCurrentPage, currentPage, setSelectedPatient, setSelectedInvoice }) => {
  const [openMenu, setOpenMenu] = useState('Monitor Hospital');

  const handleMenuClick = (name) => {
    setOpenMenu(openMenu === name ? null : name);
    if (['Dashboard', 'AppointmentList', 'UserProfilePage', 'SettingsPage'].includes(name)) {
      setSelectedPatient(null);
      setSelectedInvoice(null);
      setCurrentPage(name);
    }
  };

  const handleSubMenuClick = (page) => {
    if (page !== 'PatientProfile') setSelectedPatient(null);
    if (page !== 'InvoiceDetailsPage') setSelectedInvoice(null);
    setCurrentPage(page);
  };
  
  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center p-6 border-b border-gray-100">
        <div className="p-2 bg-teal-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4a2 2 0 110-4m6 4a2 2 0 100 4m0-4a2 2 0 110-4m0 4V4a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414A1 1 0 0018 16.586V4a2 2 0 00-2-2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold ml-3 text-gray-800">Mediqliq</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <SidebarItem 
          icon={<HomeIcon />} 
          text="Dashboard" 
          onClick={() => handleMenuClick('Dashboard')} 
          active={currentPage === 'Dashboard'} 
        />
        
        <SidebarItem 
          icon={<AppointmentIcon />} 
          text="Appointments" 
          onClick={() => handleMenuClick('AppointmentList')} 
          active={currentPage === 'AppointmentList'} 
        />
        
        <SidebarItem 
          icon={<PatientIcon />} 
          text="Patients" 
          onClick={() => handleMenuClick('Patient')} 
          hasSubmenu 
          isOpen={openMenu === 'Patient'} 
          active={['AddPatient', 'IpdOpdPatientList', 'PatientProfile'].includes(currentPage)}
        />
        
        {openMenu === 'Patient' && (
          <div className="ml-8 border-l border-gray-200 pl-4 py-2 space-y-1">
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('AddPatient')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Add Patient
            </a>
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('IpdOpdPatientList')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Patient List
            </a>
          </div>
        )}

        <SidebarItem 
          icon={<DoctorsIcon />} 
          text="Staff" 
          onClick={() => handleMenuClick('Staff')} 
          hasSubmenu 
          isOpen={openMenu === 'Staff'} 
          active={['AddDoctorNurse', 'DoctorNurseList'].includes(currentPage)}
        />
        
        {openMenu === 'Staff' && (
          <div className="ml-8 border-l border-gray-200 pl-4 py-2 space-y-1">
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('AddDoctorNurse')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Add Staff
            </a>
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('DoctorNurseList')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Staff List
            </a>
          </div>
        )}

        <SidebarItem 
          icon={<FinanceIcon />} 
          text="Finance" 
          onClick={() => handleMenuClick('Finance')} 
          hasSubmenu 
          isOpen={openMenu === 'Finance'} 
          active={['IncomePage', 'ExpensePage', 'InvoiceListPage', 'InvoiceDetailsPage'].includes(currentPage)}
        />
        
        {openMenu === 'Finance' && (
          <div className="ml-8 border-l border-gray-200 pl-4 py-2 space-y-1">
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('IncomePage')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Income
            </a>
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('ExpensePage')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Expense
            </a>
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('InvoiceListPage')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Invoices
            </a>
          </div>
        )}

        <SidebarItem 
          icon={<MonitorIcon />} 
          text="Reports" 
          onClick={() => handleMenuClick('Monitor Hospital')} 
          hasSubmenu 
          isOpen={openMenu === 'Monitor Hospital'} 
          active={['InventoryItemsPage', 'BirthReportPage', 'BloodBankPage'].includes(currentPage)}
        />
        
        {openMenu === 'Monitor Hospital' && (
          <div className="ml-8 border-l border-gray-200 pl-4 py-2 space-y-1">
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('InventoryItemsPage')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Inventory
            </a>
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('BirthReportPage')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Birth Report
            </a>
            <a 
              href="#" 
              onClick={() => handleSubMenuClick('BloodBankPage')}
              className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Blood Bank
            </a>
          </div>
        )}

        <SidebarItem 
          icon={<UserProfileIcon />} 
          text="Profile" 
          onClick={() => handleMenuClick('UserProfilePage')} 
          active={currentPage === 'UserProfilePage'} 
        />
        
        <SidebarItem 
          icon={<SettingsIcon />} 
          text="Settings" 
          onClick={() => handleMenuClick('SettingsPage')} 
          active={currentPage === 'SettingsPage'} 
        />
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">DR</span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700">Dr. Sarah Wilson</p>
            <p className="text-xs text-gray-500">Chief Medical Officer</p>
          </div>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
