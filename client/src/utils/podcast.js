export function podcastTrack(podcast) {
  return {
    id: podcast.id,
    src: podcast.audio_url || podcast.media_url,
    title: podcast.title,
    subtitle: podcast.expert?.name ? `Host: ${podcast.expert.name}` : 'AQDesk Podcast',
    durationSeconds: podcast.duration_in_seconds || (podcast.duration_in_minutes ? podcast.duration_in_minutes * 60 : 0),
  };
}
