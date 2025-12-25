import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSetupTracker } from '../context/SetupTrackerContext';
import { useAuth } from '../context/AuthContext';
import { getGuideData, shouldAutoCompleteStep } from '../utils/guideData';

export const useSetupMonitor = () => {
  const location = useLocation();
  const { markStepCompleted, isStepCompleted } = useSetupTracker();
  const { user } = useAuth();

  // Monitor page visits and mark as completed
  useEffect(() => {
    const currentPath = location.pathname;
    const userRole = user?.role;
    
    if (!userRole) return;
    
    // Check if current path is in guide data and not completed
    const guideData = getGuideData(userRole);
    const step = guideData.find(item => item.path === currentPath);
    
    if (step && !isStepCompleted(currentPath)) {
      // Mark as completed after user spends some time on page
      const timer = setTimeout(() => {
        markStepCompleted(currentPath);
        
        // Show completion toast (you can integrate with your toast system)
        console.log(`Step completed: ${step.title}`);
      }, 3000); // 3 seconds on page
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, user]);

  // Monitor form submissions
  const trackFormSubmission = (formType, formData = {}) => {
    // Mark specific steps as completed based on form submission
    const completionMap = {
      'add-doctor': '/dashboard/admin/add-doctor',
      'add-patient': '/dashboard/admin/add-patient',
      'add-department': '/dashboard/admin/add-department',
      'add-staff': '/dashboard/admin/add-staff',
      'add-medicine': '/dashboard/pharmacy/add-medicine',
      'add-customer': '/dashboard/pharmacy/add-customer',
      'create-prescription': '/dashboard/doctor/prescriptions',
      'schedule-setup': '/dashboard/doctor/schedule',
      'profile-update': (role) => {
        switch(role) {
          case 'doctor': return '/dashboard/doctor/profile';
          case 'staff': return '/dashboard/staff/profile';
          case 'pharmacy': return '/dashboard/pharmacy/profile';
          default: return null;
        }
      }
    };
    
    const stepPath = typeof completionMap[formType] === 'function' 
      ? completionMap[formType](user?.role)
      : completionMap[formType];
    
    if (stepPath) {
      markStepCompleted(stepPath);
      
      // Check for achievements
      checkForAchievements(formType, formData);
    }
  };

  // Check for achievements
  const checkForAchievements = (formType, data) => {
    const achievementMap = {
      'add-doctor': 'first_doctor',
      'add-patient': 'first_patient',
      'add-department': 'first_dept',
      'add-staff': 'first_staff',
      'add-medicine': 'first_medicine',
      'add-customer': 'first_sale',
      'create-prescription': 'first_prescription',
      'schedule-setup': 'schedule_set',
      'profile-update': 'profile_complete',
    };
    
    const achievementId = achievementMap[formType];
    if (achievementId) {
      console.log(`Achievement unlocked: ${achievementId}`);
      // You can trigger a notification here
    }
  };

  // Auto-complete steps based on data
  const autoCompleteSteps = (role, data) => {
    const guideData = getGuideData(role);
    
    guideData.forEach(step => {
      if (shouldAutoCompleteStep(role, step.path, data) && !isStepCompleted(step.path)) {
        markStepCompleted(step.path);
      }
    });
  };

  return { 
    trackFormSubmission, 
    autoCompleteSteps,
    checkForAchievements 
  };
};