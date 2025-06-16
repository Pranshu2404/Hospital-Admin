import { useState } from 'react';
import { FormInput, FormSelect, FormTextarea, Button, FormCheckbox } from '../common/FormElements';

const GeneralSettingsTab = () => {
  const [settings, setSettings] = useState({
    hospitalName: 'General Hospital',
    hospitalCode: 'GH001',
    address: '123 Medical Center Drive',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phone: '+1 234-567-8900',
    email: 'info@generalhospital.com',
    website: 'www.generalhospital.com',
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    language: 'en',
    enableNotifications: true,
    enableEmailAlerts: true,
    maintenanceMode: false
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Settings updated:', settings);
    // Handle settings update
  };

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  const timeFormatOptions = [
    { value: '12', label: '12 Hour (AM/PM)' },
    { value: '24', label: '24 Hour' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hospital Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Hospital Name"
              value={settings.hospitalName}
              onChange={(e) => handleInputChange('hospitalName', e.target.value)}
              required
            />
            <FormInput
              label="Hospital Code"
              value={settings.hospitalCode}
              onChange={(e) => handleInputChange('hospitalCode', e.target.value)}
              required
            />
            <FormInput
              label="Phone"
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            <FormInput
              label="Website"
              value={settings.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormTextarea
              label="Address"
              value={settings.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={2}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="City"
                value={settings.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
              <FormInput
                label="State"
                value={settings.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
              <FormInput
                label="ZIP Code"
                value={settings.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Timezone"
              value={settings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              options={timezoneOptions}
              required
            />
            <FormSelect
              label="Currency"
              value={settings.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              options={currencyOptions}
              required
            />
            <FormSelect
              label="Date Format"
              value={settings.dateFormat}
              onChange={(e) => handleInputChange('dateFormat', e.target.value)}
              options={dateFormatOptions}
              required
            />
            <FormSelect
              label="Time Format"
              value={settings.timeFormat}
              onChange={(e) => handleInputChange('timeFormat', e.target.value)}
              options={timeFormatOptions}
              required
            />
            <FormSelect
              label="Language"
              value={settings.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              options={languageOptions}
              required
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <FormCheckbox
              label="Enable system notifications"
              checked={settings.enableNotifications}
              onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
            />
            <FormCheckbox
              label="Enable email alerts"
              checked={settings.enableEmailAlerts}
              onChange={(e) => handleInputChange('enableEmailAlerts', e.target.checked)}
            />
            <FormCheckbox
              label="Maintenance mode"
              checked={settings.maintenanceMode}
              onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button variant="primary" type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettingsTab;
