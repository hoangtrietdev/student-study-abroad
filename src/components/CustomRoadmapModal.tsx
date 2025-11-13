import { useState } from 'react';
import { useRouter } from 'next/router';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GenericModal from './GenericModal';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface CustomRoadmapFormData {
  university: string;
  universityWebsite: string;
  degreeLevel: 'Bachelor' | 'Master' | 'PhD';
  major: string;
  faculty?: string;
}

interface CustomRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomRoadmapModal({ isOpen, onClose }: CustomRoadmapModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomRoadmapFormData>({
    university: '',
    universityWebsite: '',
    degreeLevel: 'Bachelor',
    major: '',
    faculty: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!user) {
      setError('Please log in to create a custom roadmap');
      return false;
    }

    if (!formData.university.trim() || !formData.major.trim() || !formData.degreeLevel.trim()) {
      setError('University, Degree Level, and Major are required');
      return false;
    }

    return true;
  };

  // Check if a roadmap with the same parameters already exists
  const findExistingRoadmap = async () => {
    if (!user) return null;

    try {
      const q = query(
        collection(db, 'customRoadmaps'),
        where('userId', '==', user.uid),
        where('university', '==', formData.university.trim()),
        where('degreeLevel', '==', formData.degreeLevel),
        where('major', '==', formData.major.trim())
      );

      const querySnapshot = await getDocs(q);
      
      // Check if any of the results also match the optional fields
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const websiteMatch = 
          (!formData.universityWebsite && !data.universityWebsite) || 
          (formData.universityWebsite.trim() === (data.universityWebsite || '').trim());
        const facultyMatch = 
          (!formData.faculty && !data.faculty) || 
          (formData.faculty?.trim() === (data.faculty || '').trim());

        if (websiteMatch && facultyMatch) {
          return { id: doc.id, ...data };
        }
      }

      return null;
    } catch (err) {
      console.error('Error checking for existing roadmap:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, check if a roadmap with the same parameters already exists
      const existingRoadmap = await findExistingRoadmap();
      
      if (existingRoadmap) {
        // Roadmap already exists, navigate to it without calling API
        console.log('Found existing roadmap, navigating to:', existingRoadmap.id);
        
        // Show success message to user
        setError(null);
        setSuccessMessage('✅ Found existing roadmap! Redirecting...');
        
        // Small delay to show the message before navigation
        setTimeout(() => {
          router.push(`/custom-roadmap/${existingRoadmap.id}`);
          setLoading(false);
          onClose();
        }, 1500);
        
        return;
      }

      // No existing roadmap found, generate a new one
      const response = await fetch('/api/generate-custom-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.details || 'Failed to generate roadmap';
        throw new Error(errorMessage);
      }

      if (!data.roadmapData) {
        throw new Error('No roadmap data returned from server');
      }

      // Save to Firebase with user authentication
      const roadmapRef = await addDoc(collection(db, 'customRoadmaps'), {
        ...data.roadmapData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Navigate to custom roadmap page
      router.push(`/custom-roadmap/${roadmapRef.id}`);
      onClose();
    } catch (err) {
      console.error('Error creating custom roadmap:', err);
      
      let errorMessage = 'Failed to generate roadmap. Please try again.';
      
      if (err instanceof Error) {
        // Provide more specific error messages
        if (err.message.includes('AI service not configured')) {
          errorMessage = 'AI service is not configured. Please contact support.';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        university: '',
        universityWebsite: '',
        degreeLevel: 'Bachelor',
        major: '',
        faculty: '',
      });
      setError(null);
      onClose();
    }
  };

  return (
    <GenericModal isOpen={isOpen} onClose={handleClose} title="Create Your Custom Roadmap" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4 bg-[#1e1e1e] p-4 sm:p-6">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900/30 border-l-4 border-green-500 text-green-200 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3 animate-pulse">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {/* University */}
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-white mb-1">
            Target University <span className="text-red-400">*</span>
          </label>
          <input
            id="university"
            name="university"
            type="text"
            required
            value={formData.university}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
            placeholder="e.g., Stanford University"
            disabled={loading}
          />
        </div>

        {/* University Website */}
        <div>
          <label htmlFor="universityWebsite" className="block text-sm font-medium text-white mb-1">
            University Website <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input
            id="universityWebsite"
            name="universityWebsite"
            type="url"
            value={formData.universityWebsite}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
            placeholder="e.g., https://www.stanford.edu"
            disabled={loading}
          />
        </div>

        {/* Degree Level - Radio Group */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Degree Level <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-4">
            {(['Bachelor', 'Master', 'PhD'] as const).map((level) => (
              <label
                key={level}
                className={`
                  flex-1 relative flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                  ${formData.degreeLevel === level
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300 shadow-md'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-blue-500/50 hover:bg-gray-700'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="radio"
                  name="degreeLevel"
                  value={level}
                  checked={formData.degreeLevel === level}
                  onChange={handleChange}
                  disabled={loading}
                  className="sr-only"
                />
                <span className="font-medium">{level}</span>
                {formData.degreeLevel === level && (
                  <svg className="absolute right-2 top-2 w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Major */}
        <div>
          <label htmlFor="major" className="block text-sm font-medium text-white mb-1">
            Desired Major (Course Name) <span className="text-red-400">*</span>
          </label>
          <input
            id="major"
            name="major"
            type="text"
            required
            value={formData.major}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
            placeholder="e.g., Computer Science"
            disabled={loading}
          />
        </div>

        {/* Faculty */}
        <div>
          <label htmlFor="faculty" className="block text-sm font-medium text-white mb-1">
            Faculty <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input
            id="faculty"
            name="faculty"
            type="text"
            value={formData.faculty}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
            placeholder="e.g., Faculty of Engineering"
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-700 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 border-2 border-gray-600 rounded-lg text-gray-300 font-medium hover:bg-gray-700 hover:border-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Create Roadmap</span>
              </>
            )}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
