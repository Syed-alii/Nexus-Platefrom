import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WalletCard } from '../../components/payments/WalletCard';
import { Loader, Plus, Minus, Send, History } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, historyRes] = await Promise.all([
        api.get('/payments/wallet'),
        api.get('/payments/history')
      ]);
      setWallet(walletRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async () => {
    const amount = window.prompt('Enter amount to deposit (USD):');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    try {
      await api.post('/payments/deposit', { amount: Number(amount) });
      toast.success('Deposit successful!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async () => {
    const amount = window.prompt('Enter amount to withdraw (USD):');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    try {
      await api.post('/payments/withdraw', { amount: Number(amount) });
      toast.success('Withdrawal successful!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  const handleTransfer = async () => {
    const receiverEmail = window.prompt('Enter the Receiver (Entrepreneur) Email:');
    if (!receiverEmail) return;

    const amount = window.prompt(`Enter amount to transfer to ${receiverEmail} (USD):`);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    try {
      await api.post('/payments/transfer', { 
        receiverEmail, 
        amount: Number(amount),
        description: 'Investment Funding'
      });
      toast.success('Transfer successful!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    }
  };

  if (isLoading && !wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-600">Accessing secure wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Transactions</h1>
        <p className="text-gray-600">Manage your investment funds and financial history</p>
      </div>

      {wallet && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <WalletCard 
              balance={wallet.balance} 
              totalDeposited={wallet.totalDeposited} 
              totalWithdrawn={wallet.totalWithdrawn} 
              totalTransferred={wallet.totalTransferred}
            />
            
            {user?.role === 'investor' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="w-full" 
                    onClick={handleDeposit}
                    leftIcon={<Plus size={18} />}
                  >
                    Deposit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleWithdraw}
                    leftIcon={<Minus size={18} />}
                  >
                    Withdraw
                  </Button>
                </div>
                <Button 
                  variant="secondary"
                  className="w-full" 
                  onClick={handleTransfer}
                  leftIcon={<Send size={18} />}
                >
                  Transfer Funds
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
                <History size={20} className="text-gray-400" />
              </CardHeader>
              <CardBody className="p-0">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 italic">No transactions recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {history.map((tx: any) => {
                          const isTransfer = tx.type === 'transfer';
                          
                          let colorClass = 'text-gray-900';
                          let sign = '';

                          if (tx.type === 'deposit') {
                            colorClass = 'text-green-600';
                            sign = '+';
                          } else if (tx.type === 'withdraw') {
                            colorClass = 'text-red-600';
                            sign = '-';
                          } else if (isTransfer) {
                            if (tx.sender === user?.id) {
                              colorClass = 'text-orange-600';
                              sign = '-';
                            } else {
                              colorClass = 'text-green-600';
                              sign = '+';
                            }
                          }

                          return (
                            <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="capitalize font-medium text-gray-900">
                                  {tx.type} {isTransfer && (tx.sender === user?.id ? '(Sent)' : '(Received)')}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold">
                                <span className={colorClass}>
                                  {sign}${Number(tx.amount).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-blue-600">
                                {tx.status}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
