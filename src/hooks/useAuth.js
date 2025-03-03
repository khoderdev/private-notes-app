import { useState, useEffect, useCallback } from "react";
import { 
  signInWithEmailAndPasswordUser, 
  createUserWithEmailAndPasswordUser, 
  signInWithGoogleUser, 
  signOutUser,
  isQuotaExceeded,
  clearQuotaExceeded,
  checkQuotaResetTime,
  getQuotaResetTimeRemaining,
  onAuthStateChange,
  checkFirestoreAccess
} from "../services/firebase";
import { updateProfile } from "firebase/auth";

export const useAuth = (setFirebaseError, setFirestoreEnabled) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authEnabled, setAuthEnabled] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(0);

  const createLocalUser = useCallback(() => {
    const storedLocalUserId = localStorage.getItem("localUserId");

    if (storedLocalUserId) {
      console.log("Using stored local user:", storedLocalUserId);
      const localUser = {
        uid: storedLocalUserId,
        isAnonymous: true,
        providerId: "local",
        isLocalUser: true,
      };
      setUser(localUser);
    } else {
      const localUser = {
        uid: `local-${Date.now()}`,
        isAnonymous: true,
        providerId: "local",
        isLocalUser: true,
      };
      console.log("Created new local user:", localUser.uid);
      setUser(localUser);

      localStorage.setItem("localUserId", localUser.uid);
    }

    setAuthEnabled(false);
    return true;
  }, []);

  const signInWithEmail = useCallback(
    async (email, password) => {
      if (!authEnabled) {
        console.log("Auth is disabled, skipping email sign-in");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const userCredential = await signInWithEmailAndPasswordUser(email, password);
        
        if (userCredential && userCredential.user) {
          console.log("Email sign-in successful:", userCredential.user.uid);
          setUser(userCredential.user);

          const hasAccess = await checkFirestoreAccess();
          if (setFirestoreEnabled) {
            setFirestoreEnabled(hasAccess);
          }

          return userCredential.user;
        } else {
          console.error("Email sign-in returned no user");
          throw new Error("Authentication failed: No user returned");
        }
      } catch (err) {
        console.error("Email sign-in failed:", err);
        
        if (err.code === "auth/quota-exceeded") {
          console.log("Authentication quota exceeded, creating local user");
          setAuthEnabled(false);
          setError({
            code: "auth/quota-exceeded",
            message: "Authentication quota exceeded. Please try again later."
          });
          createLocalUser();
          return null;
        }
        
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [authEnabled, createLocalUser, setFirestoreEnabled]
  );

  const signUpWithEmail = useCallback(
    async (email, password) => {
      if (!email || !password) {
        setError({ message: "Email and password are required" });
        return null;
      }

      if (!authEnabled) {
        console.log("Auth is disabled, skipping email sign-up");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const userCredential = await createUserWithEmailAndPasswordUser(email, password);
        
        if (userCredential && userCredential.user) {
          console.log("Email sign-up successful:", userCredential.user.uid);

          const displayName = email.split('@')[0];
          try {
            await updateProfile(userCredential.user, {
              displayName: displayName
            });
            console.log("Profile updated with display name:", displayName);
          } catch (profileError) {
            console.error("Error updating profile:", profileError);
          }

          setUser(userCredential.user);

          const hasAccess = await checkFirestoreAccess();
          console.log("Firestore access after sign-up:", hasAccess);
          if (setFirestoreEnabled) {
            setFirestoreEnabled(hasAccess);
          }

          return userCredential.user;
        } else {
          console.error("Email sign-up returned no user");
          throw new Error("Authentication failed: No user returned from sign-up");
        }
      } catch (err) {
        console.error("Error during email sign-up:", err);
        
        if (err.code === "auth/quota-exceeded") {
          console.log("Authentication quota exceeded, creating local user");
          setAuthEnabled(false);
          setError({
            code: "auth/quota-exceeded",
            message: "Authentication quota exceeded. Please try again later."
          });
          createLocalUser();
          return null;
        }
        
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [authEnabled, setFirestoreEnabled, createLocalUser]
  );

  const signInWithGoogle = useCallback(async () => {
    if (!authEnabled) {
      console.log("Auth is disabled, skipping Google sign-in");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithGoogleUser();
      
      if (userCredential && userCredential.user) {
        console.log("Google sign-in successful:", userCredential.user.uid);
        setUser(userCredential.user);

        const hasAccess = await checkFirestoreAccess();
        if (setFirestoreEnabled) {
          setFirestoreEnabled(hasAccess);
        }

        return userCredential.user;
      } else {
        console.error("Google sign-in returned no user");
        throw new Error("Authentication failed: No user returned from Google sign-in");
      }
    } catch (err) {
      console.error("Error during Google sign-in:", err);
      
      if (err.code === "auth/quota-exceeded") {
        console.log("Authentication quota exceeded, creating local user");
        setError({
          code: "auth/quota-exceeded",
          message: "Authentication quota exceeded. Please try again later."
        });
        createLocalUser();
        return null;
      }

      setError(err);
      
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        return null;
      }
      
      createLocalUser();
      return null;
    } finally {
      setLoading(false);
    }
  }, [authEnabled, setFirestoreEnabled, createLocalUser]);

  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      if (user?.isLocalUser) {
        localStorage.removeItem("localUserId");
        setUser(null);
        return true;
      }

      await signOutUser();
      setUser(null);
      return true;
    } catch (err) {
      console.error("Error during sign-out:", err);
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const retryAuthentication = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAuthEnabled(true);
    setAuthAttempts(0);

    try {
      setLoading(false);
      return false;
    } catch (err) {
      console.error("Error during authentication retry:", err);
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearQuotaExceededFlag = useCallback(() => {
    clearQuotaExceeded();
    return true;
  }, []);

  const checkQuotaReset = useCallback(() => {
    return checkQuotaResetTime();
  }, []);

  const getQuotaResetRemaining = useCallback(() => {
    return getQuotaResetTimeRemaining();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    let authInitInProgress = false;

    const initializeAuth = async () => {
      if (authInitInProgress) {
        console.log("Auth initialization already in progress, skipping duplicate call");
        return;
      }
      
      authInitInProgress = true;
      
      try {
        if (isQuotaExceeded() && !checkQuotaResetTime()) {
          console.log("Authentication quota exceeded, using local user");
          createLocalUser();
          setLoading(false);
          return;
        }
        
        const storedLocalUserId = localStorage.getItem("localUserId");

        if (storedLocalUserId) {
          console.log("Found stored local user:", storedLocalUserId);
          setUser({
            uid: storedLocalUserId,
            isAnonymous: true,
            providerId: "local",
            isLocalUser: true,
          });
          setAuthEnabled(false);
          setLoading(false);
          return;
        }

        unsubscribe = onAuthStateChange((firebaseUser) => {
          if (firebaseUser) {
            console.log(
              "Auth state changed: User is signed in",
              firebaseUser.uid
            );
            setUser(firebaseUser);
            setLoading(false);

            checkFirestoreAccess().then((hasAccess) => {
              if (setFirestoreEnabled) {
                setFirestoreEnabled(hasAccess);
              }
            });
          } else {
            console.log("Auth state changed: No user is signed in");
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error during auth initialization:", err);
        setError(err);
        if (setFirebaseError) {
          setFirebaseError(err.message);
        }
        createLocalUser();
        setLoading(false);
      } finally {
        authInitInProgress = false;
      }
    };

    initializeAuth();

    return () => {
      unsubscribe();
    };
  }, [
    createLocalUser,
    setFirebaseError,
    setFirestoreEnabled,
  ]);

  return {
    user,
    loading,
    error,
    authEnabled,
    authAttempts,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    retryAuthentication,
    clearQuotaExceededFlag,
    checkQuotaReset,
    getQuotaResetRemaining,
    isQuotaExceeded: isQuotaExceeded
  };
};
