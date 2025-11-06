import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type AssetCategory = "Mutual Fund" | "Stock" | "Insurance";

type Asset = Holding & { category: AssetCategory; isEligible: boolean };

const DEFAULT_ASSETS: Asset[] = [
  // Mutual funds
  { category: "Mutual Fund", symbol: "HDFCFLEXI-DG", name: "HDFC Flexi Cap Fund - Direct Growth", price: 160.25, qty: 250, ltv: 0.5, isEligible: true },
  { category: "Mutual Fund", symbol: "MIRAE-LARGE-DG", name: "Mirae Asset Large Cap Fund - Direct Growth", price: 120.9, qty: 300, ltv: 0.5, isEligible: false },
  { category: "Mutual Fund", symbol: "ICICIBLUE-DG", name: "ICICI Pru Bluechip Fund - Direct Growth", price: 105.1, qty: 280, ltv: 0.5, isEligible: true },
  { category: "Mutual Fund", symbol: "AXIS-SMALL-DG", name: "Axis Small Cap Fund - Direct Growth", price: 75.6, qty: 220, ltv: 0.4, isEligible: true },
  // Stocks
  { category: "Stock", symbol: "TCS", name: "Tata Consultancy Services", price: 4040, qty: 30, ltv: 0.5, isEligible: true },
  { category: "Stock", symbol: "RELIANCE", name: "Reliance Industries", price: 2930, qty: 20, ltv: 0.5, isEligible: false },
  // Insurance (surrender value based, typically lower LTV)
  { category: "Insurance", symbol: "LIC-ULIP-01", name: "LIC Wealth Plus (ULIP)", price: 100, qty: 500, ltv: 0.3, isEligible: false },
  { category: "Insurance", symbol: "HDFCLIFE-TRAD-01", name: "HDFC Life Sanchay Plus", price: 100, qty: 400, ltv: 0.35, isEligible: true },
];

