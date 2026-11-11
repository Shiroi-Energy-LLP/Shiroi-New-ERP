import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  ShoppingCart,
  Boxes,
  IndianRupee,
  UserCog,
  Wrench,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { NavModule } from "@/lib/nav";

export const MODULE_ICONS: Record<NavModule["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  crm: Users,
  sales: FileText,
  projects: FolderKanban,
  procurement: ShoppingCart,
  inventory: Boxes,
  finance: IndianRupee,
  hr: UserCog,
  service: Wrench,
  reports: BarChart3,
  settings: Settings,
};
