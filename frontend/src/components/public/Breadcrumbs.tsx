import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs font-mono">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-[#94A3B8] flex-shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="font-semibold text-[#080808] dark:text-[#FFE45C] bg-[#FFE45C]/20 px-2 py-0.5 rounded border border-[#FFE45C]/40"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.path);
                  }}
                  className="text-[#64748B] hover:text-[#080808] dark:hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{item.name}</span>
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
