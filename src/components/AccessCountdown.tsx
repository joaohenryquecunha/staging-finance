import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface AccessCountdownProps {
  accessDuration: number;
  createdAt: string;
  onRenew: () => void;
  compact?: boolean;
}

export const AccessCountdown: React.FC<AccessCountdownProps> = ({ 
  accessDuration, 
  createdAt, 
  onRenew,
  compact = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const calculateDaysRemaining = () => {
      // Convert accessDuration from seconds to days
      const totalDays = Math.floor(accessDuration / (24 * 60 * 60));
      return totalDays;
    };

    setDaysRemaining(calculateDaysRemaining());
  }, [accessDuration, createdAt]);

  const getStatusColor = () => {
    if (daysRemaining <= 3) return 'text-red-400';
    if (daysRemaining <= 7) return 'text-amber-400';
    return 'text-emerald-400';
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`p-2 rounded-lg hover:bg-dark-tertiary transition-colors ${getStatusColor()}`}
          title="Tempo de acesso restante"
        >
          <Clock size={20} />
        </button>

        {showDetails && (
          <div className="absolute top-full right-0 mt-2 bg-dark-secondary rounded-lg shadow-gold-lg p-4 min-w-[200px] z-50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className={getStatusColor()} />
                <span className={`font-medium ${getStatusColor()}`}>
                  {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} de acesso
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRenew();
                  setShowDetails(false);
                }}
                className="w-full px-4 py-2 bg-gold-primary text-dark-primary rounded-lg hover:bg-gold-hover transition-colors text-sm font-medium"
              >
                Renovar Acesso
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Clock size={20} className={getStatusColor()} />
        <span className={`font-medium ${getStatusColor()}`}>
          {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} de acesso
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
};