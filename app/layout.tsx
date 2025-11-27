import { Itim, REM } from "next/font/google"
import { ReactNode } from "react"
import "./globals.css"
import { FRAME, PROJECT_DESCRIPTION, PROJECT_TITLE } from "./lib/constants"

const rem = REM({
  variable: "--rem",
  weight: "variable",
  subsets: ["latin"],
})

const itim = Itim({
  variable: "--itim",
  weight: "400",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
        <meta name="fc:frame" content={JSON.stringify(FRAME)} />
        <title>{PROJECT_TITLE}</title>
        <meta name="description" content={PROJECT_DESCRIPTION} />
        <link rel="icon" type="image/svg+xml" href="/images/global/logo.svg" />
      </head>
      <body className={`${rem.variable} ${itim.variable} antialiased`}>{children}</body>
    </html>
  )
}
