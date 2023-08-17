import { useState, useEffect } from 'react';

const useCheckUserMedia = (
  mediaType: 'audio' | 'video' | 'both' = 'both',
): boolean => {
  const [hasUserMedia, setHasUserMedia] = useState<boolean>(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      const constraints =
        mediaType === 'audio'
          ? { audio: true }
          : mediaType === 'video'
          ? { video: true }
          : { audio: true, video: true };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(() => setHasUserMedia(true))
        .catch((error) => {
          console.log(error);
          setHasUserMedia(false);
        });
    }
  }, [mediaType]);

  return hasUserMedia;
};

export default useCheckUserMedia;
