const express = require("express");
const router = express.Router();
const {
    getSchedules,
    getScheduleByInstance,
    createSchedule,
    updateScheduleStatus,
    deleteSchedule,
    runScheduleNow
} = require("../controllers/scheduleController");

router.get("/", getSchedules);
router.get("/instance/:instanceId", getScheduleByInstance);
router.post("/", createSchedule);
router.post("/:id/run-now", runScheduleNow);
router.patch("/:id/status", updateScheduleStatus);
router.delete("/:id", deleteSchedule);

module.exports = router;
