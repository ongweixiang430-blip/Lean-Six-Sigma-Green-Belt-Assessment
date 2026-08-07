import { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  RotateCcw, 
  AlertTriangle, 
  GraduationCap,
  BookOpenCheck,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loadAllQuestions, shuffleArray, Question } from './questions';
import { getQuestionExplanation } from './utils/explanations';
import { SatsLogo } from './components/SatsLogo';
import { jsPDF } from 'jspdf';

export default function App() {
  // Load entire 200-question pool
  const [allQuestions] = useState<Question[]>(() => loadAllQuestions());

  // App navigation state: 'welcome' | 'active' | 'results'
  const [appState, setAppState] = useState<'welcome' | 'active' | 'results'>('welcome');

  // Active exam session states (exactly 100 questions)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledChoices, setShuffledChoices] = useState<string[][]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Countdown timer: 90 minutes (5400 seconds) for standard assessment
  const [timeLeft, setTimeLeft] = useState<number>(5400);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Candidate detail states (restored from localStorage if previously used)
  const [candidateName, setCandidateName] = useState<string>(() => localStorage.getItem('lss_candidate_name') || '');
  const [candidateStaffId, setCandidateStaffId] = useState<string>(() => localStorage.getItem('lss_candidate_staff_id') || '');
  const [candidateEmail, setCandidateEmail] = useState<string>(() => localStorage.getItem('lss_candidate_email') || '');

  // Submit confirmation modal
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  // Part 1 and Part 2 selection states
  const [selectedPart, setSelectedPart] = useState<'pt1' | 'pt2'>('pt1');
  const [activePart, setActivePart] = useState<'pt1' | 'pt2'>('pt1');

  // Verify that candidate details form is completely filled and formatted correctly
  const isFormValid = useMemo(() => {
    return (
      candidateName.trim().length >= 2 &&
      /^\d{8}$/.test(candidateStaffId.trim()) &&
      candidateEmail.trim().length >= 5 &&
      candidateEmail.includes('@') &&
      candidateEmail.includes('.')
    );
  }, [candidateName, candidateStaffId, candidateEmail]);

  // Start the 100-question assessment
  const startAssessment = () => {
    if (!isFormValid) {
      alert("Please enter a valid Name, an 8-digit numeric Staff ID, and a valid Email Address before starting the assessment.");
      return;
    }

    // Save details locally for convenient future attempts
    localStorage.setItem('lss_candidate_name', candidateName.trim());
    localStorage.setItem('lss_candidate_staff_id', candidateStaffId.trim());
    localStorage.setItem('lss_candidate_email', candidateEmail.trim());

    // Filter questions 1-100 for Part 1, and 101-200 for Part 2
    const part1Pool = allQuestions.filter(q => {
      const num = parseInt(q.id.replace('LSSGB-', ''), 10);
      return num >= 1 && num <= 100;
    });
    const part2Pool = allQuestions.filter(q => {
      const num = parseInt(q.id.replace('LSSGB-', ''), 10);
      return num >= 101 && num <= 200;
    });

    // Pick the selected part pool (ensures they are strictly separate and do not overlap)
    const basePool = selectedPart === 'pt1' ? part1Pool : part2Pool;

    // Shuffle the selected pool of questions so it is dynamic and randomized, then pick exactly 50
    const examQuestions = shuffleArray<Question>([...basePool]).slice(0, 50);

    // Shuffle the options of each selected question
    const choicesList = examQuestions.map(q => shuffleArray<string>([...q.choices]));

    setActivePart(selectedPart);
    setQuestions(examQuestions);
    setShuffledChoices(choicesList);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowConfirmSubmit(false);

    // 90 minutes countdown
    setTimeLeft(5400);
    setIsTimerActive(true);
    setStartTime(Date.now());
    setAppState('active');
  };

  // Timer Countdown Ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0 && appState === 'active') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Automatic submission when timer runs out
            submitExamDirectly();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, appState]);

  // Option selection handler
  const selectOption = (questionId: string, choice: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: choice
    }));
  };

  // Submit and compute results
  const submitExamDirectly = () => {
    setIsTimerActive(false);
    setShowConfirmSubmit(false);
    const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
    setTimeSpentSeconds(secondsElapsed);
    setAppState('results');
  };

  // Compute final scoring metrics
  const examMetrics = useMemo(() => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const isPassed = percentage >= 80; // 80% threshold standard
    return { correct, total: questions.length, percentage, isPassed };
  }, [questions, userAnswers]);

  // Format Time left (MM:SS or HH:MM:SS if needed, simple MM:SS is clean)
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format Elapsed time
  const formatElapsed = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const unansweredCount = questions.length - Object.keys(userAnswers).length;

  // Generate high-quality PDF Report using jsPDF
  const downloadPdfReport = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 20;

      // Header drawing routine
      const drawHeader = () => {
        // Dark banner bg
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('Arial', 'bold');
        doc.setFontSize(15);
        doc.text("SATS • LEAN SIX SIGMA GREEN BELT ASSESSMENT", 12, 18);
        
        doc.setFont('Arial', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Official Diagnostic Report • Standard ${questions.length}-Question Exam`, 12, 26);
        
        // Emerald bottom line accent
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(0, 38, pageWidth, 2, 'F');
      };

      // Footer drawing routine
      const drawFooter = (pageNum: number) => {
        doc.setFont('Arial', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Lean Six Sigma Practice Simulator • Automated Diagnostic Report", 12, pageHeight - 10);
        doc.text(`Page ${pageNum} of 2`, pageWidth - 25, pageHeight - 10);
      };

      // PAGE 1: COVER / SUMMARY PANEL (Only containing Name, Email, Time Taken, and Score)
      drawHeader();
      currentY = 52;

      // Credentials Card (Slightly taller to fit larger text with Staff ID)
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(12, currentY, pageWidth - 24, 66, 3, 3, 'FD');

      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('Arial', 'bold');
      doc.setFontSize(13);
      doc.text("CANDIDATE CREDENTIALS & METRICS", 18, currentY + 10);

      doc.setFont('Arial', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // slate-500

      doc.text("Full Name:", 18, currentY + 18);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Arial', 'bold');
      doc.text(candidateName || 'N/A', 50, currentY + 18);

      doc.setFont('Arial', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text("Staff ID:", 18, currentY + 26);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Arial', 'bold');
      doc.text(candidateStaffId || 'N/A', 50, currentY + 26);

      doc.setFont('Arial', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text("Email Address:", 18, currentY + 34);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Arial', 'bold');
      doc.text(candidateEmail || 'N/A', 50, currentY + 34);

      doc.setFont('Arial', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text("Exam Part:", 18, currentY + 42);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Arial', 'bold');
      doc.text(activePart === 'pt1' ? 'Part 1' : 'Part 2', 50, currentY + 42);

      doc.setFont('Arial', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text("Date of Attempt:", 18, currentY + 50);
      doc.setTextColor(15, 23, 42);
      doc.text(new Date().toLocaleString(), 50, currentY + 50);

      doc.setFont('Arial', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text("Time Spent:", 18, currentY + 58);
      doc.setTextColor(15, 23, 42);
      doc.text(formatElapsed(timeSpentSeconds), 50, currentY + 58);

      currentY += 76;

      // Diagnostic Result Card (Slightly taller to fit larger text)
      const isPassed = examMetrics.isPassed;
      if (isPassed) {
        doc.setFillColor(240, 253, 250); // emerald-50
        doc.setDrawColor(167, 243, 208); // emerald-200
      } else {
        doc.setFillColor(254, 242, 242); // red-50
        doc.setDrawColor(254, 202, 202); // red-200
      }
      doc.roundedRect(12, currentY, pageWidth - 24, 54, 3, 3, 'FD');

      doc.setTextColor(isPassed ? 6 : 153, isPassed ? 95 : 27, isPassed ? 70 : 27); // emerald-800 vs red-800
      doc.setFont('Arial', 'bold');
      doc.setFontSize(15);
      doc.text(isPassed ? "STATUS: PASSED ASSESSMENT" : "STATUS: FURTHER STUDY REQUIRED", 18, currentY + 11);

      doc.setFontSize(10.5);
      doc.setFont('Arial', 'normal');
      doc.setTextColor(51, 65, 85); // slate-700
      const explanationText = isPassed 
        ? "Excellent! You have demonstrated thorough mastery of the Lean Six Sigma syllabus and successfully achieved or exceeded the passing requirement of 80% on this standard assessment attempt."
        : "You did not achieve the required 80% passing grade threshold this time. Continuous improvement is an iterative process. We recommend focusing on weak DMAIC areas before re-assessment.";
      
      const splitExplanation = doc.splitTextToSize(explanationText, pageWidth - 36);
      doc.text(splitExplanation, 18, currentY + 20);

      doc.setFont('Arial', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(`Final Score: ${examMetrics.correct} / ${examMetrics.total} Correct (${examMetrics.percentage}%)`, 18, currentY + 45);

      drawFooter(1);

      // Save document
      const formattedName = (candidateName || 'Candidate').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`LSS_GreenBelt_Assessment_${formattedName}.pdf`);

    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error occurred while generating PDF. Please ensure all inputs are valid.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      
      {/* Dynamic top gradient styling */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none" />

      {/* Primary Sticky Header with Fixed Permanent SATS Brand Logo */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs text-slate-900 sticky top-0 z-40 shadow-xs shrink-0 min-h-[64px]" id="app-permanent-header">
        <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Permanent Left Branding: Fixed SATS Logo + Assessment Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            id="header-brand-container"
            onClick={() => {
              if (appState !== 'welcome') {
                if (window.confirm('Do you want to return to the main assessment screen? Your active attempt progress will be lost.')) {
                  setAppState('welcome');
                }
              }
            }}
          >
            {/* Hardcoded Permanent SATS Logo - Fixed across all views */}
            <div className="flex items-center shrink-0" id="permanent-sats-header-logo">
              <SatsLogo className="h-7 sm:h-8 w-auto" id="header-sats-vector-logo" />
            </div>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-xs shrink-0 hidden md:flex">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 font-sans flex items-center gap-1.5">
                <span className="hidden sm:inline">Lean Six Sigma</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded uppercase tracking-wider">
                  Green Belt Assessment
                </span>
              </h1>
            </div>
          </div>

          {/* Right Header Section: Fixed Controls and Context */}
          <div className="flex items-center gap-3 shrink-0" id="header-controls-container">
            {appState === 'results' && (
              <button 
                onClick={() => setAppState('welcome')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> New Attempt
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full px-4 md:px-8 py-8 relative flex-1">
        <AnimatePresence mode="wait">

          {/* ======================================= */}
          {/* WELCOME / START VIEW                    */}
          {/* ======================================= */}
          {appState === 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto space-y-6"
              key="welcome-view"
              id="welcome-root"
            >
              {/* Introduction Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 space-y-6 shadow-sm text-center">
                <div className="flex justify-center mb-1">
                  <SatsLogo className="h-11 sm:h-12 w-auto" id="welcome-sats-vector-logo" />
                </div>
                
                <div className="space-y-2 pt-3">
                  <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-mono font-bold tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mt-1">
                    <Sparkles className="h-3.5 w-3.5" /> Standard Assessment Format
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight pt-2">
                    Lean Six Sigma Green Belt Assessment
                  </h2>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
                  Congratulations for completing the LSSGB training session! Now to test your knowledge, you are to complete these two tests as part of the requirements. As this test will not be saved, you are to ensure that you have internet access throughout.
                </p>

                {/* Exam Constraints List */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 max-w-md mx-auto text-left space-y-3 font-mono text-xs text-slate-600">
                  <div className="text-center font-bold text-slate-700 text-xs border-b border-slate-200/60 pb-2 tracking-wider uppercase font-mono">
                    For Each Test
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-semibold">Total Questions:</span>
                    <span className="text-slate-900 font-extrabold">50 Multiple-Choice</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-semibold">Allocated Timer:</span>
                    <span className="text-slate-900 font-extrabold">90 Minutes (1.5 Hours)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Passing Standard:</span>
                    <span className="text-emerald-700 font-extrabold">80% Correct Grade</span>
                  </div>
                </div>

                {/* Candidate Credentials Registration Form */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md mx-auto text-left space-y-4 shadow-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Candidate Registration
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Your name, staff ID, and email are required to enable local PDF report compiling.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="candidate-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Full Name
                      </label>
                      <input
                        id="candidate-name"
                        type="text"
                        required
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all shadow-3xs text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="candidate-staff-id" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Staff ID
                      </label>
                      <input
                        id="candidate-staff-id"
                        type="text"
                        required
                        value={candidateStaffId}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 8) {
                            setCandidateStaffId(val);
                          }
                        }}
                        placeholder="e.g. 12345678"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all shadow-3xs text-slate-800"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="candidate-email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Email Address
                      </label>
                      <input
                        id="candidate-email"
                        type="email"
                        required
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="e.g. john.doe@example.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all shadow-3xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Exam Part Selection */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md mx-auto text-left space-y-4 shadow-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Select Exam Part
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Choose Part 1 or Part 2. 50 randomized questions will be selected from that half.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPart('pt1')}
                      className={`flex items-center justify-center py-3.5 px-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedPart === 'pt1'
                          ? 'bg-emerald-50/50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold tracking-wider font-mono">PART 1</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedPart('pt2')}
                      className={`flex items-center justify-center py-3.5 px-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedPart === 'pt2'
                          ? 'bg-emerald-50/50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold tracking-wider font-mono">PART 2</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 max-w-md mx-auto">
                  <button
                    onClick={startAssessment}
                    disabled={!isFormValid}
                    className={`w-full py-4 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xs cursor-pointer tracking-wider uppercase ${
                      isFormValid 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-slate-300 cursor-not-allowed opacity-70 text-slate-500'
                    }`}
                  >
                    Start {selectedPart === 'pt1' ? 'Part 1' : 'Part 2'} Exam (50 Qs)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================= */}
          {/* ACTIVE TEST SESSION VIEW                 */}
          {/* ======================================= */}
          {appState === 'active' && questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
              key="active-view"
            >
              {/* Left Side: Question Board Navigation Grid */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-3 flex flex-col gap-3 sticky top-24 max-h-[70vh] overflow-y-auto shadow-xs">
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-extrabold text-slate-900 font-mono uppercase tracking-wider">Board</h3>
                    <span className="text-[9px] font-mono bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded text-slate-600 font-bold">
                      {Object.keys(userAnswers).length} / {questions.length}
                    </span>
                  </div>
                </div>

                {/* Grid container */}
                <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-4 gap-1">
                  {questions.map((q, idx) => {
                    const isActive = idx === currentIndex;
                    const isAnswered = !!userAnswers[q.id];

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`py-1 text-[9px] font-mono font-bold rounded-sm border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-950 shadow-xs font-extrabold scale-105 z-10'
                            : isAnswered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Small indicator guide */}
                <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded bg-slate-200" /> Unsolved
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded bg-emerald-500" /> Solved
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded bg-slate-900" /> Active Question
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Main active question view */}
              <div className="lg:col-span-10 space-y-5">
                
                {/* Active Info Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-850 rounded-full border border-emerald-150">
                      Assessment {activePart === 'pt1' ? 'Pt 1' : 'Pt 2'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    <Timer className="h-3.5 w-3.5" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                    <span>Progress: Question {currentIndex + 1} of {questions.length}</span>
                    <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden border border-slate-300/10">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Main Question Body */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider block font-bold">
                      Question Assessment #{currentIndex + 1}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-relaxed">
                      {questions[currentIndex]?.text}
                    </h3>
                  </div>

                  {/* Choice stack */}
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {shuffledChoices[currentIndex]?.map((choice, idx) => {
                      const isSelected = userAnswers[questions[currentIndex]?.id] === choice;
                      const letter = String.fromCharCode(65 + idx); // A, B, C, D

                      return (
                        <button
                          key={choice}
                          onClick={() => selectOption(questions[currentIndex]?.id, choice)}
                          className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs ring-1 ring-emerald-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center border font-mono font-bold text-xs shrink-0 transition-all ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-500' 
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            {letter}
                          </div>
                          <span className="text-sm font-semibold">{choice}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Control elements */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>

                    <button
                      onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentIndex === questions.length - 1}
                      className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                  >
                    Submit Assessment
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ======================================= */}
          {/* SCORING & REVIEW RESULTS VIEW            */}
          {/* ======================================= */}
          {appState === 'results' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
              key="results-view"
            >
              {/* Score Display Card Banner */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
                
                <div className="space-y-3 text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                    <Award className="h-4 w-4 text-emerald-600 animate-bounce" /> Candidate Performance Report
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {examMetrics.isPassed ? 'Congratulations! You Passed' : 'Needs Practice & Study'}
                  </h2>
                  <p className="text-xs text-slate-600 max-w-xl">
                    {examMetrics.isPassed 
                      ? 'Outstanding diagnostic metrics! You have successfully surpassed the 80% passing grade constraint requirement established for Lean Six Sigma Green Belt, demonstrating highly competent knowledge of the DMAIC process.' 
                      : 'You did not meet the 80% passing requirement this time. Review the syllabus explanations below on your incorrectly answered questions, adjust your continuous improvement strategies, and give it another try!'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                    <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded font-bold">
                      Candidate: <strong className="text-slate-950">{candidateName}</strong>
                    </span>
                    <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded font-bold">
                      Staff ID: <strong className="text-slate-950">{candidateStaffId}</strong>
                    </span>
                    <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded font-bold">
                      Email: <strong className="text-slate-950">{candidateEmail}</strong>
                    </span>
                    <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded font-bold">
                      Exam Part: <strong className="text-slate-950">{activePart === 'pt1' ? 'Part 1' : 'Part 2'}</strong>
                    </span>
                    <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded font-bold">
                      Total Questions: <strong className="text-slate-950">{questions.length}</strong>
                    </span>
                    <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded font-bold">
                      Time Elapsed: <strong className="text-slate-950">{formatElapsed(timeSpentSeconds)}</strong>
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={downloadPdfReport}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-slate-850"
                    >
                      <FileDown className="h-4 w-4 text-emerald-400" /> Download PDF Exam Certificate & Report
                    </button>
                  </div>
                </div>

                {/* Final Score Circle */}
                <div className="text-center shrink-0 p-5 bg-slate-50 rounded-2xl border border-slate-200 min-w-[190px] shadow-2xs">
                  <span className="text-[10px] font-mono text-slate-500 block mb-0.5 font-bold uppercase tracking-wider">Final Score</span>
                  <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tighter">
                    {examMetrics.correct} <span className="text-xl text-slate-400">/ {questions.length}</span>
                  </div>
                  <div className="mt-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                      examMetrics.isPassed 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {examMetrics.percentage}% • {examMetrics.isPassed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <BookOpenCheck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Exhaustive Question Review</h3>
                    <p className="text-xs text-slate-500">Examine correct choices and full syllabus explanations below</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {questions.map((q, idx) => {
                    const selected = userAnswers[q.id];
                    const isCorrect = selected === q.correctAnswer;

                    return (
                      <div 
                        key={q.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCorrect 
                            ? 'bg-emerald-50/10 border-emerald-250' 
                            : selected 
                              ? 'bg-red-50/10 border-red-250' 
                              : 'bg-slate-50 border-slate-250'
                        }`}
                      >
                        {/* Header metadata */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500 font-bold">
                              Question #{idx + 1}
                            </span>
                          </div>

                          <div className="font-semibold">
                            {isCorrect ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Correct
                              </span>
                            ) : selected ? (
                              <span className="text-red-700 flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5 text-red-500" /> Incorrect
                              </span>
                            ) : (
                              <span className="text-amber-700 flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Unanswered
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Text */}
                        <h4 className="text-sm font-bold text-slate-900 leading-relaxed mb-4">
                          {q.text}
                        </h4>

                        {/* Choices visual stack */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.choices.map((choice) => {
                            const isCorrectChoice = choice === q.correctAnswer;
                            const isSelectedChoice = choice === selected;

                            return (
                              <div
                                key={choice}
                                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                  isCorrectChoice 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                                    : isSelectedChoice 
                                      ? 'bg-red-50 text-red-800 border-red-300 font-bold' 
                                      : 'bg-white text-slate-500 border-slate-150'
                                }`}
                              >
                                {isCorrectChoice && <span className="mr-1">✓</span>}
                                {isSelectedChoice && !isCorrectChoice && <span className="mr-1">✗</span>}
                                {choice}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={downloadPdfReport}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <FileDown className="h-4 w-4 text-emerald-400" /> Download PDF Report
                </button>
                <button
                  onClick={startAssessment}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retake Diagnostic
                </button>
                <button
                  onClick={() => setAppState('welcome')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs animate-pulse"
                >
                  Return to Start
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* CONFIRMATION / UNANSWERED WARNING MODAL */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-xl"
            >
              <div className="flex items-center gap-3 text-amber-600 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Exam Submission</h3>
                  <p className="text-xs text-slate-500">Please review your solved progress</p>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span>Total Questions:</span>
                  <span className="text-slate-950 font-bold">{questions.length}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span>Answered Questions:</span>
                  <span className="text-emerald-700 font-bold">{Object.keys(userAnswers).length}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span>Unanswered Questions:</span>
                  <span className={`font-bold ${unansweredCount > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                    {unansweredCount}
                  </span>
                </div>
              </div>

              {unansweredCount > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <span>
                    Warning: You have <strong>{unansweredCount} unanswered questions</strong>. Submitting now will count them as incorrect.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Keep Reviewing
                </button>
                <button
                  onClick={submitExamDirectly}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Submit & Score
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
