import clientErrorHandling from "@/lib/clientErrorsReporting"
import Providers from "@/lib/providers"
import { updateStore } from "@/lib/store"
import sdk from "@farcaster/frame-sdk"
import axios from "axios"
import clsx from "clsx"
import Image from "next/image"
import { useEffect } from "react"
import Header from "./components/Header"
import Home from "./pages/Home"

export default function App() {
  useEffect(() => {
    clientErrorHandling()
    ;(async function () {
      const { user, client } = await sdk.context

      const capabilities = await sdk.getCapabilities()

      updateStore({ user, client, capabilities })

      await sdk.actions.ready({ disableNativeGestures: true })

      try {
        const { token: session } = await sdk.quickAuth.getToken()
        updateStore({ session })
        axios.post("/api/login", {}, { headers: { Authorization: `Bearer ${session}` } })
      } catch (error) {
        await sdk.actions.close()
      }
    })()
  }, [])

  return (
    <div onDragStart={e => e.preventDefault()}>
      <Providers>
        <Header />
        <Home />

        <div
          className={clsx(
            "fixed bottom-4 inset-x-0",
            "flex justify-center",
            "text-center text-xs font-normal",
            "opacity-20 cursor-pointer z-10",
            "leading-tight whitespace-pre-line",
          )}
          onClick={() => {
            sdk.actions.sendToken({
              token: "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
              amount: "1000000",
              recipientFid: 1021214,
            })
          }}
        >
          {`help me keep building on fc <3
          need to pay for tech stuff`}
        </div>

        <div className={clsx("fixed top-42 -right-1 z-20", "aspect-[62/99] w-14", "-rotate-27", "animate-fly")}>
          <Image src={"/images/global/baloon.svg"} fill alt="baloon" />
        </div>

        <img
          src="/images/global/bg.svg"
          alt="bg"
          className={clsx("fixed top-0 left-0 w-screen h-screen object-fill -z-10")}
        />
      </Providers>
    </div>
  )
}
