import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import recruitmentRoutes from "./routes/recruitmentRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import eventRequestRoutes from "./routes/eventRequestRoutes.js";


dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes); 
app.use("/api/admin", adminRoutes); 
app.use("/api/announcements", announcementRoutes);
app.use("/api/recruitments", recruitmentRoutes);
app.use("/api/event-requests", eventRequestRoutes);


//  Global error handler MUST be after routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

