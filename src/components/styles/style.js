import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Wrapper component to pass disableRipple prop
export const CustomCrossButton = styled(Button)({
    padding: '1px 12px',
    minWidth: '6px',
    color: 'gray',
    width: '6px',
    position: 'absolute',
    top: '5px',
    right: '5px'
});

export const CustomSmallButton = styled(Button)({
    padding: '2px 15px',
    minWidth: '5px',
    width: '5px'
});

export const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        // right: -2,
        top: 9,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: '0 4px',
    },
}));