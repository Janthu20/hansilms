import { useEffect, useState } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, OperationType, handleFirestoreError } from '../firebase';
import { Plus, Trash2, Edit2, ChevronRight, BookOpen, Calendar, Video, FileText, LayoutDashboard, Settings } from 'lucide-react';

interface Course { id: string; title: string; description: string; thumbnail: string; }
interface Month { id: string; courseId: string; title: string; order: number; }
interface Week { id: string; monthId: string; title: string; zoomLink?: string; startTime?: string; endTime?: string; youtubeEmbedId?: string; pdfUrl?: string; order: number; }

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [months, setMonths] = useState<Month[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Form states
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: '' });
  const [newMonth, setNewMonth] = useState({ title: '', order: 0 });
  const [newWeek, setNewWeek] = useState({ title: '', zoomLink: '', startTime: '', endTime: '', youtubeEmbedId: '', pdfUrl: '', order: 0 });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchMonths(selectedCourseId);
    else setMonths([]);
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId && selectedMonthId) fetchWeeks(selectedCourseId, selectedMonthId);
    else setWeeks([]);
  }, [selectedCourseId, selectedMonthId]);

  const fetchCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      setCourses(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'courses'); }
    finally { setLoading(false); }
  };

  const fetchMonths = async (courseId: string) => {
    try {
      const q = query(collection(db, `courses/${courseId}/months`), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setMonths(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Month)));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, `courses/${courseId}/months`); }
  };

  const fetchWeeks = async (courseId: string, monthId: string) => {
    try {
      const q = query(collection(db, `courses/${courseId}/months/${monthId}/weeks`), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setWeeks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Week)));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, `courses/${courseId}/months/${monthId}/weeks`); }
  };

  const handleAddCourse = async () => {
    if (!newCourse.title) return;
    try {
      await addDoc(collection(db, 'courses'), newCourse);
      setNewCourse({ title: '', description: '', thumbnail: '' });
      fetchCourses();
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'courses'); }
  };

  const handleAddMonth = async () => {
    if (!selectedCourseId || !newMonth.title) return;
    try {
      await addDoc(collection(db, `courses/${selectedCourseId}/months`), { ...newMonth, courseId: selectedCourseId });
      setNewMonth({ title: '', order: months.length + 1 });
      fetchMonths(selectedCourseId);
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, `courses/${selectedCourseId}/months`); }
  };

  const handleAddWeek = async () => {
    if (!selectedCourseId || !selectedMonthId || !newWeek.title) return;
    try {
      await addDoc(collection(db, `courses/${selectedCourseId}/months/${selectedMonthId}/weeks`), { ...newWeek, monthId: selectedMonthId });
      setNewWeek({ title: '', zoomLink: '', startTime: '', endTime: '', youtubeEmbedId: '', pdfUrl: '', order: weeks.length + 1 });
      fetchWeeks(selectedCourseId, selectedMonthId);
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, `courses/${selectedCourseId}/months/${selectedMonthId}/weeks`); }
  };

  const handleDelete = async (path: string, id: string, callback: () => void) => {
    // In a real app, use a custom modal. For now, we'll just delete.
    try {
      await deleteDoc(doc(db, path, id));
      callback();
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, path); }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your courses, modules, and weekly sessions.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Courses Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Courses
            </h2>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
            <input
              type="text"
              placeholder="Course Title"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={newCourse.title}
              onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
              value={newCourse.description}
              onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
            />
            <button
              onClick={handleAddCourse}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="space-y-3">
            {courses.map(course => (
              <div
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedCourseId === course.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-100 hover:border-blue-100'}`}
              >
                <span className="font-bold text-gray-900">{course.title}</span>
                <button onClick={(e) => { e.stopPropagation(); handleDelete('courses', course.id, fetchCourses); }} className="text-gray-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Months Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Monthly Modules
          </h2>

          {!selectedCourseId ? (
            <div className="bg-gray-50 p-8 rounded-2xl text-center text-gray-400 border-2 border-dashed border-gray-200">
              Select a course to manage modules
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                <input
                  type="text"
                  placeholder="Module Title (e.g. Month 01)"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newMonth.title}
                  onChange={e => setNewMonth({ ...newMonth, title: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Order"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newMonth.order}
                  onChange={e => setNewMonth({ ...newMonth, order: parseInt(e.target.value) })}
                />
                <button
                  onClick={handleAddMonth}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Module</span>
                </button>
              </div>

              <div className="space-y-3">
                {months.map(month => (
                  <div
                    key={month.id}
                    onClick={() => setSelectedMonthId(month.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedMonthId === month.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-100 hover:border-blue-100'}`}
                  >
                    <span className="font-bold text-gray-900">{month.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(`courses/${selectedCourseId}/months`, month.id, () => fetchMonths(selectedCourseId)); }} className="text-gray-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Weeks Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            Weekly Sessions
          </h2>

          {!selectedMonthId ? (
            <div className="bg-gray-50 p-8 rounded-2xl text-center text-gray-400 border-2 border-dashed border-gray-200">
              Select a module to manage sessions
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                <input
                  type="text"
                  placeholder="Session Title (e.g. Week 01)"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newWeek.title}
                  onChange={e => setNewWeek({ ...newWeek, title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Zoom Link"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newWeek.zoomLink}
                  onChange={e => setNewWeek({ ...newWeek, zoomLink: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="YouTube Video ID"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newWeek.youtubeEmbedId}
                  onChange={e => setNewWeek({ ...newWeek, youtubeEmbedId: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="PDF URL"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newWeek.pdfUrl}
                  onChange={e => setNewWeek({ ...newWeek, pdfUrl: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="datetime-local"
                    className="p-3 border rounded-xl text-sm"
                    value={newWeek.startTime}
                    onChange={e => setNewWeek({ ...newWeek, startTime: e.target.value })}
                  />
                  <input
                    type="datetime-local"
                    className="p-3 border rounded-xl text-sm"
                    value={newWeek.endTime}
                    onChange={e => setNewWeek({ ...newWeek, endTime: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleAddWeek}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Session</span>
                </button>
              </div>

              <div className="space-y-3">
                {weeks.map(week => (
                  <div
                    key={week.id}
                    className="p-4 rounded-xl border bg-white border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{week.title}</span>
                      <span className="text-xs text-gray-400">Order: {week.order}</span>
                    </div>
                    <button onClick={() => handleDelete(`courses/${selectedCourseId}/months/${selectedMonthId}/weeks`, week.id, () => fetchWeeks(selectedCourseId!, selectedMonthId!))} className="text-gray-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
