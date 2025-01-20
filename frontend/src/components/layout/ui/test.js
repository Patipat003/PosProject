const fetchLowStockItems = useCallback(async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      return;
    }

    const decodedToken = jwtDecode(token);
    const branchid = decodedToken.branchid;

    const response = await axios.get(
      `http://localhost:5050/inventory?branchid=${branchid}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const inventoryItems = response.data.Data;
    const lowStockItems = inventoryItems.filter(item => item.quantity < 10);

    // ตรวจสอบว่า productid (ตัวเล็ก) ไม่เป็น undefined ก่อนที่จะทำคำขอ API
    const lowStockItemsWithDetails = await Promise.all(
      lowStockItems.map(async (item) => {
        if (!item.productid) { // ใช้ productid (ตัวเล็ก)
          console.warn(`Skipping item with invalid productid:`, item);
          return item; // ข้าม item นี้ไปหากไม่มี productid
        }

        try {
          const productResponse = await axios.get(
            `http://localhost:5050/products/${item.productid}`, // ใช้ productid (ตัวเล็ก)
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const product = productResponse.data;
          return {
            ...item,
            productName: product.productname,
            price: product.price, // เพิ่ม price
          };
        } catch (err) {
          console.error("Error fetching product details:", err);
          return item;
        }
      })
    );

    setLowStockNotifications(lowStockItemsWithDetails);
  } catch (err) {
    console.error("Error fetching inventory:", err);
  }
}, []);
