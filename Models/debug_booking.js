const mongoose = require('mongoose');
const { Booking, BookedService, Service } = require('./model');

mongoose.connect('mongodb://127.0.0.1:27017/gms_db')
    .then(async () => {
        console.log("Connected");
        const bid = 902215;
        const booking = await Booking.findOne({ bid });
        if (!booking) {
            console.log("Booking not found");
        } else {
            console.log("Booking found:", booking);
            const bookedServices = await BookedService.find({ bid });
            console.log("Booked Services:", bookedServices);
            const total = bookedServices.reduce((sum, s) => sum + s.cost, 0);
            console.log("Calculated Total:", total);
        }
        process.exit();
    })
    .catch(err => console.error(err));
