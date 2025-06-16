import { useState } from 'react';
import { Button } from '../common/FormElements';
import ToggleSwitch from './ToggleSwitch';

const NotificationTab = () => {
  const [emailNotifications, setEmailNotifications] = useState({
    appointmentReminders: true,
    patientUpdates: true,
    systemAlerts: true,
    invoiceNotifications: false,
    staffUpdates: true,
    emergencyAlerts: true,
    maintenanceNotices: false,
    reportGeneration: true
  });

  const [pushNotifications, setPushNotifications] = useState({
    newAppointments: true,
    urgentAlerts: true,
    taskReminders: false,
    systemUpdates: true,
    chatMessages: true
  });

  const [notificationTiming, setNotificationTiming] = useState({
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weekendNotifications: false,
    frequency: 'immediate'
  });

  const handleEmailToggle = (setting, value) => {
    setEmailNotifications(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePushToggle = (setting, value) => {
    setPushNotifications(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTimingChange = (setting, value) => {
    setNotificationTiming(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving notification settings:', {
      emailNotifications,
      pushNotifications,
      notificationTiming
    });
  };

  const handleTestNotification = () => {
    console.log('Sending test notification');
    // Show test notification
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleTestNotification}>
            Test Notification
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Email Notifications</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Appointment Reminders</h5>
              <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
            </div>
            <ToggleSwitch
              checked={emailNotifications.appointmentReminders}
              onChange={(checked) => handleEmailToggle('appointmentReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Patient Updates</h5>
              <p className="text-sm text-gray-600">Notifications about patient record changes</p>
            </div>
            <ToggleSwitch
              checked={emailNotifications.patientUpdates}
              onChange={(checked) => handleEmailToggle('patientUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">System Alerts</h5>
              <p className="text-sm text-gray-600">Important system messages and alerts</p>
            </div>
            <ToggleSwitch
              checked={emailNotifications.systemAlerts}
              onChange={(checked) => handleEmailToggle('systemAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Invoice Notifications</h5>
              <p className="text-sm text-gray-600">Payment and billing related notifications</p>
            </div>
            <ToggleSwitch
              checked={emailNotifications.invoiceNotifications}
              onChange={(checked) => handleEmailToggle('invoiceNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Staff Updates</h5>
              <p className="text-sm text-gray-600">Updates about staff schedules and changes</p>
            </div>
            <ToggleSwitch
              checked={emailNotifications.staffUpdates}
              onChange={(checked) => handleEmailToggle('staffUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Emergency Alerts</h5>
              <p className="text-sm text-gray-600">Critical emergency notifications</p>
            </div>
            <ToggleSwitch
              checked={emailNotifications.emergencyAlerts}
              onChange={(checked) => handleEmailToggle('emergencyAlerts', checked)}
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Push Notifications</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">New Appointments</h5>
              <p className="text-sm text-gray-600">Real-time notifications for new appointments</p>
            </div>
            <ToggleSwitch
              checked={pushNotifications.newAppointments}
              onChange={(checked) => handlePushToggle('newAppointments', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Urgent Alerts</h5>
              <p className="text-sm text-gray-600">Immediate notifications for urgent matters</p>
            </div>
            <ToggleSwitch
              checked={pushNotifications.urgentAlerts}
              onChange={(checked) => handlePushToggle('urgentAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Task Reminders</h5>
              <p className="text-sm text-gray-600">Reminders for pending tasks</p>
            </div>
            <ToggleSwitch
              checked={pushNotifications.taskReminders}
              onChange={(checked) => handlePushToggle('taskReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">System Updates</h5>
              <p className="text-sm text-gray-600">Notifications about system maintenance</p>
            </div>
            <ToggleSwitch
              checked={pushNotifications.systemUpdates}
              onChange={(checked) => handlePushToggle('systemUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Chat Messages</h5>
              <p className="text-sm text-gray-600">New messages in team chat</p>
            </div>
            <ToggleSwitch
              checked={pushNotifications.chatMessages}
              onChange={(checked) => handlePushToggle('chatMessages', checked)}
            />
          </div>
        </div>
      </div>

      {/* Notification Timing */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Notification Timing</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Quiet Hours</h5>
              <p className="text-sm text-gray-600">Pause non-urgent notifications during specified hours</p>
            </div>
            <ToggleSwitch
              checked={notificationTiming.quietHoursEnabled}
              onChange={(checked) => handleTimingChange('quietHoursEnabled', checked)}
            />
          </div>

          {notificationTiming.quietHoursEnabled && (
            <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={notificationTiming.quietHoursStart}
                  onChange={(e) => handleTimingChange('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={notificationTiming.quietHoursEnd}
                  onChange={(e) => handleTimingChange('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Weekend Notifications</h5>
              <p className="text-sm text-gray-600">Receive notifications on weekends</p>
            </div>
            <ToggleSwitch
              checked={notificationTiming.weekendNotifications}
              onChange={(checked) => handleTimingChange('weekendNotifications', checked)}
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
            <select
              value={notificationTiming.frequency}
              onChange={(e) => handleTimingChange('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly Digest</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-md font-semibold text-blue-900 mb-2">Recent Notifications</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>New appointment scheduled with John Doe</span>
            <span>2 hours ago</span>
          </div>
          <div className="flex justify-between">
            <span>System maintenance scheduled for tonight</span>
            <span>5 hours ago</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice #INV-2024-001 payment received</span>
            <span>1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTab;
