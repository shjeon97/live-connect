'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';

interface SpeakerDevice {
  deviceId: string;
  label: string;
}

const Speaker: React.FC = () => {
  const [speakers, setSpeakers] = useState<SpeakerDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>('default');

  const handleSpeakers = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const audioDevices = mediaDevices
      .filter(({ kind }) => kind === 'audiooutput')
      .map(({ deviceId, label }) => ({ deviceId, label }));
    setSpeakers(audioDevices);
  }, []);

  useEffect(() => {
    if (speakers.length === 0) {
      navigator.mediaDevices.enumerateDevices().then(handleSpeakers);
    }
  }, [speakers, handleSpeakers]);

  useEffect(() => {
    let stream: MediaStream;

    const getSpeakerStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
      } catch (err) {
        console.error('Error accessing speaker:', err);
      }
    };

    getSpeakerStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [deviceId]);

  const handleSpeakerDeviceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
  };

  return (
    <>
      <audio className="w-full" src="/sound/soundTest.mp3" controls>
        Your browser does not support the
        <code>audio</code> element.
      </audio>
      <select className="w-full p-2" onChange={handleSpeakerDeviceChange}>
        {speakers.map((speaker, key) => (
          <option key={key} value={speaker.deviceId}>
            {speaker.label || `Speaker ${key + 1}`}
          </option>
        ))}
      </select>
    </>
  );
};

export default Speaker;
