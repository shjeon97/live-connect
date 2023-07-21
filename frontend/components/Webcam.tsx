'use client';

import { useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const ReactWebcam = () => {
  const [deviceId, setDeviceId] = useState({});
  const [devices, setDevices] = useState<any>([]);

  const handleDevices = useCallback(
    (mediaDevices: any) =>
      setDevices(mediaDevices.filter(({ kind }: any) => kind === 'videoinput')),
    [setDevices],
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices, devices]);

  return (
    <>
      {devices.map((device: any, key: number) => (
        <div key={key}>
          <Webcam
            audio={false}
            videoConstraints={{ deviceId: device.deviceId }}
          />
          {device.label || `Device ${key + 1}`}
        </div>
      ))}
    </>
  );
};

export default ReactWebcam;
