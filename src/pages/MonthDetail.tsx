import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, collection, getDocs, doc, getDoc, query, orderBy, OperationType, handleFirestoreError } from '../firebase';
import { Calendar, ChevronRight, BookOpen, ArrowLeft, Video, Link as LinkIcon, FileText, Clock } from 'lucide-react';

interface Week {
  id: string;
  title: string;
  zoomLink?: string;
  startTime?: string;
  endTime?: string;
  youtubeEmbedId?: string;
  pdfUrl?: string;
  order: number;
}

interface Month {
  id: string;
  title: string;
  order: number;
}

export default function MonthDetail() {
  const { courseId, monthId } = useParams<{ courseId: string; monthId: string }>();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [month, setMonth] = useState<Month | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !monthId) return;

      try {
        // Fetch month details
        const monthDoc = await getDoc(doc(db, `courses/${courseId}/months`, monthId));
        if (monthDoc.exists()) {
          setMonth({ id: monthDoc.id, ...monthDoc.data() } as Month);
        }

        // Fetch weeks
        const weeksQuery = query(
          collection(db, `courses/${courseId}/months/${monthId}/weeks`),
          orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(weeksQuery);
        const weekList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Week));
        setWeeks(weekList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, `courses/${courseId}/months/${monthId}/weeks`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, monthId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!month) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Module not found</h2>
        <Link to={`/course/${courseId}`} className="text-blue-600 hover:underline mt-4 inline-block">Return to Course</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to={`/course/${courseId}`} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Course Modules
      </Link>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{month.title}</h1>
          <p className="text-gray-500 mt-1">Weekly sessions and learning materials for this module.</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl">
          <Calendar className="w-8 h-8 text-blue-600" />
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Sessions</h2>
        <div className="grid grid-cols-1 gap-6">
          {weeks.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center">
              <p className="text-gray-500">No weekly sessions have been added to this module yet.</p>
            </div>
          ) : (
            weeks.map((week, index) => (
              <Link
                key={week.id}
                to={`/course/${courseId}/month/${monthId}/week/${week.id}`}
                className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 active:scale-[0.995]"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                    W{index + 1}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {week.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {week.startTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(week.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        {week.zoomLink && (
                          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            <Video className="w-3 h-3" />
                            <span className="text-xs font-semibold">Live Session</span>
                          </div>
                        )}
                        {week.youtubeEmbedId && (
                          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            <Video className="w-3 h-3" />
                            <span className="text-xs font-semibold">Recording Available</span>
                          </div>
                        )}
                        {week.pdfUrl && (
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            <FileText className="w-3 h-3" />
                            <span className="text-xs font-semibold">Resources</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 font-semibold text-sm">
                  <span>View Session Details</span>
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
