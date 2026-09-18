import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { Radio, CheckCircle2, XCircle, RefreshCw, Cpu, Server, Wifi } from 'lucide-react';

export const ProviderStatusPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProviderStatus();
      setHealthData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Radio className="w-8 h-8 text-emerald-400 animate-pulse" />
            <span>Provider Diagnostic</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time status of backend API, active music providers, and system capabilities.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {healthData && (
        <div className="space-y-6">
          {/* Active Provider Info */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-linova-primary" />
              <span>Music Provider Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[11px] uppercase font-bold text-gray-400 block">Active Provider</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block capitalize">
                  {healthData.activeProvider} Provider
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[11px] uppercase font-bold text-gray-400 block">Configured In Env</span>
                <span className="text-base font-bold text-gray-200 mt-1 block capitalize">
                  {healthData.configuredProvider}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[11px] uppercase font-bold text-gray-400 block">Fallback Status</span>
                <span className={`text-base font-bold mt-1 block ${healthData.isFallback ? 'text-amber-400' : 'text-gray-200'}`}>
                  {healthData.isFallback ? 'Active Fallback' : 'Primary Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>Provider Capabilities</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {healthData.capabilities && Object.entries(healthData.capabilities).map(([cap, enabled]) => (
                <div key={cap} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs font-semibold text-gray-300 capitalize">{cap}</span>
                  {enabled ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
