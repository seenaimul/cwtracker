import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvents } from '../App';
import { ChevronLeftIcon, TrashIcon } from '../components/Icons';

export const AddEventPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

  const isEditMode = Boolean(eventId);
  const existingEvent = isEditMode ? events.find(e => e.id === eventId) : undefined;

  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (isEditMode && existingEvent) {
      const dueDate = new Date(existingEvent.dueDate);
      setSubject(existingEvent.subject);
      setTitle(existingEvent.title);
      setDate(dueDate.toISOString().split('T')[0]); // YYYY-MM-DD
      setTime(dueDate.toTimeString().slice(0, 5));   // HH:MM
      setLocation(existingEvent.location || '');
    }
  }, [eventId, existingEvent, isEditMode]);

  const isFormValid = subject.trim() && title.trim() && date && time;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);

      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
        alert('Invalid date or time format.');
        return;
      }

      const dueDate = new Date(year, month - 1, day, hours, minutes).toISOString();

      const eventData = {
        subject: subject.trim(),
        title: title.trim(),
        dueDate,
        location: location.trim() || undefined,
      };

      if (isEditMode && existingEvent) {
        await updateEvent({ ...existingEvent, ...eventData });
      } else {
        await addEvent(eventData);
      }

      navigate('/');
    } catch (error: any) {

      console.error("Submission Error:", error.message || error);
      alert("Error: " + (error.message || "Something went wrong while submitting the event."));

    }
  };

  const handleDelete = async () => {
    if (isEditMode && eventId) {
      if (window.confirm('Are you sure you want to delete this event?')) {
        await deleteEvent(eventId);
        navigate('/');
      }
    }
  };

  return (
    <div className="p-4">
      <header className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeftIcon />
        </button>
        <h1 className="text-xl font-bold text-white text-center flex-grow">
          {isEditMode ? 'Edit Coursework' : 'Add New Coursework'}
        </h1>
        {isEditMode && (
          <button onClick={handleDelete} className="p-2 text-red-500 hover:text-red-400">
            <TrashIcon size={22} />
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-brand-accent-light">Subject Name</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Web Development"
            className="w-full bg-brand-secondary-dark p-3 rounded-lg border border-brand-accent focus:ring-brand-accent-light focus:border-brand-accent-light"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-brand-accent-light">Details</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Coursework 2"
            className="w-full bg-brand-secondary-dark p-3 rounded-lg border border-brand-accent focus:ring-brand-accent-light focus:border-brand-accent-light"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-brand-accent-light">Date of Submission</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-brand-secondary-dark p-3 rounded-lg border border-brand-accent focus:ring-brand-accent-light focus:border-brand-accent-light"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="time" className="text-sm font-medium text-brand-accent-light">Time of Submission</label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-brand-secondary-dark p-3 rounded-lg border border-brand-accent focus:ring-brand-accent-light focus:border-brand-accent-light"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-brand-accent-light">Exam Location (Optional)</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Online or Room 3B"
            className="w-full bg-brand-secondary-dark p-3 rounded-lg border border-brand-accent focus:ring-brand-accent-light focus:border-brand-accent-light"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-lg bg-brand-secondary-dark text-brand-light font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isFormValid
                ? 'bg-brand-accent text-white hover:bg-brand-accent/90'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {isEditMode ? 'Save Changes' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};
