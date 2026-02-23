"use client";

import { useState } from "react";

const API_BASE_URL = "https://waste-classification-mobile-application.onrender.com/manage"; 

// รับ Props จาก Server Component
export default function PointShopClient({ initialItems, token }: { initialItems: any[], token: string }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    Item_name: "",
    Usage_Limit: "",
    Point_Usage: "",
    Expire_Date: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // ฟังก์ชันใช้ Token ที่รับมาจาก Props แทน LocalStorage
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    };
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/getallitem`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      
      if (res.ok) {
        setItems(data);
      } else {
        console.error("Failed to fetch items:", data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const method = editingId ? "PUT" : "POST";
    const url = editingId 
      ? `${API_BASE_URL}/updateitem/${editingId}` 
      : `${API_BASE_URL}/createitem`;

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(editingId ? "อัปเดตสำเร็จ" : "สร้างสินค้าเรียบร้อย");
        setFormData({ Item_name: "", Usage_Limit: "", Point_Usage: "", Expire_Date: "" });
        setEditingId(null);
        fetchItems(); 
      } else {
        const errData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errData.error || 'คุณอาจไม่มีสิทธิ์แอดมิน'}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.Item_ID);
    setFormData({
      Item_name: item.Item_name,
      Usage_Limit: item.Usage_Limit,
      Point_Usage: item.Point_Usage,
      Expire_Date: new Date(item.Expire_Date).toISOString().split("T")[0], 
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ Item_name: "", Usage_Limit: "", Point_Usage: "", Expire_Date: "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/deleteitem/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      if (res.ok) {
        alert("ลบสำเร็จ");
        fetchItems();
      } else {
        const errData = await res.json();
        alert(`เกิดข้อผิดพลาดในการลบ: ${errData.error || 'คุณอาจไม่มีสิทธิ์แอดมิน'}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">ระบบจัดการ Point Shop</h1>

      {/* ฟอร์มเพิ่ม/แก้ไขสินค้า */}
      <div className="bg-gray-50 p-6 rounded-lg border mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingId ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้าใหม่"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อสินค้า</label>
            <input
              type="text"
              name="Item_name"
              value={formData.Item_name}
              onChange={handleInputChange}
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น บัตรส่วนลด 50 บาท"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">จำนวนที่ใช้ได้ (Usage Limit)</label>
            <input
              type="number"
              name="Usage_Limit"
              value={formData.Usage_Limit}
              onChange={handleInputChange}
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">พอยท์ที่ใช้ (Point Usage)</label>
            <input
              type="number"
              name="Point_Usage"
              value={formData.Point_Usage}
              onChange={handleInputChange}
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">วันหมดอายุ</label>
            <input
              type="date"
              name="Expire_Date"
              value={formData.Expire_Date}
              onChange={handleInputChange}
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2 flex gap-2 mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingId ? "บันทึกการเปลี่ยนแปลง" : "สร้างสินค้า"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ตารางแสดงข้อมูลสินค้า */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อสินค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Point</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันหมดอายุ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">ยังไม่มีข้อมูลสินค้า</td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.Item_ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{item.Item_ID}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.Item_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.Usage_Limit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-semibold">{item.Point_Usage}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(item.Expire_Date).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(item.Item_ID)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}