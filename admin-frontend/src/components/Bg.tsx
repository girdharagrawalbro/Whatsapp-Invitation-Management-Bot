export default function Bg() {
    return (
        <>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] -z-10 pointer-events-none">

                <div
                    className="w-full h-full opacity-[0.7]"
                    style={{
                        backgroundImage: "url('https://res.cloudinary.com/dcmrsdydh/image/upload/v1778072538/Gemini_Generated_Image_l6zsk9l6zsk9l6zs_fvtqef.png')",
                        backgroundRepeat: "repeat",
                        backgroundSize: "450px",
                        maskImage: "radial-gradient(circle at bottom left, black 30%, transparent 75%)",
                        WebkitMaskImage: "radial-gradient(circle at bottom left, black 30%, transparent 75%)",
                    }}
                />
            </div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] -z-10 pointer-events-none">
                <div
                    className="w-full h-full opacity-[0.7] rotate-[10deg]"
                    style={{
                        backgroundImage: "url('https://res.cloudinary.com/dcmrsdydh/image/upload/v1778072538/Gemini_Generated_Image_l6zsk9l6zsk9l6zs_fvtqef.png')",
                        backgroundRepeat: "repeat",
                        backgroundSize: "450px",
                        maskImage: "radial-gradient(circle at top right, black 20%, transparent 75%)",
                        WebkitMaskImage: "radial-gradient(circle at top right, black 20%, transparent 75%)",
                    }}
                />
            </div>

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none"> {/* Top Left Green Glow */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-400/20 rounded-full blur-[100px]"></div>
                {/* Top Right Purple Glow */} <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
                {/* Bottom Right Subtle Star/Glow */} <div className="absolute bottom-10 right-10 w-64 h-64 bg-green-500/10 rounded-full blur-[80px]"></div> </div></>
    )
}