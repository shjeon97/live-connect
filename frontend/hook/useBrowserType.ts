import { useEffect, useState } from 'react';

export enum BrowserType {
  Opera = 'Opera',
  Firefox = 'Firefox',
  Safari = 'Safari',
  Chrome = 'Chrome',
  Unknown = 'Unknown',
}

const useBrowserType = (): BrowserType => {
  const [browserType, setBrowserType] = useState<BrowserType>(
    BrowserType.Unknown,
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      if ((window as any).chrome) {
        setBrowserType(BrowserType.Chrome);
      } else if (
        userAgent.indexOf(' OPR/') >= 0 ||
        Boolean((window as any).opr && (window as any).opr.addons)
      ) {
        setBrowserType(BrowserType.Opera);
      } else if (userAgent.toLowerCase().indexOf('firefox') > -1) {
        setBrowserType(BrowserType.Firefox);
      } else if (/^((?!chrome|android).)*safari/i.test(userAgent)) {
        setBrowserType(BrowserType.Safari);
      } else {
        setBrowserType(BrowserType.Unknown);
      }
    }
  }, []);

  return browserType;
};

export default useBrowserType;
