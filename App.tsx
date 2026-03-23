import React, { useState, createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import type { Coursework, Grade, Theme } from './types';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { AddEventPage } from './pages/AddEventPage';
import { AlarmPage } from './pages/AlarmPage';
import { ProfilePage } from './pages/ProfilePage';
import { CalendarPage } from './pages/CalendarPage';
import { GradesPage } from './pages/GradesPage';
import { DegreeCalculatorPage } from './pages/DegreeCalculatorPage';
import { HomeIcon, PlusIcon, ClockIcon } from './components/Icons';
import { supabase } from './supabase'; 
import { User, Session } from '@supabase/supabase-js';

// --- CONTEXTS ---

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType | null>(null);
interface AuthProviderProps { children: React.ReactNode; }
const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ currentUser, loading }), [currentUser, loading]);
  
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-brand-dark">
            <p className="text-light-text dark:text-brand-light">Loading...</p>
        </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface EventContextType {
  events: Coursework[];
  addEvent: (event: Omit<Coursework, 'id' | 'color'>) => Promise<void>;
  updateEvent: (event: Coursework) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}
const EventContext = createContext<EventContextType | null>(null);
interface EventProviderProps { children: React.ReactNode; }
const EventProvider = ({ children }: EventProviderProps) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Coursework[]>([]);

  useEffect(() => {
    if (currentUser) {
      const fetchEvents = async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('due_date', { ascending: true });
        if (data) {
          setEvents(data.map((d: any) => ({
             id: d.id, 
             subject: d.subject, 
             title: d.title, 
             dueDate: d.due_date, 
             location: d.location, 
             color: d.color 
          })));
        }
      };
      fetchEvents();

      const channel = supabase.channel('events_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${currentUser.id}` }, payload => {
          fetchEvents();
        }).subscribe();
        
      return () => { supabase.removeChannel(channel); };
    } else {
      setEvents([]);
    }
  }, [currentUser]);

  const addEvent = useCallback(async (event: Omit<Coursework, 'id' | 'color'>) => {
    if (!currentUser) return;
    const colors = ['bg-blue-400/20 border-blue-400', 'bg-purple-400/20 border-purple-400', 'bg-green-400/20 border-green-400', 'bg-teal-400/20 border-teal-400', 'bg-indigo-400/20 border-indigo-400'];
    const newEvent = { 
       user_id: currentUser.id,
       subject: event.subject,
       title: event.title,
       due_date: event.dueDate,
       location: event.location,
       color: colors[Math.floor(Math.random() * colors.length)] 
    };
    const { data } = await supabase.from('events').insert([newEvent]).select();
    if (data && data[0]) {
       const mappedEvent = {
         id: data[0].id, 
         subject: data[0].subject, 
         title: data[0].title, 
         dueDate: data[0].due_date, 
         location: data[0].location, 
         color: data[0].color 
       };
       setEvents(prev => [...prev, mappedEvent].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    }
  }, [currentUser]);

  const updateEvent = useCallback(async (updatedEvent: Coursework) => {
    if (!currentUser) return;
    const { id, subject, title, dueDate, location, color } = updatedEvent;
    await supabase.from('events').update({
       subject, title, due_date: dueDate, location, color
    }).eq('id', id);
    setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  }, [currentUser]);

  const deleteEvent = useCallback(async (eventId: string) => {
    if (!currentUser) return;
    await supabase.from('events').delete().eq('id', eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, [currentUser]);

  const value = useMemo(() => ({ events, addEvent, updateEvent, deleteEvent }), [events, addEvent, updateEvent, deleteEvent]);
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvents must be used within an EventProvider');
  return context;
};

interface GradesContextType {
  grades: Grade[];
  addGrade: (grade: Omit<Grade, 'id'>) => Promise<void>;
  upsertGrade: (gradeData: { moduleName: string; marks: number }) => Promise<void>;
  updateGrade: (updatedGrade: Grade) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
}
const GradesContext = createContext<GradesContextType | null>(null);
interface GradesProviderProps { children: React.ReactNode; }
const GradesProvider = ({ children }: GradesProviderProps) => {
    const { currentUser } = useAuth();
    const [grades, setGrades] = useState<Grade[]>([]);

    useEffect(() => {
        if (currentUser) {
            const fetchGrades = async () => {
               const { data } = await supabase.from('grades')
                 .select('*').eq('user_id', currentUser.id).order('module_name');
               if (data) {
                  setGrades(data.map((d: any) => ({ id: d.id, moduleName: d.module_name, marks: d.marks })));
               }
            };
            fetchGrades();

            const channel = supabase.channel('grades_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'grades', filter: `user_id=eq.${currentUser.id}` }, payload => {
              fetchGrades();
            }).subscribe();
            
            return () => { supabase.removeChannel(channel); };
        } else {
            setGrades([]);
        }
    }, [currentUser]);

    const addGrade = useCallback(async (grade: Omit<Grade, 'id'>) => {
        if (!currentUser) return;
        const { data } = await supabase.from('grades').insert([{ user_id: currentUser.id, module_name: grade.moduleName, marks: grade.marks }]).select();
        if (data && data[0]) {
            setGrades(prev => [...prev, { id: data[0].id, moduleName: data[0].module_name, marks: data[0].marks }]);
        }
    }, [currentUser]);

    const upsertGrade = useCallback(async (gradeData: { moduleName: string; marks: number }) => {
        if (!currentUser || !gradeData.moduleName.trim()) return;
        
        const { data } = await supabase.from('grades')
           .select('*').eq('user_id', currentUser.id).eq('module_name', gradeData.moduleName.trim());
           
        if (!data || data.length === 0) {
           const { data: newData } = await supabase.from('grades').insert([{ user_id: currentUser.id, module_name: gradeData.moduleName.trim(), marks: gradeData.marks }]).select();
           if (newData && newData[0]) {
               setGrades(prev => [...prev, { id: newData[0].id, moduleName: newData[0].module_name, marks: newData[0].marks }]);
           }
        } else {
           const docToUpdate = data[0];
           if (docToUpdate.marks !== gradeData.marks) {
               await supabase.from('grades').update({ marks: gradeData.marks }).eq('id', docToUpdate.id);
               setGrades(prev => prev.map(g => g.id === docToUpdate.id ? { ...g, marks: gradeData.marks } : g));
           }
        }
    }, [currentUser]);

    const updateGrade = useCallback(async (updatedGrade: Grade) => {
        if (!currentUser) return;
        const { id, moduleName, marks } = updatedGrade;
        await supabase.from('grades').update({ module_name: moduleName, marks }).eq('id', id);
        setGrades(prev => prev.map(g => g.id === id ? updatedGrade : g));
    }, [currentUser]);

    const deleteGrade = useCallback(async (id: string) => {
        if (!currentUser) return;
        await supabase.from('grades').delete().eq('id', id);
        setGrades(prev => prev.filter(g => g.id !== id));
    }, [currentUser]);

    const value = useMemo(() => ({ grades, addGrade, upsertGrade, updateGrade, deleteGrade }), [grades, addGrade, upsertGrade, updateGrade, deleteGrade]);
    return <GradesContext.Provider value={value}>{children}</GradesContext.Provider>;
};
export const useGrades = () => {
    const context = useContext(GradesContext);
    if (!context) throw new Error('useGrades must be used within a GradesProvider');
    return context;
};

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | null>(null);
interface ThemeProviderProps { children: React.ReactNode; }
const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>('dark');
    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);
    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

