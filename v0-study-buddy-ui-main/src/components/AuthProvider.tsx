import React, { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { getCurrentUser, setUser } from '@/store/authSlice';
import { auth } from '@/lib/supabase';
import { apiClient } from '@/services/apiClient';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session, error } = await auth.getSession();
        console.log('Auth session response:', { session, error });
        
        if (session?.user) {
          // Set the token for API calls
          apiClient.setAuthToken(session.access_token);
          
          const user = await dispatch(getCurrentUser());
          if (user.payload) {
            dispatch(setUser(user.payload));
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', { event, session });
        if (event === 'SIGNED_IN' && session?.user) {
          // Set the token for API calls
          apiClient.setAuthToken(session.access_token);
          
          const user = await dispatch(getCurrentUser());
          if (user.payload) {
            dispatch(setUser(user.payload));
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear the token
          apiClient.setAuthToken('');
          dispatch(setUser(null));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
};
