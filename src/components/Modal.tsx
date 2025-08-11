import { RoadmapSection } from "@/constants/roadmap";
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
  if (!isOpen) return null;

  const completedCount = section.steps.filter((_, idx) => checklist[`${section.id}-${idx}`]).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-[#1e1e1e] w-[900px] rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            ESC
          </button>
          <h2 className="text-lg font-semibold text-white">{section.title}</h2>
          <span className="text-gray-500"></span>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-2 pb-4">
          <div className="text-center text-gray-300 mb-2">
            ({completedCount} / {section.steps.length})
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${(completedCount / section.steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Steps table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-[#2a2a2a] text-gray-400">
              <tr>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Step</th>
                <th className="px-4 py-2">Optional</th>
              </tr>
            </thead>
            <tbody>
              {section.steps.map((step, idx) => {
                const isChecked = checklist[`${section.id}-${idx}`] || false;
                return (
                  <tr key={idx} className="hover:bg-[#333333] transition">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onChecklistChange(section.id, idx)}
                      />
                    </td>
                    <td className="px-4 py-2">{step.title}</td>
                    <td className="px-4 py-2">
                      {step.optional ? (
                        <span className="text-yellow-400">Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
