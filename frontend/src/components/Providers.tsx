"use client"
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  console.log('Providers component rendering, store:', store);
  console.log('Store state:', store.getState());
  
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
};
