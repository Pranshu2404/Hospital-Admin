import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import guide data from your utils
import { getGuideData } from '../utils/guideData';

const SetupTrackerContext = createContext();

export const useSetupTracker = () => {
  const context = useContext(SetupTrackerContext);
  if (!context) {
    throw new Error('useSetupTracker must be used within SetupTrackerProvider');
  }
  return context;
};

export const SetupTrackerProvider = ({ children, userRole }) => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [trackerVisible, setTrackerVisible] = useState(false);
  const [mutedSteps, setMutedSteps] = useState([]);
  const [showTracker, setShowTracker] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if step is completed
  const isStepCompleted = (stepPath) => {
    return completedSteps.includes(stepPath);
  };

  // Mark step as completed
  const markStepCompleted = (stepPath) => {
    if (!completedSteps.includes(stepPath)) {
      const newCompletedSteps = [...completedSteps, stepPath];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(`setup_completed_${userRole}`, 
        JSON.stringify(newCompletedSteps)
      );
      
      // Update current step after marking one as completed
      const nextStep = getNextStep();
      setCurrentStep(nextStep);
    }
  };

 // Get next incomplete step - UPDATED VERSION
const getNextStep = () => {
  const guideData = getGuideData(userRole);
  
  // Find the FIRST incomplete step in the original order
  for (let i = 0; i < guideData.length; i++) {
    const step = guideData[i];
    const isCompleted = completedSteps.includes(step.path);
    const isMuted = mutedSteps.includes(step.path);
    
    // If step is incomplete AND not muted
    if (!isCompleted && !isMuted) {
      // Check if this is the current location
      const isCurrentLocation = location.pathname === step.path;
      
      return {
        ...step,
        isCurrentLocation,
        type: isCurrentLocation ? 'current' : 'suggestion',
        orderIndex: i // Optional: keep track of original order
      };
    }
  }
  
  return null;
};

  // Mute a step (don't show again)
  const muteStep = (stepPath) => {
    const newMutedSteps = [...mutedSteps, stepPath];
    setMutedSteps(newMutedSteps);
    localStorage.setItem(`muted_steps_${userRole}`, 
      JSON.stringify(newMutedSteps)
    );
    
    // Update current step after muting one
    const nextStep = getNextStep();
    setCurrentStep(nextStep);
  };

  // Navigate to step
  const goToStep = (stepPath) => {
    navigate(stepPath);
  };

  // Get progress percentage
  const getProgress = () => {
    const guideData = getGuideData(userRole);
    const totalSteps = guideData.length;
    const completed = completedSteps.length;
    return totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;
  };

  // Reset all progress
  const resetProgress = () => {
    setCompletedSteps([]);
    setMutedSteps([]);
    localStorage.removeItem(`setup_completed_${userRole}`);
    localStorage.removeItem(`muted_steps_${userRole}`);
    const nextStep = getNextStep();
    setCurrentStep(nextStep);
  };

  // Load saved state
  useEffect(() => {
    const savedCompleted = localStorage.getItem(`setup_completed_${userRole}`);
    const savedMuted = localStorage.getItem(`muted_steps_${userRole}`);
    
    if (savedCompleted) {
      try {
        setCompletedSteps(JSON.parse(savedCompleted));
      } catch (error) {
        console.error('Error parsing completed steps:', error);
        setCompletedSteps([]);
      }
    }
    
    if (savedMuted) {
      try {
        setMutedSteps(JSON.parse(savedMuted));
      } catch (error) {
        console.error('Error parsing muted steps:', error);
        setMutedSteps([]);
      }
    }
  }, [userRole]);

  // Update current step on location change
  useEffect(() => {
    const nextStep = getNextStep();
    setCurrentStep(nextStep);
    
    // If user visits a step page, show tracker for that step
    if (nextStep?.isCurrentLocation) {
      setTrackerVisible(true);
    } else {
      // Otherwise hide tracker on page change
      setTrackerVisible(false);
    }
  }, [location.pathname, completedSteps, mutedSteps]);

  // Show tracker after 10 seconds of inactivity
  useEffect(() => {
    let inactivityTimer;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (currentStep && !currentStep.isCurrentLocation && showTracker) {
        inactivityTimer = setTimeout(() => {
          setTrackerVisible(true);
        }, 10000); // Show after 10 seconds of inactivity
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [currentStep, showTracker]);

  const value = {
    currentStep,
    completedSteps,
    showTracker,
    trackerVisible,
    setTrackerVisible,
    markStepCompleted,
    muteStep,
    goToStep,
    isStepCompleted,
    getProgress,
    resetProgress,
    setShowTracker,
    userRole
  };

  return (
    <SetupTrackerContext.Provider value={value}>
      {children}
    </SetupTrackerContext.Provider>
  );
};