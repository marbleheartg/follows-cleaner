import Image from "next/image"

const ImagesPreload = async () => {
  return (
    <div>
      <div className="relative hidden w-0 h-0">
        <Image src={"/images/global/check.svg"} alt="check" priority fill />
        <Image src={"/images/global/cross.svg"} alt="cross" priority fill />
        <Image src={"/images/global/user.svg"} alt="user" priority fill />
        <Image src={"/images/global/l-slider.svg"} alt="l-slider" priority fill />
        <Image src={"/images/global/r-slider.svg"} alt="r-slider" priority fill />
        <Image src={"/images/global/rainbow.svg"} alt="rainbow" priority fill />
        <Image src={"/images/global/cloud.svg"} alt="cloud" priority fill />
        <Image src={"/images/global/sun.svg"} alt="sun" priority fill />
        <Image src={"/images/global/brows.svg"} alt="brows" priority width={20} height={14} />
        <Image src={"/images/global/smile.svg"} alt="smile" priority fill />
        <Image src={"/images/global/stroke.svg"} alt="stroke" priority fill />
        <Image src={"/images/global/toy-hammer.svg"} alt="toy-hammer" priority fill />
        <Image src={"/images/global/button-stroke.svg"} alt="button-stroke" priority fill />
        <Image src={"/images/global/baloon.svg"} alt="baloon" priority fill />
        <Image src={"/images/global/bg.svg"} alt="bg" priority fill />
      </div>
    </div>
  )
}

export default ImagesPreload
