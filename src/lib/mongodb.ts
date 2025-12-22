import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not defined in environment");

let _client: MongoClient | null = null;
let _promise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (_client) return _client;
  if (!_promise) {
    const client = new MongoClient(uri!);
    _promise = client.connect().then((c) => {
      _client = c;
      return c;
    });
  }
  return _promise;
}