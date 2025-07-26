
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../App';
import { ChevronLeftIcon, EditIcon } from '../components/Icons';
import { Coursework } from '../types';

type EditableEvent = Omit<Coursework, 'dueDate'> & { date: string; time: string; };

const EventDetailModal = ({ 
    event, 
    onClose, 
    onSave,
    mode,
    onSwitchToEdit,
    onCancelEdit,
}: { 
    event: Coursework; 
    onClose: () => void; 
    onSave: (updatedEvent: Coursework) => void;
    mode: 'view' | 'edit';
    onSwitchToEdit: () => void;
    onCancelEdit: () => void;
}) => {
    const [formData, setFormData] = useState<EditableEvent>(() => {
        const dueDate = new Date(event.dueDate);
        return {
            ...event,
            date: dueDate.toISOString().split('T')[0],
            time: dueDate.toTimeString().slice(0, 5),
        };
    });
    
    useEffect(() => {
        // Reset form data if the event prop changes
        const dueDate = new Date(event.dueDate);
        setFormData({
            ...event,
            date: dueDate.toISOString().split('T')[0],
            time: dueDate.toTimeString().slice(0, 5),
        });
    }, [event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const { subject, title, date, time, location } = formData;
        if (!subject || !title || !date || !time) return;

        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        const newDueDate = new Date(year, month - 1, day, hours, minutes).toISOString();

        onSave({ ...formData, dueDate: newDueDate });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-light-surface dark:bg-brand-secondary-dark rounded-xl p-6 w-full max-w-sm shadow-lg" onClick={e => e.stopPropagation()}>
                {mode === 'view' ? (
                    // --- VIEW MODE ---
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-light-text dark:text-white">{event.subject}</h3>
                                <p className="text-light-text-secondary dark:text-brand-accent-light">{event.title}</p>
                            </div>
                            <button onClick={onSwitchToEdit} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-brand-accent/50 text-light-text-secondary dark:text-brand-accent-light">
                                <EditIcon />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                           <p><strong className="text-light-text-secondary dark:text-brand-accent-light">Date:</strong> {new Date(event.dueDate).toLocaleDateString()}</p>
                           <p><strong className="text-light-text-secondary dark:text-brand-accent-light">Time:</strong> {new Date(event.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           {event.location && <p><strong className="text-light-text-secondary dark:text-brand-accent-light">Location:</strong> {event.location}</p>}
                        </div>
                        <div className="mt-6">
                            <button onClick={onClose} className="w-full py-2 rounded-lg bg-light-accent dark:bg-brand-accent text-white font-semibold hover:opacity-80 transition-opacity">
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- EDIT MODE ---
                    <div>
                         <h3 className="font-bold text-xl text-light-text dark:text-white mb-4">Edit Event</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-light-text-secondary dark:text-brand-accent-light">Subject</label>
                                <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-light-text dark:text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-light-text-secondary dark:text-brand-accent-light">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-light-text dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                <label className="text-xs text-light-text-secondary dark:text-brand-accent-light">Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-light-text dark:text-white" />
                                </div>
                                <div>
                                <label className="text-xs text-light-text-secondary dark:text-brand-accent-light">Time</label>
                                <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-light-text dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-light-text-secondary dark:text-brand-accent-light">Location</label>
                                <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-light-text dark:text-white" />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <button onClick={onCancelEdit} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-brand-secondary-dark text-light-text dark:text-brand-light font-semibold hover:opacity-80 transition-opacity">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="w-full py-2 rounded-lg bg-light-accent dark:bg-brand-accent text-white font-semibold hover:bg-light-accent-hover dark:hover:bg-brand-accent-light transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const CalendarPage = () => {
    const navigate = useNavigate();
    const { events, updateEvent } = useEvents();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Coursework | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDayOfWeek = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();
    
    const days = Array.from({ length: startDayOfWeek }, (_, i) => <div key={`empty-${i}`} className="p-2 border-r border-b border-gray-200 dark:border-brand-secondary-dark"></div>);

    const handleDayClick = (event: Coursework) => {
        setSelectedEvent(event);
        setModalMode('view');
    };

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.dueDate);
            return eventDate.getFullYear() === date.getFullYear() &&
                   eventDate.getMonth() === date.getMonth() &&
                   eventDate.getDate() === date.getDate();
        });
        
        days.push(
            <div key={day} className="p-2 border-r border-b border-gray-200 dark:border-brand-secondary-dark min-h-[100px] flex flex-col">
                <span className="font-semibold">{day}</span>
                <div className="mt-1 space-y-1 overflow-y-auto text-xs">
                    {dayEvents.map(event => (
                        <div key={event.id} onClick={() => handleDayClick(event)} className="p-1 rounded bg-light-accent/80 dark:bg-brand-accent/80 text-white truncate cursor-pointer hover:opacity-80 transition-opacity">
                            {event.title}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleSaveEvent = (updatedEvent: Coursework) => {
        updateEvent(updatedEvent);
        setSelectedEvent(null);
    };

    return (
        <div className="p-4">
            {selectedEvent && (
                <EventDetailModal 
                    event={selectedEvent} 
                    onClose={() => setSelectedEvent(null)} 
                    onSave={handleSaveEvent}
                    mode={modalMode}
                    onSwitchToEdit={() => setModalMode('edit')}
                    onCancelEdit={() => setModalMode('view')}
                />
            )}
            <header className="flex items-center mb-8 relative">
                <button onClick={() => navigate(-1)} className="p-2 absolute left-0">
                    <ChevronLeftIcon />
                </button>
                <div className="flex items-center justify-center flex-grow">
                    <button onClick={() => changeMonth(-1)} className="p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
                    </button>
                    <h1 className="text-xl font-bold text-light-text dark:text-white text-center w-40">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h1>
                     <button onClick={() => changeMonth(1)} className="p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-7 text-center font-bold text-sm text-light-text-secondary dark:text-brand-accent-light">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 border-t border-l border-gray-200 dark:border-brand-secondary-dark bg-light-surface dark:bg-brand-secondary-dark/30">
                {days}
            </div>
        </div>
    );
};

export { CalendarPage };
