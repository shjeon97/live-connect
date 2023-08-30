import React, { useEffect, useRef, useState } from 'react';

interface WebrctDeviceProps {
  stream: any;
  webcam: boolean;
  audio: boolean;
}

const WebrctDevice: React.FC<WebrctDeviceProps> = ({
  stream,
  webcam,
  audio,
}) => {
  const webrtcWebcamRef = useRef<any>();
  const [volume, setVolume] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  useEffect(() => {
    if (webrtcWebcamRef.current && webcam) {
      webrtcWebcamRef.current.srcObject = stream;
    }
    if (audio) {
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
    }
  }, [audio, stream, webcam]);

  return (
    <span className="w-96 h-72 p-0.5">
      <video
        className="w-96 h-72"
        ref={webrtcWebcamRef}
        autoPlay={true}
        playsInline={true}
        muted={isMuted}
      />
      <div className="w-96 flex gap-2">
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
    </span>
  );
};

export default WebrctDevice;
