const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GarageList, User, Service, Booking, Payment } = require('./model');

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO DATABASE
mongoose.connect('mongodb://127.0.0.1:27017/gms_db')
    .then(() => console.log('Connected to GMS Database'))
    .catch(err => console.error('DB Error:', err));

// --- API ROUTES ---

// Login
app.post('/api/login', async (req, res) => {
    const { email, password, user_type } = req.body;
    const user = await User.findOne({ email, password, user_type });
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

// Get Services
app.get('/api/services', async (req, res) => {
    const services = await Service.find({ is_active: true });
    res.json(services);
});

// Create Booking
app.post('/api/bookings', async (req, res) => {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ success: true, message: "Booking Created" });
});

app.listen(5000, () => console.log('Backend running on port 5000'));