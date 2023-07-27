'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

interface AudioDevice {
  deviceId: string;
  label: string;
}

const Audio: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState<number>(0);
  const [audios, setAudios] = useState<AudioDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>('default');

  const handleAudios = useCallback(
    (mediaDevices: MediaDeviceInfo[]) =>
      setAudios(
        mediaDevices
          .filter(({ kind }) => kind === 'audioinput')
          .map(({ deviceId, label }) => ({ deviceId, label })),
      ),
    [setAudios],
  );
  useEffect(() => {
    if (!audios.length) {
      navigator.mediaDevices.enumerateDevices().then(handleAudios);
    }
  }, [handleAudios, audios]);

  useEffect(() => {
    let stream: MediaStream;

    const getAudioStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId,
          },
        });
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

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
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [audios, deviceId]);

  const handleWebcamChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
  };

  return (
    <>
      <p className="text-6xl font-bold">{volume.toFixed(2)}</p>
      <select className="w-full p-2" onChange={handleWebcamChange}>
        {audios.map((audio, key) => (
          <option key={key} value={audio.deviceId}>
            {audio.label || `Audio ${key + 1}`}
          </option>
        ))}
      </select>
    </>
  );
};

export default Audio;
