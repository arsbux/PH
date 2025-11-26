import React from 'react';

interface HuntedSpaceLayoutProps {
    leftSidebar: React.ReactNode;
    centerContent: React.ReactNode;
    rightSidebar: React.ReactNode;
    centerNav?: React.ReactNode; // New prop for centered navigation
}

export function HuntedSpaceLayout({ leftSidebar, centerContent, rightSidebar, centerNav }: HuntedSpaceLayoutProps) {
    return (
        <>
            <style jsx global>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
            <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-sm flex-shrink-0 z-50">
                    <div className="h-full px-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 w-[200px]">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                P
                            </div>
                            <span className="font-bold text-lg">Product Huntr</span>
                        </div>

                        <div className="flex-1 flex justify-center">
                            {centerNav}
                        </div>

                        <div className="w-[200px] flex justify-end">
                            <button className="text-sm font-medium text-orange-500 hover:text-orange-400 px-4 py-2">
                                Submit
                            </button>
                        </div>
                    </div>
                </header>

                {/* 3-Column Grid */}
                <div className="flex-1 grid grid-cols-12 overflow-hidden">
                    {/* Left Sidebar - Fixed, No Scroll */}
                    <aside className="col-span-3 border-r border-white/10 bg-black overflow-y-auto custom-scrollbar">
                        {leftSidebar}
                    </aside>

                    {/* Center Content - Scrollable */}
                    <main className="col-span-6 bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
                        {centerContent}
                    </main>

                    {/* Right Sidebar - Fixed, No Scroll */}
                    <aside className="col-span-3 border-l border-white/10 bg-black overflow-y-auto custom-scrollbar">
                        {rightSidebar}
                    </aside>
                </div>
            </div>
        </>
    );
}