interface UserContextType {
    name: string;
    profilePic: string | null;
    setName: (name: string) => void;
    setProfilePic: (pic: string | null) => void;
}
const UserContext = createContext<UserContextType | null>(null);
interface UserProviderProps { children: React.ReactNode; }
const UserProvider = ({ children }: UserProviderProps) => {
    const { currentUser } = useAuth();
    const [name, setName] = useState(currentUser?.user_metadata?.display_name || 'John Doe');
    const [profilePic, setProfilePic] = useState<string | null>(null);

    useEffect(() => {
        if(currentUser) {
            const fetchProfile = async () => {
               const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
               if (data) {
                  setName(data.display_name || 'John Doe');
                  setProfilePic(data.photo_url || null);
               }
            };
            fetchProfile();
        }
    }, [currentUser]);

    const value = useMemo(() => ({ name, setName, profilePic, setProfilePic }), [name, profilePic, setName, setProfilePic]);
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};

// --- LAYOUT & ROUTING ---
interface ProtectedRouteProps { children: React.ReactNode; }
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

const TabBar = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-light-surface dark:bg-brand-secondary-dark h-20 border-t border-light-accent/20 dark:border-brand-accent/30 flex justify-around items-center z-50">
    <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-light-accent dark:text-white' : 'text-light-text-secondary dark:text-brand-accent-light'}`}>
      <HomeIcon />
      <span className="text-xs font-medium">Home</span>
    </NavLink>
    <NavLink to="/add" className="w-16 h-16 bg-light-accent dark:bg-brand-accent flex items-center justify-center rounded-full -translate-y-6 shadow-lg shadow-black/30 text-white">
      <PlusIcon size={32} />
    </NavLink>
    <NavLink to="/alarm" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-light-accent dark:text-white' : 'text-light-text-secondary dark:text-brand-accent-light'}`}>
      <ClockIcon />
      <span className="text-xs font-medium">Alarm</span>
    </NavLink>
  </nav>
);

const AppLayout = () => {
  const location = useLocation();
  const hideTabBarForRoutes = ['/add', '/edit', '/calendar', '/grades', '/degree-calculator', '/theme'];
  const hideTabBar = hideTabBarForRoutes.some(path => location.pathname.startsWith(path));

  return (
    <div className="bg-light-bg dark:bg-brand-dark text-light-text dark:text-brand-light min-h-screen font-sans pb-24">
      <div className="relative z-10">
        <Outlet />
      </div>
      {!hideTabBar && <TabBar />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>
          <EventProvider>
            <GradesProvider>
              <HashRouter>
                <Routes>
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/signup" element={<AuthPage initialMode="signup" />} />
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/add" element={<AddEventPage />} />
                    <Route path="/edit/:eventId" element={<AddEventPage />} />
                    <Route path="/alarm" element={<AlarmPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/grades" element={<GradesPage />} />
                    <Route path="/degree-calculator" element={<DegreeCalculatorPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </HashRouter>
            </GradesProvider>
          </EventProvider>
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
