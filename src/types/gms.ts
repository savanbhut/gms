// GMS Type Definitions based on Data Dictionary

export type UserType = 'super_admin' | 'admin' | 'manager' | 'customer';
export type BookingStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Success' | 'Failed';
export type PaymentType = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet';

export interface GarageList {
  glid: number;
  date: string;
  garageName: string;
  ownerName: string;
  phone: string;
  uid: number;
  password: string;
  loginAttempt: number;
  isActive: boolean;
}

export interface User {
  uid: number;
  gid: number;
  userType: UserType;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  password: string;
  isActive: boolean;
}

export interface Garage {
  gid: number;
  glid: number;
  garageName: string;
  ownerName: string;
  phone: string;
  address: string;
  email: string;
  pincode: string;
}

export interface Staff {
  stfid: number;
  gid: number;
  firstName: string;
  lastName: string;
  education: string;
  phone: string;
  email: string;
  address: string;
  joinDate: string;
  role: string;
  salary: number;
  isActive: boolean;
}

export interface Customer {
  cid: number;
  uid: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Service {
  sid: number;
  gid: number;
  serviceName: string;
  vehicleType: string;
  price: number;
  description: string;
  duration: string;
  isActive: boolean;
}

export interface BookedService {
  bsid: number;
  bid: number;
  sid: number;
  cost: number;
  serviceDate: string;
  status: BookingStatus;
}

export interface Booking {
  bid: number;
  gid: number;
  cid: number;
  date: string;
  time: string;
  status: BookingStatus;
  description: string;
  customerName?: string;
  serviceName?: string;
}

export interface Payment {
  pid: number;
  paymentType: PaymentType;
  bid: number;
  amount: number;
  date: string;
  status: PaymentStatus;
  transactionId: string;
}

export interface Feedback {
  fid: number;
  gid: number;
  cid: number;
  description: string;
  date: string;
  rating?: number;
  customerName?: string;
}
