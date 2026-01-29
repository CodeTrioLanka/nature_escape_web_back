import thingsToDoModel from '../models/thingsToDo.model.js';

export const addThingsToDo = async (req, res) => {
    try {
        const newActivity = new thingsToDoModel(req.body);
        const savedActivity = await newActivity.save();
        res.status(201).json(savedActivity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getThingsToDo = async (req, res) => {
    try {
        const activities = await thingsToDoModel.find();
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateThingsToDo = async (req, res) => {
    try {
        const updatedActivity = await thingsToDoModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteThingsToDo = async (req, res) => {
    try {
        await thingsToDoModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Activity deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
