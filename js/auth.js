// auth.js - Authentication helper functions
// This script uses Firebase Authentication for user sign-up and sign-in.
// Replace the firebaseConfig object with your Firebase project credentials.

// Firebase configuration (placeholder values). Replace with your actual config.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Determine whether to use Firebase. If apiKey has placeholder values, disable Firebase usage.
let firebaseApp;
const shouldUseFirebase =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith("YOUR_") &&
  !firebaseConfig.apiKey.startsWith("placeholder");
if (shouldUseFirebase && typeof firebase !== "undefined" && !firebase.apps?.length) {
  firebaseApp = firebase.initializeApp(firebaseConfig);
}

/**
 * Sign up a new user with email and password.
 * On success, store user data in localStorage.
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<object>}
 */
function signUp(email, password, name) {
  if (!email || !password) return Promise.reject(new Error("Missing email or password"));
  if (!shouldUseFirebase || !firebaseApp) {
    // Fallback: store user locally for demo purposes
    const user = { email, name };
    localStorage.setItem("user", JSON.stringify(user));
    return Promise.resolve(user);
  }
  return firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      // Update display name
      return cred.user
        .updateProfile({ displayName: name })
        .then(() => {
          localStorage.setItem(
            "user",
            JSON.stringify({ uid: cred.user.uid, email: cred.user.email, name: name })
          );
          return cred.user;
        });
    });
}

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
function signIn(email, password) {
  if (!email || !password) return Promise.reject(new Error("Missing email or password"));
  if (!shouldUseFirebase || !firebaseApp) {
    // Fallback: check localStorage for stored user
    const stored = localStorage.getItem("user");
    if (!stored) return Promise.reject(new Error("User not found"));
    const user = JSON.parse(stored);
    if (user.email !== email) return Promise.reject(new Error("Invalid credentials"));
    // In this simple fallback we do not check password
    return Promise.resolve(user);
  }
  return firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((cred) => {
      localStorage.setItem(
        "user",
        JSON.stringify({ uid: cred.user.uid, email: cred.user.email, name: cred.user.displayName })
      );
      return cred.user;
    });
}
