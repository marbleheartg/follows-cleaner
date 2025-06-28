import { arbitrum, base, mainnet, optimism } from "viem/chains"

const PROJECT_TITLE = "follows cleaner"

const PROJECT_DESCRIPTION = "clean your following easily"

const FRAME = {
  version: "next",
  imageUrl: `https://${process.env.NEXT_PUBLIC_HOST}/images/og/frame/ogCastImage.jpg`,
  aspectRatio: "3:2",
  button: {
    title: "clean",
    action: {
      type: "launch_frame",
      url: `https://${process.env.NEXT_PUBLIC_HOST}`,
      name: PROJECT_TITLE,
      splashImageUrl: `https://${process.env.NEXT_PUBLIC_HOST}/images/og/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
}

const ASSETS = [
  {
    chain: mainnet,
    usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    usdt: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  },
  {
    chain: base,
    usdc: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    usdt: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  },
  {
    chain: optimism,
    usdc: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    usdt: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
  },
  {
    chain: arbitrum,
    usdc: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    usdt: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  },
]

export { ASSETS, FRAME, PROJECT_DESCRIPTION, PROJECT_TITLE }
