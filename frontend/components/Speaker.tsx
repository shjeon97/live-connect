'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import Alert from './Alert';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
import useBrowserType, { BrowserType } from '@/hook/useBrowserType';

interface SpeakerDevice {
  deviceId: string;
  label: string;
}

const Speaker: React.FC = () => {
  const [speakers, setSpeakers] = useState<SpeakerDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>('default');
  const isPermissionUserMediaSpeaker = useCheckUserMedia('audio');
  const audioRef = useRef<HTMLMediaElement>(null);
  const browserType = useBrowserType();

  const handleSpeakers = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const speakerDevices = mediaDevices
      .filter(({ kind }) => kind === 'audiooutput')
      .map(({ deviceId, label }) => ({ deviceId, label }));
    setSpeakers(speakerDevices);
  }, []);

  useEffect(() => {
    if (speakers.length === 0 && isPermissionUserMediaSpeaker) {
      navigator.mediaDevices.enumerateDevices().then(handleSpeakers);
    }
  }, [speakers, handleSpeakers, isPermissionUserMediaSpeaker]);

  useEffect(() => {
    let stream: MediaStream;
    try {
      if (browserType !== BrowserType.Unknown) {
        if (browserType !== BrowserType.Safari) {
          if (audioRef.current) {
            const newRef = audioRef.current;
            (newRef as any).setSinkId(deviceId);
          }
        }
      }
    } catch (err) {
      console.error('Error accessing speaker:', err);
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [browserType, deviceId]);

  const handleSpeakerDeviceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(event.target.value);
  };

  return (
    <>
      {isPermissionUserMediaSpeaker ? (
        <>
          {speakers[0]?.deviceId && (
            <>
              <audio
                ref={audioRef}
                className="w-full"
                src="/sound/soundTest.mp3"
                controls
              >
                Your browser does not support the
                <code>audio</code> element.
              </audio>
              <select
                className="w-full p-2"
                onChange={handleSpeakerDeviceChange}
              >
                {speakers.map((speaker, key) => (
                  <option key={key} value={speaker.deviceId}>
                    {speaker.label || `Speaker ${key + 1}`}
                  </option>
                ))}
              </select>
            </>
          )}
          {!speakers[0]?.deviceId && browserType !== BrowserType.Safari ? (
            <Alert type="error" message="Speaker access failed." />
          ) : (
            browserType === BrowserType.Safari && (
              <>
                <audio className="w-full" src="/sound/soundTest.mp3" controls>
                  Your browser does not support the
                  <code>audio</code> element.
                </audio>
                <select
                  className="w-full p-2"
                  onChange={handleSpeakerDeviceChange}
                >
                  <option>Default</option>
                </select>
              </>
            )
          )}
        </>
      ) : (
        <Alert
          type="error"
          message="It looks like your browser is blocking access to speaker identifiers. Because of this, it’s impossible to detect and manage all available speaker."
        />
      )}
    </>
  );
};

export default Speaker;
