import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, CssBaseline } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Transactions
import ReceiptIcon from '@mui/icons-material/Receipt'; // Invoices
import PaymentsIcon from '@mui/icons-material/Payments'; // Bills
import PeopleIcon from '@mui/icons-material/People'; // Payroll
import AssessmentIcon from '@mui/icons-material/Assessment'; // Reports
import InventoryIcon from '@mui/icons-material/Inventory'; // Cash Flow & Inventory
import SettingsIcon from '@mui/icons-material/Settings'; // Settings
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Transactions from './pages/Transactions';
import Invoices from './pages/Invoices';
import Bills from './pages/Bills';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';
import CashFlowInventory from './pages/CashFlowInventory';
import Settings from './pages/Settings';

const drawerWidth = 220;

function App() {
  const navItems = [
    { label: 'Transactions', icon: <ReceiptLongIcon />, path: '/transactions' },
    { label: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
    { label: 'Bills', icon: <PaymentsIcon />, path: '/bills' },
    { label: 'Payroll', icon: <PeopleIcon />, path: '/payroll' },
    { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { label: 'Cash Flow & Inventory', icon: <InventoryIcon />, path: '/cash-flow' },
  ];

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#181a1b' }}>
        <CssBaseline />
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#23272a',
              color: '#fff',
              borderRight: 'none',
            },
          }}
        >
          <Toolbar sx={{ minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#181a1b' }}>
            <span style={{
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 2,
              color: '#4fc3f7',
              fontFamily: 'Montserrat, sans-serif',
              textTransform: 'uppercase',
            }}>
              Flux
            </span>
          </Toolbar>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {navItems.map((item) => (
              <ListItem
                key={item.label}
                disablePadding
                sx={{}}
              >
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    textDecoration: 'none',
                    color: isActive ? '#4fc3f7' : '#fff',
                    background: isActive ? 'rgba(79,195,247,0.08)' : 'transparent',
                    borderRadius: 8,
                    padding: '8px 16px',
                    margin: '2px 0',
                  })}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </NavLink>
              </ListItem>
            ))}
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <List>
            <ListItem disablePadding>
              <NavLink
                to="/settings"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  textDecoration: 'none',
                  color: isActive ? '#4fc3f7' : '#fff',
                  background: isActive ? 'rgba(79,195,247,0.08)' : 'transparent',
                  borderRadius: 8,
                  padding: '8px 16px',
                  margin: '2px 0',
                })}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Settings" />
              </NavLink>
            </ListItem>
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#181a1b', minHeight: '100vh' }}>
          <Toolbar sx={{ minHeight: 64 }} />
          <Routes>
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/cash-flow" element={<CashFlowInventory />} />
            <Route path="/settings" element={<Settings />} />
            {/* Optionally, add a default route/redirect here */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
