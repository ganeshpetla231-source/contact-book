const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Contact = require("../models/Contact");
const Group = require("../models/Group");

const getPagination = (req) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const hasValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ message: errors.array()[0].msg });
  return true;
};

const validId = (id) => mongoose.isValidObjectId(id);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : value);

const findDuplicateContact = async (ownerId, payload, existingId = null) => {
  const checks = [];
  const phone = normalizeText(payload.phone);
  const email = normalizeText(payload.email);

  if (phone) {
    checks.push({ owner: ownerId, phone: { $regex: `^${escapeRegex(phone)}$`, $options: "i" } });
  }

  if (email) {
    checks.push({ owner: ownerId, email: String(email).toLowerCase() });
  }

  if (!checks.length) return null;

  return Contact.findOne({
    owner: ownerId,
    $or: checks,
    ...(existingId ? { _id: { $ne: existingId } } : {}),
  });
};

const verifyGroup = async (groupId, ownerId) => {
  if (!groupId) return null;
  if (!validId(groupId)) return false;
  return Group.findOne({ _id: groupId, owner: ownerId });
};

const contactData = (body, group, isUpdate = false) => ({
  name: body.name,
  phone: body.phone,
  email: body.email || undefined,
  address: body.address || undefined,
  category: body.category || undefined,
  notes: body.notes || undefined,
  ...(Object.prototype.hasOwnProperty.call(body, "photo") ? { photo: body.photo || null } : {}),
  ...(isUpdate || body.group ? { group: group ? group._id : null } : {}),
  ...(typeof body.isFavourite === "boolean" ? { isFavourite: body.isFavourite } : {}),
});

const createContact = async (req, res) => {
  if (hasValidationErrors(req, res)) return;
  try {
    const group = await verifyGroup(req.body.group, req.user.id);
    if (req.body.group && !group) return res.status(404).json({ message: "Group not found" });

    const duplicate = await findDuplicateContact(req.user.id, req.body);
    if (duplicate) {
      return res.status(409).json({ message: "A contact with the same phone or email already exists." });
    }

    const contact = await Contact.create({ ...contactData(req.body, group), owner: req.user.id });
    return res.status(201).json({ data: contact });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create contact" });
  }
};

const listContacts = async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  try {
    const filter = {
      owner: req.user.id,
      ...(req.query.favourite === "true" ? { isFavourite: true } : {}),
    };
    const [data, total] = await Promise.all([
      Contact.find(filter).populate("group", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);
    return res.status(200).json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to list contacts" });
  }
};

const searchContacts = async (req, res) => {
  const query = String(req.query.q || "").trim();
  if (!query) return res.status(400).json({ message: "Search query is required" });

  const { page, limit, skip } = getPagination(req);
  const expression = new RegExp(escapeRegex(query), "i");
  const filter = {
    owner: req.user.id,
    $or: [{ name: expression }, { phone: expression }, { email: expression }],
  };

  try {
    const [data, total] = await Promise.all([
      Contact.find(filter).populate("group", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);
    return res.status(200).json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to search contacts" });
  }
};

const toggleFavourite = async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Contact not found" });
  try {
    const contact = await Contact.findOne({ _id: req.params.id, owner: req.user.id });
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    contact.isFavourite = !contact.isFavourite;
    await contact.save();
    await contact.populate("group", "name");
    return res.status(200).json({ data: contact });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update favourite" });
  }
};

const listContactsByGroup = async (req, res) => {
  if (!validId(req.params.groupId)) return res.status(404).json({ message: "Group not found" });
  const { page, limit, skip } = getPagination(req);
  try {
    const group = await Group.findOne({ _id: req.params.groupId, owner: req.user.id });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const filter = { owner: req.user.id, group: group._id };
    const [data, total] = await Promise.all([
      Contact.find(filter).populate("group", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);
    return res.status(200).json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to list group contacts" });
  }
};

const getContactStats = async (req, res) => {
  if (!validId(req.user.id)) return res.status(200).json({ total: 0, favourites: 0, byGroup: [] });
  try {
    const [result] = await Contact.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                favourites: { $sum: { $cond: ["$isFavourite", 1, 0] } },
              },
            },
          ],
          byGroup: [
            { $match: { group: { $ne: null } } },
            { $group: { _id: "$group", count: { $sum: 1 } } },
            {
              $lookup: {
                from: "groups",
                let: { groupId: "$_id" },
                pipeline: [
                  { $match: { $expr: { $and: [{ $eq: ["$_id", "$$groupId"] }, { $eq: ["$owner", new mongoose.Types.ObjectId(req.user.id)] }] } } },
                ],
                as: "group",
              },
            },
            { $unwind: "$group" },
            { $project: { _id: 0, groupId: "$_id", groupName: "$group.name", count: 1 } },
            { $sort: { groupName: 1 } },
          ],
        },
      },
    ]);
    const summary = result.summary[0] || { total: 0, favourites: 0 };
    return res.status(200).json({ total: summary.total, favourites: summary.favourites, byGroup: result.byGroup });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load contact stats" });
  }
};

const getContact = async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Contact not found" });
  try {
    const contact = await Contact.findOne({ _id: req.params.id, owner: req.user.id }).populate("group", "name");
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    return res.status(200).json({ data: contact });
  } catch (error) {
    return res.status(404).json({ message: "Contact not found" });
  }
};

const updateContact = async (req, res) => {
  if (hasValidationErrors(req, res)) return;
  if (!validId(req.params.id)) return res.status(404).json({ message: "Contact not found" });
  try {
    const group = await verifyGroup(req.body.group, req.user.id);
    if (req.body.group && !group) return res.status(404).json({ message: "Group not found" });

    const duplicate = await findDuplicateContact(req.user.id, req.body, req.params.id);
    if (duplicate) {
      return res.status(409).json({ message: "A contact with the same phone or email already exists." });
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      contactData(req.body, group, true),
      { new: true, runValidators: true }
    ).populate("group", "name");
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    return res.status(200).json({ data: contact });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update contact" });
  }
};

const deleteContact = async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Contact not found" });
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    return res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete contact" });
  }
};

module.exports = {
  createContact,
  listContacts,
  searchContacts,
  toggleFavourite,
  listContactsByGroup,
  getContactStats,
  getContact,
  updateContact,
  deleteContact,
};