const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Define Order Schema
const orderSchema = new mongoose.Schema({
  bookname: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  buyerName: { type: String, required: true },
  upiNumber: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  orderDate: { type: Date, default: Date.now }
});

// Create Order Model
const Order = mongoose.model("Order", orderSchema, "orders");

// Route to Place an Order
router.post("/", async (req, res) => {
  try {
    const { bookname, img, price, quantity, buyerName, upiNumber, deliveryAddress } = req.body;

    // Validate all fields
    if (!bookname || !img || !price || !quantity || !buyerName || !upiNumber || !deliveryAddress) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof price !== "number" || typeof quantity !== "number" || price <= 0 || quantity <= 0) {
      return res.status(400).json({ message: "Price and quantity must be positive numbers" });
    }

    if (!/^\d{10}$/.test(upiNumber)) {
      return res.status(400).json({ message: "Invalid UPI number. It must be a 10-digit number." });
    }

    const totalPrice = price * quantity; // Calculate total price

    const newOrder = new Order({
      bookname,
      img,
      price,
      quantity,
      totalPrice,
      buyerName,
      upiNumber,
      deliveryAddress
    });

    await newOrder.save(); // Save the order to MongoDB
    res.status(201).json({ message: "Order placed successfully!", orderId: newOrder._id });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Error processing order, please try again later." });
  }
});

// Route to Get All Orders (for admin or order viewing)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders); // Respond with all orders
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error retrieving orders" });
  }
});

// Route to Get Order by ID (optional for viewing individual orders)
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order); // Respond with the order details
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error retrieving the order" });
  }
});

module.exports = router;
