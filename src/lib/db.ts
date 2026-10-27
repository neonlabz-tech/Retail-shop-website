import mongoose from 'mongoose';
import dns from 'node:dns';

// Ensure reliable DNS resolution for MongoDB Atlas replica sets on Windows/custom ISPs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Custom DNS lookup using dns.resolve4 and public DNS to resolve Atlas replica set shards on Windows
    const customLookup = (
      hostname: string,
      options: any,
      callback?: (err: NodeJS.ErrnoException | null, address: any, family?: number) => void
    ) => {
      const cb = typeof options === 'function' ? options : callback;
      const optsObj = typeof options === 'object' ? options : {};
      if (!cb) return;

      dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          return dns.lookup(hostname, optsObj, cb);
        }
        if (optsObj && optsObj.all) {
          return cb(null, addresses.map((a) => ({ address: a, family: 4 })));
        }
        return cb(null, addresses[0], 4);
      });
    };

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      lookup: customLookup,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
