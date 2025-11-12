import { Following, FollowStats, User } from "@/lib/api/types"
import sdk from "@farcaster/frame-sdk"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import axios from "axios"
import clsx from "clsx"
import Image from "next/image"
import { useEffect, useState } from "react"
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

  const { data: userStats, isLoading: userStatsIsLoading } = useQuery<User>({
    queryKey: ["userStats", user?.fid],
    queryFn: async () => await axios.get(`/api/userStats?fid=${user?.fid}`).then(res => res.data),
    enabled: !!user?.fid,
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<Following>({
    queryKey: ["follows", user?.fid],
    queryFn: async ({ pageParam = null }) => {
      const res = await axios.get<Following>("/api/follows", { params: { fid: user?.fid, cursor: pageParam } })
      const following = res?.data

      if (!following) throw new Error("Invalid response")

      const users = [...following.users]

      for (let i = users.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[users[i], users[j]] = [users[j], users[i]]
      }

      return { ...following, users }
    },
    initialPageParam: null,
    getNextPageParam: lastPage => lastPage.next.cursor ?? undefined,
    maxPages: 3,
    enabled: !!user?.fid,
  })

  const follows = data?.pages.flatMap(page => page.users)
  const [askedAddMiniApp, setAskedAddMiniApp] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (follows?.length && count >= follows?.length - 1 && !isFetchingNextPage && hasNextPage) fetchNextPage()
    if (!askedAddMiniApp && count >= 10) {
      setAskedAddMiniApp(true)
      if (!store.getState().client?.added) sdk.actions.addMiniApp().catch(() => {})
    }
  }, [count, follows, isFetchingNextPage, hasNextPage])

  const currentFid = follows?.[count]?.user?.fid

  const { data: followStats, isLoading: followStatsIsLoading } = useQuery<FollowStats>({
    queryKey: ["followStats", user?.fid, currentFid],
    queryFn: async () => await axios.get(`/api/followStats?fid=${currentFid}`).then(res => res.data),
    enabled: !!user?.fid && !!currentFid,
  })

  const isLoading = userStatsIsLoading || isFetchingNextPage || followStatsIsLoading

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
            <div key={i} className={clsx("relative basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0", "capitalize truncate")}>
              {val}

              {/* <div className="absolute left-0 top-0">i</div> */}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "pro",
            isLoading ? "..." : followStats?.pro.status ? check : cross,
            "-",
            isLoading ? "..." : followStats?.pro?.date?.slice(0, 10) ?? "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0",
                "capitalize truncate",
                followStats?.pro?.date && "last:text-xs",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "casts",
            isLoading ? "..." : followStats?.casts.status ? check : cross,
            isLoading ? "..." : followStats?.casts?.value === 150 ? "150+" : followStats?.casts?.value ?? 0,
            isLoading ? "..." : followStats?.casts.date?.slice(0, 10) ?? "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 border-b-2 last:border-r-0",
                "capitalize truncate",

                followStats?.casts.date && "last:text-xs",
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
              className={clsx("relative aspect-square w-8 mt-0.5", "rounded-full cursor-pointer border overflow-hidden z-10")}
              onClick={() => {
                if (!currentFid) return

                if (store.getState().capabilities?.includes("haptics.impactOccurred")) sdk.haptics.impactOccurred("light")

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
              if (count <= 0) return

              if (store.getState().capabilities?.includes("haptics.impactOccurred")) sdk.haptics.impactOccurred("medium")

              setCount(prev => prev - 1)
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

              if (store.getState().capabilities?.includes("haptics.impactOccurred")) sdk.haptics.impactOccurred("medium")

              setCount(prev => (prev < follows?.length - 1 ? prev + 1 : 0))
            }}
          >
            <Image src={"/images/global/r-slider.svg"} alt="r-slider" fill className="object-cover" />
          </div>
          <Image src={"/images/global/rainbow.svg"} alt="rainbow" fill className="object-fill" />
        </div>

        <div className={clsx("flex text-center")}>
          {["neynar", isLoading ? "..." : followStats?.neynar.status ? check : cross, isLoading ? "..." : followStats?.neynar.value ?? 0, "-"].map(
            (val, i) => (
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
            ),
          )}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "funded",
            isLoading ? "..." : followStats?.funded.status ? check : cross,
            isLoading ? "..." : followStats?.funded?.value ? `$${Math.floor(followStats?.funded.value)}` : "$0",
            isLoading ? "..." : followStats?.funded?.date?.slice(0, 10) ?? "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0",
                "capitalize truncate",

                followStats?.funded?.date && "last:text-xs",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "builder",
            isLoading ? "..." : followStats?.builder?.status ? check : cross,
            isLoading ? "..." : followStats?.builder?.value || "-",
            isLoading ? "..." : followStats?.builder?.date?.slice(0, 10) ?? "-",
          ].map((val, i) => (
            <div
              key={i}
              className={clsx(
                "flex justify-center items-center",
                "basis-1/4 pt-1 pb-1.5 border-t-2 border-r-2 last:border-r-0",
                "capitalize truncate",

                followStats?.builder?.date && "last:text-xs",
              )}
            >
              {val}
            </div>
          ))}
        </div>

        <div className={clsx("flex text-center")}>
          {[
            "followers",
            isLoading ? "..." : followStats?.followers.status ? check : cross,
            isLoading ? "..." : followStats?.followers.value ?? 0,
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
            <span className="truncate">{count + 1}</span>/<span className="truncate">{userStatsIsLoading ? "..." : userStats?.following_count}</span>
          </div>
          <Image src={"/images/global/cloud.svg"} alt="cloud" fill />
        </div>

        <div className={clsx("absolute top-3 left-5", "aspect-[41/35] w-9")}>
          <Image src={"/images/global/sun.svg"} alt="sun" fill />
        </div>

        <div className={clsx("absolute bottom-3 right-5", "aspect-[35/40] w-7")}>
          <Image src={"/images/global/brows.svg"} alt="brows" width={20} height={14} className="absolute left-2.5 -top-0.5 animate-brows" />
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
