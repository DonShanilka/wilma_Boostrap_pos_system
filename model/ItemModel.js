export class ItemModel {
  constructor(itemCode, itemName, price, quantity) {
    this.itemId = itemCode;
    this.name = itemName;
    this.price = price;
    this.quantity = quantity;
  }
}
