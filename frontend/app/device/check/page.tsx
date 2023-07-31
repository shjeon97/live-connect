'use client';

import Audio from '@/components/Audio';
import Speaker from '@/components/Speaker';
import ReactWebcam from '@/components/Webcam';
import { useEffect, useState } from 'react';

export default function Page() {
  const [deviceCheck, setDeviceCheck] = useState(false);
  useEffect(() => {
    const getUserMedia = async () => {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
        if (
          mediaDevices.filter(({ kind }) => kind === 'videoinput')[0]
            .deviceId &&
          mediaDevices.filter(({ kind }) => kind === 'audioinput')[0]
            .deviceId &&
          mediaDevices.filter(({ kind }) => kind === 'audiooutput')[0].deviceId
        ) {
          setDeviceCheck(true);
        }
      });
    };
    getUserMedia();
  }, []);
  console.log(deviceCheck);

  return (
    <>
      <div className="flex justify-center text-black my-10 font-bold text-2xl">
        System Configuration Settings
      </div>
      <div className="flex justify-center items-end xl:flex-nowrap flex-wrap  gap-8">
        <div className="w-96">
          <ReactWebcam />
        </div>
        <div className=" w-96">
          <Audio />
        </div>
        <div className=" w-96">
          <Speaker />
        </div>
      </div>
      <button>connect room</button>
    </>
  );
}
