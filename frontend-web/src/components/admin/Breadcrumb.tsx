import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb() {
  const location = useLocation();
  
  // Generate breadcrumb items from path
  const items: BreadcrumbItem[] = location.pathname
    .split('/')
    .filter(Boolean)
    .reduce((acc: BreadcrumbItem[], part, index, arr) => {
      const href = '/' + arr.slice(0, index + 1).join('/');
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      acc.push({ label, href });
      return acc;
    }, []);

  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-600">
      <Link to="/admin/dashboard" className="hover:text-nu-green">
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {index === items.length - 1 ? (
            <span className="font-medium text-slate-900">{item.label}</span>
          ) : (
            <Link to={item.href} className="hover:text-nu-green">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}