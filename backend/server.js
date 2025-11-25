import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend working!");
});

const PORT = process.env.PORT || 5000;
console.log("URI =", process.env.MONGO_URI);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

