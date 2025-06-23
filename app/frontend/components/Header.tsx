import clsx from "clsx"
import Image from "next/image"
import { NavLink } from "react-router"
import { store } from "../../lib/store"

const Header = () => {
  const { user } = store()

  return (
    <header className={clsx("py-8", "flex justify-between items-center")}>
      <div>Logo</div>

      <NavLink
        to="/profile"
        className={clsx(
          "relative",
          "aspect-square w-[32px]",
          "bg-[var(--accent)]",
          "rounded-full overflow-hidden",
          "outline-2 outline-[var(--accent)]",
        )}
      >
        <Image src={user?.pfpUrl || "/images/user.svg"} sizes="32px" priority fill alt="profile" />
      </NavLink>
    </header>
  )
}

export default Header
