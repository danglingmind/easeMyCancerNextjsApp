// Empty module to replace Node.js modules in client-side bundle
module.exports = {
  // Path module mock
  parse: () => ({ root: '', dir: '', base: '', ext: '', name: '' }),
  join: (...args) => args.join('/'),
  resolve: (...args) => args.join('/'),
  dirname: (p) => p.split('/').slice(0, -1).join('/') || '.',
  basename: (p) => p.split('/').pop() || '',
  extname: (p) => {
    const parts = p.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  },
  
  // Other common Node.js module methods
  readFileSync: () => '',
  writeFileSync: () => {},
  existsSync: () => false,
  mkdirSync: () => {},
  statSync: () => ({ isFile: () => false, isDirectory: () => false }),
  
  // Network modules
  createConnection: () => {},
  connect: () => {},
  
  // Crypto
  createHash: () => ({ update: () => {}, digest: () => '' }),
  randomBytes: () => Buffer.alloc(0),
  
  // Stream
  Readable: class {},
  Writable: class {},
  Transform: class {},
  
  // URL
  parse: () => ({}),
  format: () => '',
  
  // DNS
  lookup: () => {},
  resolve: () => {},
  
  // Timers
  setTimeout: () => {},
  setInterval: () => {},
  clearTimeout: () => {},
  clearInterval: () => {},
};
