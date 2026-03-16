'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';

interface PrepTimerProps {
  orderId: string;
  placedAt: Date;
  status: 'new' | 'preparing' | 'ready';
  showLabel?: boolean;
}

/**
 * SLA Targets (per order type):
 * - Delivery: 30 minutes max
 * - Pickup: 20 minutes max
 * - Dine-in: 25 minutes max
 */

export default function PrepTimer({
  orderId,
  placedAt,
  status,
  showLabel = true,
}: PrepTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - placedAt.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [placedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  // SLA thresholds (in minutes)
  const getSLAStatus = () => {
    if (minutes < 20) return 'success';
    if (minutes < 30) return 'warning';
    return 'critical';
  };

  const getColorClasses = () => {
    const sla = getSLAStatus();
    switch (sla) {
      case 'success':
        return 'text-green-400 bg-green-900/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'critical':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-700/30';
    }
  };

  const getBorderClasses = () => {
    const sla = getSLAStatus();
    switch (sla) {
      case 'success':
        return 'border-green-500';
      case 'warning':
        return 'border-yellow-500';
      case 'critical':
        return 'border-red-500';
      default:
        return 'border-gray-600';
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className={`rounded-lg border-2 p-3 ${getColorClasses()} ${getBorderClasses()}`}>
      <div className="flex items-center gap-2 mb-2">
        <FiClock size={16} />
        {showLabel && <span className="text-xs font-bold uppercase">Prep Time</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black tabular-nums">
          {formatTime(minutes, seconds)}
        </span>
        <span className="text-xs text-gray-400">min</span>
      </div>

      {/* SLA Indicator */}
      <div className="mt-3 pt-3 border-t border-current/20 text-xs">
        {getSLAStatus() === 'success' && (
          <p className="text-green-300">✓ On track</p>
        )}
        {getSLAStatus() === 'warning' && (
          <p className="text-yellow-300">⚠ Getting close</p>
        )}
        {getSLAStatus() === 'critical' && (
          <div className="flex items-center gap-1">
            <FiAlertTriangle size={12} />
            <p className="text-red-300 font-bold">ORDER LATE!</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            getSLAStatus() === 'success'
              ? 'bg-green-500'
              : getSLAStatus() === 'warning'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${Math.min((minutes / 30) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Extended Timer Component for Board Display
 * Shows compact timer suitable for order cards
 */

export function CompactPrepTimer({
  placedAt,
  isCritical,
  className = '',
}: {
  placedAt: Date;
  isCritical?: boolean;
  className?: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - placedAt.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [placedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const formatTime = (minutes: number, seconds: number) => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isLate = minutes > 5;

  return (
    <div
      className={`flex items-center gap-2 font-mono ${
        isLate
          ? 'text-red-400 font-bold animate-pulse'
          : 'text-gray-300'
      } ${className}`}
    >
      <FiClock size={14} />
      <span>{formatTime(minutes, seconds)}</span>
      {isLate && <span className="text-red-500 text-sm">!</span>}
    </div>
  );
}
