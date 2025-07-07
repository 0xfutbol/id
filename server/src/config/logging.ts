import { initializeLogging } from '../utils/common/logging';

initializeLogging({
  appName: 'msid',
  enableConsole: true,
  lokiUrl: process.env.LOKI_URL ?? 'https://internal.0xfutbol.com/promtail/loki/api/v1/push',
});