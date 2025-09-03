import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService, LoginRequest, SignupRequest, LoginResponse, SupabaseUser } from '@/services/authService';

interface AuthState {
  user: SupabaseUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    return response;
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (credentials: SignupRequest) => {
    const response = await authService.signup(credentials);
    return response;
  }
);

export const testAuth = createAsyncThunk(
  'auth/testAuth',
  async () => {
    const response = await authService.testAuth();
    return response;
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const user = await authService.getCurrentUser();
    return user;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = {
        id: action.payload.user_id,
        email: action.payload.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Login failed';
    });

    // Signup
    builder.addCase(signup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.loading = false;
      state.user = {
        id: action.payload.user_id,
        email: action.payload.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Signup failed';
    });

    // Test Auth
    builder.addCase(testAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(testAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = action.payload.authenticated;
      if (!action.payload.authenticated) {
        state.user = null;
        state.token = null;
      }
    });
    builder.addCase(testAuth.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    });

    // Get Current User
    builder.addCase(getCurrentUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
    builder.addCase(logout.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError, setToken, setUser } = authSlice.actions;
export default authSlice.reducer;
