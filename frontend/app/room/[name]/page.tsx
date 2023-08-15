// 'use client';

// import { socket } from '@/api/socket-io';
// import Audio from '@/components/Audio';
// import ReactWebcam from '@/components/ReactWebcam';
// import Speaker from '@/components/Speaker';
// import useCheckUserMedia from '@/hook/useCheckUserMedia';
// import { useRouter } from 'next/navigation';
// import { useEffect, useRef, useState } from 'react';
// import Swal from 'sweetalert2';

// enum MessageType {
//   MESSAGE = 'MESSAGE',
//   ENTER = 'ENTER',
//   EXIT = 'EXIT',
// }
// interface Messages {
//   type: MessageType;
//   message: string;
//   userName?: string;
// }

// const servers = {
//   iceServers: [
//     {
//       urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
//     },
//   ],
// };

// export default function Page({ params }: { params: { name: string } }) {
//   const [userName] = useState(localStorage?.getItem('userName'));
//   const [messages, setMessages] = useState<Messages[]>([]);
//   const [message, setMessage] = useState<string>('');
//   const [totalUsersCount, setTotalUsersCount] = useState(0);
//   const [webcam, setWebcam] = useState<any>(null);
//   const [audio, setAudio] = useState<any>(null);
//   const [myStream, setMyStream] = useState<any>(null);
//   const [isDevicesReady, setIsDevicesReady] = useState(false);
//   const [webrtcStream, setWebrtcStream] = useState<MediaStream>(
//     new MediaStream(),
//   );
//   const router = useRouter();
//   const isPermissionUserMedia = useCheckUserMedia('both');
//   const webrtcWebcamRef = useRef<any>(null);
//   const webcamRef = useRef<any>(null);

//   const getWebcam = (webcam: any) => {
//     setWebcam(webcam);
//   };

//   const getAudio = (audio: any) => {
//     setAudio(audio);
//   };

//   const handleMessageChange = (
//     event: React.ChangeEvent<HTMLTextAreaElement>,
//   ) => {
//     setMessage(event.target.value);
//   };

//   const renderRoomMessage = (
//     index: number,
//     type: MessageType,
//     message: string,
//     userName?: string,
//   ) => {
//     switch (type) {
//       case MessageType.ENTER:
//         return (
//           <div key={index}>
//             <span className="">{message}</span>
//           </div>
//         );

//       case MessageType.EXIT:
//         return (
//           <div key={index}>
//             <span className="">{message}</span>
//           </div>
//         );

//       case MessageType.MESSAGE:
//         return (
//           <div key={index} className="">
//             <div>{userName} </div>
//             <textarea className="max-w-xs" defaultValue={message} />
//           </div>
//         );
//     }
//   };

//   const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (socket && message) {
//       socket.emit('sendRoomMessage', {
//         userName,
//         roomName: params.name,
//         message,
//       });
//       setMessage('');
//     }
//   };

//   const handleIce = (data: any) => {
//     if (data.candidate) {
//       console.log('sent candidate');
//       socket.emit('ice', { ice: data.candidate, roomName: params.name });
//     }
//   };

//   const handleTrackEvent = async (event: any) => {
//     if (event.streams[0]) {
//       console.log(event.streams[0]);
//       if (event.streams[0].kind === 'video') {
//         //사용자 영상 출력
//         webrtcWebcamRef.current.srcObject = event.streams[0];
//       }
//     }
//   };

//   useEffect(() => {
//     if (
//       !localStorage.getItem('userName') ||
//       !localStorage.getItem('roomName')
//     ) {
//       router.push(`/`);
//     } else {
//       socket.emit('findSocketIo');
//     }
//   }, []);

//   useEffect(() => {
//     if (isDevicesReady && myStream) {
//       let myPeerConnection: RTCPeerConnection;

//       const makeConnection = async () => {
//         myPeerConnection = new RTCPeerConnection(servers);
//         myPeerConnection.addEventListener('icecandidate', handleIce);
//         myPeerConnection.addEventListener('track', handleTrackEvent);

//         myStream
//           .getTracks()
//           .forEach((track: any) => myPeerConnection.addTrack(track, myStream));
//       };

//       socket.on('userEnterTheRoom', async (data) => {
//         if (data.ok) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { type: MessageType.ENTER, message: `${data.userName} entered.` },
//           ]);
//           setTotalUsersCount(data.totalUsersCount);

//           await makeConnection();

//           const offer = await myPeerConnection.createOffer();

