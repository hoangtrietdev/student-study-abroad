import { useState } from 'react';
import type { ExtractedProfile } from '@/types/simulation';

interface GoalInputProps {
  profile: ExtractedProfile;
  onGenerate: (goal: string) => void;
  isLoading: boolean;
}

const GOAL_SUGGESTIONS = [
  'I want to get a software engineering job in the EU',
  'I want to become a PhD student in Computer Science in Germany',
  'I want to work as a Data Scientist in the Netherlands',
  'I want to get a Master\'s in AI at a top European university',
  'I want to land a research internship at a European company',
];

export default function GoalInput({ profile, onGenerate, isLoading }: GoalInputProps) {
  const [goal, setGoal] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (goal.trim().length >= 10) onGenerate(goal.trim());
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Extracted profile preview */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">CV Extracted Successfully</h3>
            {profile.name && <p className="text-xs text-gray-400">{profile.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Skills', count: profile.skills.length, color: '#F97316' },
            { label: 'Education', count: profile.education.length, color: '#3B82F6' },
            { label: 'Certificates', count: profile.certificates.length, color: '#14B8A6' },
            { label: 'Connections', count: profile.connections.length, color: '#8B5CF6' },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-gray-900 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold" style={{ color }}>{count}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {profile.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 12).map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/20">
                {s}
              </span>
            ))}
            {profile.skills.length > 12 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-400">
                +{profile.skills.length - 12} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Goal input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What is your career goal? *
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. I want to get a software engineering job in the EU..."
            rows={3}
            disabled={isLoading}
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500
              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none
              disabled:opacity-50 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            {goal.length}/500 · Be as specific as possible for best results
          </p>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-xs text-gray-500 mb-2">💡 Try one of these:</p>
          <div className="flex flex-col gap-2">
            {GOAL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setGoal(s)}
                className="text-left text-xs px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300
                  hover:border-blue-500 hover:text-blue-300 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={goal.trim().length < 10 || isLoading}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all
            bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
            shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating your career graph…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Career Graph
            </>
          )}
        </button>
      </form>
    </div>
  );
}
