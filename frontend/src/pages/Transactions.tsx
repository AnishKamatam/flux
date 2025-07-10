import React, { useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, useMediaQuery } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

function formatAmount(amount: string | number) {
  if (amount === '' || amount === null || amount === undefined) return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return amount;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const COLORS = [
  '#4fc3f7', '#ffb74d', '#e57373', '#81c784', '#ba68c8', '#ffd54f', '#64b5f6', '#a1887f', '#90a4ae', '#f06292', '#9575cd', '#aed581', '#fff176', '#4db6ac', '#f44336', '#ff8a65', '#7986cb', '#dce775', '#b0bec5', '#fbc02d'
];

const fontFamily = `'Inter', 'Montserrat', 'Roboto', Arial, sans-serif`;

const Transactions: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: '',
    description: '',
    amount: '',
    category: '',
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categoryOptions, setCategoryOptions] = useState(initialCategoryOptions);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        const tx: any = {};
        headers.forEach((h, i) => {
          tx[h] = values[i] || '';
        });
        if (tx.amount) tx.amount = parseFloat(tx.amount);
        return tx;
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

  // Pie chart data: sum absolute value of negative (expense) amounts by category
  const expenseData = transactions
    .filter(tx => tx.amount < 0)
    .reduce((acc: Record<string, number>, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {});
  const pieData = Object.entries(expenseData).map(([category, value]) => ({ name: category, value }));

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
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? null : [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ color: '#fff', borderBottom: 'none', textAlign: 'center', fontFamily }}>{formatDate(tx.date)}</TableCell>
                  <TableCell sx={{ color: '#fff', borderBottom: 'none', textAlign: 'left', fontFamily }}>{tx.description}</TableCell>
                  <TableCell sx={{ color: '#fff', borderBottom: 'none', textAlign: 'center', fontFamily }}>{formatAmount(tx.amount)}</TableCell>
                  <TableCell sx={{ color: '#fff', borderBottom: 'none', textAlign: 'left', fontFamily }}>{tx.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ width: 900, minHeight: 500, p: 2, ml: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
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
        </Box>
      </Box>
      {transactions.length === 0 && (
        <Box sx={{ textAlign: 'center', color: '#aaa', mt: 3, fontSize: 18, fontFamily }}>
          No transactions available
        </Box>
      )}
      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200, display: 'flex', gap: 2 }}>
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
    </Box>
  );
};

export default Transactions; 