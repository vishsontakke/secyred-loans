import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, IndianRupee } from "lucide-react";
import { demoRows, RecordType } from "./adminData";

export default function AdminDisbursed() {
  const [rows] = useState<RecordType[]>(() => demoRows);
  
  // Filter only disbursed loans (those with a disbursement entry in ledger)
  const disbursedLoans = useMemo(() => {
    return rows.filter(r => r.ledger.some(entry => entry.note === 'Disbursed'));
  }, [rows]);

  // Calculate aggregate statistics
  const stats = useMemo(() => {
    let totalDisbursed = 0;
    let totalCurrentValue = 0;
    let lowRisk = 0;
    let mediumRisk = 0;
    let highRisk = 0;

    disbursedLoans.forEach((loan, index) => {
      totalDisbursed += loan.amount;
      // Simulate current asset value based on market fluctuation
      const pledgedValue = loan.amount / (loan.ltv / 100);
      // Create varied distribution using index and loan properties
      const variances = [0.12, -0.08, 0.03, -0.15, 0.08]; // 12%, -8%, 3%, -15%, 8%
      const variance = variances[index % variances.length];
      const currentValue = pledgedValue * (1 + variance);
      totalCurrentValue += currentValue;

      const diff = ((currentValue - pledgedValue) / pledgedValue) * 100;
      if (diff > 5) lowRisk++;
      else if (diff < -5) highRisk++;
      else mediumRisk++;
    });

    return {
      totalDisbursed,
      totalCurrentValue,
      totalDifference: totalCurrentValue - totalDisbursed,
      lowRisk,
      mediumRisk,
      highRisk
    };
  }, [disbursedLoans]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Disbursed Loans Monitor</h1>
            <p className="text-muted-foreground">Track pledged asset values and risk status</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Disbursed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">₹{stats.totalDisbursed.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Asset Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">₹{stats.totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Difference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                {stats.totalDifference >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-600" />
                )}
                <span className={cn(
                  "text-2xl font-bold",
                  stats.totalDifference >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  ₹{Math.abs(stats.totalDifference).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {stats.lowRisk} Low
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {stats.mediumRisk} Med
                </Badge>
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                  {stats.highRisk} High
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disbursed Loans Table */}
        <Card>
          <CardHeader>
            <CardTitle>Disbursed Loan Records</CardTitle>
            {/* <CardDescription>
              Live monitoring of pledged asset values ({disbursedLoans.length} active loans)
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Asset Type</th>
                    <th className="p-3 font-medium">Loan Amount</th>
                    <th className="p-3 font-medium">Pledged Value (Initial)</th>
                    <th className="p-3 font-medium">Current Asset Value</th>
                    <th className="p-3 font-medium">Difference</th>
                    <th className="p-3 font-medium">% Change</th>
                    <th className="p-3 font-medium">Risk Status</th>
                    <th className="p-3 font-medium text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {disbursedLoans.map((loan, index) => {
                    // Calculate pledged value at time of loan (loan amount / LTV ratio)
                    const pledgedValue = loan.amount / (loan.ltv / 100);
                    
                    // Simulate current market value with varied distribution
                    // Create mix of Low, Medium, and High risk scenarios
                    const variances = [0.12, -0.08, 0.03, -0.15, 0.08]; // 12%, -8%, 3%, -15%, 8%
                    const variance = variances[index % variances.length];
                    const currentValue = pledgedValue * (1 + variance);
                    
                    // Calculate difference and percentage
                    const difference = currentValue - pledgedValue;
                    const percentChange = (difference / pledgedValue) * 100;
                    
                    // Determine risk status
                    const risk = percentChange > 5 ? "Low" : percentChange < -5 ? "High" : "Medium";
                    
                    const riskColor =
                      risk === "Low"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : risk === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200";

                    const riskIcon = risk === "Low" 
                      ? <CheckCircle2 className="h-3.5 w-3.5" />
                      : risk === "High"
                        ? <AlertTriangle className="h-3.5 w-3.5" />
                        : <TrendingUp className="h-3.5 w-3.5" />;

                    return (
                      <tr
                        key={loan.id}
                        className="border-t hover:bg-muted/30 transition-colors duration-150"
                      >
                        {/* Customer Info */}
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{loan.customer}</div>
                          <div className="text-xs text-muted-foreground">{loan.id}</div>
                        </td>

                        {/* Asset Type */}
                        <td className="p-3">
                          <Badge variant="outline" className="font-normal">
                            {loan.assetType}
                          </Badge>
                        </td>

                        {/* Loan Amount */}
                        <td className="p-3 font-semibold text-gray-800">
                          ₹{loan.amount.toLocaleString()}
                        </td>

                        {/* Pledged Value at Time of Loan */}
                        <td className="p-3 text-gray-700">
                          ₹{pledgedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          <div className="text-xs text-muted-foreground">LTV: {loan.ltv}%</div>
                        </td>

                        {/* Current Asset Value */}
                        <td className="p-3">
                          <div className="font-semibold text-gray-900">
                            ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>
                        </td>

                        {/* Difference */}
                        <td className="p-3">
                          <div className={cn(
                            "font-semibold flex items-center gap-1",
                            difference >= 0 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {difference >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            ₹{Math.abs(difference).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>
                        </td>

                        {/* Percentage Change */}
                        <td className="p-3">
                          <div className={cn(
                            "font-semibold",
                            percentChange >= 0 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(2)}%
                          </div>
                        </td>

                        {/* Risk Status */}
                        <td className="p-3">
                          <Badge variant="outline" className={cn("font-medium", riskColor)}>
                            <span className="flex items-center gap-1">
                              {riskIcon}
                              {risk}
                            </span>
                          </Badge>
                        </td>

                        {/* Action */}
                        <td className="p-3 text-right">
                          <Link to={`/admin/${loan.id}`}>
                            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Risk Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-900">Low Risk</div>
                  <div className="text-xs text-emerald-700">Asset value increased by &gt;5%</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-900">Medium Risk</div>
                  <div className="text-xs text-amber-700">Asset value stable (-5% to +5%)</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-900">High Risk</div>
                  <div className="text-xs text-rose-700">Asset value decreased by &gt;5%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
