export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />
            <div>
              <p className="font-semibold">SecuLoan</p>
              <p className="text-sm text-muted-foreground">Loans against securities, instantly.</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#help" className="hover:text-foreground">Support</a>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Rates and LTV are indicative and may vary by security. This is a demo UI only; no data is transmitted.</p>
      </div>
    </footer>
  );
}
