import { useEffect } from 'react';
import { Button, Text, View } from 'reshaped';
import { Close, Forward10, Pause, PlayArrow, Replay10 } from './icons';
import { useAudioPlayer } from '../context/audioPlayer';
import { formatDuration } from '../utils/format';

// Persistent player pinned to the bottom of every page once an episode is started.
export default function AudioPlayerBar() {
  const { track, playing, currentTime, duration, toggle, seek, skip, close } = useAudioPlayer();

  // Keep page content from being hidden behind the bar.
  useEffect(() => {
    document.body.style.paddingBottom = track ? '88px' : '';
    return () => { document.body.style.paddingBottom = ''; };
  }, [track]);

  if (!track) return null;

  return (
    <View
      as="section"
      attributes={{
        'aria-label': 'Audio player',
        style: {
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'var(--rs-color-background-elevation-raised)',
          borderTop: '1px solid var(--rs-color-border-neutral)',
        },
      }}
    >
      <View direction="row" align="center" gap={{ s: 2, m: 5 }} padding={{ s: 2, m: 3 }} attributes={{ style: { maxWidth: 1200, width: '100%', margin: '0 auto' } }}>
        <View gap={0.5} width={{ s: '30%', m: '28%' }} attributes={{ style: { minWidth: 0 } }}>
          <Text variant="body-2" weight="bold" maxLines={1}>{track.title}</Text>
          <Text variant="caption-1" color="neutral-faded" maxLines={1}>{track.subtitle}</Text>
        </View>

        <View direction="row" align="center" gap={1} shrink={false}>
          <Button variant="ghost" icon={Replay10} onClick={() => skip(-10)} attributes={{ 'aria-label': 'Back 10 seconds' }} />
          <Button color="primary" icon={playing ? Pause : PlayArrow} onClick={toggle} attributes={{ 'aria-label': playing ? 'Pause' : 'Play' }} />
          <Button variant="ghost" icon={Forward10} onClick={() => skip(10)} attributes={{ 'aria-label': 'Forward 10 seconds' }} />
        </View>

        <View direction="row" align="center" gap={2} grow attributes={{ style: { minWidth: 0 } }}>
          <Text variant="caption-1" attributes={{ style: { fontVariantNumeric: 'tabular-nums', minWidth: 40 } }}>{formatDuration(currentTime)}</Text>
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.floor(duration))}
            step={1}
            value={Math.min(Math.floor(currentTime), Math.floor(duration) || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            aria-valuetext={`${formatDuration(currentTime)} of ${formatDuration(duration)}`}
            style={{ flex: 1, minWidth: 0, accentColor: 'var(--rs-color-foreground-neutral)' }}
          />
          <Text variant="caption-1" color="neutral-faded" attributes={{ style: { fontVariantNumeric: 'tabular-nums', minWidth: 40 } }}>{formatDuration(duration)}</Text>
        </View>

        <Button variant="ghost" icon={Close} onClick={close} attributes={{ 'aria-label': 'Close player' }} />
      </View>
    </View>
  );
}
