'use client';

import { useState } from 'react';
import { Loader2, Terminal, Calendar, Play, CheckCircle, AlertCircle, List } from 'lucide-react';

interface ProcessedItem {
    name: string;
    votes: number;
    niche: string;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // New state for 2-step process
    const [checkMode, setCheckMode] = useState(false);
    const [availableCount, setAvailableCount] = useState<number | null>(null);
    const [limit, setLimit] = useState<number>(10);
    const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'producthuntr') {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password');
        }
    };

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const checkAvailability = async () => {
        setIsLoading(true);
        setCheckMode(true);
        setAvailableCount(null);
        addLog(`Checking availability for ${selectedDate}...`);

        try {
            const res = await fetch('/api/admin/process-day', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDate, password: 'producthuntr', action: 'check' }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to check');

            setAvailableCount(data.count);
            setLimit(data.count); // Default to max
            addLog(`Found ${data.count} launches available for ${selectedDate}`);
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
            setCheckMode(false);
        } finally {
            setIsLoading(false);
        }
    };

    const processDate = async (dateStr: string, limitVal?: number) => {
        setIsLoading(true);
        addLog(`Starting processing for ${dateStr} (Limit: ${limitVal || 'All'})...`);

        try {
            const res = await fetch('/api/admin/process-day', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: dateStr,
                    password: 'producthuntr',
                    action: 'process',
                    limit: limitVal
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to process');
            }

            addLog(`✅ Completed ${dateStr}: ${data.stats.processed} processed, ${data.stats.skipped} skipped, ${data.stats.errors} errors`);

            if (data.stats.processedItems) {
                setProcessedItems(prev => [...data.stats.processedItems, ...prev]);
            }

            // Add detailed logs from server if available
            if (data.stats.logs && data.stats.logs.length > 0) {
                data.stats.logs.forEach((log: string) => addLog(`  > ${log}`));
            }

            // Reset check mode
            setCheckMode(false);
            setAvailableCount(null);

        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcessSelected = () => {
        // This function is now replaced by the two-step process
        // It will trigger the checkAvailability first
        checkAvailability();
    };

    const handleProcessRecent = async () => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await processDate(today.toISOString().split('T')[0]);
        await processDate(yesterday.toISOString().split('T')[0]);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
                    <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">Admin Access</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 mb-4 focus:outline-none focus:border-emerald-500 text-white"
                    />
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Terminal className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold">ProductHuntr Admin</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        System Status: <span className="text-emerald-400">Online</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Quick Actions Card */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            Quick Actions
                        </h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Trigger processing for the most recent launches immediately.
                        </p>
                        <button
                            onClick={handleProcessRecent}
                            disabled={isLoading || checkMode}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading && !checkMode ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            Process Today & Yesterday
                        </button>
                    </div>

                    {/* Custom Date Card */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg lg:col-span-2">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            Custom Date Processing
                        </h2>

                        {!checkMode ? (
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-400 mb-1">Select Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 text-white"
                                    />
                                </div>
                                <button
                                    onClick={handleProcessSelected}
                                    disabled={isLoading}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-all h-[42px]"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Check Availability'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="bg-gray-950/50 p-4 rounded-lg border border-gray-800 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-400">Found on {selectedDate}</div>
                                        <div className="text-2xl font-bold text-white">{availableCount} Launches</div>
                                    </div>
                                    <button
                                        onClick={() => setCheckMode(false)}
                                        className="text-xs text-gray-500 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-400 mb-1">How many to process? (Top voted first)</label>
                                        <input
                                            type="number"
                                            value={limit}
                                            onChange={(e) => setLimit(Number(e.target.value))}
                                            max={availableCount || 100}
                                            min={1}
                                            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-white"
                                        />
                                    </div>
                                    <button
                                        onClick={() => processDate(selectedDate, limit)}
                                        disabled={isLoading}
                                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-all h-[42px] flex items-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                        Start Processing
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Console Output */}
                    <div className="bg-black rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col h-[500px]">
                        <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between shrink-0">
                            <span className="text-xs font-mono text-gray-400">Console Output</span>
                            <button
                                onClick={() => setLogs([])}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto font-mono text-sm space-y-2 flex-1">
                            {logs.length === 0 ? (
                                <div className="text-gray-600 italic">Ready to process...</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={`break-words ${log.includes('❌') ? 'text-red-400' :
                                            log.includes('✅') ? 'text-emerald-400' :
                                                'text-gray-300'
                                        }`}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Processed Items Table */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col h-[500px]">
                        <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-semibold text-gray-200">Processed Items</span>
                            </div>
                            <span className="text-xs text-gray-500">{processedItems.length} items</span>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {processedItems.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No items processed yet in this session.
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-950/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3">Votes</th>
                                            <th className="px-4 py-3">Niche</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {processedItems.map((item, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-gray-400">{item.votes}</td>
                                                <td className="px-4 py-3 text-emerald-400">{item.niche}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
