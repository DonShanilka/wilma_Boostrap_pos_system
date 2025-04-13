// Initialize when the document is ready
$(document).ready(function() {
    // Load initial data
    loadAllCustomers();
    loadAllItems();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Generate order ID
    generateOrderID();
    
    // Set current date
    setCurrentDate();
});

// Generate a unique order ID
function generateOrderID() {
    const orderID = "ORD-" + new Date().getTime();
    $("#order_id").val(orderID);
}

// Set the current date in the order date field
function setCurrentDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    $("#order_date").val(formattedDate);
}

// Load all customers from the API
function loadAllCustomers() {
    $.ajax({
        url: 'http://localhost:2000/api/customer/getAllCustomers',
        method: 'GET',
        dataType: 'json',
        success: function(customers) {
            const customerDropdown = $("#customer_id1");
            customerDropdown.empty();
            customerDropdown.append('<option selected>Select Customer Id</option>');
            console.log("Customer Data For Place Order ", customers)
            customers.forEach(customer => {
                customerDropdown.append(`<option value="${customer._id}">${customer.id}</option>`);
            });
        },
        error: function(error) {
            console.error('Error loading customers:', error);
            alert('Failed to load customers. Please try again.');
        }
    });
}

// Load all items from the API
function loadAllItems() {
    $.ajax({
        url: 'http://localhost:2000/api/item/getAllItems',
        method: 'GET',
        dataType: 'json',
        success: function(items) {
            const itemDropdown = $("#item_code1");
            itemDropdown.empty();
            itemDropdown.append('<option selected>Select Item Code</option>');
            
            items.forEach(item => {
                itemDropdown.append(`<option value="${item._id}">${item.itemId}</option>`);
            });
        },
        error: function(error) {
            console.error('Error loading items:', error);
            alert('Failed to load items. Please try again.');
        }
    });
}

// Get customer details by ID
function getCustomerById(_id) {
    console.log("Customer ID getCustomerById Funtion ", _id);
    $.ajax({
        url: `http://localhost:2000/api/customer/getCustomerById/${_id}`,
        type: 'GET',
        contentType: "application/json",
        success: function(customer) {
            $("#customer_name1").val(customer.name);
        },
        error: function(error) {
            console.error('Error loading customer details:', error);
            alert('Failed to load customer details. Please try again.');
        }
    });
}

// Get item details by ID
function getItemById(_id) {
    console.log("Item ID getItemById Function", _id);
    $.ajax({
        url: `http://localhost:2000/api/item/getItemsById/${_id}`,
        type: 'GET',
        dataType: 'json', // Use 'json' instead of 'application/json'
        success: function(product) {
            console.log("Item Data For Place Order", product);
            $("#item_name1").val(product.name);
            $("#price1").val(product.price);
            $("#qty_on_hand").val(product.quantity);
        },
        error: function(error) {
            console.error('Error loading item details:', error);
            alert('Failed to load item details. Please try again.');
        }
    });
}

// Initialize all event listeners
function initializeEventListeners() {
    // Customer dropdown change event
    $("#customer_id1").change(function() {
        const customerId = $(this).val();
        if (customerId !== "Select Customer Id") {
            getCustomerById(customerId);
        } else {
            $("#customer_name1").val("");
        }
    });
    
    // Item dropdown change event
    $("#item_code1").change(function() {
        const itemCode = $(this).val();
        if (itemCode !== "Select Item Code") {
            getItemById(itemCode);
        } else {
            $("#item_name1").val("");
            $("#price1").val("");
            $("#qty_on_hand").val("");
            $("#getQty").val("");
        }
    });
    
    // Add to Cart button click event
    $("#addBtn").click(function() {
        addItemToCart();
    });
    
    // Remove button click event
    $("#removeBtn").click(function() {
        removeSelectedItem();
    });
    
    // Update button click event
    $("#UpdateBtn3").click(function() {
        updateCartItem();
    });
    
    // Reset item details button click event
    $("#resetItemDetailsBtn").click(function() {
        resetItemFields();
    });
    
    // Table row click event for selecting an item
    $("#item-order-table tbody").on("click", "tr", function() {
        selectTableRow(this);
    });
    
    // Calculate sub-total when discount changes
    $("#discount").on("input", function() {
        calculateSubTotal();
    });
    
    // Calculate balance when cash input changes
    $("#Cash").on("input", function() {
        calculateBalance();
    });
    
    // Buy button click event
    $("#submitBtn2").click(function() {
        processOrder();
    });
    
    // Reset form button click event
    $("#resetBtn2").click(function() {
        resetOrderForm();
    });
    
    // Search button click event
    $("#search").click(function() {
        searchOrder();
    });
}

