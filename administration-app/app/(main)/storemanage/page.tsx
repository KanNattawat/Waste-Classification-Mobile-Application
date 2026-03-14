import Searchbar from "@/components/searchBar";
import Pagination from "@/components/pagination";
import Table from "@/components/shopTable";
import { cookies } from 'next/headers';
import Link from 'next/link';
import Panel from "@/components/shopPanel"

type SearchParams = {
    page?: string;
    username?: string;
};

const page = async ({ searchParams }: { searchParams: SearchParams }) => {
    const { page } = await searchParams;
    const currentPage = page ?? '1';
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const res = await fetch(`${process.env.API_BASE_URL}/manage/recycleShop?current=${currentPage}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await res.json();
    const totalPage = data.totalPage
    const safePage = Math.min(totalPage, Number(currentPage))
    console.log('total',totalPage)

    return (
        <div className="flex flex-col justify-start items-center bg-[#F4F4F4] w-full h-screen min-h-screen pt-2">
            <div className="flex flex-row w-[90%] min-w-50 justify-end">
                <Pagination current={Number(safePage)} total={totalPage} />
            </div>
            <div className="flex justify-center items-center bg-white w-[90%] rounded-md mt-2">
                <Panel shopData={data.shop} />
            </div>
        </div>

    )
}

export default page