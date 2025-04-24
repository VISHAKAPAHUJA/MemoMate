import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Event as EventIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  Notes as MemoIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isAuthenticated, onLogout, username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerWidth = isOpen ? 240 : 80;

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, link: '/dashboard' },  // Changed from '/' to '/dashboard'
    { text: 'Add Event', icon: <EventIcon />, link: '/add-event' }, // Changed from '/events' to '/add-event'
    // Removed '/memos' since it's not in your routes
  ];
  const authItems = isAuthenticated
    ? [{ text: 'Logout', icon: <LogoutIcon />, action: onLogout }]
    : [
        { text: 'Login', icon: <LoginIcon />, link: '/login' },
        { text: 'Register', icon: <RegisterIcon />, link: '/register' },
      ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.4s ease',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          overflowX: 'hidden',
          transition: 'width 0.4s ease',
        },
      }}
    >
      <Box className="sidebar-header">
        <Tooltip title="MemoMate" placement="right">
          <Box className="logo-container">
            <MemoIcon className="logo-icon" />
            {isOpen && (
              <>
                <Typography variant="h6" className="logo-text">
                  MemoMate
                </Typography>
                <Typography variant="caption" className="slogan-text">
                  Never Miss a Moment
                </Typography>
              </>
            )}
          </Box>
        </Tooltip>
      </Box>

      <Divider className="divider-glow" />

      <List className="menu-list">
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            component={Link}
            to={item.link}
            className="menu-item"
          >
            <ListItemIcon className="menu-icon">{item.icon}</ListItemIcon>
            {isOpen && <ListItemText primary={item.text} />}
          </ListItem>
        ))}
      </List>

      <Divider className="divider-glow" />

      <List className="menu-list">
        {authItems.map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={item.action}
            component={item.link ? Link : 'div'}
            to={item.link}
            className="menu-item"
          >
            <ListItemIcon className="menu-icon">{item.icon}</ListItemIcon>
            {isOpen && <ListItemText primary={item.text} />}
          </ListItem>
        ))}
      </List>

      {isAuthenticated && (
        <Box className="user-profile">
          <Avatar className="avatar-glow">
            {username?.charAt(0).toUpperCase()}
          </Avatar>
          {isOpen && (
            <Typography variant="subtitle2" className="username-text">
              {username}
            </Typography>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;
