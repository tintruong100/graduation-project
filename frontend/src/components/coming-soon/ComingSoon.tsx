"use client";

// 1. Khai báo Props để component nhận dữ liệu từ ngoài vào
interface ComingSoonProps {
    title?: string;
    description?: string;
}

export default function ComingSoon({
    title = "Tính năng đang phát triển",
    description = "Module này đang được xây dựng và sẽ sớm ra mắt. Vui lòng quay lại sau nhé!"
}: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] animate-in fade-in zoom-in-95 duration-500">

            {/* Vòng tròn hiệu ứng và Icon */}
            <div className="relative mb-8 mt-10">
                <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-50"></div>
                <div className="relative flex items-center justify-center bg-white w-24 h-24 rounded-full shadow-2xl border-4 border-blue-50 text-blue-600 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
            </div>

            {/* 2. Gắn Props vào HTML */}
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                {title}
            </h2>

            <p className="text-gray-500 text-sm md:text-base max-w-md text-center mb-10 leading-relaxed px-4">
                {description}
            </p>
        </div>
    );
}