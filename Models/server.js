const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
// Import all models
const { GarageList, Garage, User, Staff, Customer, Service, Booking, BookedService, Payment, Feedback } = require('./model');
const Razorpay = require('razorpay');

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: 'rzp_test_RTQIz97y5TkM1p',
    key_secret: 'ZeYyRu2kNttTTQewjVrAVYDe'
});

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

// --- FORGOT PASSWORD APIs ---

// 1. Forgot Password - Generate & Send OTP
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Email not found" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const { OTP } = require('./model');

        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // Send Email using Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'savanbhut56@gmail.com',
                pass: 'mdebaiksrpqkdtcr'
            }
        });

        const mailOptions = {
            from: 'savanbhut56@gmail.com',
            to: email,
            subject: 'Garage Hub - Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email Error:", error);
                // We still fail gracefully if email fails, or return error? 
                // User wants it to come in mail, so if it fails, we should probably tell them.
                return res.status(500).json({ success: false, message: "Failed to send email" });
            } else {
                console.log('Email sent: ' + info.response);
                res.json({ success: true, message: "OTP sent to your email" });
            }
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const { OTP } = require('./model');

        const record = await OTP.findOne({ email, otp });

        if (record) {
            res.json({ success: true, message: "OTP Verified" });
        } else {
            res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 3. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const { OTP } = require('./model');

        // Double check OTP valid
        const record = await OTP.findOne({ email, otp });
        if (!record) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // Update Password
        // In real app: Hash password
        await User.updateOne({ email }, { $set: { password: newPassword } });

        // Delete used OTP
        await OTP.deleteOne({ email });

        res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 4. Change Password (Logged In)
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { uid, currentPassword, newPassword } = req.body;

        // Find user by UID (assuming uid is unique enough for this mock set up, or email)
        // Since we store uid in localStorage, we use that.
        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify current password (Simple string comparison for verified mock)
        if (user.password !== currentPassword) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        // Update to new password
        await User.updateOne({ uid }, { $set: { password: newPassword } });

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("Change Password Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 5. Get User Profile
app.get('/api/profile/:uid', async (req, res) => {
    try {
        const uid = parseInt(req.params.uid);
        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let profileData = {
            uid: user.uid,
            firstName: user.f_name,
            lastName: user.l_name,
            email: user.email,
            phone: '', // Will fetch from Role table
            address: user.address,
            role: user.user_type
        };

        // Fetch additional details based on role
        if (user.user_type === 'customer') {
            const customer = await Customer.findOne({ uid });
            if (customer) {
                profileData.phone = customer.phone;
                profileData.address = customer.address || user.address;
            }
        } else if (['admin', 'manager', 'mechanic'].includes(user.user_type)) {
            // For staff/admin, phone might be in Staff table or GarageList if super admin
            // Simplification: Try to find in Staff table if not admin/owner
            // If Admin/Owner, maybe in GarageList or Garage
            // For this specific request "savan bhut", he is likely a customer or admin. 
            // Let's check Staff table for completeness if needed, or just return what we have in User.
            // User table doesn't have phone in schema, but Customer/Staff/Garage do.
            // Let's try finding in Staff
            const staff = await Staff.findOne({ email: user.email });
            if (staff) {
                profileData.phone = staff.phone;
            } else {
                // Try GarageList for Admin
                const owner = await GarageList.findOne({ uid });
                if (owner) profileData.phone = owner.phone;
            }
        }

        res.json({ success: true, profile: profileData });

    } catch (err) {
        console.error("Get Profile Error:", err);
        res.status(500).json({ success: false, message: "Error fetching profile" });
    }
});

// 6. Update User Profile
app.put('/api/profile/:uid', async (req, res) => {
    try {
        const uid = parseInt(req.params.uid);
        const { firstName, lastName, phone, address, email } = req.body;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 1. Update User Table
        await User.updateOne({ uid }, {
            $set: {
                f_name: firstName,
                l_name: lastName,
                // email: email, // Email update is tricky as it's a key, let's allow it but check unique
                address: address
            }
        });

        // 2. Update Role Specific Table
        if (user.user_type === 'customer') {
            await Customer.updateOne({ uid }, {
                $set: {
                    name: `${firstName} ${lastName}`,
                    phone: phone,
                    address: address,
                    // email: email
                }
            });
        }

        // Note: For real app, handle email uniqueness check if changing email

        res.json({ success: true, message: "Profile updated successfully" });

    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ success: false, message: "Error updating profile" });
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

// Get API for Customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching customers" });
    }
});

