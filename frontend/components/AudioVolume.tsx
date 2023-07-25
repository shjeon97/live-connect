'use client';

import { useEffect, useRef, useState } from 'react';

const AudioVolume: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState<number>(0);

  useEffect(() => {
    let stream: MediaStream;

    const getAudioStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }

        const audioContext = new (window.AudioContext || window.AudioContext)();
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
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="text-center">
        <audio ref={audioRef} autoPlay muted></audio>
        <p className="text-6xl font-bold text-white">
          Volume: {volume.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default AudioVolume;
