import React, { useState, useEffect } from 'react';
import { getAllUsers, approveUser, disapproveUser, updateUserAccess } from '../contexts/AuthContext';
import { CheckCircle, XCircle, UserCheck, UserX, Search, LogOut, Users, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO, differenceInDays, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserData {
  uid: string;
  username: string;
  isAdmin: boolean;
  isApproved: boolean;
  accessDuration?: number;
  accessExpirationDate?: string;
  createdAt?: string;
  profile?: {
    cpf: string;
    phone: string;
  };
}

interface AccessModalProps {
  user: UserData;
  onClose: () => void;
  onSave: (userId: string, accessDuration: number, expirationDate: string) => Promise<void>;
}

const AccessModal: React.FC<AccessModalProps> = ({ user, onClose, onSave }) => {
  const [days, setDays] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [customDate, setCustomDate] = useState(
    format(addDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [useCustomDate, setUseCustomDate] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const expirationDate = useCustomDate
        ? new Date(customDate).toISOString()
        : addDays(new Date(), parseInt(days)).toISOString();
      
      // Calculate duration in seconds
      const durationInSeconds = useCustomDate
        ? Math.floor((new Date(customDate).getTime() - new Date().getTime()) / 1000)
        : parseInt(days) * 24 * 60 * 60;

      await onSave(user.uid, durationInSeconds, expirationDate);
      onClose();
    } catch (error) {
      console.error('Error updating access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-secondary rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-dark-tertiary">
          <h2 className="text-lg font-semibold text-gold-primary">
            Definir Período de Acesso
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {user.username}
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="useCustomDate"
              checked={useCustomDate}
              onChange={(e) => setUseCustomDate(e.target.checked)}
              className="rounded bg-dark-tertiary border-dark-tertiary text-gold-primary focus:ring-gold-primary"
            />
            <label htmlFor="useCustomDate" className="text-sm text-gray-300">
              Definir data específica
            </label>
          </div>

          {useCustomDate ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Expiração
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full rounded-lg bg-dark-tertiary border-dark-tertiary text-gray-200 p-3 focus:ring-2 focus:ring-gold-primary focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dias de Acesso
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="1"
                className="w-full rounded-lg bg-dark-tertiary border-dark-tertiary text-gray-200 p-3 focus:ring-2 focus:ring-gold-primary focus:border-transparent"
                placeholder="Ex: 30"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gold-primary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || (!useCustomDate && !days) || (useCustomDate && !customDate)}
              className="bg-gold-primary text-dark-primary px-4 py-2 rounded-lg hover:bg-gold-hover transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers as UserData[]);
    };
    fetchUsers();
  }, []);

  const handleApproveUser = async (uid: string) => {
    await approveUser(uid);
    const updatedUsers = await getAllUsers();
    setUsers(updatedUsers as UserData[]);
  };

  const handleDisapproveUser = async (uid: string) => {
    await disapproveUser(uid);
    const updatedUsers = await getAllUsers();
    setUsers(updatedUsers as UserData[]);
  };

  const handleUpdateAccess = async (userId: string, accessDuration: number, expirationDate: string) => {
    await updateUserAccess(userId, accessDuration, expirationDate);
    const updatedUsers = await getAllUsers();
    setUsers(updatedUsers as UserData[]);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isApproved).length;
  const inactiveUsers = users.filter(user => !user.isApproved).length;
  const trialUsers = users.filter(user => {
    if (!user.accessExpirationDate || user.isAdmin) return false;
    return new Date(user.accessExpirationDate) > new Date();
  }).length;

  const getAccessStatus = (user: UserData) => {
    if (user.isAdmin) return { text: 'Acesso permanente', color: 'text-emerald-400' };
    if (!user.accessExpirationDate) return { text: 'Sem período definido', color: 'text-gray-400' };

    const expirationDate = new Date(user.accessExpirationDate);
    const now = new Date();
    
    if (expirationDate <= now) {
      return { text: 'Período expirado', color: 'text-red-400' };
    }

    const daysRemaining = differenceInDays(expirationDate, now);
    
    if (daysRemaining <= 3) {
      return { text: `${daysRemaining} dias restantes`, color: 'text-red-400' };
    } else if (daysRemaining <= 7) {
      return { text: `${daysRemaining} dias restantes`, color: 'text-amber-400' };
    } else {
      return { text: `${daysRemaining} dias restantes`, color: 'text-emerald-400' };
    }
  };

  const getAccountAge = (createdAt?: string) => {
    if (!createdAt) return 'Data desconhecida';
    return formatDistanceToNow(parseISO(createdAt), { locale: ptBR, addSuffix: true });
  };

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-dark-tertiary rounded-lg p-4 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-2xl font-semibold text-gold-primary mt-1">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-dark-secondary text-gold-primary">
        {icon}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-primary p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark-secondary rounded-xl shadow-gold-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gold-primary">Gerenciamento de Usuários</h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-dark-tertiary text-gray-300 rounded-lg hover:text-gold-primary transition-colors"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg bg-dark-tertiary border-dark-tertiary text-gray-200 pl-10 pr-4 py-2 focus:ring-2 focus:ring-gold-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total de Usuários"
              value={totalUsers}
              icon={<Users size={24} />}
            />
            <StatCard
              title="Usuários Ativos"
              value={activeUsers}
              icon={<UserCheck size={24} />}
            />
            <StatCard
              title="Usuários Inativos"
              value={inactiveUsers}
              icon={<UserX size={24} />}
            />
            <StatCard
              title="Em Período de Teste"
              value={trialUsers}
              icon={<Clock size={24} />}
            />
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.uid}
                className="bg-dark-tertiary rounded-lg p-4"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-200 font-medium">{user.username}</p>
                      {user.isAdmin ? (
                        <span className="text-xs bg-gold-primary/20 text-gold-primary px-2 py-1 rounded-full">
                          Administrador
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                          Usuário
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-gray-400">Criado: </span>
                        <span className="text-gray-300">{getAccountAge(user.createdAt)}</span>
                      </div>
                      {!user.isAdmin && (
                        <div className={`flex items-center gap-1 text-sm ${getAccessStatus(user).color}`}>
                          <span>•</span>
                          <span>{getAccessStatus(user).text}</span>
                        </div>
                      )}
                    </div>
                    {user.profile && (
                      <div className="mt-2 text-sm text-gray-400">
                        <span>CPF: {user.profile.cpf} • </span>
                        <span>Telefone: {user.profile.phone}</span>
                      </div>
                    )}
                  </div>

                  {!user.isAdmin && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-gray-400 hover:text-gold-primary hover:bg-dark-secondary rounded-lg transition-colors"
                        title="Definir período de acesso"
                      >
                        <Calendar size={20} />
                      </button>
                      <div className="flex items-center">
                        {user.isApproved ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="ml-2 text-sm text-gray-400">
                          {user.isApproved ? 'Aprovado' : 'Pendente'}
                        </span>
                      </div>
                      {!user.isApproved ? (
                        <button
                          onClick={() => handleApproveUser(user.uid)}
                          className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                          title="Aprovar usuário"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDisapproveUser(user.uid)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Revogar aprovação"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <p className="text-center text-gray-400 py-4">
                {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário registrado além do administrador'}
              </p>
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <AccessModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleUpdateAccess}
        />
      )}
    </div>
  );
};