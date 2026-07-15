declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export type Icon = FC<IconProps>;

  // All icons used in the project
  export const Activity: Icon;
  export const AlertCircle: Icon;
  export const AlertTriangle: Icon;
  export const ArrowRight: Icon;
  export const Award: Icon;
  export const BarChart: Icon;
  export const BarChart2: Icon;
  export const BookOpen: Icon;
  export const Brain: Icon;
  export const BrainCircuit: Icon;
  export const Briefcase: Icon;
  export const Building2: Icon;
  export const Bot: Icon;
  export const CheckCircle: Icon;
  export const CheckCircle2: Icon;
  export const ChevronDown: Icon;
  export const ChevronRight: Icon;
  export const Circle: Icon;
  export const Clock: Icon;
  export const Code: Icon;
  export const Code2: Icon;
  export const DollarSign: Icon;
  export const ExternalLink: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const FileSearch: Icon;
  export const FileText: Icon;
  export const Flame: Icon;
  export const History: Icon;
  export const Home: Icon;
  export const Key: Icon;
  export const LayoutDashboard: Icon;
  export const Linkedin: Icon;
  export const Loader2: Icon;
  export const Lock: Icon;
  export const LogOut: Icon;
  export const Mail: Icon;
  export const Map: Icon;
  export const MapPin: Icon;
  export const Menu: Icon;
  export const MessageSquare: Icon;
  export const Play: Icon;
  export const RefreshCcw: Icon;
  export const RotateCcw: Icon;
  export const Save: Icon;
  export const Send: Icon;
  export const Settings: Icon;
  export const Shield: Icon;
  export const Sparkles: Icon;
  export const Square: Icon;
  export const Star: Icon;
  export const Target: Icon;
  export const Trash2: Icon;
  export const TrendingUp: Icon;
  export const Trophy: Icon;
  export const Upload: Icon;
  export const User: Icon;
  export const Users: Icon;
  export const X: Icon;
  export const Zap: Icon;
  export const Search: Icon;
  export const Database: Icon;
  export const Cpu: Icon;
  export const Server: Icon;
  export const Coins: Icon;
  export const Terminal: Icon;
  export const Lightbulb: Icon;
  export const Check: Icon;
  export const HelpCircle: Icon;
  export const ChevronUp: Icon;
  export const BookmarkCheck: Icon;
}
