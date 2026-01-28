const mongoose = require('mongoose');
const { User, GarageList } = require('./model');

mongoose.connect('mongodb://127.0.0.1:27017/gms_db')
    .then(async () => {
        console.log('Connected to DB for Admin Name Fix');

        // 1. Update the User (The login name)
        // Finding by email 'admin123@gmail.com' as seen in server.js
        const userRes = await User.updateOne(
            { email: 'admin123@gmail.com' },
            { $set: { f_name: 'Admin', l_name: '' } }
        );
        console.log('User Update Result:', userRes);

        // 2. Update the GarageList Owner Name (The dashboard display maybe)
        const garageRes = await GarageList.updateOne(
            { glid: 1 },
            { $set: { owner_name: 'Admin' } }
        );
        console.log('GarageList Update Result:', garageRes);

        console.log("Renaming Complete: 'Super Admin' -> 'Admin'");
        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
