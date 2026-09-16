import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { authService } from '@/features/auth/services/auth.service';
import { resetPasswordSchema } from '@/features/auth/schemas/auth.schema';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEmailError(null);

    const parsed = resetPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? 'Invalid email.');
      return;
    }

    setIsLoading(true);
    const { error } = await authService.resetPassword({ email });
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to send reset email. Please try again.');
      return;
    }

    setSuccess(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F4F6F9 0%, #ECF2FF 50%, #E8F7FF 100%)',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(93, 135, 255, 0.35)',
              mb: 2,
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>
              V
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
            {success ? 'Check your inbox' : 'Forgot password?'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {success
              ? `We've sent a password reset link to ${email}`
              : "Enter your email address and we'll send you a reset link."}
          </Typography>
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {success ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #13DEB9 0%, #02b3a9 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(19, 222, 185, 0.35)',
                    mb: 2,
                  }}
                >
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.75rem' }}>✓</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Didn't receive an email? Check your spam folder or try again.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => { setSuccess(false); setEmail(''); }}
                >
                  Try Again
                </Button>
              </Box>
            ) : (
              <>
                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {errorMessage}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      id="forgot-email"
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={Boolean(emailError)}
                      helperText={emailError}
                      fullWidth
                      autoFocus
                      autoComplete="email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email fontSize="small" sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      id="forgot-submit"
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={isLoading}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4570EA 0%, #23afdb 100%)',
                        },
                      }}
                    >
                      {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Link'}
                    </Button>
                  </Box>
                </Box>
              </>
            )}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <ArrowBack fontSize="small" />
                Back to Sign In
              </Link>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          color="text.disabled"
          align="center"
          display="block"
          sx={{ mt: 3 }}
        >
          Multi-Vendor Event Business Platform · V3.2
        </Typography>
      </Box>
    </Box>
  );
};
