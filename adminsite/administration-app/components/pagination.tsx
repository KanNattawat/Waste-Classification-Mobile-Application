'use client'
import { usePathname, useRouter, useSearchParams } from "next/navigation";
type pageNumber = {
    current: number,
    total: number
}

const Pagination = ({current, total}:pageNumber) => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const buttonsToShow = 10;

    const getPaginationNumber = () => {
        let start = Math.max(1, current - Math.floor(buttonsToShow / 2))
        start = Math.min(start, Math.max(1, total - buttonsToShow + 1))
        return Array.from({ length: Math.min(buttonsToShow, total) }, (_, i) => start + i);
    };

    const navigate = (page:number) =>{
        const serachParams = new URLSearchParams(searchParams.toString());
        serachParams.set("page", String(page));
        router.push(`${pathname}?${serachParams.toString()}`)
    }


    return (
        <div className="flex flex-row items-center gap-1 mt-6">
            <button
                disabled={current === 1}
                onClick={() => navigate(1)}
                className="bg-white border border-slate-200 rounded-md px-5 py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition"
            >
                &lt;&lt;
            </button>
            <button
                disabled={current === 1}
                onClick={() => navigate(current-1)}
                className="bg-white border border-slate-200 rounded-md px-5 py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition"
            >
                &lt;
            </button>

            {getPaginationNumber().map((num) => (
                <button
                    key={num}
                    onClick={() => navigate(num)}
                    className={`rounded-md px-3 py-1.5 text-sm border ${current === num
                        ? "bg-black text-white border-black"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                >
                    {num}
                </button>
            ))}



            <button
                disabled={current === total}
                onClick={() => navigate(current+1)}
                className="bg-white border border-slate-200 rounded-md px-5 py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition"
            >
                &gt;
            </button>
            <button
                disabled={current === total}
                onClick={() => navigate(total)}
                className="bg-white border border-slate-200 rounded-md px-5 py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition"
            >
                &gt;&gt;
            </button>
        </div>
    )
}

export default Pagination