import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Avatar, Box } from '@mui/material';
import { convertToBengaliDigits } from '../utils/converter.js';
import PADHEADING from './Headers.jsx';
import COMMONWATERMARK from './WaterMark.jsx';

export default function DATATABLEPRINT(data) {
  const finalData = data?.data || [];

  return (
    <Box>
      <TableContainer>
        <COMMONWATERMARK />
        <PADHEADING text={finalData?.heading || ''} />
        <Table aria-label="simple table" sx={{ marginTop: 1 }}>
          {/* Table Head */}
          <TableHead>
            <TableRow>
              {finalData?.columns?.map((column) => (
                <TableCell
                  sx={{ padding: 1, background: 'whitesmoke' }}
                  key={column.field}
                  align={column.align || 'left'}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {finalData?.rows?.map((row) => (
              <TableRow key={row.serial}>
                {finalData?.columns?.map((column) => (
                  <TableCell
                    sx={{
                      padding: 1,
                    }}
                    key={column.field}
                    align={column.align || 'left'}
                  >
                    {column.field === 'photo_path' ? (
                      <Avatar
                        src={`local://${row[column.field]}`}
                        alt="Row Image"
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      convertToBengaliDigits(row[column.field])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
