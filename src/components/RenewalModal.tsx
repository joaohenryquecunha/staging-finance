import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  days: number;
  monthlyPrice: number;
  fullPrice: number;
  link: string;
}

interface RenewalModalProps {
  onClose: () => void;
  daysRemaining: number;
}

const plans: Plan[] = [
  {
    id: '30days',
    name: '30 dias de acesso',
    days: 30,
    monthlyPrice: 4.20,
    fullPrice: 49.90,
    link: '#' // Replace with actual payment link
  },
  {
    id: '180days',
    name: '180 dias de acesso',
    days: 180,
    monthlyPrice: 21.00,
    fullPrice: 249.90,
    link: '#' // Replace with actual payment link
  },
  {
    id: '365days',
    name: '1 ano de acesso',
    days: 365,
    monthlyPrice: 42.00,
    fullPrice: 499.90,
    link: '#' // Replace with actual payment link
  }
];

export const RenewalModal: React.FC<RenewalModalProps> = ({ onClose, daysRemaining }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan?.link) {
      window.location.href = plan.link;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-dark-secondary w-full max-w-3xl rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-dark-tertiary flex justify-between items-center sticky top-0 bg-dark-secondary z-10">
          <div>
            <h2 className="text-xl font-semibold text-gold-primary">
              Renovar Acesso
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {daysRemaining <= 3 
                ? `Seu acesso expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`
                : 'Escolha um plano para continuar usando o sistema'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gold-primary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-dark-tertiary rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-gold-primary shadow-gold-lg'
                    : 'hover:shadow-gold-sm'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-6 h-6 text-gold-primary" />
                    <span className="text-sm text-emerald-400 font-medium">
                      {plan.days} dias
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    {plan.name}
                  </h3>

                  <div className="flex-grow">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xl sm:text-2xl font-bold text-gold-primary">
                        12x R$ {plan.monthlyPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      ou R$ {plan.fullPrice.toFixed(2)} à vista
                    </p>
                  </div>

                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className="mt-4 w-full bg-gold-primary text-dark-primary px-4 py-3 rounded-lg hover:bg-gold-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard size={20} />
                    <span>Assinar Agora</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-400 text-center mt-6">
            Pagamento 100% seguro • Satisfação garantida • Suporte exclusivo
          </p>
        </div>
      </div>
    </div>
  );
}