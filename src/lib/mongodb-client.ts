// Simple token management for mock authentication
const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setTokenInStorage = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const removeTokenFromStorage = (): void => {
  localStorage.removeItem('auth_token');
};

const verifyToken = (token: string): { userId: string; email: string } | null => {
  // Simple token verification for mock - just check if it exists
  if (token && token.startsWith('mock_token_')) {
    return {
      userId: token.replace('mock_token_', ''),
      email: 'user@example.com'
    };
  }
  return null;
};

// Define types to match the existing application
export interface User {
  id: string;
  email: string;
  phone_number?: string;
  email_verified: boolean;
  totpEnabled?: boolean;
}

export interface Session {
  access_token: string;
  user: User;
}

// Mock MongoDB client for frontend (in a real app, this would be API calls)
class MongoDBClient {
  private baseUrl = 'https://clupso-backend.onrender.com/api'; // Your hosted backend API URL

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('Making request to:', url);
    console.log('Options:', options);
    
    const token = getTokenFromStorage();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Response error:', error);
        throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  }

  // Auth methods
  auth = {
    signUp: async (credentials: { email: string; password: string; options?: { data: { phone_number: string } } }) => {
      try {
        const response = await this.makeRequest('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            phoneNumber: credentials.options?.data.phone_number
          })
        });

        if (response.token) {
          setTokenInStorage(response.token);
        }

        return { data: response, error: null };
      } catch (error) {
        console.error('Signup error:', error);
        return { data: null, error: error instanceof Error ? error.message : 'Signup failed' };
      }
    },

    signIn: async (credentials: { email: string; password: string }) => {
      try {
        const response = await this.makeRequest('/auth/signin', {
          method: 'POST',
          body: JSON.stringify(credentials)
        });

        if (response.token) {
          setTokenInStorage(response.token);
        }

        return { data: response, error: null };
      } catch (error) {
        console.error('SignIn error:', error);
        return { data: null, error: error instanceof Error ? error.message : 'Login failed' };
      }
    },

    signOut: async () => {
      removeTokenFromStorage();
      return { error: null };
    },

    getSession: async (): Promise<{ data: { session: Session | null } }> => {
      const token = getTokenFromStorage();
      if (!token) {
        return { data: { session: null } };
      }

      const payload = verifyToken(token);
      if (!payload) {
        removeTokenFromStorage();
        return { data: { session: null } };
      }

      try {
        const user = await this.makeRequest('/auth/user');
        return {
          data: {
            session: {
              access_token: token,
              user: {
                id: user.id,
                email: user.email,
                phone_number: user.phone_number,
                email_verified: user.email_verified
              }
            }
          }
        };
      } catch {
        removeTokenFromStorage();
        return { data: { session: null } };
      }
    },

    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      // For now, just check initial state
      this.auth.getSession().then(({ data }) => {
        callback('INITIAL_SESSION', data.session);
      });

      // Return a subscription object
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  // Database methods for vault operations
  from(table: string) {
    // Map frontend table names to backend routes
    const tableMapping: { [key: string]: string } = {
      'vault_directories': 'directories',
      'credentials': 'credentials', 
      'activity_log': 'activity'
    };
    
    const backendTable = tableMapping[table] || table;
    
    return {
      select: (columns = '*') => ({
        eq: async (column: string, value: string | number | boolean) => {
          const response = await this.makeRequest(`/vault/${backendTable}?${column}=${value}`);
          return { data: response.data || response[backendTable] || [], error: null };
        },
        order: (column: string, options: { ascending: boolean } = { ascending: true }) => ({
          limit: async (count: number) => {
            const response = await this.makeRequest(`/vault/${backendTable}?orderBy=${column}&order=${options.ascending ? 'asc' : 'desc'}&limit=${count}`);
            return { data: response.data || response[backendTable] || [], error: null };
          }
        }),
        limit: async (count: number) => {
          const response = await this.makeRequest(`/vault/${backendTable}?limit=${count}`);
          return { data: response.data || response[backendTable] || [], error: null };
        }
      }),
      
      insert: (data: Record<string, unknown>) => ({
        select: async () => {
          try {
            // Map field names from frontend format to backend format
            const mappedData = { ...data };
            if ('user_id' in mappedData) {
              delete mappedData.user_id; // Backend gets userId from JWT token
            }
            if ('directory_id' in mappedData) {
              mappedData.directoryId = mappedData.directory_id;
              delete mappedData.directory_id;
            }
            if ('encrypted_password' in mappedData) {
              mappedData.encryptedPassword = mappedData.encrypted_password;
              delete mappedData.encrypted_password;
            }
            
            const response = await this.makeRequest(`/vault/${backendTable}`, {
              method: 'POST',
              body: JSON.stringify(mappedData)
            });
            return { data: response.directory || response.credential || response, error: null };
          } catch (error) {
            return { data: null, error: error instanceof Error ? error.message : 'Failed to create' };
          }
        }
      }),

      update: (data: Record<string, unknown>) => ({
        eq: async (column: string, value: string | number | boolean) => {
          try {
            const response = await this.makeRequest(`/vault/${backendTable}/${value}`, {
              method: 'PUT',
              body: JSON.stringify(data)
            });
            return { data: response, error: null };
          } catch (error) {
            return { data: null, error: error instanceof Error ? error.message : 'Failed to update' };
          }
        }
      }),

      delete: () => ({
        eq: async (column: string, value: string | number | boolean) => {
          try {
            const response = await this.makeRequest(`/vault/${backendTable}/${value}`, {
              method: 'DELETE'
            });
            return { data: response, error: null };
          } catch (error) {
            return { data: null, error: error instanceof Error ? error.message : 'Failed to delete' };
          }
        }
      })
    };
  }
}

export const mongoClient = new MongoDBClient();

// For now, let's create a mock implementation that works with localStorage
// This allows us to test the frontend changes before setting up the backend
class MockMongoDBClient {
  auth = {
    signUp: async (credentials: { email: string; password: string; options?: { data: { phone_number: string } } }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        email: credentials.email,
        phone_number: credentials.options?.data.phone_number,
        email_verified: false
      };

      const token = `mock_token_${user.id}`;
      setTokenInStorage(token);
      localStorage.setItem('mock_user', JSON.stringify(user));

      return { 
        data: { user, token },
        error: null 
      };
    },

    signIn: async (credentials: { email: string; password: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any password
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        email: credentials.email,
        phone_number: undefined,
        email_verified: true
      };

      const token = `mock_token_${user.id}`;
      setTokenInStorage(token);
      localStorage.setItem('mock_user', JSON.stringify(user));

      return { 
        data: { user, token },
        error: null 
      };
    },

    signOut: async () => {
      removeTokenFromStorage();
      localStorage.removeItem('mock_user');
      return { error: null };
    },

    getSession: async (): Promise<{ data: { session: Session | null } }> => {
      const token = getTokenFromStorage();
      const userStr = localStorage.getItem('mock_user');
      
      if (!token || !userStr) {
        return { data: { session: null } };
      }

      const user = JSON.parse(userStr);
      return {
        data: {
          session: {
            access_token: token,
            user
          }
        }
      };
    },

    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      // Check initial state
      this.auth.getSession().then(({ data }) => {
        callback('INITIAL_SESSION', data.session);
      });

      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  from(table: string) {
    return {
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        eq: () => Promise.resolve({ data: [], error: null })
      }),
      
      insert: () => ({
        select: () => Promise.resolve({ data: null, error: null })
      }),

      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),

      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    };
  }
}

// Export the real MongoDB client now that backend is ready
export const supabase = new MongoDBClient();