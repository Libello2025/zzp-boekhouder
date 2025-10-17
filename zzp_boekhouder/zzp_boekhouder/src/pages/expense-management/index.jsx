import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import QuickActionWidget from '../../components/ui/QuickActionWidget';
import AIChatWidget from '../../components/ui/AIChatWidget';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseTable from './components/ExpenseTable';
import ExpenseModal from './components/ExpenseModal';
import ExpenseStats from './components/ExpenseStats';
import ReceiptViewer from './components/ReceiptViewer';

const ExpenseManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Mock expense data
  const mockExpenses = [
  {
    id: 1,
    date: '2024-10-15',
    description: 'Laptop Dell XPS 13',
    amount: 1299.00,
    category: 'equipment',
    categoryName: 'Apparatuur',
    vatRate: 21,
    supplier: 'Dell Nederland',
    project: 'website-redesign',
    notes: 'Nieuwe laptop voor ontwikkelingswerk',
    receipt: "https://images.unsplash.com/photo-1657731739881-66e8335ffece"
  },
  {
    id: 2,
    date: '2024-10-14',
    description: 'Treinreis Amsterdam - Utrecht',
    amount: 8.90,
    category: 'travel',
    categoryName: 'Reiskosten',
    vatRate: 21,
    supplier: 'Nederlandse Spoorwegen',
    project: 'consulting',
    notes: 'Klantbezoek RetailCo',
    receipt: "https://images.unsplash.com/photo-1624095433993-c057154274ef"
  },
  {
    id: 3,
    date: '2024-10-13',
    description: 'Google Ads campagne',
    amount: 250.00,
    category: 'marketing',
    categoryName: 'Marketing & Reclame',
    vatRate: 21,
    supplier: 'Google Ireland Limited',
    project: 'mobile-app',
    notes: 'Advertentiecampagne voor app launch',
    receipt: null
  },
  {
    id: 4,
    date: '2024-10-12',
    description: 'Microsoft Office 365 licentie',
    amount: 69.00,
    category: 'software',
    categoryName: 'Software & Licenties',
    vatRate: 21,
    supplier: 'Microsoft Nederland',
    project: '',
    notes: 'Jaarlijkse licentie verlenging',
    receipt: "https://images.unsplash.com/photo-1623295080944-9ba74d587748"
  },
  {
    id: 5,
    date: '2024-10-11',
    description: 'Kantoorbenodigdheden',
    amount: 45.67,
    category: 'office',
    categoryName: 'Kantoorbenodigdheden',
    vatRate: 21,
    supplier: 'Office Depot',
    project: '',
    notes: 'Pennen, papier, en andere kantoorspullen',
    receipt: "https://images.unsplash.com/photo-1629576097091-414c451c2cce"
  },
  {
    id: 6,
    date: '2024-10-10',
    description: 'Online cursus React Advanced',
    amount: 89.99,
    category: 'training',
    categoryName: 'Training & Cursussen',
    vatRate: 21,
    supplier: 'Udemy',
    project: 'website-redesign',
    notes: 'Professionele ontwikkeling',
    receipt: null
  },
  {
    id: 7,
    date: '2024-10-09',
    description: 'Zakenlunch met klant',
    amount: 67.50,
    category: 'meals',
    categoryName: 'Maaltijden',
    vatRate: 9,
    supplier: 'Restaurant Central',
    project: 'branding',
    notes: 'Bespreking project requirements',
    receipt: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd"
  },
  {
    id: 8,
    date: '2024-10-08',
    description: 'Elektriciteitsrekening kantoor',
    amount: 156.78,
    category: 'utilities',
    categoryName: 'Nutsvoorzieningen',
    vatRate: 21,
    supplier: 'Vattenfall',
    project: '',
    notes: 'Maandelijkse energiekosten',
    receipt: "https://images.unsplash.com/photo-1664277072376-d1aa64b797b3"
  }];


  useEffect(() => {
    setExpenses(mockExpenses);
    setFilteredExpenses(mockExpenses);
  }, []);

  const handleFiltersChange = (filters) => {
    let filtered = [...expenses];

    // Search filter
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter((expense) =>
      expense?.description?.toLowerCase()?.includes(searchTerm) ||
      expense?.supplier?.toLowerCase()?.includes(searchTerm) ||
      expense?.categoryName?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Date range filter
    if (filters?.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered?.filter((expense) => {
        const expenseDate = new Date(expense.date);

        switch (filters?.dateRange) {
          case 'today':
            return expenseDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return expenseDate >= weekAgo;
          case 'month':
            return expenseDate?.getMonth() === now?.getMonth() &&
            expenseDate?.getFullYear() === now?.getFullYear();
          case 'quarter':
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            return expenseDate >= quarterStart;
          case 'year':
            return expenseDate?.getFullYear() === now?.getFullYear();
          default:
            return true;
        }
      });
    }

    // Category filter
    if (filters?.category !== 'all') {
      filtered = filtered?.filter((expense) => expense?.category === filters?.category);
    }

    // Project filter
    if (filters?.project !== 'all') {
      if (filters?.project === 'no-project') {
        filtered = filtered?.filter((expense) => !expense?.project);
      } else {
        filtered = filtered?.filter((expense) => expense?.project === filters?.project);
      }
    }

    // Supplier filter
    if (filters?.supplier !== 'all') {
      filtered = filtered?.filter((expense) =>
      expense?.supplier?.toLowerCase()?.includes(filters?.supplier?.toLowerCase())
      );
    }

    setFilteredExpenses(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }

    const sorted = [...filteredExpenses]?.sort((a, b) => {
      if (key === 'amount') {
        return direction === 'asc' ? a?.[key] - b?.[key] : b?.[key] - a?.[key];
      }
      if (key === 'date') {
        return direction === 'asc' ?
        new Date(a[key]) - new Date(b[key]) :
        new Date(b[key]) - new Date(a[key]);
      }
      return direction === 'asc' ?
      a?.[key]?.localeCompare(b?.[key]) :
      b?.[key]?.localeCompare(a?.[key]);
    });

    setFilteredExpenses(sorted);
    setSortConfig({ key, direction });
  };

  const handleNewExpense = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    if (window.confirm(`Weet je zeker dat je de uitgave "${expense?.description}" wilt verwijderen?`)) {
      const updatedExpenses = expenses?.filter((e) => e?.id !== expense?.id);
      setExpenses(updatedExpenses);
      setFilteredExpenses(updatedExpenses);
    }
  };

  const handleViewReceipt = (expense) => {
    setSelectedExpense(expense);
    setIsReceiptViewerOpen(true);
  };

  const handleSaveExpense = (expenseData) => {
    if (selectedExpense) {
      // Update existing expense
      const updatedExpenses = expenses?.map((expense) =>
      expense?.id === selectedExpense?.id ?
      { ...expense, ...expenseData, id: selectedExpense?.id } :
      expense
      );
      setExpenses(updatedExpenses);
      setFilteredExpenses(updatedExpenses);
    } else {
      // Add new expense
      const newExpense = {
        ...expenseData,
        id: Math.max(...expenses?.map((e) => e?.id)) + 1,
        categoryName: getCategoryName(expenseData?.category)
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      setFilteredExpenses(updatedExpenses);
    }
  };

  const getCategoryName = (category) => {
    const categoryNames = {
      office: 'Kantoorbenodigdheden',
      travel: 'Reiskosten',
      marketing: 'Marketing & Reclame',
      software: 'Software & Licenties',
      equipment: 'Apparatuur',
      training: 'Training & Cursussen',
      meals: 'Maaltijden',
      utilities: 'Nutsvoorzieningen',
      other: 'Overige'
    };
    return categoryNames?.[category] || 'Onbekend';
  };

  const handleBulkImport = () => {
    // Simulate bulk import functionality
    alert('Bulk import functionaliteit wordt binnenkort beschikbaar gesteld.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      
      <main className={`transition-all duration-300 pt-16 ${
      sidebarCollapsed ? 'ml-16' : 'ml-60'}`
      }>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Uitgavenbeheer
            </h1>
            <p className="text-muted-foreground">
              Beheer je zakelijke uitgaven, upload bonnen en houd je kosten bij voor optimale boekhouding.
            </p>
          </div>

          {/* Stats */}
          <ExpenseStats expenses={expenses} />

          {/* Filters */}
          <ExpenseFilters
            onFiltersChange={handleFiltersChange}
            onNewExpense={handleNewExpense}
            onBulkImport={handleBulkImport} />


          {/* Expense Table */}
          <ExpenseTable
            expenses={filteredExpenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onViewReceipt={handleViewReceipt}
            sortConfig={sortConfig}
            onSort={handleSort} />

        </div>
      </main>

      {/* Modals */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expense={selectedExpense}
        onSave={handleSaveExpense} />


      <ReceiptViewer
        isOpen={isReceiptViewerOpen}
        onClose={() => setIsReceiptViewerOpen(false)}
        expense={selectedExpense} />


      {/* Widgets */}
      <QuickActionWidget />
      <AIChatWidget />
    </div>);

};

export default ExpenseManagement;