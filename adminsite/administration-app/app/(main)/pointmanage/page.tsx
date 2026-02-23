import { cookies } from 'next/headers';
import PointShopClient from './PointShopClient';

export default async function PointShopPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';

  // โหลดข้อมูลเริ่มต้นจาก Server 
  const API_BASE_URL = "https://waste-classification-mobile-application.onrender.com/manage";
  let initialItems = [];
  
  try {
    const res = await fetch(`${API_BASE_URL}/getallitem`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store' // ไม่ cache เพื่อให้ได้ข้อมูลล่าสุดเสมอ
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
        {/* ส่งข้อมูลเริ่มต้นและ Token ไปให้ไฟล์ Client จัดการต่อ */}
        <PointShopClient initialItems={initialItems} token={token} />
      </div>
    </div>
  );
}