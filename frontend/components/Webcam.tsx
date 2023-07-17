import { useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = () => {
  const [devices, setDevices] = useState<any>(null);

  const handleDevices = useCallback(
    (mediaDevices: any) =>
      setDevices(mediaDevices.filter(({ kind }: any) => kind === 'videoinput')),
    [setDevices],
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <>
      {devices && devices[0]?.deviceId ? (
        <>
          <Webcam
            audio={false}
            videoConstraints={{ deviceId: devices[0].deviceId }}
          />
          <select>
            {devices.map((device: any, key: any) => (
              <option key={key}>{device.label || `Device ${key + 1}`}</option>
            ))}
          </select>
        </>
      ) : (
        <div>카메라 연결을 시도중입니다...</div>
      )}
    </>
  );
};

export default WebcamCapture;
