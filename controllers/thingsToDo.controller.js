import thingsToDoModel from '../models/thingsToDo.model.js';
import { logAction } from '../utils/logger.js';

export const addThingsToDo = async (req, res) => {
    try {
        const newActivity = new thingsToDoModel(req.body);
        const savedActivity = await newActivity.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "CREATE_ACTIVITY", {
                activityId: savedActivity._id,
                title: savedActivity.title || "Activity"
            });
        }

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

        // Log the action
        if (req.user) {
            await logAction(req.user, "UPDATE_ACTIVITY", {
                activityId: updatedActivity._id,
                title: updatedActivity.title || "Activity",
                updatedFields: Object.keys(req.body)
            });
        }

        res.status(200).json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteThingsToDo = async (req, res) => {
    try {
        const activity = await thingsToDoModel.findById(req.params.id);
        await thingsToDoModel.findByIdAndDelete(req.params.id);

        // Log the action
        if (req.user) {
            await logAction(req.user, "DELETE_ACTIVITY", {
                activityId: req.params.id,
                title: activity?.title || "Activity"
            });
        }

        res.status(200).json({ message: "Activity deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
