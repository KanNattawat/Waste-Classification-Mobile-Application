"use client";

import { useState } from "react";

const API_BASE_URL = "https://waste-classification-mobile-application.onrender.com/manage"; 


export default function PointShopClient({ initialItems, token }: { initialItems: any[], token: string }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    Item_name: "",
    Usage_Limit: "",
    Point_Usage: "",
    Expire_Date: "",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  
  const getAuthHeaders = () => {
    return {
      "Authorization": `Bearer ${token}` 
    };
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/getallitem`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const method = editingId ? "PUT" : "POST";
    const url = editingId 
      ? `${API_BASE_URL}/updateitem/${editingId}` 
      : `${API_BASE_URL}/createitem`;

    const submitData = new FormData();
    submitData.append("Item_name", formData.Item_name);
    submitData.append("Usage_Limit", formData.Usage_Limit.toString());
    submitData.append("Point_Usage", formData.Point_Usage.toString());
    submitData.append("Expire_Date", formData.Expire_Date);
    
    if (imageFile) {
      submitData.append("Image_path", imageFile);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(), 
        body: submitData, 
      });

      if (res.ok) {
        alert(editingId ? "อัปเดตสำเร็จ" : "สร้างสินค้าเรียบร้อย");
        cancelEdit(); 
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
    setImageFile(null); 
    const fileInput = document.getElementById("imageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ Item_name: "", Usage_Limit: "", Point_Usage: "", Expire_Date: "" });
    setImageFile(null);
    const fileInput = document.getElementById("imageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/deleteitem/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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
          {editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
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
          
          {/* 🌟 7. ช่องสำหรับอัปโหลดรูปภาพ */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              รูปภาพสินค้า {editingId && <span className="text-gray-400 font-normal">(อัปโหลดใหม่เมื่อต้องการเปลี่ยนรูปเท่านั้น)</span>}
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!editingId} // บังคับใส่อัปโหลดเฉพาะตอนสร้างใหม่เท่านั้น ตอนแก้ไม่ต้องบังคับ
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รูปภาพ</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.Item_Image_path ? (
                        <img 
                          src={item.Item_Image_path} 
                          alt={item.Item_name} 
                          className="w-12 h-12 object-cover rounded shadow-sm border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          ไม่มีรูป
                        </div>
                      )}
                    </td>
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