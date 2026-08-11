import app from './app';
import { config, validateConfig } from './config';
import { logger } from './utils/logger';

// Validate critical environment config
validateConfig();

const server = app.listen(config.port, () => {
  logger.info(`🚀 XYZ ERP Server running`, {
    port: config.port,
    environment: config.nodeEnv,
    cors: config.cors.origin,
  });
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  🚀 XYZ Company ERP API Server`);
  console.log(`  ─────────────────────────────────────────────────`);
  console.log(`  Port:        ${config.port}`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Health:      http://localhost:${config.port}/api/health`);
  console.log(`═══════════════════════════════════════════════════\n`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled rejection / uncaught exception safety net
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error.message });
  process.exit(1);
});
