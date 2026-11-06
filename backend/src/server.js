import http from 'http';
import app from './app.js';
import { ENV } from './config/env.js';
import { initSocket } from './sockets/socketManager.js';
import { initScheduledJobs } from './jobs/reminderCron.js';

const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Initialize Scheduled Reminder Jobs
initScheduledJobs();

const server = httpServer.listen(ENV.PORT, () => {
  console.log(`🚀 Campus Crew Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
  console.log(`📡 Socket.IO Real-Time Gateway ready`);
  console.log(`🌐 CORS allowed origin: ${ENV.CLIENT_URL}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
