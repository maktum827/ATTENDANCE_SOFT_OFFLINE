import { useContext } from 'react';
import PrintContext from './printContext';

const usePDFComponent = () => useContext(PrintContext);

export default usePDFComponent;
