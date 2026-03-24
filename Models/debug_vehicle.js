const mongoose = require('mongoose');
const { BookedService, Payment, Service } = require('./model');

async function debug() {
    await mongoose.connect('mongodb://127.0.0.1:27017/gms_db');
    const successPayments = await Payment.find({status: 'Success'});
    const validPaymentBids = successPayments.map(p => p.bid);
    
    const revenueByVehicleTypeRaw = await BookedService.aggregate([
        { $match: { bid: { $in: validPaymentBids } } },
        { $lookup: { from: "services", localField: "sid", foreignField: "sid", as: "serviceDetails" } },
        { $unwind: "$serviceDetails" },
        { $group: { _id: "$serviceDetails.vehicle_type", revenue: { $sum: "$cost" } } }
    ]);
    console.log('Result RAW:', JSON.stringify(revenueByVehicleTypeRaw));
    process.exit(0);
}
debug().catch(console.error);
