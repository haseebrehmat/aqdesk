export const MAX_RESUME_MB = 2;
export const MAX_AUDIO_MB = 100;

// Returns an error message, or null when the file is acceptable.
export function validateUpload(file, { extension, maxMb, label }) {
  if (!file) return null;
  if (!file.name.toLowerCase().endsWith(`.${extension}`)) return `${label} must be a .${extension} file.`;
  if (file.size > maxMb * 1024 * 1024) {
    return `${label} is ${(file.size / 1024 / 1024).toFixed(1)} MB, which is over the ${maxMb} MB limit.`;
  }
  return null;
}
