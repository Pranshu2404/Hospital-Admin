import { useState } from 'react';
import { FormInput, FormSelect, Button, FormCheckbox } from '../common/FormElements';

const SecurityTab = () => {
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: 90
    },
    sessionSettings: {
      sessionTimeout: 30,
      maxSessions: 3,
      logoutOnClose: false
    },
    accessControl: {
      enableTwoFactor: false,
      enableAuditLog: true,
      enableFailedLoginTracking: true,
      maxFailedAttempts: 5,
      lockoutDuration: 15
    }
  });

  const handlePasswordPolicyChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [field]: value
      }
    }));
  };

  const handleSessionSettingsChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      sessionSettings: {
        ...prev.sessionSettings,
        [field]: value
      }
    }));
  };

  const handleAccessControlChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      accessControl: {
        ...prev.accessControl,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Security settings updated:', securitySettings);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password Policy */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
          <div className="space-y-4">
            <FormInput
              label="Minimum Password Length"
              type="number"
              value={securitySettings.passwordPolicy.minLength}
              onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
              min="6"
              max="20"
            />
            <FormInput
              label="Password Expiry (days)"
              type="number"
              value={securitySettings.passwordPolicy.passwordExpiry}
              onChange={(e) => handlePasswordPolicyChange('passwordExpiry', parseInt(e.target.value))}
              min="30"
              max="365"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormCheckbox
                label="Require uppercase letters"
                checked={securitySettings.passwordPolicy.requireUppercase}
                onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
              />
              <FormCheckbox
                label="Require lowercase letters"
                checked={securitySettings.passwordPolicy.requireLowercase}
                onChange={(e) => handlePasswordPolicyChange('requireLowercase', e.target.checked)}
              />
              <FormCheckbox
                label="Require numbers"
                checked={securitySettings.passwordPolicy.requireNumbers}
                onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
              />
              <FormCheckbox
                label="Require special characters"
                checked={securitySettings.passwordPolicy.requireSpecialChars}
                onChange={(e) => handlePasswordPolicyChange('requireSpecialChars', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Session Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Session Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Session Timeout (minutes)"
              type="number"
              value={securitySettings.sessionSettings.sessionTimeout}
              onChange={(e) => handleSessionSettingsChange('sessionTimeout', parseInt(e.target.value))}
              min="5"
              max="480"
            />
            <FormInput
              label="Maximum Concurrent Sessions"
              type="number"
              value={securitySettings.sessionSettings.maxSessions}
              onChange={(e) => handleSessionSettingsChange('maxSessions', parseInt(e.target.value))}
              min="1"
              max="10"
            />
          </div>
          <div className="mt-4">
            <FormCheckbox
              label="Logout when browser is closed"
              checked={securitySettings.sessionSettings.logoutOnClose}
              onChange={(e) => handleSessionSettingsChange('logoutOnClose', e.target.checked)}
            />
          </div>
        </div>

        {/* Access Control */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Access Control</h3>
          <div className="space-y-4">
            <FormCheckbox
              label="Enable Two-Factor Authentication"
              checked={securitySettings.accessControl.enableTwoFactor}
              onChange={(e) => handleAccessControlChange('enableTwoFactor', e.target.checked)}
            />
            <FormCheckbox
              label="Enable Audit Logging"
              checked={securitySettings.accessControl.enableAuditLog}
              onChange={(e) => handleAccessControlChange('enableAuditLog', e.target.checked)}
            />
            <FormCheckbox
              label="Track Failed Login Attempts"
              checked={securitySettings.accessControl.enableFailedLoginTracking}
              onChange={(e) => handleAccessControlChange('enableFailedLoginTracking', e.target.checked)}
            />
            
            {securitySettings.accessControl.enableFailedLoginTracking && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <FormInput
                  label="Maximum Failed Attempts"
                  type="number"
                  value={securitySettings.accessControl.maxFailedAttempts}
                  onChange={(e) => handleAccessControlChange('maxFailedAttempts', parseInt(e.target.value))}
                  min="3"
                  max="10"
                />
                <FormInput
                  label="Lockout Duration (minutes)"
                  type="number"
                  value={securitySettings.accessControl.lockoutDuration}
                  onChange={(e) => handleAccessControlChange('lockoutDuration', parseInt(e.target.value))}
                  min="5"
                  max="60"
                />
              </div>
            )}
          </div>
        </div>

        {/* Security Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Status</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-600">Security Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-gray-600">Active Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-sm text-gray-600">Failed Attempts (24h)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button variant="primary" type="submit">
            Save Security Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecurityTab;
