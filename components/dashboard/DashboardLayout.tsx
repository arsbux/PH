import React from 'react';

interface DashboardLayoutProps {
    leftColumn: React.ReactNode;
    centerColumn: React.ReactNode;
    rightColumn: React.ReactNode;
}

export function DashboardLayout({ leftColumn, centerColumn, rightColumn }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center px-6 justify-between bg-[#0a0a0a] z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-lg">
                        H
                    </div>
                    <span className="font-bold text-xl tracking-tight">Hunted.Space</span>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                    <a href="#" className="text-white hover:text-orange-400 transition-colors">Best</a>
                    <a href="#" className="hover:text-orange-400 transition-colors">Top</a>
                    <a href="#" className="hover:text-orange-400 transition-colors">Favorites</a>
                    <a href="#" className="hover:text-orange-400 transition-colors">Calendar</a>
                    <a href="#" className="hover:text-orange-400 transition-colors">Stats</a>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="text-sm font-medium text-orange-500 hover:text-orange-400">Submit</button>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-64px)]">

                {/* Left Column: Top Products List */}
                <aside className="col-span-3 border-r border-white/10 overflow-y-auto p-4 bg-[#0a0a0a]">
                    {leftColumn}
                </aside>

                {/* Center Column: Main Visualization */}
                <section className="col-span-6 overflow-y-auto p-6 bg-[#0a0a0a] relative">
                    {centerColumn}
                </section>

                {/* Right Column: Daily Stats */}
                <aside className="col-span-3 border-l border-white/10 overflow-y-auto p-4 bg-[#0a0a0a]">
                    {rightColumn}
                </aside>

            </main>
        </div>
    );
}
