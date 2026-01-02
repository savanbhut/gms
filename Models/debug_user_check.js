const mongoose = require('mongoose');
const { User } = require('./model');

mongoose.connect('mongodb://127.0.0.1:27017/gms_db')
    .then(async () => {
        console.log("Connected. Checking for manager...");
        const user = await User.findOne({ email: 'manager123@gmail.com' });
        if (user) {
            console.log("User FOUND:", user);
        } else {
            console.log("User NOT FOUND");
        }
        process.exit();
    })
    .catch(err => console.error(err));
