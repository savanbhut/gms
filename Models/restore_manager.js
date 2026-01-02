const mongoose = require('mongoose');
const { User } = require('./model');

mongoose.connect('mongodb://127.0.0.1:27017/gms_db')
    .then(async () => {
        console.log('Connected to DB');

        const managerEmail = 'manager123@gmail.com';
        const existingManager = await User.findOne({ email: managerEmail });

        if (!existingManager) {
            console.log('Manager not found. Creating...');
            const managerUser = new User({
                uid: 9001,
                f_name: 'Manager',
                l_name: 'John',
                email: managerEmail,
                password: 'manager@2026',
                address: 'Branch Office',
                user_type: 'manager',
                gid: 1
            });
            await managerUser.save();
            console.log('Manager User Created Successfully');
        } else {
            console.log('Manager User already exists.');
        }

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
