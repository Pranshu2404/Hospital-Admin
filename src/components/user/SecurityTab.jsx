import { useState } from 'react';
import { FormInput, Button } from '../common/FormElements';
import ToggleSwitch from './ToggleSwitch';

const SecurityTab = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    loginAlerts: true,
    sessionTimeout: true,
    deviceTracking: false
  });

  const [sessions] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'New York, NY',
      lastActive: '2024-01-15 10:30 AM',
      current: true
    },
    {
      id: 2,
      device: 'Mobile Safari on iPhone',
      location: 'New York, NY',
      lastActive: '2024-01-14 08:45 PM',
      current: false
    },
    {
      id: 3,
      device: 'Chrome on MacBook',
      location: 'New York, NY',
      lastActive: '2024-01-13 02:15 PM',
      current: false
    }
  ]);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    console.log('Changing password:', passwordData);
    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSecurityToggle = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTerminateSession = (sessionId) => {
    console.log('Terminating session:', sessionId);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>

      {/* Change Password */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Change Password</h4>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <FormInput
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            required
          />
          <FormInput
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            required
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />
          <Button variant="primary" type="submit">
            Update Password
          </Button>
        </form>
      </div>

      {/* Security Settings */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Security Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <ToggleSwitch
              checked={securitySettings.twoFactorAuth}
              onChange={(checked) => handleSecurityToggle('twoFactorAuth', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Email Notifications</h5>
              <p className="text-sm text-gray-600">Get notified about account activity via email</p>
            </div>
            <ToggleSwitch
              checked={securitySettings.emailNotifications}
              onChange={(checked) => handleSecurityToggle('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Login Alerts</h5>
              <p className="text-sm text-gray-600">Get alerts when someone logs into your account</p>
            </div>
            <ToggleSwitch
              checked={securitySettings.loginAlerts}
              onChange={(checked) => handleSecurityToggle('loginAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Auto Session Timeout</h5>
              <p className="text-sm text-gray-600">Automatically log out after period of inactivity</p>
            </div>
            <ToggleSwitch
              checked={securitySettings.sessionTimeout}
              onChange={(checked) => handleSecurityToggle('sessionTimeout', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Device Tracking</h5>
              <p className="text-sm text-gray-600">Track devices that access your account</p>
            </div>
            <ToggleSwitch
              checked={securitySettings.deviceTracking}
              onChange={(checked) => handleSecurityToggle('deviceTracking', checked)}
            />
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Active Sessions</h4>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-gray-900">{session.device}</h5>
                    {session.current && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{session.location}</p>
                  <p className="text-xs text-gray-500">Last active: {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                >
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-md font-semibold text-blue-900 mb-2">Security Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use a strong, unique password for your account</li>
          <li>• Enable two-factor authentication for added security</li>
          <li>• Regularly review your active sessions</li>
          <li>• Keep your contact information up to date</li>
          <li>• Log out from shared or public computers</li>
        </ul>
      </div>
    </div>
  );
};

export default SecurityTab;
