import firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDcgOKOzyl6WvWZRb0prqExBrnmA4wvMjc",
  // authDomain: "imminent-by-weinvincible.firebaseapp.com",
  authDomain: "imminentness.netlify.app",
  projectId: "imminent-by-weinvincible",
  storageBucket: "imminent-by-weinvincible.appspot.com",
  messagingSenderId: "134498210398",
  appId: "1:134498210398:web:5ba57e6a7311223a89dacf",
  measurementId: "G-GRX9LK907Q",
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firbaseProvider = new firebase.auth.GoogleAuthProvider();

export const switchAccount = () => auth.signInWithRedirect(firbaseProvider);
