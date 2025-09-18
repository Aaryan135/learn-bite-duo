import { Search, User, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  userXP: number;
  userStreak: number;
}

const Header = ({ userXP, userStreak }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">&lt;/&gt;</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              CodeSnap
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search topics, languages..."
                className="pl-10 bg-surface border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* User Stats & Profile */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface border border-border/50">
                <Zap className="w-4 h-4 xp-glow" />
                <span className="text-sm font-semibold xp-glow">{userXP.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface border border-border/50">
                <Flame className="w-4 h-4 streak-glow" />
                <span className="text-sm font-semibold streak-glow">{userStreak}</span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;