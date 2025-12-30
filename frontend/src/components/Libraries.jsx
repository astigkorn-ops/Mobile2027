import { X, Package, Code, Box } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

interface LibrariesProps {
  onClose: () => void;
}

export const Libraries = ({ onClose }: LibrariesProps) => {
  const coreLibraries = [
    { name: 'react', version: '^19.2.0', description: 'JavaScript library for building user interfaces' },
    { name: 'react-dom', version: '^19.2.0', description: 'React rendering for web browsers' },
    { name: 'react-webcam', version: '^7.2.0', description: 'Webcam component for React - camera access' },
    { name: 'react-dropzone', version: '^14.3.8', description: 'File upload with drag and drop' },
    { name: 'date-fns', version: '^4.1.0', description: 'Modern JavaScript date utility library' },
  ];

  const uiLibraries = [
    { name: 'lucide-react', version: '^0.561.0', description: 'Beautiful & consistent icon library' },
    { name: '@radix-ui/react-dialog', version: '^1.1.15', description: 'Accessible dialog/modal components' },
    { name: '@radix-ui/react-toast', version: '^1.2.15', description: 'Toast notification system' },
    { name: '@radix-ui/react-slider', version: '^1.3.6', description: 'Accessible slider component' },
    { name: '@radix-ui/react-toggle', version: '^1.1.10', description: 'Toggle button component' },
    { name: '@radix-ui/react-scroll-area', version: '^1.2.10', description: 'Scrollable area component' },
    { name: '@radix-ui/react-separator', version: '^1.1.8', description: 'Visual divider component' },
    { name: 'sonner', version: '^2.0.7', description: 'Opinionated toast component for React' },
    { name: 'framer-motion', version: '^12.23.26', description: 'Production-ready motion library' },
  ];

  const stylingLibraries = [
    { name: 'tailwindcss', version: '^3.3.5', description: 'Utility-first CSS framework' },
    { name: 'tailwindcss-animate', version: '^1.0.7', description: 'Animation utilities for Tailwind' },
    { name: 'class-variance-authority', version: '^0.7.1', description: 'Variant-based class name utilities' },
    { name: 'clsx', version: '^2.1.1', description: 'Conditional class name builder' },
    { name: 'tailwind-merge', version: '^3.4.0', description: 'Merge Tailwind classes without conflicts' },
  ];

  const formLibraries = [
    { name: 'react-hook-form', version: '^7.68.0', description: 'Performant form validation library' },
    { name: '@hookform/resolvers', version: '^5.2.2', description: 'Validation resolvers for react-hook-form' },
    { name: 'zod', version: '^4.2.1', description: 'TypeScript-first schema validation' },
  ];

  const utilityLibraries = [
    { name: 'react-router-dom', version: '^7.11.0', description: 'Routing library for React' },
    { name: 'react-hot-toast', version: '^2.6.0', description: 'Lightweight toast notification library' },
    { name: 'next-themes', version: '^0.4.6', description: 'Theme management for Next.js and React' },
    { name: '@blinkdotnew/sdk', version: '^2.2.0', description: 'Blink platform SDK for cloud services' },
  ];

  const additionalUILibraries = [
    { name: '@radix-ui/react-accordion', version: '^1.2.12', description: 'Collapsible accordion component' },
    { name: '@radix-ui/react-alert-dialog', version: '^1.1.15', description: 'Modal alert dialog' },
    { name: '@radix-ui/react-avatar', version: '^1.1.11', description: 'Avatar component with fallback' },
    { name: '@radix-ui/react-checkbox', version: '^1.3.3', description: 'Accessible checkbox' },
    { name: '@radix-ui/react-dropdown-menu', version: '^2.1.16', description: 'Dropdown menu component' },
    { name: '@radix-ui/react-popover', version: '^1.1.15', description: 'Popover component' },
    { name: '@radix-ui/react-select', version: '^2.2.6', description: 'Select dropdown component' },
    { name: '@radix-ui/react-switch', version: '^1.2.6', description: 'Toggle switch component' },
    { name: '@radix-ui/react-tabs', version: '^1.1.13', description: 'Tab navigation component' },
    { name: '@radix-ui/react-tooltip', version: '^1.2.8', description: 'Tooltip component' },
  ];

  const devDependencies = [
    { name: 'vite', version: '^7.2.4', description: 'Next generation frontend build tool' },
    { name: 'typescript', version: '~5.9.3', description: 'TypeScript language support' },
    { name: '@vitejs/plugin-react', version: '^5.1.2', description: 'Official Vite plugin for React' },
    { name: 'eslint', version: '^9.39.1', description: 'JavaScript and TypeScript linter' },
    { name: 'stylelint', version: '^16.26.1', description: 'Modern CSS linter' },
    { name: 'postcss', version: '^8.4.31', description: 'Tool for transforming CSS with JavaScript' },
    { name: 'autoprefixer', version: '^10.4.16', description: 'PostCSS plugin to parse CSS and add vendor prefixes' },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-50 animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Libraries & Dependencies</h1>
              <p className="text-sm text-white/60">Complete list of packages used in GeoCam</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full h-10 w-10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 max-w-4xl mx-auto">
