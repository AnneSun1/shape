import { useAppSelector, useAppDispatch } from '@/store';
import { login, signup, logout, testAuth, getCurrentUser, clearError } from '@/store/authSlice';
import { LoginRequest, SignupRequest } from '@/services/authService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const handleLogin = async (credentials: LoginRequest) => {
    return await dispatch(login(credentials));
  };

  const handleSignup = async (credentials: SignupRequest) => {
    return await dispatch(signup(credentials));
  };

  const handleLogout = async () => {
    return await dispatch(logout());
  };

  const handleTestAuth = async () => {
    return await dispatch(testAuth());
  };

  const handleGetCurrentUser = async () => {
    return await dispatch(getCurrentUser());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    testAuth: handleTestAuth,
    getCurrentUser: handleGetCurrentUser,
    clearError: handleClearError,
  };
};
