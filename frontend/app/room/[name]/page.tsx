'use client';

import Audio from '@/components/Audio';
import ReactWebcam from '@/components/ReactWebcam';
import Speaker from '@/components/Speaker';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
import { useState } from 'react';

export default function Page({ params }: { params: { name: string } }) {
  const [userName] = useState(localStorage.getItem('userName'));

  const isPermissionUserMedia = useCheckUserMedia('both');

  return (
    <>
      <header className=" border-b-4 px-6 py-4 text-xl">{params.name}</header>
      {isPermissionUserMedia && (
        <div className="flex flex-wrap">
          <div className="relative lg:w-2/5 max-w-2xl m-6">
            <ReactWebcam />
            <div className=" absolute bottom-28 left-3 px-2 py-1 bg-black text-white ">
              {userName}
            </div>
            <div className="flex gap-2">
              <Audio />
              <div>
                <div>speaker</div>
                <Speaker />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
