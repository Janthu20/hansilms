import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, doc, getDoc, OperationType, handleFirestoreError } from '../firebase';
import { Video, FileText, Clock, ArrowLeft, ExternalLink, Download, Youtube, Info } from 'lucide-react';

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

export default function WeekDetail() {
  const { courseId, monthId, weekId } = useParams<{ courseId: string; monthId: string; weekId: string }>();
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !monthId || !weekId) return;

      try {
        const weekDoc = await getDoc(doc(db, `courses/${courseId}/months/${monthId}/weeks`, weekId));
        if (weekDoc.exists()) {
          setWeek({ id: weekDoc.id, ...weekDoc.data() } as Week);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `courses/${courseId}/months/${monthId}/weeks/${weekId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, monthId, weekId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Session not found</h2>
        <Link to={`/course/${courseId}/month/${monthId}`} className="text-blue-600 hover:underline mt-4 inline-block">Return to Module</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link to={`/course/${courseId}/month/${monthId}`} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Weekly Sessions
      </Link>

      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{week.title}</h1>
        <div className="flex flex-wrap items-center gap-6 text-gray-600">
          {week.startTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">
                {new Date(week.startTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
              </span>
            </div>
          )}
          {week.endTime && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">to</span>
              <span className="font-medium">
                {new Date(week.endTime).toLocaleString([], { timeStyle: 'short' })}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* YouTube Embed Section */}
          {week.youtubeEmbedId ? (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Youtube className="w-6 h-6 text-red-600" />
                <h2>Session Recording</h2>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${week.youtubeEmbedId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </section>
          ) : (
            <div className="bg-gray-100 aspect-video rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
              <Video className="w-16 h-16 mb-4" />
              <p className="font-medium">Recording will be available after the live session.</p>
            </div>
          )}

          {/* Resources Section */}
          {week.pdfUrl && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <FileText className="w-6 h-6 text-green-600" />
                <h2>Learning Resources</h2>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded-xl">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Session Handouts & Notes</h3>
                    <p className="text-sm text-gray-500">PDF Document • Download for offline study</p>
                  </div>
                </div>
                <a
                  href={week.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          {/* Zoom Link Section */}
          <section className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Video className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Live Session</h2>
            </div>
            
            <p className="text-blue-100 text-sm leading-relaxed">
              Join our live interactive session via Zoom. Please ensure you have the Zoom app installed and your microphone ready.
            </p>

            {week.zoomLink ? (
              <a
                href={week.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 py-4 px-6 rounded-2xl font-bold hover:bg-blue-50 transition-all active:scale-[0.98] shadow-lg"
              >
                <span>Join Zoom Meeting</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            ) : (
              <div className="bg-white/10 p-4 rounded-2xl text-center text-sm font-medium border border-white/20">
                Zoom link will be shared here before the session starts.
              </div>
            )}
          </section>

          {/* Quick Info Card */}
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <Info className="w-5 h-5 text-blue-600" />
              <h3>Quick Information</h3>
            </div>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Attendance is mandatory for live sessions.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Recordings are usually uploaded within 24 hours.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Download the PDF resources before the session.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
