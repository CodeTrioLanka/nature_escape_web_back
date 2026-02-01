import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ServicePageModel from './models/service.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const data = {
    "serviceheroes": [
        {
            "heroImage": "https://res.cloudinary.com/demo/image/upload/v1/services-hero.jpg",
            "title": "Our Services",
            "subtitle": "Nature Escape",
            "description": "At Nature Escape Tours, we specialize in crafting meaningful travel experiences that showcase the natural beauty, culture, and heritage of Sri Lanka. With a passion for exploration and a strong understanding of the island's diverse landscapes, we provide thoughtfully designed journeys for travelers seeking authentic and responsible adventures.\n\nOur services include customized tour packages, carefully selected accommodations, knowledgeable local guides, comfortable transportation, and complete travel assistance."
        }
    ],
    "services": [
        {
            "title": "MICE",
            "description": "Meetings, Incentives, Conferences & Exhibitions - We organize corporate events and business travel with professional planning and execution.",
            "image": "https://res.cloudinary.com/demo/image/upload/v1/mice-service.jpg"
        },
        {
            "title": "VISA",
            "description": "Complete visa assistance for travelers visiting Sri Lanka. We handle all documentation and application processes.",
            "image": "https://res.cloudinary.com/demo/image/upload/v1/visa-service.jpg"
        },
        {
            "title": "TOUR GUIDE",
            "description": "Expert local guides who speak multiple languages and provide authentic cultural insights throughout your journey.",
            "image": "https://res.cloudinary.com/demo/image/upload/v1/tour-guide.jpg"
        },
        {
            "title": "CRUISE OPERATIONS",
            "description": "Shore excursions and cruise passenger services at all major Sri Lankan ports with seamless logistics.",
            "image": "https://res.cloudinary.com/demo/image/upload/v1/cruise-ops.jpg"
        },
        {
            "title": "CSR",
            "description": "Corporate Social Responsibility programs that connect businesses with meaningful community projects.",
            "image": "https://res.cloudinary.com/demo/image/upload/v1/csr-service.jpg"
        },
        {
            "title": "EXCURSIONS",
            "description": "Day trips and adventures to explore Sri Lanka's natural wonders, wildlife, and historical sites.",
            "image": "https://res.cloudinary.com/demo/image/upload/v1/excursions.jpg"
        },
        {
            "title": "TRANSPORTATION",
            "description": "Comfortable and reliable transport services including luxury vehicles, vans, and coaches.",
            "image": "https://res.cloudinary.com/demo/image/upload/v1/transportation.jpg"
        }
    ]
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        await ServicePageModel.deleteMany({});
        await ServicePageModel.create(data);
        console.log('Successfully seeded ServicePage model');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
