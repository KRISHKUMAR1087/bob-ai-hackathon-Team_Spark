import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  hasUserInteracted: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const STORAGE_KEY_PLAYING = 'portpulse_music_playing';
const STORAGE_KEY_VOLUME = 'portpulse_music_volume';

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYING);
    return saved !== null ? saved === 'true' : false;
  });
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
    return saved !== null ? Number(saved) : 0.35;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio('/BackgroundMusic.mp3');
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    const handlePlayState = () => setIsPlaying(true);
    const handlePauseState = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlayState);
    audio.addEventListener('pause', handlePauseState);

    return () => {
      audio.removeEventListener('play', handlePlayState);
      audio.removeEventListener('pause', handlePauseState);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Update volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playAudio = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.volume = isMuted ? 0 : volume;
      await audioRef.current.play();
      setIsPlaying(true);
      localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
    } catch (err) {
      // Browser autoplay policy might block play before user interaction
      console.warn('Audio play request prevented by browser policy or error:', err);
      setIsPlaying(false);
    }
  }, [isMuted, volume]);

  const pauseAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    localStorage.setItem(STORAGE_KEY_PLAYING, 'false');
  }, []);

  const togglePlay = useCallback(() => {
    setHasUserInteracted(true);
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    localStorage.setItem(STORAGE_KEY_VOLUME, clamped.toString());
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  // Attempt to restore playback on first user gesture if user had music enabled previously
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
      const savedPref = localStorage.getItem(STORAGE_KEY_PLAYING);
      if (savedPref === 'true' && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        togglePlay,
        toggleMute,
        setVolume,
        hasUserInteracted,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