const steps = [
  "Profile",
  "Personal",
  "Income",
  "KYC",
  "Assets",
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

  // Assets / Loan
  const [holdings] = useState<Asset[]>(DEFAULT_ASSETS);
  const [assetCategory, setAssetCategory] = useState<AssetCategory>("Mutual Fund");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [tenure, setTenure] = useState(12);
  const [amount, setAmount] = useState<number>(0);
  const [accepted, setAccepted] = useState(false);
  const [esignOtp, setEsignOtp] = useState("");
  const [esignComplete, setEsignComplete] = useState(false);
  
  // Asset verification OTPs
  const [assetOtps, setAssetOtps] = useState<Record<string, string>>({});
  const [assetOtpSent, setAssetOtpSent] = useState<Record<string, boolean>>({});
  const [assetVerified, setAssetVerified] = useState<Record<string, boolean>>({});
  const [lienConsent, setLienConsent] = useState(false);

  // Asset fetching consent and OTP
  const [assetFetchConsent, setAssetFetchConsent] = useState(false);
  const [assetFetchOtp, setAssetFetchOtp] = useState("");
  const [assetFetchOtpSent, setAssetFetchOtpSent] = useState(false);
  const [assetFetchVerified, setAssetFetchVerified] = useState(false);
  const [isFetchingAssets, setIsFetchingAssets] = useState(false);

  const visibleHoldings = useMemo(() => holdings.filter(h => h.category === assetCategory), [assetCategory, holdings]);

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
  dob &&
  mobile.trim().length === 10 && // just length check
  email.includes("@") && // basic presence check
  address1.trim().length > 0 &&
  city.trim().length > 0 &&
  state.trim().length > 0 &&
  pincode.trim().length === 6; // no regex
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

                
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg border border-muted bg-muted/20 p-4">
                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed">
                      <input 
                        type="checkbox" 
                        checked={kycConsent} 
                        onChange={(e) => setKycConsent(e.target.checked)}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="text-muted-foreground">
                        I hereby consent and authorize the Company to verify my identity and KYC details by fetching information from UIDAI (Aadhaar), PAN database, CIBIL, and other relevant government/financial databases. I understand that this information will be used solely for KYC compliance, creditworthiness assessment, and loan processing purposes. I acknowledge that my data will be handled as per applicable data protection laws and the Company's Privacy Policy.
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      Bank‑grade encryption. We never share your data.
                    </div>
                    <Button
                      disabled={!isProfileValid || !kycConsent}
                      onClick={() => isProfileValid && kycConsent && goNext()}
                      className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                    >
                      Continue
                    </Button>
                  </div>
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

          {step === "Assets" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Fetch your asset portfolio</CardTitle>
                <CardDescription>
                  {!assetFetchVerified 
                    ? "Authorize us to securely fetch your holdings from depositories, AMCs, and insurance providers."
                    : "Select assets to pledge. Eligibility is computed from units × price × LTV."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!assetFetchVerified ? (
                  // Consent and OTP Section
                  <div className="space-y-6">
                    <div className="rounded-lg border border-muted bg-muted/20 p-4">
                      <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed">
                        <input 
                          type="checkbox" 
                          checked={assetFetchConsent} 
                          onChange={(e) => setAssetFetchConsent(e.target.checked)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">Asset Fetch Authorization:</strong> I hereby authorize and consent to the Company to fetch and access my asset holdings information from the following sources:
                          <ul className="mt-2 ml-4 space-y-1 list-disc">
                            <li><strong>Mutual Funds:</strong> From Asset Management Companies (AMCs), Registrar and Transfer Agents (RTAs), and CAMS/Karvy repositories using my PAN and contact details.</li>
                            <li><strong>Stocks & Securities:</strong> From Depositories (NSDL/CDSL) and my linked Demat account(s) to retrieve my equity holdings and portfolio.</li>
                            <li><strong>Insurance Policies:</strong> From insurance providers (LIC, HDFC Life, etc.) to fetch policy details, surrender values, and ULIP holdings.</li>
                          </ul>
                          <p className="mt-2">
                            I understand that this information will be used solely for determining my loan eligibility, assessing collateral value, and processing my loan application. My data will be handled as per applicable data protection laws and the Company's Privacy Policy. I can revoke this consent at any time by contacting customer support.
                          </p>
                        </span>
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Verify your identity</Label>
                        <p className="text-xs text-muted-foreground">
                          We'll send a 6-digit OTP to your registered mobile number and email to verify and fetch your assets securely.
                        </p>
                        <Button
                          variant="outline"
                          disabled={!assetFetchConsent || assetFetchOtpSent}
                          onClick={() => setAssetFetchOtpSent(true)}
                          className="w-full"
                        >
                          {assetFetchOtpSent ? "OTP Sent to Mobile & Email" : "Send OTP to Fetch Assets"}
                        </Button>
                      </div>

                      {assetFetchOtpSent && (
                        <div className="space-y-2">
                          <Label htmlFor="assetFetchOtp">Enter OTP</Label>
                          <Input
                            id="assetFetchOtp"
                            placeholder="6-digit OTP"
                            maxLength={6}
                            value={assetFetchOtp}
                            onChange={(e) => setAssetFetchOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          />
                          <Button
                            disabled={assetFetchOtp.length !== 6}
                            onClick={() => {
                              if (assetFetchOtp.length === 6) {
                                setIsFetchingAssets(true);
                                // Simulate asset fetching with animation
                                setTimeout(() => {
                                  setIsFetchingAssets(false);
                                  setAssetFetchVerified(true);
                                }, 3000); // 3 second loading animation
                              }
                            }}
                            className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700"
                          >
                            {isFetchingAssets ? "Fetching Assets..." : "Verify & Fetch Assets"}
                          </Button>
                        </div>
                      )}
                    </div>

                    {isFetchingAssets && (
                      <div className="rounded-lg border bg-muted/30 p-6">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-indigo-600"></div>
                          <div className="space-y-2 text-center">
                            <p className="font-medium">Fetching your assets...</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p className="animate-pulse">⚡ Connecting to CAMS & Karvy repositories...</p>
                              <p className="animate-pulse delay-100">📊 Fetching mutual fund holdings from AMCs...</p>
                              <p className="animate-pulse delay-200">🏦 Retrieving stock portfolio from NSDL/CDSL...</p>
                              <p className="animate-pulse delay-300">🛡️ Accessing insurance policies...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <Button variant="outline" onClick={goPrev}>Back</Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Secured with bank-grade encryption</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Asset Selection Section (shown after verification)
                  <>
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50/50 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900">Assets fetched successfully!</span>
                        <span className="text-green-700">Found {holdings.length} assets across categories</span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                      <Label>Asset type</Label>
                      <Select value={assetCategory} onValueChange={(v) => setAssetCategory(v as AssetCategory)}>
                        <SelectTrigger className="w-56"><SelectValue placeholder="Select asset" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mutual Fund">Mutual funds</SelectItem>
                          <SelectItem value="Stock">Stocks</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border">
                      <div className="grid grid-cols-12 bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div className="col-span-5">Asset</div>
                        <div className="col-span-2 text-right">Units</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-1 text-right">LTV</div>
                        <div className="col-span-2 text-right">Pledge Units</div>
                      </div>
                      {visibleHoldings.map((h) => {
                        const pledged = selected[h.symbol] ?? 0;
                        const rowClass = h.isEligible ? "bg-green-50/60" : "bg-red-50/60";
                        return (
                          <div key={h.symbol} className={`grid grid-cols-12 items-center border-t p-3 text-sm ${rowClass}`}>
                            <div className="col-span-5">
                              <div className="font-medium">{h.name}</div>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{h.symbol} • {h.category}</span>
                                {h.isEligible ? (
                                  <Badge className="bg-green-600 hover:bg-green-600">Eligible</Badge>
                                ) : (
                                  <Badge variant="destructive">Not eligible</Badge>
                                )}
                              </div>
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
                                disabled={!h.isEligible}
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
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {step === "Loan" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Verify pledged assets & finalize loan</CardTitle>
                <CardDescription>Verify each asset with OTP before finalizing your loan amount.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Selected Assets List with OTP Verification */}
                <div className="mb-6">
                  <Label className="text-base">Selected assets for pledge</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">OTP will be sent to your registered mobile/email with each institution</p>
                  <div className="space-y-3">
                    {holdings
                      .filter(h => (selected[h.symbol] ?? 0) > 0)
                      .map((h) => {
                        const pledgedQty = selected[h.symbol] ?? 0;
                        const pledgedVal = pledgedQty * h.price;
                        const isVerified = assetVerified[h.symbol] || false;
                        const otpSent = assetOtpSent[h.symbol] || false;
                        const otpValue = assetOtps[h.symbol] || "";

                        return (
                          <div key={h.symbol} className="rounded-lg border p-4 bg-muted/20">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{h.name}</p>
                                  {isVerified && (
                                    <Badge className="bg-green-600 hover:bg-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                                  <span>{h.symbol}</span>
                                  <span>•</span>
                                  <span>{h.category}</span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Pledged units: </span>
                                    <span className="font-medium">{pledgedQty}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Value: </span>
                                    <span className="font-medium">₹{pledgedVal.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">LTV: </span>
                                    <span className="font-medium">{Math.round(h.ltv * 100)}%</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Eligible: </span>
                                    <span className="font-medium">₹{Math.floor(pledgedVal * h.ltv).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* OTP Verification Section */}
                              <div className="flex flex-col gap-2 min-w-[200px]">
                                {!isVerified && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={otpSent}
                                      onClick={() => {
                                        setAssetOtpSent(prev => ({ ...prev, [h.symbol]: true }));
                                      }}
                                      className="w-full"
                                    >
                                      {otpSent ? "OTP Sent" : "Send OTP"}
                                    </Button>
                                    {otpSent && (
                                      <div className="flex gap-2">
                                        <Input
                                          placeholder="6-digit OTP"
                                          maxLength={6}
                                          value={otpValue}
                                          onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setAssetOtps(prev => ({ ...prev, [h.symbol]: val }));
                                          }}
                                          className="h-8 text-sm"
                                        />
                                        <Button
                                          size="sm"
                                          disabled={otpValue.length !== 6}
                                          onClick={() => {
                                            if (otpValue.length === 6) {
                                              setAssetVerified(prev => ({ ...prev, [h.symbol]: true }));
                                            }
                                          }}
                                          className="h-8"
                                        >
                                          Verify
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Loan Amount and Tenure Selection */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <Label>Loan amount</Label>
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
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {[3, 6, 9, 12, 18, 24].map((t) => (
                        <Button
                          key={t}
                          size="sm"
                          variant={tenure === t ? "default" : "outline"}
                          onClick={() => setTenure(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-6 rounded-lg border p-4 text-sm">
                      <p className="font-medium">Loan summary</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <span className="text-muted-foreground">Requested</span>
                        <span className="text-right font-medium">₹{amount.toLocaleString()}</span>
                        <span className="text-muted-foreground">Tenure</span>
                        <span className="text-right font-medium">{tenure} months</span>
                        <span className="text-muted-foreground">Effective LTV</span>
                        <span className="text-right font-medium">{effectiveLtvPct}%</span>
                        <span className="text-muted-foreground">Assets verified</span>
                        <span className="text-right font-medium">
                          {Object.values(assetVerified).filter(Boolean).length} / {Object.keys(selected).filter(k => selected[k] > 0).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lien Creation Consent */}
                <div className="mt-6">
                  <div className="rounded-lg border border-muted bg-muted/20 p-4">
                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed">
                      <input 
                        type="checkbox" 
                        checked={lienConsent} 
                        onChange={(e) => setLienConsent(e.target.checked)}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Lien Marking Authorization:</strong> I hereby authorize and consent to the creation of a lien/pledge on the above-selected securities (mutual fund units, stocks, and/or insurance policies) in favor of the lending institution. I understand that:
                        <ul className="mt-2 ml-4 space-y-1 list-disc">
                          <li>The lien will be marked with the respective Asset Management Companies (AMC), Registrar and Transfer Agents (RTA), Depositories (NSDL/CDSL), and Insurance providers as applicable.</li>
                          <li>The pledged securities will remain in my name and demat account/folio, but I will not be able to sell, transfer, or pledge them to any other party until the loan is fully repaid and the lien is released.</li>
                          <li>The lending institution has the right to invoke the lien and liquidate the pledged securities in case of default in loan repayment, as per the terms and conditions of the loan agreement.</li>
                          <li>Any dividends, bonuses, or corporate actions on the pledged securities will continue to accrue to my account, subject to the lien.</li>
                          <li>I am responsible for ensuring adequate margin is maintained, and the lender may request additional collateral or partial repayment if the value of pledged assets falls below the required threshold.</li>
                        </ul>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={goPrev}>Back</Button>
                  <Button
                    disabled={
                      !isAmountValid || 
                      !lienConsent ||
                      Object.keys(selected).filter(k => selected[k] > 0).length !== Object.values(assetVerified).filter(Boolean).length
                    }
                    onClick={() => {
                      if (isAmountValid && lienConsent && Object.keys(selected).filter(k => selected[k] > 0).length === Object.values(assetVerified).filter(Boolean).length) {
                        goNext();
                      }
                    }}
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
          <p className="mt-2 text-muted-foreground">Email support@ltflow.com</p>
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
          {/* <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-xs text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
            New: Mutual fund pledging UI
          </div> */}
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            Loan against securities, in minutes
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
