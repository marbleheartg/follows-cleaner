import { UserContext } from "@farcaster/frame-core/dist/context"
import { MongoClient } from "mongodb"

const { MONGODB_URI } = process.env
if (!MONGODB_URI) throw new Error("MongoDBNotConfigured")

export const client = new MongoClient(MONGODB_URI)
await client.connect()

export const db = client.db("main")

export const usersCollection = db.collection<
  UserContext & {
    notificationToken?: string
    lastLogged: Date
    createdAt: Date
  }
>("users")
