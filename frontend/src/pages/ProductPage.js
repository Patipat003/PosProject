import React, { useState, useEffect } from "react";
import axios from "axios"; // นำเข้า axios สำหรับดึงข้อมูลจาก API
import ProductForm from "../components/layout/ui/ProductForm";
import ExportButtons from "../components/layout/ui/ExportButtons"; // นำเข้า ExportButtons

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("name");
  const [products, setProducts] = useState([]); // เริ่มต้นเป็น array ว่างๆ
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const [error, setError] = useState(null); // เก็บข้อมูล error หากเกิดข้อผิดพลาด

  // ฟังก์ชันที่ใช้ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ดึงข้อมูลจาก API
        const response = await axios.get("https://676baf94bc36a202bb854850.mockapi.io/products"); // แทนที่ด้วย API ของคุณ
        setProducts(response.data); // ตั้งค่าข้อมูลที่ได้จาก API
        setLoading(false); // เปลี่ยนสถานะการโหลดข้อมูลเป็น false
      } catch (err) {
        setError("Failed to load products");
        setLoading(false); // เปลี่ยนสถานะการโหลดข้อมูลเป็น false
      }
    };

    fetchProducts(); // เรียกฟังก์ชันดึงข้อมูล
  }, []); // ดึงข้อมูลเมื่อเพจโหลด

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (event) => {
    setSortType(event.target.value);
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return a.category.localeCompare(b.category);
      }
    });

  // ตรวจสอบสถานะการโหลดข้อมูล
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-black mb-4">Product</h1>
      <p className="text-black mb-4">Manage your Product here.</p>

      {/* ปุ่ม Add Product และ Export PDF, Export CSV อยู่ข้างกันในแถวเดียว */}
      <div className="flex space-x-4 mb-4">
        <ProductForm />
        <ExportButtons filteredProducts={filteredProducts} />
      </div>

      {/* ช่องค้นหา และเลือกการจัดเรียง */}
      <div className="flex space-x-4 mb-4">
        <div className="flex items-center">
          <label htmlFor="search" className="mr-2 text-black">Search: </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="input input-bordered bg-white text-black w-64"
            placeholder="Search by product name"
          />
        </div>

        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-black">Sort by: </label>
          <select
            id="sort"
            value={sortType}
            onChange={handleSort}
            className="select select-bordered bg-white text-black w-64"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* แสดงข้อมูลสินค้าในรูปแบบตาราง */}
      <div className="overflow-x-auto">
        <table className="table w-full table-striped">
          <thead>
            <tr>
              <th className="text-black">Name</th>
              <th className="text-black">Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="text-black">{product.name}</td>
                <td className="text-black">{product.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductPage;
