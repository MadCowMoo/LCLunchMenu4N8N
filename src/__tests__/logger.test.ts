import { ConsoleLogger, LogLevel } from '../utils/logger';

describe('ConsoleLogger', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockConsole: any;
  
  beforeAll(() => {
    // Save original process.env
    originalEnv = process.env;
    
    // Mock console methods
    mockConsole = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    global.console = mockConsole as Console;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
  });
  
  it('should use default log level if none specified', () => {
    const logger = new ConsoleLogger();
    logger.debug('test debug');
    logger.info('test info');
    
    expect(mockConsole.debug).not.toHaveBeenCalled();
    expect(mockConsole.info).toHaveBeenCalledWith('[INFO] test info', '');
  });
  
  it('should respect log level from environment variable', () => {
    process.env.LC_LUNCH_MENU_LOG_LEVEL = 'debug';
    const logger = new ConsoleLogger();
    
    logger.debug('test debug');
    expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] test debug', '');
  });
  
  it('should filter logs below threshold', () => {
    const logger = new ConsoleLogger('warn');
    
    logger.debug('test debug');
    logger.info('test info');
    logger.warn('test warn');
    
    expect(mockConsole.debug).not.toHaveBeenCalled();
    expect(mockConsole.info).not.toHaveBeenCalled();
    expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] test warn', '');
  });
  
  it('should handle meta objects in log messages', () => {
    const logger = new ConsoleLogger('debug');
    const meta = { key: 'value' };
    
    logger.info('test with meta', meta);
    
    expect(mockConsole.info).toHaveBeenCalledWith('[INFO] test with meta', meta);
  });
});

describe('createLogger', () => {
  it('should create a ConsoleLogger by default', () => {
    const logger = require('../utils/logger').createLogger();
    expect(logger).toBeInstanceOf(require('../utils/logger').ConsoleLogger);
  });
  
  it('should use provided logger if it implements Logger interface', () => {
    const customLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    const logger = require('../utils/logger').createLogger(undefined, customLogger);
    logger.info('test');
    
    // The logger should be called with just the message
    expect(customLogger.info).toHaveBeenCalledWith('test');
  });
  
  it('should adapt n8n-style logger objects', () => {
    const n8nLogger = {
      log: jest.fn()
    };
    
    const logger = require('../utils/logger').createLogger(undefined, n8nLogger);
    logger.warn('test warning');
    
    expect(n8nLogger.log).toHaveBeenCalledWith('WARN: test warning', undefined);
  });
});
