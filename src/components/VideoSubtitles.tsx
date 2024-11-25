import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, Settings, X, Maximize2, RotateCcw } from 'lucide-react';
import { splitTextIntoFragments } from '../utils/textUtils';
import VolumeControl from './VolumeControl';
import { useVideoSync } from '../hooks/useVideoSync';

interface Voice {
  name: string;
  lang: string;
}

const PLAYBACK_SPEEDS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 }
];

export default function VideoSubtitles() {
  const [videoUrl, setVideoUrl] = useState('');
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [videoVolume, setVideoVolume] = useState(0.5);
  const [ttsVolume, setTtsVolume] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    isPlaying,
    currentTime,
    currentFragment,
    fragments,
    startPlayback,
    pausePlayback,
    updateFragments,
    handleVideoStateChange
  } = useVideoSync({
    text,
    rate,
    pitch,
    ttsVolume,
    selectedVoice,
    player: videoRef.current ? {
      getCurrentTime: () => videoRef.current?.currentTime || 0,
      seekTo: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
          if (isPlaying) {
            videoRef.current.play().catch(console.error);
          }
        }
      }
    } : null,
    onStateChange: (playing) => {
      if (videoRef.current) {
        if (playing) {
          videoRef.current.play().catch(console.error);
        } else {
          videoRef.current.pause();
        }
      }
    }
  });

  useEffect(() => {
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const availableVoices = synth.getVoices().map(voice => ({
        name: voice.name,
        lang: voice.lang
      }));
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    updateVoices();
    synth.onvoiceschanged = updateVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    updateFragments(text);
  }, [text, updateFragments]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (expanded) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  };

  const SubtitleOverlay = () => (
    <div className="absolute inset-x-0 bottom-16 flex items-center justify-center pointer-events-none">
      <div className={`max-w-4xl w-full px-8 ${expanded ? 'scale-125' : ''}`}>
        <div 
          className="text-white text-6xl font-bold text-center drop-shadow-lg transition-all duration-300 transform"
          style={{
            textShadow: '3px 3px 6px rgba(0,0,0,0.9), -3px -3px 6px rgba(0,0,0,0.9)',
            WebkitTextStroke: '2px black'
          }}
        >
          {fragments[currentFragment] || "Subtitles will appear here..."}
        </div>
      </div>
    </div>
  );

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
    // Restart playback to sync with new rate
    if (isPlaying) {
      pausePlayback();
      setTimeout(() => startPlayback(false), 100);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        ref={containerRef} 
        className={`relative bg-black transition-all duration-300 ${
          expanded ? 'fixed inset-0 z-50 w-screen h-screen' : 'rounded-lg overflow-hidden'
        }`}
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className={`${expanded ? 'w-screen h-screen object-contain' : 'w-full aspect-video'}`}
              controls={false}
              onPause={() => handleVideoStateChange({ data: 2 })}
            />
            <SubtitleOverlay />
            <button
              onClick={toggleExpanded}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 z-20"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
            <label className="cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              Upload Video
            </label>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your script here..."
          className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-lg"
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <VolumeControl
            label="Video Volume"
            volume={videoVolume}
            onVolumeChange={(value) => {
              setVideoVolume(value);
              if (videoRef.current) {
                videoRef.current.volume = value;
              }
            }}
          />
          <VolumeControl
            label="TTS Volume"
            volume={ttsVolume}
            onVolumeChange={setTtsVolume}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {PLAYBACK_SPEEDS.map(speed => (
            <button
              key={speed.value}
              onClick={() => handleRateChange(speed.value)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                rate === speed.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {speed.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => startPlayback(true)}
            disabled={!videoUrl || !text}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" /> Restart
          </button>
          {!isPlaying ? (
            <button
              onClick={() => startPlayback(false)}
              disabled={!videoUrl || !text}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Play className="w-5 h-5" /> {currentTime > 0 ? 'Resume' : 'Play'}
            </button>
          ) : (
            <button
              onClick={pausePlayback}
              disabled={!videoUrl || !text}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Pause className="w-5 h-5" /> Pause
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="text-white text-xl font-semibold mb-4">Preview Fragments</div>
          <div className="space-y-2">
            {fragments.map((fragment, index) => (
              <div
                key={index}
                className={`text-xl transition-all ${
                  currentFragment === index
                    ? 'text-white scale-105'
                    : 'text-gray-400 scale-100'
                }`}
              >
                {fragment}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-xl font-semibold mb-4">Voice Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pitch: {pitch}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}