
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config();
const app = express();

// Use middleware if needed
app.use(express.json());

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`✅ Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MONGODB connection failed !!!", err);
    process.exit(1);
  });
