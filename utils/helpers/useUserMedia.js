'use client'
import { useEffect, useRef, useState } from 'react';

export function useUserMedia(options = { audio: true, video: true }) {
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getMedia = async () => {
      try {
        setIsLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia(options);
        if (isMounted) {
          streamRef.current = stream;
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getMedia();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [options.audio, options.video]);

  return {
    stream: streamRef.current,
    error,
    isLoading,
  };
}
