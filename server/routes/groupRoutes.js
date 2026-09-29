const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const { createGroup, listGroups, getGroup, updateGroup, deleteGroup } = require("../controllers/groupController");

const router = express.Router();
const groupName = body("name").trim().notEmpty().withMessage("Group name is required");

router.use(authMiddleware);
router.post("/", groupName, createGroup);
router.get("/", listGroups);
router.get("/:id", getGroup);
router.put("/:id", groupName, updateGroup);
router.delete("/:id", deleteGroup);

module.exports = router;