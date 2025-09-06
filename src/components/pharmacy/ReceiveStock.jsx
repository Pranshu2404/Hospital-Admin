import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaTruck, 
  FaCheck, 
  FaTimes,
  FaBox,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const ReceiveStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [batches, setBatches] = useState([]);
  const [showBatchManager, setShowBatchManager] = useState(false);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpiring, setFilterExpiring] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchBatches();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/orders/purchase/${id}`);
      setOrder(response.data);
      
      // Initialize received quantities
      const receivedItems = response.data.items.map(item => ({
        item_id: item._id,
        medicine_id: item.medicine_id?._id || item.medicine_id,
        received_quantity: 0,
        batch_number: generateBatchNumber(),
        expiry_date: '',
        notes: ''
      }));
      
      setFormData({ received_items: receivedItems });
    } catch (err) {
      console.error('Error fetching order:', err);
      alert('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await apiClient.get('/api/batches');
      setBatches(response.data.batches || response.data);
      setFilteredBatches(response.data.batches || response.data);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const generateBatchNumber = () => {
    const prefix = 'BATCH';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    return `${prefix}-${date}-${random}`;
  };

  const [formData, setFormData] = useState({
    received_items: []
  });

  const updateReceivedItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      received_items: prev.received_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setReceiving(true);

  try {
    // First receive the stock through the purchase order API
    await apiClient.post(`/api/orders/purchase/${id}/receive`, formData);
    
    // Then create batch records and stock adjustments for auditing
    for (const item of formData.received_items) {
      if (item.received_quantity > 0) {
        // Create batch record
        const batchResponse = await apiClient.post('/api/batches', {
          medicine_id: item.medicine_id,
          batch_number: item.batch_number,
          quantity: item.received_quantity,
          expiry_date: item.expiry_date,
          supplier: order.supplier_id?.name,
          purchase_order: order.order_number,
          notes: item.notes
        });

        // Create stock adjustment for auditing
        await apiClient.post('/api/stock-adjustments', {
          medicine_id: item.medicine_id,
          batch_id: batchResponse.data._id, // Reference the created batch
          adjustment_type: 'Addition',
          quantity: item.received_quantity,
          reason: 'Purchase Order Receipt',
          notes: `Received from PO: ${order.order_number}, Batch: ${item.batch_number}`,
          reference: order.order_number
        });
      }
    }
    
    alert('Stock received successfully with complete audit trail!');
    navigate('/dashboard/pharmacy/orders');
  } catch (err) {
    alert('Failed to receive stock');
    console.error('Error:', err);
  } finally {
    setReceiving(false);
  }
};

  const filterBatches = (term, expiringOnly) => {
    let filtered = batches;
    
    if (term) {
      filtered = filtered.filter(batch => 
        batch.batch_number.toLowerCase().includes(term.toLowerCase()) ||
        (batch.medicine_id?.name && batch.medicine_id.name.toLowerCase().includes(term.toLowerCase()))
      );
    }
    
    if (expiringOnly) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filtered = filtered.filter(batch => 
        new Date(batch.expiry_date) <= thirtyDaysFromNow
      );
    }
    
    setFilteredBatches(filtered);
  };

  useEffect(() => {
    filterBatches(searchTerm, filterExpiring);
  }, [searchTerm, filterExpiring, batches]);

  const isExpiringSoon = (expiryDate) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expiryDate) <= thirtyDaysFromNow;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Failed to load order details.</p>
        <button 
          onClick={() => navigate('/dashboard/pharmacy/purchasing/orders')}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaTruck className="text-green-600" />
            Receive Stock - {order.order_number}
          </h1>
          <p className="text-gray-600">Receive purchased items into inventory</p>
        </div>
        <button
          onClick={() => setShowBatchManager(!showBatchManager)}
          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200"
        >
          <FaBox /> {showBatchManager ? 'Hide Batch Manager' : 'Show Batch Manager'}
        </button>
      </div>

      {/* Batch Manager Modal */}
      {showBatchManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Batch Management</h2>
              <button 
                onClick={() => setShowBatchManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filterExpiring}
                  onChange={(e) => setFilterExpiring(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show expiring soon only</span>
              </label>
            </div>
            
            {/* Batches Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Batch Number</th>
                    <th className="py-2 px-4 text-left">Medicine</th>
                    <th className="py-2 px-4 text-left">Quantity</th>
                    <th className="py-2 px-4 text-left">Expiry Date</th>
                    <th className="py-2 px-4 text-left">Supplier</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map(batch => (
                    <tr key={batch._id} className="border-b">
                      <td className="py-2 px-4">{batch.batch_number}</td>
                      <td className="py-2 px-4">{batch.medicine_id?.name || 'N/A'}</td>
                      <td className="py-2 px-4">{batch.quantity}</td>
                      <td className="py-2 px-4">
                        {new Date(batch.expiry_date).toLocaleDateString()}
                        {isExpiringSoon(batch.expiry_date) && (
                          <FaExclamationTriangle className="inline ml-2 text-yellow-500" />
                        )}
                      </td>
                      <td className="py-2 px-4">{batch.supplier || 'N/A'}</td>
                      <td className="py-2 px-4">
                        {new Date(batch.expiry_date) < new Date() ? (
                          <span className="text-red-600">Expired</span>
                        ) : isExpiringSoon(batch.expiry_date) ? (
                          <span className="text-yellow-600">Expiring Soon</span>
                        ) : (
                          <span className="text-green-600">Good</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredBatches.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No batches found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Order Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Supplier:</span>
            <p className="font-medium">{order.supplier_id?.name}</p>
          </div>
          <div>
            <span className="text-gray-600">Order Date:</span>
            <p>{new Date(order.order_date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-600">Expected Delivery:</span>
            <p>{order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'Not specified'}</p>
          </div>
          <div>
            <span className="text-gray-600">Total Amount:</span>
            <p className="font-medium">₹{order.total_amount?.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border space-y-6">
        {/* Receive Items */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Receive Items</h3>
          
          {order.items.map((orderItem, index) => {
            const receivedItemIndex = formData.received_items.findIndex(ri => ri.item_id === orderItem._id);
            const receivedItem = receivedItemIndex !== -1 ? formData.received_items[receivedItemIndex] : {};
            const isExpired = receivedItem.expiry_date && new Date(receivedItem.expiry_date) < new Date();
            
            return (
              <div key={orderItem._id} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medicine</label>
                  <p className="font-medium">{orderItem.medicine_id?.name}</p>
                  <p className="text-sm text-gray-500">Ordered: {orderItem.quantity}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receive Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={orderItem.quantity}
                    value={receivedItem.received_quantity || 0}
                    onChange={(e) => updateReceivedItem(
                      receivedItemIndex,
                      'received_quantity',
                      parseInt(e.target.value)
                    )}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={receivedItem.batch_number || ''}
                    onChange={(e) => updateReceivedItem(
                      receivedItemIndex,
                      'batch_number',
                      e.target.value
                    )}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="BATCH-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={receivedItem.expiry_date || ''}
                    onChange={(e) => updateReceivedItem(
                      receivedItemIndex,
                      'expiry_date',
                      e.target.value
                    )}
                    className={`w-full p-2 border rounded-lg ${isExpired ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {isExpired && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationTriangle /> This batch has expired
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <input
                    type="text"
                    value={receivedItem.notes || ''}
                    onChange={(e) => updateReceivedItem(
                      receivedItemIndex,
                      'notes',
                      e.target.value
                    )}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Optional notes"
                  />
                </div>

                <div className="flex items-end">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaBox />
                      <span>Unit Cost: ₹{orderItem.unit_cost}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <FaCalendarAlt />
                      <span>Total: ₹{(orderItem.unit_cost * (receivedItem.received_quantity || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={receiving}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <FaCheck /> {receiving ? 'Receiving...' : 'Complete Receiving'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/pharmacy/purchasing/orders')}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReceiveStock;