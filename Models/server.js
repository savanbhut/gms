const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Import all models
const { GarageList, Garage, User, Staff, Customer, Service, Booking, BookedService, Payment, Feedback } = require('./model');

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO DATABASE
mongoose.connect('mongodb://127.0.0.1:27017/gms_db')
    .then(() => console.log('Connected to GMS Database'))
    .catch(err => console.error('DB Error:', err));

// --- API ROUTES ---

app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

// Update Service ( Moved Up for Debugging )
app.put('/api/services/:sid', async (req, res) => {
    console.log(`[ROUTE MATCHED] PUT /api/services/${req.params.sid}`, req.body);
    try {
        const sid = parseInt(req.params.sid);
        const { service_name, vehicle_type, price, duration, description, is_active } = req.body;

        const result = await Service.updateOne(
            { sid },
            { $set: { service_name, vehicle_type, price, duration, description, is_active } }
        );

        if (result.matchedCount > 0) {
            res.json({ success: true, message: "Service updated successfully" });
        } else {
            console.log("Service not found for update:", sid);
            res.status(404).json({ success: false, message: "Service not found" });
        }
    } catch (err) {
        console.error("Update Service Error:", err);
        res.status(500).json({ success: false, message: "Error updating service" });
    }
});

// REGISTER API (Public - defaults to Customer)
// Note: Generating numeric IDs (UID, CID) randomly for simplicity as no auto-increment plugin is active.
// In production, use true auto-increment.
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, address, role } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // 2. Create USER Entry
        // Generate random numeric UID (simple workaround for now)
        const uid = Math.floor(Math.random() * 100000);

        const newUser = new User({
            uid,
            f_name: firstName,
            l_name: lastName,
            email,
            password, // In real app, HASH THIS PASSWORD!
            address,
            user_type: role || 'customer' // Default to customer
        });
        await newUser.save();

        // 3. Create Specific Profile (Customer)
        if (role === 'customer' || !role) {
            const cid = Math.floor(Math.random() * 100000);
            const newCustomer = new Customer({
                cid,
                uid,
                name: `${firstName} ${lastName}`,
                address,
                phone,
                email
            });
            await newCustomer.save();
        }
        // Logic for 'admin' (Garage Owner) creation would go here if public registration allowed it,
        // but user restricts that.

        res.json({ success: true, message: "Registration successful" });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, message: "Server error during registration" });
    }
});

