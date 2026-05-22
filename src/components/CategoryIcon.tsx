import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Utensils,
  Home,
  Car,
  Sparkles,
  HeartPulse,
  HelpCircle,
  PlusCircle,
  Calendar,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Edit2,
  Trash2,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Sliders,
  Award,
  Wallet,
  Settings,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  EyeOff,
  CloudLightning,
  RefreshCw,
  Plus,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Database
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  classNameBg?: string; // Optional background decoration class
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = '', size = 20 }) => {
  switch (name) {
    case 'DollarSign': return <DollarSign className={className} size={size} />;
    case 'TrendingUp': return <TrendingUp className={className} size={size} />;
    case 'Utensils': return <Utensils className={className} size={size} />;
    case 'Home': return <Home className={className} size={size} />;
    case 'Car': return <Car className={className} size={size} />;
    case 'Sparkles': return <Sparkles className={className} size={size} />;
    case 'HeartPulse': return <HeartPulse className={className} size={size} />;
    case 'HelpCircle': return <HelpCircle className={className} size={size} />;
    case 'PlusCircle': return <PlusCircle className={className} size={size} />;
    case 'Calendar': return <Calendar className={className} size={size} />;
    case 'AlertTriangle': return <AlertTriangle className={className} size={size} />;
    case 'Target': return <Target className={className} size={size} />;
    case 'ArrowUpRight': return <ArrowUpRight className={className} size={size} />;
    case 'ArrowDownLeft': return <ArrowDownLeft className={className} size={size} />;
    case 'X': return <X className={className} size={size} />;
    case 'Edit2': return <Edit2 className={className} size={size} />;
    case 'Trash2': return <Trash2 className={className} size={size} />;
    case 'PieIcon': return <PieIcon className={className} size={size} />;
    case 'BarIcon': return <BarIcon className={className} size={size} />;
    case 'Sliders': return <Sliders className={className} size={size} />;
    case 'Award': return <Award className={className} size={size} />;
    case 'Wallet': return <Wallet className={className} size={size} />;
    case 'Settings': return <Settings className={className} size={size} />;
    case 'ShieldCheck': return <ShieldCheck className={className} size={size} />;
    case 'Search': return <Search className={className} size={size} />;
    case 'Filter': return <Filter className={className} size={size} />;
    case 'Eye': return <Eye className={className} size={size} />;
    case 'EyeOff': return <EyeOff className={className} size={size} />;
    case 'CloudLightning': return <CloudLightning className={className} size={size} />;
    case 'RefreshCw': return <RefreshCw className={className} size={size} />;
    case 'Plus': return <Plus className={className} size={size} />;
    case 'Info': return <Info className={className} size={size} />;
    case 'SlidersHorizontal': return <SlidersHorizontal className={className} size={size} />;
    case 'ChevronRight': return <ChevronRight className={className} size={size} />;
    case 'Database': return <Database className={className} size={size} />;
    default: return <HelpCircle className={className} size={size} />;
  }
};
