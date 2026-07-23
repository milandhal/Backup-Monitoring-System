const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const instanceRoutes = require("./routes/instanceRoutes");
const backupRoutes = require("./routes/backupRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

const scheduler = require("./services/backupScheduler");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../")));

// Routes
app.use("/api", authRoutes);
app.use("/api/instances", instanceRoutes);
app.use("/api/backups", backupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/schedules", scheduleRoutes);

// Open index.html when visiting root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../html/index.html"));
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server Running On Port ${PORT}`);

        // Load all active schedules from DB and register cron jobs on startup
        // Wait 2s for DB connection to be fully ready
        setTimeout(() => {
            scheduler.loadAndRegisterAll();
        }, 2000);
    });
}

module.exports = app;