// LOGIN API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find User
        console.log("LOGIN ATTEMPT:", email, "Password:", password);
        const user = await User.findOne({ email, password });
        console.log("LOGIN RESULT:", user ? "FOUND" : "NOT FOUND");

        // 2. If not found in User table, check GarageList (for Garage Owners who might have separate login?)
        // The dictionary implies GarageList has UID/Password too. 
        // For simplicity, we assume all logins go through User table first or we check both.
        // Let's stick to User table for the main auth as per standard flow.

        if (user) {
            // Check if Customer profile exists for 'customer' role
            if (user.user_type === 'customer') {
                const customerProfile = await Customer.findOne({ uid: user.uid });
                if (!customerProfile) {
                    // Create missing Customer profile
                    console.log("Creating missing Customer profile for:", user.email);
                    const newCustomer = new Customer({
                        cid: Math.floor(Math.random() * 100000),
                        uid: user.uid,
                        name: `${user.f_name} ${user.l_name}`,
                        address: user.address,
                        email: user.email,
                        phone: "0000000000" // Placeholder or try fetch from User if schema supports
                    });
                    await newCustomer.save();
                }
            }

            res.json({
                success: true,
                user: {
                    uid: user.uid,
                    name: `${user.f_name} ${user.l_name}`,
                    email: user.email,
                    role: user.user_type
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

// --- Other API Placeholders ---

// --- GARAGE APIs ---

// Get Garage Details
app.get('/api/garage/:gid', async (req, res) => {
    console.log(`GET /api/garage/${req.params.gid}`);
    try {
        const gid = parseInt(req.params.gid);
        const garage = await Garage.findOne({ gid });
        if (!garage) return res.status(404).json({ message: "Garage not found" });
        res.json(garage);
    } catch (err) {
        console.error("Error fetching garage:", err);
        res.status(500).json({ message: "Error fetching garage details" });
    }
});

// Update Garage Details
app.put('/api/garage/:gid', async (req, res) => {
    console.log(`PUT /api/garage/${req.params.gid}`, req.body);
    try {
        const gid = parseInt(req.params.gid);
        const { g_name, owner_name, phone, address, email, pincode } = req.body;

        // Ensure "Only one garage" logic / Single Admin restriction essentially
        // We only allow updating if it matches key admin garage or any existing. 

        const result = await Garage.updateOne(
            { gid },
            { $set: { g_name, owner_name, phone, address, email, pincode } }
        );

        if (result.matchedCount > 0) {
            res.json({ success: true, message: "Garage details updated" });
        } else {
            res.status(404).json({ success: false, message: "Garage not found" });
        }
    } catch (err) {
        console.error("Update Garage Error:", err);
        res.status(500).json({ success: false, message: "Error updating garage" });
    }
});

// --- SERVICE APIs ---

// Get API for Services
app.get('/api/services', async (req, res) => {
    try {
        // Fetch ALL services, not just active ones, so Admin can see inactive
        const services = await Service.find({});
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: "Error fetching services" });
    }
});

// --- BOOKING APIs ---

// Get Bookings for a User
app.get('/api/bookings/:uid', async (req, res) => {
    try {
        // Find bookings where the Customer's UID matches
        // First get the CID for this UID
        const customer = await Customer.findOne({ uid: req.params.uid });
        if (!customer) return res.json([]); // No customer profile yet

        // Fetch bookings for this CID
        // We might want to populate Service details to show names
        // But our Booking schema just has GID, CID. 
        // Wait, checking schema... BookingSchema has gid, cid, date, status, description, time.
        // It does NOT have 'service_name'. 
        // USUALLY a booking is for a SPECIFIC service (or multiple). 
        // The dictionary has a 'Booked_Services_Tbl' for that.
        // For simplified "Flipkart" flow where you "Book a Service", we often just link standard Booking -> Service directly 
        // OR we must create entries in both Booking logic.
        // Let's assume for this "Book Now" flow, we create a Booking AND a BookedService, 
        // OR we simplify and say a Booking has a 'service_id' or 'service_name' embedded for this MVP if the schema allows,
        // BUT we must follow the schema: Booking -> BookedService.

        // For simplicity in this step, I will fetch Bookings and maybe simplistic join or just show basic info.
        // Actually, let's update proper retrieval:
        const bookings = await Booking.find({ cid: customer.cid });

        // To show Service Name, we need the linked BookedService. 
        // This is getting complex for a simple "flipkart view".
        // I will do a clear simplified approach: 
        // On POST /bookings, I will create Booking + BookedService.
        // On GET /bookings, I will try to fetch details.

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Error fetching bookings" });
    }
});

// Create Booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { uid, serviceIds, serviceId, date, time, description } = req.body;

        // Support both single serviceId (legacy/simple) and array serviceIds
        const selectedIds = serviceIds || (serviceId ? [serviceId] : []);

        if (selectedIds.length === 0) {
            return res.status(400).json({ success: false, message: "No services selected" });
        }

        // 1. Resolve Customer
        const customer = await Customer.findOne({ uid });
        if (!customer) return res.status(404).json({ success: false, message: "Customer profile not found" });

        // 2. Fetch all selected services to get Details & Prices
        const services = await Service.find({ sid: { $in: selectedIds } });

        if (services.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid services selected" });
        }

        // Calculate Stats
        const totalCost = services.reduce((sum, s) => sum + s.price, 0);
        const serviceNames = services.map(s => s.service_name).join(", ");

        // Resolve Garage (Use the first service's garage for now, usually a cart belongs to one vendor/garage)
        // In multi-vendor, we might split bookings, but for now assuming single garage context.
        const gid = services[0].gid || 1;

        // 3. Create SINGLE Booking Record (The Wrapper)
        const bid = Math.floor(Math.random() * 1000000);
        const newBooking = new Booking({
            bid,
            gid,
            cid: customer.cid,
            date,
            time,
            status: 'Pending',
            // Append user description to service list
            description: `Services: ${serviceNames}. Notes: ${description || 'None'}`
        });
        await newBooking.save();

        // 4. Create MULTIPLE BookedService Records (The Line Items)
        const bookedServicePromises = services.map(service => {
            const bsid = Math.floor(Math.random() * 1000000);
            return new BookedService({
                bsid,
                bid,
                sid: service.sid,
                cost: service.price,
                service_date: date,
                status: 'Pending'
            }).save();
        });

        await Promise.all(bookedServicePromises);

        res.json({ success: true, message: `Booking confirmed for ${services.length} service(s)!`, bid });
    } catch (err) {
        console.error("Booking Error:", err);
        res.status(500).json({ success: false, message: "Failed to book services" });
    }
});

