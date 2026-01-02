const mongoose = require('mongoose');


// Note: Ensure 'mongoose-sequence' is installed: npm install mongoose-sequence
// If not available, we will rely on default ObjectIds for relations but keep numeric IDs as requested if possible,
// or map them to ObjectIds effectively. For simplicity and robustness with Mongoose, using default _id (ObjectId)
// is best practice, but fields like UID, GID are defined as numbers in the prompt.
// We will define them as Number. Implementation of auto-increment requires a plugin or logic.
// For this iteration, we will use simple Number fields and assume the logic (or plugin) handles increment, 
// or imply standard ObjectId where 'ID' is just a reference.
// The user explicitly asked for 'AUTO_INCREMENT' which implies numeric IDs.
// I will simulate the structure but Mongoose works best with _id. I will add custom ID fields.

// --- 1. GARAGE_LIST_TBL ---
const GarageListSchema = new mongoose.Schema({
  glid: { type: Number, unique: true }, // Auto-increment managed manually or by plugin
  date: { type: Date, default: Date.now, required: true },
  garage_name: { type: String, required: true, maxlength: 20 },
  owner_name: { type: String, required: true, maxlength: 20 },
  phone: { type: String, required: true, unique: true, maxlength: 15 },
  uid: { type: Number, required: true, unique: true }, // Links to User? Or is this login ID? Dictionary says "User ID for logging in"
  password: { type: String, required: true, maxlength: 20 },
  login_attempt: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
});

// --- 3. GARAGE_TBL ---
const GarageSchema = new mongoose.Schema({
  gid: { type: Number, unique: true },
  glid: { type: Number, ref: 'GarageList' }, // References GarageList
  g_name: { type: String, required: true, maxlength: 20 },
  owner_name: { type: String, required: true, maxlength: 20 },
  phone: { type: String, required: true, unique: true, maxlength: 15 },
  address: { type: String, required: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, maxlength: 30 },
  pincode: { type: Number, required: true }
});

// --- 2. USER_TBL ---
const UserSchema = new mongoose.Schema({
  uid: { type: Number, unique: true },
  gid: { type: Number, ref: 'Garage' }, // FK to Garage
  user_type: { type: String, required: true, maxlength: 20 },
  f_name: { type: String, required: true, maxlength: 20 },
  l_name: { type: String, required: true, maxlength: 20 },
  email: { type: String, required: true, unique: true, maxlength: 30 },
  address: { type: String, required: true, maxlength: 50 },
  password: { type: String, required: true, maxlength: 20 },
  is_active: { type: Boolean, default: true }
});

// --- 4. STAFF_TBL ---
const StaffSchema = new mongoose.Schema({
  stfid: { type: Number, unique: true },
  gid: { type: Number, ref: 'Garage' },
  f_name: { type: String, required: true, maxlength: 20 },
  l_name: { type: String, required: true, maxlength: 20 },
  education: { type: String, required: true, maxlength: 10 },
  phone: { type: String, required: true, unique: true, maxlength: 15 },
  email: { type: String, required: true, unique: true, maxlength: 30 },
  address: { type: String, required: true }, // Text type in SQL usually means no specific limit, but passing string
  join_date: { type: Date, required: true },
  role: { type: String, required: true, maxlength: 20 },
  salary: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
});

// --- 5. CUSTOMER_TB ---
const CustomerSchema = new mongoose.Schema({
  cid: { type: Number, unique: true },
  uid: { type: Number, required: true, unique: true }, // Links to User?
  name: { type: String, required: true, maxlength: 20 },
  address: { type: String, required: true, maxlength: 50 },
  phone: { type: String, required: true, maxlength: 15 },
  email: { type: String, unique: true, maxlength: 30 }
});

// --- 6. SERVICE_TBL ---
const ServiceSchema = new mongoose.Schema({
  sid: { type: Number, unique: true },
  gid: { type: Number, ref: 'Garage' },
  service_name: { type: String, required: true, maxlength: 20 },
  vehicle_type: { type: String, required: true, maxlength: 10 },
  price: { type: Number, required: true },
  description: { type: String, maxlength: 50 },
  duration: { type: String, required: true },
  is_active: { type: Boolean, default: true }
});

// --- 8. BOOKING_TBL ---
const BookingSchema = new mongoose.Schema({
  bid: { type: Number, unique: true },
  gid: { type: Number, ref: 'Garage' },
  cid: { type: Number, ref: 'Customer' },
  date: { type: Date, required: true },
  status: { type: String, required: true, maxlength: 20, default: 'Pending' },
  description: { type: String },
  time: { type: String, required: true }
});

// --- 7. BOOKED_SERVICES_TBL ---
const BookedServiceSchema = new mongoose.Schema({
  bsid: { type: Number, unique: true },
  bid: { type: Number, ref: 'Booking' },
  sid: { type: Number, ref: 'Service' },
  cost: { type: Number, required: true },
  service_date: { type: Date, required: true },
  status: { type: String, default: 'Pending', maxlength: 20 }
});

// --- 9. PAYMENT_TBL ---
const PaymentSchema = new mongoose.Schema({
  pid: { type: Number, unique: true },
  payment_type: { type: String, required: true, maxlength: 50 },
  bid: { type: Number, ref: 'Booking' },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Success', 'Failed'] },
  transaction_id: { type: String, unique: true, maxlength: 20 }
});

// --- 10. FEEDBACK_TBL ---
const FeedbackSchema = new mongoose.Schema({
  fid: { type: Number, unique: true },
  gid: { type: Number, ref: 'Garage' },
  cid: { type: Number, ref: 'Customer' },
  description: { type: String, required: true, maxlength: 500 }, // Increased limit for real feedback
  date: { type: Date, required: true, default: Date.now }
});

// Export all models
module.exports = {
  GarageList: mongoose.model('GarageList', GarageListSchema),
  Garage: mongoose.model('Garage', GarageSchema),
  User: mongoose.model('User', UserSchema),
  Staff: mongoose.model('Staff', StaffSchema),
  Customer: mongoose.model('Customer', CustomerSchema),
  Service: mongoose.model('Service', ServiceSchema),
  Booking: mongoose.model('Booking', BookingSchema),
  BookedService: mongoose.model('BookedService', BookedServiceSchema),
  Payment: mongoose.model('Payment', PaymentSchema),
  Feedback: mongoose.model('Feedback', FeedbackSchema)
};