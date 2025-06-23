import { NextRequest, NextResponse } from "next/server"
import { usersCollection } from "../../lib/db"

export async function GET(req: NextRequest) {
  const fidHeader = req.headers.get("fid")

  if (!fidHeader) throw new Error("NoFID")

  const fid = parseInt(fidHeader)

  try {
    let user = await usersCollection.findOne({ fid })

    if (!user) {
      await usersCollection.insertOne({
        fid,
        lastLogged: new Date(),
        createdAt: new Date(),
      })
    } else {
      await usersCollection.updateOne({ fid }, { $set: { lastLogged: new Date() } })
    }

    user = await usersCollection.findOne({ fid })

    return NextResponse.json(user)
  } catch (err) {
    console.error(err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
