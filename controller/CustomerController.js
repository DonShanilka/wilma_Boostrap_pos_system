import { CustomerModel } from "../model/CustomerModel.js";

let customerId = $("#customerId");
let customerName = $("#customerName");
let customerAddress = $("#address");
let mobile = $("#mobile");
let _Id = "";

let submit = $("#customer_btn>button").eq(0);
let update = $("#customer_btn>button").eq(1);
let delete_btn = $("#customer_btn>button").eq(2);
let reset = $("#customer_btn>button").eq(3);

let searchBtn = $("#search2");
let searchField = $("#searchField2");

let customerCount = 0;

let customerData = [];
console.log("Customer Data ", customerData);

const mobilePattern = new RegExp(
  "^(?:0|94|\\+94|0094)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91)(0|2|3|4|5|7|9)|7(0|1|2|4|5|6|7|8)\\d)\\d{6}$"
);

// searchField.on("input", function () {
//   let search_term = searchField.val();

//   let results = customer_db.filter(
//     (item) =>
//       item.customer_id.toLowerCase().startsWith(search_term.toLowerCase()) ||
//       item.customer_name.toLowerCase().startsWith(search_term.toLowerCase()) ||
//       item.customer_address
//         .toLowerCase()
//         .startsWith(search_term.toLowerCase()) ||
//       item.mobile.toLowerCase().startsWith(search_term.toLowerCase())
//   );

//   $("#customer-tbl-body").eq(0).empty();
//   results.map((item, index) => {
//     let tbl_row = `<tr>
//             <th scope="row">${item.customer_id}</th>
//             <td>${item.customer_name}</td>
//             <td>${item.customer_address}</td>
//             <td>${item.mobile}</td>
//         </tr>`;
//     $("#customer-tbl-body").eq(0).append(tbl_row);
//   });
// });

const cleanInputs = () => {
  $("#customerId").val("");
  $("#customerName").val("");
  $("#address").val("");
  $("#mobile").val("");
};

// Customer Save
submit.on("click", () => {
  let idValue = customerId.val();
  let nameValue = customerName.val();
  let addressValue = customerAddress.val();
  let mobileValue = mobile.val();

  if (
    validation(nameValue, "customer name", null) &&
    validation(addressValue, "Address", null) &&
    validation(mobileValue, "Contact", mobilePattern.test(mobileValue))
  ) {
    let customerDetails = new CustomerModel(
      idValue,
      nameValue,
      addressValue,
      Number(mobileValue)
    );

    const customerJson = JSON.stringify(customerDetails);
    console.log(customerJson);

    $.ajax({
      type: "POST",
      url: "http://localhost:5000/api/customer/saveCustomer",
      contentType: "application/json",
      data: customerJson,
      success: function () {
        Swal.fire("Customer Added Successfully!", "Successful", "success");
        cleanInputs();
      },
      error: function (xhr, status, error) {
        console.log("Error: ", error);
        console.log("Response: ", xhr.responseText);
        Swal.fire("Error", "Error in adding customer", "error");
      },
    });
  }
});

update.on("click", function () {
  let idValue = $("#customerId").val();        
  let nameValue = $("#customerName").val();    
  let addressValue = $("#address").val();     
  let mobileValue = $("#mobile").val();      

  if (
    validation(nameValue, "customer name", null) &&
    validation(addressValue, "Address", null) &&
    validation(mobileValue, "Contact", mobilePattern.test(mobileValue))
  ) {
    let updatedCustomerDetails = {
      customerId: idValue,
      customerName: nameValue,
      customerAddress: addressValue,
      mobile: mobileValue,
    };

    console.log("Updated Customer Details: ", _Id, updatedCustomerDetails);

    const customerJson = JSON.stringify(updatedCustomerDetails);
    console.log(customerJson);

    $.ajax({
      type: "PUT",
      url: `http://localhost:5000/api/customer/updateCustomer/${_Id}`, 
      contentType: "application/json",
      data: customerJson,
      success: function () {
        Swal.fire("Updated Successfully!", "Customer updated successfully", "success");
        loadAllCustomers(); 
        cleanInputs();
      },
      error: function (xhr, status, error) {
        console.error("Error updating customer:", error);
        Swal.fire("Error", "Failed to update customer", "error");
      }
    });
  }
});

// function generateCustomer {
function loadAllCustomers() {
  $.ajax({
    url: "http://localhost:5000/api/customer/getAllCustomers",
    type: "GET",
    contentType: "application/json",
    success: function (customers) {
      console.log("Customers Loaded:", customers);

      customerData = customers;

      $("#customer-tbl-body").empty();

      customers.forEach((customer) => {
        let row = `
                    <tr>
                      <th scope="row" style="display: none;" class="customer-id">${customer._id}</th>
                      <td>${customer.id}</td>
                      <td>${customer.name}</td>
                      <td>${customer.address}</td>
                      <td>${customer.mobile}</td>
                    </tr>

                `;
        $("#customer-tbl-body").append(row);
      });
    },
    error: function (xhr, status, error) {
      console.error("Error loading customers:", error);
      Swal.fire("Error", "Failed to load customer data", "error");
    },
  });
}

$(document).ready(function () {
  loadAllCustomers(); 
});

function showValidationError(title, text) {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
    footer: '<a href="">Why do I have this issue?</a>',
  });
}

function validation(value, message, test) {
  if (!value) {
    showValidationError("Null Input", "Input " + message);
    return false;
  }
  if (test === null) {
    return true;
  }
  if (!test) {
    showValidationError("Invalid Input", "Invalid Input" + message);
    return false;
  }
  return true;
}

$(document).ready(function () {
  $("#customer-tbl-body").on("click", "tr", function () {
    let _id = $(this).find("th.customer-id").text(); 
    let customerIdValue = $(this).find("td:eq(0)").text();   
    let customerNameValue = $(this).find("td:eq(1)").text(); 
    let customerAddressValue = $(this).find("td:eq(2)").text(); 
    let customerMobileValue = $(this).find("td:eq(3)").text(); 

    console.log("Selected Customer: ", _id, customerIdValue, customerNameValue, customerAddressValue, customerMobileValue);

    _Id = _id;
    $("#customerID").val(customerIdValue);
    $("#customerName").val(customerNameValue);
    $("#address").val(customerAddressValue);
    $("#mobile").val(customerMobileValue);
  });
});


// delete_btn.on("click", function () {
//   let idValue = customerId.val();

//   Swal.fire({
//     title: "Are you sure?",
//     text: "You won't be able to revert this!",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#3085d6",
//     cancelButtonColor: "#d33",
//     confirmButtonText: "Delete",
//   }).then((result) => {
//     if (result.isConfirmed) {
//       let index = customer_db.findIndex(
//         (customer) => customer.customer_id === idValue
//       );
//       customer_db.splice(index, 1);
//       cleanInputs();

//       customerCount -= 1;
//       document.getElementById("customerCount-lable").innerHTML = customerCount;

//       Swal.fire("Deleted!", "Your file has been deleted.", "success");
//       submit.prop("disabled", false);
//     }
//   });
// });

// reset.on("click", function (e) {
//   e.preventDefault();
//   customerId.val(generateCustomerId());
//   customerName.val("");
//   customerAddress.val("");
//   mobile.val("");
//   submit.prop("disabled", false);
//   delete_btn.prop("disabled", true);
//   update.prop("disabled", true);
// });

// document.getElementById("customerSubmit").onclick = function () {
//   customerCount = customer_db.length;
//   document.getElementById("customerCount-lable").innerHTML = customerCount;
// };

// console.log(customer_db);
