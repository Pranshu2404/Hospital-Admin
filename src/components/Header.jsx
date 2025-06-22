import { SearchIcon, BellIcon, ChevronDownIcon } from './common/Icons';

const Header = ({ currentPage, section = 'Hospital Management', sidebarItems = [] }) => {
  const getPageTitle = () => {
    // Try to find the current page in sidebarItems
    let found = null;
    for (const item of sidebarItems) {
      if ((item.path && window.location.pathname === item.path) || (item.page && currentPage === item.page)) {
        found = item.label || item.text;
        break;
      }
    }
    if (found) return found;
    // fallback to default
    switch (currentPage) {
      case 'Dashboard': return 'Dashboard';
      case 'AppointmentList': return 'Appointments';
      case 'AddPatient': return 'Add Patient';
      case 'IpdOpdPatientList': return 'Patient List';
      case 'PatientProfile': return 'Patient Profile';
      case 'AddDoctorNurse': return 'Add Staff';
      case 'DoctorNurseList': return 'Staff List';
      case 'IncomePage': return 'Income';
      case 'ExpensePage': return 'Expense';
      case 'InvoiceListPage': return 'Invoices';
      case 'InvoiceDetailsPage': return 'Invoice Details';
      case 'InventoryItemsPage': return 'Inventory';
      case 'BirthReportPage': return 'Birth Report';
      case 'BloodBankPage': return 'Blood Bank';
      case 'UserProfilePage': return 'Profile';
      case 'SettingsPage': return 'Settings';
      default: return section;
    }
  };

  const getBreadcrumb = () => {
    const title = getPageTitle();
    return (
      <nav className="flex space-x-1">
        <span className="text-sm text-gray-500">{section}</span>
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm text-teal-600 font-medium">{title}</span>
      </nav>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h2>
          {getBreadcrumb()}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Search in ${section.toLowerCase()}...`} 
              className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
            <div className="absolute left-3 top-2.5">
              <SearchIcon />
            </div>
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg transition-colors">
            <BellIcon />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* User Avatar */}
          <div className="relative">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">DR</span>
              </div>
              <ChevronDownIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
