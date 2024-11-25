import { useState, useCallback, useRef, useEffect } from 'react';
import { splitTextIntoFragments } from '../utils/textUtils';

interface UseVideoSyncProps {
  text: string;
  rate: number;
  pitch: number;
  ttsVolume: number;
  selectedVoice: string;
  player: any;
  onStateChange?: (playing: boolean) => void;
}

export function useVideoSync({
  text,
  rate,
  pitch,
  ttsVolume,
  selectedVoice,
  player,
  onStateChange
}: UseVideoSyncProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFragment, setCurrentFragment] = useState(0);
  const [fragments, setFragments] = useState<string[]>([]);
  
  const fragmentTimesRef = useRef<number[]>([]);
  const syntheticPauseRef = useRef(false);
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const updateFragments = useCallback((text: string) => {
    const newFragments = splitTextIntoFragments(text);
    setFragments(newFragments);

    // Calculate fragment durations based on length and speech rate
    let currentDuration = 0;
    fragmentTimesRef.current = newFragments.map(fragment => {
      // Base duration is proportional to fragment length, adjusted for speech rate
      const duration = (fragment.length * 0.06) / rate;
      currentDuration += duration;
      return currentDuration;
    });
  }, [rate]);

  const speakFragment = useCallback((fragment: string, index: number, startTime: number) => {
    if (!fragment || syntheticPauseRef.current) return;

    // Clear any existing timeout and speech
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    if (currentUtteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(fragment);
    currentUtteranceRef.current = utterance;

    utterance.voice = synth.getVoices().find(voice => voice.name === selectedVoice) || null;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = ttsVolume;

    utterance.onstart = () => {
      setCurrentFragment(index);
      
      // Ensure video is at the correct time
      const currentVideoTime = player?.getCurrentTime() || 0;
      if (Math.abs(currentVideoTime - startTime) > 0.1) {
        player?.seekTo(startTime);
      }
    };

    utterance.onend = () => {
      if (index < fragments.length - 1 && isPlaying) {
        const nextTime = fragmentTimesRef.current[index];
        speakFragment(fragments[index + 1], index + 1, nextTime);
      } else if (index === fragments.length - 1) {
        setIsPlaying(false);
        setCurrentFragment(0);
        onStateChange?.(false);
      }
    };

    utterance.onerror = () => {
      console.error('Speech synthesis error');
      setIsPlaying(false);
      onStateChange?.(false);
    };

    try {
      synth.speak(utterance);
      
      // Chrome bug workaround: ensure speech starts
      if (!synth.speaking) {
        setTimeout(() => {
          synth.resume();
        }, 100);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
      onStateChange?.(false);
    }
  }, [fragments, isPlaying, onStateChange, pitch, player, rate, selectedVoice, ttsVolume]);

  const startPlayback = useCallback((fromBeginning: boolean = false) => {
    if (!player) return;

    syntheticPauseRef.current = false;
    window.speechSynthesis.cancel();

    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }

    setIsPlaying(true);
    onStateChange?.(true);

    const startTime = fromBeginning ? 0 : player.getCurrentTime();
    const startIndex = fromBeginning ? 0 : 
      Math.max(0, fragmentTimesRef.current.findIndex(time => time > startTime));

    if (fromBeginning) {
      player.seekTo(0);
      setCurrentTime(0);
      setCurrentFragment(0);
    }

    speakFragment(fragments[startIndex], startIndex, startTime);
  }, [fragments, onStateChange, player, speakFragment]);

  const pausePlayback = useCallback(() => {
    syntheticPauseRef.current = true;
    setIsPlaying(false);
    onStateChange?.(false);

    if (player) {
      setCurrentTime(player.getCurrentTime());
    }

    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    
    window.speechSynthesis.cancel();
    currentUtteranceRef.current = null;
  }, [onStateChange, player]);

  const handleVideoStateChange = useCallback((event: any) => {
    if (event.data === 2 && !syntheticPauseRef.current) { // Paused
      pausePlayback();
    }
  }, [pausePlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    };
  }, []);

  // Update fragments when text changes
  useEffect(() => {
    updateFragments(text);
  }, [text, updateFragments]);

  return {
    isPlaying,
    currentTime,
    currentFragment,
    fragments,
    startPlayback,
    pausePlayback,
    updateFragments,
    handleVideoStateChange
  };
}