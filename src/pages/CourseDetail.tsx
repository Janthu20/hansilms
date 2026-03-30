import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, collection, getDocs, doc, getDoc, query, orderBy, OperationType, handleFirestoreError } from '../firebase';
import { Calendar, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';

interface Month {
  id: string;
  title: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [months, setMonths] = useState<Month[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      try {
        // Fetch course details
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
        }

        // Fetch months
        const monthsQuery = query(
          collection(db, `courses/${courseId}/months`),
          orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(monthsQuery);
        const monthList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Month));
        setMonths(monthList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, `courses/${courseId}/months`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <header className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-lg">
          <img
            src={course.thumbnail || `https://picsum.photos/seed/${course.id}/600/400`}
            alt={course.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {course.description || 'No description available for this course.'}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{months.length} Monthly Modules</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>Self-paced Learning</span>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Monthly Modules</h2>
        <div className="grid grid-cols-1 gap-4">
          {months.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center">
              <p className="text-gray-500">No modules have been added to this course yet.</p>
            </div>
          ) : (
            months.map((month, index) => (
              <Link
                key={month.id}
                to={`/course/${course.id}/month/${month.id}`}
                className="group bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between active:scale-[0.995]"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {month.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Module {index + 1} of {months.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 font-semibold text-sm">
                  <span>View Weekly Sessions</span>
                  <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
