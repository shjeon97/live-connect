const nextFetch = async (url: string, options?: RequestInit) => {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_APP_HOST}/${url}`,
    options,
  );
  return result;
};

export const createSocketIo = async (
  roomName: string,
  userName: string,
  clientId: string,
) => {
  const result = await nextFetch('socket-io', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roomName, userName, clientId }),
  });
  return result;
};

export const deleteSocketIo = async (clientId: string) => {
  const result = await nextFetch('socket-io', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clientId }),
  });
  return result;
};
