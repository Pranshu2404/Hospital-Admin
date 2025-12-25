import { useState } from 'react';
import GeneralSettingsTab from './GeneralSettingsTab';
import SecurityTab from './SecurityTab';
import EmailSettingsTab from './EmailSettingsTab';
import UsersSettingsTab from './UsersSettingsTab';
import SettingsSidebarItem from './SettingsSidebarItem';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  const settingsTabs = [
    {
      id: 'general',
      label: 'General',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: GeneralSettingsTab
    },
    {
      id: 'security',
      label: 'Security',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      component: SecurityTab
    },
    {
      id: 'email',
      label: 'Email Settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      component: EmailSettingsTab
    },
    // {
    //   id: 'users',
    //   label: 'User Management',
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1z" />
    //     </svg>
    //   ),
    //   component: UsersSettingsTab
    // }
  ];

  const ActiveComponent = settingsTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="p-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your hospital system settings and preferences</p>
        </div>

        <div className="flex">
          {/* Settings Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <SettingsSidebarItem
                  key={tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
