
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path:'./.env'
});

console.log("Cloudinary Config Check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✓" : "✗", 
  api_key: process.env.CLOUDINARY_API_KEY ? "✓" : "✗",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✓" : "✗"
});

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
