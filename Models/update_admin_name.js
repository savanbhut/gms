const mongoose = require('mongoose');
const { GarageList } = require('./model');

mongoose.connect('mongodb://127.0.0.1:27017/gms_db')
    .then(async () => {
        console.log('Connected to DB');

        // Update GarageList (The Agency/HQ)
        const res = await GarageList.updateOne(
            { glid: 1 },
            { $set: { owner_name: 'Super Admin' } }
        );
        console.log('GarageList Update Result:', res);

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
