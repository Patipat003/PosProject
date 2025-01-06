import React, { useState, useEffect } from "react";
import axios from "axios";
import EditedProduct from "../components/layout/ui/EditedProduct";
import ExportButtons from "../components/layout/ui/ExportButtons";

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  // ฟังก์ชันดึงข้อมูลสินค้า
  const fetchInventory= async () => {
    try {
      const response = await axios.get("http://localhost:5050/inventory");
      setInventory(response.data.Data); // ตั้งค่าข้อมูลที่ได้จาก API
      setLoading(false);
    } catch (err) {
      setError("Failed to load products");
      setLoading(false);
    }
  };

  // ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async (inventoryId) => {
    try {
      const response = await axios.delete(`http://localhost:5050/inventory/${inventoryId}`);
      if (response.status === 200) {
        // หากการลบสำเร็จ รีเฟรชข้อมูลสินค้า
        fetchInventory();
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // รีเฟรชข้อมูลสินค้าเมื่อมีการเพิ่มสินค้าใหม่
  const handleEditedProduct= () => {
    fetchInventory();
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-black mb-4">Inventory</h1>
      <p className="text-black mb-4">Manage your Product here.</p>

      <div className="flex space-x-4 mb-4">
        <ExportButtons filteredProducts={inventory} />
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full table-striped">
          <thead>
            <tr>
              <th className="text-black">Product Id</th>
              <th className="text-black">Branch Id</th>
              <th className="text-black">Quantity</th>
              <th className="text-black">Updated At</th>

            </tr>
          </thead>
          <tbody>
            {inventory.map((inventory) => (
              <tr key={inventory.inventoryid}>
                <td className="text-black">{inventory.productid}</td>
                <td className="text-black">{inventory.branchid}</td>
                <td className="text-black">{inventory.quantity}</td>
                <td className="text-black">{inventory.updatedat}</td>
                <td className="text-black">
                  {/* ปุ่มลบ */}
                  <button
                    onClick={() => handleDeleteProduct(inventory.inventoryid)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
                <td className="text-black">
                  {/* แก้ไข */}
                  <EditedProduct onProductAdded={handleEditedProduct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
