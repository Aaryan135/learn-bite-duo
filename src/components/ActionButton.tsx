import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ActionButtonProps {
  icon: LucideIcon;
  count?: number;
  onClick?: () => void;
  isActive?: boolean;
}

const ActionButton = ({ icon: Icon, count, onClick, isActive }: ActionButtonProps) => {
  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    >
      <div className={`w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
        isActive ? 'bg-primary/30 text-primary' : 'bg-white/20 text-white'
      }`}>
        <Icon className="h-6 w-6" />
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-white text-xs font-medium drop-shadow-sm">
          {formatCount(count)}
        </span>
      )}
    </motion.button>
  );
};

export default ActionButton;