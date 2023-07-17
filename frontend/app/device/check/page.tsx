'use client';

import { INDEXED_DB_NAME, INDEXED_DB_STORE_LIST } from '@/app/constant';
import WebcamCapture from '@/components/Webcam';
import { openDB } from 'idb';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const idb = await openDB(INDEXED_DB_NAME, 1);
      const tx = idb.transaction(INDEXED_DB_STORE_LIST.user, 'readwrite');
      const store = tx.objectStore(INDEXED_DB_STORE_LIST.user);
      const result = await store.getAll();
      await tx.done;

      const user = result[0];

      if (!user) {
        router.push('/');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div>
      <div className="text-black">시스템 환경 설정</div>
      <WebcamCapture />
    </div>
  );
}
