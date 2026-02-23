import Searchbar from "@/components/searchBar";
import Pagination from "@/components/pagination";
import Table from "@/components/userTable";
import { cookies } from 'next/headers';

type SearchParams = {
  page?: string;
  username?: string;
};

const page = async ({ searchParams }: { searchParams: SearchParams }) => {

  const { page, username } = await searchParams;
  const usernameQuery = username ? `&username=${username}` : ""
  const currentPage = page ?? '1';
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const res = await fetch(`${process.env.API_BASE_URL}/manage/getusers?current=${currentPage}${usernameQuery}`,{
   headers:{
    'Authorization':`Bearer ${token}`
   }
  });
  const data = await res.json();
  const user = data.user
  const totalPage = data.totalPage
  const safePage = Math.min(totalPage, Number(currentPage))


  return (
    <div>
      <div className="flex flex-col justify-start items-center bg-[#F4F4F4] w-full h-screen min-h-screen">
        <div className="flex flex-row w-[90%] min-w-50">
          <Searchbar />
          <Pagination current={Number(safePage)} total={totalPage} />
        </div>
        <div className=" flex justify-center items-center bg-white w-[90%] h-[85%] rounded-md">
          <Table user={user} />
        </div>
      </div>
    </div>
  )
}

export default page