// Create New Service
app.post('/api/services', async (req, res) => {
    try {
        const { service_name, vehicle_type, price, duration, description, is_active } = req.body;

        if (!service_name || !vehicle_type || !price || !duration) {
            return res.status(400).json({ success: false, message: "Missing service details" });
        }

        const sid = Math.floor(Math.random() * 100000);
        const newService = new Service({
            sid,
            gid: 1, // Default garage
            service_name,
            vehicle_type,
            price,
            duration,
            description,
            is_active: is_active !== undefined ? is_active : true
        });

        await newService.save();
        res.json({ success: true, message: "Service added successfully" });
    } catch (err) {
        console.error("Add Service Error:", err);
        res.status(500).json({ success: false, message: "Error adding service" });
    }
});

// --- DASHBOARD APIs ---

app.get('/api/stats/dashboard', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const totalBookings = await Booking.countDocuments({});
        const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
        const completedToday = await Booking.countDocuments({
            status: 'Completed',
            date: { $gte: today, $lt: tomorrow }
        });

        // Total Revenue (Sum of all successful payments)
        const revenueResult = await Payment.aggregate([
            { $match: { status: 'Success' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const activeCustomers = await Customer.countDocuments({});

        res.json({
            success: true,
            stats: {
                totalBookings,
                pendingBookings,
                completedToday,
                totalRevenue,
                activeCustomers
            }
        });
    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ success: false, message: "Error fetching dashboard stats" });
    }
});

// --- REPORTING APIs ---

// Helper for Report Filtering
async function getReportFilters(customerName, serviceName) {
    let finalValidBids = null;
    let validSids = null;
    let validCids = null;

    if (customerName || serviceName) {
        if (customerName) {
            const customers = await Customer.find({ name: { $regex: customerName, $options: 'i' } });
            validCids = customers.map(c => c.cid);
        }
        if (serviceName) {
            const services = await Service.find({ service_name: { $regex: serviceName, $options: 'i' } });
            validSids = services.map(s => s.sid);
        }

        let bidsForCustomer = null; 
        if (validCids) {
            const bookings = await Booking.find({ cid: { $in: validCids } });
            bidsForCustomer = bookings.map(b => b.bid);
        }

        let bidsForService = null;
        if (validSids) {
            const bookedServices = await BookedService.find({ sid: { $in: validSids } });
            bidsForService = bookedServices.map(bs => bs.bid);
        }

        if (bidsForCustomer && bidsForService) {
            finalValidBids = bidsForCustomer.filter(bid => bidsForService.includes(bid));
        } else if (bidsForCustomer) {
            finalValidBids = bidsForCustomer;
        } else if (bidsForService) {
            finalValidBids = bidsForService;
        }
        
        // If filters applied but no matches found, ensure query returns nothing
        if (finalValidBids && finalValidBids.length === 0) {
            finalValidBids = [-1]; // Impossible bid
        }
    }
    
    return { finalValidBids, validSids, validCids };
}

