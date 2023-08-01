'use client';

import Audio from '@/components/Audio';
import Speaker from '@/components/Speaker';
import ReactWebcam from '@/components/ReactWebcam';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
import Alert from '@/components/Alert';

export default function Page() {
  const isPermissionUserMedia = useCheckUserMedia('both');

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
      {isPermissionUserMedia ? (
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
          >
            connect room
          </button>
        </div>
      ) : (
        <Alert
          type="error"
          message="It looks like your browser is blocking access to userMedia identifiers. Because of this, it’s impossible to detect and manage all available userMedia."
        />
      )}
    </>
  );
}
