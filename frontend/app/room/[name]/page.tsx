'use client';

import { socket } from '@/api/socket-io';
import Alert from '@/components/Alert';
import Speaker from '@/components/Speaker';
import WebrctDevice from '@/components/WebrtcDevice';
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

interface WebrtcDevice {
  socketId: string;
  stream: MediaStream;
  webcam: boolean;
  audio: boolean;
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

  const myPeerConnections: RTCPeerConnection[] = useMemo(() => [], []);
  const [socketIds, setSocketIds] = useState<string[]>([]);

  const volumeRef = useRef<any>(null);
  const [audios, setAudios] = useState<Device[]>([]);
  const [audioDeviceId, setAudioDeviceId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const isPermissionUserMediaAudio = useCheckUserMedia('audio');

  const isPermissionUserMedia = useCheckUserMedia('both');
  const router = useRouter();
  const webrtcWebcamRef = useRef<any>();
  const [webrtcDevices, setWebrtcDevices] = useState<WebrtcDevice[]>([]);

  const webrtcVolumeRef = useRef<any>();

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
    let peerConnectionSocketId: string;
    const handleIce = (data: any) => {
      if (data.candidate && peerConnectionSocketId) {
        // console.log('sent candidate');
        socket.emit('ice', {
          ice: data.candidate,
          roomName: params.name,
          socketId: peerConnectionSocketId,
        });
      }
    };
    const handleTrack = async (event: any) => {
      if (event.streams[0]) {
        if (event.track.kind === 'video') {
          // webrtcWebcamRef.current.srcObject = event.streams[0];

          const updateWebrtcDevice = webrtcDevices.find(
            (webrtcDevice) => webrtcDevice.socketId === peerConnectionSocketId,
          );
          if (updateWebrtcDevice) {
            updateWebrtcDevice.webcam = true;
          } else {
            webrtcDevices.push({
              socketId: peerConnectionSocketId,
              stream: event.streams[0],
              webcam: true,
              audio: false,
            });
          }

          setWebrtcDevices(webrtcDevices);
        } else if (event.track.kind === 'audio') {
          const updateWebrtcDevice = webrtcDevices.find(
            (webrtcDevice) => webrtcDevice.socketId === peerConnectionSocketId,
          );
          if (updateWebrtcDevice) {
            updateWebrtcDevice.audio = true;
          } else {
            webrtcDevices.push({
              socketId: peerConnectionSocketId,
              stream: event.streams[0],
              webcam: false,
              audio: true,
            });
          }

          setWebrtcDevices(webrtcDevices);

          // const audioContext = new AudioContext();
          // const analyser = audioContext.createAnalyser();
          // const source = audioContext.createMediaStreamSource(event.streams[0]);
          // source.connect(analyser);
          // analyser.fftSize = 256;
          // const bufferLength = analyser.frequencyBinCount;
          // const dataArray = new Uint8Array(bufferLength);
          // const updateVolume = () => {
          //   analyser.getByteFrequencyData(dataArray);
          //   const total = dataArray.reduce((acc, value) => acc + value, 0);
          //   const average = total / bufferLength;
          //   webrtcVolumeRef.current.value = average.toFixed(2);
          //   requestAnimationFrame(updateVolume);
          // };
          // updateVolume();
        }
      }
    };

    if (isDevicesReady && webrtcStream?.active) {
      const makeConnection = async (socketId: any) => {
        setSocketIds([socketId, ...socketIds]);
        peerConnectionSocketId = socketId;

        if (!myPeerConnections[socketId]) {
          myPeerConnections[socketId] = new RTCPeerConnection(servers);
        }
        myPeerConnections[socketId].addEventListener('icecandidate', handleIce);
        myPeerConnections[socketId].addEventListener('track', handleTrack);

        webrtcStream
          .getTracks()
          .forEach((track: any) =>
            myPeerConnections[socketId].addTrack(track, webrtcStream),
          );
      };

      socket.on('userEnterTheRoom', async (data) => {
        if (data.ok && data.socketId && data.userName) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: MessageType.ENTER, message: `${data.userName} entered.` },
          ]);
          setTotalUsersCount(data.totalUsersCount);

          await makeConnection(data.socketId);

          const offer = await myPeerConnections[data.socketId].createOffer();

          await myPeerConnections[data.socketId].setLocalDescription(offer);
          // console.log('sent the offer');
          socket.emit('offer', {
            offer: myPeerConnections[data.socketId].localDescription,
            roomName: params.name,
            socketId: data.socketId,
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
        myPeerConnections[data.socketId].close();
        myPeerConnections.filter(
          (myPeerConnection) =>
            myPeerConnection === myPeerConnections[data.socketId],
        );

        setWebrtcDevices(
          webrtcDevices.filter(
            (webrtcWebcam) => webrtcWebcam.socketId !== data.socketId,
          ),
        );
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
        if (data.ok && data.socketId) {
          // console.log('received the offer');

          await makeConnection(data.socketId);
          await myPeerConnections[data.socketId].setRemoteDescription(
            data.offer,
          );
          const answer = await myPeerConnections[data.socketId].createAnswer();
          await myPeerConnections[data.socketId].setLocalDescription(answer);
          // console.log('sent the answer');
          socket.emit('answer', {
            answer: myPeerConnections[data.socketId].localDescription,
            roomName: params.name,
            socketId: data.socketId,
          });
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('answer', async (data) => {
        if (data.ok && data.socketId) {
          // console.log('received the answer');
          setTimeout(() => {
            setTotalUsersCount(data.totalUsersCount - 1);
            setTimeout(() => {
              setTotalUsersCount(data.totalUsersCount);
            }, 1);
          }, 1);
          if (!myPeerConnections[data.socketId].remoteDescription) {
            await myPeerConnections[data.socketId].setRemoteDescription(
              data.answer,
            );
          }
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('ice', async (data) => {
        if (data.ok && data.socketId && data.totalUsersCount) {
          setTotalUsersCount(data.totalUsersCount);
          // console.log('received candidate');

          setTimeout(() => {
            setTotalUsersCount(data.totalUsersCount - 1);
            setTimeout(() => {
              setTotalUsersCount(data.totalUsersCount);
            }, 1);
          }, 1);

          await myPeerConnections[data.socketId].addIceCandidate(data.ice);
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('exitTheRoom', () => {
        router.push(`/device/check`);
      });
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
    if (webcamDeviceId && audioDeviceId) {
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

        if (webrtcStream && webrtcStream.id !== stream.id && webrtcWebcamRef) {
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];
          audioTrack.enabled = !isMuted;

          socketIds.map(async (socketId: any) => {
            const videoSender = myPeerConnections[socketId]
              .getSenders()
              .find((sender: any) => sender.track.kind === 'video');
            if (videoSender) {
              await videoSender.replaceTrack(videoTrack);
            }

            const audioSender = myPeerConnections[socketId]
              .getSenders()
              .find((sender: any) => sender.track.kind === 'audio');
            if (audioSender) {
              audioTrack.enabled = !isMuted;

              await audioSender.replaceTrack(audioTrack);
            }
          });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamDeviceId, audioDeviceId, webcamRef, isMuted, myPeerConnections]);

  return (
    <div className="flex lg:flex-nowrap flex-wrap">
      <div className="min-h-screen  w-96">
        {isPermissionUserMedia && (
          <div className="flex flex-wrap">
            <div className="flex flex-col justify-between min-h-screen w-96 border-x-4 border-t-4">
              <div className="relative h-min">
                {isPermissionUserMediaVideo ? (
                  <>
                    {webcams[0]?.deviceId && webcamDeviceId && (
                      <div className="relative">
                        <video
                          className="h-76"
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
                              webcamRef.current.srcObject.getVideoTracks();
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
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col h-min"
              >
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

            {/* <div className="w-96 ">
            <video
              className="h-72"
              ref={webrtcWebcamRef}
              autoPlay={true}
              playsInline={true}
            />
            <div className="w-96">
              <meter ref={webrtcVolumeRef} className="w-full" max="150" />
            </div>
          </div> */}
          </div>
        )}
      </div>
      <span className="flex flex-wrap">
        {webrtcDevices.map((webrtcWebcam, index) => {
          return (
            <WebrctDevice key={index} webcamStream={webrtcWebcam.stream} />
          );
        })}
      </span>
    </div>
  );
}
