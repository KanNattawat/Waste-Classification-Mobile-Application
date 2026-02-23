'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePointShop() {
  const router = useRouter();

  const [form, setForm] = useState({
    Item_name: "",
    Usage_Limit: "",
    Point_Usage: "",
    Expire_Date: ""
  });

  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.Item_name || !form.Point_Usage || !form.Usage_Limit || !form.Expire_Date) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/pointshop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Item_name: form.Item_name,
          Usage_Limit: Number(form.Usage_Limit),
          Point_Usage: Number(form.Point_Usage),
          Expire_Date: form.Expire_Date
        })
      });

      if (!res.ok) {
        throw new Error("ไม่สามารถเพิ่มสินค้าได้");
      }

      router.push("/pointshop");

    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-6">เพิ่มสินค้า</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96">

        <input
          placeholder="ชื่อสินค้า"
          value={form.Item_name}
          onChange={e => setForm({ ...form, Item_name: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="แต้มที่ใช้"
          value={form.Point_Usage}
          onChange={e => setForm({ ...form, Point_Usage: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="จำนวนจำกัด"
          value={form.Usage_Limit}
          onChange={e => setForm({ ...form, Usage_Limit: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={form.Expire_Date}
          onChange={e => setForm({ ...form, Expire_Date: e.target.value })}
          className="border p-2 rounded"
        />

        <button
          disabled={loading}
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>

      </form>
    </div>
  );
}