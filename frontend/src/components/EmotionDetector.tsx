'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, X, RefreshCw, Aperture } from 'lucide-react';
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      // Small delay to ensure video element is mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally for mirror effect if needed, but usually raw capture is fine
        // context.translate(canvas.width, 0);
        // context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreview(dataUrl);
        stopCamera();
        
        // Convert to file and detect
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "webcam-photo.jpg", { type: "image/jpeg" });
            detectEmotion(file);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

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

  const resetDetection = () => {
    setResult(null);
    setPreview(null);
    setError('');
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Detect Mood</h3>
            <p className="text-xs text-gray-500">AI analysis from photo</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          {loading ? (
            <button disabled className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyzing...
            </button>
          ) : result ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Detected: {result.mood}
              </span>
              <button 
                onClick={resetDetection}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Reset
              </button>
            </div>
          ) : isCameraOpen ? (
            <button
              onClick={stopCamera}
              className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-xs font-medium"
            >
              Cancel
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={startCamera}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs font-medium flex items-center gap-1"
              >
                <Aperture className="w-3 h-3" />
                Live Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-xs"
                title="Upload Photo"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Camera View Overlay */}
      {isCameraOpen && (
        <div className="mt-3 relative rounded-lg overflow-hidden bg-black aspect-video">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-12 h-12 rounded-full bg-white border-4 border-purple-200 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600"></div>
            </button>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
