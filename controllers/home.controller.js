import Home from "../models/home.model.js";

export const homeGet = async (req, res) => {
  try {
    const homes = await Home.find().sort({ createdAt: -1 });
    res.json({ homes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch homes" });
  }
};

export const homeCretae = async (req, res) => {
  try {
    const create = await Home.create(req.body);
    res.status(201).json({ create, message: "Home Changed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const homeEdit = async (req, res) => {
  try {
    const home = await Home.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }
    res.json({ home, message: "Home updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const homeDelete = async (req, res) => {
  try {
    const home = await Home.findByIdAndDelete(req.params.id);
    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }
    res.json({ message: "Home deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
