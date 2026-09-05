import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import authRoutes from "./src/routes/auth.js";
import addressRoutes from "./src/routes/address.js";
import projectRoutes from "./src/routes/project.js";
import packageRoutes from "./src/routes/package.js";
import siteControlRoutes from "./src/routes/siteControl.js";
import estimatorConfigRoutes from "./src/routes/estimatorConfig.js";
import estimatorTemplateRoutes from "./src/routes/estimatorTemplate.js";
import estimateRoutes from "./src/routes/estimate.js";
import adminCustomerRoutes from "./src/routes/adminCustomers.js";
import quoteRoutes from "./src/routes/quote.js";
import adminQuoteRoutes from "./src/routes/adminQuotes.js";
import proFixRoutes from "./src/routes/proFix/proFix.js";
import quickFixRoutes from "./src/routes/quickFix/quickFix.js";
import uploadRoutes from "./src/routes/upload.js";
import marketingRoutes from "./src/routes/marketing.js";
import offerRoutes from "./src/routes/offers.js";
import bookingRoutes from "./src/routes/bookings.js";
import notificationRoutes from "./src/routes/notifications.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://vijaya-siri-website.onrender.com", "https://vijaya-siri-website.vercel.app/"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://vijaya-siri-website.vercel.app/",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const cloudinary = (await import("./src/config/cloudinary.js")).default;
    const result = await cloudinary.api.ping();
    res.json({ success: true, result });
  } catch (error) {
    console.error("Cloudinary ping error:", error.message);
    res.json({ success: false, message: error.message, details: error });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/site-control", siteControlRoutes);
app.use("/api/estimator/config", estimatorConfigRoutes);
app.use("/api/estimator/templates", estimatorTemplateRoutes);
app.use("/api/estimator/estimates", estimateRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/admin/quotes", adminQuoteRoutes);
app.use("/api/pro-fix", proFixRoutes);
app.use("/api/quick-fix", quickFixRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const start = async () => {
  await connectDB();
  connectRedis();

  // Clean stale push subscriptions on startup
  try {
    const PushSubscription = (await import("./src/models/PushSubscription.js")).default;
    const result = await PushSubscription.deleteMany({
      $or: [
        { "keys.p256dh": { $exists: false } },
        { "keys.auth": { $exists: false } },
        { "keys.p256dh": null },
        { "keys.auth": null },
        { "keys.p256dh": "" },
        { "keys.auth": "" },
      ],
    });
    if (result.deletedCount > 0) {
      console.log(`[Push] Cleaned ${result.deletedCount} stale subscriptions`);
    }
    const total = await PushSubscription.countDocuments();
    console.log(`[Push] ${total} active subscriptions`);
  } catch (err) {
    console.warn('[Push] Subscription cleanup failed:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      console.log(`[Push] VAPID keys configured`);
    } else {
      console.warn(`[Push] VAPID keys NOT configured - push notifications will not work`);
    }
  });
};

start();
