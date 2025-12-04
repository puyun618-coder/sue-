import React, { useRef } from 'react';
import { useStore } from '../store';
import { AppMode, GestureType } from '../types';

export const UI: React.FC = () => {
  const { mode, setMode, gesture, isVisionEnabled, toggleVision, addPhoto } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addPhoto(url);
    }
  };

  const getGestureIcon = () => {
    switch(gesture) {
      case GestureType.OPEN_PALM: return '🖐️';
      case GestureType.CLOSED_FIST: return '✊';
      case GestureType.PINCH: return '👌';
      default: return 'Waiting...';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-serif text-[#FFD700] tracking-widest drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">
            OH!SOME TREE
          </h1>
          <p className="text-emerald-300 text-sm tracking-widest mt-1">AI INTERACTIVE EXPERIENCE</p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-800 flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${isVisionEnabled ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
             <span className="text-xs uppercase tracking-wider">
               {isVisionEnabled ? 'Vision Active' : 'Vision Off'}
             </span>
          </div>
          {isVisionEnabled && (
             <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-[#FFD700]/30 animate-in slide-in-from-right fade-in duration-300">
               <span className="text-xl mr-2">{getGestureIcon()}</span>
               <span className="text-xs font-mono text-[#FFD700]">{gesture}</span>
             </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-end gap-6 pointer-events-auto">
        <div className="flex flex-col gap-2 items-center group">
            <button 
                onClick={toggleVision}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isVisionEnabled ? 'bg-[#FFD700] border-[#FFD700] text-black' : 'bg-transparent border-emerald-500 text-emerald-500 hover:bg-emerald-900/50'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </button>
            <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Camera</span>
        </div>

        {/* Manual State Toggle (Fallback) */}
        <div className="bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 flex gap-2">
            <button 
                onClick={() => setMode(AppMode.FORMED)}
                className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 ${mode === AppMode.FORMED ? 'bg-emerald-700 text-white shadow-[0_0_20px_rgba(0,87,75,0.6)]' : 'text-gray-400 hover:text-white'}`}
            >
                FORM
            </button>
            <button 
                onClick={() => setMode(AppMode.CHAOS)}
                className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 ${mode === AppMode.CHAOS ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]' : 'text-gray-400 hover:text-white'}`}
            >
                UNLEASH
            </button>
        </div>

        <div className="flex flex-col gap-2 items-center group">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 rounded-full border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-900/50 flex items-center justify-center transition-all duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </button>
            <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Upload</span>
        </div>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
        />
      </div>
      
      {/* Instructions */}
      <div className={`absolute bottom-24 w-full text-center transition-opacity duration-500 ${isVisionEnabled ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white/60 text-sm bg-black/40 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
             Open Palm: Unleash | Fist: Form | Pinch: Zoom Photo
          </p>
      </div>
    </div>
  );
};