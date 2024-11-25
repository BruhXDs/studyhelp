import { useState, useCallback, useRef, useEffect } from 'react';
import { splitTextIntoFragments } from '../utils/textUtils';

interface UseSubtitleSyncProps {
  text: string;
  rate: number;
  pitch: number;
  volume: number;
  selectedVoice: string;
}

export function useSubtitleSync({
  text,
  rate,
  pitch,
  volume,
  selectedVoice,
}: UseSubtitleSyncProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFragment, setCurrentFragment] = useState(0);
  const [fragments, setFragments] = useState<string[]>([]);
  const syntheticPauseRef = useRef(false);
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateFragments = useCallback((text: string) => {
    const newFragments = splitTextIntoFragments(text);
    setFragments(newFragments);
  }, []);

  const speakFragment = useCallback((fragment: string, index: number) => {
    if (!fragment || syntheticPauseRef.current) return;

    // Clear any existing timeout
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }

    const synth = window.speechSynthesis;
    
    // Cancel any ongoing speech
    synth.cancel();

    // Chrome bug workaround: resume speech synthesis
    if (synth.speaking) {
      synth.resume();
    }

    const utterance = new SpeechSynthesisUtterance(fragment);
    utterance.voice = synth.getVoices().find(voice => voice.name === selectedVoice) || null;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setCurrentFragment(index);
      // Set a timeout slightly longer than the expected duration
      const duration = (fragment.length / rate) * 100 + 500; // Rough estimation
      speakTimeoutRef.current = setTimeout(() => {
        if (index < fragments.length - 1 && isPlaying) {
          speakFragment(fragments[index + 1], index + 1);
        } else if (index === fragments.length - 1) {
          setIsPlaying(false);
          setCurrentFragment(0);
        }
      }, duration);
    };

    utterance.onend = () => {
      // Clear the timeout if speech ends naturally
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      
      // Continue to next fragment if not at the end
      if (index < fragments.length - 1 && isPlaying) {
        speakFragment(fragments[index + 1], index + 1);
      } else if (index === fragments.length - 1) {
        setIsPlaying(false);
        setCurrentFragment(0);
      }
    };

    utterance.onerror = () => {
      console.error('Speech synthesis error');
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      setIsPlaying(false);
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
    }
  }, [fragments, isPlaying, pitch, rate, selectedVoice, volume]);

  const startPlayback = useCallback((fromBeginning: boolean = false) => {
    syntheticPauseRef.current = false;
    window.speechSynthesis.cancel();
    
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    
    setIsPlaying(true);
    
    if (fromBeginning) {
      setCurrentFragment(0);
      speakFragment(fragments[0], 0);
    } else {
      speakFragment(fragments[currentFragment], currentFragment);
    }
  }, [currentFragment, fragments, speakFragment]);

  const pausePlayback = useCallback(() => {
    syntheticPauseRef.current = true;
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    isPlaying,
    currentFragment,
    fragments,
    startPlayback,
    pausePlayback,
    updateFragments
  };
}