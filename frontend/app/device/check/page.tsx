'use client';

import Audio from '@/components/Audio';
import Speaker from '@/components/Speaker';
import ReactWebcam from '@/components/ReactWebcam';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
import Alert from '@/components/Alert';
import { useRouter } from 'next/navigation';
import { socket } from '@/api/socket-io';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

export default function Page() {
  const isPermissionUserMedia = useCheckUserMedia('both');
  const router = useRouter();

  useEffect(() => {
    if (
      !localStorage.getItem('userName') ||
      !localStorage.getItem('roomName')
    ) {
      router.push(`/`);
    }
  }, []);

  socket.on('enterTheRoom', async (data) => {
    if (data.ok) {
      router.push(`/room/${localStorage.getItem('roomName')}`);
    } else if (data.error) {
      await Swal.fire('error', data.error);
      router.push(`/`);
    }
  });

  return (
    <>
      {isPermissionUserMedia ? (
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
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
              onClick={() =>
                socket.emit('enterTheRoom', {
                  roomName: localStorage.getItem('roomName'),
                  userName: localStorage.getItem('userName'),
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