// Add item to cart
function addItemToCart() {
    const itemCode = $("#item_code1").val();
    const itemName = $("#item_name1").val();
    const price = $("#price1").val();
    const qtyOnHand = parseInt($("#qty_on_hand").val());
    const qty = parseInt($("#getQty").val());
    
    // Validate inputs
    if (itemCode === "Select Item Code" || !qty) {
        alert("Please select an item and enter quantity");
        return;
    }
    
    // Check if quantity is available
    if (qty > qtyOnHand) {
        alert("Not enough quantity available in stock");
        return;
    }
    
    // Check if item already exists in table
    let itemExists = false;
    $("#item-order-table tbody tr").each(function() {
        const existingItemCode = $(this).find("td:first").text();
        if (existingItemCode === itemCode) {
            itemExists = true;
            alert("Item already added to cart. Select and update if needed.");
            return false;
        }
    });
    
    if (!itemExists) {
        // Add new row to table
        const row = `<tr>
            <td>${itemCode}</td>
            <td>${itemName}</td>
            <td>${price}</td>
            <td>${qtyOnHand}</td>
            <td>${qty}</td>
        </tr>`;
        
        $("#item-order-table tbody").append(row);
        
        // Update total
        updateOrderTotal();
        resetItemFields();
    }
}

// Update the selected cart item
function updateCartItem() {
    const selectedRow = $("#item-order-table tbody tr.selected");
    if (selectedRow.length === 0) {
        alert("Please select an item to update");
        return;
    }
    
    const itemCode = $("#item_code1").val();
    const itemName = $("#item_name1").val();
    const price = $("#price1").val();
    const qtyOnHand = parseInt($("#qty_on_hand").val());
    const qty = parseInt($("#getQty").val());
    
    // Validate inputs
    if (itemCode === "Select Item Code" || !qty) {
        alert("Please select an item and enter quantity");
        return;
    }
    
    // Check if quantity is available
    if (qty > qtyOnHand) {
        alert("Not enough quantity available in stock");
        return;
    }
    
    // Update the row
    selectedRow.html(`
        <td>${itemCode}</td>
        <td>${itemName}</td>
        <td>${price}</td>
        <td>${qtyOnHand}</td>
        <td>${qty}</td>
    `);
    
    // Update total
    updateOrderTotal();
    resetItemFields();
    selectedRow.removeClass("selected");
}

// Remove the selected item from cart
function removeSelectedItem() {
    const selectedRow = $("#item-order-table tbody tr.selected");
    if (selectedRow.length === 0) {
        alert("Please select an item to remove");
        return;
    }
    
    selectedRow.remove();
    updateOrderTotal();
    resetItemFields();
}

// Reset item selection fields
function resetItemFields() {
    $("#item_code1").val("Select Item Code");
    $("#item_name1").val("");
    $("#price1").val("");
    $("#qty_on_hand").val("");
    $("#getQty").val("");
    $("#item-order-table tbody tr").removeClass("selected");
}

// Select a row in the table
function selectTableRow(row) {
    // Clear previous selection
    $("#item-order-table tbody tr").removeClass("selected");
    
    // Add selected class to clicked row
    $(row).addClass("selected");
    
    // Populate fields with row data
    const cells = $(row).find("td");
    const itemCode = $(cells[0]).text();
    const qty = $(cells[4]).text();
    
    // Set item in dropdown
    $("#item_code1").val(itemCode);
    getItemById(itemCode);
    
    // Set quantity
    $("#getQty").val(qty);
}

