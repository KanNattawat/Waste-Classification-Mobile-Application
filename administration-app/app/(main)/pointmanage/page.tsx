import { cookies } from 'next/headers';
import PointShopClient from './PointShopClient';

export default async function PointShopPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';

  const API_BASE_URL = process.env.API_BASE_URL;
  let initialItems = [];
  
  try {
    const res = await fetch(`${API_BASE_URL}/getallitem`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store' 
    });
    
    if (res.ok) {
      initialItems = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch initial items:", error);
  }

  return (
    <div className="flex flex-col justify-start items-center bg-[#F4F4F4] w-full min-h-screen py-10">
      <div className="bg-white w-[90%] rounded-md p-6 shadow-md">
        <PointShopClient initialItems={initialItems} token={token} />
      </div>
    </div>
  );
}