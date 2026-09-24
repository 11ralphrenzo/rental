'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Bell,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageSquare,
  Zap,
  Droplets,
  Calendar,
  Download,
  ArrowUpRight,
  Layers,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function RentalAdminDashboard() {
  const [activeTab, setActiveTab] = useState('Assigned');

  return (
    <div className="min-h-screen bg-[#eaebed] text-zinc-900 font-sans p-4 md:p-8 antialiased selection:bg-purple-100 selection:text-purple-700">
      <div className="max-w-[1520px] mx-auto space-y-6">

        {/* ── TOP FLOATING NAVIGATION BAR ── */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-white/80 backdrop-blur-xl border border-white/80 rounded-full shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-sm">
              <Building className="w-5 h-5 text-zinc-100 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">havenflow.</span>
          </div>

          {/* Center Segmented Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-zinc-100/90 rounded-full border border-zinc-200/50">
            <button className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-zinc-900 text-white shadow-sm transition-all">
              <LayoutGrid className="w-4 h-4" />
              Dashboard
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-white/60 transition-all">
              Properties
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-white/60 transition-all">
              Renters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-white/60 transition-all">
              Calendar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-white/60 transition-all">
              Utilities
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-white/60 transition-all">
              Bills
            </button>
          </nav>

          {/* Search, Notifications & Avatar */}
          <div className="flex items-center gap-3">
            <div className="relative hidden xl:block w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search units, leases, bills..."
                className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-zinc-100/80 border border-transparent focus:border-zinc-300 focus:bg-white rounded-full outline-none transition-all placeholder:text-zinc-400"
              />
            </div>

            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200/40 text-zinc-700 transition-all">
              <Bell className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 bg-zinc-100/80 border border-zinc-200/50 rounded-full">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-200">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80"
                  alt="Elena Rostova"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pr-1 text-left hidden sm:block leading-tight">
                <p className="text-xs font-bold text-zinc-900">Elena Rostova</p>
                <p className="text-[10px] text-zinc-500 font-medium">Portfolio Mgr</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── TOP SECTION: HERO UNIT SPOTLIGHT & TACTILE METRICS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Left Column: Unit Card & Performance Widget */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Active Monitored Unit Card */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900">Unit #4B · Oakridge</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Oakridge Luxury Residences, West Wing</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Occupied · Paid
                  </span>
                </div>

                {/* Lease Timeline Progress */}
                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl mb-5">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 mb-2">
                    <span>Month 8 / 12</span>
                    <span className="text-purple-600 font-bold">$2,450/mo</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200/80 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mt-2">
                    <span>Lease: Nov 01, 2024</span>
                    <span>Exp: Oct 31, 2025</span>
                  </div>
                </div>

                {/* Tenant Mini Profile */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-100/70 border border-zinc-200/40 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                        alt="Michael Reynolds"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Michael Reynolds</p>
                      <p className="text-[11px] text-zinc-500">Resident Lead (Unit 4B)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm transition-all">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm transition-all">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Performance mini footer */}
              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">Collection Rate</span>
                  <span className="text-2xl font-black tracking-tight text-zinc-900">96.4%</span>
                </div>
                {/* Tactile mini bars */}
                <div className="flex items-end gap-1.5 h-9">
                  {[40, 65, 50, 75, 90, 85, 95, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-full ${i >= 5 ? 'bg-purple-600' : 'bg-purple-200'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Smart Unit Interior & Automation Pod */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-full border border-zinc-200/50">
                  Bldg Sector C
                </span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200/40">
                  Submeter Monitored
                </span>
              </div>
              <button className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200/70 flex items-center justify-center text-zinc-600 transition-all">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </button>
            </div>

            {/* Smart Unit Photo with overlay pill */}
            <div className="relative rounded-[20px] overflow-hidden aspect-[16/10] bg-zinc-100 group shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"
                alt="Unit Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/70 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-zinc-800">Smart Lock: Engaged</span>
              </div>
            </div>

            {/* HVAC & Unit Actions Bar */}
            <div className="mt-4 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                  71°
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Ambient 71.4°F</p>
                  <p className="text-[11px] text-zinc-500">Eco-Comfort Active</p>
                </div>
              </div>
              <button className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all">
                Manage Unit
              </button>
            </div>
          </div>

          {/* Right Column: Gauges & Revenue Chart */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Submeter Dual Gauges */}
            <div className="grid grid-cols-2 gap-4">
              {/* Electricity Gauge */}
              <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">78.2%</span>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-lg font-black text-zinc-900">342 kWh</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Cap: 450 kWh</p>
                  {/* Gauge Arc Graphic */}
                  <div className="relative w-16 h-8 mx-auto mt-2 overflow-hidden">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-b-transparent border-l-transparent rounded-full rotate-45" />
                  </div>
                </div>
              </div>

              {/* Water Submeter Gauge */}
              <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Optimal</span>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-lg font-black text-zinc-900">1,840 G</p>
                  <p className="text-[10px] text-zinc-400 font-medium">1.2 gpm flow</p>
                  {/* Gauge Arc Graphic */}
                  <div className="relative w-16 h-8 mx-auto mt-2 overflow-hidden">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-b-transparent border-l-transparent rounded-full rotate-45" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gross Cashflow Curve Card */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-500">Portfolio Gross Inflows</span>
                  <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full">+12.4%</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">$48,650</h3>
                  <span className="text-[11px] text-zinc-400">Est. $52.1k</span>
                </div>
              </div>

              {/* Glowing tactile SVG wave */}
              <div className="mt-4 relative h-16 w-full">
                <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9333ea" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,45 C40,48 70,30 110,38 C150,45 170,15 200,10 L200,60 L0,60 Z"
                    fill="url(#purpleGrad)"
                  />
                  <path
                    d="M0,45 C40,48 70,30 110,38 C150,45 170,15 200,10"
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="200" cy="10" r="3.5" fill="#9333ea" className="animate-ping opacity-75" />
                  <circle cx="200" cy="10" r="3" fill="#ffffff" stroke="#9333ea" strokeWidth="2" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* ── MONITORED PORTFOLIO PODS (HORIZONTAL UNIT STRIP) ── */}
        <section className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900">Monitored Portfolio Pods</h3>
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded-full">5 Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {[
              { id: '#P-101', name: 'Oakridge', unit: 'Unit 4B', price: '$2,450', status: 'Occupied', color: 'text-emerald-700 bg-emerald-100/70', active: true },
              { id: '#P-102', name: 'Highland', unit: 'Pentproperty', price: '$3,100', status: 'Due in 2 days', color: 'text-purple-700 bg-purple-100/70', active: false },
              { id: '#P-103', name: 'Sunset Loft', unit: 'Studio 2', price: '$1,850', status: 'Turnover Clean', color: 'text-amber-700 bg-amber-100/70', active: false },
              { id: '#P-104', name: 'Metro Pod', unit: 'Unit 12', price: '$1,650', status: 'Occupied', color: 'text-emerald-700 bg-emerald-100/70', active: false },
              { id: '#P-105', name: 'Pinecrest', unit: 'Villa B', price: '$2,800', status: 'Pending Lease', color: 'text-indigo-700 bg-indigo-100/70', active: false },
            ].map((pod, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  pod.active
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                    : 'bg-zinc-50/80 hover:bg-white text-zinc-800 border-zinc-200/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold opacity-70 mb-1">
                  <span>{pod.id}</span>
                  <span>{pod.name}</span>
                </div>
                <div className="text-sm font-black tracking-tight">{pod.price} <span className="text-xs font-normal opacity-80">· {pod.unit}</span></div>
                <div className="mt-2.5">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${pod.active ? 'bg-zinc-800 text-purple-300' : pod.color}`}>
                    {pod.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM SECTION: BILLING CALENDAR DISPATCHER & INVOICE TABLE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Interactive Billing Dispatch Calendar */}
          <div className="lg:col-span-4 bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Billing Dispatch</h3>
                <p className="text-xs text-zinc-400">November Cycle Plotter</p>
              </div>
              <button className="text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200/70 px-3 py-1 rounded-full border border-zinc-200/50 transition-all">
                All Sectors ▾
              </button>
            </div>

            {/* Mini Calendar View */}
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-zinc-800">November 2025</span>
                <div className="flex gap-1">
                  <button className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-zinc-600 shadow-xs hover:bg-zinc-100">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-zinc-600 shadow-xs hover:bg-zinc-100">
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 mb-2">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>

              {/* Month Days Sample */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-700">
                <span className="text-zinc-300 py-1.5">28</span>
                <span className="text-zinc-300 py-1.5">29</span>
                <span className="text-zinc-300 py-1.5">30</span>
                <span className="py-1.5 rounded-full bg-purple-600 text-white font-bold shadow-xs">1</span>
                <span className="py-1.5">2</span>
                <span className="py-1.5">3</span>
                <span className="py-1.5">4</span>

                <span className="py-1.5 rounded-full bg-emerald-500 text-white font-bold">5</span>
                <span className="py-1.5">6</span>
                <span className="py-1.5">7</span>
                <span className="py-1.5">8</span>
                <span className="py-1.5">9</span>
                <span className="py-1.5 rounded-full bg-blue-500 text-white font-bold">10</span>
                <span className="py-1.5">11</span>

                <span className="py-1.5">12</span>
                <span className="py-1.5">13</span>
                <span className="py-1.5">14</span>
                <span className="py-1.5 rounded-full bg-purple-600 text-white font-bold">15</span>
                <span className="py-1.5">16</span>
                <span className="py-1.5">17</span>
                <span className="py-1.5">18</span>
              </div>
            </div>

            {/* Legend & Stats */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>Rent Collections Due</span>
                </div>
                <span className="font-bold text-zinc-900">32 Units</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Utility Submeter Reading</span>
                </div>
                <span className="font-bold text-zinc-900">48 Units</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Maintenance Check</span>
                </div>
                <span className="font-bold text-zinc-900">4 Units</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">On-Time Inflows</p>
                <p className="text-lg font-black text-zinc-900">94.8%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Active Leases</p>
                <p className="text-lg font-black text-purple-700">38 Total</p>
              </div>
            </div>
          </div>

          {/* Right: Tenant Invoices & Inflows Ledger */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">Tenant Invoices & Inflows</h3>
                <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full">264</span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-full border border-zinc-200/50">
                {['All (48)', 'Pending (6)', 'Assigned (30)', 'Cleared (12)'].map((tab) => {
                  const label = tab.split(' ')[0];
                  const isActive = activeTab === label;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(label)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                        isActive
                          ? 'bg-white text-zinc-900 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Bill ID</th>
                    <th className="pb-3">Assigned Tenant</th>
                    <th className="pb-3">Unit & Sector</th>
                    <th className="pb-3">Utility / Rent Item</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-xs font-medium text-zinc-700">
                  {[
                    {
                      id: '#BL-94810',
                      name: 'Edgar Humbert',
                      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                      unit: 'Oakridge 4B · West',
                      items: 'Rent + Power ($2,450)',
                      due: '12 Nov, 2025',
                      status: 'Delivered',
                      statusStyle: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/60',
                    },
                    {
                      id: '#BL-94811',
                      name: 'Craig Howard',
                      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
                      unit: 'Highland Villa · PH',
                      items: 'Water Submeter ($145)',
                      due: '15 Nov, 2025',
                      status: 'Picked Up',
                      statusStyle: 'bg-purple-100/80 text-purple-800 border-purple-200/60',
                    },
                    {
                      id: '#BL-94812',
                      name: 'Timothy Hines',
                      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
                      unit: 'Metro Studio · 12',
                      items: 'Full Bundle ($1,650)',
                      due: '18 Nov, 2025',
                      status: 'In Transit',
                      statusStyle: 'bg-blue-100/80 text-blue-800 border-blue-200/60',
                    },
                    {
                      id: '#BL-94813',
                      name: 'Lisa Collins',
                      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
                      unit: 'Pinecrest · Villa B',
                      items: 'Security Deposit ($2,800)',
                      due: '24 Nov, 2025',
                      status: 'In Transit',
                      statusStyle: 'bg-blue-100/80 text-blue-800 border-blue-200/60',
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 pl-2 font-mono text-[11px] font-bold text-zinc-900">{row.id}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src={row.avatar} alt={row.name} className="w-7 h-7 rounded-full object-cover" />
                          <span className="font-semibold text-zinc-900">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-zinc-500">{row.unit}</td>
                      <td className="py-3.5 font-medium text-zinc-800">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                          {row.items}
                        </span>
                      </td>
                      <td className="py-3.5 text-zinc-500">{row.due}</td>
                      <td className="py-3.5 pr-2 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold border ${row.statusStyle}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Controls */}
            <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-zinc-400 font-medium">Showing 1 to 4 of 264 automated tenant invoices</span>
              <div className="flex items-center gap-2.5">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200/70 text-zinc-700 text-xs font-semibold rounded-full border border-zinc-200/50 transition-all">
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
                <button className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-full shadow-sm shadow-purple-600/20 transition-all">
                  Generate Batch Bills
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
