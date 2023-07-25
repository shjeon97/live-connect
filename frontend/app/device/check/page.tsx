'use client';

import AudioVolume from '@/components/AudioVolume';
import ReactWebcam from '@/components/Webcam';
import { useCallback, useEffect, useState } from 'react';

export default function Page() {
  const [audios, setAudios] = useState<any>(null);

  const handleAudios = useCallback(
    (mediaDevices: any) =>
      setAudios(mediaDevices.filter(({ kind }: any) => kind === 'audioinput')),
    [setAudios],
  );
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleAudios);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {});
  }, [handleAudios, audios]);

  return (
    <div>
      <div className="text-black">시스템 환경 설정</div>
      <div className="flex flex-wrap">
        <div className="max-w-xl">
          <ReactWebcam />
        </div>
        <audio></audio>
        <div className="max-w-xl">
          <AudioVolume />
        </div>
        <div>스피커</div>
      </div>
    </div>
  );
}
