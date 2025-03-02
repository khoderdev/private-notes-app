import { useState, useEffect } from 'react';
import { signInAnonymousUser, onAuthStateChange } from '../services/firebase';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authEnabled, setAuthEnabled] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        // First, try to sign in anonymously to check if auth is properly configured
        const initialUser = await signInAnonymousUser();
        
        if (initialUser) {
          console.log("Initial anonymous sign-in successful", initialUser.uid);
          setUser(initialUser);
          
          // Listen for auth state changes
          unsubscribe = onAuthStateChange((firebaseUser) => {
            if (firebaseUser) {
              console.log("Auth state changed: User is signed in", firebaseUser.uid);
              setUser(firebaseUser);
            } else {
              console.log("Auth state changed: No user");
              // Try to sign in anonymously if no user is found
              signInAnonymously();
            }
          });
        } else {
          console.log("Initial anonymous sign-in failed, creating local user");
          setAuthEnabled(false);
          createLocalUser();
        }
      } catch (err) {
        console.error("Error during auth initialization:", err);
        setAuthEnabled(false);
        createLocalUser();
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const signInAnonymously = async () => {
      if (!authEnabled) {
        console.log("Auth is disabled, skipping anonymous sign-in");
        return;
      }
      
      try {
        console.log("Attempting anonymous sign-in");
        const firebaseUser = await signInAnonymousUser();
        if (firebaseUser) {
          console.log("Anonymous sign-in successful", firebaseUser.uid);
          setUser(firebaseUser);
        } else {
          console.log("Anonymous sign-in failed, creating local user");
          setAuthEnabled(false);
          createLocalUser();
        }
      } catch (err) {
        console.error("Error signing in anonymously:", err);
        setAuthEnabled(false);
        createLocalUser();
        setError(err);
      }
    };

    const createLocalUser = () => {
      // Create a local user as fallback if Firebase auth fails
      const localUser = {
        uid: `local-${Date.now()}`,
        isAnonymous: true,
        providerId: 'local',
        isLocalUser: true // Flag to identify local users
      };
      console.log("Created local user:", localUser.uid);
      setUser(localUser);
      
      // Store local user ID in localStorage for persistence
      localStorage.setItem('localUserId', localUser.uid);
    };

    // Check if we have a stored local user ID
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
    } else {
      initializeAuth();
    }

    // Cleanup function
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { user, loading, error, authEnabled };
};
