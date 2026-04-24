import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StoreProvider } from './store';

function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  );
}

export default App;
