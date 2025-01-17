import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import PromptPayQRCode from "./PromptPayQRCode";

const PaymentModal = ({ isOpen, onClose, onCheckout }) => {
    const [paymentMethod, setPaymentMethod] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [branchName, setBranchName] = useState("");
    const [branchId, setBranchId] = useState("");
    const [amountPaid, setAmountPaid] = useState("");
    const [cartData, setCartData] = useState([]);
    const [creditCardInfo, setCreditCardInfo] = useState({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolderName: "",
      email: "",
    });
  
    const fetchBranchName = useCallback(async (branchid) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
  
        const response = await axios.get(
          `http://localhost:5050/branches/${branchid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBranchName(response.data.Data.bname);
      } catch (err) {
        console.error("Error fetching branch:", err);
      }
    }, []);
  
    useEffect(() => {
      if (isOpen) {
        const token = localStorage.getItem("authToken");
        if (token) {
          const decodedToken = jwtDecode(token);
          setEmployeeId(decodedToken.employeeid);
          setBranchId(decodedToken.branchid);
          setEmployeeName(decodedToken.name);
          fetchBranchName(decodedToken.branchid);
        }
    
        const storedCartData = JSON.parse(localStorage.getItem("cartData"));
        if (storedCartData) {
          // Fetch product names
          Promise.all(
            storedCartData.map(async (item) => {
              try {
                const response = await axios.get(`http://localhost:5050/products/${item.productid}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                });
                return { ...item, name: response.data.Data.pname };
              } catch (error) {
                console.error("Error fetching product name:", error);
                return { ...item, name: "Unknown Product" }; // Fallback in case of error
              }
            })
          ).then((updatedCartData) => setCartData(updatedCartData));
        }
      }
    }, [isOpen, fetchBranchName]);    
    
    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        if (method !== "cash") setAmountPaid("");
    };

    const handleNumpadInput = (value) => {
        if (value === "clear") {
            setAmountPaid((prev) => prev.slice(0, -1));
        } else {
            setAmountPaid((prev) => prev + value);
        }
    };
  
    const handleCreditCardInputChange = (e) => {
        const { name, value } = e.target;
        setCreditCardInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleAmountChange = (event) => {
        setAmountPaid(event.target.value);
    };

    const handleConfirmPayment = () => {
      if (!paymentMethod) {
        alert("Please select a payment method.");
        return;
      }
      if (paymentMethod === "credit-card") {
        const { cardNumber, expiryDate, cvv, cardHolderName, email } =
          creditCardInfo;
        if (!cardNumber || !expiryDate || !cvv || !cardHolderName || !email) {
          alert("Please fill in all credit card details.");
          return;
        }
      }
  
      const totalAmount = cartData.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      let change = 0;
      if (paymentMethod === "cash" && amountPaid) {
        change = parseFloat(amountPaid) - totalAmount;
      }
  
      const saleItems = cartData.map((item) => ({
        productid: item.productid,
        quantity: item.quantity,
        price: item.price,
        totalprice: item.price * item.quantity,
      }));
  
      const saleData = {
        employeeid: employeeId,
        branchid: branchId,
        saleitems: saleItems,
        totalamount: totalAmount,
        paymentMethod,
        creditCardInfo: paymentMethod === "credit-card" ? creditCardInfo : null,
        change: paymentMethod === "cash" ? change : null, // Only include change for cash payments
      };
  
      console.log("Sale Data to be posted:", saleData);
  
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("No token found, please log in.");
        return;
      }
  
      axios
        .post("http://localhost:5050/sales", saleData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          onCheckout();
          clearLocalStorage();
          onClose();
        })
        .catch((error) => {
          console.error("Error posting sale:", error);
          alert("Error processing payment.");
        });
    };
  
    const clearLocalStorage = () => {
      localStorage.removeItem("cartData");
    };
  
    const handleClose = () => {
      clearLocalStorage();
      onClose();
    };

    if (!isOpen) return null;

    const totalAmount = cartData.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white p-6 rounded-lg shadow-xl relative"
        style={{ width: "900px", height: "600px" }}
      >
        {/* Left Section */}
        <div
          className="absolute left-0 top-0 p-6"
          style={{
            width: "400px",
            height: "100%",
            borderRight: "1px solid #e5e7eb",
          }}
        >
          <h2 className="text-2xl text-teal-600 font-semibold mb-4">Payment</h2>

          <div>
            <span className="block text-gray-600 text-sm mb-2 font-medium">
              Select Payment Method
            </span>
            <div className="space-y-2">
              {["credit-card", "cash", "mobile-pay"].map((method) => (
                <button
                key={method}
                onClick={() => handlePaymentMethodChange(method)}
                className={`btn block w-full rounded-lg text-sm font-medium text-left py-2 px-4 transition-all duration-300 ease-in-out ${
                  paymentMethod === method
                    ? "bg-teal-500 text-white border-2 border-teal-600"
                    : "bg-white text-gray-600 border-2 border-gray-300"
                } hover:bg-teal-500 hover:border-teal-500 hover:text-white focus:outline-none`}
                >
                    {method === "credit-card" && "Credit Card"}
                    {method === "cash" && "Cash"}
                    {method === "mobile-pay" && "Mobile Pay"}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "credit-card" && (
            <div className="mt-4">
              <h3 className="text-lg text-teal-600 font-semibold mb-4">Credit Card Details</h3>
              <div className="space-y-4">
                <input
                  name="cardNumber"
                  value={creditCardInfo.cardNumber}
                  onChange={handleCreditCardInputChange}
                  type="text"
                  placeholder="Card Number"
                  className="border-2 w-full bg-white text-gray-600 border-gray-300 rounded-lg p-2"
                />
                <div className="flex space-x-4">
                  <input
                    name="expiryDate"
                    value={creditCardInfo.expiryDate}
                    onChange={handleCreditCardInputChange}
                    type="text"
                    placeholder="Expiry Date (MM/YY)"
                    className="border-2 flex-1 bg-white text-gray-600 border-gray-300 rounded-lg p-2"
                  />
                  <input
                    name="cvv"
                    value={creditCardInfo.cvv}
                    onChange={handleCreditCardInputChange}
                    type="number"
                    placeholder="CVV"
                    className="w-2 border-2 flex-1 bg-white text-gray-600 border-gray-300 rounded-lg p-2"
                  />
                </div>
                <input
                  name="cardHolderName"
                  value={creditCardInfo.cardHolderName}
                  onChange={handleCreditCardInputChange}
                  type="text"
                  placeholder="Cardholder Name"
                  className="border-2 w-full bg-white text-gray-600 border-gray-300 rounded-lg p-2"
                />
                <input
                  name="email"
                  value={creditCardInfo.email}
                  onChange={handleCreditCardInputChange}
                  type="email"
                  placeholder="Email"
                  className="border-2 w-full bg-white text-gray-600 border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
          )}

          {paymentMethod === "cash" && (
            <div className="mt-4">
                <label
                    htmlFor="amount-paid"
                    className="block text-lg text-teal-600 font-semibold mb-2"
                >
                Amount Paid
                </label>
                    <input
                        id="amount-paid"
                        type="text"
                        value={amountPaid}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        className="border-2 w-full text-gray-600 border-gray-300 bg-white rounded-lg p-2 text-gray-800"
                    />
                <div className="grid grid-cols-3 gap-2 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                    <button
                    key={num}
                    onClick={() => handleNumpadInput(num.toString())}
                    className="btn bg-white border-teal-500 text-gray-600 p-3 rounded-lg hover:border-none hover:bg-teal-500 hover:text-white"
                    >
                    {num}
                    </button>
                ))}
                <button
                    onClick={() => handleNumpadInput("clear")}
                    className="btn bg-red-500 text-white p-3 border-none rounded-lg hover:bg-red-600 col-span-2"
                >
                    Delete
                </button>
                </div>
            </div>
            )}

            {/* Mobile Pay Section (PromptPay) */}
            {paymentMethod === "mobile-pay" && (
              <PromptPayQRCode totalAmount={totalAmount} />
            )}
        </div>

        {/* Right Section */}
        <div
          className="absolute right-0 top-0 p-6"
          style={{
            width: "500px",
            height: "100%",
          }}
        >

          {/* แสดงข้อมูลพนักงานและสาขา */}
          <div className="mb-4">
            <p className="text-gray-600">
              <span className="font-semibold">Employee:</span> {employeeName}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Branch:</span> {branchName}
            </p>
          </div>

          {/* Cart Summary */}
          
          <h3 className="text-xl text-teal-600 font-medium mb-4">Cart Summary</h3>
          <div className="mt-4" style={{ maxHeight: "330px", overflowY: "auto" }}>
            <ul className="divide-y divide-gray-200">
              {cartData.map((item, index) => (
                <li key={index} className="text-gray-600 py-2 flex justify-between">
                  <span>
                  x{item.quantity} {item.productname} 
                  </span>
                  <span className="mr-2">฿{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>


          {/* Total Amount */}
          <div className="mt-4 flex justify-between">
            <span className="text-gray-600 font-semibold">Total Amount</span>
            <span className="text-gray-600">฿{totalAmount.toFixed(2)}</span>
          </div>

          {/* Change if payment is cash */}
          {paymentMethod === "cash" && amountPaid && (
            <div className="mt-4 flex justify-between">
              <span className="font-semibold text-gray-600">Change</span>
              <span className="text-gray-600">฿{(parseFloat(amountPaid) - totalAmount).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <div className="absolute bottom-6 right-6">
          <button
            onClick={handleConfirmPayment}
            className="btn bg-teal-500 text-white border-none px-6 py-2 rounded-lg shadow-md hover:bg-teal-600 focus:outline-none"
          >
            Confirm Payment
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
