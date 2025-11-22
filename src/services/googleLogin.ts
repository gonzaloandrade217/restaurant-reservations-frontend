import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;

    return {
      ok: true,
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      token: await user.getIdToken(),
    };
  } catch (err) {
    console.error("Error Google Login:", err);
    return { ok: false, error: err };
  }
};
