import { useState, useEffect, useRef } from 'react';
import '../styles/TransactionTable.css';

const TransactionTable = ({ transactions }) => {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      setShowScrollHint(container.scrollWidth > container.clientWidth);
    }
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Delivered': 'status-delivered',
      'Shipped': 'status-shipped',
      'Processing': 'status-processing',
      'Cancelled': 'status-cancelled',
      'Pending': 'status-pending',
      'Returned': 'status-returned',
      'Completed': 'status-completed'
    };
    return statusMap[status] || 'status-default';
  };

  return (
    <div className="table-wrapper">
      <div className="table-container" ref={tableContainerRef}>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Product Category</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Customer Region</th>
              <th>Product ID</th>
              <th>Employee Name</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={`${transaction['Transaction ID']}-${index}`}>
                <td>{transaction['Transaction ID']}</td>
                <td className="date-cell">{formatDate(transaction['Date'])}</td>
                <td>{transaction['Customer ID']}</td>
                <td>{transaction['Customer Name']}</td>
                <td>{transaction['Phone Number']}</td>
                <td>{transaction['Gender']}</td>
                <td>{transaction['Age']}</td>
                <td>{transaction['Product Category']}</td>
                <td className="quantity-cell">{transaction['Quantity']}</td>
                <td className="amount-cell">{formatCurrency(transaction['Total Amount'] || transaction['Final Amount'])}</td>
                <td>{transaction['Customer Region']}</td>
                <td>{transaction['Product ID']}</td>
                <td>{transaction['Employee Name']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