// 1. Financial & Revenue Reports
app.get('/api/reports/financial', async (req, res) => {
    try {
        const { startDate, endDate, customerName, serviceName } = req.query;
        let dateFilter = {};
        let bsDateFilter = {};
        
        if (startDate && endDate) {
            dateFilter.date = { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) 
            };
            bsDateFilter.service_date = { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) 
            };
        }

        const { finalValidBids, validSids } = await getReportFilters(customerName, serviceName);

        const paymentFilter = { status: 'Success', ...dateFilter };
        if (finalValidBids) paymentFilter.bid = { $in: finalValidBids };

        // Total Revenue Grouped by Date
        const revenueResult = await Payment.aggregate([
            { $match: paymentFilter },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Revenue Timeline (Daily)
        const timelineResult = await Payment.aggregate([
            { $match: paymentFilter },
            { 
               $group: { 
                   _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
                   dailyRevenue: { $sum: "$amount" } 
               } 
            },
            { $sort: { _id: 1 } }
        ]);
        
        const revenueTimeline = timelineResult.map(t => ({
            date: t._id,
            revenue: t.dailyRevenue
        }));


        const pendingFilter = { status: 'Pending', ...dateFilter };
        if (finalValidBids) pendingFilter.bid = { $in: finalValidBids };
        
        // Pending Payments
        const pendingPayments = await Payment.find(pendingFilter).populate('bid');
        const enrichedPending = await Promise.all(pendingPayments.map(async (p) => {
            const booking = await Booking.findOne({ bid: p.bid });
            let custName = 'Unknown';
            if (booking) {
                const customer = await Customer.findOne({ cid: booking.cid });
                if (customer) custName = customer.name;
            }
            return {
                ...p.toObject(),
                customerName: custName,
                date: p.date,
                amount: p.amount
            };
        }));

        const bsFilter = { ...bsDateFilter };
        if (validSids && !customerName) bsFilter.sid = { $in: validSids };
        if (finalValidBids) bsFilter.bid = { $in: finalValidBids };

        // Revenue by Service Idea: Aggregate BookedServices where Payment is Success (Complex relation)
        // Simplified: Just aggregate BookedServices cost
        const revenueByService = await BookedService.aggregate([
            { $match: bsFilter },
            { $group: { _id: "$sid", totalRevenue: { $sum: "$cost" }, count: { $sum: 1 } } }
        ]);
        
        // Enrich with Service Names
        const enrichedRevenueByService = await Promise.all(revenueByService.map(async (rs) => {
            const service = await Service.findOne({ sid: rs._id });
            return {
                serviceName: service ? service.service_name : 'Unknown Service',
                totalRevenue: rs.totalRevenue,
                count: rs.count
            };
        }));

        // Revenue by Customer
        const successPayments = await Payment.find(paymentFilter);
        
        let customerRevenueMap = {};
        for (const p of successPayments) {
            const booking = await Booking.findOne({ bid: p.bid });
            if (booking) {
                const cid = booking.cid;
                if (!customerRevenueMap[cid]) customerRevenueMap[cid] = 0;
                customerRevenueMap[cid] += p.amount;
            }
        }

        let revenueByCustomer = [];
        for (const cid in customerRevenueMap) {
            const customer = await Customer.findOne({ cid: Number(cid) });
            revenueByCustomer.push({
                customerName: customer ? customer.name : 'Unknown',
                totalRevenue: customerRevenueMap[cid]
            });
        }
        // Sort by highest revenue
        revenueByCustomer.sort((a,b) => b.totalRevenue - a.totalRevenue);

        // Revenue by Vehicle Type
        const validPaymentBids = successPayments.map(p => p.bid);
        const revenueByVehicleTypeRaw = await BookedService.aggregate([
            { $match: { bid: { $in: validPaymentBids } } },
            { $lookup: { from: "services", localField: "sid", foreignField: "sid", as: "serviceDetails" } },
            { $unwind: "$serviceDetails" },
            { $group: { _id: "$serviceDetails.vehicle_type", revenue: { $sum: "$cost" } } }
        ]);

        const revenueByVehicleType = revenueByVehicleTypeRaw.map(v => ({
            vehicleType: v._id || 'Unknown',
            revenue: v.revenue
        }));

        res.json({
            success: true,
            totalRevenue,
            revenueTimeline,
            pendingPayments: enrichedPending,
            revenueByService: enrichedRevenueByService,
            revenueByCustomer,
            revenueByVehicleType
        });
    } catch (err) {
        console.error("Financial Report Error:", err);
        res.status(500).json({ success: false, message: "Error fetching financial reports" });
    }
});

