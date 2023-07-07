import './globals.css';
import { Inter } from 'next/font/google';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'live connect',
  description: '실시간 화상, 채팅 구현 사이트',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kr">
      <Script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js" />
      <Script id="vconsole"> {`var vConsole = new window.VConsole()`}</Script>
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
