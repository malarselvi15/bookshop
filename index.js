require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 4000;

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

// Define Schema and Model
const bookSchema = new mongoose.Schema({
  bookname: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: String, required: true },
});

const Book = mongoose.model("Book", bookSchema);

// Routes

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "inde.html")); // Serve the home page
});

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
    const { search, sort } = req.query;  // Get search and sort query params
    const query = search
      ? { bookname: { $regex: search, $options: "i" } } // Case-insensitive search
      : {};

    let sortOption = {};
    if (sort === "alphabetical") {
      sortOption = { bookname: 1 };  // Sort alphabetically
    } else if (sort === "price") {
      sortOption = { price: 1 };  // Sort by price (assuming price is stored as string)
    }

    const books = await Book.find(query).sort(sortOption);  // Apply sorting and query filter
    res.json(books);  // Send the sorted books back as a JSON response

  } catch (error) {
    console.error("Error fetching book details:", error);
    res.status(500).send("Error fetching data.");
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
