import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Bell, 
  Info, 
  ExternalLink,
  Clock,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useSetupTracker } from '../context/SetupTrackerContext';

const SetupTracker = () => {
  const {
    currentStep,
    trackerVisible,
    setTrackerVisible,
    markStepCompleted,
    muteStep,
    goToStep,
    getProgress,
    setShowTracker
  } = useSetupTracker();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [dismissedUntil, setDismissedUntil] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const progress = getProgress();

  // Check if tracker should be visible
  const shouldShowTracker = () => {
    if (!currentStep || !trackerVisible) return false;
    if (dismissedUntil && new Date() < dismissedUntil) return false;
    if (currentStep.isCurrentLocation) return true; // Always show on step page
    return true;
  };

  const handleDismiss = (duration = null) => {
    if (duration) {
      const dismissTime = new Date();
      dismissTime.setMinutes(dismissTime.getMinutes() + duration);
      setDismissedUntil(dismissTime);
    }
    setTrackerVisible(false);
  };

  const handleComplete = () => {
    if (currentStep) {
      markStepCompleted(currentStep.path);
      setTrackerVisible(false);
      
      // Show success message
      showToast('Step marked as completed!', 'success');
    }
  };

  const handleMute = () => {
    if (currentStep) {
      muteStep(currentStep.path);
      setTrackerVisible(false);
      showToast('Step muted. You won\'t see this suggestion again.', 'info');
    }
  };

  const handleDisableTracker = () => {
    setShowTracker(false);
    setTrackerVisible(false);
    showToast('Setup tracker disabled. Enable it in settings.', 'info');
  };

  // Toast notification function
  const showToast = (message, type = 'info') => {
    // You can use your own toast system here
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // If tracker is completely disabled
  if (!shouldShowTracker() && !isMinimized) {
    return (
      <button
        onClick={() => {
          setIsMinimized(false);
          setTrackerVisible(true);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        title="Setup Assistant"
      >
        <div className="relative">
          <Bell className="w-6 h-6" />
          {progress < 100 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center animate-pulse">
              !
            </div>
          )}
        </div>
        {isHovering && (
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            <div className="font-medium">Setup Assistant</div>
            <div className="text-xs opacity-90">{progress}% complete</div>
          </div>
        )}
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => {
          setIsMinimized(false);
          setTrackerVisible(true);
        }}
        className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        title="Setup Assistant"
      >
        <Bell className="w-6 h-6" />
      </button>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r from-teal-500 to-teal-700`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentStep?.iconColor ? 'bg-white/80' : 'bg-white'}`}>
                {currentStep?.icon && React.createElement(currentStep.icon, {
                  className: `w-5 h-5 ${currentStep.iconColor || 'text-white'}`
                })}
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Setup Assistant
                  {/* {currentStep?.priority === 'High' && (
                    <span className="text-xs bg-red-500/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      HIGH PRIORITY
                    </span>
                  )} */}
                </h3>
                <p className="text-sm text-white/90">
                  {currentStep?.type === 'current' ? 'You\'re on this step' : 'Next step suggestion'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                title="Minimize"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/90 mb-1">
              <span>Setup Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 text-lg">{currentStep?.title}</h4>
              {currentStep?.type === 'suggestion' && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Suggested next step to improve your setup</span>
                </div>
              )}
              {currentStep?.isCurrentLocation && (
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  <span>You're currently on this step</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              {showDetails ? 'Show Less' : 'Show Details'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showDetails && currentStep?.content && (
            <div className="mb-4 space-y-2">
              {currentStep.content.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5 mr-2 text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          )}

          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-start">
              <Info className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                {currentStep?.isCurrentLocation 
                  ? 'Complete the actions on this page to finish this setup step.'
                  : 'This will help you set up your dashboard efficiently.'
                }
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => goToStep(currentStep?.path)}
              className="flex-1 min-w-[140px] bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 hover:shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              {currentStep?.isCurrentLocation ? 'Continue Here' : `Go to ${currentStep?.title}`}
            </button>
            
              <button
                onClick={handleComplete}
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 hover:shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Done
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupTracker;