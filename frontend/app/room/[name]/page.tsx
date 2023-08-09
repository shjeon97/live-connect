'use client';

import { socket } from '@/api/socket-io';
import Audio from '@/components/Audio';
import ReactWebcam from '@/components/ReactWebcam';
import Speaker from '@/components/Speaker';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

enum MessageType {
  MESSAGE = 'MESSAGE',
  ENTER = 'ENTER',
  EXIT = 'EXIT',
}
interface Messages {
  type: MessageType;
  message: string;
  userName?: string;
}

export default function Page({ params }: { params: { name: string } }) {
  const [userName] = useState(localStorage.getItem('userName'));
  const [messages, setMessages] = useState<Messages[]>([]);
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const isPermissionUserMedia = useCheckUserMedia('both');

  const handleMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setMessage(event.target.value);
  };

  const renderRoomMessage = (
    index: number,
    type: MessageType,
    message: string,
    userName?: string,
  ) => {
    switch (type) {
      case MessageType.ENTER:
        return (
          <div key={index}>
            <span className="">{message}</span>
          </div>
        );

      case MessageType.EXIT:
        return (
          <div key={index}>
            <span className="">{message}</span>
          </div>
        );

      case MessageType.MESSAGE:
        return (
          <div key={index} className="">
            <div>{userName} </div>
            <textarea className="max-w-xs" defaultValue={message} />
          </div>
        );
    }
  };

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (socket && message) {
      socket.emit('sendRoomMessage', {
        userName,
        roomName: localStorage.getItem('roomName'),
        message,
      });
      setMessage('');
    }
  };
  useEffect(() => {
    if (
      !localStorage.getItem('userName') ||
      !localStorage.getItem('roomName')
    ) {
      router.push(`/`);
    } else {
      socket.emit('findSocketIo');
    }
  }, []);

  useEffect(() => {
    socket.on('userEnterTheRoom', async (data) => {
      if (data.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: MessageType.ENTER, message: `${data.userName} entered.` },
        ]);
      } else if (data.error) {
        await Swal.fire('error', data.error);
      }
    });

    socket.on('userExitTheRoom', async (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: MessageType.EXIT, message: `${data.userName} exited.` },
      ]);
    });

    socket.on('sendRoomMessage', async (data) => {
      if (data.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: MessageType.MESSAGE,
            userName: data.userName,
            message: data.message,
          },
        ]);
      } else if (data.error) {
        await Swal.fire('error', data.error);
      }
    });

    socket.on('exitTheRoom', () => {
      router.push(`/device/check`);
    });
  }, []);

  return (
    <div className="min-h-screen max-h-screen">
      {isPermissionUserMedia && (
        <div className="flex flex-col justify-between min-h-screen w-96 border-x-4 border-t-4">
          <div className="relative h-min">
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
          <div className="flex justify-between items-center p-2 bg-slate-100 border-y-4">
            <span className="p-2 bg-black text-white">{params.name}</span>{' '}
            <span>chat</span>
            <div className="bg-black"></div>
          </div>
          <div className="grow bg-slate-50 ">
            <div className="w-full max-w-md p-4 border rounded">
              {messages.map((data, index) =>
                renderRoomMessage(
                  index,
                  data.type,
                  data.message,
                  data.userName,
                ),
              )}
            </div>
          </div>
          <form onSubmit={handleSendMessage} className="flex flex-col h-min">
            <textarea
              className="w-full p-2 border rounded resize-none"
              rows={5}
              value={message}
              onChange={handleMessageChange}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mb-1"
            >
              test
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
