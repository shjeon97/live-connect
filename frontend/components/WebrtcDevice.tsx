import React, { useEffect, useRef } from 'react';

interface WebrctDeviceProps {
  webcamStream: any;

  audioStream?: any;
}

const WebrctDevice: React.FC<WebrctDeviceProps> = ({
  webcamStream,
  audioStream,
}) => {
  const webrtcWebcamRef = useRef<any>();
  const webrtcVolumeRef = useRef<any>();

  useEffect(() => {
    if (webrtcWebcamRef.current) {
      webrtcWebcamRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  return (
    <span className="w-96 h-72">
      <video
        className="w-96 h-72"
        ref={webrtcWebcamRef}
        autoPlay={true}
        playsInline={true}
      />

      {/* <div className="w-96">
                  <meter ref={webrtcVolumeRef} className="w-full" max="150" />
                </div> */}
    </span>
  );
};

export default WebrctDevice;
