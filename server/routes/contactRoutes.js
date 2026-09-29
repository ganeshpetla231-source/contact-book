const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createContact,
  listContacts,
  searchContacts,
  toggleFavourite,
  listContactsByGroup,
  getContactStats,
  getContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const router = express.Router();
const contactValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("email").optional({ values: "falsy" }).isEmail().withMessage("Email must be valid"),
  body("address").optional({ values: "falsy" }).isString().withMessage("Address must be text"),
  body("category").optional({ values: "falsy" }).isString().withMessage("Category must be text"),
  body("isFavourite").optional().isBoolean().withMessage("isFavourite must be boolean"),
];

router.use(authMiddleware);
router.post("/", contactValidation, createContact);
router.get("/", listContacts);
router.get("/search", searchContacts);
router.patch("/:id/favourite", toggleFavourite);
router.get("/group/:groupId", listContactsByGroup);
router.get("/stats", getContactStats);
router.get("/:id", getContact);
router.put("/:id", contactValidation, updateContact);
router.delete("/:id", deleteContact);

module.exports = router;