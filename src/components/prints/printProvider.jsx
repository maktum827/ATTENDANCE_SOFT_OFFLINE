import { useEffect, useRef, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import PrintContext from './printContext.jsx';

function PrintProvider({ children }) {
  const [printComponent, setPrintComponent] = useState(null);

  const changePDFComponent = (component) => {
    setPrintComponent(component);
  };

  const handleAfterPrint = () => {
    setPrintComponent(null);
  };

  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    onAfterPrint: handleAfterPrint,
    pageStyle: `
      body {
        -webkit-print-color-adjust: exact; /* Chrome / Electron */
        print-color-adjust: exact;         /* Firefox */
        color-adjust: exact;               /* Old spec fallback */
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        background: whitesmoke !important;
      }
      th, td {
        color: black !important;
      }
      tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    `,
  });

  useEffect(() => {
    if (printComponent) {
      setTimeout(() => {
        if (contentRef.current) {
          try {
            handlePrint();
          } catch (error) {
            console.warn('Print operation was canceled or failed:', error);
          }
        }
      }, 500);
    }
  }, [printComponent, handlePrint]);

  // ✅ Memoize context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({ printComponent, changePDFComponent }),
    [printComponent], // only changes when printComponent changes
  );

  return (
    <PrintContext.Provider value={contextValue}>
      {children}
      {printComponent && (
        <Box
          sx={{
            display: 'none',
            '@media print': {
              display: 'block',
            },
          }}
          ref={contentRef}
        >
          {printComponent}
        </Box>
      )}
    </PrintContext.Provider>
  );
}

export default PrintProvider;
