import React, { useState, useEffect } from 'react';
import { useFinanceData } from './hooks/useFinanceData.ts';
import Dashboard from './components/Dashboard.tsx';
import MainBalance from './components/MainBalance.tsx';
import Transactions from './components/Transactions.tsx';
import MonthlyRecap from './components/MonthlyRecap.tsx';
import Allocation from './components/Allocation.tsx';
import Categories from './components/Categories.tsx';
import { ChartPieIcon, TableCellsIcon, BanknotesIcon, CalendarDaysIcon, ScaleIcon, TagIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { TransactionType, TransactionSource } from './types.ts';

type Tab = 'dashboard' | 'saldo' | 'mutasi' | 'alokasi' | 'rekap' | 'kategori';
export interface InitialTransactionData {
  type: TransactionType;
  amount: string;
  category: string;
  description: string;
  date: string;
  source: TransactionSource;
}


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [initialTransaction, setInitialTransaction] = useState<InitialTransactionData | null>(null);
  const financeData = useFinanceData();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Protocol Handler Logic
  useEffect(() => {
    if ('launchQueue' in window) {
      (window as any).launchQueue.setConsumer((launchParams: any) => {
        if (!launchParams.files.length) {
          const urlString = launchParams.targetURL || (new URLSearchParams(window.location.search)).get('url');
          if (urlString) {
            const url = new URL(urlString);
            if (url.protocol === 'web+finance:') {
              const path = url.pathname;
              if (path.includes('/transaction/add')) {
                const params = url.searchParams;
                const data: InitialTransactionData = {
                  type: params.get('type') === 'Masuk' ? TransactionType.INCOME : TransactionType.EXPENSE,
                  amount: params.get('amount') || '',
                  category: params.get('category') || '',
                  description: params.get('description') || '',
                  date: params.get('date') || new Date().toISOString().split('T')[0],
                  source: params.get('source') === TransactionSource.STUDIO ? TransactionSource.STUDIO : TransactionSource.SIDE_JOB,
                };
                setInitialTransaction(data);
                setActiveTab('mutasi');
              }
            }
          }
        }
      });
    }
  }, []);

  const handleInitialDataConsumed = () => {
    setInitialTransaction(null);
    // Clean up the URL in the address bar if it was used for the launch
    if (window.history.replaceState) {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
  };


  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartPieIcon },
    { id: 'saldo', name: 'Saldo Utama', icon: BanknotesIcon },
    { id: 'mutasi', name: 'Mutasi', icon: TableCellsIcon },
    { id: 'alokasi', name: 'Alokasi', icon: ScaleIcon },
    { id: 'rekap', name: 'Rekap Bulanan', icon: CalendarDaysIcon },
    { id: 'kategori', name: 'Kategori', icon: TagIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard financeData={financeData} theme={theme} />;
      case 'saldo':
        return <MainBalance 
                  assets={financeData.assets} 
                  totalAssets={financeData.totalAssets} 
                  updateAllAssets={financeData.updateAllAssets}
                  lastUpdated={financeData.assetUpdateDate}
                />;
      case 'mutasi':
        return <Transactions 
                  sideJobTransactions={financeData.sideJobTransactions} 
                  studioTransactions={financeData.studioTransactions} 
                  addTransaction={financeData.addTransaction}
                  deleteTransaction={financeData.deleteTransaction}
                  updateTransaction={financeData.updateTransaction}
                  categories={financeData.categories}
                  initialData={initialTransaction}
                  onInitialDataConsumed={handleInitialDataConsumed}
                />;
      case 'alokasi':
        return <Allocation 
                  allocations={financeData.allocations} 
                  totalAssets={financeData.totalAssets} 
                  updateAllocation={financeData.updateAllocation}
                />;
      case 'rekap':
        return <MonthlyRecap monthlyRecap={financeData.monthlyRecap} />;
      case 'kategori':
        return <Categories 
                  categories={financeData.categories}
                  addCategory={financeData.addCategory}
                  updateCategory={financeData.updateCategory}
                  deleteCategory={financeData.deleteCategory}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Personal Finance Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Your complete financial overview, inspired by Google Sheets.</p>
          <button 
            onClick={toggleTheme} 
            className="absolute top-0 right-0 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-800" />}
          </button>
        </header>

        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center flex-grow sm:flex-grow-0 gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </nav>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;