//           await myPeerConnection.setLocalDescription(offer);
//           console.log('sent the offer');
//           socket.emit('offer', {
//             offer: myPeerConnection.localDescription,
//             roomName: params.name,
//           });
//         } else if (data.error) {
//           await Swal.fire('error', data.error);
//         }
//       });

//       socket.on('userExitTheRoom', async (data) => {
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { type: MessageType.EXIT, message: `${data.userName} exited.` },
//         ]);
//         setTotalUsersCount(data.totalUsersCount);
//       });

//       socket.on('sendRoomMessage', async (data) => {
//         if (data.ok) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             {
//               type: MessageType.MESSAGE,
//               userName: data.userName,
//               message: data.message,
//             },
//           ]);
//         } else if (data.error) {
//           await Swal.fire('error', data.error);
//         }
//       });

//       socket.on('offer', async (data) => {
//         if (data.ok) {
//           console.log('received the offer');
//           // myPeerConnection = new RTCPeerConnection(servers);
//           await makeConnection();
//           myPeerConnection.setRemoteDescription(data.offer);
//           const answer = await myPeerConnection.createAnswer();
//           await myPeerConnection.setLocalDescription(answer);
//           console.log('sent the answer');
//           socket.emit('answer', {
//             answer: myPeerConnection.localDescription,
//             roomName: params.name,
//           });
//         } else if (data.error) {
//           await Swal.fire('error', data.error);
//         }
//       });

//       socket.on('answer', async (data) => {
//         if (data.ok) {
//           console.log('received the answer');

//           myPeerConnection.setRemoteDescription(data.answer);
//         } else if (data.error) {
//           await Swal.fire('error', data.error);
//         }
//       });

//       socket.on('ice', async (data) => {
//         if (data.ok) {
//           console.log('received candidate');
//           myPeerConnection.addIceCandidate(data.ice);
//         } else if (data.error) {
//           await Swal.fire('error', data.error);
//         }
//       });

//       socket.on('exitTheRoom', () => {
//         router.push(`/device/check`);
//       });
//       return () => {
//         if (myPeerConnection) {
//           myPeerConnection.close();
//         }
//       };
//     }
//   }, [isDevicesReady, myStream]);

//   useEffect(() => {
//     if (webcam && audio && webcamRef) {
//       setIsDevicesReady(true);
//       const getMyStream = async () => {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             deviceId: webcam.getSettings().deviceId,
//           },
//           audio: {
//             deviceId: audio.getSettings().deviceId,
//           },
//         });

//         setMyStream(stream);
//         if (webcamRef.current && !webcamRef.current.srcObject) {
//           webcamRef.current.srcObject = stream;
//         }
//       };
//       getMyStream();
//     }
//   }, [webcam, audio, webcamRef]);

