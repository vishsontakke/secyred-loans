import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, CreditCard, IndianRupee, ShieldCheck } from "lucide-react";
import { demoRows, RecordType, Step } from "./adminData";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [rows, setRows] = useState<RecordType[]>(() => demoRows);
  const totalDisbursed = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);

  return (
    <div className="container mx-auto px-4 py-10">
      {!loggedIn ? (
        <div className="mx-auto max-w-md">
          <Card className="border-indigo-100">
            <CardHeader>
              <CardTitle>Admin login</CardTitle>
              <CardDescription>Static demo — no backend. Click below to view sample journeys.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLoggedIn(true)} className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700">Login as Admin</Button>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> This is a read‑only demo with mock data
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Active journeys" value={rows.filter(r => r.status !== 'Completed').length.toString()} icon={<Clock className="h-5 w-5" />} />
            <StatCard title="Completed" value={rows.filter(r => r.status === 'Completed').length.toString()} icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard title="Total disbursed" value={`₹${totalDisbursed.toLocaleString()}`} icon={<IndianRupee className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer journeys</CardTitle>
              <CardDescription>Securities lien journeys (Mutual funds, Stocks, Insurance)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left text-xs text-muted-foreground">
                      <th className="p-3 font-medium">Customer</th>
                      <th className="p-3 font-medium">Journey</th>
                      <th className="p-3 font-medium">Amount</th>
                      <th className="p-3 font-medium">Tenure</th>
                      <th className="p-3 font-medium">Payments</th>
                      <th className="p-3 font-medium">Timeline</th>
                      <th className="p-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{r.customer}</div>
                          <div className="text-xs text-muted-foreground">{r.id}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">Loan against {r.assetType}</div>
                          <div className="text-xs text-muted-foreground">Effective LTV {r.ltv}%</div>
                        </td>
                        <td className="p-3">₹{r.amount.toLocaleString()}</td>
                        <td className="p-3">{r.tenure}m</td>
                        <td className="p-3">
                          <div className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs", r.lastPayment.type === 'Credit' ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-rose-50 text-rose-700 ring-1 ring-rose-100")}>
                            <CreditCard className="h-3.5 w-3.5" /> {r.lastPayment.type} ₹{r.lastPayment.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <Timeline steps={r.timeline} />
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Button size="sm" asChild variant="outline">
                            <Link to={`/admin/${r.id}`}>View</Link>
                          </Button>
                          <Button size="sm" variant={r.status === 'Completed' ? 'secondary' : 'default'} disabled={r.status === 'Completed'} onClick={() => completeRow(r.id)}>
                            {r.status === 'Completed' ? 'Completed' : 'Mark completed'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );

  function completeRow(id: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && r.status !== 'Completed'
          ? {
              ...r,
              status: 'Completed',
              timeline: [...r.timeline, { label: 'Completed', at: new Date().toISOString().slice(0, 10) }],
              lastPayment: { type: 'Credit', amount: 0 },
            }
          : r,
      ),
    );
  }
}

function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative ml-3 space-y-2 border-l pl-4">
      {steps.map((s, i) => (
        <li key={i} className="leading-tight">
          <span className="absolute -left-[9px] mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600" />
          <span className="text-xs text-muted-foreground">{s.at}</span>
          <div className="text-[13px] font-medium">{s.label}</div>
        </li>
      ))}
    </ol>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function computeLedgerWithBalance(r: RecordType) {
  let balance = 0;
  return r.ledger.map((e) => {
    balance += e.type === 'Debit' ? e.amount : -e.amount;
    return { ...e, balance };
  });
}

function computeOutstanding(r: RecordType) {
  const totals = r.ledger.reduce(
    (acc, e) => ({
      debit: acc.debit + (e.type === 'Debit' ? e.amount : 0),
      credit: acc.credit + (e.type === 'Credit' ? e.amount : 0),
    }),
    { debit: 0, credit: 0 },
  );
  return Math.max(0, totals.debit - totals.credit);
}

const demoRows: RecordType[] = [
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

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
