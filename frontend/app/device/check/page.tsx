'use client';

import AudioTest from '@/components/AudioTest';
import Speaker from '@/components/Speaker';
import WebcamTest from '@/components/WebcamTest';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
import Alert from '@/components/Alert';
import { useRouter } from 'next/navigation';
import { socket } from '@/api/socket-io';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import useLocalStorage from '@/hook/useLocalStorage';

export default function Page() {
  const [audioDeviceId, setAudioDeviceId] = useState<string | null>(null);
  const [webcamDeviceId, setWebcamDeviceId] = useState<string | null>(null);
  const [speakerDeviceId, setSpeakerDeviceId] = useState<string | null>(null);

  const [localStorageRoomName] = useLocalStorage('roomName', null);
  const [localStorageUserName] = useLocalStorage('userName', null);
  const [, setLocalStorageAudioDeviceId] = useLocalStorage(
    'audioDeviceId',
    null,
  );
  const [, setLocalStorageWebcamDeviceId] = useLocalStorage(
    'webcamDeviceId',
    null,
  );
  const [, setLocalStorageSpeakerDeviceId] = useLocalStorage(
    'speakerDeviceId',
    null,
  );

  const isPermissionUserMedia = useCheckUserMedia('both');
  const router = useRouter();

  const getAudioDeviceId = (deviceId: string) => {
    setAudioDeviceId(deviceId);
  };
  const getWebcamDeviceId = (deviceId: string) => {
    setWebcamDeviceId(deviceId);
  };
  const getSpeakerDeviceId = (deviceId: string) => {
    setSpeakerDeviceId(deviceId);
  };

  useEffect(() => {
    if (!localStorageRoomName || !localStorageUserName) {
      router.push(`/`);
    }
  }, [localStorageRoomName, localStorageUserName, router]);

  useEffect(() => {
    if (audioDeviceId && webcamDeviceId) {
      socket.on('enterTheRoom', async (data) => {
        if (data.ok) {
          setLocalStorageAudioDeviceId(audioDeviceId);
          setLocalStorageWebcamDeviceId(webcamDeviceId);
          if (speakerDeviceId) {
            setLocalStorageSpeakerDeviceId(speakerDeviceId);
          }
          router.push(`/room/${localStorageRoomName}`);
        } else if (data.error) {
          await Swal.fire('error', data.error);
          router.push(`/`);
        } else {
          await Swal.fire('error', 'System Configuration Settings Failed.');
          router.push(`/`);
        }
      });
    }
  }, [
    audioDeviceId,
    webcamDeviceId,
    speakerDeviceId,
    setLocalStorageAudioDeviceId,
    setLocalStorageWebcamDeviceId,
    router,
    localStorageRoomName,
    setLocalStorageSpeakerDeviceId,
  ]);

  return (
    <>
      {isPermissionUserMedia ? (
        <>
          <div className="flex justify-center text-black my-10 font-bold text-2xl">
            System Configuration Settings
          </div>
          <div className="flex justify-center items-end xl:flex-nowrap flex-wrap  gap-8">
            <div className="w-96">
              <WebcamTest getDeviceId={getWebcamDeviceId} />
            </div>
            <div className=" w-96">
              <AudioTest getDeviceId={getAudioDeviceId} />
            </div>
            <div className=" w-96">
              <Speaker isSoundTest={true} getDeviceId={getSpeakerDeviceId} />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
              onClick={() =>
                socket.emit('enterTheRoom', {
                  roomName: localStorageRoomName,
                  userName: localStorageUserName,
                })
              }
            >
              connect room
            </button>
          </div>
        </>
      ) : (
        <Alert
          type="error"
          message="It looks like your browser is blocking access to userMedia identifiers. Because of this, it’s impossible to detect and manage all available userMedia."
        />
      )}
    </>
  );
}
