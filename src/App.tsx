/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, db, doc, getDoc, setDoc, FirebaseUser } from './firebase';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import MonthDetail from './pages/MonthDetail';
import WeekDetail from './pages/WeekDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Set loading to true whenever auth state changes
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Fetch user role
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              setRole(userDoc.data().role);
            } else {
              // Create default student profile
              const isAdminEmail = firebaseUser.email === 'xpisuru@gmail.com';
              const defaultRole = isAdminEmail ? 'admin' : 'student';
              
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                role: defaultRole,
                createdAt: new Date().toISOString()
              });
              
              setRole(defaultRole);
            }
          } catch (firestoreError) {
            console.error('Firestore error:', firestoreError);
            setRole(firebaseUser.email === 'xpisuru@gmail.com' ? 'admin' : 'student');
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar user={user} role={role} />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              
              <Route element={<AuthGuard user={user} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/course/:courseId" element={<CourseDetail />} />
                <Route path="/course/:courseId/month/:monthId" element={<MonthDetail />} />
                <Route path="/course/:courseId/month/:monthId/week/:weekId" element={<WeekDetail />} />
              </Route>

              <Route element={<AdminGuard role={role} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} EduConnect LMS. All rights reserved.
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