// 2. Service Performance Reports
app.get('/api/reports/services', async (req, res) => {
    try {
        const { startDate, endDate, customerName, serviceName } = req.query;
        let bsDateFilter = {};
        
        if (startDate && endDate) {
            bsDateFilter.service_date = { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) 
            };
        }

        const { finalValidBids, validSids } = await getReportFilters(customerName, serviceName);

        const bsFilter = { ...bsDateFilter };
        if (validSids && !customerName) bsFilter.sid = { $in: validSids };
        if (finalValidBids) bsFilter.bid = { $in: finalValidBids };

        // Most Popular Services
        const popularServices = await BookedService.aggregate([
            { $match: bsFilter },
            { $group: { _id: "$sid", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const enrichedPopularServices = await Promise.all(popularServices.map(async (ps) => {
            const service = await Service.findOne({ sid: ps._id });
            return {
                serviceName: service ? service.service_name : 'Unknown',
                vehicleType: service ? service.vehicle_type : 'Unknown',
                count: ps.count
            };
        }));

        // Breakdown by Vehicle Type from Booked Services
        const vehicleTypeBreakdown = await BookedService.aggregate([
            { $match: bsFilter },
            { $lookup: { from: "services", localField: "sid", foreignField: "sid", as: "serviceDetails" } },
            { $unwind: "$serviceDetails" },
            { $group: { _id: "$serviceDetails.vehicle_type", count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            popularServices: enrichedPopularServices,
            vehicleTypeBreakdown
        });
    } catch (err) {
        console.error("Service Report Error:", err);
        res.status(500).json({ success: false, message: "Error fetching service reports" });
    }
});

// 3. Customer & Feedback Reports
app.get('/api/reports/customers', async (req, res) => {
    try {
        const { startDate, endDate, customerName, serviceName } = req.query;
        let dateFilter = {};
        
        if (startDate && endDate) {
            dateFilter.date = { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) 
            };
        }

        const { finalValidBids, validCids } = await getReportFilters(customerName, serviceName);

        const bookingFilter = { ...dateFilter };
        if (validCids && !serviceName) bookingFilter.cid = { $in: validCids };
        if (finalValidBids) bookingFilter.bid = { $in: finalValidBids };

        // Top Customers (Most Bookings)
        const topCustomers = await Booking.aggregate([
            { $match: bookingFilter },
            { $group: { _id: "$cid", bookingCount: { $sum: 1 } } },
            { $sort: { bookingCount: -1 } },
            { $limit: 10 }
        ]);

        const enrichedTopCustomers = await Promise.all(topCustomers.map(async (tc) => {
            const customer = await Customer.findOne({ cid: tc._id });
            return {
                customerName: customer ? customer.name : 'Unknown',
                email: customer ? customer.email : 'Unknown',
                bookingCount: tc.bookingCount
            };
        }));

        // Customer Satisfaction / Recent Feedback
        // Just fetching the latest 10 feedbacks to display in the report
        const feedbackFilter = { ...dateFilter };
        if (validCids) feedbackFilter.cid = { $in: validCids };
        if (finalValidBids) {
             const matchingBookings = await Booking.find({ bid: { $in: finalValidBids } });
             const cidsFromBids = matchingBookings.map(b => b.cid);
             feedbackFilter.cid = { $in: cidsFromBids };
        }

        const recentFeedback = await Feedback.find(feedbackFilter).sort({ date: -1 }).limit(10);
        const enrichedFeedback = await Promise.all(recentFeedback.map(async (f) => {
            const customer = await Customer.findOne({ cid: f.cid });
            return {
                ...f.toObject(),
                customerName: customer ? customer.name : 'Unknown'
            };
        }));

        res.json({
            success: true,
            topCustomers: enrichedTopCustomers,
            recentFeedback: enrichedFeedback
        });
    } catch (err) {
        console.error("Customer Report Error:", err);
        res.status(500).json({ success: false, message: "Error fetching customer reports" });
    }
});

// --- FEEDBACK APIs ---

// Get ALL Feedback (Admin)
app.get('/api/feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({}).sort({ date: -1 });

        const enrichedFeedbacks = await Promise.all(feedbacks.map(async (f) => {
            const customer = await Customer.findOne({ cid: f.cid });
            return {
                ...f.toObject(),
                customerName: customer ? customer.name : 'Unknown'
            };
        }));

        res.json(enrichedFeedbacks);
    } catch (err) {
        console.error("Fetch Feedback Error:", err);
        res.status(500).json({ success: false, message: "Error fetching feedback" });
    }
});

// --- BOOKING APIs ---

// Get ALL Bookings (Admin/Manager)
app.get('/api/bookings', async (req, res) => {
    try {
        // Fetch all bookings sorted by _id (creation time) descending
        const bookings = await Booking.find({}).sort({ _id: -1 });

        // We need to join with Customer and Service details to make it useful
        // For MVP Mongoose without populate setup, we might stick to basic fetch
        // But the frontend expects customerName, serviceName.
        // Let's do a manual aggregation or just return IDs and let frontend handle? 
        // Better: Enrich the data server-side for the Table.

        const enrichedBookings = await Promise.all(bookings.map(async (b) => {
            const customer = await Customer.findOne({ cid: b.cid });
            // For Service Name, we simply check the description or fetch BookedService
            // The booking.description field has "Services: Name..." as per my logic in POST /bookings
            // So we can use that or fetch. Let's use the description for display speed.

            return {
                ...b.toObject(),
                id: b.bid, // Map bid to id for consistency if needed
                customerName: customer ? customer.name : 'Unknown',
                serviceName: b.description || 'Service', // Simplified
            };
        }));

        res.json(enrichedBookings);
    } catch (err) {
        res.status(500).json({ message: "Error fetching bookings" });
    }
});

// Get Bookings for a User
app.get('/api/bookings/:uid', async (req, res) => {
    try {
        // Find bookings where the Customer's UID matches
        const customer = await Customer.findOne({ uid: req.params.uid });
        if (!customer) return res.json([]);

        const bookings = await Booking.find({ cid: customer.cid });

        // Enrich bookings with total cost from BookedService
        const enrichedBookings = await Promise.all(bookings.map(async (b) => {
            const bookedServices = await BookedService.find({ bid: b.bid });
            const totalCost = bookedServices.reduce((sum, bs) => sum + bs.cost, 0);

            return {
                ...b.toObject(),
                totalCost: totalCost || 0 // Default to 0, or logic to fetch from Service if missing
            };
        }));

        res.json(enrichedBookings);
    } catch (err) {
        console.error("Error fetching customer bookings:", err);
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

// Update Booking Status (Approve/Reject/Complete)
app.put('/api/bookings/:bid/status', async (req, res) => {
    try {
        const bid = parseInt(req.params.bid);
        const { status } = req.body; // Approved, Rejected, Completed

        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Confirmed', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const result = await Booking.updateOne({ bid }, { $set: { status } });

        if (result.matchedCount > 0) {
            res.json({ success: true, message: `Booking marked as ${status}` });
        } else {
            res.status(404).json({ success: false, message: "Booking not found" });
        }
    } catch (err) {
        console.error("Update Booking Status Error:", err);
        res.status(500).json({ success: false, message: "Error updating booking status" });
    }
});

// Fix Invalid Times (Debug/Utility)
app.get('/api/debug/fix-times', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        let updatedCount = 0;

        const updatePromises = bookings.map(async (b) => {
            if (!b.time) return;

            const [hourStr, minuteStr] = b.time.split(':');
            const hour = parseInt(hourStr);

            // Check if outside 09:00 (9) to 18:00 (18)
            // Or if formatting is weird
            if (isNaN(hour) || hour < 9 || hour > 18) {
                // Generate Random Time between 9 and 17 (so 9:00 to 17:59, effectively < 18:00 range safely)
                // Actually 9 to 18 inclusive is okay if 18:00 is max.
                const randomHour = 9 + Math.floor(Math.random() * 9); // 0-8 + 9 = 9-17
                const randomMinute = Math.random() < 0.5 ? '00' : '30';
                const newTime = `${String(randomHour).padStart(2, '0')}:${randomMinute}`;

                await Booking.updateOne({ _id: b._id }, { $set: { time: newTime } });
                updatedCount++;
            }
        });

        await Promise.all(updatePromises);
        res.json({ success: true, message: `Updated ${updatedCount} bookings with valid times.` });
    } catch (err) {
        console.error("Fix Times Error:", err);
        res.status(500).json({ success: false, message: "Error fixing times" });
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
                owner_name: 'Admin',
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
                f_name: 'Admin',
                l_name: '',
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

app.post('/api/payments/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            key_id: 'rzp_test_RTQIz97y5TkM1p'
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ success: false, message: "Order creation failed" });
    }
});

app.post('/api/payments/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bid, uid, amount } = req.body;

        const crypto = require('crypto');
        const generated_signature = crypto.createHmac('sha256', 'ZeYyRu2kNttTTQewjVrAVYDe')
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment Successful
            const pid = Math.floor(Math.random() * 1000000);
            const newPayment = new Payment({
                pid,
                payment_type: 'Razorpay', // Or 'Card'/'UPI' if we can extract form RZP response
                bid,
                amount,
                date: new Date(),
                status: 'Success',
                transaction_id: razorpay_payment_id
            });
            await newPayment.save();

            // Update Booking
            await Booking.updateOne({ bid }, { status: 'Confirmed' });

            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        console.error("Payment Verification Error:", err);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
});

// Old endpoint - kept for compatibility if needed or deprecate? 
// User asked for "Razorpay in payment", replacing the old mock flow effectively.
// I will keep the old "/api/payments" simple or remove it if frontend changes completely. 
// For now, I'll comment it out or leave it as legacy if I change frontend to use the new route.
// Let's replace the old simple POST /api/payments with a "Mock Card" one if they still want it,
// but the plan is to use Razorpay.
// I will remove the old logic for clarity as the plan implies replacing "mock payment system".
// But I'll leave a stub in case some old code calls it.
app.post('/api/payments', async (req, res) => {
    res.status(400).json({ success: false, message: "Please use Razorpay checkout." });
});

// Get ALL Payments (Admin)
app.get('/api/payments', async (req, res) => {
    try {
        const payments = await Payment.find({}).sort({ _id: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: "Error fetching payments" });
    }
});

// --- CUSTOMER APIs ---

// Get ALL Customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find({}).sort({ _id: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching customers" });
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

app.get('/api/feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({}).sort({ date: -1 });
        const customers = await Customer.find({});

        const result = feedbacks.map(f => {
            const customer = customers.find(c => c.cid === f.cid);
            return {
                ...f.toObject(),
                customerName: customer ? customer.name : 'Unknown'
            };
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Error fetching feedback" });
    }
});

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