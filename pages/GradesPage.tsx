
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrades } from '../App';
import { ChevronLeftIcon, EditIcon, TrashIcon } from '../components/Icons';
import { Grade } from '../types';

export const GradesPage = () => {
    const navigate = useNavigate();
    const { grades, addGrade, updateGrade, deleteGrade } = useGrades();
    const [moduleName, setModuleName] = useState('');
    const [marks, setMarks] = useState('');
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleName || !marks) return;
        addGrade({ moduleName, marks: Number(marks) });
        setModuleName('');
        setMarks('');
    };

    const handleEditClick = (grade: Grade) => {
        setEditingGrade({ ...grade });
    };

    const handleCancelEdit = () => {
        setEditingGrade(null);
    };

    const handleUpdateGrade = () => {
        if (editingGrade) {
            updateGrade(editingGrade);
            setEditingGrade(null);
        }
    };
    
    const averageGrade = useMemo(() => {
        if (grades.length === 0) return 0;
        const total = grades.reduce((sum, grade) => sum + grade.marks, 0);
        return (total / grades.length).toFixed(2);
    }, [grades]);

    const GradeRow = ({ grade }: { grade: Grade }) => {
        const isEditing = editingGrade?.id === grade.id;

        if (isEditing) {
            return (
                <div className="p-4 rounded-lg bg-light-surface dark:bg-brand-accent/20 flex flex-col sm:flex-row gap-2 items-center">
                    <input
                        type="text"
                        value={editingGrade.moduleName}
                        onChange={(e) => setEditingGrade({ ...editingGrade, moduleName: e.target.value })}
                        className="flex-grow w-full sm:w-auto bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent"
                    />
                    <input
                        type="number"
                        value={editingGrade.marks}
                        onChange={(e) => setEditingGrade({ ...editingGrade, marks: Number(e.target.value) })}
                        className="w-full sm:w-24 bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent"
                    />
                    <div className="flex gap-2">
                        <button onClick={handleUpdateGrade} className="p-2 rounded-lg bg-green-500 text-white">Save</button>
                        <button onClick={handleCancelEdit} className="p-2 rounded-lg bg-gray-500 text-white">Cancel</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 rounded-lg bg-light-surface dark:bg-brand-secondary-dark flex justify-between items-center">
                <span className="font-medium">{grade.moduleName}</span>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">{grade.marks}%</span>
                    <button onClick={() => handleEditClick(grade)} className="text-light-text-secondary dark:text-brand-accent-light hover:text-light-accent dark:hover:text-white">
                        <EditIcon size={18} />
                    </button>
                    <button onClick={() => deleteGrade(grade.id)} className="text-light-text-secondary dark:text-brand-accent-light hover:text-red-500 dark:hover:text-red-500">
                        <TrashIcon size={18} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4">
            <header className="flex items-center mb-8 relative">
                <button onClick={() => navigate(-1)} className="p-2 absolute left-0">
                    <ChevronLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-light-text dark:text-white text-center flex-grow">Grade Tracker</h1>
            </header>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 rounded-lg bg-light-surface dark:bg-brand-secondary-dark mb-8">
                <h2 className="text-lg font-semibold">Add New Grade</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Module Name"
                        value={moduleName}
                        onChange={(e) => setModuleName(e.target.value)}
                        className="w-full bg-light-bg dark:bg-brand-dark p-3 rounded-lg border border-gray-300 dark:border-brand-accent focus:ring-light-accent dark:focus:ring-brand-accent-light focus:border-light-accent dark:focus:border-brand-accent-light"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Marks (%)"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        min="0"
                        max="100"
                        className="w-full bg-light-bg dark:bg-brand-dark p-3 rounded-lg border border-gray-300 dark:border-brand-accent focus:ring-light-accent dark:focus:ring-brand-accent-light focus:border-light-accent dark:focus:border-brand-accent-light"
                        required
                    />
                </div>
                <button type="submit" className="w-full py-3 rounded-lg bg-light-accent dark:bg-brand-accent text-white font-semibold">Add Grade</button>
            </form>
            
            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-light-surface dark:bg-brand-secondary-dark flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Average Grade</h3>
                    <p className="text-2xl font-bold text-light-accent dark:text-brand-accent-light">{averageGrade}%</p>
                </div>
                <h3 className="text-lg font-semibold px-1">All Grades</h3>
                 {grades.length > 0 ? (
                    [...grades].sort((a, b) => a.moduleName.localeCompare(b.moduleName)).map(grade => (
                        <GradeRow key={grade.id} grade={grade} />
                    ))
                 ) : (
                    <p className="text-center text-light-text-secondary dark:text-brand-accent-light pt-4">No grades added yet.</p>
                 )}
            </div>
        </div>
    );
};
