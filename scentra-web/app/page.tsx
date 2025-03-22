import Link from "next/link"
import { Playfair_Display, Lora, Poppins } from "next/font/google" // Import Google Fonts

const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: "700" }) // Configure font
const lora = Lora({ subsets: ["latin"], weight: "400" }) // Paragraph font
const poppins = Poppins({ subsets: ["latin"], weight: "500" }) // Link font

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video autoPlay loop muted className="absolute inset-0 min-h-full min-w-full object-cover">
        <source src="/background.mov" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-white">
        <h1 className={`mb-6 text-6xl font-bold tracking-tight ${playfairDisplay.className}`}>Scentra</h1>
        <p className={`mb-8 text-center text-xl ${lora.className}`}>
          AI tool designed for a fragrance house to develop custom scents for clients.
        </p>
        <Link
          href="/request"
          className={`text-lg relative text-white group z-10 ${poppins.className}`}
        >
          Get Started
          <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-white z-10 transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </Link>
      </div>
    </div>
  )
}

