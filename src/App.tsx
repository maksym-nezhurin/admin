import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { AppRoutes } from './routes/AppRoutes';
import { AppProviders } from './providers';

const App: React.FC = () => {  
  return (
    <>
      <Notifications />
      <AppProviders>
      <Router>
        <AppRoutes />
      </Router>
    </AppProviders>
    </>
  );
};

export default App;