'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Alert from './Alert';
import useCheckUserMedia from '@/hook/useCheckUserMedia';

interface AudioDevice {
  deviceId: string;
  label: string;
}

const Audio: React.FC = () => {
  const [volume, setVolume] = useState<number>(0);
  const [audios, setAudios] = useState<AudioDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>('default');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const isPermissionUserMediaAudio = useCheckUserMedia('audio');

  const handleAudios = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const audioDevices = mediaDevices
      .filter(({ kind }) => kind === 'audioinput')
      .map(({ deviceId, label }) => ({ deviceId, label }));
    setAudios(audioDevices);
  }, []);

  useEffect(() => {
    if (audios.length === 0 && isPermissionUserMediaAudio) {
      navigator.mediaDevices.enumerateDevices().then(handleAudios);
    }
  }, [audios, handleAudios, isPermissionUserMediaAudio]);

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
          if (!isMuted) {
            analyser.getByteFrequencyData(dataArray);
            const total = dataArray.reduce((acc, value) => acc + value, 0);
            const average = total / bufferLength;
            setVolume(average);
          }
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
  }, [deviceId, isMuted]);

  const handleAudioDeviceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
  };

  return (
    <>
      {isPermissionUserMediaAudio ? (
        <>
          {audios[0]?.deviceId && (
            <div>
              <div className="flex gap-2">
                <meter className="w-full" max="150" value={volume.toFixed(2)} />
                <button onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <select className="w-full p-2" onChange={handleAudioDeviceChange}>
                {audios.map((audio, key) => (
                  <option key={key} value={audio.deviceId}>
                    {audio.label || `Audio ${key + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!audios[0]?.deviceId && (
            <Alert type="error" message="Audio access failed." />
          )}
        </>
      ) : (
        <Alert
          type="error"
          message="It looks like your browser is blocking access to audio identifiers. Because of this, it’s impossible to detect and manage all available audio."
        />
      )}
    </>
  );
};

export default Audio;
