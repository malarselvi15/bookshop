require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Database connection error:", err));

// Define Book Schema and Model
const bookSchema = new mongoose.Schema({
  bookname: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: String, required: true },
});

const Book = mongoose.model("Book", bookSchema);

// Define Order Schema and Model
const orderSchema = new mongoose.Schema({
  bookname: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, required: true },
  buyerName: { type: String, required: true },
  upiNumber: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// Routes

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "inde.html"));
});

// Register a new book
app.post("/register", async (req, res) => {
  try {
    const { bookname, img, price } = req.body;
    if (!bookname || !img || !price) {
      return res.status(400).send("All fields are required. <a href='/'>Go back</a>");
    }

    const newBook = new Book({ bookname, img, price });
    await newBook.save();
    res.send("Book details saved successfully! <a href='/'>Go back</a>");
  } catch (error) {
    console.error("Error saving book details:", error);
    res.status(500).send("Error saving data. Please try again.");
  }
});

// Search and fetch books
app.get("/books", async (req, res) => {
  try {
    const { search, sort } = req.query;
    const query = search
      ? { bookname: { $regex: search, $options: "i" } }
      : {};

    let sortOption = {};
    if (sort === "alphabetical") {
      sortOption = { bookname: 1 };
    } else if (sort === "price") {
      sortOption = { price: 1 };
    }

    const books = await Book.find(query).sort(sortOption);
    res.json(books);
  } catch (error) {
    console.error("Error fetching book details:", error);
    res.status(500).send("Error fetching data.");
  }
});

// Route to save order details
app.post("/orders", async (req, res) => {
  try {
    const { bookname, img, price, quantity, buyerName, upiNumber, deliveryAddress } = req.body;

    // Validate input
    if (!bookname || !img || !price || !quantity || !buyerName || !upiNumber || !deliveryAddress) {
      return res.status(400).send("All fields are required.");
    }

    // Create a new order document
    const newOrder = new Order({
      bookname,
      img,
      price,
      quantity,
      buyerName,
      upiNumber,
      deliveryAddress,
    });

    // Save the order
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!", orderId: newOrder._id });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).send("Error saving order. Please try again.");
  }
});

// Start Server
app.listen(port, (err) => {
  if (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  } else {
    console.log(`Server is running on http://localhost:${port}`);
  }
});
