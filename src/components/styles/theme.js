import { createTheme } from '@mui/material/styles';
import { fontFamily } from '../utils/basic';
const basics = JSON.parse(localStorage.getItem('basics')) || {};
const { language } = basics;

export const theme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1976d2',
      },
      background: {
        default: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        // paper: mode === 'dark' ? '#282424' : '#f5fdff',
        paper: mode === 'dark' ? '#282424' : 'white',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
      },
    },
    direction: language === 'ar' ? 'rtl' : 'ltr',
    typography: {
      fontFamily: fontFamily,
      lineHeight: '1',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // '@global': {
          //     html: {
          //         WebkitTextSizeAdjust: '100%',
          //         textSizeAdjust: '100%',
          //         fontFamily: fontFamily,
          //     },
          // },

          '&.rootBox': {
            backgroundColor:
              mode === 'dark' ? '#181818' : 'rgba(244,247,254,255)',
            height: '94.7vh',
          },

          '&.bgColor': {
            backgroundColor:
              mode === 'dark' ? '#181818' : 'rgba(244,247,254,255)',
          },

          '&.globalShapeDesign': {
            height: '94.5vh',
            paddingLeft: '5px',
            // margin: '8px',
            backgroundColor: mode === 'dark' ? '#181818' : 'white',
            // borderRadius: '5px'
          },

          '&.shapeDesign': {
            paddingLeft: '5px',
            backgroundColor: mode === 'dark' ? '#181818' : 'white',
          },

          '&.customGridClass': {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor:
              mode === 'dark' ? 'rgba(81, 81, 81)' : 'rgba(224, 224, 224, 1)',
          },

          '&.customBorderLeft': {
            borderLeft: `1px dashed ${mode === 'dark' ? 'lightgray' : 'black'}`,
          },

          '&.customBorder': {
            border: `1px dashed ${mode === 'dark' ? 'lightgray' : 'black'}`,
          },

          '&.summary-row': {
            backgroundColor: mode === 'dark' ? '#181818' : '#f9f9f9',
          },
          // Scrollbar Track and Thumb Styling for both vertical and horizontal scrollbars
          '&::-webkit-scrollbar': {
            width: '5px', // Width for vertical scrollbar
            height: '5px', // Height for horizontal scrollbar
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: mode === 'dark' ? '#333' : '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: mode === 'dark' ? '#888' : '#bdbdbd',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: mode === 'dark' ? '#555' : '#888',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: '0.9rem',
            color: mode === 'dark' ? '#e0e0e0' : '#333333',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: '35px',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            marginLeft: '5px',
            marginRight: '5px',
            marginBottom: '3px',
            borderRadius: '5px',
            paddingTop: 3,
            paddingBottom: 3,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: '0.9rem',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-toolbarQuickFilter': {
              width: '150px',
            },
          },
          toolbarContainer: {
            padding: '4px 0px 3px 0px',
          },
          columnHeader: {
            backgroundColor:
              mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : '#f9f7ff',
          },
          footerContainer: {
            height: '40px',
            minHeight: '40px',
            borderRadius: '3px',
            overflow: 'hidden',
            border: 'none',
          },
          main: {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor:
              mode === 'dark' ? 'rgba(81, 81, 81)' : 'rgba(224, 224, 224, 1)',
            borderRadius: '3px',
          },
        },
      },
      MuiTextField: {
        backgroundColor: 'none',
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            background: 'none',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            padding: '0px',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: '0',
          },
        },
      },

      // tabel styling
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'dark'
                ? 'rgba(0, 0, 0, 0.15)'
                : 'rgba(255, 255, 255, 0.55)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor:
              mode === 'dark' ? 'rgba(81, 81, 81)' : 'rgba(224, 224, 224, 1)',
          },
        },
      },
    },
  });
