import { Home, Search, PlusCircle, Bookmark, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavButtonProps {
  icon: typeof Home;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavButton = ({ icon: Icon, label, active, onClick }: NavButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 h-auto ${
      active ? 'text-primary' : 'text-muted-foreground'
    }`}
  >
    <Icon className="h-6 w-6" />
    <span className="text-xs">{label}</span>
  </Button>
);

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        <NavButton 
          icon={Home} 
          label="Home" 
          active={activeTab === 'home'}
          onClick={() => onTabChange('home')}
        />
        <NavButton 
          icon={Search} 
          label="Discover"
          active={activeTab === 'discover'}
          onClick={() => onTabChange('discover')}
        />
        <NavButton 
          icon={PlusCircle} 
          label="Create"
          active={activeTab === 'create'}
          onClick={() => onTabChange('create')}
        />
        <NavButton 
          icon={Bookmark} 
          label="Saved"
          active={activeTab === 'saved'}
          onClick={() => onTabChange('saved')}
        />
        <NavButton 
          icon={User} 
          label="Profile"
          active={activeTab === 'profile'}
          onClick={() => onTabChange('profile')}
        />
      </div>
    </div>
  );
};

export default BottomNavigation;