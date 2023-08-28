'use client';

// 외부 라이브러리에서 필요한 컴포넌트와 훅 가져오기
import { useForm } from 'react-hook-form';
import TextInput from '@/components/TextInput';
import Alert from '@/components/Alert';
import { socket } from '@/api/socket-io';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import { createSocketIo, deleteSocketIo } from '@/api/fetch';
import useLocalStorage from '@/hook/useLocalStorage';

// 폼 데이터의 형태 정의
interface FormData {
  roomName: string;
  userName: string;
}

export default function Home() {
  const [localStorageRoomName, setLocalStorageRoomName] = useLocalStorage(
    'roomName',
    null,
  );
  const [localStorageUserName, setLocalStorageUserName] = useLocalStorage(
    'userName',
    null,
  );

  // useForm 훅 초기화 및 속성 분해
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onChange' });

  const router = useRouter();

  useEffect(() => {
    if (localStorageRoomName || localStorageUserName) {
      const handleDeleteSocketIo = async () => {
        const response = await deleteSocketIo(socket.id);
        if (!response.ok) {
          // Handle error if needed
          Swal.fire(
            'error',
            `Failed to fetch data: ${response.status} ${response.statusText}`,
          );
        }
        const result = await response.json();
        if (result.error) {
          Swal.fire('error', result.error);
        }
      };
      handleDeleteSocketIo();
    }
  }, [localStorageRoomName, localStorageUserName]);

  const onSubmit = async (data: FormData) => {
    if (!socket.id) {
      Swal.fire('error', 'socket id not found');
      return;
    }

    const response = await createSocketIo(
      data.roomName,
      data.userName,
      socket.id,
    );

    if (!response.ok) {
      // Handle error if needed
      Swal.fire(
        'error',
        `Failed to fetch data: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    if (result.ok) {
      await setLocalStorageRoomName(data.roomName);
      await setLocalStorageUserName(data.userName);
      router.push('/device/check');
    } else if (result.error) {
      Swal.fire('error', result.error);
    }
  };

  useEffect(() => {
    localStorage.clear();
    socket.disconnect();
    socket.connect();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full sm:w-10/12 md:w-8/12 lg:w-6/12 xl:w-4/12 mx-auto">
        <h1 className="text-2xl font-bold">Live Connect</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            {/* 방 이름을 위한 텍스트 입력 */}
            <TextInput
              label="Room Name"
              type="text"
              placeholder="Enter your room name"
              {...register('roomName', {
                required: 'Room Name is required',
                pattern: /^\S+$/,
              })}
            />
            {/* 방 이름이 입력되지 않은 경우 오류 메시지 표시 */}
            {errors.roomName &&
              errors.roomName.message &&
              errors.roomName.type === 'required' && (
                <Alert type="error" message={errors.roomName.message} />
              )}
            {/* 방 이름에 공백이 포함된 경우 오류 메시지 표시 */}
            {errors.roomName && errors.roomName.type === 'pattern' && (
              <Alert
                type="error"
                message="Room Name should not contain spaces."
              />
            )}

            {/* 사용자 이름을 위한 텍스트 입력 */}
            <TextInput
              label="User Name"
              type="text"
              placeholder="Enter your user name"
              {...register('userName', {
                required: 'User Name is required',
                pattern: /^\S+$/,
              })}
            />
            {/* 사용자 이름이 입력되지 않은 경우 오류 메시지 표시 */}
            {errors.userName &&
              errors.userName.message &&
              errors.userName.type === 'required' && (
                <Alert type="error" message={errors.userName.message} />
              )}
            {/* 사용자 이름에 공백이 포함된 경우 오류 메시지 표시 */}
            {errors.userName && errors.userName.type === 'pattern' && (
              <Alert
                type="error"
                message="User Name should not contain spaces."
              />
            )}
          </div>
          {/* 제출 버튼 */}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
          >
            Enter the room
          </button>
        </form>
      </div>
    </div>
  );
}
