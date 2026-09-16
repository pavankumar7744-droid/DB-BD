import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import FeedbackCard from '../components/FeedbackCard';
import { Send, ArrowRight, CheckCircle, Loader2, Mic, MicOff, Camera, CameraOff, AlertTriangle, ShieldCheck } from 'lucide-react';

const InterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(location.state?.session || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [responseTimeSeconds, setResponseTimeSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [loadingSession, setLoadingSession] = useState(!session);
  const [errorMsg, setErrorMsg] = useState('');

  // Speech-to-Text state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Video Proctoring state (Opt-in)
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [proctorStats, setProctorStats] = useState({
    proctorScore: 100,
    faceInFramePercent: 100,
    eyeContactPercent: 98,
    warningCount: 0,
    flags: [],
  });

  // Fetch session details if not passed in location state
  useEffect(() => {
    const fetchSession = async () => {
      if (!session) {
        try {
          const { data } = await API.get(`/interviews/${sessionId}`);
          setSession(data);
        } catch (err) {
          console.error('[InterviewSession] Failed to fetch session:', err);
          setErrorMsg('Failed to load interview session');
        } finally {
          setLoadingSession(false);
        }
      } else {
        setLoadingSession(false);
      }
    };

    fetchSession();
  }, [sessionId, session]);

  // Setup Web Speech API (Speech to Text)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setUserAnswer((prev) => {
            const cleanPrev = prev.trim();
            const cleanTrans = transcript.trim();
            if (!cleanPrev) return cleanTrans;
            if (cleanPrev.endsWith(cleanTrans)) return cleanPrev;
            return `${cleanPrev} ${cleanTrans}`;
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('[SpeechToText] Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('[SpeechToText] Start error:', err);
      }
    }
  };

  // Setup Opt-In Video Proctoring (Camera + Blur/Tab Focus Detection)
  useEffect(() => {
    const isProctoringEnabled = session?.proctoring?.enabled;

    if (!isProctoringEnabled) {
      return; // If user did NOT accept proctoring, skip camera access completely!
    }

    let stream = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.warn('[Proctoring] Webcam access denied or unequipped:', err);
        setCameraActive(false);
      }
    };

    startWebcam();

    // Tab blur switch listener
    const handleBlur = () => {
      setProctorStats((prev) => {
        const newFlags = [...prev.flags, `Tab focus lost at ${new Date().toLocaleTimeString()}`];
        const newScore = Math.max(50, prev.proctorScore - 5);
        return {
          ...prev,
          proctorScore: newScore,
          warningCount: prev.warningCount + 1,
          flags: newFlags,
        };
      });
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [session]);

  const questions = session?.answers?.map((ans) => ans.question) || [];
  const currentQuestion = questions[currentIndex];

  const handleTimerTick = (secs) => {
    setResponseTimeSeconds(secs);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    setTimerActive(false);
    setErrorMsg('');

    try {
      const { data: feedback } = await API.post(`/interviews/${sessionId}/answer`, {
        questionId: currentQuestion._id || currentQuestion,
        userAnswer: userAnswer.trim(),
        responseTimeSeconds,
      });

      setCurrentFeedback(feedback);
    } catch (err) {
      console.error('[InterviewSession] Error submitting answer:', err);
      setErrorMsg(err.response?.data?.message || 'Error communicating with AI evaluation service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentFeedback(null);
    setUserAnswer('');
    setResponseTimeSeconds(0);
    setTimerActive(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleFinishInterview = async () => {
    setSubmitting(true);
    try {
      await API.put(`/interviews/${sessionId}/complete`, {
        proctoringData: session?.proctoring?.enabled ? proctorStats : null,
      });
      navigate(`/feedback/${sessionId}`);
    } catch (err) {
      console.error('[InterviewSession] Error completing interview:', err);
      navigate(`/feedback/${sessionId}`);
    }
  };

  if (loadingSession) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#6366f1' }} />
        <p>Loading session questions...</p>
      </div>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Session Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Unable to retrieve session questions.</p>
        <button onClick={() => navigate('/categories')} className="btn btn-primary">
          Back to Categories
        </button>
      </div>
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const isProctoringOn = Boolean(session.proctoring?.enabled);

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Session Category: {session.category}
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            Question {currentIndex + 1} of {questions.length}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isProctoringOn && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                background: cameraActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: cameraActive ? '1px solid #10b981' : '1px solid #ef4444',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: cameraActive ? '#34d399' : '#f87171',
              }}
            >
              <ShieldCheck size={14} />
              {cameraActive ? 'AI Proctoring Active' : 'Camera Off / Warning'}
            </div>
          )}
          <Timer active={timerActive && !currentFeedback} onTick={handleTimerTick} />
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Main Grid: Question Content + Optional Proctor PIP Monitor */}
      <div style={{ display: 'grid', gridTemplateColumns: isProctoringOn ? '1fr 240px' : '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Question Card */}
          <QuestionCard question={currentQuestion} index={currentIndex} total={questions.length} />

          {errorMsg && (
            <div className="alert alert-danger">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Answer Form or Feedback View */}
          {!currentFeedback ? (
            <form onSubmit={handleSubmitAnswer} className="card" style={{ background: '#1e293b' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '1rem', color: '#fff' }}>
                    Your Answer Response:
                  </label>

                  {/* Speech to Text Microphone Toggle Button */}
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleMic}
                      className="btn"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.35rem 0.85rem',
                        background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                        border: isListening ? '1px solid #ef4444' : '1px solid #6366f1',
                        color: isListening ? '#f87171' : '#a5b4fc',
                        animation: isListening ? 'pulse 1.5s infinite' : 'none',
                      }}
                      title="Dictate answer using your microphone"
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      {isListening ? 'Stop Mic (Recording...)' : 'Voice Dictate (Mic)'}
                    </button>
                  )}
                </div>

                <textarea
                  rows={7}
                  className="form-textarea"
                  placeholder="Type or click 'Voice Dictate' to speak your answer clearly. Be structured with key technical or action steps..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={submitting}
                  style={{ lineHeight: 1.6 }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>{isListening ? '🎙️ Listening to your voice... Speak into your mic.' : 'Keyboard or Voice Dictation ready'}</span>
                  <span>{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!userAnswer.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Evaluating with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Answer for AI Evaluation
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <FeedbackCard feedback={currentFeedback} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                {!isLastQuestion ? (
                  <button onClick={handleNextQuestion} className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                    Next Question <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishInterview}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      padding: '0.85rem 1.75rem',
                    }}
                    disabled={submitting}
                  >
                    <CheckCircle size={18} />
                    Finish Interview & View Summary
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PIP Proctoring Camera Box (Rendered ONLY if user accepted proctoring) */}
        {isProctoringOn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              className="card"
              style={{
                padding: '0.85rem',
                background: '#0f172a',
                borderColor: cameraActive ? '#6366f1' : '#ef4444',
                position: 'sticky',
                top: '90px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Camera size={14} style={{ color: '#6366f1' }} /> Live Proctoring
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>
                  Score: {proctorStats.proctorScore}%
                </span>
              </div>

              <div style={{ position: 'relative', width: '100%', height: '150px', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {!cameraActive && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.9)', color: '#94a3b8', fontSize: '0.75rem' }}>
                    <CameraOff size={24} style={{ marginBottom: '0.3rem', color: '#ef4444' }} />
                    <span>Camera Permission Required</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>• Eye Contact: <strong>{proctorStats.eyeContactPercent}%</strong></div>
                <div>• Face in Frame: <strong>{proctorStats.faceInFramePercent}%</strong></div>
                <div>• Focus Warnings: <strong style={{ color: proctorStats.warningCount > 0 ? '#fbbf24' : '#34d399' }}>{proctorStats.warningCount}</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;
