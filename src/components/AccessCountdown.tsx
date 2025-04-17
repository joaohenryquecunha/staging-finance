import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface AccessCountdownProps {
  accessDuration: number; // Duration in seconds
  createdAt: string;
  onRenew: () => void;
}

export const AccessCountdown: React.FC<AccessCountdownProps> = ({ 
  accessDuration, 
  createdAt, 
  onRenew 
}) => {
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const calculateDaysRemaining = () => {
      const startTime = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remainingSeconds = accessDuration - elapsedSeconds;
      return Math.max(0, Math.floor(remainingSeconds / 86400)); // Convert seconds to days
    };

    setDaysRemaining(calculateDaysRemaining());

    const interval = setInterval(() => {
      setDaysRemaining(calculateDaysRemaining());
    }, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [accessDuration, createdAt]);

  const getStatusColor = () => {
    if (daysRemaining <= 3) return 'text-red-400';
    if (daysRemaining <= 7) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Clock size={20} className={getStatusColor()} />
        <span className={`font-medium ${getStatusColor()}`}>
          {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
        </span>
      </div>
      <button
        onClick={onRenew}
        className="px-4 py-2 bg-gold-primary text-dark-primary rounded-lg hover:bg-gold-hover transition-colors text-sm font-medium"
      >
        Renovar Acesso
      </button>
    </div>
  );
}