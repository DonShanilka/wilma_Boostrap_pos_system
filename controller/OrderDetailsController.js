// orderDetailsController.js

// DOM Elements
const orderTableBody = $("#order-details-tbody");
const customerCountLabel = $("#customerCount-lable");
const itemCountLabel = $("#item-count-lable");
const orderCountLabel = $("#order-lable");
const searchBtn = $("#search4");
const searchField = $("#searchField4");

// Load all orders on document ready
$(document).ready(function () {
  loadAllOrders();
});

// Function to load all orders
function loadAllOrders() {
  $.ajax({
    url: "http://localhost:2000/api/order/getAllOrders",
    type: "GET",
    contentType: "application/json",
    success: function (orders) {
      console.log("Orders Loaded:", orders);
      orderTableBody.empty();
      orders.forEach((order) => {
        const row = `
          <tr>
            <td>${order.orderId}</td>
            <td>${order.orderDate}</td>
            <td>${order.customerId}</td>
            <td>${order.total}</td>
            <td>${order.discount}</td>
            <td>${order.subTotal}</td>
            <td>${order.cash}</td>
            <td>${order.balance}</td>
          </tr>
        `;
        orderTableBody.append(row);
      });
      // Update counts
      orderCountLabel.text(orders.length);
      updateCustomerAndItemCounts();
    },
    error: function (xhr, status, error) {
      console.error("Error loading orders:", error);
      Swal.fire("Error", "Failed to load order data", "error");
    },
  });
}

// Function to update customer and item counts
function updateCustomerAndItemCounts() {
  // Fetch customers
  $.ajax({
    url: "http://localhost:2000/api/customer/getAllCustomers",
    type: "GET",
    contentType: "application/json",
    success: function (customers) {
      customerCountLabel.text(customers.length);
    },
    error: function (xhr, status, error) {
      console.error("Error loading customers:", error);
    },
  });

  // Fetch items
  $.ajax({
    url: "http://localhost:2000/api/item/getAllItems",
    type: "GET",
    contentType: "application/json",
    success: function (items) {
      itemCountLabel.text(items.length);
    },
    error: function (xhr, status, error) {
      console.error("Error loading items:", error);
    },
  });
}

// Search functionality
searchBtn.on("click", function () {
  const query = searchField.val().trim();
  if (!query) {
    Swal.fire("Input Required", "Please enter a search term.", "warning");
    return;
  }

  $.ajax({
    url: `http://localhost:2000/api/order/searchOrder/${query}`,
    type: "GET",
    contentType: "application/json",
    success: function (orders) {
      if (orders.length === 0) {
        Swal.fire("No Results", "No orders found matching your search.", "info");
        return;
      }
      orderTableBody.empty();
      orders.forEach((order) => {
        const row = `
          <tr>
            <td>${order.orderId}</td>
            <td>${order.orderDate}</td>
            <td>${order.customerId}</td>
            <td>${order.total}</td>
            <td>${order.discount}</td>
            <td>${order.subTotal}</td>
            <td>${order.cash}</td>
            <td>${order.balance}</td>
          </tr>
        `;
        orderTableBody.append(row);
      });
    },
    error: function (xhr, status, error) {
      console.error("Error searching orders:", error);
      Swal.fire("Error", "Failed to search orders", "error");
    },
  });
});
