import express, { Router } from 'express';
import physical from 'express-physical';

const router: Router = express.Router();

// Health checks
const serverHealthCheck = () => {
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  
  return physical.response({
    name: 'Server Health',
    healthy: true,
    type: physical.type.SELF,
    actionable: false,
    info: {
      uptime: Math.floor(process.uptime()),
      memoryUsage: `${memoryUsageMB}MB`,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
};

const environmentCheck = () => {
  const requiredEnvVars = ['PORT'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  return physical.response({
    name: 'Environment Configuration',
    healthy: missingVars.length === 0,
    type: physical.type.SELF,
    actionable: true,
    ...(missingVars.length > 0 && {
      severity: physical.severity.WARNING,
      message: `Missing environment variables: ${missingVars.join(', ')}`
    })
  });
};

// Health endpoint
router.use('/', physical([serverHealthCheck, environmentCheck]));

export default router; 