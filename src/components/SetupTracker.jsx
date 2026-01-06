import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  Clock,
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useSetupTracker } from '../context/SetupTrackerContext';
import { FaRobot } from 'react-icons/fa';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sheetHeight, setSheetHeight] = useState('h-4/5'); // Default to 80% height

  const progress = getProgress();

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Adjust sheet height based on content
      if (mobile && currentStep?.content && currentStep.content.length > 3) {
        setSheetHeight('h-[90vh]'); // More height for more content
      } else if (mobile) {
        setSheetHeight('h-4/5'); // Default 80% height
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [currentStep]);

  // Handle backdrop click to close expanded view
  useEffect(() => {
    const handleBackdropClick = (e) => {
      if (isExpanded && isMobile && e.target.classList.contains('setup-tracker-backdrop')) {
        setIsExpanded(false);
      }
    };

    if (isExpanded && isMobile) {
      document.addEventListener('click', handleBackdropClick);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    return () => {
      document.removeEventListener('click', handleBackdropClick);
      document.body.style.overflow = 'auto';
    };
  }, [isExpanded, isMobile]);

  // Check if tracker should be visible
  const shouldShowTracker = () => {
    if (!currentStep || !trackerVisible) return false;
    if (dismissedUntil && new Date() < dismissedUntil) return false;
    if (currentStep.isCurrentLocation) return true;
    return true;
  };

  const handleComplete = () => {
    if (currentStep) {
      markStepCompleted(currentStep.path);
      setTrackerVisible(false);
      setIsExpanded(false);
      showToast('Step marked as completed!', 'success');
    }
  };

  const handleMute = () => {
    if (currentStep) {
      muteStep(currentStep.path);
      setTrackerVisible(false);
      setIsExpanded(false);
      showToast('Step muted. You won\'t see this suggestion again.', 'info');
    }
  };

  const showToast = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // Mobile Bottom Sheet Expanded View
  if (isExpanded && isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div className="setup-tracker-backdrop fixed inset-0 bg-black/50 z-40 animate-fade-in" />
        
        {/* Bottom Sheet */}
        <div className={`
          fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl
          transform transition-transform duration-300 ease-out
          animate-slide-up
          ${sheetHeight}
          max-h-[90vh] overflow-hidden flex flex-col
        `}>
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-teal-700 text-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaRobot className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Setup Assistant</h1>
                  <p className="text-sm opacity-90">{progress}% complete</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Setup Progress</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentStep ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {currentStep?.icon && React.createElement(currentStep.icon, {
                        className: "w-5 h-5 text-blue-600"
                      })}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">{currentStep?.title}</h2>
                      <p className="text-sm text-gray-600">
                        {currentStep?.type === 'current' ? 'You\'re on this step' : 'Suggested next step'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">
                        {currentStep?.isCurrentLocation 
                          ? 'Complete the actions on this page to finish this setup step.'
                          : 'This will help you set up your dashboard efficiently.'
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg mb-4"
                  >
                    <span className="font-medium">Step Details</span>
                    <ChevronRight className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                  </button>

                  {showDetails && currentStep?.content && (
                    <div className="mb-6 space-y-3">
                      {currentStep.content.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Setup Complete!</h3>
                <p className="text-gray-600 mb-6">All setup steps have been completed.</p>
              </div>
            )}
          </div>

          {/* Action Buttons - Sticky at bottom */}
          <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
            {currentStep ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    goToStep(currentStep?.path);
                    setIsExpanded(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-600 hover:to-blue-700 transition-all active:scale-95"
                >
                  <ExternalLink className="w-5 h-5" />
                  {currentStep?.isCurrentLocation ? 'Continue Here' : `Go to ${currentStep?.title}`}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Mark Done
                  </button>
                  
                  <button
                    onClick={handleMute}
                    className="bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-all"
                  >
                    Mute Step
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-xl font-bold text-lg"
              >
                Close Assistant
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // If tracker is completely disabled or minimized
  if ((!shouldShowTracker() && !isMinimized) || isMinimized) {
    return (
      <button
        onClick={() => {
          if (isMobile) {
            setIsExpanded(true);
          } else {
            setIsMinimized(false);
            setTrackerVisible(true);
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          fixed z-40 p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full shadow-xl hover:shadow-2xl 
          transition-all duration-300 hover:scale-110 active:scale-95
          ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}
          ${isMinimized ? 'animate-bounce-subtle' : ''}
        `}
        title="Setup Assistant"
        aria-label="Setup Assistant"
      >
        <div className="relative">
          <FaRobot className="w-6 h-6 sm:w-8 sm:h-8" />
          {progress < 100 && !isMinimized && (
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-xs rounded-full flex items-center justify-center animate-pulse">
              !
            </div>
          )}
        </div>
        
        {/* Desktop hover tooltip */}
        {!isMobile && isHovering && (
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            <div className="font-medium">Setup Assistant</div>
            <div className="text-xs opacity-90">{progress}% complete</div>
          </div>
        )}
      </button>
    );
  }

  if (!currentStep) return null;

  // Desktop/Tablet floating card
  return (
    <div className={`
      fixed z-40 animate-fade-in-up
      ${isMobile ? 'inset-x-0 bottom-0' : 'bottom-6 right-6 w-full max-w-sm sm:max-w-md md:max-w-lg lg:w-96'}
    `}>
      <div className={`
        bg-white shadow-2xl border border-gray-200 overflow-hidden
        ${isMobile 
          ? 'rounded-t-2xl border-b-0' 
          : 'rounded-xl'
        }
      `}>
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r from-teal-500 to-teal-700`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentStep?.iconColor ? 'bg-white/80' : 'bg-white'}`}>
                {currentStep?.icon && React.createElement(currentStep.icon, {
                  className: `w-4 h-4 sm:w-5 sm:h-5 ${currentStep.iconColor || 'text-white'}`
                })}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white flex items-center gap-2 truncate">
                  Setup Assistant
                </h3>
                <p className="text-sm text-white/90 truncate">
                  {currentStep?.type === 'current' ? 'You\'re on this step' : 'Next step suggestion'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              {!isMobile && (
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              {isMobile && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                  title="Expand"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setTrackerVisible(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/90 mb-1">
              <span>Setup Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-white/30 rounded-full overflow-hidden">
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
            <div className="min-w-0 pr-2">
              <h4 className="font-semibold text-gray-800 text-base sm:text-lg truncate">
                {currentStep?.title}
              </h4>
              {currentStep?.type === 'suggestion' && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                  <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Suggested next step to improve your setup</span>
                </div>
              )}
              {currentStep?.isCurrentLocation && (
                <div className="flex items-center text-xs sm:text-sm text-blue-600 mt-1">
                  <CheckCircle2 className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>You're currently on this step</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-1 flex-shrink-0 ml-2"
            >
              {showDetails ? 'Less' : 'Details'}
              <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showDetails && currentStep?.content && (
            <div className="mb-4 space-y-2">
              {currentStep.content.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5 mr-2 text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-start">
              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                {currentStep?.isCurrentLocation 
                  ? 'Complete the actions on this page to finish this setup step.'
                  : 'This will help you set up your dashboard efficiently.'
                }
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => goToStep(currentStep?.path)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 sm:py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 hover:shadow-md active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="truncate">
                {currentStep?.isCurrentLocation ? 'Continue Here' : `Go to ${currentStep?.title}`}
              </span>
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 sm:py-2.5 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 hover:shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mark Done</span>
                <span className="sm:hidden">Done</span>
              </button>
              
              {isMobile && (
                <button
                  onClick={() => setTrackerVisible(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 sm:py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-all flex items-center justify-center"
                >
                  Close
                </button>
              )}
            </div>
          </div>

          {/* Mobile extra actions */}
          {isMobile && (
            <div className="mt-4 pt-3 border-t">
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-center text-blue-600 text-sm font-medium py-2"
              >
                View Full Details
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile backdrop for regular card */}
      {isMobile && !isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setTrackerVisible(false)}
        />
      )}
    </div>
  );
};

export default SetupTracker;