import React, { useState } from 'react';
import { Activity, Menu, X, Shield, Users, Cpu, Mail, FileText, ArrowRight, Lock } from 'lucide-react';

interface PublicHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isAuthenticated: boolean;
  onLaunchApp: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentPath,
  onNavigate,
  isAuthenticated,
  onLaunchApp
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Activity },
    { name: 'About', path: '/about', icon: Users },
    { name: '3D Specialists', path: '/specialists', icon: Users },
    { name: 'Technology & Safety', path: '/technology', icon: Cpu },
    { name: 'Contact', path: '/contact', icon: Mail },
    { name: 'Privacy Policy', path: '/privacy', icon: Shield }
  ];

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-[#090E17] border-b-2 border-[#1E293B] sticky top-0 z-50 text-white font-sans">
      {/* Top Clinical Operating System Ticker */}
      <div className="bg-[#FFE45C] text-[#080808] text-[11px] font-mono font-semibold py-1 px-4 overflow-hidden border-b border-[#080808]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-[#080808] text-[#FFE45C] px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">
              CLINICAL OS v2.5
            </span>
            <span>HEAL ENGINE · LONGITUDINAL DECISION SUPPORT · HUMAN-IN-THE-LOOP CONSENSUS</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[11px]">
            <a href="tel:+18005554325" className="hover:underline font-mono">
              Emergency: 1-800-555-HEAL
            </a>
            <span>·</span>
            <span className="font-mono">FHIR R4 COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => handleLinkClick('/', e)}
          className="flex items-center space-x-3 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFE45C]"
          aria-label="HEAL Engine Home"
        >
          <div className="w-10 h-10 bg-[#FFE45C] text-[#080808] flex items-center justify-center font-display font-black text-xl shadow-[3px_3px_0px_#000] border-2 border-[#080808] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg tracking-wider text-white">
              HEAL ENGINE
            </span>
            <span className="text-[10px] font-mono text-[#94A3B8] -mt-1 tracking-tight">
              CLINICAL INTELLIGENCE OS
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => handleLinkClick(link.path, e)}
                className={`px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#1E293B] text-[#FFE45C] font-bold border-b-2 border-[#FFE45C]'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-[#1E293B]/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Action Button: Launch Clinical Workspace */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={onLaunchApp}
            className="flex items-center space-x-2 bg-[#FFE45C] text-[#080808] px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-2 border-[#FFE45C] shadow-[3px_3px_0px_#000] hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isAuthenticated ? "Open Clinical Dashboard" : "Launch Clinical OS"}
          >
            {isAuthenticated ? (
              <>
                <span>Enter Clinical Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Launch Clinical OS</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] rounded-lg border border-[#334155] focus:outline-none focus:ring-2 focus:ring-[#FFE45C]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F172A] border-b-2 border-[#334155] px-4 py-4 space-y-2">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleLinkClick(link.path, e)}
                  className={`px-3 py-2.5 text-xs font-mono uppercase tracking-wider rounded-md flex items-center space-x-2.5 ${
                    isActive
                      ? 'bg-[#1E293B] text-[#FFE45C] font-bold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#1E293B]/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <link.icon className="w-4 h-4 text-[#94A3B8]" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-[#1E293B]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchApp();
              }}
              className="w-full flex items-center justify-center space-x-2 bg-[#FFE45C] text-[#080808] py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-[#FFE45C] shadow-[3px_3px_0px_#000]"
            >
              {isAuthenticated ? "Enter Clinical Dashboard" : "Launch Clinical OS"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
