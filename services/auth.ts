
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "./firebase.ts";

const ADMIN_DEFAULT = {
  email: "rochedomarmorariainhumas@gmail.com",
  password: "Rochedo@2026%"
};

// Mock User para quando o Firebase não estiver configurado
const mockAdminUser = {
  uid: 'admin-rochedo',
  email: ADMIN_DEFAULT.email,
  displayName: 'Administrador Rochedo',
} as User;

export const login = async (email: string, pass: string): Promise<User> => {
  const isLocalAdmin = email === ADMIN_DEFAULT.email && pass === ADMIN_DEFAULT.password;

  try {
    // Tentativa com Firebase real
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error: any) {
    console.warn("Auth processing error:", error.code || error.message);

    // Lógica de fallback local para o administrador
    if (isLocalAdmin) {
      // Se for erro de credencial não encontrada, tentamos criar
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
          return userCredential.user;
        } catch (createError: any) {
          console.error("Firebase create error:", createError);
          // Se falhar a criação (ex: erro de API Key), usamos o mock
          return activateMock();
        }
      }
      
      // Se for erro de API ou rede, usamos o mock imediatamente para o admin
      return activateMock();
    }
    throw error;
  }
};

const activateMock = (): User => {
  console.info("Usando modo de contingência local para Administrador.");
  localStorage.setItem('rochedo_mock_auth', 'true');
  window.dispatchEvent(new Event('auth-change'));
  return mockAdminUser;
};

export const logout = async () => {
  localStorage.removeItem('rochedo_mock_auth');
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Erro no signOut do Firebase:", e);
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // Escuta o Firebase real
  let unsubscribeFirebase = () => {};
  try {
    unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      if (user) {
        callback(user);
      } else {
        const isMocked = localStorage.getItem('rochedo_mock_auth') === 'true';
        callback(isMocked ? mockAdminUser : null);
      }
    });
  } catch (e) {
    console.error("Falha ao subscrever no Firebase Auth:", e);
    // Em caso de erro catastrófico no SDK, checa o mock
    const isMocked = localStorage.getItem('rochedo_mock_auth') === 'true';
    callback(isMocked ? mockAdminUser : null);
  }

  const handleManualChange = () => {
    const isMocked = localStorage.getItem('rochedo_mock_auth') === 'true';
    if (isMocked) callback(mockAdminUser);
  };

  window.addEventListener('auth-change', handleManualChange);

  return () => {
    unsubscribeFirebase();
    window.removeEventListener('auth-change', handleManualChange);
  };
};

export const getAuthErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Usuário não encontrado ou credenciais inválidas.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/invalid-email':
      return 'Formato de e-mail inválido.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Erro de acesso. Verifique suas credenciais.';
  }
};
