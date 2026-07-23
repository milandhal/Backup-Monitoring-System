const express = require("express");

const router = express.Router();

const {
    getInstances,
    addInstance,
    deleteInstance
} = require("../controllers/instanceController");

router.get("/", getInstances);

router.post("/", addInstance);

router.delete("/:id", deleteInstance);

module.exports = router;