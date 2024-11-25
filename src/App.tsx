import React from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import TextToSpeech from './components/TextToSpeech';
import VideoSubtitles from './components/VideoSubtitles';
import YouTubeSubtitles from './components/YouTubeSubtitles';
import { Volume2, Video, Youtube } from 'lucide-react';
import 'react-tabs/style/react-tabs.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Tabs className="bg-white rounded-xl shadow-lg p-6">
          <TabList className="flex gap-4 mb-6 border-b border-gray-200">
            <Tab className="flex items-center gap-2 px-4 py-2 text-gray-600 cursor-pointer ui-selected:text-indigo-600 ui-selected:border-b-2 ui-selected:border-indigo-600">
              <Volume2 className="w-5 h-5" />
              Text to Speech
            </Tab>
            <Tab className="flex items-center gap-2 px-4 py-2 text-gray-600 cursor-pointer ui-selected:text-indigo-600 ui-selected:border-b-2 ui-selected:border-indigo-600">
              <Video className="w-5 h-5" />
              Video Subtitles
            </Tab>
            <Tab className="flex items-center gap-2 px-4 py-2 text-gray-600 cursor-pointer ui-selected:text-indigo-600 ui-selected:border-b-2 ui-selected:border-indigo-600">
              <Youtube className="w-5 h-5" />
              YouTube Subtitles
            </Tab>
          </TabList>

          <TabPanel>
            <TextToSpeech />
          </TabPanel>
          <TabPanel>
            <VideoSubtitles />
          </TabPanel>
          <TabPanel>
            <YouTubeSubtitles />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

export default App;