'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface EmotionResult {
  mood: string;
  confidence: number;
  suggestions: string[];
  details: Array<{
    emotion: string;
    confidence: number;
  }>;
}

interface EmotionDetectorProps {
  onMoodDetected?: (mood: string, result: EmotionResult) => void;
}

export default function EmotionDetector({ onMoodDetected }: EmotionDetectorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Detect emotion
    await detectEmotion(file);
  };

  const detectEmotion = async (file: File) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/emotion/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const emotionResult = response.data.data;
      setResult(emotionResult);

      // Callback to parent component
      if (onMoodDetected) {
        onMoodDetected(emotionResult.mood, emotionResult);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to detect emotion');
      console.error('Emotion detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetDetection = () => {
    setResult(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Detect Mood from Photo
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Upload a selfie and we'll detect your current mood using AI! 📸
      </p>

      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview && (
        <button
          onClick={handleUploadClick}
          disabled={loading}
          className="w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-lg border-2 border-dashed border-purple-300 hover:bg-purple-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          {loading ? 'Processing...' : 'Upload Photo'}
        </button>
      )}

      {/* Preview & Loading */}
      {preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain rounded-lg"
          />
          {!result && (
            <button
              onClick={resetDetection}
              className="mt-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Choose different photo
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm text-gray-600">Analyzing your mood...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Detected Mood:
              </span>
              <span className="text-lg font-bold text-purple-600 capitalize">
                {result.mood}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Confidence:</span>
              <span className="text-sm font-medium text-gray-900">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Suggested Moods */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Suggested Moods:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((mood) => (
                  <span
                    key={mood}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize"
                  >
                    {mood}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emotion Details */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Emotion Breakdown:
            </p>
            <div className="space-y-2">
              {result.details.slice(0, 5).map((detail) => (
                <div key={detail.emotion} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 capitalize w-20">
                    {detail.emotion}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${detail.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {(detail.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Try Again Button */}
          <button
            onClick={resetDetection}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Try Another Photo
          </button>
        </div>
      )}
    </div>
  );
}
