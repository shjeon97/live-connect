'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import Alert from './Alert';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
interface WebcamDevice {
  deviceId: string;
  label: string;
}

interface ReactWebcamProps {
  getWebcam?: any;
}

const ReactWebcam: React.FC<ReactWebcamProps> = ({ getWebcam = null }) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [webcams, setWebcams] = useState<WebcamDevice[]>([]);
  const [webcam, setWebcam] = useState<any>(null);
  const isPermissionUserMediaVideo = useCheckUserMedia('video');
  const [isWebcamOff, setIsWebcamOff] = useState<boolean>(false);
  const webcamRef = useRef<any>(null);

  const handleWebcams = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const webcamDevices = mediaDevices
      .filter(
        ({ kind, deviceId }) => kind === 'videoinput' && deviceId !== 'default',
      )
      .map(({ deviceId, label }) => ({ deviceId, label }));
    setWebcams(webcamDevices);

    const webcamTracks = async () => {
      const webcam = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: webcamDevices[0].deviceId },
      });
      setWebcam(webcam);
    };
    webcamTracks();
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
      if (getWebcam && webcam) {
        getWebcam(webcam.getTracks()[0]);
      }
    }
  }, [deviceId, webcams]);
  useEffect(() => {
    if (webcamRef.current && webcam) {
      webcamRef.current.srcObject = webcam;
    }
  }, [webcamRef, webcam]);
  useEffect(() => {
    if (getWebcam && webcam) {
      getWebcam(webcam.getTracks()[0]);
    }
  }, [webcam]);

  const handleWebcamChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
    if (getWebcam) {
      setWebcam(
        await navigator.mediaDevices.getUserMedia({
          video: { deviceId: event.target.value },
        }),
      );
      (webcamRef.current.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: event.target.value },
      })),
        getWebcam(webcam.getTracks()[0]);
    }
  };

  return (
    <>
      {isPermissionUserMediaVideo ? (
        <>
          {webcams[0]?.deviceId && deviceId && (
            <div className="relative">
              <>
                <video ref={webcamRef} autoPlay={true} playsInline={true} />
              </>
              <button
                className="absolute bottom-12 right-2 bg-blue-500 hover:bg-blue-700 text-white  py-1 px-2"
                onClick={() => {
                  setIsWebcamOff(!isWebcamOff);
                  const tracks = webcamRef.current.srcObject.getTracks();
                  tracks.forEach((track: any) => {
                    track.enabled = !track.enabled;
                  });
                }}
              >
                {isWebcamOff ? 'on' : 'off'}
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
