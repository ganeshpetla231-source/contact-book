const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Group = require("../models/Group");
const Contact = require("../models/Contact");

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

const createGroup = async (req, res) => {
  if (hasValidationErrors(req, res)) return;
  try {
    const group = await Group.create({ name: req.body.name, owner: req.user.id });
    return res.status(201).json({ data: group });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create group" });
  }
};

const listGroups = async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  try {
    const filter = { owner: req.user.id };
    const [data, total] = await Promise.all([
      Group.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Group.countDocuments(filter),
    ]);
    return res.status(200).json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to list groups" });
  }
};

const getGroup = async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Group not found" });
  try {
    const group = await Group.findOne({ _id: req.params.id, owner: req.user.id });
    if (!group) return res.status(404).json({ message: "Group not found" });
    return res.status(200).json({ data: group });
  } catch (error) {
    return res.status(404).json({ message: "Group not found" });
  }
};

const updateGroup = async (req, res) => {
  if (hasValidationErrors(req, res)) return;
  if (!validId(req.params.id)) return res.status(404).json({ message: "Group not found" });
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!group) return res.status(404).json({ message: "Group not found" });
    return res.status(200).json({ data: group });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update group" });
  }
};

const deleteGroup = async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Group not found" });
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!group) return res.status(404).json({ message: "Group not found" });
    await Contact.updateMany({ group: group._id, owner: req.user.id }, { $set: { group: null } });
    return res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete group" });
  }
};

module.exports = { createGroup, listGroups, getGroup, updateGroup, deleteGroup };