import { NavLink, Outlet } from "react-router-dom";
import { LogOut, Package, ReceiptText, ShoppingCart, Tags } from "lucide-react";
import { Button } from "../common/Button";
import { useAuth } from "../../auth/useAuth";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? "bg-blue-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
  }`;

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div>
            <p className="text-lg font-semibold">Flash Sale Console</p>
            <p className="text-sm text-slate-500">{user?.email ?? "Authenticated workspace"}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Primary">
            <NavLink to="/products" className={navClass}>
              <Package size={16} /> Products
            </NavLink>
            {isAdmin ? (
              <NavLink to="/admin/sales" className={navClass}>
                <Tags size={16} /> Sales
              </NavLink>
            ) : null}
            <NavLink to="/purchase" className={navClass}>
              <ShoppingCart size={16} /> Purchase
            </NavLink>
            <NavLink to="/orders/lookup" className={navClass}>
              <ReceiptText size={16} /> Orders
            </NavLink>
            <Button variant="ghost" onClick={logout} className="ml-1">
              <LogOut size={16} /> Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <Outlet />
      </main>
    </div>
  );
}