//   return (
//     <div className="min-h-screen max-h-screen">
//       {isPermissionUserMedia && (
//         <div className="flex flex-wrap">
//           <div className="flex flex-col justify-between min-h-screen w-96 border-x-4 border-t-4">
//             <div className="relative h-min">
//               <div className="hidden">
//                 <ReactWebcam getWebcam={getWebcam} />
//               </div>
//               <video
//                 ref={webcamRef}
//                 autoPlay={true}
//                 playsInline={true}
//                 muted={true}
//               />
//               <div className=" absolute bottom-16  px-2 py-1 bg-black text-white ">
//                 {userName}
//               </div>
//               <div className="flex gap-2">
//                 <Audio getAudio={getAudio} />
//                 <div>
//                   <div>speaker</div>
//                   <Speaker />
//                 </div>
//               </div>
//             </div>
//             <div className="flex justify-between items-center p-2 bg-slate-100 border-y-4">
//               <span className="p-2 bg-black text-white">{params.name}</span>
//               <span>Users Count : {totalUsersCount}</span>
//               <span>chat</span>
//               <div className="bg-black"></div>
//             </div>
//             <div className="grow bg-slate-50 ">
//               <div className="w-full max-w-md p-4 border rounded">
//                 {messages.map((data, index) =>
//                   renderRoomMessage(
//                     index,
//                     data.type,
//                     data.message,
//                     data.userName,
//                   ),
//                 )}
//               </div>
//             </div>
//             <form onSubmit={handleSendMessage} className="flex flex-col h-min">
//               <textarea
//                 className="w-full p-2 border rounded resize-none"
//                 rows={5}
//                 value={message}
//                 onChange={handleMessageChange}
//               />
//               <button
//                 type="submit"
//                 className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mb-1"
//               >
//                 submit
//               </button>
//             </form>
//           </div>
//           <div className="w-96">
//             <video ref={webrtcWebcamRef} autoPlay={true} playsInline={true} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { socket } from '@/api/socket-io';
import Audio from '@/components/Audio';
import ReactWebcam from '@/components/ReactWebcam';
import Speaker from '@/components/Speaker';
import useCheckUserMedia from '@/hook/useCheckUserMedia';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
  const [userName] = useState(localStorage?.getItem('userName'));
  const [messages, setMessages] = useState<Messages[]>([]);
  const [message, setMessage] = useState<string>('');
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [webcam, setWebcam] = useState<any>(null);
  const [audio, setAudio] = useState<any>(null);
  const [myStream, setMyStream] = useState<any>(null);
  const [isDevicesReady, setIsDevicesReady] = useState(false);
  const [webrtcStream, setWebrtcStream] = useState<string | null>(null);
  const router = useRouter();
  const isPermissionUserMedia = useCheckUserMedia('both');
  const webrtcWebcamRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);

  const getWebcam = (webcam: any) => {
    setWebcam(webcam);
  };

  const getAudio = (audio: any) => {
    setAudio(audio);
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
        userName,
        roomName: params.name,
        message,
      });
      setMessage('');
    }
  };

  const handleIce = (data: any) => {
    if (data.candidate) {
      console.log('sent candidate');
      socket.emit('ice', { ice: data.candidate, roomName: params.name });
    }
  };

  const handleTrackEvent = async (data: any) => {
    console.log(data.streams[0]);

    if (data.streams[0]) {
      console.log(data.streams[0].getVideoTracks());
      webrtcWebcamRef.current.srcObject = data.streams[0];
      setWebrtcStream(data.streams[0]);
    }

    console.log(webcamRef);
    console.log(webrtcWebcamRef);
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
    if (isDevicesReady && myStream) {
      //let myPeerConnection = new RTCPeerConnection();
      let myPeerConnection: RTCPeerConnection;
      const makeConnection = async () => {
        //myPeerConnection = new RTCPeerConnection();
        //내가 상대방에게 접속
        myPeerConnection = new RTCPeerConnection({
          iceServers: [
            {
              urls: 'stun:stun.l.google.com:19302',
            },
          ],
        });
        // myPeerConnection.addEventListener('icecandidate', handleIce);
        // myPeerConnection.addEventListener('track', handleTrackEvent);

        //내 영상 추가
        myStream
          .getTracks()
          .forEach((track: any) => myPeerConnection.addTrack(track, myStream));

        myPeerConnection.onicecandidate = (event: any) => {
          if (event.candidate) {
            socket.emit('ice', { ice: event.candidate, roomName: params.name });
            // socket.emit("candidate", MY_PEER_ID, peerSocketId, event.candidate);
            console.log('candidate 전송');
          }
        };
      };

      socket.on('userEnterTheRoom', async (data: any) => {
        if (data.ok) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: MessageType.ENTER, message: `${data.userName} entered.` },
          ]);

          //상대방 소켓ID전송
          await makeConnection();

          setTotalUsersCount(data.totalUsersCount);

          // const sdp = await myPeerConnection.createOffer();

          // myPeerConnection.setLocalDescription(sdp);
          // console.log('sent the offer');
          // console.log(myPeerConnection.localDescription)
          // // socket.emit('offer', { offer, roomName: params.name });
          // socket.emit('offer', { offer: myPeerConnection.localDescription, roomName: params.name });

          //내 영상전송 및 상대방 영상전송 요청
          myPeerConnection
            .createOffer()
            .then((sdp) => myPeerConnection.setLocalDescription(sdp))
            .then(() => {
              socket.emit('offer', {
                offer: myPeerConnection.localDescription,
                roomName: params.name,
              });
              console.log('offer 전송');
            });
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('userExitTheRoom', async (data: any) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: MessageType.EXIT, message: `${data.userName} exited.` },
        ]);
        setTotalUsersCount(data.totalUsersCount);
      });

      socket.on('sendRoomMessage', async (data: any) => {
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

      socket.on('offer', async (data: any) => {
        if (data.ok) {
          console.log('received the offer');
          //myPeerConnection = new RTCPeerConnection();
          myPeerConnection = new RTCPeerConnection({
            iceServers: [
              {
                urls: 'stun:stun.l.google.com:19302',
              },
            ],
          });

          // await makeConnection();

          //내 영상 추가
          myStream
            .getTracks()
            .forEach((track: any) =>
              myPeerConnection.addTrack(track, myStream),
            );

          // myPeerConnection.setRemoteDescription(data.offer);

          // const answer = await myPeerConnection.createAnswer();
          // myPeerConnection.setLocalDescription(answer);
          // console.log('sent the answer');
          // socket.emit('answer', { answer: answer, roomName: params.name });

          myPeerConnection
            .setRemoteDescription(data.offer)
            .then(() => myPeerConnection.createAnswer())
            .then((sdp) => myPeerConnection.setLocalDescription(sdp))
            .then(() => {
              socket.emit('answer', {
                answer: myPeerConnection.localDescription,
                roomName: params.name,
              });
              console.log('영상 답장');
            });

          myPeerConnection.ontrack = (event: any) => {
            const stream = event.streams[0];
            console.log('영상수신', stream);

            if (stream) {
              if (event.track.kind === 'video') {
                //사용자 영상 출력
                webrtcWebcamRef.current.srcObject = stream;
              } else {
                // //사용자 사운드 믹서
                // const soundMeter = conPeerElement.querySelector(".sound-bar");
                // // const audioContext = new AudioContext();
                // arrAudioContext[peerId] = new AudioContext();
                // startVideoSoundMeter(stream, arrAudioContext[peerId], soundMeter);
                // arrAudioContext[peerId].resume();
              }
            }
          };

          myPeerConnection.onicecandidate = (event: any) => {
            if (event.candidate) {
              // socket.emit("candidate", MY_PEER_ID, socketId, event.candidate);
              socket.emit('ice', {
                ice: event.candidate,
                roomName: params.name,
              });
            }
          };
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('answer', async (data: any) => {
        if (data.ok) {
          console.log('received the answer', data.answer);

          myPeerConnection.setRemoteDescription(data.answer);

          myPeerConnection.ontrack = (event: any) => {
            const stream = event.streams[0];

            console.log('Answer 영상수신', stream);
            if (stream) {
              if (event.track.kind === 'video') {
                //사용자 영상 출력
                webrtcWebcamRef.current.srcObject = stream;
              } else {
                // //사용자 사운드 믹서
                // const soundMeter = conPeerElement.querySelector(".sound-bar");
                // arrAudioContext[peerId] = new AudioContext();
                // startVideoSoundMeter(stream, arrAudioContext[peerId], soundMeter);
                // arrAudioContext[peerId].resume();
              }
            }
          };
        } else if (data.error) {
          await Swal.fire('error', data.error);
        }
      });

      socket.on('ice', (data: any) => {
        console.log('received candidate', data);
        // myPeerConnection.addIceCandidate(ice);
        myPeerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
      });

      socket.on('exitTheRoom', () => {
        router.push(`/device/check`);
      });
      return () => {
        myPeerConnection.close();
      };
    }
  }, [isDevicesReady, myStream]);

  useEffect(() => {
    if (webcam && audio && webcamRef) {
      console.log(webcam, audio, webcamRef);

      setIsDevicesReady(true);
      const getMyStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: webcam.getSettings().deviceId,
          },
          audio: {
            deviceId: audio.getSettings().deviceId,
          },
        });

        setMyStream(stream);
        if (webcamRef.current && !webcamRef.current.srcObject) {
          webcamRef.current.srcObject = stream;
        }
      };
      getMyStream();
    }
  }, [webcam, audio, webcamRef]);

  return (
    <div className="min-h-screen max-h-screen">
      {isPermissionUserMedia && (
        <div className="flex flex-wrap">
          <div className="flex flex-col justify-between min-h-screen w-96 border-x-4 border-t-4">
            <div className="relative h-min">
              <div className="hidden">
                <ReactWebcam getWebcam={getWebcam} />
              </div>
              <video
                ref={webcamRef}
                autoPlay={true}
                playsInline={true}
                muted={true}
              />

              <div className=" absolute bottom-28 left-3 px-2 py-1 bg-black text-white ">
                {userName}
              </div>
              <div className="flex gap-2">
                <Audio getAudio={getAudio} />
                <div>
                  <div>speaker</div>
                  <Speaker />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-100 border-y-4">
              <span className="p-2 bg-black text-white">{params.name}</span>
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
          <div className="w-96">
            <video ref={webrtcWebcamRef} autoPlay={true} playsInline={true} />
          </div>
        </div>
      )}
    </div>
  );
}
