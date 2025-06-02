'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge'
import { BrainCircuit, Briefcase, Users, Plus } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: BrainCircuit },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/job-setup', label: 'Job Setup', icon: Plus },
    { href: '/candidates', label: 'Candidates', icon: Users },
    { href: '/interviewer-creator', label: 'Interviewer Creator', icon: BrainCircuit },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BrainCircuit className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AI Employment Coach</span>
            <Badge variant="secondary" className="ml-2">
              AI-Powered Interviews
            </Badge>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}