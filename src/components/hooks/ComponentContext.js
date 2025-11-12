import React, { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import MAIN from '../Dashboard';
import ATTENDANCEDEVICES from '../Devices';
import LANGUAGESETTINGS from '../Lnaguages';
import ACTIVATIONSTATUS from '../Activation';
import ABOUT from '../About';
import AttendanceList from '../Attendance';
import RulesManager from '../RulesMenagement';
import SMSLOGS from '../SmsLogs';
import SETUPDATA from '../SetupData';
import USERS from '../Users';

const ComponentContext = createContext();

function ComponentProvider({ children }) {
  const [currentComponent, setCurrentComponent] = useState(<MAIN />);

  const changeComponent = (key) => {
    switch (key) {
      case 'dashboard':
        setCurrentComponent(<MAIN />);
        break;
      case 'setupData':
        setCurrentComponent(<SETUPDATA />);
        break;
      case 'attendance':
        setCurrentComponent(<AttendanceList />);
        break;
      case 'rules':
        setCurrentComponent(<RulesManager />);
        break;
      case 'notActive':
        setCurrentComponent(<SMSLOGS />);
        break;
      case 'devices':
        setCurrentComponent(<ATTENDANCEDEVICES />);
        break;
      case 'languages':
        setCurrentComponent(<LANGUAGESETTINGS />);
        break;
      case 'connection':
        setCurrentComponent(<ACTIVATIONSTATUS />);
        break;
      case 'users':
        setCurrentComponent(<USERS />);
        break;
      case 'about':
        setCurrentComponent(<ABOUT />);
        break;
      default:
        setCurrentComponent(<MAIN />);
        break;
    }
  };

  // Wrap the context value in useMemo to avoid re-creating object each render
  const value = useMemo(
    () => ({ currentComponent, changeComponent }),
    [currentComponent],
  );

  return (
    <ComponentContext.Provider value={value}>
      {children}
    </ComponentContext.Provider>
  );
}

// Prop validation
ComponentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ComponentProvider, ComponentContext };
export const useComponent = () => useContext(ComponentContext);
