import { Navigate, Outlet } from 'react-router-dom';

interface Props {
  role: string | null;
}

export default function AdminGuard({ role }: Props) {
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
