const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const freeClassRoutes = require("./routes/freeClassRoutes");
const pujaRoutes = require("./routes/pujaRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const students = require("./routes/studentroutes");
const teachers = require("./routes/teacherroutes");

const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, 'http://103.243.232.236:3010'],
    credentials: true,
  }),
);
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/courses", courseRoutes);
app.use("/api/admin/enrollments", enrollmentRoutes);
app.use("/api/admin/free-classes", freeClassRoutes);
app.use("/api/admin/specific-puja", pujaRoutes);
app.use("/api/admin/payments", paymentRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/student", students);
app.use("/api/teacher", teachers);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
