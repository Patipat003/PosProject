import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify"; 
import { AnimatePresence, motion } from "framer-motion"; 
import { useStockThreshold } from "../../Contexts/StockThresholdContext";

const StockLowModal = ({ closeModal }) => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const { lowStockThreshold } = useStockThreshold();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const getBranchIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setBranchId(decodedToken.branchid);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" },
      });
      setProducts(response.data.Data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !branchId) return;

      const response = await axios.get(
        `${API_BASE_URL}/inventory?branchid=${branchId}`,
        {
          headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" },
        }
      );
      setInventory(response.data.Data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  const handleRequest = async () => {
    if (selectedProduct && quantity > 0) {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const requestData = {
        productid: selectedProduct.productid,
        quantity: parseInt(quantity, 10),
        tobranchid: branchId,
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/requests/auto`,
          requestData,
          { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } }
        );

        if (response.status === 200) {
          toast.success("Request sent successfully!");
          closeModal();
        } else {
          toast.error("Failed to send request. Please try again.");
        }
      } catch (error) {
        toast.error("Error sending request: " + error.message);
      }
    } else {
      toast.error("Invalid product or quantity. Please check your input.");
    }
  };

  const handleCreateShipment = async () => {
    if (selectedProduct && quantity > 0) {
      const token = localStorage.getItem("authToken");
      if (!token) return;
  
      const shipmentData = {
        branchid: branchId, // The branch ID from the token
        items: [
          {
            productid: selectedProduct.productid,
            quantity: parseInt(quantity, 10),
          },
        ],
      };
  
      try {
        const response = await axios.post(
          `${API_BASE_URL}/shipments`,
          shipmentData,
          { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } }
        );
  
        if (response.status === 200) {
          toast.success("Shipment created successfully!");
          closeModal();
        } else {
          toast.error("Failed to create shipment. Please try again.");
        }
      } catch (error) {
        toast.error("Error creating shipment: " + error.message);
      }
    } else {
      toast.error("Invalid product or quantity. Please check your input.");
    }
  };

  const filterLowStockProducts = () => {
    if (branchId && inventory.length > 0 && products.length > 0) {
      const filtered = products.filter((product) => {
        const stock = inventory.find(
          (item) => item.productid === product.productid && item.branchid === branchId
        );
        return stock && stock.quantity < lowStockThreshold; 
      });
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    getBranchIdFromToken();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (branchId) {
      fetchInventory();
    }
  }, [branchId]);

  useEffect(() => {
    filterLowStockProducts();
  }, [branchId, inventory, products]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={closeModal}
      >
        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl text-gray-600 font-semibold mb-4">
            Low Stock Products
          </h2>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products with low stock in your branch.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto table-xs min-w-full border-4 border-gray-300 mb-4 text-gray-800">
                <thead>
                  <tr className="bg-gray-100 text-gray-600">
                    <th className="border border-gray-300 px-4 py-2">No.</th>
                    <th className="border border-gray-300 px-4 py-2">Image</th>
                    <th className="border border-gray-300 px-4 py-2">Product Code</th>
                    <th className="border border-gray-300 px-4 py-2">Product Name</th>
                    <th className="border border-gray-300 px-4 py-2">Stock</th>
                    <th className="border border-gray-300 px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => {
                    const stock = inventory.find(
                      (item) => item.productid === product.productid && item.branchid === branchId
                    );
                    return (
                      <tr key={product.productid} className="text-center">
                        <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <img
                            src={product.imageurl}
                            alt={product.productname}
                            className="w-16 h-16 object-cover mx-auto rounded"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{product.productcode}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.productname}</td>
                        <td className="border border-gray-300 px-4 py-2">{stock ? stock.quantity : 0} left</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowQuantityModal(true);
                            }}
                            className="btn btn-sm border-red-600 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600"
                          >
                            Request
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {showQuantityModal && selectedProduct && (
            <AnimatePresence onExitComplete={() => setShowQuantityModal(false)}>
              <motion.div
                className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-white p-8 rounded-lg shadow-lg w-2/4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-gray-700 font-semibold mb-2">Enter Quantity</h3>
                  <h2 className="text-gray-700 mb-4">{selectedProduct.productcode} - {selectedProduct.productname}</h2>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input text-gray-600 bg-white p-4 border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-red-600"
                    min="1"
                  />
                  <div className="space-x-4 flex justify-end">
                    <button
                      onClick={handleRequest}
                      className="btn border-red-600 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 mt-4"
                    >
                      Branch Request
                    </button>
                    <button
                      onClick={handleCreateShipment}
                      className="btn border-blue-600 bg-white text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 mt-4"
                    >
                      Warehouse Request
                    </button>
                    <button
                      onClick={() => setShowQuantityModal(false)}
                      className="btn border-gray-600 bg-white text-gray-600 rounded-lg hover:bg-gray-600 hover:text-white hover:border-gray-600 mt-4"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StockLowModal;
