export const Logger = {
  error: (context, error, metadata = {}) => {
    const structuredLog = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      context,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      ...metadata
    };
    
    // Console-based structured logging as requested
    console.dir(structuredLog, { depth: null, colors: true });
  },
  
  info: (context, message, metadata = {}) => {
    console.info(JSON.stringify({ 
      level: 'INFO', 
      timestamp: new Date().toISOString(), 
      context, 
      message, 
      ...metadata 
    }));
  },

  warn: (context, message, metadata = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      context,
      message,
      ...metadata
    }));
  }
};
