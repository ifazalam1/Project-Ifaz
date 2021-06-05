const { Schema, model } = require("mongoose");

const ItemSchema = Schema({
  itemName: {
    type: String,
    required: true,
  },
  itemQuantity: {
    type: Number,
    required: true,
  },
  itemPrice: {
    type: Number,
    required: true,
  },
  itemImageUrl: {
    type: String,
    required: true,
  },

});

const Item = model("item", ItemSchema);
module.exports = Item;
