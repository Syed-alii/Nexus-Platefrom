import React from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface WalletCardProps {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalTransferred: number;
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance, totalDeposited, totalWithdrawn, totalTransferred }) => {
  return (
    <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
      <CardHeader>
        <h2 className="text-lg font-medium text-white">Your Wallet</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-primary-100">Current Balance</p>
            <h3 className="text-3xl font-bold">${Number(balance).toLocaleString()}</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 pt-4 border-t border-primary-500">
            <div className="flex justify-between items-center">
              <p className="text-xs text-primary-200 uppercase tracking-wider">Total Deposited</p>
              <p className="text-md font-semibold text-green-300"> +${Number(totalDeposited).toLocaleString()} </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-primary-200 uppercase tracking-wider">Total Withdrawn</p>
              <p className="text-md font-semibold text-red-300"> -${Number(totalWithdrawn).toLocaleString()} </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-primary-200 uppercase tracking-wider">Total Transferred</p>
              <p className="text-md font-semibold text-orange-200"> -${Number(totalTransferred).toLocaleString()} </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
