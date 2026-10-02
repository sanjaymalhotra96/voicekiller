import { useCallback, useEffect, useState } from 'react';

// Counts down once per second from `seconds`; `restart()` starts it again.
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  // Bumped by restart() to start a fresh interval.
  const [run, setRun] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(current => {
        if (current <= 1) {
          clearInterval(id);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [run]);

  const restart = useCallback(() => {
    setRemaining(seconds);
    setRun(n => n + 1);
  }, [seconds]);

  return { remaining, done: remaining <= 0, restart };
}
