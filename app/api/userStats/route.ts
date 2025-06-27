import { CastsData, ResultData, TxsData, UsersData, UserStats } from "@/lib/api/types"
import builders from "@/lib/builders.json" assert { type: "json" }
import { ASSETS } from "@/lib/constants"
import axios from "axios"
import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, formatUnits, http, parseAbiItem } from "viem"

export async function GET(req: NextRequest) {
  const fid = req.headers.get("fid")
  if (!fid) throw new Error("NoFID")

  const { NEYNAR_API_KEY, ETHERSCAN_API_KEY } = process.env
  if (!(NEYNAR_API_KEY && ETHERSCAN_API_KEY)) throw new Error("NeynarNotConfigured")

  try {
    const searchParams = req.nextUrl.searchParams
    const fid = searchParams.get("fid")

    if (!fid) throw new Error("NoFID")

    const options = { method: "GET", headers: { "x-api-key": NEYNAR_API_KEY } }

    const { data: castsData } = await axios.get<CastsData>(`https://api.neynar.com/v2/farcaster/feed/user/casts`, {
      ...options,
      params: { limit: 150, fid },
    })
    const casts = castsData.casts

    const { data: usersData } = await axios.get<UsersData>(`https://api.neynar.com/v2/farcaster/user/bulk`, {
      ...options,
      params: { fids: fid },
    })
    const user = usersData.users[0]

    let eth = BigInt(0)
    let usd = BigInt(0)
    let totalUsd = 0

    const eth_addresses = user.verified_addresses?.eth_addresses

    let firstTxTimestamp

    if (eth_addresses?.length) {
      const address = eth_addresses[0] as `0x${string}`

      const abi = parseAbiItem("function balanceOf(address owner) view returns (uint256)")

      await Promise.allSettled(
        ASSETS.map(async asset => {
          const client = createPublicClient({ chain: asset.chain, transport: http() })

          const [ethBalance, usdcBalance, usdtBalance] = await Promise.allSettled([
            client.getBalance({ address }),
            client.readContract({
              address: asset.usdc as `0x${string}`,
              abi: [abi],
              functionName: "balanceOf",
              args: [address],
            }),
            client.readContract({
              address: asset.usdt as `0x${string}`,
              abi: [abi],
              functionName: "balanceOf",
              args: [address],
            }),
          ])

          if (ethBalance.status === "fulfilled") eth += ethBalance.value
          if (usdcBalance.status === "fulfilled") usd += usdcBalance.value
          if (usdtBalance.status === "fulfilled") usd += usdtBalance.value
        }),
      )

      const ethToUsd = (eth * BigInt(2400)) / BigInt(1e18)
      totalUsd = Number(ethToUsd) + Number(formatUnits(usd, 6))

      firstTxTimestamp = await axios
        .get<TxsData>(`https://api.etherscan.io/v2/api`, {
          params: {
            chainid: "8453",
            module: "account",
            action: "txlist",
            startblock: "0",
            endblock: "99999999",
            sort: "asc",
            address,
            apikey: ETHERSCAN_API_KEY,
          },
        })
        .then(res => new Date(Number(res.data?.result?.[0]?.timeStamp) * 1000).toISOString())
        .catch(() => {})
    }

    const { fids } = builders as { fids: Record<string, any[]> }

    const built = fids?.[user.fid] ?? []

    const pro = user?.pro
    const score = user.score
    const follower_count = user.follower_count

    let builder =
      /(founder|foundation|head|developer|foundation|tech|ceo|build|creator|artist|@[\w.]+|\w+\.\w+)/i.test(
        user.profile.bio.text,
      ) || !!built.length

    let githubConnected

    const verifications = await axios
      .get<ResultData>(`https://api.farcaster.xyz/fc/account-verifications`, {
        params: { platform: "github", fid: user.fid },
      })
      .then(res => res.data.result.verifications)
      .catch(() => {})

    if (verifications?.length) {
      builder = true
      githubConnected = new Date(verifications[0].verifiedAt * 1000).toISOString()
    }

    const userStats: UserStats = {
      pro: {
        status: pro?.status === "subscribed",
        date: pro?.subscribed_at ?? null,
      },
      casts: {
        status: !!casts?.length,
        value: casts?.length,
        date: casts[0]?.timestamp,
      },
      neynar: {
        status: !!score,
        value: score ?? 0,
      },
      funded: { status: !!totalUsd, value: totalUsd, date: firstTxTimestamp ?? null },
      builder: { status: builder, value: built.length, date: githubConnected ?? null },
      followers: { status: !!follower_count, value: follower_count },
    }

    return NextResponse.json(userStats)
  } catch (err) {
    console.error(err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
