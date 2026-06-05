import {
    Twitter,
    Youtube,
    Linkedin,
} from 'lucide-react';

export default function Footer() {
    return (
        <footer className='absolute bottom-4 flex justify-between  mx-auto items-center max-w-[1500px] px-4 left-20 right-50 sm:px-8 lg:px-12'>
            <div className="">
                <p className="text-[20px] font-medium text-slate-800">© 2026 Invitely. All rights reserved.</p>
            </div>
            <div className="flex gap-5">
                <Linkedin className="h-5 w-5 text-slate-500 hover:text-[#5c4ce4] transition-colors cursor-pointer" />
                <Twitter className="h-5 w-5 text-slate-500 hover:text-[#5c4ce4] transition-colors cursor-pointer" />
                <Youtube className="h-5 w-5 text-slate-500 hover:text-red-600 transition-colors cursor-pointer" />
            </div>
        </footer>
    )
}