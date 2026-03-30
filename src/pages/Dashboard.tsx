import { useEffect, useState } from 'react';
import { db, collection, getDocs, OperationType, handleFirestoreError } from '../firebase';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, GraduationCap } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const courseList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Course));
        setCourses(courseList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">Select a course to continue your learning journey.</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-xl">
          <GraduationCap className="w-8 h-8 text-blue-600" />
        </div>
      </header>

      {courses.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No courses available</h3>
          <p className="text-gray-500 mt-2">Check back later for new learning content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={course.thumbnail || `https://picsum.photos/seed/${course.id}/600/400`}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-500 mt-2 line-clamp-2 text-sm">
                  {course.description || 'No description available for this course.'}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Active Course
                  </span>
                  <div className="flex items-center text-blue-600 font-semibold text-sm">
                    <span>View Modules</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
