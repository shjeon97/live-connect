import Audio from '@/components/Audio';
import Speaker from '@/components/Speaker';
import ReactWebcam from '@/components/Webcam';

export default function Page() {
  return (
    <div>
      <div className="text-black">시스템 환경 설정</div>
      <div className="flex flex-wrap">
        <div className="w-full max-w-lg">
          <ReactWebcam />
        </div>
        <div className="w-full max-w-lg">
          <Audio />
        </div>
        <div className="w-full max-w-lg">
          <Speaker />
        </div>
      </div>
    </div>
  );
}
