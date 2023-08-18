'use client';

import { socket } from '@/api/socket-io';
import Alert from '@/components/Alert';
import Speaker from '@/components/Speaker';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
import useLocalStorage from '@/hook/useLocalStorage';
import { useRouter } from 'next/navigation';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

interface Device {
  deviceId: string;
  label: string;
}

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

export default function Page({ params }: { params: { name: string } }) {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [message, setMessage] = useState<string>('');
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [webrtcStream, setWebrtcStream] = useState<any>(null);
  const [isDevicesReady, setIsDevicesReady] = useState(false);

  const [webcamDeviceId, setWebcamDeviceId] = useState<string | null>(null);
  const [webcams, setWebcams] = useState<Device[]>([]);
  const [isWebcamOff, setIsWebcamOff] = useState<boolean>(false);
  const isPermissionUserMediaVideo = useCheckUserMedia('video');
  const webcamRef = useRef<any>(null);
  // const [myPeerConnection] =
  //   useState<RTCPeerConnection | null>(null);

  const myPeerConnections: RTCPeerConnection[] = useMemo(() => [], []);

  const volumeRef = useRef<any>(null);
  const [audios, setAudios] = useState<Device[]>([]);
  const [audioDeviceId, setAudioDeviceId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const isPermissionUserMediaAudio = useCheckUserMedia('audio');

  const isPermissionUserMedia = useCheckUserMedia('both');
  const router = useRouter();
  const webrtcWebcamRef = useRef<any>(null);

  const [localStorageRoomName] = useLocalStorage('roomName', null);
  const [localStorageUserName] = useLocalStorage('userName', null);
  const [localStorageAudioDeviceId] = useLocalStorage('audioDeviceId', null);
  const [localStorageWebcamDeviceId] = useLocalStorage('webcamDeviceId', null);
  const [localStorageSpeakerDeviceId] = useLocalStorage(
    'speakerDeviceId',
    null,
  );

  const handleWebcams = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const webcamDevices = mediaDevices
      .filter(
        ({ kind, deviceId }) => kind === 'videoinput' && deviceId !== 'default',
      )
      .map(({ deviceId, label }) => ({ deviceId, label }));
    setWebcams(webcamDevices);
  }, []);

  const handleWebcamChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    setWebcamDeviceId(event.target.value);

    webcamRef.current.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: event.target.value },
    });
  };

  const handleAudios = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const audioDevices = mediaDevices
      .filter(
        ({ kind, deviceId }) => kind === 'audioinput' && deviceId !== 'default',
      )
      .map(({ deviceId, label }) => ({ deviceId, label }));

    setAudios(audioDevices);
  }, []);

  const handleAudioDeviceChange = async (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setAudioDeviceId(event.target.value);
  };

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
        userName: localStorageUserName,
        roomName: params.name,
        message,
      });
      setMessage('');
    }
  };

  const handleTrack = async (event: any) => {
    if (event.streams[0]) {
      if (event.track.kind === 'video') {
        webrtcWebcamRef.current.srcObject = event.streams[0];
      } else if (event.track.kind === 'audio') {
      }
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
  }, [router]);

  useEffect(() => {
    if (webcams.length === 0 && isPermissionUserMediaVideo) {
      navigator.mediaDevices.enumerateDevices().then(handleWebcams);
    }
  }, [handleWebcams, webcams, isPermissionUserMediaVideo]);

  // 웹캠 초기값
  useEffect(() => {
    if (!webcamDeviceId && webcams && webcams[0]) {
      setWebcamDeviceId(localStorageWebcamDeviceId);
    }
  }, [localStorageWebcamDeviceId, webcamDeviceId, webcams]);

  useEffect(() => {
    let stream: MediaStream;

    if (webrtcStream) {
      webrtcStream
        .getAudioTracks()
        .forEach((track: any) => (track.enabled = !isMuted));
      setWebrtcStream(webrtcStream);
    }

    const getAudioStream = async () => {
      try {
        if (audioDeviceId) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: audioDeviceId,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          analyser.fftSize = 256;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateVolume = () => {
            if (!isMuted) {
              analyser.getByteFrequencyData(dataArray);
              const total = dataArray.reduce((acc, value) => acc + value, 0);
              const average = total / bufferLength;
              volumeRef.current.value = average.toFixed(2);
            }

            requestAnimationFrame(updateVolume);
          };

          updateVolume();
        }
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };
    getAudioStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, [audioDeviceId, isMuted, webrtcStream]);

  useEffect(() => {
    if (audios.length === 0 && isPermissionUserMediaAudio) {
      navigator.mediaDevices.enumerateDevices().then(handleAudios);
    }
  }, [audios, handleAudios, isPermissionUserMediaAudio]);

  // audio 초기값
  useEffect(() => {
    if (!audioDeviceId && audios && audios[0]) {
      setAudioDeviceId(localStorageAudioDeviceId);
    }
  }, [audioDeviceId, audios, localStorageAudioDeviceId]);

  useEffect(() => {
    const handleIce = (data: any) => {
      if (data.candidate) {
        console.log('sent candidate');
        socket.emit('ice', { ice: data.candidate, roomName: params.name });
      }
    };
    if (isDevicesReady && webrtcStream?.active) {
      const makeConnection = async () => {
        if (!myPeerConnections[0]) {
          myPeerConnections[0] = new RTCPeerConnection(servers);
        }
        myPeerConnections[0].addEventListener('icecandidate', handleIce);
        myPeerConnections[0].addEventListener('track', handleTrack);

        webrtcStream
          .getTracks()
          .forEach((track: any) =>
            myPeerConnections[0].addTrack(track, webrtcStream),
          );
      };

      socket.on('userEnterTheRoom', async (data) => {
        if (data.ok) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: MessageType.ENTER, message: `${data.userName} entered.` },
          ]);
          setTotalUsersCount(data.totalUsersCount);

          await makeConnection();

          const offer = await myPeerConnections[0].createOffer();

          await myPeerConnections[0].setLocalDescription(offer);
          console.log('sent the offer');
          socket.emit('offer', {
            offer: myPeerConnections[0].localDescription,
            roomName: params.name,
          });
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('userExitTheRoom', async (data) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: MessageType.EXIT, message: `${data.userName} exited.` },
        ]);
        setTotalUsersCount(data.totalUsersCount);
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

      socket.on('offer', async (data) => {
        if (data.ok) {
          console.log('received the offer');

          await makeConnection();
          await myPeerConnections[0].setRemoteDescription(data.offer);
          const answer = await myPeerConnections[0].createAnswer();
          await myPeerConnections[0].setLocalDescription(answer);
          console.log('sent the answer');
          socket.emit('answer', {
            answer: myPeerConnections[0].localDescription,
            roomName: params.name,
          });
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('answer', async (data) => {
        if (data.ok) {
          console.log('received the answer');
          await myPeerConnections[0].setRemoteDescription(data.answer);
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('ice', async (data) => {
        if (data.ok) {
          console.log('received candidate');
          await myPeerConnections[0].addIceCandidate(data.ice);
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('exitTheRoom', () => {
        router.push(`/device/check`);
      });
      return () => {
        if (myPeerConnections[0]) {
          myPeerConnections[0].close();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDevicesReady,
    localStorageRoomName,
    localStorageUserName,
    myPeerConnections,
    params.name,
    router,
    webrtcStream?.active,
  ]);

  useEffect(() => {
    if (isDevicesReady && webrtcStream?.active && !myPeerConnections[0]) {
      socket.emit('userEnterTheRoom', {
        roomName: localStorageRoomName,
        userName: localStorageUserName,
      });
    }
  }, [
    isDevicesReady,
    localStorageRoomName,
    localStorageUserName,
    myPeerConnections,
    webrtcStream?.active,
  ]);

  useEffect(() => {
    if (webcamDeviceId && audioDeviceId && webcamRef) {
      const getMyStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: webcamDeviceId,
          },
          audio: {
            deviceId: audioDeviceId,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        if (
          webrtcStream &&
          webrtcStream.id !== stream.id &&
          myPeerConnections[0]
        ) {
          const videoTrack = stream.getVideoTracks()[0];

          const videoSender = myPeerConnections[0]
            .getSenders()
            .find((sender: any) => sender.track.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(videoTrack);
          }

          const audioTrack = stream.getAudioTracks()[0];
          audioTrack.enabled = !isMuted;

          const audioSender = myPeerConnections[0]
            .getSenders()
            .find((sender: any) => sender.track.kind === 'audio');
          if (audioSender) {
            audioTrack.enabled = !isMuted;
            await audioSender.replaceTrack(audioTrack);
          }
          webcamRef.current.srcObject = stream;
          return;
        }
        stream.getAudioTracks()[0].enabled = !isMuted;
        setWebrtcStream(stream);

        if (webcamRef.current && !webcamRef.current.srcObject) {
          webcamRef.current.srcObject = stream;
        }
      };
      getMyStream();

      setIsDevicesReady(true);
    }
  }, [
    webcamDeviceId,
    audioDeviceId,
    webcamRef,
    webrtcStream,
    isMuted,
    myPeerConnections,
  ]);

  return (
    <div className="min-h-screen max-h-screen">
      {isPermissionUserMedia && (
        <div className="flex flex-wrap">
          <div className="flex flex-col justify-between min-h-screen w-96 border-x-4 border-t-4">
            <div className="relative h-min">
              {isPermissionUserMediaVideo ? (
                <>
                  {webcams[0]?.deviceId && webcamDeviceId && (
                    <div className="relative">
                      <video
                        className=" h-full"
                        ref={webcamRef}
                        autoPlay={true}
                        playsInline={true}
                        muted={true}
                      />
                      <div className=" absolute bottom-10  px-2 py-1 rounded-xl bg-black text-white ">
                        {localStorageUserName}
                      </div>
                      <button
                        className="absolute bottom-10  right-0  rounded-xl  bg-blue-500 hover:bg-blue-700 text-white  py-1 px-2"
                        onClick={() => {
                          setIsWebcamOff(!isWebcamOff);
                          const tracks =
                            webcamRef.current.srcObject.getTracks();
                          tracks.forEach((track: any) => {
                            track.enabled = !track.enabled;
                          });
                        }}
                      >
                        {isWebcamOff ? 'on' : 'off'}
                      </button>
                      <select
                        className="w-full p-2"
                        onChange={handleWebcamChange}
                        defaultValue={webcamDeviceId}
                      >
                        {webcams.map((device: any, key: number) => (
                          <option key={key} value={device.deviceId}>
                            {device.label || `Device ${key + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {!webcams[0]?.deviceId && (
                    <Alert type="error" message="Webcam access failed." />
                  )}
                </>
              ) : (
                <Alert
                  type="error"
                  message="It looks like your browser is blocking access to webcam identifiers. Because of this, it’s impossible to detect and manage all available webcams."
                />
              )}

              <div className="flex gap-2">
                <>
                  {isPermissionUserMediaAudio ? (
                    <>
                      {audios[0]?.deviceId && audioDeviceId && (
                        <div>
                          <div className="flex gap-2">
                            <meter
                              ref={volumeRef}
                              className="w-full"
                              max="150"
                            />
                            <button onClick={() => setIsMuted(!isMuted)}>
                              {isMuted ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                          <select
                            className="w-full p-2"
                            onChange={handleAudioDeviceChange}
                            defaultValue={audioDeviceId}
                          >
                            {audios.map((audio, key) => (
                              <option key={key} value={audio.deviceId}>
                                {audio.label || `Audio ${key + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {!audios[0]?.deviceId && (
                        <Alert type="error" message="Audio access failed." />
                      )}
                    </>
                  ) : (
                    <Alert
                      type="error"
                      message="It looks like your browser is blocking access to audio identifiers. Because of this, it’s impossible to detect and manage all available audio."
                    />
                  )}
                </>
                <div>
                  <div>speaker</div>
                  <Speaker
                    localStorageSpeakerDeviceId={localStorageSpeakerDeviceId}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-100 border-y-4">
              <span className="p-2 bg-black text-white">
                {localStorageRoomName}
              </span>
              <span>Users Count : {totalUsersCount}</span>
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
                submit
              </button>
            </form>
          </div>
          <video
            className="w-96 h-72"
            ref={webrtcWebcamRef}
            autoPlay={true}
            playsInline={true}
          />
        </div>
      )}
    </div>
  );
}
