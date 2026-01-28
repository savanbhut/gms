const axios = require('axios');

async function testBooking() {
    try {
        console.log("Creating booking...");
        const res = await axios.post('http://localhost:5000/api/bookings', {
            uid: 8153, // Existing user
            serviceId: 102, // Oil Change (1500)
            date: '2026-02-01',
            time: '10:00',
            description: 'Test Booking'
        });
        console.log("Create Res:", res.data);
        const bid = res.data.bid;

        console.log("Fetching User Bookings...");
        const getRes = await axios.get('http://localhost:5000/api/bookings/8153');
        const booking = getRes.data.find(b => b.bid === bid);
        console.log("Fetched Booking:", booking);

        if (booking.totalCost === 1500) {
            console.log("SUCCESS: Dynamic cost is working (1500)");
        } else {
            console.log("FAILURE: Cost is", booking.totalCost);
        }
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

testBooking();
