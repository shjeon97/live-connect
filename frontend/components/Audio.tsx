'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Alert from './Alert';

interface AudioDevice {
  deviceId: string;
  label: string;
}

const Audio: React.FC = () => {
  const [volume, setVolume] = useState<number>(0);
  const [audios, setAudios] = useState<AudioDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>('default');

  const handleAudios = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const audioDevices = mediaDevices
      .filter(({ kind }) => kind === 'audioinput')
      .map(({ deviceId, label }) => ({ deviceId, label }));
    setAudios(audioDevices);
  }, []);

  useEffect(() => {
    if (audios.length === 0) {
      navigator.mediaDevices.enumerateDevices().then(handleAudios);
    }
  }, [audios, handleAudios]);

  useEffect(() => {
    let stream: MediaStream;

    const getAudioStream = async () => {
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
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          const total = dataArray.reduce((acc, value) => acc + value, 0);
          const average = total / bufferLength;
          setVolume(average);
          requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    getAudioStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [deviceId]);

  const handleAudioDeviceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
  };

  return (
    <>
      {audios[0]?.deviceId && (
        <>
          <meter className="w-full" max="256" value={volume.toFixed(2)} />
          <select className="w-full p-2" onChange={handleAudioDeviceChange}>
            {audios.map((audio, key) => (
              <option key={key} value={audio.deviceId}>
                {audio.label || `Audio ${key + 1}`}
              </option>
            ))}
          </select>
        </>
      )}
      {!audios[0]?.deviceId && (
        <Alert type="error" message="Audio connection failed." />
      )}
    </>
  );
};

export default Audio;
