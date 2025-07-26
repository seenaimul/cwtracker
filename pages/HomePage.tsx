
import React, { useState, useEffect } from 'react';
import { useEvents, useTheme, useUser } from '../App';
import { ViewMode, Coursework } from '../types';
import { Link } from 'react-router-dom';
import { SunIcon, MoonIcon } from '../components/Icons';

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return currentTime;
};

const useCountdown = (targetDate: string) => {
  const countDownDate = new Date(targetDate).getTime();
  const [countDown, setCountDown] = useState(countDownDate - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};


const CountdownView = ({ dueDate }: { dueDate: string }) => {
  const { days, hours, minutes, seconds } = useCountdown(dueDate);

  if (days < 0 && hours < 0 && minutes < 0) {
      return <div className="text-center font-bold text-lg text-rose-500 dark:text-rose-400">EXPIRED</div>;
  }

  return (
    <div className="flex justify-center items-end gap-1 text-light-text dark:text-brand-light">
      <div>
        <p className="text-2xl font-bold">{String(Math.max(0, days)).padStart(2, '0')}</p>
        <p className="text-xs text-center text-light-text-secondary dark:text-brand-accent-light">DAYS</p>
      </div>
      <p className="text-2xl font-bold -translate-y-2">:</p>
      <div>
        <p className="text-2xl font-bold">{String(Math.max(0, hours)).padStart(2, '0')}</p>
        <p className="text-xs text-center text-light-text-secondary dark:text-brand-accent-light">HRS</p>
      </div>
       <p className="text-2xl font-bold -translate-y-2">:</p>
      <div>
        <p className="text-2xl font-bold">{String(Math.max(0, minutes)).padStart(2, '0')}</p>
        <p className="text-xs text-center text-light-text-secondary dark:text-brand-accent-light">MIN</p>
      </div>
       <p className="text-2xl font-bold -translate-y-2">:</p>
      <div>
        <p className="text-2xl font-bold">{String(Math.max(0, seconds)).padStart(2, '0')}</p>
        <p className="text-xs text-center text-light-text-secondary dark:text-brand-accent-light">SEC</p>
      </div>
    </div>
  );
};

const DateView = ({ dueDate }: { dueDate: string }) => {
  const date = new Date(dueDate);
  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
      <div className="text-center">
          <p className="text-3xl font-bold text-light-text dark:text-brand-light">{formattedDate}</p>
          <p className="text-lg text-light-text-secondary dark:text-brand-accent-light">{formattedTime}</p>
      </div>
  );
};

const getDynamicColor = (dueDate: string, defaultColor: string) => {
    const now = new Date().getTime();
    const due = new Date(dueDate).getTime();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours <= 0) return 'bg-gray-200 dark:bg-gray-500/20 border-gray-400 dark:border-gray-500';
    if (diffHours <= 24) return 'bg-red-200 dark:bg-red-500/20 border-red-400 dark:border-red-500';
    if (diffHours <= 24 * 7) return 'bg-yellow-200 dark:bg-yellow-500/20 border-yellow-400 dark:border-yellow-500';
    return defaultColor.replace('bg-', 'bg-opacity-40 dark:bg-opacity-100 dark:bg-');
};


interface EventCardProps {
    event: Coursework;
    viewMode: ViewMode;
}

const EventCard = ({ event, viewMode }: EventCardProps) => {
    const dynamicColor = getDynamicColor(event.dueDate, event.color);
  return (
    <div className={`p-4 rounded-xl border ${dynamicColor} space-y-3 shadow-md bg-opacity-40 dark:bg-opacity-100`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-light-text dark:text-brand-light">{event.subject}</h3>
          <p className="text-sm text-light-text-secondary dark:text-brand-accent-light">{event.title}</p>
        </div>
        {event.location && <span className="text-xs bg-light-accent dark:bg-brand-accent text-white px-2 py-1 rounded-full">{event.location}</span>}
      </div>
      {viewMode === ViewMode.CLOCK ? <CountdownView dueDate={event.dueDate} /> : <DateView dueDate={event.dueDate} />}
    </div>
  );
};

export const HomePage = () => {
  const { events } = useEvents();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CLOCK);
  const currentTime = useCurrentTime();
  const { theme, toggleTheme } = useTheme();
  const { name, profilePic } = useUser();
  const userInitial = name ? name.charAt(0).toUpperCase() : 'A';


  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white">CourseTracker App</h1>
          <p className="text-sm text-light-text-secondary dark:text-brand-accent-light">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()} {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="text-light-text-secondary dark:text-brand-accent-light hover:text-light-text dark:hover:text-white transition-colors p-2 rounded-full">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link to="/profile" className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-500 text-white font-bold text-lg relative shadow-md">
              {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                  <span>{userInitial}</span>
              )}
            </Link>
        </div>
      </header>

      <div className="flex justify-center p-1 rounded-lg bg-light-surface dark:bg-brand-secondary-dark">
        <button
          onClick={() => setViewMode(ViewMode.CLOCK)}
          className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === ViewMode.CLOCK ? 'bg-light-accent dark:bg-brand-accent text-white' : 'text-light-text-secondary dark:text-brand-accent-light'}`}
        >
          CLOCK VIEW
        </button>
        <button
          onClick={() => setViewMode(ViewMode.DATE)}
          className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === ViewMode.DATE ? 'bg-light-accent dark:bg-brand-accent text-white' : 'text-light-text-secondary dark:text-brand-accent-light'}`}
        >
          DATE VIEW
        </button>
      </div>

      <main className="space-y-4">
        {events.length > 0 ? (
          events.map(event => 
            <Link to={`/edit/${event.id}`} key={event.id} className="block hover:opacity-80 transition-opacity">
              <EventCard event={event} viewMode={viewMode} />
            </Link>
          )
        ) : (
          <div className="text-center py-10">
            <p className="text-light-text-secondary dark:text-brand-accent-light">No events yet.</p>
            <p className="text-light-text-secondary dark:text-brand-accent-light">Tap the '+' button to add one.</p>
          </div>
        )}
      </main>
    </div>
  );
};
