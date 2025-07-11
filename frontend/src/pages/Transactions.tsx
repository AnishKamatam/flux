import React, { useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, useMediaQuery, Stepper, Step, StepLabel } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Dialog as MuiDialog } from '@mui/material';

const initialCategoryOptions = [
  'Advertising',
  'Bank Fees',
  'Cost of Goods Sold',
  'Depreciation',
  'Insurance',
  'Maintenance',
  'Miscellaneous',
  'Office Supplies',
  'Payroll',
  'Professional Services',
  'Rent Expense',
  'Sales Revenue',
  'Taxes',
  'Travel',
  'Utilities',
  'Add Category',
];

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function formatAmount(amount: string | number): string {
  if (amount === '' || amount === null || amount === undefined) return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatMonth(month: string) {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

const COLORS = [
  '#4fc3f7', '#ffb74d', '#e57373', '#81c784', '#ba68c8', '#ffd54f', '#64b5f6', '#a1887f', '#90a4ae', '#f06292', '#9575cd', '#aed581', '#fff176', '#4db6ac', '#f44336', '#ff8a65', '#7986cb', '#dce775', '#b0bec5', '#fbc02d'
];

const fontFamily = `'Inter', 'Montserrat', 'Roboto', Arial, sans-serif`;

// Define a type for Transaction
interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
}

const mockBankTransactions = [
  { id: 7, date: '2024-06-05', description: 'Zoom License', amount: -706.13, category: 'Technology and Subscriptions Expense' },
  { id: 8, date: '2024-06-18', description: 'Phone Bill', amount: -1364.76, category: 'Utilities Expense' },
  { id: 9, date: '2024-06-15', description: 'Domain Hosting', amount: -926.05, category: 'Technology and Subscriptions Expense' },
  { id: 10, date: '2024-06-17', description: 'Flight to Conference', amount: -1247.15, category: 'Travel and Entertainment Expense' },
  { id: 11, date: '2024-06-18', description: 'Business Cards', amount: -1480.73, category: 'Sales and Marketing Expense' },
  { id: 12, date: '2024-06-23', description: 'Cleaning Services', amount: -1437.11, category: 'General and Administrative Expense' },
  { id: 13, date: '2024-06-19', description: 'Employee Bonus', amount: -143.38, category: 'Payroll Expense' },
  { id: 14, date: '2024-05-30', description: 'Coffee for Office', amount: -793.25, category: 'General and Administrative Expense' },
  { id: 15, date: '2024-06-01', description: 'IT Consultant', amount: -1348.78, category: 'Contract Labor Expense' },
  { id: 16, date: '2024-05-29', description: 'Google Ads', amount: -460.27, category: 'Sales and Marketing Expense' }
];


const Transactions: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: '',
    description: '',
    amount: '',
    category: '',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryOptions, setCategoryOptions] = useState(initialCategoryOptions);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Wizard state
  const [bankWizardOpen, setBankWizardOpen] = useState(false);
  const [bankStep, setBankStep] = useState(0);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  // For matching: store [bankTxId, transactionIdx] pairs
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [bankTxToMatch, setBankTxToMatch] = useState<typeof mockBankTransactions[0] | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ bankId: number; txIdx: number }[]>([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setShowAddCategory(false);
    setNewCategory('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'category' && e.target.value === 'Add Category') {
      setShowAddCategory(true);
      setForm({ ...form, category: '' });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categoryOptions.includes(newCategory)) {
      const updatedOptions = [
        ...categoryOptions.slice(0, -1),
        newCategory,
        'Add Category',
      ];
      setCategoryOptions(updatedOptions);
      setForm({ ...form, category: newCategory });
      setShowAddCategory(false);
      setNewCategory('');
    }
  };

  const handleCSVClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const newTxs = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const tx: Partial<Transaction> = {};
        headers.forEach((h, i) => {
          (tx as unknown as Record<string, string>)[h] = values[i] || '';
        });
        if (tx.amount) tx.amount = parseFloat(tx.amount as unknown as string);
        return tx as Transaction;
      }).filter(tx => tx.date && tx.description && tx.amount && tx.category);
      setTransactions(prev => [...prev, ...newTxs]);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransactions([
      ...transactions,
      {
        date: form.date,
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
      },
    ]);
    setOpen(false);
    setForm({ date: '', description: '', amount: '', category: '' });
    setShowAddCategory(false);
    setNewCategory('');
  };

  const handleOpenBankWizard = () => {
    setBankWizardOpen(true);
    setBankStep(0);
    setMatchedIds([]);
    setAddedIds([]);
  };
  const handleCloseBankWizard = () => setBankWizardOpen(false);

  const handleAdd = (id: number) => {
    setAddedIds(prev => [...prev, id]);
    const bankTx = mockBankTransactions.find(tx => tx.id === id);
    if (bankTx) {
      setTransactions(prev => [
        ...prev,
        {
          date: bankTx.date,
          description: bankTx.description,
          amount: bankTx.amount,
          category: bankTx.category,
        },
      ]);
    }
  };

  const handleMatch = (id: number) => {
    const bankTx = mockBankTransactions.find(tx => tx.id === id);
    setBankTxToMatch(bankTx || null);
    setMatchDialogOpen(true);
  };

  const handleSelectMatch = (txIdx: number) => {
    if (bankTxToMatch) {
      setMatchedPairs(prev => [...prev, { bankId: bankTxToMatch.id, txIdx }]);
      setMatchedIds(prev => [...prev, bankTxToMatch.id]);
      setMatchDialogOpen(false);
      setBankTxToMatch(null);
    }
  };

  const isBankTxMatched = (id: number) => matchedIds.includes(id) || matchedPairs.some(pair => pair.bankId === id);

  const unmatched = mockBankTransactions.filter(tx => !matchedIds.includes(tx.id) && !addedIds.includes(tx.id));

  // Pie chart data: sum absolute value of negative (expense) amounts by category
  const expenseData = transactions
    .filter(tx => tx.amount < 0)
    .reduce((acc: Record<string, number>, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {});
  const pieData = Object.entries(expenseData).map(([category, value]) => ({ name: category, value }));

  // Prepare data for line chart (group by month, sum revenue and expenses)
  const lineDataMap: Record<string, { month: string; revenue: number; expenses: number }> = {};
  transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (isNaN(d.getTime())) return;
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!lineDataMap[month]) lineDataMap[month] = { month, revenue: 0, expenses: 0 };
    if (tx.amount > 0) lineDataMap[month].revenue += tx.amount;
    if (tx.amount < 0) lineDataMap[month].expenses += Math.abs(tx.amount);
  });
  const lineData = Object.values(lineDataMap).sort((a, b) => a.month.localeCompare(b.month));

  const isMobile = useMediaQuery('(max-width:900px)');

  return (
    <Box>
      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 3, fontSize: { xs: 28, md: 34 }, fontFamily }}>
        Transactions
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 4 : 8, alignItems: 'flex-start', justifyContent: 'center' }}>
        <TableContainer sx={{ background: 'transparent', maxWidth: '700px', width: '100%', mx: 'auto', mb: 2 }}>
          <Table sx={{ minWidth: 600, background: 'transparent', fontFamily }}>
            <TableHead>
              <TableRow sx={{ borderBottom: 'none' }}>
                <TableCell sx={{ color: '#fff', fontSize: 18, py: 2, borderBottom: 'none', textAlign: 'center', fontFamily }}>Date</TableCell>
                <TableCell sx={{ color: '#fff', fontSize: 18, py: 2, borderBottom: 'none', textAlign: 'left', fontFamily }}>Description</TableCell>
                <TableCell sx={{ color: '#fff', fontSize: 18, py: 2, borderBottom: 'none', textAlign: 'center', fontFamily }}>Amount</TableCell>
                <TableCell sx={{ color: '#fff', fontSize: 18, py: 2, borderBottom: 'none', textAlign: 'left', fontFamily }}>Category</TableCell>
                <TableCell sx={{ color: '#fff', fontSize: 18, py: 2, borderBottom: 'none', textAlign: 'center', fontFamily }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? null : [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx, idx) => (
                <TableRow key={idx} sx={{ '&:hover .delete-btn': { visibility: 'visible' } }}>
                  <TableCell sx={{ color: '#fff', borderBottom: 'none', textAlign: 'center', fontFamily }}>{formatDate(tx.date)}</TableCell>
                  <TableCell sx={{ color: '#fff', borderBottom: 'none', textAlign: 'left', fontFamily }}>{tx.description}</TableCell>
                  <TableCell sx={{ color: tx.amount < 0 ? '#e57373' : '#81c784', borderBottom: 'none', textAlign: 'center', fontFamily }}>{formatAmount(tx.amount)}</TableCell>
                  <TableCell sx={{ color: '#fff', borderBottom: 'none', textAlign: 'left', fontFamily }}>{tx.category}</TableCell>
                  <TableCell sx={{ color: '#fff', borderBottom: 'none', textAlign: 'center' }}>
                    <IconButton className="delete-btn" aria-label="delete" size="small" sx={{ visibility: 'hidden' }} onClick={() => {
                      const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      const txToDelete = sorted[idx];
                      setTransactions(transactions.filter(t => t !== txToDelete));
                    }}>
                      <DeleteIcon sx={{ color: '#e57373' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ width: 1000, minHeight: 500, p: 2, ml: -15, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontFamily }}>Expense Breakdown</Typography>
          {pieData.length === 0 ? (
            <Typography sx={{ color: '#aaa', fontFamily }}>No expenses to display</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '100%', mt: 0 }}>
              <ResponsiveContainer width={500} height={500}>
                <PieChart style={{ background: '#181a1b' }}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={220}
                    outerRadius={240}
                    stroke="#181a1b"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => formatAmount(value as number)} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ minWidth: 220, ml: 0, mt: 0, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start', position: 'relative', zIndex: 2, background: 'rgba(24,26,27,0.95)', p: 2, borderRadius: 2, boxShadow: 3 }}>
                {pieData.map((entry, idx) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: COLORS[idx % COLORS.length], mr: 1.5, border: '2px solid #181a1b' }} />
                    <Typography sx={{ color: '#fff', fontFamily, fontSize: 16 }}>{entry.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {/* Revenue & Expenses Line Chart */}
          {transactions.length > 0 && (
            <Box sx={{ width: '100%', mt: 6, bgcolor: 'transparent', p: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontFamily }}>Revenue & Expenses Over Time</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData} margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                  <CartesianGrid stroke="#222" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="month"
                    stroke="#aaa"
                    fontFamily={fontFamily}
                    tickFormatter={formatMonth}
                    tickMargin={10}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    stroke="#aaa"
                    fontFamily={fontFamily}
                    tickFormatter={(value) => formatAmount(value)}
                    domain={[0, 'auto']}
                    tickMargin={16}
                    width={70}
                    padding={{ top: 10, bottom: 10 }}
                    style={{ fontSize: 15, fill: '#fff' }}
                  />
                  <Tooltip contentStyle={{ background: '#23272a', border: 'none', color: '#fff', fontFamily }} labelStyle={{ color: '#fff' }} formatter={formatAmount} />
                  <Line type="monotone" dataKey="revenue" stroke="#81c784" strokeWidth={3} dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#e57373" strokeWidth={3} dot={false} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>
      </Box>
      {transactions.length === 0 && (
        <Box sx={{ textAlign: 'center', color: '#aaa', mt: 3, fontSize: 18, fontFamily }}>
          No transactions available
        </Box>
      )}
      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200, display: 'flex', gap: 2 }}>
        <Button variant="outlined" color="primary" size="large" onClick={handleOpenBankWizard}>
          Connect to Bank
        </Button>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleCSVUpload}
          aria-label="Upload CSV file"
        />
        <Button variant="contained" color="primary" size="large" onClick={handleCSVClick}>
          Add CSV File
        </Button>
        <Button variant="outlined" color="primary" size="large" onClick={handleOpen}>
          Add Transaction
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Transaction</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              required
              inputProps={{ step: '0.01' }}
            />
            <TextField
              label="Category"
              name="category"
              select
              value={form.category}
              onChange={handleChange}
              required={!showAddCategory}
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            {showAddCategory && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="New Category"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  autoFocus
                  fullWidth
                />
                <Button onClick={handleAddCategory} variant="contained" disabled={!newCategory.trim()}>
                  Add
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={bankWizardOpen} onClose={handleCloseBankWizard} maxWidth="md" fullWidth>
        <DialogTitle>Bank Reconciliation</DialogTitle>
        <DialogContent>
          <Stepper activeStep={bankStep} alternativeLabel sx={{ mb: 3 }}>
            <Step><StepLabel>Import Statement</StepLabel></Step>
            <Step><StepLabel>Match Transactions</StepLabel></Step>
            <Step><StepLabel>Unmatched</StepLabel></Step>
            <Step><StepLabel>Summary</StepLabel></Step>
          </Stepper>
          {bankStep === 0 && (
            <Box>
              <Typography sx={{ mb: 2 }}>Imported bank statement with {mockBankTransactions.length} transactions:</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Category</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockBankTransactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell sx={{ color: tx.amount < 0 ? '#e57373' : '#81c784' }}>{formatAmount(tx.amount)}</TableCell>
                        <TableCell>{tx.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          {bankStep === 1 && (
            <Box>
              <Typography sx={{ mb: 2 }}>Match or add each bank transaction:</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockBankTransactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell sx={{ color: tx.amount < 0 ? '#e57373' : '#81c784' }}>{formatAmount(tx.amount)}</TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell>
                          {isBankTxMatched(tx.id) ? (
                            <Typography color="success.main">Matched</Typography>
                          ) : addedIds.includes(tx.id) ? (
                            <Typography color="primary.main">Added</Typography>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button size="small" variant="outlined" color="success" onClick={() => handleMatch(tx.id)}>Match</Button>
                              <Button size="small" variant="contained" color="primary" onClick={() => handleAdd(tx.id)}>Add</Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Match dialog */}
              <MuiDialog open={matchDialogOpen} onClose={() => setMatchDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Select Transaction to Match</DialogTitle>
                <DialogContent>
                  <Typography sx={{ mb: 2 }}>Select a transaction from your ledger to match with:<br /><b>{bankTxToMatch?.description}</b> ({formatAmount(bankTxToMatch?.amount || 0)})</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((tx, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{formatDate(tx.date)}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell sx={{ color: tx.amount < 0 ? '#e57373' : '#81c784' }}>{formatAmount(tx.amount)}</TableCell>
                            <TableCell>{tx.category}</TableCell>
                            <TableCell>
                              <Button size="small" variant="contained" onClick={() => handleSelectMatch(idx)}>Select</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setMatchDialogOpen(false)}>Cancel</Button>
                </DialogActions>
              </MuiDialog>
            </Box>
          )}
          {bankStep === 2 && (
            <Box>
              <Typography sx={{ mb: 2 }}>Unmatched Transactions:</Typography>
              {unmatched.length === 0 ? (
                <Typography color="success.main">All transactions matched or added!</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Category</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unmatched.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell>{formatDate(tx.date)}</TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell sx={{ color: tx.amount < 0 ? '#e57373' : '#81c784' }}>{formatAmount(tx.amount)}</TableCell>
                          <TableCell>{tx.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          {bankStep === 3 && (
            <Box>
              <Typography sx={{ mb: 2 }}>Reconciliation Summary</Typography>
              <Box sx={{ display: 'flex', gap: 6, alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2">Bank Statement Balance</Typography>
                  <Typography variant="h6">{formatAmount(mockBankTransactions.reduce((sum, tx) => sum + tx.amount, 0))}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">QuickBooks Balance</Typography>
                  <Typography variant="h6">{formatAmount(mockBankTransactions.reduce((sum, tx) => sum + tx.amount, 0))}</Typography>
                </Box>
              </Box>
              <Typography>All steps complete. Click Confirm to finish.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {bankStep > 0 && <Button onClick={() => setBankStep(bankStep - 1)}>Back</Button>}
          {bankStep < 3 && <Button onClick={() => setBankStep(bankStep + 1)} variant="contained">Next</Button>}
          {bankStep === 3 && <Button onClick={handleCloseBankWizard} variant="contained">Confirm</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions; 