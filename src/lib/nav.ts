// Main navigation. `phase` = roadmap phase; modules with built=false show a "coming soon" page.
export type NavModule = {
  slug: string;
  label: string;
  icon:
    | "dashboard"
    | "crm"
    | "sales"
    | "projects"
    | "procurement"
    | "inventory"
    | "finance"
    | "hr"
    | "service"
    | "reports"
    | "settings";
  phase: number;
  built: boolean;
  summary: string;
};

export const NAV_MODULES: NavModule[] = [
  { slug: "dashboard", label: "Dashboard", icon: "dashboard", phase: 1, built: true, summary: "Today at a glance" },
  { slug: "crm", label: "CRM", icon: "crm", phase: 1, built: true, summary: "Leads, follow-ups and site visits" },
  { slug: "sales", label: "Sales", icon: "sales", phase: 1, built: false, summary: "Quotations, proposals, solar calculation, ROI, pricing and approvals" },
  { slug: "projects", label: "Projects", icon: "projects", phase: 1, built: false, summary: "Survey to handover: tasks, milestones, daily updates, photos and documents" },
  { slug: "procurement", label: "Procurement", icon: "procurement", phase: 2, built: false, summary: "Purchase requests, RFQs, vendor comparison and purchase orders" },
  { slug: "inventory", label: "Inventory", icon: "inventory", phase: 2, built: false, summary: "Warehouse and project stock, transfers and serial tracking" },
  { slug: "finance", label: "Finance", icon: "finance", phase: 1, built: false, summary: "Invoices, customer payments, GST, expenses and receivables" },
  { slug: "hr", label: "HR", icon: "hr", phase: 3, built: false, summary: "Employees, attendance, leave and payroll" },
  { slug: "service", label: "Service & AMC", icon: "service", phase: 4, built: false, summary: "Complaints, tickets, warranty and AMC visits" },
  { slug: "reports", label: "Reports", icon: "reports", phase: 5, built: false, summary: "Sales, project, finance and inventory reports" },
  { slug: "settings", label: "Settings", icon: "settings", phase: 1, built: true, summary: "Users and roles" },
];

export function findModule(slug: string): NavModule | undefined {
  return NAV_MODULES.find((m) => m.slug === slug);
}
