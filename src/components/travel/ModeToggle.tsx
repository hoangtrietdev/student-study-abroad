import { TRAVEL_MODES } from '@/constants/travel';
import { TravelMode } from '@/types/travel';

interface ModeToggleProps {
  value: TravelMode;
  onChange: (value: TravelMode) => void;
}

export default function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {TRAVEL_MODES.map((mode) => {
        const selected = mode.value === value;
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={`cursor-pointer rounded-xl border p-4 text-left transition-colors ${
              selected
                ? 'border-blue-400 bg-blue-500/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-500'
            }`}
          >
            <p className="font-semibold text-white">{mode.label}</p>
            <p className="mt-1 text-sm text-gray-300">{mode.helper}</p>
          </button>
        );
      })}
    </div>
  );
}
