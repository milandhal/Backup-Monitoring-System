const express = require("express");

const router = express.Router();

const {
    getBackups,
    addBackup,
    createRealBackup,
    downloadBackup
} = require("../controllers/backupController");

router.get("/", getBackups);

router.post("/", addBackup);

router.post("/real-backup", createRealBackup);

router.get(
    "/download/:id",
    downloadBackup
);

module.exports = router;