import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, Settings, X, Maximize2, RotateCcw, AlertCircle } from 'lucide-react';
import { splitTextIntoFragments } from '../utils/textUtils';
import { extractYouTubeId } from '../utils/youtubeUtils';
import VolumeControl from './VolumeControl';
import { useSubtitleSync } from '../hooks/useSubtitleSync';

interface Voice {
  name: string;
  lang: string;
}

export default function YouTubeSubtitles() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [videoVolume, setVideoVolume] = useState(50);
  const [ttsVolume, setTtsVolume] = useState(1);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const {
    isPlaying,
    currentFragment,
    fragments,
    startPlayback,
    pausePlayback,
    updateFragments
  } = useSubtitleSync({
    text,
    rate,
    pitch,
    volume: ttsVolume,
    selectedVoice
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

  useEffect(() => {
    if (youtubeUrl) {
      const id = extractYouTubeId(youtubeUrl);
      if (id) {
        setVideoId(id);
        setUrlError(null);
      } else {
        setVideoId(null);
        setUrlError('Invalid YouTube URL. Please enter a valid YouTube URL or video ID.');
      }
    } else {
      setVideoId(null);
      setUrlError(null);
    }
  }, [youtubeUrl]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (expanded) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  };

  const handleVideoReady = (event: any) => {
    event.target.setVolume(videoVolume);
  };

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      mute: 0,
      origin: window.location.origin,
      enablejsapi: 1
    }
  };

  const SubtitleOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className={`max-w-4xl w-full px-8 ${expanded ? 'scale-125' : ''}`}>
        <div 
          className="text-white text-7xl font-bold text-center drop-shadow-lg transition-all duration-300 transform"
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

  return (
    <div className="space-y-6">
      <div 
        ref={containerRef} 
        className={`relative bg-black transition-all duration-300 ${
          expanded ? 'fixed inset-0 z-50 w-screen h-screen' : 'rounded-lg overflow-hidden'
        }`}
      >
        <div className={`${expanded ? 'w-screen h-screen' : 'aspect-video'} relative`}>
          {videoId ? (
            <>
              <YouTube
                ref={playerRef}
                videoId={videoId}
                opts={opts}
                onReady={handleVideoReady}
                className="w-full h-full"
                iframeClassName="w-full h-full"
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
            <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-4">
              <input
                type="text"
                placeholder="Enter YouTube URL or video ID..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className={`w-96 px-4 py-2 rounded-lg border-2 ${
                  urlError ? 'border-red-500' : 'border-indigo-600'
                } focus:ring-2 ${
                  urlError ? 'focus:ring-red-200' : 'focus:ring-indigo-500'
                }`}
              />
              {urlError && (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{urlError}</p>
                </div>
              )}
              <p className="text-gray-400 text-sm">
                Examples: youtube.com/watch?v=xxxxx, youtu.be/xxxxx, or video ID
              </p>
            </div>
          )}
        </div>
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
            volume={videoVolume / 100}
            onVolumeChange={(value) => {
              const newVolume = Math.round(value * 100);
              setVideoVolume(newVolume);
              if (playerRef.current?.internalPlayer) {
                playerRef.current.internalPlayer.setVolume(newVolume);
              }
            }}
          />
          <VolumeControl
            label="TTS Volume"
            volume={ttsVolume}
            onVolumeChange={setTtsVolume}
          />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => startPlayback(true)}
            disabled={!text}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" /> Restart
          </button>
          {!isPlaying ? (
            <button
              onClick={() => startPlayback(false)}
              disabled={!text}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Play className="w-5 h-5" /> Resume
            </button>
          ) : (
            <button
              onClick={pausePlayback}
              disabled={!text}
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
                  Rate: {rate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full"
                />
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