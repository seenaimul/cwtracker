
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon } from '../components/Icons';
import { useGrades } from '../App';
import type { Module, UniversityRule, UniversityPreset, DegreeType } from '../types';

const PRESETS: UniversityPreset[] = [
    { 
        name: 'Standard UK', 
        rules: [], 
        classificationBoundaries: { 
            undergraduate: { 'First Class Honours': 70, 'Upper Second Class': 60, 'Lower Second Class': 50, 'Third Class': 40, 'Fail': 0 },
            postgraduate: { 'Distinction': 70, 'Merit': 60, 'Pass': 50, 'Fail': 0 }
        } 
    },
    { 
        name: 'LSBU (Example)', 
        rules: [{ level: 6, excludeCredits: 20 }], 
        classificationBoundaries: { 
            undergraduate: { 'First Class Honours': 70, 'Upper Second Class': 60, 'Lower Second Class': 50, 'Third Class': 40, 'Fail': 0 },
            postgraduate: { 'Distinction': 70, 'Merit': 65, 'Pass': 50, 'Fail': 0 } // Example specific rule
        } 
    },
    { 
        name: 'KCL (Example)', 
        rules: [{ level: 5, excludeCredits: 15 }, { level: 6, excludeCredits: 15 }], 
        classificationBoundaries: { 
            undergraduate: { 'First Class Honours': 70, 'Upper Second (2:1)': 60, 'Lower Second (2:2)': 50, 'Third Class': 40, 'Fail': 0 },
            postgraduate: { 'Distinction': 70, 'Merit': 60, 'Pass': 50, 'Fail': 0 }
        } 
    },
];

const CLASSIFICATION_COLORS: { [key: string]: string } = {
    'First Class Honours': 'text-amber-400',
    'Distinction': 'text-amber-400',
    'Upper Second Class': 'text-slate-300',
    'Upper Second (2:1)': 'text-slate-300',
    'Merit': 'text-slate-300',
    'Lower Second Class': 'text-orange-400',
    'Lower Second (2:2)': 'text-orange-400',
    'Pass': 'text-orange-400',
    'Third Class': 'text-gray-400',
    'Fail': 'text-red-500',
};


