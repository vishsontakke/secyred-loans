import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoRows, RecordType } from "./adminData";
import { ArrowLeft, CheckCircle2, IndianRupee, ShieldCheck } from "lucide-react";

function computeLedgerWithBalance(r: RecordType) {
  let balance = 0;
  return r.ledger.map((e) => {
    balance += e.type === 'Debit' ? e.amount : -e.amount;
    return { ...e, balance };
  });
}

export default function AdminCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rec = useMemo(() => demoRows.find((r) => r.id === id), [id]);

  if (!rec) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Card>
          <CardContent className="p-6">Customer not found.</CardContent>
        </Card>
      </div>
    );
  }

  const balanceRows = computeLedgerWithBalance(rec);
  const outstanding = balanceRows.length ? balanceRows[balanceRows.length - 1].balance : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      <div className="grid gap-6 md:grid-cols-[320px,1fr]">
        {/* Sidebar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">{rec.customer.split(' ').map(s=>s[0]).join('')}</div>
              <div>
                <p className="font-semibold">{rec.customer}</p>
                <p className="text-xs text-muted-foreground">{rec.id}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">📞 <span>{rec.details.mobile}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground">✉️ <span>{rec.details.email}</span></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-muted-foreground">Additional Details</p>
              <div className="rounded-lg border p-3 text-xs">
                <p>PAN: {rec.details.pan}</p>
                <p>Customer Code: {rec.id}</p>
                <p>Joined: 8/16/2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main */}
        <div className="space-y-6">
          <Tabs defaultValue="loan-details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cas">CAS Data</TabsTrigger>
              <TabsTrigger value="application">Loan Application</TabsTrigger>
              <TabsTrigger value="loan-details">Loan Details</TabsTrigger>
              <TabsTrigger value="transactions">Loan Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="loan-details">
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-b from-green-600 to-emerald-600 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm opacity-80">ID: FXLAN{rec.id.replace(/\D/g,'')}</p>
                      <h2 className="mt-1 text-2xl font-semibold">OVERDRAFT Loan</h2>
                    </div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs">ACTIVE</span>
                  </div>
                  <div className="mt-4 grid gap-6 sm:grid-cols-3">
                    <Metric label="Total Credit" value={`₹${rec.amount.toLocaleString()}`} />
                    <Metric label="Available Credit" value={`₹${Math.max(rec.amount - outstanding, 0).toLocaleString()}`} />
                    <Metric label="% Interest Rate" value={`10.49%`} />
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <p className="mb-3 font-medium">Lender Details</p>
                      <Detail label="Lender" value="DSP" />
                      <Detail label="Credit ID" value={`FXLAN${rec.id.replace(/\D/g,'')}`} />
                      <Detail label="Processing Charges" value="₹999" />
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="mb-3 font-medium">Important Dates</p>
                      <Detail label="Interest Due Date" value="7 Oct 2025" />
                      <Detail label="Renewal Date" value="31 Aug 2028" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cas">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Snapshot</CardTitle>
                  <CardDescription>Mutual funds, Stocks and Insurance summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <CasMetric label="Total Portfolio Value" value="₹6,77,909" />
                    <CasMetric label="Eligible Value" value="₹4,10,000" />
                    <CasMetric label="Non‑Eligible Value" value="₹2,67,909" />
                    <CasMetric label="Eligible Limit" value={`₹${Math.round(rec.amount*0.32).toLocaleString()}`} />
                  </div>

                  {/* Mutual funds */}
                  <p className="mt-6 text-sm font-medium">Mutual funds</p>
                  <div className="mt-2 overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                        <tr>
                          <th className="p-3">Fund Name</th>
                          <th className="p-3 text-right">Units</th>
                          <th className="p-3 text-right">Eligible</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3">HDFC Flexi Cap Fund – Direct Growth</td>
                          <td className="p-3 text-right">250.00</td>
                          <td className="p-3 text-right">₹20,000</td>
                        </tr>
                        <tr className="border-t bg-red-50/60">
                          <td className="p-3">Mirae Asset Large Cap Fund – Direct Growth</td>
                          <td className="p-3 text-right">300.00</td>
                          <td className="p-3 text-right">Not eligible</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Stocks */}
                  <p className="mt-6 text-sm font-medium">Stocks</p>
                  <div className="mt-2 overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                        <tr>
                          <th className="p-3">Stock</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3 text-right">Eligible</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3">TCS</td>
                          <td className="p-3 text-right">30</td>
                          <td className="p-3 text-right">₹45,000</td>
                        </tr>
                        <tr className="border-t bg-red-50/60">
                          <td className="p-3">RELIANCE</td>
                          <td className="p-3 text-right">20</td>
                          <td className="p-3 text-right">Not eligible</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Insurance */}
                  <p className="mt-6 text-sm font-medium">Insurance</p>
                  <div className="mt-2 overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                        <tr>
                          <th className="p-3">Policy</th>
                          <th className="p-3 text-right">Units</th>
                          <th className="p-3 text-right">Eligible</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t bg-red-50/60">
                          <td className="p-3">LIC Wealth Plus (ULIP)</td>
                          <td className="p-3 text-right">500</td>
                          <td className="p-3 text-right">Not eligible</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3">HDFC Life Sanchay Plus</td>
                          <td className="p-3 text-right">400</td>
                          <td className="p-3 text-right">₹15,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="application">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Application</CardTitle>
                  <CardDescription>Key application inputs captured during onboarding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <AppMetric label="Applicant" value={rec.customer} />
                    <AppMetric label="PAN" value={rec.details.pan} />
                    <AppMetric label="Tenure" value={`${rec.tenure} months`} />
                    <AppMetric label="Amount" value={`₹${rec.amount.toLocaleString()}`} />
                    <AppMetric label="LTV" value={`${rec.ltv}%`} />
                    <AppMetric label="Asset type" value={rec.assetType as string} />
                    <AppMetric label="Status" value={rec.status} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Transactions</CardTitle>
                  <CardDescription>User transactions and all ledger entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Description</th>
                          <th className="p-3 text-right">Debit</th>
                          <th className="p-3 text-right">Credit</th>
                          <th className="p-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {balanceRows.map((row, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-3">{row.date}</td>
                            <td className="p-3">{row.note}</td>
                            <td className="p-3 text-right">{row.type === 'Debit' ? `₹${row.amount.toLocaleString()}` : ''}</td>
                            <td className="p-3 text-right">{row.type === 'Credit' ? `₹${row.amount.toLocaleString()}` : ''}</td>
                            <td className="p-3 text-right">₹{row.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" /> Secure records • Outstanding: <span className="font-medium text-foreground">₹{outstanding.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm opacity-90">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function CasMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function AppMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
