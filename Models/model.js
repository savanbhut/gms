const mongoose = require('mongoose');

// --- 1. GARAGE LIST (Login) ---
const GarageListSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  garage_name: { type: String, required: true },
  owner_name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  uid: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  is_active: { type: Boolean, default: true }
});

// --- 2. USER ---
const UserSchema = new mongoose.Schema({
  gid: { type: mongoose.Schema.Types.ObjectId, ref: 'GarageProfile' },
  user_type: { type: String, required: true },
  f_name: { type: String, required: true },
  l_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  is_active: { type: Boolean, default: true }
});

// --- 3. GARAGE PROFILE ---
const GarageProfileSchema = new mongoose.Schema({
  glid: { type: mongoose.Schema.Types.ObjectId, ref: 'GarageList' },
  g_name: { type: String, required: true },
  owner_name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pincode: { type: Number, required: true }
});

// --- 6. SERVICE ---
const ServiceSchema = new mongoose.Schema({
  gid: { type: mongoose.Schema.Types.ObjectId, ref: 'GarageProfile' },
  service_name: { type: String, required: true },
  vehicle_type: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  duration: { type: String, required: true },
  is_active: { type: Boolean, default: true }
});

// --- 7. BOOKING ---
const BookingSchema = new mongoose.Schema({
  gid: { type: mongoose.Schema.Types.ObjectId, ref: 'GarageProfile' },
  cid: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  date: { type: Date, required: true },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled']
  },
  description: { type: String },
  time: { type: String, required: true }
});

// --- 9. PAYMENT ---
const PaymentSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  payment_type: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Success', 'Failed'] },
  transaction_id: { type: String, unique: true },
  date: { type: Date, default: Date.now }
});

module.exports = {
  GarageList: mongoose.model('GarageList', GarageListSchema),
  User: mongoose.model('User', UserSchema),
  GarageProfile: mongoose.model('GarageProfile', GarageProfileSchema),
  Service: mongoose.model('Service', ServiceSchema),
  Booking: mongoose.model('Booking', BookingSchema),
  Payment: mongoose.model('Payment', PaymentSchema)
};