export const DegreeCalculatorPage = () => {
    const navigate = useNavigate();
    const { grades, upsertGrade } = useGrades();
    
    // State management with lazy initialization from localStorage
    const [modulesByLevel, setModulesByLevel] = useState<{ [level: number]: Module[] }>(() => {
        const saved = localStorage.getItem('degree-calculator-modules');
        return saved ? JSON.parse(saved) : { 5: [], 6: [] };
    });
    const [rules, setRules] = useState<UniversityRule[]>(() => {
        const saved = localStorage.getItem('degree-calculator-rules');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedPresetName, setSelectedPresetName] = useState<string>(() => localStorage.getItem('degree-calculator-preset') || 'Standard UK');
    const [targetClassification, setTargetClassification] = useState<string>('');
    const [degreeType, setDegreeType] = useState<DegreeType>(() => (localStorage.getItem('degree-calculator-type') as DegreeType) || 'undergraduate');
    
    const selectedPreset = useMemo(() => PRESETS.find(p => p.name === selectedPresetName) || PRESETS[0], [selectedPresetName]);

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('degree-calculator-modules', JSON.stringify(modulesByLevel));
        localStorage.setItem('degree-calculator-rules', JSON.stringify(rules));
        localStorage.setItem('degree-calculator-preset', selectedPresetName);
        localStorage.setItem('degree-calculator-type', degreeType);
    }, [modulesByLevel, rules, selectedPresetName, degreeType]);

    // Sync calculator data back to global grades context
    useEffect(() => {
        const allModules = Object.values(modulesByLevel).flat();
        allModules.forEach(module => {
            if (module.name.trim() !== '' && module.grade >= 0) {
                upsertGrade({ moduleName: module.name, marks: module.grade });
            }
        });
    }, [modulesByLevel, upsertGrade]);

    // Reset target classification if boundaries change
    useEffect(() => {
        const boundaries = selectedPreset.classificationBoundaries[degreeType];
        const firstClassification = Object.keys(boundaries).find(key => key !== 'Fail') || 'Merit';
         if (!targetClassification || !boundaries[targetClassification]) {
            setTargetClassification(firstClassification);
        }
    }, [degreeType, selectedPreset, targetClassification]);


    const handleAddModule = (level: number) => {
        const newModule: Module = { id: Date.now().toString(), name: '', credits: 15, grade: 0, level, isPredicted: true };
        setModulesByLevel(prev => ({ ...prev, [level]: [...prev[level], newModule] }));
    };

    const handleModuleChange = (level: number, id: string, field: keyof Module, value: any) => {
        setModulesByLevel(prev => ({
            ...prev,
            [level]: prev[level].map(m => m.id === id ? { ...m, [field]: value } : m),
        }));
    };
    
    const handleModuleNameChange = (level: number, id: string, newName: string) => {
        const matchedGrade = grades.find(g => g.moduleName.toLowerCase() === newName.toLowerCase());
        setModulesByLevel(prev => ({
            ...prev,
            [level]: prev[level].map(m => 
                m.id === id 
                ? { ...m, name: newName, grade: matchedGrade ? matchedGrade.marks : m.grade, isPredicted: !matchedGrade } 
                : m
            ),
        }));
    };

    const handleRemoveModule = (level: number, id: string) => {
        setModulesByLevel(prev => ({ ...prev, [level]: prev[level].filter(m => m.id !== id) }));
    };

    const handlePresetChange = (presetName: string) => {
        const preset = PRESETS.find(p => p.name === presetName);
        if (preset) {
            setRules(preset.rules);
        }
        setSelectedPresetName(presetName);
    };

    const calculationResults = useMemo(() => {
        const allModules = Object.values(modulesByLevel).flat();
        if (allModules.length === 0) return { weightedAverage: 0, classification: 'N/A', totalCredits: 0 };
    
        let modulesToConsider = [...allModules];
    
        rules.forEach(rule => {
            const modulesInLevel = modulesToConsider.filter(m => m.level === rule.level).sort((a, b) => a.grade - b.grade);
            let creditsToExclude = rule.excludeCredits;
            const excludedModuleIds = new Set<string>();
            
            for (const module of modulesInLevel) {
                if (creditsToExclude <= 0) break;
                excludedModuleIds.add(module.id);
                creditsToExclude -= module.credits;
            }
            modulesToConsider = modulesToConsider.filter(m => !excludedModuleIds.has(m.id));
        });
    
        const totalCredits = modulesToConsider.reduce((sum, m) => sum + m.credits, 0);
        if (totalCredits === 0) return { weightedAverage: 0, classification: 'N/A', totalCredits: 0 };
    
        const totalWeightedScore = modulesToConsider.reduce((sum, m) => sum + (m.grade * m.credits), 0);
        const weightedAverage = totalWeightedScore / totalCredits;
    
        const boundaries = selectedPreset.classificationBoundaries[degreeType];
        let classification = 'Fail';
        for (const [name, boundary] of Object.entries(boundaries).sort(([,a], [,b]) => b - a)) {
            if (name !== 'Fail' && weightedAverage >= boundary) {
                classification = name;
                break;
            }
        }
    
        return { weightedAverage, classification, totalCredits };
    }, [modulesByLevel, rules, selectedPreset, degreeType]);

    const targetAnalysisResult = useMemo(() => {
        const allModules = Object.values(modulesByLevel).flat();
        const predictedModules = allModules.filter(m => m.isPredicted);
        const completedModules = allModules.filter(m => !m.isPredicted);
        
        const boundaries = selectedPreset.classificationBoundaries[degreeType];
        const targetBoundary = boundaries[targetClassification] || 0;

        if (predictedModules.length === 0 || !targetBoundary) return 'N/A';

        const completedCredits = completedModules.reduce((sum, m) => sum + m.credits, 0);
        const predictedCredits = predictedModules.reduce((sum, m) => sum + m.credits, 0);
        const totalCredits = completedCredits + predictedCredits;

        const requiredTotalScore = targetBoundary * totalCredits;
        const completedScore = completedModules.reduce((sum, m) => sum + (m.grade * m.credits), 0);

        const requiredPredictedScore = requiredTotalScore - completedScore;
        const requiredAverage = predictedCredits > 0 ? requiredPredictedScore / predictedCredits : 0;
        
        if (requiredAverage > 100) return ">100%";
        if (requiredAverage < 0) return "✓";
        return `${requiredAverage.toFixed(2)}%`;

    }, [modulesByLevel, targetClassification, selectedPreset, degreeType]);

    const handleClearData = () => {
        if (window.confirm("Are you sure you want to clear all module and settings data?")) {
            setModulesByLevel({ 5: [], 6: [] });
            handlePresetChange('Standard UK');
        }
    };
    
    const levelLabels: {[key: string]: {5: string, 6: string}} = {
        undergraduate: { 5: 'Year 2 / Level 5', 6: 'Year 3 / Level 6' },
        postgraduate: { 5: 'Semester 1', 6: 'Semester 2' }
    };
    
    return (
        <div className="bg-light-bg dark:bg-brand-dark min-h-screen">
             <header className="flex items-center p-4 bg-light-surface dark:bg-brand-secondary-dark/50 sticky top-0 z-20 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                    <ChevronLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-light-text dark:text-white text-center flex-grow">University Degree Calculator</h1>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-8">
                {/* --- LEFT COLUMN: INPUTS & SETTINGS --- */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Settings Panel */}
                    <div className="p-6 bg-light-surface dark:bg-brand-secondary-dark rounded-xl shadow-md space-y-4">
                        <h2 className="text-2xl font-bold text-light-text dark:text-white">Settings</h2>
                        <div>
                            <label className="text-sm font-medium text-light-text-secondary dark:text-brand-accent-light">Degree Type</label>
                            <div className="flex gap-2 mt-1">
                                {(['undergraduate', 'postgraduate'] as DegreeType[]).map(type => (
                                    <button key={type} onClick={() => setDegreeType(type)} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors capitalize ${degreeType === type ? 'bg-light-accent dark:bg-brand-accent text-white' : 'bg-light-bg dark:bg-brand-dark text-light-text-secondary dark:text-brand-accent-light hover:bg-gray-200 dark:hover:bg-brand-accent/20'}`}>
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-light-text-secondary dark:text-brand-accent-light">🎓 University Preset</label>
                                <select value={selectedPresetName} onChange={e => handlePresetChange(e.target.value)} className="w-full mt-1 bg-light-bg dark:bg-brand-dark p-3 rounded-lg border border-gray-300 dark:border-brand-accent focus:ring-light-accent dark:focus:ring-brand-accent-light">
                                    {PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-light-text-secondary dark:text-brand-accent-light">🎯 Goal Setting</label>
                                <select value={targetClassification} onChange={e => setTargetClassification(e.target.value)} className="w-full mt-1 bg-light-bg dark:bg-brand-dark p-3 rounded-lg border border-gray-300 dark:border-brand-accent focus:ring-light-accent dark:focus:ring-brand-accent-light">
                                    {Object.keys(selectedPreset.classificationBoundaries[degreeType]).filter(c => c !== 'Fail').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                             <label className="text-sm font-medium text-light-text-secondary dark:text-brand-accent-light">⚙️ Exclusion Rules</label>
                             <div className="mt-1 space-y-2">
                                {rules.length > 0 ? rules.map((rule, index) => (
                                    <div key={index} className="text-sm p-2 bg-light-bg dark:bg-brand-dark rounded">
                                        Exclude the lowest <span className="font-bold">{rule.excludeCredits}</span> credits from {degreeType === 'undergraduate' ? `Level ${rule.level}` : `Semester ${rule.level - 4}`}.
                                    </div>
                                )) : <p className="text-sm text-light-text-secondary dark:text-brand-accent-light">No exclusion rules for this preset.</p>}
                             </div>
                        </div>
                    </div>

                    {/* Module Input */}
                    {[5, 6].map(level => (
                        <div key={level} className="p-6 bg-light-surface dark:bg-brand-secondary-dark rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-light-text dark:text-white">{levelLabels[degreeType][level]}</h2>
                                <button onClick={() => handleAddModule(level)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-light-accent dark:bg-brand-accent text-white hover:opacity-90 transition-opacity">+ Add Module</button>
                            </div>
                            {/* Headers */}
                            <div className="grid grid-cols-12 gap-3 items-center text-xs font-semibold text-light-text-secondary dark:text-brand-accent-light mb-2 px-2">
                                <div className="col-span-12 md:col-span-5">Module Name</div>
                                <div className="col-span-4 md:col-span-2 text-center">Credits</div>
                                <div className="col-span-4 md:col-span-2 text-center">Marks %</div>
                                <div className="col-span-3 md:col-span-2"></div>
                                <div className="col-span-1"></div>
                            </div>
                             <div className="space-y-3">
                                {modulesByLevel[level].map(module => (
                                    <div key={module.id} className="grid grid-cols-12 gap-3 items-center">
                                        <input list="grade-modules" type="text" placeholder="Module Name" value={module.name} onChange={e => handleModuleNameChange(level, module.id, e.target.value)} className="col-span-12 md:col-span-5 w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent" />
                                        <datalist id="grade-modules">
                                            {grades.map(g => <option key={g.id} value={g.moduleName} />)}
                                        </datalist>
                                        <input type="number" placeholder="Credits" value={module.credits} onChange={e => handleModuleChange(level, module.id, 'credits', parseInt(e.target.value) || 0)} className="col-span-4 md:col-span-2 w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-center" />
                                        <input type="number" placeholder="Grade %" value={module.grade} onChange={e => handleModuleChange(level, module.id, 'grade', parseInt(e.target.value) || 0)} className="col-span-4 md:col-span-2 w-full bg-light-bg dark:bg-brand-dark p-2 rounded-lg border border-gray-300 dark:border-brand-accent text-center" />
                                        <label className="col-span-3 md:col-span-2 flex items-center justify-center gap-2 text-xs cursor-pointer text-light-text-secondary dark:text-brand-accent-light">
                                            <input type="checkbox" checked={module.isPredicted} onChange={e => handleModuleChange(level, module.id, 'isPredicted', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-light-accent focus:ring-light-accent"/>
                                            Predicted
                                        </label>
                                        <button onClick={() => handleRemoveModule(level, module.id)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center"><TrashIcon size={18} /></button>
                                    </div>
                                ))}
                                {modulesByLevel[level].length === 0 && <p className="text-center py-4 text-light-text-secondary dark:text-brand-accent-light">No modules added for this level yet.</p>}
                            </div>
                        </div>
                    ))}
                     <button onClick={handleClearData} className="w-full text-center py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-lg transition-colors">
                        Clear All Data
                    </button>
                </div>
                {/* --- RIGHT COLUMN: RESULTS DASHBOARD --- */}
                <div className="relative">
                    <div className="sticky top-24 space-y-6">
                         <div className="p-6 bg-light-surface dark:bg-brand-secondary-dark rounded-xl shadow-lg text-center">
                            <h3 className="text-lg font-semibold text-light-text-secondary dark:text-brand-accent-light">Overall Weighted Percentage</h3>
                            <p className="text-6xl font-bold text-light-text dark:text-white my-2">{calculationResults.weightedAverage.toFixed(2)}%</p>
                            <h3 className="text-lg font-semibold text-light-text-secondary dark:text-brand-accent-light mt-4">Degree Classification</h3>
                            <p className={`text-3xl font-bold mt-1 ${CLASSIFICATION_COLORS[calculationResults.classification] || 'text-white'}`}>{calculationResults.classification}</p>
                         </div>
                         <div className="p-6 bg-light-surface dark:bg-brand-secondary-dark rounded-xl shadow-lg text-center">
                             <h3 className="text-lg font-semibold text-light-text-secondary dark:text-brand-accent-light">🎯 Target Analysis</h3>
                             <p className="text-sm mt-1 text-light-text-secondary dark:text-brand-accent-light">To get a <span className="font-bold">{targetClassification}</span>, you need an average of:</p>
                             <p className="text-4xl font-bold text-light-accent dark:text-brand-accent-light my-2">{targetAnalysisResult}</p>
                             <p className="text-xs text-light-text-secondary dark:text-brand-accent-light">in your remaining predicted modules.</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
