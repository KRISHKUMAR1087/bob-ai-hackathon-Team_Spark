import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Volume2,
  VolumeX,
  Volume1,
  Pause,
  Play,
  Disc3,
  Sliders,
  Waves
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

interface MusicButtonProps {
  className?: string;
  showLabel?: boolean;
}

export const MusicButton: React.FC<MusicButtonProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { isPlaying, isMuted, volume, togglePlay, toggleMute, setVolume } = useMusic();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getVolumeIcon = () => {
    if (!isPlaying || isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4 text-rose-500" />;
    }
    if (volume < 0.4) {
      return <Volume1 className="w-4 h-4 text-brand-teal" />;
    }
    return <Volume2 className="w-4 h-4 text-brand-teal" />;
  };

  const volumePresets = [
    { label: 'Low', val: 0.2 },
    { label: 'Med', val: 0.4 },
    { label: 'High', val: 0.75 },
  ];

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      {/* Main Circular Music Button */}
      <button
        onClick={togglePlay}
        onMouseEnter={() => {}}
        className={`group relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer select-none focus:outline-hidden ${
          showLabel ? 'h-9 px-3 gap-2' : 'w-9 h-9'
        } ${
          isPlaying
            ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-md shadow-teal-500/25 border border-teal-400/80 animate-pulse-glow hover:scale-105 active:scale-95'
            : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-brand-teal border-2 border-slate-200 hover:border-brand-teal shadow-xs hover:shadow-sm hover:scale-105 active:scale-95'
        } ${className}`}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        title={isPlaying ? 'Music Playing (Click to Pause)' : 'Music Paused (Click to Play)'}
      >
        {isPlaying ? (
          /* PLAYING STATE: Animated sound equalizer visualizer */
          <div className="flex items-center justify-center gap-[2px] h-4">
            <span
              className="w-[2.5px] bg-white rounded-full animate-[equalizer_0.9s_ease-in-out_infinite_alternate]"
              style={{ height: '55%' }}
            />
            <span
              className="w-[2.5px] bg-white rounded-full animate-[equalizer_0.7s_ease-in-out_infinite_alternate_0.2s]"
              style={{ height: '95%' }}
            />
            <span
              className="w-[2.5px] bg-white rounded-full animate-[equalizer_1.1s_ease-in-out_infinite_alternate_0.4s]"
              style={{ height: '40%' }}
            />
            <span
              className="w-[2.5px] bg-white rounded-full animate-[equalizer_0.8s_ease-in-out_infinite_alternate_0.1s]"
              style={{ height: '75%' }}
            />
          </div>
        ) : (
          /* PAUSED STATE: Clear Music Note with subtle play indicator */
          <div className="relative flex items-center justify-center">
            <Music className="w-4 h-4 text-slate-700 group-hover:text-brand-teal transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-slate-300 group-hover:bg-brand-teal transition-colors" />
          </div>
        )}

        {/* Optional Label (if showLabel prop is passed) */}
        {showLabel && (
          <span className="text-xs font-semibold tracking-wide">
            {isPlaying ? 'Music ON' : 'Music OFF'}
          </span>
        )}

        {/* Live Active Audio Badge */}
        {isPlaying && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white" />
          </span>
        )}
      </button>

      {/* Floating Control Trigger (Settings / Slider Popover Button) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className={`ml-1 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer ${
          isOpen ? 'text-brand-teal bg-teal-50 border-teal-200' : ''
        }`}
        title="Adjust music volume & settings"
        aria-label="Open music volume panel"
      >
        <Sliders className="w-3.5 h-3.5" />
      </button>

      {/* Floating Audio Control Center Modal / Popover */}
      {isOpen && (
        <div
          className="absolute top-11 right-0 z-50 w-72 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-text-main"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isPlaying
                    ? 'bg-gradient-to-tr from-teal-500 to-cyan-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Disc3 className={`w-4 h-4 ${isPlaying ? 'animate-disc-spin' : ''}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>Maritime Ambience</span>
                  {isPlaying && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Background Soundscape
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs p-1 rounded hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Equalizer Visualizer Band */}
          <div className="my-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <Waves className={`w-4 h-4 ${isPlaying ? 'text-brand-teal' : 'text-slate-400'}`} />
              <span>{isPlaying ? 'Audio Streaming' : 'Audio Paused'}</span>
            </div>
            <div className="flex items-end gap-1 h-4">
              {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3, 0.7].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying
                      ? 'bg-brand-teal animate-[equalizer_0.8s_ease-in-out_infinite_alternate]'
                      : 'bg-slate-300'
                  }`}
                  style={{
                    height: isPlaying ? `${h * 100}%` : '20%',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Volume Control Slider */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                Volume
              </span>
              <span className="font-mono text-xs font-bold text-brand-teal">
                {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {getVolumeIcon()}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            {/* Quick Volume Preset Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {volumePresets.map((preset) => {
                const isActive = !isMuted && Math.abs(volume - preset.val) < 0.08;
                return (
                  <button
                    key={preset.label}
                    onClick={() => setVolume(preset.val)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded-md border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 border-teal-300 text-brand-teal font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={togglePlay}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
              isPlaying
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-teal-500/20 shadow-md'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Background Music</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Background Music</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
