function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export function log(...args: unknown[]): void {
  console.log(`[${timestamp()}] [INFO]`, ...args);
}

export function warn(...args: unknown[]): void {
  console.warn(`[${timestamp()}] [WARN]`, ...args);
}

export function error(...args: unknown[]): void {
  console.error(`[${timestamp()}] [ERROR]`, ...args);
}
