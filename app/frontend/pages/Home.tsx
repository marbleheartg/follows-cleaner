import axiosInstance from "@/lib/api/config"
import { User, UserStats } from "@/lib/api/types"
import sdk from "@farcaster/frame-sdk"
import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import Image from "next/image"
import { useState } from "react"
import { store } from "../../lib/store"

const check = (
  <div className="relative aspect-square w-4">
    <Image src={"/images/global/check.svg"} alt="check" fill />
  </div>
)
const cross = (
  <div className="relative aspect-[12/11] w-4">
    <Image src={"/images/global/cross.svg"} alt="cross" fill />
  </div>
)

export default function Home() {
  const { user } = store()

  const { data: follows, isLoading: followsIsLoading } = useQuery<{ object: string; user: User }[]>({
    queryKey: ["follows", user?.fid],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/follows")

      const follows = res?.data

      if (!follows) return []
      if (!Array.isArray(res.data)) return []

      const array = [...follows]
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }

      return array
    },
    enabled: !!user?.fid,
  })

  const [count, setCount] = useState(0)

  const currentFid = follows?.[count]?.user?.fid

  const { data: userStats, isLoading: userStatsIsLoading } = useQuery<UserStats>({
    queryKey: ["userStats", user?.fid, currentFid],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/userStats?fid=${currentFid}`)
      return res.data
    },
    enabled: !!user?.fid && !!currentFid,
  })

  const isLoading = followsIsLoading || userStatsIsLoading

  return (
    <>
      <main
        className={clsx(
          "fixed top-42 inset-x-8",
          "flex flex-col justify-center",
          "bg-white aspect-[304/338] ",
          "rounded-[10vw] border",
          "py-2",
          "text-sm",
        )}
      >
        <div className={clsx("flex text-center")}>
          {["type", "status", "value", "date"].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "relative basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0",
                "capitalize truncate",
              )}
            >
              {val}

              {/* <div className="absolute left-0 top-0">i</div> */}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "pro",
            isLoading ? "..." : userStats?.pro.status ? check : cross,
            "-",
            isLoading ? "..." : userStats?.pro?.date?.slice(0, 10) ?? "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0",
                "capitalize truncate",
                userStats?.pro?.date && "last:text-xs",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "casts",
            isLoading ? "..." : userStats?.casts.status ? check : cross,
            isLoading ? "..." : userStats?.casts?.value === 150 ? "150+" : userStats?.casts?.value ?? 0,
            isLoading ? "..." : userStats?.casts.date?.slice(0, 10) ?? "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 border-b-2 last:border-r-0",
                "capitalize truncate",

                userStats?.casts.date && "last:text-xs",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("relative flex justify-center items-center gap-1 pb-0.5 aspect-[300/38]")}>
          {isLoading ? (
            <div className="bg-gray-300 w-8 h-8 animate-pulse rounded-full z-10" />
          ) : (
            <div
              className={clsx(
                "relative aspect-square w-8 mt-0.5",
                "rounded-full cursor-pointer border overflow-hidden z-10",
              )}
              onClick={() => {
                if (!currentFid) return

                if (store.getState().capabilities?.includes("haptics.impactOccurred"))
                  sdk.haptics.impactOccurred("light")

                sdk.actions.viewProfile({ fid: currentFid })
              }}
            >
              <img
                src={follows?.[count].user?.pfp_url || "/images/global/user.svg"}
                alt="pfp"
                onError={e => {
                  e.currentTarget.src = "/images/global/user.svg"
                }}
                className="object-cover w-full h-full rounded-full"
              />
            </div>
          )}
          <span
            className={clsx(
              "text-shadow-[-1px_-1px_0_black,_0px_-1px_0_black,_1px_-1px_0_black,_-1px_0px_0_black,_1px_0px_0_black,_-1px_1px_0_black,_0px_1px_0_black,_1px_1px_0_black]",
              "text-center text-white text-xl leading-none cursor-pointer z-10",
            )}
            onClick={() => {
              if (!currentFid) return

              if (store.getState().capabilities?.includes("haptics.impactOccurred")) sdk.haptics.impactOccurred("light")

              sdk.actions.viewProfile({ fid: currentFid })
            }}
          >
            {follows ? `@${follows[count].user.username}` : "..."}
          </span>
          <div
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 -left-5",
              "aspect-square w-12",
              "cursor-pointer rounded-full z-10",
              isLoading && "animate-[spin_1s_linear_infinite_reverse]",
            )}
            onClick={() => {
              if (!follows?.length) return

              if (store.getState().capabilities?.includes("haptics.impactOccurred"))
                sdk.haptics.impactOccurred("medium")

              setCount(prev => (prev > 0 ? prev - 1 : follows?.length - 1))
            }}
          >
            <Image src={"/images/global/l-slider.svg"} alt="l-slider" fill className="object-cover" />
          </div>
          <div
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 -right-5",
              "aspect-square w-12",
              "cursor-pointer rounded-full z-10 ",
              isLoading && "animate-spin",
            )}
            onClick={() => {
              if (!follows?.length) return

              if (store.getState().capabilities?.includes("haptics.impactOccurred"))
                sdk.haptics.impactOccurred("medium")

              setCount(prev => (prev < follows?.length - 1 ? prev + 1 : 0))
            }}
          >
            <Image src={"/images/global/r-slider.svg"} alt="r-slider" fill className="object-cover" />
          </div>
          <Image src={"/images/global/rainbow.svg"} alt="rainbow" fill className="object-fill" />
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "neynar",
            isLoading ? "..." : userStats?.neynar.status ? check : cross,
            isLoading ? "..." : userStats?.neynar.value ?? 0,
            "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0",
                "capitalize truncate",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "funded",
            isLoading ? "..." : userStats?.funded.status ? check : cross,
            isLoading ? "..." : userStats?.funded?.value ? `$${Math.floor(userStats?.funded.value)}` : "$0",
            isLoading ? "..." : userStats?.funded?.date?.slice(0, 10) ?? "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0",
                "capitalize truncate",

                userStats?.funded?.date && "last:text-xs",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "builder",
            isLoading ? "..." : userStats?.builder?.status ? check : cross,
            isLoading ? "..." : userStats?.builder?.value ?? "0",
            isLoading ? "..." : userStats?.builder?.date?.slice(0, 10) ?? "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0",
                "capitalize truncate",

                userStats?.builder?.date && "last:text-xs",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "followers",
            isLoading ? "..." : userStats?.followers.status ? check : cross,
            isLoading ? "..." : userStats?.followers.value ?? 0,
            "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 border-b-2 last:border-r-0",
                "capitalize truncate",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("absolute -bottom-5 -left-6", "aspect-[88/62] w-20", "-rotate-8")}>
          <div className="flex items-center absolute top-1/2 left-1/2 -translate-1/2 -rotate-10 z-10 truncate max-w-15">
            <span className="truncate">{count + 1}</span>/
            <span className="truncate">{followsIsLoading ? "..." : follows?.length}</span>
          </div>
          <Image src={"/images/global/cloud.svg"} alt="cloud" fill />
        </div>

        <div className={clsx("absolute top-3 left-5", "aspect-[41/35] w-9")}>
          <Image src={"/images/global/sun.svg"} alt="sun" fill />
        </div>

        <div className={clsx("absolute bottom-3 right-5", "aspect-[35/40] w-7")}>
          <Image
            src={"/images/global/brows.svg"}
            alt="brows"
            width={20}
            height={14}
            className="absolute left-2.5 -top-0.5 animate-brows"
          />
          <Image src={"/images/global/smile.svg"} alt="smile" fill />
        </div>

        <Image src={"/images/global/stroke.svg"} alt="stroke" fill className="object-fill rounded-[38px] -z-10" />
      </main>

      <button
        type="button"
        className={clsx(
          "flex justify-center items-center",
          "fixed bottom-14 left-1/2 -translate-x-1/2 rounded-[30px] aspect-[202/57] w-50.5 outline",
        )}
        onClick={() => {
          if (!currentFid) return

          if (store.getState().capabilities?.includes("haptics.impactOccurred")) sdk.haptics.impactOccurred("medium")

          sdk.actions.viewProfile({ fid: currentFid })
        }}
      >
        <span className={clsx("font-medium text-xl")}>{follows ? "unfollow" : "..."}</span>

        <div className={clsx("absolute -top-4 -right-3.5", "aspect-[54/53] w-16 z-20")}>
          <Image src={"/images/global/toy-hammer.svg"} alt="toy-hammer" fill />
        </div>

        <Image src={"/images/global/button-stroke.svg"} alt="button-stroke" fill className="object-fill" />
      </button>
    </>
  )
}