// Update the order total based on cart items
function updateOrderTotal() {
    let total = 0;
    
    $("#item-order-table tbody tr").each(function() {
        const price = parseFloat($(this).find("td:eq(2)").text());
        const qty = parseInt($(this).find("td:eq(4)").text());
        total += price * qty;
    });
    
    $("#total").val(total.toFixed(2));
    
    // Recalculate subtotal and balance
    calculateSubTotal();
    calculateBalance();
}

// Calculate subtotal based on total and discount
function calculateSubTotal() {
    const total = parseFloat($("#total").val()) || 0;
    const discount = parseFloat($("#discount").val()) || 0;
    
    const subTotal = total - (total * (discount / 100));
    $("#sub_total").val(subTotal.toFixed(2));
    
    // Update balance
    calculateBalance();
}

// Calculate balance based on subtotal and cash
function calculateBalance() {
    const subTotal = parseFloat($("#sub_total").val()) || 0;
    const cash = parseFloat($("#Cash").val()) || 0;
    
    const balance = cash - subTotal;
    $("#balance").val(balance.toFixed(2));
}

// Process the complete order
function processOrder() {
    const orderId = $("#order_id").val();
    const orderDate = $("#order_date").val();
    const customerId = $("#customer_id1").val();
    const customerName = $("#customer_name1").val();
    const total = parseFloat($("#total").val()) || 0;
    const discount = parseFloat($("#discount").val()) || 0;
    const subTotal = parseFloat($("#sub_total").val()) || 0;
    const cash = parseFloat($("#Cash").val()) || 0;
    const balance = parseFloat($("#balance").val()) || 0;

    // Validate required fields
    if (customerId === "Select Customer Id" || $("#item-order-table tbody tr").length === 0) {
        alert("Please select a customer and add items to the cart.");
        return;
    }

    if (cash <= 0 || cash < subTotal) {
        alert("Please enter a valid cash amount.");
        return;
    }

    // Collect order items
    const orderItems = [];
    $("#item-order-table tbody tr").each(function() {
        orderItems.push({
            itemCode: $(this).find("td:eq(0)").text(),
            itemName: $(this).find("td:eq(1)").text(),
            price: parseFloat($(this).find("td:eq(2)").text()),
            qty: parseInt($(this).find("td:eq(4)").text())
        });
    });

    // Create order object
    const order = {
        orderId: orderId,
        orderDate: orderDate,
        customerId: customerId,
        customerName: customerName,
        total: total,
        discount: discount,
        subTotal: subTotal,
        cash: cash,
        balance: balance,
        items: orderItems
    };

    console.log("Order Data For Place Order", order);

    // Send order data to the backend via AJAX
    $.ajax({
        url: 'http://localhost:2000/api/order/saveOrder', 
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(order),
        success: function(response) {
            console.log("Order processed successfully:", response);
            Swal.fire("Deleted!", "Customer has been deleted.", "success");
            resetOrderForm();
        },
        error: function(xhr, status, error) {
            console.error('Error processing order:', xhr.responseText);
            Swal.fire("Error", "Failed to delete customer", "error");
        }
    });
}


// Reset the entire order form
// Reset the entire order form with enhanced functionality
function resetOrderForm() {
    // Reset customer selection
    $("#customer_id1").val("Select Customer Id");
    $("#customer_name1").val("");
    
    // Reset totals
    $("#total").val("");
    $("#discount").val("");
    $("#sub_total").val("");
    $("#Cash").val("");
    $("#balance").val("");
    
    // Clear cart
    $("#item-order-table tbody").empty();
    
    // Reset item fields
    resetItemFields();
    
    // Generate new order ID
    generateOrderID();
    
    // Set current date
    setCurrentDate();
    
    // Show confirmation message
    showSuccessMessage("Form has been reset successfully");
    
    // Reset search field
    $("#searchField").val("");
    
    // Remove any highlighting or selections
    $(".selected").removeClass("selected");
    
    // Enable/disable buttons as needed
    $("#UpdateBtn3").prop("disabled", true);
    $("#removeBtn").prop("disabled", true);
    $("#addBtn").prop("disabled", false);
}

