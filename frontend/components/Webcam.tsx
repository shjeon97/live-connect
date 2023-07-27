'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const ReactWebcam = () => {
  const [deviceId, setDeviceId] = useState<any>(null);
  const [devices, setDevices] = useState<any>(null);

  const handleDevices = useCallback(
    (mediaDevices: any) =>
      setDevices(mediaDevices.filter(({ kind }: any) => kind === 'videoinput')),
    [setDevices],
  );

  useEffect(() => {
    if (!devices) {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }
  }, [handleDevices, devices]);

  // 웹캠 초기값
  useEffect(() => {
    if (!deviceId && devices && devices[0]) {
      setDeviceId(devices[0].deviceId);
    }
  }, [deviceId, devices]);

  const handleWebcamChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
  };

  return (
    <>
      <Webcam
        width="100%"
        videoConstraints={{ deviceId: deviceId }}
        audio={false}
        muted={true}
      />
      <select className=" w-full p-2" onChange={handleWebcamChange}>
        {devices &&
          devices.map((device: any, key: number) => (
            <option key={key} value={device.deviceId}>
              {device.label || `Device ${key + 1}`}
            </option>
          ))}
      </select>
    </>
  );
};

export default ReactWebcam;
