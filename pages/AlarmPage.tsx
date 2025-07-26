
import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, RefreshCwIcon } from '../components/Icons';
import { Alarm, DayOfWeek } from '../types';

type Tab = 'ALARM' | 'STOPWATCH' | 'POMODORO';
type ClockType = 'analog-numbered' | 'analog-ticked' | 'digital';

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) => {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                enabled ? 'bg-light-accent dark:bg-brand-accent' : 'bg-gray-300 dark:bg-brand-secondary-dark'
            }`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
};


const AnalogClockNumbered = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondHandRotation = seconds * 6;
    const minuteHandRotation = minutes * 6 + seconds * 0.1;
    const hourHandRotation = (hours % 12) * 30 + minutes * 0.5;

    return (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-light-surface dark:bg-brand-secondary-dark border-8 border-light-text dark:border-brand-accent shadow-lg flex items-center justify-center mx-auto">
            {/* Numbers */}
            {[...Array(12)].map((_, i) => {
                const number = i + 1;
                return (
                    <div key={`num-${i}`} className="absolute w-full h-full" style={{ transform: `rotate(${number * 30}deg)` }}>
                        <span
                            className="absolute top-[8px] sm:top-4 left-1/2 -translate-x-1/2 font-bold text-base sm:text-xl text-light-text dark:text-white"
                            style={{ transform: `rotate(-${number * 30}deg)` }}
                        >
                            {number}
                        </span>
                    </div>
                );
            })}
            
            <div className="absolute w-2 h-12 sm:h-20 bg-light-text-secondary dark:bg-brand-accent-light rounded-t-full bottom-1/2 left-1/2" style={{ transform: `translateX(-50%) rotate(${hourHandRotation}deg)`, transformOrigin: 'bottom', transition: 'transform 0.5s', zIndex: 10 }}></div>
            <div className="absolute w-1 h-16 sm:h-28 bg-light-text dark:bg-white rounded-t-full bottom-1/2 left-1/2" style={{ transform: `translateX(-50%) rotate(${minuteHandRotation}deg)`, transformOrigin: 'bottom', transition: 'transform 0.5s', zIndex: 10 }}></div>
            <div className="absolute w-0.5 h-16 sm:h-28 bg-red-500 bottom-1/2 left-1/2" style={{ transform: `translateX(-50%) rotate(${secondHandRotation}deg)`, transformOrigin: 'bottom', zIndex: 11 }}></div>
            <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-light-text dark:bg-white rounded-full z-20"></div>
        </div>
    );
};

const AnalogClockTicked = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondHandRotation = seconds * 6;
    const minuteHandRotation = minutes * 6 + seconds * 0.1;
    const hourHandRotation = (hours % 12) * 30 + minutes * 0.5;

    return (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-light-surface dark:bg-brand-secondary-dark border-8 border-light-text dark:border-brand-accent shadow-lg flex items-center justify-center mx-auto">
             {/* Tick Marks */}
            {[...Array(60)].map((_, i) => (
                <div key={`tick-${i}`} className="absolute w-full h-full" style={{ transform: `rotate(${i * 6}deg)` }}>
                    <div className={`absolute top-2 left-1/2 -ml-px w-px ${i % 5 === 0 ? 'h-4 bg-light-text dark:bg-white' : 'h-2 bg-light-text-secondary dark:bg-brand-accent-light'}`}></div>
                </div>
            ))}
            
            <div className="absolute w-2 h-12 sm:h-20 bg-light-text-secondary dark:bg-brand-accent-light rounded-t-full bottom-1/2 left-1/2" style={{ transform: `translateX(-50%) rotate(${hourHandRotation}deg)`, transformOrigin: 'bottom', transition: 'transform 0.5s', zIndex: 10 }}></div>
            <div className="absolute w-1 h-16 sm:h-28 bg-light-text dark:bg-white rounded-t-full bottom-1/2 left-1/2" style={{ transform: `translateX(-50%) rotate(${minuteHandRotation}deg)`, transformOrigin: 'bottom', transition: 'transform 0.5s', zIndex: 10 }}></div>
            <div className="absolute w-0.5 h-16 sm:h-28 bg-red-500 bottom-1/2 left-1/2" style={{ transform: `translateX(-50%) rotate(${secondHandRotation}deg)`, transformOrigin: 'bottom', zIndex: 11 }}></div>
            <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-light-text dark:bg-white rounded-full z-20"></div>
        </div>
    );
};

const DigitalClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return (
      <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg bg-light-surface dark:bg-brand-secondary-dark shadow-lg flex items-center justify-center mx-auto">
        <p className="text-4xl sm:text-5xl font-mono text-light-text dark:text-white tracking-widest">{formattedTime}</p>
      </div>
    );
};


const WEEK_DAYS: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AlarmManager = () => {
    const [alarms, setAlarms] = useState<Alarm[]>([]);
    const [newAlarmTime, setNewAlarmTime] = useState('08:00');
    const [newAlarmDate, setNewAlarmDate] = useState(new Date().toISOString().split('T')[0]);
    const [newAlarmLabel, setNewAlarmLabel] = useState('');
    const [repeatDays, setRepeatDays] = useState<Set<DayOfWeek>>(new Set());
    const [clockType, setClockType] = useState<ClockType>('analog-numbered');


    const toggleRepeatDay = (day: DayOfWeek) => {
        setRepeatDays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(day)) {
                newSet.delete(day);
            } else {
                newSet.add(day);
            }
            return newSet;
        });
    };

    const addAlarm = (e: React.FormEvent) => {
        e.preventDefault();
        const newAlarm: Alarm = {
            id: Date.now().toString(),
            date: newAlarmDate,
            time: newAlarmTime,
            label: newAlarmLabel || 'Alarm',
            enabled: true,
            repeat: Array.from(repeatDays)
        };
        setAlarms(prev => [...prev, newAlarm].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
        setNewAlarmLabel('');
        setRepeatDays(new Set());
    };

    const toggleAlarm = (id: string) => {
        setAlarms(prev => prev.map(alarm => alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm));
    };
    
    const deleteAlarm = (id: string) => {
        setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    };
    
    const renderClock = () => {
        switch(clockType) {
            case 'digital': return <DigitalClock />;
            case 'analog-ticked': return <AnalogClockTicked />;
            case 'analog-numbered':
            default: return <AnalogClockNumbered />;
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col h-full">
            {renderClock()}
            <div className="flex justify-center gap-2 my-4 p-1 rounded-lg bg-light-surface dark:bg-brand-secondary-dark">
                {(['analog-numbered', 'analog-ticked', 'digital'] as ClockType[]).map(type => (
                    <button key={type} onClick={() => setClockType(type)} className={`w-1/3 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${clockType === type ? 'bg-light-accent dark:bg-brand-accent text-white' : 'text-light-text-secondary dark:text-brand-accent-light'}`}>
                        {type === 'analog-numbered' ? 'Numbered' : type === 'analog-ticked' ? 'Ticked' : 'Digital'}
                    </button>
                ))}
            </div>
            <form onSubmit={addAlarm} className="mb-4 space-y-3 p-4 bg-light-surface dark:bg-brand-secondary-dark/70 rounded-lg">
                <h3 className="text-lg font-semibold text-light-text dark:text-white">Set New Alarm</h3>
                <div className="flex gap-2">
                    <input type="date" value={newAlarmDate} onChange={e => setNewAlarmDate(e.target.value)} className="w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-light-text dark:text-white" />
                    <input type="time" value={newAlarmTime} onChange={e => setNewAlarmTime(e.target.value)} className="w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-light-text dark:text-white" />
                </div>
                <input type="text" placeholder="Label" value={newAlarmLabel} onChange={e => setNewAlarmLabel(e.target.value)} className="w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-light-text dark:text-white placeholder-light-text-secondary dark:placeholder-brand-accent-light" />
                <div className="space-y-2">
                    <label className="text-sm text-light-text-secondary dark:text-brand-accent-light">Repeat</label>
                    <div className="flex justify-between">
                        {WEEK_DAYS.map(day => (
                            <button type="button" key={day} onClick={() => toggleRepeatDay(day)} className={`w-9 h-9 rounded-full font-semibold transition-colors ${repeatDays.has(day) ? 'bg-light-accent dark:bg-brand-accent text-white' : 'bg-gray-200 dark:bg-brand-dark hover:bg-gray-300 dark:hover:bg-brand-accent-light/30'}`}>
                                {day.charAt(0)}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="submit" className="w-full py-2 rounded-lg bg-light-accent dark:bg-brand-accent text-white font-semibold">Add Alarm</button>
            </form>
            <div className="flex-grow space-y-2 overflow-y-auto pb-16">
                {alarms.map(alarm => (
                    <div key={alarm.id} className={`p-3 rounded-lg flex justify-between items-center ${alarm.enabled ? 'bg-light-surface dark:bg-brand-secondary-dark' : 'bg-gray-200 dark:bg-brand-secondary-dark/50'}`}>
                        <div>
                            <p className={`text-xl font-bold ${alarm.enabled ? 'text-light-text dark:text-white' : 'text-gray-400 dark:text-gray-400'}`}>{alarm.time}</p>
                            <p className={`text-xs ${alarm.enabled ? 'text-light-text-secondary dark:text-brand-accent-light' : 'text-gray-500 dark:text-gray-500'}`}>{alarm.label} - {alarm.repeat.length > 0 ? alarm.repeat.join(', ') : new Date(alarm.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ToggleSwitch enabled={alarm.enabled} onChange={() => toggleAlarm(alarm.id)} />
                            <button onClick={() => deleteAlarm(alarm.id)} className="text-red-500 hover:text-red-700 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                ))}
                {alarms.length === 0 && <p className="text-center text-light-text-secondary dark:text-brand-accent-light">No alarms set.</p>}
            </div>
        </div>
    );
};


const Stopwatch = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = window.setInterval(() => {
                setTime(prevTime => prevTime + 10);
            }, 10);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    const handleStartPause = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
    };

    const formatTime = (time: number) => {
        const milliseconds = `0${(time % 1000) / 10}`.slice(-2);
        const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2);
        const minutes = `0${Math.floor((time / 60000) % 60)}`.slice(-2);
        return `${minutes}:${seconds}.${milliseconds}`;
    };

    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full">
            <div className="w-64 h-64 rounded-full bg-light-surface dark:bg-brand-secondary-dark border-8 border-light-accent dark:border-brand-accent flex items-center justify-center">
                <p className="text-5xl font-mono text-light-text dark:text-white tracking-widest">{formatTime(time)}</p>
            </div>
            <div className="flex gap-8">
                <button onClick={handleReset} className="p-4 rounded-full bg-light-surface dark:bg-brand-secondary-dark text-light-text-secondary dark:text-brand-accent-light">
                    <RefreshCwIcon />
                </button>
                <button onClick={handleStartPause} className="p-6 rounded-full bg-light-accent dark:bg-brand-accent text-white">
                    {isRunning ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
                </button>
            </div>
        </div>
    );
};

const Pomodoro = () => {
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timer, setTimer] = useState(focusDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionType, setSessionType] = useState<'FOCUS' | 'BREAK'>('FOCUS');
    const intervalRef = useRef<number | null>(null);
    
    const pauseTimer = () => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; setIsActive(false); }
    };

    const startTimer = () => {
        if (intervalRef.current) return;
        setIsActive(true);
        intervalRef.current = window.setInterval(() => { setTimer(prev => prev - 1); }, 1000);
    };

    const resetTimer = () => {
        pauseTimer();
        setSessionType('FOCUS');
        setTimer(focusDuration * 60);
    };
    
    useEffect(() => {
        if (timer < 0) {
            pauseTimer();
            if (sessionType === 'FOCUS') {
                setSessionType('BREAK');
                setTimer(breakDuration * 60);
            } else {
                setSessionType('FOCUS');
                setTimer(focusDuration * 60);
            }
            startTimer(); // auto-start next session
        }
    }, [timer, sessionType, breakDuration, focusDuration]);

    useEffect(() => {
        return () => { if(intervalRef.current) clearInterval(intervalRef.current); }
    }, []);
    
    useEffect(() => {
        if (!isActive) {
            setTimer((sessionType === 'FOCUS' ? focusDuration : breakDuration) * 60);
        }
    }, [focusDuration, breakDuration, sessionType, isActive]);


    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    
    const TimeInput = ({label, value, setValue}) => (
        <div className="text-center">
            <label className="text-sm text-light-text-secondary dark:text-brand-accent-light">{label}</label>
            <div className="flex items-center justify-center gap-2">
                <button disabled={isActive} onClick={() => setValue(v => Math.max(1, v - 1))} className="px-2 py-1 rounded bg-gray-200 dark:bg-brand-dark disabled:opacity-50">-</button>
                <input type="number" value={value} readOnly disabled={isActive} className="w-16 text-center bg-transparent font-semibold" />
                <button disabled={isActive} onClick={() => setValue(v => v + 1)} className="px-2 py-1 rounded bg-gray-200 dark:bg-brand-dark disabled:opacity-50">+</button>
            </div>
        </div>
    );

    return (
         <div className="flex flex-col items-center justify-center gap-8 w-full">
            <div className="flex gap-8">
                <TimeInput label="Focus (min)" value={focusDuration} setValue={setFocusDuration} />
                <TimeInput label="Break (min)" value={breakDuration} setValue={setBreakDuration} />
            </div>
            <div className={`w-64 h-64 rounded-full border-8 flex items-center justify-center transition-colors ${sessionType === 'FOCUS' ? 'border-light-accent dark:border-brand-accent' : 'border-green-500'}`}>
                <div>
                    <p className="text-5xl font-mono text-light-text dark:text-white tracking-widest">{formatTime(timer)}</p>
                    <p className="text-center text-lg text-light-text-secondary dark:text-brand-accent-light mt-2">{sessionType}</p>
                </div>
            </div>
            <div className="flex gap-8">
                <button onClick={resetTimer} className="p-4 rounded-full bg-light-surface dark:bg-brand-secondary-dark text-light-text-secondary dark:text-brand-accent-light">
                    <RefreshCwIcon />
                </button>
                <button onClick={isActive ? pauseTimer : startTimer} className="p-6 rounded-full bg-light-accent dark:bg-brand-accent text-white">
                    {isActive ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
                </button>
            </div>
        </div>
    );
};


export const AlarmPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('ALARM');

    return (
        <div className="p-4 flex flex-col items-center h-screen justify-start">
            <div className="flex justify-center p-1 rounded-lg bg-light-surface dark:bg-brand-secondary-dark w-full max-w-sm my-8">
                <button
                    onClick={() => setActiveTab('ALARM')}
                    className={`w-1/3 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'ALARM' ? 'bg-light-accent dark:bg-brand-accent text-white' : 'text-light-text-secondary dark:text-brand-accent-light'}`}
                >
                    ALARM
                </button>
                <button
                    onClick={() => setActiveTab('STOPWATCH')}
                    className={`w-1/3 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'STOPWATCH' ? 'bg-light-accent dark:bg-brand-accent text-white' : 'text-light-text-secondary dark:text-brand-accent-light'}`}
                >
                    STOPWATCH
                </button>
                <button
                    onClick={() => setActiveTab('POMODORO')}
                    className={`w-1/3 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'POMODORO' ? 'bg-light-accent dark:bg-brand-accent text-white' : 'text-light-text-secondary dark:text-brand-accent-light'}`}
                >
                    POMODORO
                </button>
            </div>

            <div className="flex-grow flex items-center justify-center w-full">
                {activeTab === 'ALARM' && <AlarmManager />}
                {activeTab === 'STOPWATCH' && <Stopwatch />}
                {activeTab === 'POMODORO' && <Pomodoro />}
            </div>
        </div>
    );
};
