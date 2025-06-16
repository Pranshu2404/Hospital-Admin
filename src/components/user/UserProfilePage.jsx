import { useState } from 'react';
import PersonalProfileTab from './PersonalProfileTab';
import SecurityTab from './SecurityTab';
import NotificationTab from './NotificationTab';
import { PersonIcon, SettingsIcon, BellIcon } from '../common/Icons';

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { 
      id: 'personal', 
      label: 'Personal Info', 
      icon: <PersonIcon />,
      component: PersonalProfileTab 
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: <SettingsIcon />,
      component: SecurityTab 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: <BellIcon />,
      component: NotificationTab 
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-bold text-2xl">DR</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dr. Sarah Wilson</h1>
              <p className="text-gray-600">Chief Medical Officer</p>
              <p className="text-sm text-gray-500">sarah.wilson@hospital.com</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
