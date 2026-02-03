import contactUs from '../models/contactUs.model.js';
import { logAction } from '../utils/logger.js';

export const getContactUsData = async (req, res) => {
    try {
        const contactData = await contactUs.findOne();
        if (!contactData) {
            return res.status(200).json({

                email: [],
                phone: [],
                address: [],
                googleMap: "",
                socials: { facebook: "", instagram: "", twitter: "" }
            });
        }
        res.status(200).json(contactData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const setContactUsData = async (req, res) => {
    try {
        const { email, phone, address, googleMap, socials } = req.body;

        // Check if a document already exists
        let contactData = await contactUs.findOne();

        if (contactData) {
            // Update existing document
            contactData.email = email;
            contactData.phone = phone;
            contactData.address = address;
            contactData.googleMap = googleMap;
            contactData.socials = socials;

            await contactData.save();
        } else {
            // Create new document
            contactData = new contactUs({
                email,
                phone,
                address,
                googleMap,
                socials
            });
            await contactData.save();
        }

        // Log the action
        if (req.user) {
            const action = contactData.isNew ? "CREATE_CONTACT_PAGE" : "UPDATE_CONTACT_PAGE";
            await logAction(req.user, action, {
                contactId: contactData._id,
                updatedFields: Object.keys(req.body)
            });
        }

        res.status(200).json(contactData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
