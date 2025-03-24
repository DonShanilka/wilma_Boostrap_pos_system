import { customer_db, item_db } from "../db/db.js";
import { ItemModel } from "../model/ItemModel.js";

let itemId = $("#itemId");
let itemName = $("#itemName");
let price = $("#price");
let qty = $("#qty");

let submit = $("#item_btn>button").eq(0);
let update = $("#item_btn>button").eq(1);
let delete_btn = $("#item_btn>button").eq(2);
let reset = $("#item_btn>button").eq(3);

let searchBtn = $("#search3");
let searchField = $("#searchField3");

let itemCount = 0;
let _Id = "";

$(document).ready(function () {
    loadAllItems(); 
  });

const cleanInputs = () => {
    $("#itemId").val("");
    $("#itemName").val("");
    $("#price").val("");
    $("#qty").val("");
  };

// Item Save
submit.on("click", function () {
  let itemCodeValue = itemId.val();
  let itemNameValue = itemName.val().trim();
  let priceValue = parseFloat(price.val());
  let qtyOnHandValue = parseInt(qty.val(), 10);

  if (
    validation(itemNameValue, "item name", null) &&
    validation(priceValue, "Price", null) &&
    validation(qtyOnHandValue, "Qty On Hand", null)
  ) {
    let itemDetails = new ItemModel(
      itemCodeValue,
      itemNameValue,
      priceValue,
      qtyOnHandValue
    );

    const itemJson = JSON.stringify(itemDetails);
    console.log(itemJson);

    $.ajax({
      type: "POST",
      url: "http://localhost:5000/api/item/saveItems",
      contentType: "application/json",
      data: itemJson,
      success: function () {
        Swal.fire("Save Successfully !", "Successful", "success");
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

// Update Item 
update.on("click", function () {
    let itemCodeValue = itemId.val();
    let itemNameValue = itemName.val().trim();
    let priceValue = parseFloat(price.val());
    let qtyOnHandValue = parseInt(qty.val(), 10);
  
    if (
      validation(itemNameValue, "item name", null) &&
      validation(priceValue, "Price", null) &&
      validation(qtyOnHandValue, "Qty On Hand", null)
    ) {
      let updateItemDetails = {
        itemId: itemCodeValue,
        name: itemNameValue,
        price: priceValue,
        quantity: qtyOnHandValue,
      }

      console.log("Update Item Details: ", _Id, updateItemDetails);

      const itemJson = JSON.stringify(updateItemDetails);
      console.log(itemJson);

      $.ajax({
        type: "PUT",
        url: `http://localhost:5000/api/item/updateItems/${_Id}`,
        contentType: "application/json",
        data: itemJson,
        success: function () {
          Swal.fire("Update Successfully !", "Successful", "success");
          cleanInputs();
          loadAllItems();
        },
        error: function (xhr, status, error) {
          console.log("Error: ", error);
          console.log("Response: ", xhr.responseText);
          Swal.fire("Error", "Error in updating item", "error");
        },
      });
    }
  });

function resetColumns() {
  reset.click();
  itemId.val(generateItemCode());
  submit.prop("disabled", false);
  delete_btn.prop("disabled", true);
  update.prop("disabled", true);
}

// loadAll Items
function loadAllItems() {
    $.ajax({
      url: "http://localhost:5000/api/item/getAllItems",
      type: "GET",
      contentType: "application/json",
      success: function (items) {
        console.log("Items Loaded:", items);
  
        // Clear the existing table body content
        $("#item-tbl-body").empty();
  
        // Iterate over each item and append a row to the table body
        items.forEach((item) => {
          let row = `
            <tr>
              <td style="display: none;" class="item-id">${item._id}</td>
              <td>${item.itemId}</td>
              <td>${item.name}</td>
              <td>${item.price}</td>
              <td>${item.quantity}</td>
            </tr>
          `;
          $("#item-tbl-body").append(row);
        });
      },
      error: function (xhr, status, error) {
        console.error("Error loading items:", error);
        Swal.fire("Error", "Failed to load item data", "error");
      },
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
    showValidationError("Invalid Input", "Invalid Input " + message);
    return false;
  }
  return true;
}

/*Show Validation Error*/
function showValidationError(title, text) {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
    footer: '<a href="">Why do I have this issue?</a>',
  });
}

$(document).ready(function () {
    $("#itemTable").on("click", "tbody tr", function () {
      let _id = $(this).find("td:eq(0)").text(); 
      let itemCodeValue = $(this).find("td:eq(1)").text().trim();
      let itemNameValue = $(this).find("td:eq(2)").text().trim();
      let priceValue = $(this).find("td:eq(3)").text().trim();
      let qtyValue = $(this).find("td:eq(4)").text().trim();

      console.log("Selected Item: ",_id, itemCodeValue, itemNameValue, priceValue, qtyValue);

      _Id = _id;
  
      $("#itemId").val(itemCodeValue);
      $("#itemName").val(itemNameValue);
      $("#price").val(priceValue);
      $("#qty").val(qtyValue);
  
      $("#submit").prop("disabled", true);
      $("#delete_btn").prop("disabled", false);
      $("#update").prop("disabled", false);
    });
  });
  



reset.on("click", function (e) {
  e.preventDefault();
  itemId.val("");
  itemName.val("");
  price.val("");
  qty.val("");
  submit.prop("disabled", false);
  delete_btn.prop("disabled", true);
  update.prop("disabled", true);
});



delete_btn.on("click", function () {
  let itemCodeValue = itemId.val();

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.isConfirmed) {
      let index = item_db.findIndex((item) => item.itemCode === itemCodeValue);
      item_db.splice(index, 1);

      itemCount = item_db.length;
      document.getElementById("item-count-lable").innerHTML = itemCount;

      populateItemTBL();
      resetColumns();
      Swal.fire("Deleted!", "Your file has been deleted.", "success");
      submit.prop("disabled", false);
    }
  });
});

// document.getElementById("itemSubmit").onclick = function () {
//     itemCount = item_db.length;
//     document.getElementById("item-count-lable").innerHTML = itemCount;
// }
