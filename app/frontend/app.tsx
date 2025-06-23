import login from "@/lib/api/login"
import clientErrorHandling from "@/lib/clientErrorsReporting"
import Providers from "@/lib/providers"
import { updateStore } from "@/lib/store"
import sdk from "@farcaster/frame-sdk"
import clsx from "clsx"
import { useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import Header from "./components/Header"
import Menu from "./components/Menu"
import Home from "./pages/Home"

clientErrorHandling()

export default function App() {
  useEffect(() => {
    ;(async function () {
      const { user, client } = await sdk.context

      const capabilities = await sdk.getCapabilities()

      updateStore({ user, client, capabilities })

      await sdk.actions.ready({ disableNativeGestures: true })

      try {
        const { token: session } = await sdk.quickAuth.getToken()
        updateStore({ session })

        await login()
      } catch (error) {
        await sdk.actions.close()
      }
    })()
  }, [])

  return (
    <div className={clsx("w-10/12 mx-auto px-1")}>
      <Providers>
        <BrowserRouter>
          <Header />
          <div className={clsx("pt-12")}>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
          <Menu />
        </BrowserRouter>
      </Providers>

      {/* <Image src="/images/global/bg.jpg" alt="bg" fill sizes="100vw" priority className={clsx("object-cover -z-10")} /> */}
      <div className="absolute inset-0 z-50 pointer-events-none" onDragStart={e => e.preventDefault()}></div>
    </div>
  )
}
