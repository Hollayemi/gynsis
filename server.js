"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_1 = require("./middleware/error");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
// ─── DB ───────────────────────────────────────────────────────────────────────
async function connectDB() {
    const uri = process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI;
    const conn = await mongoose_1.default.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);
}
connectDB().catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
});
// ─── App ──────────────────────────────────────────────────────────────────────
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use(error_1.jsonParseErrorHandler);
app.use(error_1.extendResponse);
app.use(process.env.NODE_ENV === 'development' ? (0, morgan_1.default)('dev') : (0, morgan_1.default)('combined'));
// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.data({ status: 'OK', env: process.env.NODE_ENV, uptime: process.uptime() }, 'Server is healthy');
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
// ─── Error handling ───────────────────────────────────────────────────────────
app.use('*', error_1.handle404);
app.use(error_1.errorHandler);
// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`
  ✅  NURTW Server running
  Env:  ${process.env.NODE_ENV}
  Port: ${PORT}
  Time: ${new Date().toLocaleTimeString()}
  `);
});
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION — shutting down:', err.name, err.message);
    server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION — shutting down:', err.name, err.message);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map