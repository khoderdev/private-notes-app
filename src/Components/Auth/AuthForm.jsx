import React, { useState, useContext } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Divider, 
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../hooks/useAuth';
import { DataContext } from '../../Context/DataProvider';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '400px',
  margin: '0 auto',
  marginTop: theme.spacing(4),
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const AuthButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.2),
  fontWeight: 600,
}));

const OrDivider = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(3, 0),
}));

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { setFirebaseError, setFirestoreEnabled } = useContext(DataContext);

  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    error: authError,
    isQuotaExceeded,
    loading
  } = useAuth(setFirebaseError, setFirestoreEnabled);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear form and errors when switching modes
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = () => {
    if (!isLogin) {
      if (!confirmPassword) {
        setConfirmPasswordError('Please confirm your password');
        return false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        return false;
      }
      setConfirmPasswordError('');
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions while loading
    if (loading) {
      return;
    }

    // Validate form
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    if (!isLogin && !validateConfirmPassword()) {
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      // Error is handled by the useAuth hook
      console.error('Authentication error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    // Prevent multiple attempts while loading
    if (loading) {
      return;
    }
    
    try {
      await signInWithGoogle();
    } catch (err) {
      // Error is handled by the useAuth hook
      console.error('Google sign-in error:', err);
    }
  };

  // Format error message for display
  const getErrorMessage = () => {
    if (!authError) return null;
    
    // Handle specific error codes with user-friendly messages
    switch (authError.code) {
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up instead.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/quota-exceeded':
        return 'Authentication service is temporarily unavailable. Your notes will be saved locally.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      default:
        return authError.message || 'Authentication failed. Please try again.';
    }
  };

  // Check if quota is exceeded to show appropriate UI
  const quotaExceeded = authError?.code === 'auth/quota-exceeded' || isQuotaExceeded();

  return (
    <FormContainer elevation={3}>
      <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">
        {isLogin ? 'Sign In' : 'Create Account'}
      </Typography>
      
      <Typography variant="body2" color="textSecondary" paragraph align="center">
        {isLogin 
          ? 'Sign in to access your notes from anywhere' 
          : 'Create an account to save and sync your notes'}
      </Typography>
      
      {authError && (
        <Alert severity={quotaExceeded ? "info" : "error"} sx={{ mb: 2 }}>
          {getErrorMessage()}
        </Alert>
      )}
      
      {quotaExceeded && !authError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Authentication service is temporarily unavailable. Your notes will be saved locally.
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={validateEmail}
          error={!!emailError}
          helperText={emailError}
          disabled={loading}
        />
        
        <FormField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={validatePassword}
          error={!!passwordError}
          helperText={passwordError}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        {!isLogin && (
          <FormField
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={validateConfirmPassword}
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
            disabled={loading}
          />
        )}
        
        <AuthButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            isLogin ? 'Sign In' : 'Sign Up'
          )}
        </AuthButton>
      </form>
      
      <OrDivider>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="textSecondary" sx={{ px: 2 }}>
          OR
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </OrDivider>
      
      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignIn}
        sx={{ mb: 2 }}
        disabled={loading}
      >
        Continue with Google
      </Button>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Button
            color="primary"
            onClick={toggleAuthMode}
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
            disabled={loading}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Button>
        </Typography>
      </Box>
    </FormContainer>
  );
};

export default AuthForm;
