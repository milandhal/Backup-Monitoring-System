const express = require("express");

const router = express.Router();

const {
    getDashboardStats,
    getChartData
} = require("../controllers/dashboardController");

router.get("/", getDashboardStats);
router.get("/charts", getChartData);

module.exports = router;