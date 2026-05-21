export function getEnv(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}

export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  const num = value !== undefined ? parseInt(value, 10) : undefined;
  return isNaN(num) ? defaultValue : num;
}

export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}