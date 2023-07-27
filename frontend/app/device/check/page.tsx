import Audio from '@/components/Audio';
import ReactWebcam from '@/components/Webcam';
import { useCallback, useEffect, useState } from 'react';

export default function Page() {
  return (
    <div>
      <div className="text-black">시스템 환경 설정</div>
      <div className="flex flex-wrap">
        <div className="max-w-xl">
          <ReactWebcam />
        </div>
        <div className="max-w-xl">
          <Audio />
        </div>
        <div>스피커</div>
      </div>
    </div>
  );
}
