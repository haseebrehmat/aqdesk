import { Button } from 'reshaped';
import { Pause, PlayArrow } from './icons';
import { useAudioPlayer } from '../context/audioPlayer';
import { podcastTrack } from '../utils/podcast';

export default function PodcastPlayButton({ podcast, size }) {
  const { track, playing, play, toggle } = useAudioPlayer();
  if (!podcast.audio_url && !podcast.media_url) return null;
  const active = track?.id === podcast.id;
  const isPlaying = active && playing;

  return (
    <Button
      color="primary"
      size={size}
      icon={isPlaying ? Pause : PlayArrow}
      onClick={() => (active ? toggle() : play(podcastTrack(podcast)))}
    >
      {isPlaying ? 'Pause' : 'Listen'}
    </Button>
  );
}
