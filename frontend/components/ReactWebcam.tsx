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
            <>
              <Webcam
                width="100%"
                videoConstraints={{ deviceId: deviceId }}
                audio={false}
                muted={true}
              />
              <select className="w-full p-2" onChange={handleWebcamChange}>
                {webcams.map((device: any, key: number) => (
                  <option key={key} value={device.deviceId}>
                    {device.label || `Device ${key + 1}`}
                  </option>
                ))}
              </select>
            </>
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
