export function buildProgressBar(current: number, total: number, length = 12): string {
  if (total === 0) return '░'.repeat(length);
  const filled = Math.min(Math.round((current / total) * length), length);
  return '█'.repeat(filled) + '░'.repeat(length - filled);
}
