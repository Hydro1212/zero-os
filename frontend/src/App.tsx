import Desktop from './components/Desktop';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <>
      <Desktop />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: 'oklch(0.1 0.015 260)',
            border: '1px solid oklch(0.85 0.18 195 / 0.4)',
            color: 'oklch(0.85 0.18 195)',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.8rem',
          },
        }}
      />
    </>
  );
}
