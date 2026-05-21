function generateCode(kabupaten: string): string {
  const prefix = kabupaten
    .replace(/^(KABUPATEN|KOTA)\s+/i, '')
    .substring(0, 3)
    .toUpperCase();
  const timestamp = Date.now().toString().slice(-8);
  return `NU-${prefix}-${timestamp}`;
}

export default generateCode;
