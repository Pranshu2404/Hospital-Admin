// components/DashboardProgress.jsx
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  Target,
  Zap,
  Award,
  BarChart3
} from 'lucide-react';
import { useSetupTracker } from '../context/SetupTrackerContext';

const DashboardProgress = () => {
  const { completedSteps, getProgress, currentStep, goToStep } = useSetupTracker();
  const [expanded, setExpanded] = useState(false);
  
  const progress = getProgress();
  const guideData = getGuideData(); // This function needs to be implemented based on role

  const getStepStatus = (stepPath) => {
    if (completedSteps.includes(stepPath)) return 'completed';
    if (currentStep?.path === stepPath) return 'current';
    return 'pending';
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'High': return <Zap className="w-3 h-3 text-red-500" />;
      case 'Medium': return <Target className="w-3 h-3 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Setup Progress</h3>
              <p className="text-sm text-gray-600">Complete your dashboard setup</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Progress Summary */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Completion</span>
            <span className="font-semibold text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{completedSteps.length} of {guideData.length} steps completed</span>
            {progress === 100 && (
              <span className="flex items-center text-green-600">
                <Award className="w-3 h-3 mr-1" />
                Setup Complete!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Steps List (Collapsible) */}
      {expanded && (
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {guideData.map((step, index) => {
              const status = getStepStatus(step.path);
              const isCurrent = status === 'current';
              
              return (
                <div
                  key={step.path}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isCurrent 
                      ? 'border-blue-300 bg-blue-50' 
                      : status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className={`w-5 h-5 ${isCurrent ? 'text-blue-500' : 'text-gray-300'}`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          isCurrent ? 'text-blue-700' : 
                          status === 'completed' ? 'text-green-700' : 
                          'text-gray-700'
                        }`}>
                          {step.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {step.priority && getPriorityIcon(step.priority)}
                          {isCurrent && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-1">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {step.content[0]}
                        </p>
                      </div>
                      
                      {!isCurrent && status !== 'completed' && (
                        <button
                          onClick={() => goToStep(step.path)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          Start this step
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {status === 'completed' && (
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProgress;