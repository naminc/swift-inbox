import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { notFoundHandler } from "./middlewares/not-found-handler";
import { errorHandler } from "./middlewares/error-handler";
import healthRoutes from "./routes/health.routes";
import domainRoutes from "./routes/domain.routes";
import mailboxRoutes from "./routes/mailbox.routes";
import messageRoutes from "./routes/message.routes";
import abuseRoutes from "./routes/abuse.routes";
import authRoutes from "./routes/auth.routes";
import settingsRoutes from "./routes/settings.routes";
import cleanupRoutes from "./routes/cleanup.routes";
import inboundRoutes from "./routes/inbound.routes";
import env from "./configs/env";
import sourceMapSupport from "source-map-support";
sourceMapSupport.install();

const app: Express = express();

app.set("trust proxy", 1);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(
  morgan(env.NODE_ENV === "development" ? "dev" : "combined", {
    skip: (_req, res) => env.NODE_ENV === "production" && res.statusCode < 400
  })
);

//? Routes
app.get("/", (req: Request, res: Response) => {
  res.redirect("/api/health");
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/mailboxes", mailboxRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/abuse", abuseRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/cleanup", cleanupRoutes);
app.use("/api/inbound", inboundRoutes);

// Not found handler (should be after routes)
app.use(notFoundHandler);

// Global error handler (should be last)
app.use(errorHandler);

export default app;
