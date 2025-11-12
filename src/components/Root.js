import React from 'react';

// MUI Components
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  Divider,
  IconButton,
  Avatar,
  Grid,
  Typography,
  Toolbar,
  Chip,
  Popover,
  useMediaQuery,
} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PropTypes from 'prop-types';

// Custom Components and Styles
import SideBarMenu from './layout/Sidemenu';
import { StyledBadge } from './styles/style';

// Hooks
import { useComponent } from './hooks/ComponentContext';
import useAuth from './hooks/UseAuth';

// Actions and Utilities
import MetaData from './utils/metaData';
// Third-Party Libraries
import { BASE_URL_EXPRESS } from '../constants/othersConstants';

const drawerWidth = 220;
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    marginLeft: `-${drawerWidth}px`,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: 0,
      [theme.breakpoints.down('md')]: {
        marginLeft: `-${drawerWidth}px`,
      },
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    overflowX: 'hidden', // Prevent horizontal scrolling
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        [theme.breakpoints.down('md')]: {
          width: '100%',
          marginLeft: '0px',
        },
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

export default function MAIN({ handleToggleMode }) {
  const { academicName, logo } = useAuth();
  // for handling components
  const { currentComponent } = useComponent();
  const { changeComponent } = useComponent();

  // for sidebar drawer
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(isSmallScreen);

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // for closing sidebar autometically when the screen is medium
  const handleListItemClick = (key) => {
    if (isSmallScreen) {
      setOpen(false);
    }
    changeComponent(key);
  };

  const [anchorEl5, setAnchorEl5] = React.useState(null);

  const handleClick5 = (event) => {
    setAnchorEl5(event.currentTarget);
  };

  const handleClose5 = () => {
    setAnchorEl5(null);
  };

  const open5 = Boolean(anchorEl5);
  const id = open5 ? 'simple-popover' : undefined;

  return (
    <>
      <MetaData title="DASHBOARD" />
      <AppBar position="sticky" open={open} color="inherit" elevation={0}>
        <Toolbar variant="dense">
          <Grid
            container
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Grid
              item
              xs={6}
              sm={3}
              order={{ md: 1, xs: 1 }}
              display="flex"
              alignItems="center"
            >
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={[
                  {
                    mr: 2,
                  },
                  open && { display: 'none' },
                ]}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography color="primary">TANZIM</Typography>
                <Typography sx={{ fontSize: '8px' }} marginLeft="0.5px">
                  ATTENDANCE
                </Typography>
              </Box>
            </Grid>
            <Grid
              xs={12}
              md={6}
              order={{ md: 2, xs: 3 }}
              item
              display="flex"
              justifyContent="center"
              paddingRight="7px"
            >
              {/* <Typography variant="h6" align='center'>
                                {academicName}
                            </Typography> */}
              <Chip
                variant="outlined"
                aling="center"
                sx={{
                  fontSize: '1.1rem',
                }}
                label={academicName}
              />
            </Grid>
            <Grid
              item
              xs={6}
              sm={6}
              md={3}
              order={{ md: 3, xs: 2 }}
              sx={{
                display: 'flex',
                justifyContent: 'right',
                alignItems: 'center',
              }}
            >
              <Grid>
                <Grid
                  container
                  columnSpacing={0.1}
                  display="flex"
                  alignItems="center"
                >
                  <Grid item>
                    <IconButton onClick={handleClick5}>
                      <StyledBadge
                        badgeContent={0}
                        color="primary"
                        aria-label="show new mails"
                      >
                        <NotificationsIcon color="action" />
                      </StyledBadge>
                    </IconButton>
                    <Popover
                      id={id}
                      open={open5}
                      anchorEl={anchorEl5}
                      onClose={handleClose5}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    >
                      <Typography sx={{ p: 2 }}>
                        You have no notifications yet
                      </Typography>
                    </Popover>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={handleToggleMode}
                      aria-label="show new mails"
                    >
                      <LightModeOutlinedIcon color="action" />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex' }} className="rootBox">
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader
            sx={{
              display: 'flex',
              flexDirection: 'column',
              padding: '5px',
              height: '95px',
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerClose}
              edge="start"
              sx={[
                !open && { display: 'none' },
                {
                  position: 'absolute',
                  top: -2,
                  right: 0,
                },
              ]}
            >
              <ChevronLeftIcon color="action" />
            </IconButton>
            <Avatar
              alt="Logo"
              src={`${BASE_URL_EXPRESS}${logo}`}
              sx={{
                width: '55px',
                height: '55px',
                objectFit: 'contain',
              }}
            />
          </DrawerHeader>
          <Divider />
          {/* Container for the scrollable side menu */}
          <div
            style={{
              flexGrow: 1,
              overflowY: 'auto',
              maxHeight: `calc(100vh - 100px)`,
            }}
          >
            <SideBarMenu handleClickMenu={handleListItemClick} />
          </div>
        </Drawer>
        <Main open={open}>{currentComponent}</Main>
      </Box>
    </>
  );
}

MAIN.propTypes = {
  handleToggleMode: PropTypes.func.isRequired,
};
