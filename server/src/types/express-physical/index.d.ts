declare module 'express-physical' {
  import { RequestHandler } from 'express';

  interface PhysicalResponse {
    name: string;
    healthy: boolean;
    type: string;
    actionable: boolean;
    severity?: string;
    message?: string;
    info?: any;
    dependentOn?: string;
    link?: string;
  }

  interface PhysicalType {
    SELF: string;
    METRICS: string;
    INFRASTRUCTURE: string;
    INTERNAL_DEPENDENCY: string;
    EXTERNAL_DEPENDENCY: string;
    INTERNET_CONNECTIVITY: string;
  }

  interface PhysicalSeverity {
    WARNING: string;
    CRITICAL: string;
    DOWN: string;
  }

  type Check = () => PhysicalResponse | ((done: (response: PhysicalResponse) => void) => void);

  function physical(checks: Check[]): RequestHandler;
  
  namespace physical {
    function response(options: {
      name: string;
      healthy: boolean;
      type: string;
      actionable: boolean;
      severity?: string;
      message?: string;
      info?: any;
      dependentOn?: string;
      link?: string;
    }): PhysicalResponse;
    
    const type: PhysicalType;
    const severity: PhysicalSeverity;
  }

  export = physical;
} 