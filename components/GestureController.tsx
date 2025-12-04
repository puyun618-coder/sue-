import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { analyzeGestureFrame } from '../services/geminiService';
import { AppMode, GestureType } from '../types';

export const GestureController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isVisionEnabled, setGesture, setMode } = useStore();
  const [lastCheck, setLastCheck] = useState(0);
  const [backoffDelay, setBackoffDelay] = useState(0);

  // Setup Camera
  useEffect(() => {
    let isMounted = true;
    let stream: MediaStream | null = null;
    let initTimer: any = null;
    let retryTimer: any = null;

    const stopCamera = () => {
      // 1. Stop tracks on the video element if they exist
      if (videoRef.current && videoRef.current.srcObject) {
         const videoStream = videoRef.current.srcObject as MediaStream;
         try {
            videoStream.getTracks().forEach(track => track.stop());
         } catch (e) { console.warn("Error stopping video tracks", e); }
         videoRef.current.srcObject = null;
      }
      
      // 2. Stop local stream variable if it exists (and might not be attached yet)
      if (stream) {
        try {
            stream.getTracks().forEach(track => track.stop());
        } catch (e) { console.warn("Error stopping stream tracks", e); }
        stream = null;
      }
    };

    if (!isVisionEnabled) {
      stopCamera();
      setBackoffDelay(0);
      return;
    }

    const startCamera = async (retryCount = 0) => {
      // Ensure we start with a clean slate
      stopCamera();

      try {
        // Attempt 1: Try with ideal constraints (320x240, user facing)
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 320 }, 
              height: { ideal: 240 }, 
              facingMode: 'user' 
            } 
          });
        } catch (e) {
          console.warn("Ideal constraints failed, attempting fallback to default video...");
          // Attempt 2: Fallback to any available video source
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        
        // Race condition check: if component unmounted during await, stop immediately
        if (!isMounted) {
          if (stream) {
             (stream as MediaStream).getTracks().forEach(track => track.stop());
          }
          return;
        }

        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          // Ensure video plays (muted is required for autoplay policies)
          try {
            await videoRef.current.play();
          } catch (playErr) {
             console.error("Video play failed", playErr);
          }
        }
      } catch (err: any) {
        if (isMounted) {
            console.error("Error accessing camera:", err);
            
            // Check for "Device in use" / NotReadableError
            // Windows often throws NotReadableError if camera wasn't released fast enough
            if ((err.name === 'NotReadableError' || err.name === 'TrackStartError' || err.message?.includes('in use')) && retryCount < 2) {
                console.log(`Camera locked (${err.name}), retrying in 1s (Attempt ${retryCount + 1})...`);
                retryTimer = setTimeout(() => {
                    if (isMounted && isVisionEnabled) startCamera(retryCount + 1);
                }, 1000);
            }
        }
      }
    };

    // Slight delay on mount to allow previous cleanup to complete at OS level
    initTimer = setTimeout(() => {
        startCamera();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      clearTimeout(retryTimer);
      stopCamera();
    };
  }, [isVisionEnabled]);

  // Poll Gemini
  useEffect(() => {
    if (!isVisionEnabled) return;

    const intervalId = setInterval(async () => {
      const now = Date.now();
      // Base interval 3000ms to avoid 429 Rate Limits
      const timeSinceLast = now - lastCheck;
      const targetInterval = 3000 + backoffDelay;

      if (timeSinceLast < targetInterval) return;

      // Ensure video is ready and playing
      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          // Draw video frame to canvas
          context.drawImage(videoRef.current, 0, 0, 320, 240);
          const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
          
          setLastCheck(now); 

          try {
            const gesture = await analyzeGestureFrame(base64);
            setGesture(gesture);
            setBackoffDelay(0); // Success, reset backoff

            // Trigger logic based on gesture
            if (gesture === GestureType.OPEN_PALM) {
              setMode(AppMode.CHAOS);
            } else if (gesture === GestureType.CLOSED_FIST) {
              setMode(AppMode.FORMED);
            }
          } catch (error: any) {
            console.warn("Vision API error, backing off:", error);
            // If error, increase backoff (add 5 seconds, max 60s)
            setBackoffDelay(prev => Math.min(prev + 5000, 60000));
          }
        }
      }
    }, 1000); // Check every second if we are ready to poll

    return () => clearInterval(intervalId);
  }, [isVisionEnabled, lastCheck, backoffDelay, setGesture, setMode]);

  return (
    <div className="hidden">
      <video ref={videoRef} width="320" height="240" muted playsInline />
      <canvas ref={canvasRef} width="320" height="240" />
    </div>
  );
};