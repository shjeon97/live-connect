import { useEffect } from 'react';

const usePreventRefresh = () => {
  // 1. custom hook으로 사용할 함수를 하나 생성한다.
  const preventClose = (e: {
    preventDefault: () => void;
    returnValue: string;
  }) => {
    // 2. 해당 함수 안에 새로운 함수를 생성하는데, 이때 이 함수는 자바스크립트의 이벤트를 감지하게된다.
    e.preventDefault();
    // 2-1. 특정 이벤트에 대한 사용자 에이전트 (브라우저)의 기본 동작이 실행되지 않도록 막는다.
    e.returnValue = '';
  };

  // 브라우저에 렌더링 시 한 번만 실행하는 코드
  useEffect(() => {
    (() => {
      window.addEventListener('beforeunload', preventClose);
      // 4. beforeunload 이벤트는 리소스가 사라지기 전 window 자체에서 발행한다.
      // 4-2. window의 이벤트를 감지하여 beforunload 이벤트 발생 시 preventClose 함수가 실행된다.
    })();

    return () => {
      window.removeEventListener('beforeunload', preventClose);
      // 5. 해당 이벤트 실행 후, beforeunload를 감지하는 것을 제거한다.
    };
  });
};

export default usePreventRefresh;
