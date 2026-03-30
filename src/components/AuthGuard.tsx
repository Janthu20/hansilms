import { Navigate, Outlet } from 'react-router-dom';
import { FirebaseUser } from '../firebase';

interface Props {
  user: FirebaseUser | null;
}

export default function AuthGuard({ user }: Props) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