// Search for an order with AJAX implementation
function searchOrder() {
    const searchTerm = $("#searchField").val();
    if (!searchTerm) {
        showErrorMessage("Please enter a search term");
        return;
    }
    
    // Show loading indicator
    const searchButton = $("#search");
    const originalText = searchButton.html();
    searchButton.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...');
    searchButton.prop("disabled", true);
    
    // Implement AJAX call to search for orders
    $.ajax({
        url: `/order/searchOrders?term=${encodeURIComponent(searchTerm)}`,
        method: 'GET',
        dataType: 'json',
        success: function(result) {
            // Reset button state
            searchButton.html(originalText);
            searchButton.prop("disabled", false);
            
            if (result && result.orderId) {
                // Order found, populate the form
                populateOrderForm(result);
                showSuccessMessage(`Order ${result.orderId} found and loaded`);
            } else {
                // No order found
                showErrorMessage(`No orders found matching "${searchTerm}"`);
            }
        },
        error: function(error) {
            // Reset button state
            searchButton.html(originalText);
            searchButton.prop("disabled", false);
            
            console.error('Error searching for order:', error);
            showErrorMessage("Failed to search for orders. Please try again.");
        }
    });
}

// Populate the form with order data
function populateOrderForm(order) {
    // Set order details
    $("#order_id").val(order.orderId);
    $("#order_date").val(order.orderDate);
    
    // Set customer details
    $("#customer_id1").val(order.customerId);
    $("#customer_name1").val(order.customerName);
    
    // Set financial details
    $("#total").val(order.total);
    $("#discount").val(order.discount);
    $("#sub_total").val(order.subTotal);
    $("#Cash").val(order.cash);
    $("#balance").val(order.balance);
    
    // Clear and repopulate cart
    $("#item-order-table tbody").empty();
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const row = `<tr>
                <td>${item.itemCode}</td>
                <td>${item.itemName}</td>
                <td>${item.price}</td>
                <td>${item.qtyOnHand || "N/A"}</td>
                <td>${item.qty}</td>
            </tr>`;
            
            $("#item-order-table tbody").append(row);
        });
    }
    
    // Update UI state
    $("#submitBtn2").text("Update Order");
    
    // Add a "New Order" button if it doesn't exist
    if ($("#newOrderBtn").length === 0) {
        $("#order_btn").prepend(`
            <button id="newOrderBtn" type="button" class="btn btn-outline-primary">
                New Order
            </button>
        `);
        
        // Add event listener for the new button
        $("#newOrderBtn").click(function() {
            // Reset form and switch back to "Buy" mode
            resetOrderForm();
            $("#submitBtn2").text("Buy");
            $(this).remove(); // Remove the "New Order" button
        });
    }
}


// Function to show success message
function showSuccessMessage(message) {
    $('.order-error-message').slideUp();
    $('.order-success-message').text(message).slideDown().delay(3000).slideUp();
}

// Function to show error message
function showErrorMessage(message) {
    $('.order-success-message').slideUp();
    $('.order-error-message').text(message).slideDown().delay(3000).slideUp();
}

// Initialize all components on document ready
$(document).ready(function() {
    // Add styles
    addOrderStyles();
    
    // Replace alert with custom messages
    window.originalAlert = window.alert;
    window.alert = function(message) {
        if (message.toLowerCase().includes("success") || 
            message.toLowerCase().includes("processed") || 
            message.toLowerCase().includes("loaded")) {
            showSuccessMessage(message);
        } else {
            showErrorMessage(message);
        }
    };
    
    // Initially disable update and remove buttons until row is selected
    $("#UpdateBtn3").prop("disabled", true);
    $("#removeBtn").prop("disabled", true);
    
    // Enable buttons when row is selected
    $("#item-order-table tbody").on("click", "tr", function() {
        $("#UpdateBtn3").prop("disabled", false);
        $("#removeBtn").prop("disabled", false);
    });
    
    // Add keyboard shortcut for search (Ctrl+F)
    $(document).keydown(function(e) {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
            e.preventDefault();
            $("#searchField").focus();
        }
    });
});