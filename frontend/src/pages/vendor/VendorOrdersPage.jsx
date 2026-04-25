import { useState, useEffect } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { getAllOrders, updateOrderStatus } from "../../api/ordersApi.js";
import "../../styles/VendorOrdersPage.css";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "#FF6B6B" },
  { value: "preparing", label: "Preparing", color: "#FFA500" },
  { value: "cooking", label: "Cooking", color: "#FF8C00" },
  { value: "ready_for_pickup", label: "Ready for Pickup", color: "#4ECDC4" },
  { value: "completed", label: "Completed", color: "#51CF66" },
  { value: "cancelled", label: "Cancelled", color: "#909090" },
];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }
      const data = await getAllOrders(filters);
      setOrders(data);
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) => (order._id === updated._id ? updated : order)),
      );
      showToast("Order status updated successfully");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === status);
    return statusObj?.color || "#999";
  };

  const getStatusLabel = (status) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === status);
    return statusObj?.label || status;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="vendor-orders-page">
      <Navbar />

      <div className="vendor-orders-container">
        <div className="vendor-orders-header">
          <h1>📋 Order Management</h1>
          <p>Total Orders: {orders.length}</p>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Orders</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        )}

        {/* Loading State */}
        {loading && <div className="loading">Loading orders...</div>}

        {/* Error State */}
        {error && <div className="error-message">Error: {error}</div>}

        {/* Orders List */}
        {!loading && !error && orders.length === 0 && (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                {/* Order Header */}
                <div className="order-header">
                  <div className="order-id-section">
                    <span className="order-id">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="order-date">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Student Info */}
                <div className="student-info">
                  <div className="info-row">
                    <span className="label">Student:</span>
                    <span className="value">{order.studentName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{order.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Type:</span>
                    <span className="value">{order.orderType}</span>
                  </div>
                  {order.deliveryAddress && (
                    <div className="info-row">
                      <span className="label">Address:</span>
                      <span className="value">{order.deliveryAddress}</span>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="order-items">
                  <h4>Items</h4>
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                      <span className="item-price">Rs {item.subtotal}</span>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="order-total">
                  <span>Total Amount:</span>
                  <span className="total-amount">Rs {order.totalAmount}</span>
                </div>

                {/* Order Time */}
                <div className="order-time">
                  Ordered at: {formatTime(order.createdAt)}
                </div>

                {/* Status Update Controls */}
                <div className="status-controls">
                  <label>Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(order._id, e.target.value)
                    }
                    className="status-select"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
