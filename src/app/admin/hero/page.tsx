"use client";

import React from "react";
import Link from "next/link";
import HeroList from "./HeroList";

export default function AdminHeroPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy">Hero Slider</h2>
        <Link href="/admin/hero/new" className="px-5 py-2.5 rounded-full text-white text-sm font-bold" style={{ backgroundColor: '#0F1F3D' }}>+ Add New Slide</Link>
      </div>
      <HeroList />
    </div>
  );
}
