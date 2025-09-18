export type Payment = { type: 'Debit' | 'Credit'; amount: number };

export type LedgerEntry = { date: string; type: 'Debit' | 'Credit'; amount: number; note: string };

export type Step = { label: string; at: string };

export type Details = {
  pan: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type RecordType = {
  id: string;
  customer: string;
  amount: number;
  tenure: number;
  ltv: number;
  lastPayment: Payment;
  timeline: Step[];
  status: 'In Progress' | 'Completed';
  details: Details;
  ledger: LedgerEntry[]; // includes disbursal and payments
};

export const demoRows: RecordType[] = [
  {
    id: 'APP-24001',
    customer: 'Rahul Sharma',
    amount: 250000,
    tenure: 12,
    ltv: 48,
    lastPayment: { type: 'Debit', amount: 12500 },
    timeline: [
      { label: 'Profile', at: '2025-09-10' },
      { label: 'KYC verified', at: '2025-09-11' },
      { label: 'Units pledged', at: '2025-09-12' },
    ],
    status: 'In Progress',
    details: {
      pan: 'ABCDE1234F',
      mobile: '9876543210',
      email: 'rahul.sharma@example.com',
      address: '12 MG Road',
      city: 'Mumbai',
      state: 'MH',
      pincode: '400001',
    },
    ledger: [
      { date: '2025-09-12', type: 'Debit', amount: 250000, note: 'Disbursed' },
      { date: '2025-10-10', type: 'Credit', amount: 12500, note: 'EMI #1' },
      { date: '2025-11-10', type: 'Credit', amount: 12500, note: 'EMI #2' },
    ],
  },
  {
    id: 'APP-24002',
    customer: 'Priya Patel',
    amount: 180000,
    tenure: 9,
    ltv: 50,
    lastPayment: { type: 'Credit', amount: 5000 },
    timeline: [
      { label: 'Profile', at: '2025-09-05' },
      { label: 'KYC verified', at: '2025-09-06' },
      { label: 'Lien approved', at: '2025-09-07' },
    ],
    status: 'In Progress',
    details: {
      pan: 'PQRSX6789L',
      mobile: '9811112233',
      email: 'priya.patel@example.com',
      address: '45 Residency Rd',
      city: 'Ahmedabad',
      state: 'GJ',
      pincode: '380001',
    },
    ledger: [
      { date: '2025-09-07', type: 'Debit', amount: 180000, note: 'Disbursed' },
      { date: '2025-10-07', type: 'Credit', amount: 5000, note: 'EMI #1' },
    ],
  },
  {
    id: 'APP-24003',
    customer: 'Amit Verma',
    amount: 320000,
    tenure: 18,
    ltv: 45,
    lastPayment: { type: 'Debit', amount: 18000 },
    timeline: [
      { label: 'Profile', at: '2025-08-20' },
      { label: 'KYC verified', at: '2025-08-21' },
      { label: 'Disbursed', at: '2025-08-22' },
      { label: 'First EMI paid', at: '2025-09-22' },
    ],
    status: 'In Progress',
    details: {
      pan: 'LMNOP2345Z',
      mobile: '9898989898',
      email: 'amit.verma@example.com',
      address: '88 Park Street',
      city: 'Kolkata',
      state: 'WB',
      pincode: '700016',
    },
    ledger: [
      { date: '2025-08-22', type: 'Debit', amount: 320000, note: 'Disbursed' },
      { date: '2025-09-22', type: 'Credit', amount: 18000, note: 'EMI #1' },
      { date: '2025-10-22', type: 'Credit', amount: 18000, note: 'EMI #2' },
    ],
  },
  {
    id: 'APP-24004',
    customer: 'Neha Singh',
    amount: 150000,
    tenure: 6,
    ltv: 50,
    lastPayment: { type: 'Credit', amount: 3000 },
    timeline: [
      { label: 'Profile', at: '2025-09-01' },
      { label: 'KYC verified', at: '2025-09-01' },
      { label: 'Units pledged', at: '2025-09-02' },
      { label: 'Disbursed', at: '2025-09-02' },
      { label: 'Closed', at: '2025-12-02' },
    ],
    status: 'Completed',
    details: {
      pan: 'ABCDE9999Q',
      mobile: '9000000001',
      email: 'neha.singh@example.com',
      address: '221B Baker Street',
      city: 'New Delhi',
      state: 'DL',
      pincode: '110001',
    },
    ledger: [
      { date: '2025-09-02', type: 'Debit', amount: 150000, note: 'Disbursed' },
      { date: '2025-10-02', type: 'Credit', amount: 30000, note: 'EMI #1' },
      { date: '2025-11-02', type: 'Credit', amount: 30000, note: 'EMI #2' },
      { date: '2025-12-02', type: 'Credit', amount: 90000, note: 'Closure' },
    ],
  },
  {
    id: 'APP-24005',
    customer: 'Vikram Rao',
    amount: 275000,
    tenure: 12,
    ltv: 46,
    lastPayment: { type: 'Debit', amount: 13750 },
    timeline: [
      { label: 'Profile', at: '2025-09-03' },
      { label: 'KYC verified', at: '2025-09-03' },
      { label: 'Lien approved', at: '2025-09-04' },
    ],
    status: 'In Progress',
    details: {
      pan: 'ZXYWV1234K',
      mobile: '9123456780',
      email: 'vikram.rao@example.com',
      address: '18 Hill View',
      city: 'Bengaluru',
      state: 'KA',
      pincode: '560001',
    },
    ledger: [
      { date: '2025-09-04', type: 'Debit', amount: 275000, note: 'Disbursed' },
      { date: '2025-10-04', type: 'Credit', amount: 13750, note: 'EMI #1' },
    ],
  },
];
