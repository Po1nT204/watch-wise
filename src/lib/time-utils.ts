export const parseTimestamp = (ts: string): number => {
  const cleanTs = ts.replace(/[\[\]]/g, '');
  if (cleanTs.endsWith('s')) {
    return parseInt(cleanTs.replace('s', ''), 10);
  }
  const parts = cleanTs.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
};

export const formatDisplayTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `[${m}:${s.toString().padStart(2, '0')}]`;
};
