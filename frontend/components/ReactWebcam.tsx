'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import Alert from './Alert';
import useCheckUserMedia from '@/hook/useCheckUserMedia';

interface WebcamDevice {
  deviceId: string;
  label: string;
}

const ReactWebcam = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [webcams, setWebcams] = useState<WebcamDevice[]>([]);
  const isPermissionUserMediaVideo = useCheckUserMedia('video');
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey((prevKey) => prevKey + 1);
  };

  const handleWebcams = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const webcamDevices = mediaDevices
      .filter(({ kind }) => kind === 'videoinput')
      .map(({ deviceId, label }) => ({ deviceId, label }));
    setWebcams(webcamDevices);
  }, []);

  useEffect(() => {
    if (webcams.length === 0 && isPermissionUserMediaVideo) {
      navigator.mediaDevices.enumerateDevices().then(handleWebcams);
    }
  }, [handleWebcams, webcams, isPermissionUserMediaVideo]);

  // 웹캠 초기값
  useEffect(() => {
    if (!deviceId && webcams && webcams[0]) {
      setDeviceId(webcams[0].deviceId);
    }
  }, [deviceId, webcams]);

  const handleWebcamChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
  };

  return (
    <>
      {isPermissionUserMediaVideo ? (
        <>
          {webcams[0]?.deviceId && deviceId && (
            <div className="relative">
              <Webcam
                key={key}
                width="100%"
                videoConstraints={{ deviceId: deviceId }}
                audio={false}
                muted={true}
              />
              <button
                className="absolute bottom-12 right-3 bg-blue-500 hover:bg-blue-700 text-white rounded-full p-3"
                onClick={handleRefresh}
              >
                <svg
                  className="fill-current w-5 h-5 mr-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z" />
                </svg>
              </button>
              <select className="w-full p-2" onChange={handleWebcamChange}>
                {webcams.map((device: any, key: number) => (
                  <option key={key} value={device.deviceId}>
                    {device.label || `Device ${key + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!webcams[0]?.deviceId && (
            <Alert type="error" message="Webcam access failed." />
          )}
        </>
      ) : (
        <Alert
          type="error"
          message="It looks like your browser is blocking access to webcam identifiers. Because of this, it’s impossible to detect and manage all available webcams."
        />
      )}
    </>
  );
};

export default ReactWebcam;
