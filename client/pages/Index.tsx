import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Lock, ShieldCheck, Sparkles } from "lucide-react";

type Holding = {
  symbol: string;
  name: string;
  price: number; // NAV per unit
  qty: number; // units owned
  ltv: number; // max loan-to-value (0-1)
};

const DEFAULT_FUNDS: Holding[] = [
  { symbol: "HDFCFLEXI-DG", name: "HDFC Flexi Cap Fund - Direct Growth", price: 160.25, qty: 250, ltv: 0.5 },
  { symbol: "MIRAE-LARGE-DG", name: "Mirae Asset Large Cap Fund - Direct Growth", price: 120.9, qty: 300, ltv: 0.5 },
  { symbol: "ICICIBLUE-DG", name: "ICICI Pru Bluechip Fund - Direct Growth", price: 105.1, qty: 280, ltv: 0.5 },
  { symbol: "AXIS-SMALL-DG", name: "Axis Small Cap Fund - Direct Growth", price: 75.6, qty: 220, ltv: 0.4 },
];

const steps = [
  "Profile",
  "Personal",
  "Income",
  "KYC",
  "Mutual Funds",
  "Loan",
  "Review",
  "E‑sign",
  "Done",
] as const;

type Step = typeof steps[number];

export default function Index() {
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = steps[stepIndex];

  // Profile
  const [fullName, setFullName] = useState("");
  const [pan, setPan] = useState("");

  // Personal
  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Income
  const [employmentType, setEmploymentType] = useState("");
  const [annualIncome, setAnnualIncome] = useState<number>(0);
  const [employer, setEmployer] = useState("");
  const [occupation, setOccupation] = useState("");

  // KYC (Aadhaar)
  const [aadhaar, setAadhaar] = useState("");
  const [kycConsent, setKycConsent] = useState(false);
  const [kycOtp, setKycOtp] = useState("");
  const [kycOtpSent, setKycOtpSent] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);

  // Mutual funds / Loan
  const [holdings] = useState<Holding[]>(DEFAULT_FUNDS);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [tenure, setTenure] = useState(12);
  const [amount, setAmount] = useState<number>(0);
  const [accepted, setAccepted] = useState(false);
  const [esignOtp, setEsignOtp] = useState("");
  const [esignComplete, setEsignComplete] = useState(false);

  const portfolioValue = useMemo(
    () => holdings.reduce((sum, h) => sum + h.price * h.qty, 0),
    [holdings],
  );

  const pledgedValue = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const pledgedQty = selected[h.symbol] ?? 0;
      return sum + Math.min(pledgedQty, h.qty) * h.price;
    }, 0);
  }, [holdings, selected]);

  const eligible = useMemo(() => {
    const base = holdings.reduce((sum, h) => {
      const pledgedQty = selected[h.symbol] ?? 0;
      const pledgedVal = Math.min(pledgedQty, h.qty) * h.price;
      return sum + pledgedVal * h.ltv;
    }, 0);
    return Math.floor(base);
  }, [holdings, selected]);

  const effectiveLtvPct = pledgedValue > 0 ? Math.round((eligible / pledgedValue) * 100) : 0;

  // Validations
  const isProfileValid = fullName.trim().length > 2 && /^([A-Z]{5}[0-9]{4}[A-Z])$/.test(pan.trim().toUpperCase());
  const isPersonalValid =
    !!dob && /\d{4}-\d{2}-\d{2}/.test(dob) &&
    /^[6-9]\d{9}$/.test(mobile) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    address1.trim().length > 3 && city.trim().length > 1 && state.trim().length > 1 && /^\d{6}$/.test(pincode);
  const isIncomeValid = employmentType.length > 0 && annualIncome > 0;
  const isKycReadyToSend = aadhaar.replace(/\s/g, '').length === 12 && kycConsent;
  const isKycValid = kycVerified;
  const hasSelection = Object.values(selected).some((q) => q > 0);
  const isAmountValid = amount > 0 && amount <= eligible;
  const canReview = isAmountValid;
  const esignReady = esignOtp.length === 6 && accepted;

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goPrev = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="bg-gradient-to-b from-indigo-50 via-white to-white">
      <Hero />

      <section id="start" className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <Stepper current={stepIndex} />

          {step === "Profile" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Verify your profile</CardTitle>
                <CardDescription>
                  Enter your full name and PAN to check eligibility instantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name (as per PAN)</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN</Label>
                    <Input
                      id="pan"
                      placeholder="ABCDE1234F"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    Bank‑grade encryption. We never share your data.
                  </div>
                  <Button
                    disabled={!isProfileValid}
                    onClick={() => isProfileValid && goNext()}
                    className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "Personal" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Personal information</CardTitle>
                <CardDescription>Tell us how to reach you and verify your address.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of birth</Label>
                    <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile number</Label>
                    <Input id="mobile" placeholder="10‑digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0,10))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address line 1</Label>
                    <Input id="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address2">Address line 2</Label>
                    <Input id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">PIN code</Label>
                    <Input id="pincode" value={pincode} placeholder="6‑digit" onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0,6))} />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={goPrev}>Back</Button>
                  <Button
                    disabled={!isPersonalValid}
                    onClick={() => isPersonalValid && goNext()}
                    className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "Income" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Income information</CardTitle>
                <CardDescription>This helps us offer you the best rate.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Employment type</Label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaried">Salaried</SelectItem>
                        <SelectItem value="self">Self‑employed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income">Annual income (₹)</Label>
                    <Input id="income" type="number" min={0} step={1000} value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value || 0))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employer">Employer / Business name</Label>
                    <Input id="employer" value={employer} onChange={(e) => setEmployer(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={goPrev}>Back</Button>
                  <Button
                    disabled={!isIncomeValid}
                    onClick={() => isIncomeValid && goNext()}
                    className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "KYC" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Aadhaar eKYC</CardTitle>
                <CardDescription>Verify your identity using OTP‑based Aadhaar authentication.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar number</Label>
                    <Input
                      id="aadhaar"
                      placeholder="12‑digit Aadhaar"
                      value={formatAadhaar(aadhaar)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setAadhaar(raw);
                      }}
                    />
                    <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs">
                      <input type="checkbox" checked={kycConsent} onChange={(e) => setKycConsent(e.target.checked)} />
                      I consent to fetch my KYC details from UIDAI for verification.
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={!isKycReadyToSend}
                        onClick={() => {
                          if (!isKycReadyToSend) return;
                          setKycOtpSent(true);
                        }}
                      >
                        Send OTP
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        OTP will be sent to your Aadhaar‑linked mobile
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kycOtp">Enter OTP</Label>
                    <Input id="kycOtp" placeholder="6‑digit OTP" maxLength={6} value={kycOtp} onChange={(e) => setKycOtp(e.target.value.replace(/\D/g, '').slice(0,6))} />
                    <Button
                      disabled={!kycOtpSent || kycOtp.length !== 6}
                      onClick={() => {
                        if (kycOtpSent && kycOtp.length === 6) setKycVerified(true);
                      }}
                    >
                      Verify OTP
                    </Button>
                    {kycVerified && (
                      <p className="text-sm text-green-600">KYC verified successfully.</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={goPrev}>Back</Button>
                  <Button
                    disabled={!isKycValid}
                    onClick={() => isKycValid && goNext()}
                    className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "Mutual Funds" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Select mutual funds to pledge</CardTitle>
                <CardDescription>
                  Choose units to pledge. Eligibility is computed from units × NAV × LTV.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <div className="grid grid-cols-12 bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                    <div className="col-span-5">Mutual fund</div>
                    <div className="col-span-2 text-right">Units</div>
                    <div className="col-span-2 text-right">NAV</div>
                    <div className="col-span-1 text-right">LTV</div>
                    <div className="col-span-2 text-right">Pledge Units</div>
                  </div>
                  {holdings.map((h) => {
                    const pledged = selected[h.symbol] ?? 0;
                    return (
                      <div key={h.symbol} className="grid grid-cols-12 items-center border-t p-3 text-sm">
                        <div className="col-span-5">
                          <div className="font-medium">{h.name}</div>
                          <div className="text-xs text-muted-foreground">{h.symbol}</div>
                        </div>
                        <div className="col-span-2 text-right">{h.qty}</div>
                        <div className="col-span-2 text-right">₹{h.price.toLocaleString()}</div>
                        <div className="col-span-1 text-right">{Math.round(h.ltv * 100)}%</div>
                        <div className="col-span-2 text-right">
                          <Input
                            type="number"
                            min={0}
                            max={h.qty}
                            value={pledged}
                            onChange={(e) =>
                              setSelected((s) => ({ ...s, [h.symbol]: Math.max(0, Math.min(Number(e.target.value || 0), h.qty)) }))
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                  <p className="text-muted-foreground">
                    Portfolio value <span className="font-medium text-foreground">₹{Math.round(portfolioValue).toLocaleString()}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Pledged value <span className="font-medium text-foreground">₹{Math.round(pledgedValue).toLocaleString()}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Eligible up to <span className="font-semibold text-foreground">₹{eligible.toLocaleString()}</span>
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={goPrev}>Back</Button>
                  <Button
                    disabled={!hasSelection || eligible <= 0}
                    onClick={() => {
                      setAmount(Math.min(eligible, Math.max(0, amount || Math.floor(eligible * 0.6))));
                      goNext();
                    }}
                    className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "Loan" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Choose loan amount and tenure</CardTitle>
                <CardDescription>Drag the slider to select amount up to your eligibility.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <Label>Amount</Label>
                      <span className="text-sm text-muted-foreground">Eligible ₹{eligible.toLocaleString()}</span>
                    </div>
                    <div className="mt-3">
                      <Slider
                        value={[amount]}
                        min={0}
                        max={Math.max(eligible, 1)}
                        step={1000}
                        onValueChange={([v]) => setAmount(v)}
                      />
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span>₹0</span>
                        <Input
                          className="w-40"
                          type="number"
                          min={0}
                          max={eligible}
                          step={1000}
                          value={amount}
                          onChange={(e) => setAmount(Math.max(0, Math.min(Number(e.target.value || 0), eligible)))}
                        />
                        <span>₹{eligible.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Tenure (months)</Label>
                    <div className="mt-3 flex items-center gap-4">
                      {[3, 6, 9, 12, 18, 24].map((t) => (
                        <Button
                          key={t}
                          variant={tenure === t ? "default" : "outline"}
                          onClick={() => setTenure(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-6 rounded-lg border p-4 text-sm">
                      <p className="font-medium">Estimated summary</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <span className="text-muted-foreground">Requested</span>
                        <span className="text-right font-medium">₹{amount.toLocaleString()}</span>
                        <span className="text-muted-foreground">Tenure</span>
                        <span className="text-right font-medium">{tenure} months</span>
                        <span className="text-muted-foreground">Effective LTV</span>
                        <span className="text-right font-medium">{effectiveLtvPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={goPrev}>Back</Button>
                  <Button
                    disabled={!isAmountValid}
                    onClick={() => isAmountValid && goNext()}
                    className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                  >
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "Review" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Review & confirm</CardTitle>
                <CardDescription>Make sure everything looks right before e‑signing.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <p className="font-medium">Profile</p>
                    <InfoRow label="Applicant" value={fullName} />
                    <InfoRow label="PAN" value={pan.toUpperCase()} />
                    <InfoRow label="KYC" value={kycVerified ? "Verified" : "Pending"} />
                  </div>
                  <div className="space-y-3">
                    <p className="font-medium">Personal</p>
                    <InfoRow label="DOB" value={dob} />
                    <InfoRow label="Mobile" value={mobile} />
                    <InfoRow label="Email" value={email} />
                    <InfoRow label="Address" value={`${address1}${address2 ? ", " + address2 : ""}, ${city}, ${state} ${pincode}`} />
                  </div>
                  <div className="space-y-3">
                    <p className="font-medium">Loan</p>
                    <InfoRow label="Requested" value={`₹${amount.toLocaleString()}`} />
                    <InfoRow label="Tenure" value={`${tenure} months`} />
                    <InfoRow label="Effective LTV" value={`${effectiveLtvPct}%`} />
                  </div>
                </div>
                <div className="mt-6 rounded-lg border p-4">
                  <p className="font-medium">Terms</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                    <li>Units remain in your folio, lien is marked with the AMC/RTA.</li>
                    <li>Top-up and part-payment available anytime.</li>
                    <li>No foreclosure charges.</li>
                  </ul>
                  <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    I agree to the terms and authorize lien creation.
                  </label>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={goPrev}>Back</Button>
                  <Button
                    disabled={!canReview}
                    onClick={() => canReview && goNext()}
                    className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                  >
                    Proceed to e‑sign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "E‑sign" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>E‑sign agreement</CardTitle>
                <CardDescription>Enter the OTP sent to your mobile to complete e‑signature.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="esignOtp">OTP</Label>
                    <Input id="esignOtp" placeholder="6‑digit OTP" maxLength={6} value={esignOtp} onChange={(e) => setEsignOtp(e.target.value.replace(/\D/g, '').slice(0,6))} />
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" /> Secured by 256‑bit TLS
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">Pledge summary</p>
                    <div className="mt-2 grid grid-cols-2 text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-right font-medium">₹{amount.toLocaleString()}</span>
                      <span className="text-muted-foreground">Tenure</span>
                      <span className="text-right font-medium">{tenure} months</span>
                      <span className="text-muted-foreground">Effective LTV</span>
                      <span className="text-right font-medium">{effectiveLtvPct}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={goPrev}>Back</Button>
                  <Button
                    disabled={!esignReady}
                    onClick={() => {
                      if (!esignReady) return;
                      setTimeout(() => {
                        setEsignComplete(true);
                        goNext();
                      }, 400);
                    }}
                    className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                  >
                    Complete e‑sign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "Done" && (
            <Success amount={amount} tenure={tenure} esignComplete={esignComplete} />
          )}
        </div>
      </section>

      <section id="how-it-works" className="bg-gradient-to-b from-white to-indigo-50/50">
        <div className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-3">
          <ValueCard icon={<Sparkles className="h-5 w-5" />} title="Instant eligibility" desc="Pledge mutual funds and get eligibility within seconds." />
          <ValueCard icon={<ShieldCheck className="h-5 w-5" />} title="Secure lien" desc="Units stay in your folio; only a lien is marked." />
          <ValueCard icon={<CheckCircle2 className="h-5 w-5" />} title="Flexible repayment" desc="Top-up anytime, repay partially or in full without charges." />
        </div>
      </section>

      <section id="eligibility" className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-xl border bg-card/50 p-6 text-sm">
          <p className="font-medium">Eligibility</p>
          <ul className="mt-3 list-inside list-disc text-muted-foreground">
            <li>Indian resident with valid PAN, Aadhaar, and active folio.</li>
            <li>Only approved mutual fund schemes are eligible for lien marking.</li>
            <li>LTV varies by scheme and category; typically up to 50%.</li>
          </ul>
        </div>
      </section>

      <section id="help" className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold">Need help?</h2>
          <p className="mt-2 text-muted-foreground">Email support@seculoan.app</p>
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
      <div className="container mx-auto grid items-center gap-8 px-4 pb-16 pt-12 md:grid-cols-2 md:pb-24 md:pt-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-xs text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
            New: Mutual fund pledging UI
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            Loan against mutual funds, in minutes
          </h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Pledge mutual fund units and unlock instant liquidity. Keep your investments while accessing funds.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700">
              <a href="#start">Start application</a>
            </Button>
            <Button asChild variant="outline">
              <a href="#how-it-works">How it works</a>
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> SEBI-compliant lien creation with bank-grade security.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-xl rounded-xl border bg-background p-6 shadow-sm">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Indicative eligibility</p>
              <p className="text-3xl font-bold">₹7,50,000</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Avg. rate</p>
              <p className="text-xl font-semibold">11.99% p.a.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Asset type</p>
              <p className="font-medium">Mutual funds</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Pledge LTV</p>
              <p className="font-medium">Up to 50%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Tenure</p>
              <p className="font-medium">3–24 months</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s} className="flex min-w-0 flex-1 items-center">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${i <= current ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 hidden h-1 flex-1 rounded md:block ${i < current ? "bg-indigo-600" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>
      <div
        className="mt-2 grid text-center text-[11px] text-muted-foreground md:text-xs"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((s) => (
          <span key={s} className="truncate px-1">{s}</span>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 text-right font-medium">{value}</span>
    </div>
  );
}

function Success({ amount, tenure, esignComplete }: { amount: number; tenure: number; esignComplete: boolean }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-600" /> Application submitted
        </CardTitle>
        <CardDescription>Funds are typically disbursed within hours after lien confirmation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <InfoRow label="Amount" value={`₹${amount.toLocaleString()}`} />
            <InfoRow label="Tenure" value={`${tenure} months`} />
            <InfoRow label="Status" value={esignComplete ? "E‑signed" : "Pending"} />
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">What happens next?</p>
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              <li>Lien request is sent to the AMC/RTA for approval.</li>
              <li>On approval, funds are disbursed to your bank account.</li>
              <li>Track and manage top-ups and repayments anytime.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {icon}
        </div>
        <p className="font-medium">{title}</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function formatAadhaar(v: string) {
  const s = v.replace(/\D/g, '').slice(0, 12);
  return s.replace(/(.{4})/g, '$1 ').trim();
}
