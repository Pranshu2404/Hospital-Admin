import { useState } from 'react';
import { FormInput, FormSelect, FormTextarea, Button, FormCheckbox } from '../common/FormElements';

const EmailSettingsTab = () => {
  const [emailSettings, setEmailSettings] = useState({
    smtpConfig: {
      host: 'smtp.gmail.com',
      port: 587,
      username: 'hospital@example.com',
      password: '',
      encryption: 'tls',
      fromName: 'General Hospital',
      fromEmail: 'noreply@generalhospital.com'
    },
    notifications: {
      appointmentReminders: true,
      invoiceNotifications: true,
      systemAlerts: true,
      patientUpdates: false,
      staffNotifications: true
    },
    templates: {
      appointmentConfirmation: true,
      appointmentReminder: true,
      invoiceGenerated: true,
      paymentReceived: true,
      welcomeEmail: true
    }
  });

  const handleSmtpConfigChange = (field, value) => {
    setEmailSettings(prev => ({
      ...prev,
      smtpConfig: {
        ...prev.smtpConfig,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setEmailSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleTemplateChange = (field, value) => {
    setEmailSettings(prev => ({
      ...prev,
      templates: {
        ...prev.templates,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email settings updated:', emailSettings);
  };

  const handleTestEmail = () => {
    console.log('Sending test email...');
    // Handle test email sending
  };

  const encryptionOptions = [
    { value: 'none', label: 'None' },
    { value: 'ssl', label: 'SSL' },
    { value: 'tls', label: 'TLS' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SMTP Configuration */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="SMTP Host"
              value={emailSettings.smtpConfig.host}
              onChange={(e) => handleSmtpConfigChange('host', e.target.value)}
              placeholder="smtp.gmail.com"
              required
            />
            <FormInput
              label="SMTP Port"
              type="number"
              value={emailSettings.smtpConfig.port}
              onChange={(e) => handleSmtpConfigChange('port', parseInt(e.target.value))}
              required
            />
            <FormInput
              label="Username"
              value={emailSettings.smtpConfig.username}
              onChange={(e) => handleSmtpConfigChange('username', e.target.value)}
              required
            />
            <FormInput
              label="Password"
              type="password"
              value={emailSettings.smtpConfig.password}
              onChange={(e) => handleSmtpConfigChange('password', e.target.value)}
              placeholder="Leave blank to keep current password"
            />
            <FormSelect
              label="Encryption"
              value={emailSettings.smtpConfig.encryption}
              onChange={(e) => handleSmtpConfigChange('encryption', e.target.value)}
              options={encryptionOptions}
              required
            />
            <div className="flex items-end">
              <Button variant="outline" type="button" onClick={handleTestEmail}>
                Test Connection
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormInput
              label="From Name"
              value={emailSettings.smtpConfig.fromName}
              onChange={(e) => handleSmtpConfigChange('fromName', e.target.value)}
              required
            />
            <FormInput
              label="From Email"
              type="email"
              value={emailSettings.smtpConfig.fromEmail}
              onChange={(e) => handleSmtpConfigChange('fromEmail', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormCheckbox
              label="Appointment Reminders"
              checked={emailSettings.notifications.appointmentReminders}
              onChange={(e) => handleNotificationChange('appointmentReminders', e.target.checked)}
            />
            <FormCheckbox
              label="Invoice Notifications"
              checked={emailSettings.notifications.invoiceNotifications}
              onChange={(e) => handleNotificationChange('invoiceNotifications', e.target.checked)}
            />
            <FormCheckbox
              label="System Alerts"
              checked={emailSettings.notifications.systemAlerts}
              onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
            />
            <FormCheckbox
              label="Patient Updates"
              checked={emailSettings.notifications.patientUpdates}
              onChange={(e) => handleNotificationChange('patientUpdates', e.target.checked)}
            />
            <FormCheckbox
              label="Staff Notifications"
              checked={emailSettings.notifications.staffNotifications}
              onChange={(e) => handleNotificationChange('staffNotifications', e.target.checked)}
            />
          </div>
        </div>

        {/* Email Templates */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Templates</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormCheckbox
                label="Appointment Confirmation"
                checked={emailSettings.templates.appointmentConfirmation}
                onChange={(e) => handleTemplateChange('appointmentConfirmation', e.target.checked)}
              />
              <FormCheckbox
                label="Appointment Reminder"
                checked={emailSettings.templates.appointmentReminder}
                onChange={(e) => handleTemplateChange('appointmentReminder', e.target.checked)}
              />
              <FormCheckbox
                label="Invoice Generated"
                checked={emailSettings.templates.invoiceGenerated}
                onChange={(e) => handleTemplateChange('invoiceGenerated', e.target.checked)}
              />
              <FormCheckbox
                label="Payment Received"
                checked={emailSettings.templates.paymentReceived}
                onChange={(e) => handleTemplateChange('paymentReceived', e.target.checked)}
              />
              <FormCheckbox
                label="Welcome Email"
                checked={emailSettings.templates.welcomeEmail}
                onChange={(e) => handleTemplateChange('welcomeEmail', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Email Statistics */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Statistics</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">1,234</div>
                <div className="text-sm text-gray-600">Emails Sent (This Month)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Delivery Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">68%</div>
                <div className="text-sm text-gray-600">Open Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">12</div>
                <div className="text-sm text-gray-600">Failed Deliveries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button variant="primary" type="submit">
            Save Email Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmailSettingsTab;
