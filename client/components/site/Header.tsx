import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header({ className }: { className?: string }) {
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur", className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
         <img src={`${import.meta.env.BASE_URL}ltflow.svg`} alt=""  className="w-40 h-40"/>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
          <a href="#eligibility" className="text-sm text-muted-foreground hover:text-foreground">Eligibility</a>
          <a href="#help" className="text-sm text-muted-foreground hover:text-foreground">Help</a>
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <a href="#help">Get help</a>
          </Button>
          <Button asChild className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700">
            <a href="#start">Start application</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
