import type { Garage, Staff, Customer, Service, Booking, Payment, Feedback, User } from '@/types/gms';

export const mockGarages: Garage[] = [
  { gid: 1, glid: 1, garageName: 'AutoCare Pro', ownerName: 'Rajesh Patel', phone: '+91 9876543210', address: '123 Industrial Area, Ahmedabad', email: 'autocare@example.com', pincode: '380015' },
  { gid: 2, glid: 2, garageName: 'SpeedFix Motors', ownerName: 'Amit Shah', phone: '+91 9876543211', address: '456 Highway Road, Surat', email: 'speedfix@example.com', pincode: '395007' },
  { gid: 3, glid: 3, garageName: 'QuickRepair Hub', ownerName: 'Vijay Kumar', phone: '+91 9876543212', address: '789 Station Road, Vadodara', email: 'quickrepair@example.com', pincode: '390001' },
];

export const mockUsers: User[] = [
  { uid: 1, gid: 1, userType: 'admin', firstName: 'Rajesh', lastName: 'Patel', email: 'admin@autocare.com', address: 'Ahmedabad', password: '', isActive: true },
  { uid: 2, gid: 1, userType: 'manager', firstName: 'Suresh', lastName: 'Modi', email: 'manager@autocare.com', address: 'Ahmedabad', password: '', isActive: true },
];

export const mockStaff: Staff[] = [
  { stfid: 1, gid: 1, firstName: 'Kiran', lastName: 'Desai', education: 'ITI', phone: '+91 9898989898', email: 'kiran@autocare.com', address: 'Ahmedabad', joinDate: '2023-01-15', role: 'Senior Mechanic', salary: 35000, isActive: true },
  { stfid: 2, gid: 1, firstName: 'Mahesh', lastName: 'Sharma', education: 'Diploma', phone: '+91 9898989899', email: 'mahesh@autocare.com', address: 'Ahmedabad', joinDate: '2023-03-20', role: 'Mechanic', salary: 28000, isActive: true },
  { stfid: 3, gid: 1, firstName: 'Priya', lastName: 'Patel', education: 'BCA', phone: '+91 9898989800', email: 'priya@autocare.com', address: 'Ahmedabad', joinDate: '2023-06-10', role: 'Receptionist', salary: 22000, isActive: true },
  { stfid: 4, gid: 1, firstName: 'Rohit', lastName: 'Verma', education: 'ITI', phone: '+91 9898989801', email: 'rohit@autocare.com', address: 'Ahmedabad', joinDate: '2024-01-05', role: 'Junior Mechanic', salary: 20000, isActive: false },
];

export const mockCustomers: Customer[] = [
  { cid: 1, uid: 10, name: 'Anil Gupta', address: '12 Park Street, Ahmedabad', phone: '+91 9123456789', email: 'anil.gupta@email.com' },
  { cid: 2, uid: 11, name: 'Neha Sharma', address: '45 Lake View, Surat', phone: '+91 9123456790', email: 'neha.sharma@email.com' },
  { cid: 3, uid: 12, name: 'Ravi Patel', address: '78 Green Park, Vadodara', phone: '+91 9123456791', email: 'ravi.patel@email.com' },
  { cid: 4, uid: 13, name: 'Sneha Joshi', address: '90 MG Road, Ahmedabad', phone: '+91 9123456792', email: 'sneha.joshi@email.com' },
  { cid: 5, uid: 14, name: 'Vikram Singh', address: '23 Station Road, Rajkot', phone: '+91 9123456793', email: 'vikram.singh@email.com' },
];

export const mockServices: Service[] = [
  { sid: 1, gid: 1, serviceName: 'Oil Change', vehicleType: 'Car', price: 1500, description: 'Complete engine oil change with filter replacement', duration: '30 mins', isActive: true },
  { sid: 2, gid: 1, serviceName: 'Brake Service', vehicleType: 'Car', price: 3500, description: 'Brake pad replacement and inspection', duration: '2 hours', isActive: true },
  { sid: 3, gid: 1, serviceName: 'AC Service', vehicleType: 'Car', price: 2500, description: 'Full AC system check, gas refill and cleaning', duration: '1.5 hours', isActive: true },
  { sid: 4, gid: 1, serviceName: 'Wheel Alignment', vehicleType: 'Car', price: 800, description: 'Computer-aided wheel alignment', duration: '45 mins', isActive: true },
  { sid: 5, gid: 1, serviceName: 'Engine Tuning', vehicleType: 'Car', price: 5000, description: 'Complete engine diagnostic and tuning', duration: '3 hours', isActive: true },
  { sid: 6, gid: 1, serviceName: 'Bike Servicing', vehicleType: 'Bike', price: 800, description: 'Full bike service including oil change', duration: '1 hour', isActive: true },
  { sid: 7, gid: 1, serviceName: 'Tyre Replacement', vehicleType: 'Car', price: 4000, description: 'Single tyre replacement with balancing', duration: '30 mins', isActive: false },
];

export const mockBookings: Booking[] = [
  { bid: 1, gid: 1, cid: 1, date: '2024-12-16', time: '10:00', status: 'Pending', description: 'Regular maintenance', customerName: 'Anil Gupta', serviceName: 'Oil Change' },
  { bid: 2, gid: 1, cid: 2, date: '2024-12-16', time: '11:30', status: 'In Progress', description: 'Brake noise issue', customerName: 'Neha Sharma', serviceName: 'Brake Service' },
  { bid: 3, gid: 1, cid: 3, date: '2024-12-15', time: '14:00', status: 'Completed', description: 'AC not cooling', customerName: 'Ravi Patel', serviceName: 'AC Service' },
  { bid: 4, gid: 1, cid: 4, date: '2024-12-15', time: '09:00', status: 'Completed', description: 'Wheel alignment needed', customerName: 'Sneha Joshi', serviceName: 'Wheel Alignment' },
  { bid: 5, gid: 1, cid: 5, date: '2024-12-14', time: '16:00', status: 'Cancelled', description: 'Engine check required', customerName: 'Vikram Singh', serviceName: 'Engine Tuning' },
];

export const mockPayments: Payment[] = [
  { pid: 1, paymentType: 'UPI', bid: 3, amount: 2500, date: '2024-12-15', status: 'Success', transactionId: 'TXN001234567' },
  { pid: 2, paymentType: 'Credit Card', bid: 4, amount: 800, date: '2024-12-15', status: 'Success', transactionId: 'TXN001234568' },
  { pid: 3, paymentType: 'Net Banking', bid: 1, amount: 1500, date: '2024-12-16', status: 'Pending', transactionId: 'TXN001234569' },
  { pid: 4, paymentType: 'Debit Card', bid: 2, amount: 3500, date: '2024-12-16', status: 'Pending', transactionId: 'TXN001234570' },
];

export const mockFeedback: Feedback[] = [
  { fid: 1, gid: 1, cid: 3, description: 'Excellent service! AC is working perfectly now. Very professional staff.', date: '2024-12-15', rating: 5, customerName: 'Ravi Patel' },
  { fid: 2, gid: 1, cid: 4, description: 'Quick and efficient service. Good value for money.', date: '2024-12-15', rating: 4, customerName: 'Sneha Joshi' },
  { fid: 3, gid: 1, cid: 1, description: 'Great experience. Will definitely come back.', date: '2024-12-10', rating: 5, customerName: 'Anil Gupta' },
];

export const dashboardStats = {
  totalBookings: 156,
  pendingBookings: 12,
  completedToday: 8,
  totalRevenue: 245000,
  activeCustomers: 89,
  activeStaff: 6,
};
