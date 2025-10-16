import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaShoppingCart, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaExclamationTriangle,
  FaBoxOpen,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

const PurchaseOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [receivingItems, setReceivingItems] = useState({});
  const [receivingLoading, setReceivingLoading] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [page, statusFilter]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      
      const response = await apiClient.get('/orders/purchase', { params });
      console.log('Fetched Orders:', response.data);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch purchase orders');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/purchase/${orderId}`);
      setSelectedOrder(response.data);
      setShowModal(true);
      
      // Initialize receiving items with 0 quantities
      const initialReceiving = {};
      response.data.items.forEach(item => {
        initialReceiving[item._id] = {
          received: item.received || 0,
          toReceive: Math.max(0, (item.quantity - (item.received || 0)))
        };
      });
      setReceivingItems(initialReceiving);
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Error:', err);
    }
  };

  const handleReceiveItem = (itemId, value) => {
    const numericValue = parseInt(value) || 0;
    const maxAllowed = selectedOrder.items.find(item => item._id === itemId).quantity - 
                       (selectedOrder.items.find(item => item._id === itemId).received || 0);
    
    setReceivingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        toReceive: Math.min(Math.max(0, numericValue), maxAllowed)
      }
    }));
  };

  const submitReceiving = async () => {
    try {
      setReceivingLoading(true);
      
      // Prepare the receive data
      const receiveData = {
        items: Object.entries(receivingItems).map(([itemId, values]) => ({
          item_id: itemId,
          quantity_received: values.toReceive
        }))
      };

      console.log('Submitting Receive Data:', receiveData.items);
      
      await apiClient.post(`/orders/purchase/${selectedOrder._id}/receive`, { received_items: receiveData.items });
      
      // Refresh the orders list and close the modal
      fetchPurchaseOrders();
      setShowModal(false);
      setSelectedOrder(null);
      setReceivingItems({});
      
    } catch (err) {
      setError('Failed to receive items');
      console.error('Error:', err);
    } finally {
      setReceivingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { color: 'bg-gray-100 text-gray-800', icon: FaClock },
      Ordered: { color: 'bg-blue-100 text-blue-800', icon: FaClock },
      Received: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      'Partially Received': { color: 'bg-yellow-100 text-yellow-800', icon: FaExclamationTriangle },
      Cancelled: { color: 'bg-red-100 text-red-800', icon: FaExclamationTriangle }
    };
    
    const config = statusConfig[status] || statusConfig.Draft;
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
        <Icon className="text-xs" />
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const canReceiveStock = (order) => {
    return order.status === 'Ordered' || order.status === 'Partially Received';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-teal-600" />
            Purchase Orders
          </h1>
          <p className="text-gray-600">Manage your pharmacy purchase orders</p>
        </div>
        <Link
          to="/dashboard/pharmacy/create-order"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FaPlus /> Create Purchase Order
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-teal-600">{order.order_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{order.supplier_id?.name}</div>
                    <div className="text-sm text-gray-500">{order.supplier_id?.contactPerson}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {new Date(order.order_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {order.items.length} items
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fetchOrderDetails(order._id)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                        title="View Order"
                      >
                        <FaEye />
                      </button>
                      {order.status === 'Draft' && (
                        <Link
                          to={`/dashboard/pharmacy/purchasing/edit-order/${order._id}`}
                          className="text-teal-600 hover:text-teal-800 p-2 rounded hover:bg-teal-50"
                          title="Edit Order"
                        >
                          <FaEdit />
                        </Link>
                      )}
                      {canReceiveStock(order) && (
                        <button
                          onClick={() => fetchOrderDetails(order._id)}
                          className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50"
                          title="Receive Stock"
                        >
                          <FaBoxOpen />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No purchase orders found</p>
            <Link
              to="/dashboard/pharmacy/create-order"
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Create your first purchase order
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Order #{selectedOrder.order_number}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
                  setReceivingItems({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Supplier Information</h3>
                  <p className="text-gray-900">{selectedOrder.supplier_id?.name}</p>
                  <p className="text-gray-600">{selectedOrder.supplier_id?.contactPerson}</p>
                  <p className="text-gray-600">{selectedOrder.supplier_id?.email}</p>
                  <p className="text-gray-600">{selectedOrder.supplier_id?.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Order Details</h3>
                  <p className="text-gray-600">Date: {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                  <p className="text-gray-600">Expected Delivery: {new Date(selectedOrder.expected_delivery_date).toLocaleDateString()}</p>
                  <p className="text-gray-600">Status: {getStatusBadge(selectedOrder.status)}</p>
                  <p className="text-gray-600">Total: {formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ordered Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Received Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                        {canReceiveStock(selectedOrder) && (
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receive Now</th>
                        )}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item._id}>
                          <td className="px-4 py-2">
                            <div className="font-medium">{item.medicine_id?.name}</div>
                            <div className="text-sm text-gray-500">{item.medicine_id?._id}</div>
                          </td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">{item.received || 0}</td>
                          <td className="px-4 py-2">{item.quantity - (item.received || 0)}</td>
                          {canReceiveStock(selectedOrder) && (
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min="0"
                                max={item.quantity - (item.received || 0)}
                                value={receivingItems[item._id]?.toReceive || 0}
                                onChange={(e) => handleReceiveItem(item._id, e.target.value)}
                                className="w-20 p-1 border rounded"
                                disabled={item.quantity - (item.received || 0) === 0}
                              />
                            </td>
                          )}
                          <td className="px-4 py-2">{formatCurrency(item.unit_cost)}</td>
                          <td className="px-4 py-2">{formatCurrency(item.unit_cost * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Receive Action */}
              {canReceiveStock(selectedOrder) && (
                <div className="flex justify-end">
                  <button
                    onClick={submitReceiving}
                    disabled={receivingLoading || Object.values(receivingItems).every(item => item.toReceive === 0)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {receivingLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaCheck />
                    )}
                    Receive Items
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersList;