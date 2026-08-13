import {
  Stethoscope, FlaskConical, Activity, Pill, Brain, House,
  HeartPulse, Truck, Search, MapPin, Bell, Menu, Star, Clock,
  Video, Calendar, ChevronRight, ChevronLeft, ChevronDown, X,
  Phone, MessageCircle, FileText, Settings, LogOut, User, Plus,
  Check, CheckCheck, ArrowLeft, ArrowRight, AlertTriangle, Ambulance,
  CircleCheck, CircleDot, Filter, Mic, Heart, Share2, Download,
  Edit, Trash2, Eye, Lock, ShieldCheck, Loader2, Send, Camera,
  Image as ImageIcon, MapPinned, Navigation, CircleX, Clock3,
  Users, Award, Languages as LangIcon, Building2, Wallet, History,
  Home, ClipboardList, CalendarCheck, CircleUser, MoreVertical,
  Power, Radio, TrendingUp, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  'flask-conical': FlaskConical,
  activity: Activity,
  pill: Pill,
  brain: Brain,
  house: House,
  'heart-pulse': HeartPulse,
  truck: Truck,
  search: Search,
  'map-pin': MapPin,
  bell: Bell,
  menu: Menu,
  star: Star,
  clock: Clock,
  video: Video,
  calendar: Calendar,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  x: X,
  phone: Phone,
  'message-circle': MessageCircle,
  'file-text': FileText,
  settings: Settings,
  'log-out': LogOut,
  user: User,
  plus: Plus,
  check: Check,
  'check-check': CheckCheck,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'alert-triangle': AlertTriangle,
  ambulance: Ambulance,
  'circle-check': CircleCheck,
  'circle-dot': CircleDot,
  filter: Filter,
  mic: Mic,
  heart: Heart,
  share: Share2,
  download: Download,
  edit: Edit,
  trash: Trash2,
  eye: Eye,
  lock: Lock,
  'shield-check': ShieldCheck,
  loader: Loader2,
  send: Send,
  camera: Camera,
  image: ImageIcon,
  'map-pinned': MapPinned,
  navigation: Navigation,
  'circle-x': CircleX,
  'clock-3': Clock3,
  users: Users,
  award: Award,
  languages: LangIcon,
  building: Building2,
  wallet: Wallet,
  history: History,
  home: Home,
  'clipboard-list': ClipboardList,
  'calendar-check': CalendarCheck,
  'circle-user': CircleUser,
  'more-vertical': MoreVertical,
  power: Power,
  radio: Radio,
  'trending-up': TrendingUp,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, className = '', strokeWidth = 2 }: IconProps) {
  const Cmp = iconMap[name] ?? CircleDot;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} />;
}

export { iconMap };
