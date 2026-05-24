const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const notesRoutes = require("./routes/notesRoutes");
const connectDB = require("./config/db.js");
const path = require("path");
const rateLimiter = require("./middleware/rateLimiter.js");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173", // Allow requests from the frontend
}));
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(rateLimiter); // Apply rate limiting middleware to all routes

//custom middleware to log request method and URL
//app.use((req, res, next) => {
    //console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
    //next();
//});

app.use("/api/notes", notesRoutes); 

connectDB().then(() => { 
app.listen(PORT, () => {
    console.log("Server is running on port:", PORT);
   });
});