// Seed Services (Helper to populate DB)
// Seed Services (Helper to populate DB)
app.post('/api/seed', async (req, res) => {
    try {
        // 1. Ensure Garage List exists (The Root)
        let garageList = await GarageList.findOne({ glid: 1 });
        if (!garageList) {
            garageList = new GarageList({
                glid: 1,
                garage_name: 'Main HQ',
                owner_name: 'Super Admin',
                phone: '9999999999',
                uid: 99999, // Dummy Admin UID
                password: 'admin',
                date: new Date()
            });
            await garageList.save();
            console.log("Seeded GarageList");
        }

        // 1.1 Ensure Specific Admin User exists (Requested by User)
        const adminEmail = 'admin123@gmail.com';
        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            adminUser = new User({
                uid: 1001, // Specific UID for this admin
                f_name: 'Super',
                l_name: 'Admin',
                email: adminEmail,
                password: 'GarageAdmin@2026', // Updated to avoid browser warnings
                address: 'HQ Address',
                user_type: 'admin',
                gid: 1 // Link to main garage
            });
            await adminUser.save();
            await adminUser.save();
            console.log("Seeded Admin User");
        }

        // 1.2 Ensure Manager User exists (Requested by User)
        const managerEmail = 'manager123@gmail.com';
        let managerUser = await User.findOne({ email: managerEmail });
        if (!managerUser) {
            managerUser = new User({
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
            console.log("Seeded Manager User");
        }


        // 2. Ensure Garage exists (The Branch)
        let garage = await Garage.findOne({ gid: 1 });
        if (!garage) {
            garage = new Garage({
                gid: 1,
                glid: 1,
                g_name: 'Downtown Garage',
                owner_name: 'Manager John',
                phone: '8888888888',
                address: '123 Main St, City',
                email: 'garage@example.com',
                pincode: 123456
            });
            await garage.save();
            console.log("Seeded Garage");
        }

        // 3. Seed Services
        const count = await Service.countDocuments();
        if (count === 0) {
            const services = [
                { sid: 101, gid: 1, service_name: 'General Service', vehicle_type: 'Car', price: 2500, duration: '4 Hours', description: 'Complete checkup, oil top-up, and wash.' },
                { sid: 102, gid: 1, service_name: 'Oil Change', vehicle_type: 'Car', price: 1500, duration: '1 Hour', description: 'Synthetic oil replacement and filter change.' },
                { sid: 103, gid: 1, service_name: 'Car Wash', vehicle_type: 'Car', price: 500, duration: '45 Mins', description: 'Exterior foam wash and interior vacuuming.' },
                { sid: 104, gid: 1, service_name: 'AC Repair', vehicle_type: 'Car', price: 3000, duration: '6 Hours', description: 'AC gas refill and cooling coil cleaning.' },
                { sid: 105, gid: 1, service_name: 'Wheel Alignment', vehicle_type: 'Car', price: 800, duration: '1 Hour', description: 'Precision wheel alignment and balancing.' }
            ];
            await Service.insertMany(services);
            res.json({ success: true, message: "Services and Garage Entities seeded" });
        } else {
            res.json({ success: false, message: "Services already exist" });
        }
    } catch (err) {
        console.error("Seeding Error:", err);
        res.status(500).json({ message: "Seeding failed" });
    }
});

// --- PAYMENT APIs ---

app.get('/api/payments/:uid', async (req, res) => {
    try {
        const customer = await Customer.findOne({ uid: req.params.uid });
        if (!customer) return res.json([]);

        // Find bookings for this customer to filter payments (or just store CID in payment if schema allowed, 
        // but Payment schema links to Booking ID (bid). So we need to find payments for bookings of this customer)
        // 1. Get all BIDs for customer
        const bookings = await Booking.find({ cid: customer.cid });
        const bids = bookings.map(b => b.bid);

        // 2. Find Payments for these BIDs
        const payments = await Payment.find({ bid: { $in: bids } });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: "Error fetching payments" });
    }
});

