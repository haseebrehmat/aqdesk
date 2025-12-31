import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioPlayerContext } from './audioPlayer';

// One <audio> element for the whole app so playback continues across navigation.
export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => Number.isFinite(audio.duration) && setDuration(audio.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
    };
  }, []);

  const play = useCallback((next) => {
    const audio = audioRef.current;
    if (!audio || !next?.src) return;
    if (track?.id === next.id) {
      audio.play().catch(() => {});
      return;
    }
    audio.src = next.src;
    setTrack(next);
    setCurrentTime(0);
    setDuration(next.durationSeconds || 0);
    audio.play().catch(() => {});
  }, [track]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  }, [track]);

  const seek = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, seconds), audio.duration || seconds);
    setCurrentTime(audio.currentTime);
  }, []);

  const skip = useCallback((delta) => seek((audioRef.current?.currentTime || 0) + delta), [seek]);

  const close = useCallback(() => {
    const audio = audioRef.current;
    audio?.pause();
    if (audio) audio.removeAttribute('src');
    setTrack(null);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const value = useMemo(
    () => ({ track, playing, currentTime, duration, play, toggle, seek, skip, close }),
    [track, playing, currentTime, duration, play, toggle, seek, skip, close],
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}
