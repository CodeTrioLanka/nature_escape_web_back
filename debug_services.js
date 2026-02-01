
import mongoose from 'mongoose';
import { application } from './config/application.js';
import ServicePageModel from './models/service.model.js';

const debugDb = async () => {
    try {
        await mongoose.connect(application.MONGO_URI);
        console.log('Connected to DB');

        const docs = await ServicePageModel.find({});
        console.log('Total ServicePage documents:', docs.length);

        docs.forEach((doc, i) => {
            console.log(`Document ${i} ID: ${doc._id}`);
            console.log('Services count:', doc.services.length);
            doc.services.forEach(s => {
                console.log(` - Service ID: ${s._id} (${typeof s._id})`);
                console.log(`   Title: ${s.title}`);
            });
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugDb();