app.post('/api/payments', async (req, res) => {
    console.log("DEBUG: Payment Request:", req.body);
    try {
        const { uid, bid, amount, paymentMethod } = req.body;

        // Check if already paid
        const existingPayment = await Payment.findOne({ bid, status: 'Success' });
        if (existingPayment) {
            return res.status(400).json({ success: false, message: "Booking already paid" });
        }

        const pid = Math.floor(Math.random() * 1000000);
        const newPayment = new Payment({
            pid,
            payment_type: paymentMethod || 'Card',
            bid,
            amount,
            date: new Date(),
            status: 'Success',
            transaction_id: `TXN${Math.floor(Math.random() * 10000000)}`
        });
        await newPayment.save();

        // Update Booking Status to Confirmed
        await Booking.updateOne({ bid }, { status: 'Confirmed' });

        res.json({ success: true, message: "Payment successful!" });
    } catch (err) {
        console.error("DEBUG: Payment Error:", err);
        res.status(500).json({ success: false, message: "Payment failed" });
    }
});

// --- STAFF APIs ---

app.get('/api/staff', async (req, res) => {
    try {
        const staff = await Staff.find({});
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: "Error fetching staff" });
    }
});

app.post('/api/staff', async (req, res) => {
    try {
        const { firstName, lastName, role, phone, email, salary, education, address } = req.body;

        // Validation
        if (!firstName || !lastName || !role || !phone || !email || !salary) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validate Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        // Validate Phone (Digits only, length 10)
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: "Phone must be 10 digits" });
        }

        // Check Duplicates
        const existingStaff = await Staff.findOne({ $or: [{ email }, { phone }] });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: "Staff with this email or phone already exists" });
        }

        const stfid = Math.floor(Math.random() * 100000);
        const newStaff = new Staff({
            stfid,
            gid: 1, // Default garage
            f_name: firstName,
            l_name: lastName,
            role,
            phone,
            email,
            salary: Number(salary),
            education,
            address,
            join_date: new Date(),
            is_active: true
        });

        await newStaff.save();
        res.json({ success: true, message: "Staff added successfully" });

    } catch (err) {
        console.error("Add Staff Error Details:", err); // Enhanced logging
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: "Validation Error: " + err.message });
        }
        res.status(500).json({ success: false, message: "Error adding staff: " + err.message });
    }
});

// --- FEEDBACK APIs ---

app.get('/api/feedback/:uid', async (req, res) => {
    try {
        const customer = await Customer.findOne({ uid: req.params.uid });
        if (!customer) return res.json([]);

        const feedbacks = await Feedback.find({ cid: customer.cid });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: "Error fetching feedback" });
    }
});

app.post('/api/feedback', async (req, res) => {
    try {
        const { uid, gid, message } = req.body;

        const customer = await Customer.findOne({ uid });
        if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

        const fid = Math.floor(Math.random() * 1000000);
        const newFeedback = new Feedback({
            fid,
            gid: gid || 1, // Default garage or link from booking
            cid: customer.cid,
            description: message,
            date: new Date()
        });
        await newFeedback.save();

        res.json({ success: true, message: "Feedback submitted!" });
    } catch (err) {
        console.error("Feedback Error:", err);
        res.status(500).json({ success: false, message: "Feedback failed" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));