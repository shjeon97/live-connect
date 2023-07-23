'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const ReactWebcam = () => {
  const [deviceId, setDeviceId] = useState<any>(null);
  const [devices, setDevices] = useState<any>([]);

  const handleDevices = useCallback(
    (mediaDevices: any) =>
      setDevices(mediaDevices.filter(({ kind }: any) => kind === 'videoinput')),
    [setDevices],
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices, devices]);

  // 웹캠 초기값
  useEffect(() => {
    if (!deviceId && devices[0]) {
      setDeviceId(devices[0].deviceId);
    }
  }, [deviceId, devices]);

  const handleWebcamChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
  };

  return (
    <>
      <Webcam audio={false} videoConstraints={{ deviceId: deviceId }} />
      <select onChange={handleWebcamChange}>
        {devices.map((device: any, key: number) => (
          <option key={key} value={device.deviceId}>
            {device.label || `Device ${key + 1}`}
          </option>
        ))}
      </select>
    </>
  );
};

export default ReactWebcam;
