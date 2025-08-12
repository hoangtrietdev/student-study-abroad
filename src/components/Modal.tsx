import { RoadmapSection } from "@/utils/translateRoadmap";
import { useTranslation } from 'next-i18next';
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: RoadmapSection;
  checklist: Record<string, boolean>;
  onChecklistChange: (sectionId: string, stepIndex: number) => void;
}

export default function StyledModal({
  isOpen,
  onClose,
  section,
  checklist,
  onChecklistChange,
}: ModalProps) {
  const { t } = useTranslation('common');
  
  if (!isOpen) return null;

  const requiredSteps = section.steps.filter(step => !step.optional);
  const completedRequiredCount = section.steps
    .map((step, idx) => ({ step, idx }))
    .filter(({ step }) => !step.optional)
    .filter(({ idx }) => checklist[`${section.id}-${idx}`])
    .length;
  
  const totalCompletedCount = section.steps.filter((_, idx) => checklist[`${section.id}-${idx}`]).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-2 sm:p-4">
      <div className="bg-[#1e1e1e] w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] rounded-xl shadow-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <button
            onClick={onClose}
            className="self-end sm:self-auto mb-2 sm:mb-0 bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm"
          >
            {t('common.close')}
          </button>
          <div className="text-center flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{section.title}</h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">{section.description}</p>
          </div>
          <div className="w-0 sm:w-20"></div>
        </div>

        {/* Progress Section */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 mb-3">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-400">{t('common.requiredSteps')}</div>
              <div className="text-base sm:text-lg font-bold text-green-400">
                {completedRequiredCount} / {requiredSteps.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-400">{t('common.totalProgress')}</div>
              <div className="text-base sm:text-lg font-bold text-blue-400">
                {totalCompletedCount} / {section.steps.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-400">{t('common.completion')}</div>
              <div className="text-base sm:text-lg font-bold text-white">
                {Math.round((completedRequiredCount / requiredSteps.length) * 100)}%
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 sm:h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(completedRequiredCount / requiredSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Steps Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {section.steps.map((step, idx) => {
              const isChecked = checklist[`${section.id}-${idx}`] || false;
              const isOptional = step.optional || false;
              
              return (
                <div
                  key={idx}
                  className={`
                    border rounded-lg p-3 sm:p-4 transition-all duration-200
                    ${isOptional 
                      ? 'border-gray-600 bg-gray-800/30' 
                      : 'border-blue-500/30 bg-blue-900/10'
                    }
                    ${isChecked ? 'bg-green-900/20 border-green-500/50' : ''}
                    hover:shadow-lg hover:scale-[1.01]
                  `}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onChecklistChange(section.id, idx)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className={`
                          font-semibold text-xs sm:text-sm flex-1
                          ${isOptional ? 'text-gray-300' : 'text-white'}
                          ${isChecked ? 'line-through opacity-75' : ''}
                        `}>
                          {step.title}
                        </h3>
                        
                        <div className="flex space-x-2">
                          {isOptional ? (
                            <span className="px-2 py-0.5 sm:py-1 text-xs font-medium bg-yellow-900/50 text-yellow-300 rounded-full">
                              {t('common.optional')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 sm:py-1 text-xs font-medium bg-blue-900/50 text-blue-300 rounded-full">
                              {t('common.required')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {step.description && (
                        <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                      
                      {step.referenceLink && (
                        <div className="mt-2 sm:mt-3">
                          <a
                            href={step.referenceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="break-words">{t('common.reference')}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50 border-t border-gray-700">
          <div className="text-center text-xs sm:text-sm text-gray-400">
            {t('dashboard.completeAllRequiredSteps')}
          </div>
        </div>

      </div>
    </div>
  );
}
