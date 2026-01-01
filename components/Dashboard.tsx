
'use client';

import React, { useMemo } from 'react';
import { Project, FinancialSummary } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardProps {
  projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const summary: FinancialSummary = useMemo(() => {
    return projects.reduce((acc, curr) => ({
      totalBudget: acc.totalBudget + curr.budgetAmount,
      totalAdvance: acc.totalAdvance + curr.advanceAmount,
      totalExpense: acc.totalExpense + curr.expenseAmount,
      totalBalance: acc.totalBalance + curr.balanceAmount,
    }), {
      totalBudget: 0,
      totalAdvance: 0,
      totalExpense: 0,
      totalBalance: 0,
    });
  }, [projects]);

  const stats = [
    { label: 'Total Budget Amount', value: summary.totalBudget, color: 'text-blue-600', icon: 'fa-wallet', bg: 'bg-blue-50' },
    { label: 'Total Advance Amount', value: summary.totalAdvance, color: 'text-purple-600', icon: 'fa-hand-holding-usd', bg: 'bg-purple-50' },
    { label: 'Total Expense Amount', value: summary.totalExpense, color: 'text-red-600', icon: 'fa-receipt', bg: 'bg-red-50' },
    { label: 'Balance Amount', value: summary.totalBalance, color: 'text-emerald-600', icon: 'fa-scale-balanced', bg: 'bg-emerald-50' },
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);

  const chartData = [
    { name: 'Advance', value: summary.totalAdvance, color: '#9333ea' },
    { name: 'Expense', value: summary.totalExpense, color: '#dc2626' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Overview of project financials and performance across the portfolio.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-slate-600">System Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:scale-[1.02]">
            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>{formatCurrency(stat.value)}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Financial Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Budget', amount: summary.totalBudget },
                { name: 'Advance', amount: summary.totalAdvance },
                { name: 'Expense', amount: summary.totalExpense },
                { name: 'Balance', amount: summary.totalBalance }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value || 0)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  { [0,1,2,3].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : index === 1 ? '#9333ea' : index === 2 ? '#dc2626' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Budget Utilisation</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value || 0)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-600"></div> Advance</span>
                 <span className="font-semibold">{formatCurrency(summary.totalAdvance)}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600"></div> Expense</span>
                 <span className="font-semibold">{formatCurrency(summary.totalExpense)}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
