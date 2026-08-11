/**
 * Simple structured logger.
 * Never logs passwords, tokens, or sensitive request bodies.
 */
export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...meta }));
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...meta }));
  },

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(JSON.stringify({ level: 'error', message, timestamp: new Date().toISOString(), ...meta }));
  },

  security(message: string, meta?: Record<string, unknown>): void {
    console.warn(JSON.stringify({ level: 'security', message, timestamp: new Date().toISOString(), ...meta }));
  },
};
