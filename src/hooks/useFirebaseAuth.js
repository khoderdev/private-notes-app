import { useState, useEffect, useCallback } from 'react';
import { signInAnonymouslyUser, onAuthStateChange, checkFirestoreAccess } from '../services/firebase';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authEnabled, setAuthEnabled] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [authInProgress, setAuthInProgress] = useState(false);
  const MAX_AUTH_ATTEMPTS = 3;

  // Create a local user as fallback if Firebase auth fails
  const createLocalUser = useCallback(() => {
    // Check if we have a stored local user ID first
    const storedLocalUserId = localStorage.getItem('localUserId');
    
    if (storedLocalUserId) {
      console.log("Using stored local user:", storedLocalUserId);
      const localUser = {
        uid: storedLocalUserId,
        isAnonymous: true,
        providerId: 'local',
        isLocalUser: true // Flag to identify local users
      };
      setUser(localUser);
    } else {
      // Create a new local user
      const localUser = {
        uid: `local-${Date.now()}`,
        isAnonymous: true,
        providerId: 'local',
        isLocalUser: true
      };
      console.log("Created new local user:", localUser.uid);
      setUser(localUser);
      
      // Store local user ID in localStorage for persistence
      localStorage.setItem('localUserId', localUser.uid);
    }
    
    setAuthEnabled(false);
  }, []);

  // Try to sign in anonymously
  const signInAnonymously = useCallback(async (attempt = 1) => {
    if (!authEnabled) {
      console.log("Auth is disabled, skipping anonymous sign-in");
      return null;
    }
    
    if (authInProgress) {
      console.log("Authentication already in progress, skipping duplicate request");
      return null;
    }
    
    if (attempt > MAX_AUTH_ATTEMPTS) {
      console.error(`Failed to sign in after ${MAX_AUTH_ATTEMPTS} attempts, falling back to local user`);
      setAuthEnabled(false);
      createLocalUser();
      return null;
    }
    
    try {
      setAuthInProgress(true);
      console.log(`Attempting anonymous sign-in (attempt ${attempt}/${MAX_AUTH_ATTEMPTS})`);
      setAuthAttempts(attempt);
      
      const firebaseUser = await signInAnonymouslyUser();
      if (firebaseUser) {
        console.log("Sign-in successful:", firebaseUser.uid);
        setUser(firebaseUser);
        return firebaseUser;
      } else {
        console.log(`Sign-in attempt ${attempt} failed, retrying...`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        return signInAnonymously(attempt + 1);
      }
    } catch (err) {
      console.error(`Error during sign-in attempt ${attempt}:`, err);
      
      if (attempt < MAX_AUTH_ATTEMPTS) {
        console.log(`Retrying sign-in (attempt ${attempt + 1}/${MAX_AUTH_ATTEMPTS})...`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        return signInAnonymously(attempt + 1);
      } else {
        console.error(`Failed to sign in after ${MAX_AUTH_ATTEMPTS} attempts, falling back to local user`);
        setError(err);
        setAuthEnabled(false);
        createLocalUser();
        return null;
      }
    } finally {
      setAuthInProgress(false);
    }
  }, [authEnabled, createLocalUser, authInProgress]);

  // Initialize authentication
  useEffect(() => {
    let unsubscribe = () => {};
    let authInitialized = false;

    const initializeAuth = async () => {
      try {
        // First check if we have a stored local user ID
        const storedLocalUserId = localStorage.getItem('localUserId');
        
        if (storedLocalUserId) {
          console.log("Found stored local user:", storedLocalUserId);
          setUser({
            uid: storedLocalUserId,
            isAnonymous: true,
            providerId: 'local',
            isLocalUser: true
          });
          setAuthEnabled(false);
          setLoading(false);
          authInitialized = true;
          return;
        }
        
        // Listen for auth state changes first
        unsubscribe = onAuthStateChange((firebaseUser) => {
          if (firebaseUser) {
            console.log("Auth state changed: User is signed in", firebaseUser.uid);
            setUser(firebaseUser);
            setLoading(false);
            authInitialized = true;
            
            // Check Firestore access
            checkFirestoreAccess().then(hasAccess => {
              console.log("Firestore access check result:", hasAccess);
            });
          } else if (!authInitialized) {
            console.log("Auth state changed: No user, and not initialized yet");
            // Only try to sign in if we haven't successfully initialized auth yet
            signInAnonymously();
          } else {
            console.log("Auth state changed: No user, but already initialized");
            setUser(null);
            setLoading(false);
          }
        });
        
        // Wait a short time for auth state to be established
        setTimeout(() => {
          if (!authInitialized) {
            console.log("No auth state detected after timeout, trying anonymous sign-in");
            signInAnonymously();
          }
        }, 2000);
      } catch (err) {
        console.error("Error during auth initialization:", err);
        setError(err);
        createLocalUser();
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [signInAnonymously, createLocalUser]);

  // Function to retry authentication
  const retryAuthentication = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAuthEnabled(true);
    setAuthAttempts(0);
    
    try {
      const newUser = await signInAnonymously();
      setLoading(false);
      return !!newUser;
    } catch (err) {
      console.error("Error during authentication retry:", err);
      setError(err);
      setLoading(false);
      return false;
    }
  }, [signInAnonymously]);

  return {
    user,
    loading,
    error,
    authEnabled,
    authAttempts,
    signInAnonymously,
    retryAuthentication,
    createLocalUser
  };
};
