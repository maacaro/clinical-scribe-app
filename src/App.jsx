import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, MicOff, Upload, FileText, Play, Pause, Square, Copy, Check, 
  ChevronRight, ChevronLeft, Plus, Home, Clock, Settings, Search, 
  X, AlertCircle, CheckCircle, RefreshCw, Edit3, Stethoscope,
  ArrowLeft, LogOut, Trash2, Download, Shield, User, Globe,
  Volume2, Loader2, Menu, Sparkles, ClipboardList, Heart,
  MessageSquare, Zap, Bot, ChevronDown
} from "lucide-react";

// ─── Design Tokens ───
const tokens = {
  bg: "#FAFBFC",
  bgSubtle: "#F3F5F7",
  surface: "#FFFFFF",
  surfaceMuted: "#F8F9FB",
  textPrimary: "#1B1C1E",
  textSecondary: "#1F1F1F",
  textTertiary: "#2B2B2B",
  textMuted: "#303030",
  textPlaceholder: "#8A9099",
  border: "#E8ECF0",
  borderStrong: "#D4D9E0",
  primary: "#1A56DB",
  primaryHover: "#1648B8",
  primarySoft: "#EBF2FF",
  primarySoftHover: "#DBEAFE",
  success: "#0D9045",
  successSoft: "#ECFDF3",
  warning: "#D97706",
  warningSoft: "#FFFBEB",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
};

// ─── Toast Component ───
function Toast({ message, visible, onHide }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: tokens.textPrimary, color: "#fff", padding: "12px 24px",
      borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 9999,
      boxShadow: "0 8px 32px rgba(0,0,0,.18)", animation: "slideUp .3s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <CheckCircle size={16} /> {message}
    </div>
  );
}

// ─── Status Badge ───
function StatusBadge({ status }) {
  const map = {
    draft: { bg: tokens.bgSubtle, color: tokens.textTertiary, label: "Borrador" },
    processing: { bg: tokens.warningSoft, color: tokens.warning, label: "Procesando" },
    "ready for review": { bg: tokens.primarySoft, color: tokens.primary, label: "Listo para revisión" },
    reviewed: { bg: tokens.successSoft, color: tokens.success, label: "Revisado" },
    exported: { bg: tokens.bgSubtle, color: tokens.textTertiary, label: "Exportado" },
    failed: { bg: tokens.dangerSoft, color: tokens.danger, label: "Fallido" },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color, letterSpacing: ".02em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

// ─── Quick Action Card ───
function QuickAction({ icon: Icon, label, subtitle, onClick, compact }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: compact ? "row" : "column",
        alignItems: compact ? "center" : "flex-start",
        gap: compact ? 12 : 10,
        padding: compact ? "14px 18px" : "20px",
        background: hover ? tokens.primarySoft : tokens.surface,
        border: `1.5px solid ${hover ? tokens.primary + "30" : tokens.border}`,
        borderRadius: 16, cursor: "pointer", textAlign: "left",
        transition: "all .2s ease", width: "100%",
        transform: hover ? "translateY(-1px)" : "none",
        boxShadow: hover ? "0 4px 16px rgba(26,86,219,.08)" : "none",
      }}
    >
      <div style={{
        width: compact ? 36 : 42, height: compact ? 36 : 42, borderRadius: 12,
        background: hover ? tokens.primary + "12" : tokens.bgSubtle,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s ease", flexShrink: 0,
      }}>
        <Icon size={compact ? 18 : 20} color={hover ? tokens.primary : tokens.textTertiary} />
      </div>
      <div>
        <div style={{ fontSize: compact ? 14 : 15, fontWeight: 600, color: tokens.textPrimary }}>{label}</div>
        {subtitle && <div style={{ fontSize: 13, color: tokens.textPlaceholder, marginTop: 2 }}>{subtitle}</div>}
      </div>
    </button>
  );
}

// ─── Visit Card ───
function VisitCard({ visit, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", background: hover ? tokens.surfaceMuted : tokens.surface,
        border: `1px solid ${tokens.border}`, borderRadius: 14,
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "all .15s ease",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: tokens.textPrimary, marginBottom: 6 }}>
          {visit.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: tokens.textPlaceholder }}>{visit.date}</span>
          <StatusBadge status={visit.status} />
        </div>
        <div style={{ fontSize: 13, color: tokens.textTertiary, marginTop: 6 }}>
          {visit.outputs}
        </div>
      </div>
      <ChevronRight size={18} color={tokens.textPlaceholder} />
    </button>
  );
}

// ─── Main App ───
export default function ClinicalScribeAssistant() {
  const [screen, setScreen] = useState("public");
  const [authMode, setAuthMode] = useState(null); // null | "modal" | "signin" | "signup"
  const [authed, setAuthed] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [recordingState, setRecordingState] = useState("idle");
  const [recordTime, setRecordTime] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [activeTab, setActiveTab] = useState("note");
  const [pasteText, setPasteText] = useState("");
  const [selectedOutputs, setSelectedOutputs] = useState(["transcript", "summary", "note", "instructions"]);
  const [visitSearch, setVisitSearch] = useState("");
  const [editingDoc, setEditingDoc] = useState(false);
  // Scribing flow state
  const [visitContext, setVisitContext] = useState("");
  const [visitSpecialty, setVisitSpecialty] = useState("");
  const [noteFormat, setNoteFormat] = useState("structured");
  const [outputLang, setOutputLang] = useState("es");
  const [audioQuality, setAudioQuality] = useState("good"); // good | low | nosound
  const [quickNotes, setQuickNotes] = useState([]);
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNoteText, setQuickNoteText] = useState("");
  const [micPermission, setMicPermission] = useState("prompt"); // prompt | granted | denied
  const timerRef = useRef(null);
  const qualityRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showToast = useCallback((msg) => setToast({ visible: true, message: msg }), []);
  const hideToast = useCallback(() => setToast({ visible: false, message: "" }), []);

  const requireAuth = (action) => {
    if (authed) {
      action();
    } else {
      setPendingAction(() => action);
      setAuthMode("modal");
    }
  };

  const handleAuth = () => {
    setAuthed(true);
    setAuthMode(null);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    } else {
      setScreen("home");
    }
    showToast("Bienvenido al Asistente Clínico");
  };

  const startRecording = () => {
    setRecordingState("recording");
    setRecordTime(0);
    setAudioQuality("good");
    setQuickNotes([]);
    setShowQuickNote(false);
    setQuickNoteText("");
    timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    // Simulate audio quality changes
    qualityRef.current = setInterval(() => {
      const r = Math.random();
      setAudioQuality(r > 0.15 ? "good" : r > 0.05 ? "low" : "nosound");
    }, 8000);
  };

  const pauseRecording = () => {
    setRecordingState("paused");
    clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    setRecordingState("recording");
    timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    setRecordingState("stopped");
    clearInterval(timerRef.current);
    clearInterval(qualityRef.current);
    setAudioQuality("good");
  };


  const startProcessing = () => {
    setScreen("processing");
    setProcessingStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProcessingStep(step);
      if (step >= 4) {
        clearInterval(interval);
        setTimeout(() => {
          setScreen("results");
          setActiveTab("note");
        }, 800);
      }
    }, 1200);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const sampleVisits = [
    { id: 1, title: "Seguimiento — Vías Respiratorias Superiores", date: "Hoy, 10:32 AM", status: "ready for review", outputs: "Transcripción · Nota Clínica · Resumen" },
    { id: 2, title: "Consulta Inicial — Dolor Lumbar", date: "Ayer, 3:15 PM", status: "reviewed", outputs: "Nota Clínica · Indicaciones" },
    { id: 3, title: "Examen Anual — Pediátrico", date: "May 22, 2026", status: "exported", outputs: "Nota SOAP · Resumen" },
    { id: 4, title: "Visita Urgente — Evaluación Dolor Torácico", date: "May 21, 2026", status: "draft", outputs: "Transcripción" },
  ];

  // ─── Sidebar (Desktop) ───
  const sidebarWidth = sidebarOpen ? 260 : 72;

  const Sidebar = () => (
    <div style={{
      width: sidebarWidth, height: "100vh", background: tokens.surface,
      borderRight: `1px solid ${tokens.border}`, display: "flex",
      flexDirection: "column", padding: sidebarOpen ? "20px 14px" : "20px 10px",
      position: "fixed", left: 0, top: 0, zIndex: 100,
      transition: "width .25s ease, padding .25s ease",
      overflow: "hidden",
    }}>
      {/* Logo + Toggle */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: sidebarOpen ? "space-between" : "center",
        padding: sidebarOpen ? "4px 8px" : "4px 0",
        marginBottom: sidebarOpen ? 28 : 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${tokens.primary}, #3B82F6)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Stethoscope size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <span style={{
              fontSize: 16, fontWeight: 700, color: tokens.textPrimary,
              letterSpacing: "-.02em", whiteSpace: "nowrap",
            }}>
              Clinical Scribe
            </span>
          )}
        </div>
        {sidebarOpen && (
          <button onClick={() => setSidebarOpen(false)} title="Colapsar menú" style={{
            width: 28, height: 28, borderRadius: 7, border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background .15s",
          }}>
            <ChevronLeft size={18} color={tokens.textPlaceholder} />
          </button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} title="Expandir menú" style={{
          width: 40, height: 40, borderRadius: 10, border: "none",
          background: "transparent", cursor: "pointer", margin: "0 auto 12px",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background .15s",
        }}>
          <Menu size={20} color={tokens.textPlaceholder} />
        </button>
      )}

      {/* New Visit Button */}
      <button onClick={() => requireAuth(() => setScreen("startVisit"))} title="Nueva Consulta" style={{
        display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center",
        gap: 10, padding: sidebarOpen ? "12px 14px" : "12px",
        background: tokens.primary, color: "#fff", border: "none", borderRadius: 12,
        cursor: "pointer", fontSize: 14, fontWeight: 600, marginBottom: 20,
        width: "100%", transition: "all .15s",
      }}>
        <Plus size={18} />
        {sidebarOpen && <span>Nueva Consulta</span>}
      </button>

      {/* Nav Items */}
      {[
        { icon: Home, label: "Inicio", s: "home" },
        { icon: Clock, label: "Consultas", s: "visits" },
        { icon: Settings, label: "Ajustes", s: "settings" },
      ].map(item => (
        <button key={item.s} title={item.label} onClick={() => {
          if (item.s === "home" && !authed) setScreen("public");
          else requireAuth(() => setScreen(item.s));
        }} style={{
          display: "flex", alignItems: "center",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          gap: 10, padding: sidebarOpen ? "10px 14px" : "10px",
          background: screen === item.s ? tokens.primarySoft : "transparent",
          color: screen === item.s ? tokens.primary : tokens.textTertiary,
          border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14,
          fontWeight: screen === item.s ? 600 : 500, width: "100%",
          textAlign: "left", transition: "all .15s", marginBottom: 2,
        }}>
          <item.icon size={18} />
          {sidebarOpen && <span>{item.label}</span>}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* User Info */}
      {authed && (
        <div style={{
          padding: sidebarOpen ? "12px 14px" : "12px 0",
          borderTop: `1px solid ${tokens.border}`,
          display: "flex", alignItems: "center",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          gap: 10, marginTop: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: tokens.primarySoft,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <User size={16} color={tokens.primary} />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.textPrimary, whiteSpace: "nowrap" }}>Dr. García</div>
              <div style={{ fontSize: 12, color: tokens.textTertiary, whiteSpace: "nowrap" }}>Medicina Interna</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─── Mobile Header ───
  const MobileHeader = () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px", background: tokens.surface,
      borderBottom: `1px solid ${tokens.border}`, position: "sticky",
      top: 0, zIndex: 90,
    }}>
      {screen !== "public" && screen !== "home" ? (
        <button onClick={() => {
          if (screen === "record" || screen === "upload" || screen === "paste") setScreen("startVisit");
          else if (screen === "results" || screen === "processing") setScreen("home");
          else if (screen === "visitDetail") setScreen("visits");
          else setScreen(authed ? "home" : "public");
        }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={22} color={tokens.textPrimary} />
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `linear-gradient(135deg, ${tokens.primary}, #3B82F6)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Stethoscope size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: tokens.textPrimary }}>Asistente Clínico</span>
        </div>
      )}
      {authed && (
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: tokens.primarySoft,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <User size={16} color={tokens.primary} />
        </div>
      )}
    </div>
  );

  // ─── Mobile Bottom Nav ───
  const MobileNav = () => {
    if (!authed) return null;
    return (
      <div style={{
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
        background: tokens.surface, borderTop: `1px solid ${tokens.border}`,
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
      }}>
        {[
          { icon: Home, label: "Inicio", s: "home" },
          { icon: Clock, label: "Consultas", s: "visits" },
          { icon: Settings, label: "Ajustes", s: "settings" },
        ].map(item => (
          <button key={item.s} onClick={() => setScreen(item.s)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer", padding: "4px 16px",
            color: screen === item.s ? tokens.primary : tokens.textPlaceholder,
          }}>
            <item.icon size={20} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // ─── Auth Modal ───
  const AuthModal = () => {
    if (!authMode) return null;
    const isSignIn = authMode === "signin";
    const isSignUp = authMode === "signup";
    const isModal = authMode === "modal";

    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(15,20,25,.4)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
      }} onClick={(e) => { if (e.target === e.currentTarget) setAuthMode(null); }}>
        <div style={{
          background: tokens.surface, width: isMobile ? "100%" : 440,
          borderRadius: isMobile ? "24px 24px 0 0" : 20,
          padding: isMobile ? "28px 24px 36px" : "36px 40px",
          maxHeight: "90vh", overflow: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,.16)",
          animation: isMobile ? "slideUp .3s ease" : "fadeIn .2s ease",
        }}>
          {isMobile && (
            <div style={{
              width: 36, height: 4, borderRadius: 2, background: tokens.borderStrong,
              margin: "0 auto 20px",
            }} />
          )}

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px",
              background: `linear-gradient(135deg, ${tokens.primary}, #3B82F6)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Stethoscope size={24} color="#fff" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: tokens.textPrimary, margin: 0, letterSpacing: "-.02em" }}>
              {isModal && "Continúa a tu espacio clínico"}
              {isSignIn && "Bienvenido de nuevo"}
              {isSignUp && "Crea tu cuenta"}
            </h2>
            <p style={{ fontSize: 14, color: tokens.textTertiary, margin: "8px 0 0", lineHeight: 1.5 }}>
              {isModal && "Inicia sesión o crea una cuenta para generar documentación clínica de forma segura."}
              {isSignIn && "Inicia sesión para acceder a tu espacio clínico."}
              {isSignUp && "Configura tu cuenta para comenzar a documentar consultas."}
            </p>
          </div>

          <button onClick={handleAuth} style={{
            width: "100%", padding: "13px", borderRadius: 12, border: `1.5px solid ${tokens.border}`,
            background: tokens.surface, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 10,
            fontSize: 15, fontWeight: 600, color: tokens.textPrimary, marginBottom: 16,
            transition: "border-color .15s",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuar con Google
          </button>

          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "16px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: tokens.border }} />
            <span style={{ fontSize: 13, color: tokens.textPlaceholder, fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: tokens.border }} />
          </div>

          {(isSignIn || isSignUp) ? (
            <div>
              {isSignUp && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textTertiary, display: "block", marginBottom: 6 }}>Nombre completo</label>
                  <input placeholder="Dra. María García" style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    border: `1.5px solid ${tokens.border}`, fontSize: 15,
                    outline: "none", boxSizing: "border-box", background: tokens.surfaceMuted,
                  }} />
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textTertiary, display: "block", marginBottom: 6 }}>Correo electrónico</label>
                <input type="email" placeholder="doctor@clinica.com" style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  border: `1.5px solid ${tokens.border}`, fontSize: 15,
                  outline: "none", boxSizing: "border-box", background: tokens.surfaceMuted,
                }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textTertiary, display: "block", marginBottom: 6 }}>Contraseña</label>
                <input type="password" placeholder="••••••••" style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  border: `1.5px solid ${tokens.border}`, fontSize: 15,
                  outline: "none", boxSizing: "border-box", background: tokens.surfaceMuted,
                }} />
              </div>
              {isSignUp && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textTertiary, display: "block", marginBottom: 6 }}>
                    Specialty <span style={{ fontWeight: 400, color: tokens.textPlaceholder }}>(opcional)</span>
                  </label>
                  <select style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    border: `1.5px solid ${tokens.border}`, fontSize: 15,
                    outline: "none", boxSizing: "border-box", background: tokens.surfaceMuted,
                    color: tokens.textTertiary, appearance: "none",
                  }}>
                    <option value="">Seleccionar especialidad...</option>
                    <option>Medicina General</option>
                    <option>Pediatría</option>
                    <option>Medicina Interna</option>
                    <option>Ginecología</option>
                    <option>Psiquiatría</option>
                    <option>Dermatología</option>
                    <option>Otra</option>
                  </select>
                </div>
              )}
              <button onClick={handleAuth} style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "none",
                background: tokens.primary, color: "#fff", cursor: "pointer",
                fontSize: 15, fontWeight: 600, marginBottom: 16,
              }}>
                {isSignIn ? "Iniciar sesión" : "Crear cuenta"}
              </button>
              {isSignIn && (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <button style={{ background: "none", border: "none", color: tokens.primary, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 13, color: tokens.textPlaceholder }}>
                  {isSignIn ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                </span>
                <button onClick={() => setAuthMode(isSignIn ? "signup" : "signin")} style={{
                  background: "none", border: "none", color: tokens.primary,
                  cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}>
                  {isSignIn ? "Crear cuenta" : "Iniciar sesión"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => setAuthMode("signin")} style={{
                width: "100%", padding: "13px", borderRadius: 12,
                border: `1.5px solid ${tokens.border}`, background: tokens.surface,
                cursor: "pointer", fontSize: 15, fontWeight: 600, color: tokens.textPrimary,
              }}>
                Iniciar sesión
              </button>
              <button onClick={() => setAuthMode("signup")} style={{
                width: "100%", padding: "13px", borderRadius: 12,
                border: "none", background: tokens.primary, color: "#fff",
                cursor: "pointer", fontSize: 15, fontWeight: 600,
              }}>
                Crear cuenta
              </button>
            </div>
          )}

          <p style={{ fontSize: 12, color: tokens.textPlaceholder, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
            Al continuar, aceptas los <a href="#" style={{ color: tokens.primary, textDecoration: "none" }}>Términos</a> y la <a href="#" style={{ color: tokens.primary, textDecoration: "none" }}>Política de Privacidad</a>.
          </p>
        </div>
      </div>
    );
  };

  // ─── Screens ───

  // Public Workspace
  const PublicWorkspace = () => (
    <div style={{
      maxWidth: 760, margin: "0 auto", padding: isMobile ? "40px 20px 100px" : "80px 24px",
      textAlign: "center",
    }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 20, background: tokens.primarySoft,
        color: tokens.primary, fontSize: 13, fontWeight: 600, marginBottom: 24,
      }}>
        <Sparkles size={14} /> Documentación Clínica con IA
      </div>

      <h1 style={{
        fontSize: isMobile ? 30 : 46, fontWeight: 800, color: tokens.textPrimary,
        lineHeight: 1.12, margin: "0 0 16px", letterSpacing: "-.03em",
      }}>
        Inteligencia clínica para convertir consultas en notas clínicas estructuradas
      </h1>
      <p style={{
        fontSize: isMobile ? 16 : 18, color: tokens.textTertiary, lineHeight: 1.6,
        margin: "0 auto 36px", maxWidth: 560,
      }}>
        Genera transcripciones, resúmenes, notas clínicas e indicaciones para el paciente desde tus consultas.
      </p>

      {/* Main Input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 8px 8px 20px", borderRadius: 16,
        border: `1.5px solid ${tokens.borderStrong}`,
        background: tokens.surface, maxWidth: 600, margin: "0 auto 32px",
        boxShadow: "0 2px 12px rgba(0,0,0,.04)",
      }}>
        <input
          placeholder="Describe la consulta o pega contexto clínico..."
          onFocus={() => requireAuth(() => setScreen("home"))}
          style={{
            flex: 1, border: "none", outline: "none", fontSize: 15,
            color: tokens.textPrimary, background: "transparent",
          }}
        />
        <button onClick={() => requireAuth(() => { setScreen("record"); startRecording(); })} style={{
          width: 40, height: 40, borderRadius: 10, border: "none",
          background: tokens.bgSubtle, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Mic size={18} color={tokens.textPlaceholder} />
        </button>
        <button onClick={() => requireAuth(() => setScreen("upload"))} style={{
          width: 40, height: 40, borderRadius: 10, border: "none",
          background: tokens.bgSubtle, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Upload size={18} color={tokens.textPlaceholder} />
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
        gap: 10, maxWidth: 600, margin: "0 auto",
      }}>
        {[
          { icon: Mic, label: "Grabar Consulta", action: () => { setScreen("record"); startRecording(); } },
          { icon: ClipboardList, label: "Nota Clínica", action: () => setScreen("paste") },
          { icon: Upload, label: "Subir Audio", action: () => setScreen("upload") },
          { icon: Heart, label: "Indicaciones Paciente", action: () => setScreen("paste") },
          { icon: FileText, label: "Pegar Contexto", action: () => setScreen("paste") },
        ].map((a, i) => (
          <QuickAction
            key={i} icon={a.icon} label={a.label} compact
            onClick={() => requireAuth(a.action)}
          />
        ))}
      </div>
    </div>
  );

  // Home Post-Login
  const HomeScreen = () => (
    <div style={{
      maxWidth: 760, margin: "0 auto", padding: isMobile ? "40px 20px 100px" : "80px 24px",
      textAlign: "center",
    }}>
      <h1 style={{
        fontSize: isMobile ? 28 : 40, fontWeight: 800, color: tokens.textPrimary,
        lineHeight: 1.15, margin: "0 0 10px", letterSpacing: "-.03em",
      }}>
        Buenos días, Dr. García
      </h1>
      <p style={{
        fontSize: isMobile ? 16 : 18, color: tokens.textTertiary, lineHeight: 1.6,
        margin: "0 auto 36px", maxWidth: 560,
      }}>
        ¿Qué deseas documentar hoy?
      </p>

      {/* Active Recording CTA */}
      {(recordingState === "recording" || recordingState === "paused") && (
        <button onClick={() => setScreen("record")} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", maxWidth: 600, margin: "0 auto 28px",
          padding: "16px 20px", borderRadius: 16, border: "none",
          background: tokens.primary, color: "#fff", cursor: "pointer",
          boxShadow: `0 4px 20px ${tokens.primary}35`,
          textAlign: "left", transition: "transform .15s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "rgba(255,255,255,.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: "50%",
                background: recordingState === "recording" ? "#fff" : "rgba(255,255,255,.5)",
                animation: recordingState === "recording" ? "pulse 1.5s infinite" : "none",
              }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                Continuar con la consulta
              </div>
              <div style={{ fontSize: 13, opacity: .8, marginTop: 2 }}>
                {recordingState === "recording" ? "Grabando" : "Pausado"} · {formatTime(recordTime)}
              </div>
            </div>
          </div>
          <ChevronRight size={20} style={{ opacity: .7 }} />
        </button>
      )}

      {/* Main Input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 8px 8px 20px", borderRadius: 16,
        border: `1.5px solid ${tokens.borderStrong}`,
        background: tokens.surface, maxWidth: 600, margin: "0 auto 32px",
        boxShadow: "0 2px 12px rgba(0,0,0,.04)",
      }}>
        <input
          placeholder="Describe la consulta o pega contexto clínico..."
          style={{
            flex: 1, border: "none", outline: "none", fontSize: 15,
            color: tokens.textPrimary, background: "transparent",
          }}
        />
        <button onClick={() => {
          if (recordingState === "recording" || recordingState === "paused") { setScreen("record"); }
          else { setScreen("record"); startRecording(); }
        }} style={{
          width: 40, height: 40, borderRadius: 10, border: "none",
          background: tokens.bgSubtle, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Mic size={18} color={tokens.textPlaceholder} />
        </button>
        <button onClick={() => setScreen("upload")} style={{
          width: 40, height: 40, borderRadius: 10, border: "none",
          background: tokens.bgSubtle, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Upload size={18} color={tokens.textPlaceholder} />
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
        gap: 10, maxWidth: 600, margin: "0 auto",
      }}>
        {[
          { icon: Mic, label: (recordingState === "recording" || recordingState === "paused") ? "Continuar Grabación" : "Grabar Consulta",
            action: () => {
              if (recordingState === "recording" || recordingState === "paused") { setScreen("record"); }
              else { setScreen("record"); startRecording(); }
            }
          },
          { icon: ClipboardList, label: "Nota Clínica", action: () => setScreen("paste") },
          { icon: Upload, label: "Subir Audio", action: () => setScreen("upload") },
          { icon: Heart, label: "Indicaciones Paciente", action: () => setScreen("paste") },
          { icon: FileText, label: "Pegar Contexto", action: () => setScreen("paste") },
        ].map((a, i) => (
          <QuickAction key={i} icon={a.icon} label={a.label} compact onClick={a.action} />
        ))}
      </div>
    </div>
  );

  // Start Visit
  const StartVisitScreen = () => (
    <div style={{
      maxWidth: 700, margin: "0 auto",
      padding: isMobile ? "28px 20px 120px" : "48px 24px",
    }}>
      <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: tokens.textPrimary, margin: "0 0 8px", letterSpacing: "-.02em" }}>
        Start Visit
      </h1>
      <p style={{ fontSize: 15, color: tokens.textTertiary, margin: "0 0 28px" }}>
        Elige cómo deseas comenzar a documentar esta consulta.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: 14,
      }}>
        <QuickAction
          icon={Mic} label="Record Consultation"
          subtitle="Capture audio during the visit"
          onClick={() => { setScreen("record"); startRecording(); }}
        />
        <QuickAction
          icon={Upload} label="Upload Audio"
          subtitle="Use an existing consultation recording"
          onClick={() => setScreen("upload")}
        />
        <QuickAction
          icon={FileText} label="Paste Clinical Context"
          subtitle="Paste notes, symptoms, HPI, or transcript"
          onClick={() => setScreen("paste")}
        />
      </div>
    </div>
  );

  // ─── Record Consultation (Improved Scribing) ───
  const RecordScreen = () => {
    const addQuickNote = () => {
      if (quickNoteText.trim()) {
        setQuickNotes(prev => [...prev, { text: quickNoteText, time: formatTime(recordTime) }]);
        setQuickNoteText("");
        setShowQuickNote(false);
        showToast("Nota agregada");
      }
    };

    const toggleCapturedOutput = (key) => {
      setSelectedOutputs(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    };

    const qualityConfig = {
      good: { color: tokens.success, bg: tokens.successSoft, label: "Calidad de audio: Buena", icon: "●" },
      low: { color: tokens.warning, bg: tokens.warningSoft, label: "Calidad baja — Acércate al micrófono", icon: "▲" },
      nosound: { color: tokens.danger, bg: tokens.dangerSoft, label: "Sin voz detectada — Verifica el micrófono", icon: "!" },
    };
    const q = qualityConfig[audioQuality];

    // ─── STOPPED: Audio Captured ───
    if (recordingState === "stopped") {
      return (
        <div style={{
          maxWidth: 520, margin: "0 auto",
          padding: isMobile ? "32px 20px 120px" : "48px 24px",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
            background: tokens.successSoft,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle size={32} color={tokens.success} />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: tokens.textPrimary, margin: "0 0 20px", textAlign: "center" }}>
            Audio capturado
          </h2>

          {/* Summary cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24,
          }}>
            {[
              { label: "Duración", value: formatTime(recordTime) },
              { label: "Contexto", value: visitContext ? "Sí" : "No" },
              { label: "Audio", value: "Bueno" },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "12px", borderRadius: 12, background: tokens.surfaceMuted,
                textAlign: "center", border: `1px solid ${tokens.border}`,
              }}>
                <div style={{ fontSize: 12, color: tokens.textPlaceholder, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Quick notes summary */}
          {quickNotes.length > 0 && (
            <div style={{
              padding: "14px 16px", borderRadius: 12, background: tokens.surfaceMuted,
              border: `1px solid ${tokens.border}`, marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.textTertiary, marginBottom: 8 }}>
                Notas rápidas ({quickNotes.length})
              </div>
              {quickNotes.map((n, i) => (
                <div key={i} style={{
                  fontSize: 13, color: tokens.textPrimary, padding: "6px 0",
                  borderTop: i > 0 ? `1px solid ${tokens.border}` : "none",
                  display: "flex", gap: 8,
                }}>
                  <span style={{ color: tokens.textPlaceholder, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{n.time}</span>
                  <span>{n.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Continue recording CTA */}
          <button onClick={() => { setRecordingState("recording"); timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000); qualityRef.current = setInterval(() => { const r = Math.random(); setAudioQuality(r > 0.15 ? "good" : r > 0.05 ? "low" : "nosound"); }, 8000); }} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", padding: "14px 20px", borderRadius: 14, marginBottom: 28,
            border: `2px solid ${tokens.primary}`,
            background: tokens.primarySoft, cursor: "pointer",
            fontSize: 15, fontWeight: 700, color: tokens.primary,
            transition: "all .15s",
          }}>
            <Mic size={18} /> Continuar consulta · {formatTime(recordTime)}
          </button>

          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "0 0 20px",
          }}>
            <div style={{ flex: 1, height: 1, background: tokens.border }} />
            <span style={{ fontSize: 13, color: tokens.textPlaceholder, fontWeight: 500 }}>o generar documentación</span>
            <div style={{ flex: 1, height: 1, background: tokens.border }} />
          </div>

          {/* Output selection */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textTertiary, display: "block", marginBottom: 10 }}>
              ¿Qué deseas generar?
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "transcript", label: "Transcripción" },
                { key: "summary", label: "Resumen Clínico" },
                { key: "note", label: "Nota Clínica Estructurada" },
                { key: "instructions", label: "Indicaciones para el Paciente" },
              ].map(o => {
                const sel = selectedOutputs.includes(o.key);
                return (
                  <button key={o.key} onClick={() => toggleCapturedOutput(o.key)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: 12, textAlign: "left",
                    border: `1.5px solid ${sel ? tokens.primary + "40" : tokens.border}`,
                    background: sel ? tokens.primarySoft : tokens.surface,
                    cursor: "pointer", transition: "all .15s", width: "100%",
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${sel ? tokens.primary : tokens.borderStrong}`,
                      background: sel ? tokens.primary : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .15s",
                    }}>
                      {sel && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 500,
                      color: sel ? tokens.primary : tokens.textPrimary,
                    }}>
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={startProcessing} disabled={selectedOutputs.length === 0} style={{
            width: "100%", padding: 15, borderRadius: 14, border: "none",
            background: selectedOutputs.length > 0 ? tokens.primary : tokens.bgSubtle,
            color: selectedOutputs.length > 0 ? "#fff" : tokens.textPlaceholder,
            cursor: selectedOutputs.length > 0 ? "pointer" : "not-allowed",
            fontSize: 15, fontWeight: 700, marginBottom: 10,
          }}>
            Generar Documentación
          </button>
          <button onClick={() => { showToast("Grabación guardada"); setScreen("home"); }} style={{
            width: "100%", padding: 13, borderRadius: 12, border: `1.5px solid ${tokens.border}`,
            background: tokens.surface, cursor: "pointer", fontSize: 14, fontWeight: 600,
            color: tokens.textTertiary,
          }}>
            Guardar grabación para después
          </button>
        </div>
      );
    }

    // ─── RECORDING / PAUSED: Active Recording ───
    return (
      <div style={{
        maxWidth: isMobile ? "100%" : 680, margin: "0 auto",
        padding: isMobile ? "20px 20px 120px" : "40px 24px",
        minHeight: isMobile ? "calc(100vh - 60px)" : "auto",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: tokens.textPrimary, margin: 0 }}>
            Grabando Consulta
          </h2>
          <div style={{
            fontSize: 24, fontWeight: 300, color: tokens.textPrimary,
            fontVariantNumeric: "tabular-nums", fontFamily: "'SF Mono', 'Fira Code', monospace",
          }}>
            {formatTime(recordTime)}
          </div>
        </div>

        {/* Status row: Recording state + Audio quality */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 32, flexWrap: "wrap", gap: 8,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 20,
            background: recordingState === "recording" ? tokens.dangerSoft : tokens.warningSoft,
            color: recordingState === "recording" ? tokens.danger : tokens.warning,
            fontSize: 13, fontWeight: 600,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: recordingState === "recording" ? tokens.danger : tokens.warning,
              animation: recordingState === "recording" ? "pulse 1.5s infinite" : "none",
            }} />
            {recordingState === "recording" ? "Grabando" : "Pausado"}
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 20,
            background: q.bg, color: q.color, fontSize: 12, fontWeight: 600,
            transition: "all .3s ease",
          }}>
            <span style={{ fontSize: 10 }}>{q.icon}</span> {q.label}
          </div>
        </div>

        {/* Timer (big, centered) */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{
            fontSize: isMobile ? 72 : 88, fontWeight: 200, color: tokens.textPrimary,
            fontVariantNumeric: "tabular-nums", letterSpacing: "-.03em",
            fontFamily: "'SF Mono', 'Fira Code', monospace", lineHeight: 1,
          }}>
            {formatTime(recordTime)}
          </div>
        </div>

        {/* Waveform */}
        <div style={{
          height: 56, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 2.5, margin: "0 0 32px",
        }}>
          {Array.from({ length: isMobile ? 40 : 60 }, (_, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2,
              background: recordingState === "recording" ? tokens.primary + "50" : tokens.borderStrong,
              height: recordingState === "recording"
                ? `${10 + Math.random() * 38}px`
                : "10px",
              transition: "height .3s ease, background .3s ease",
            }} />
          ))}
        </div>

        {/* Paused message */}
        {recordingState === "paused" && (
          <div style={{
            textAlign: "center", padding: "16px 20px", borderRadius: 12,
            background: tokens.warningSoft, marginBottom: 24,
            fontSize: 14, color: tokens.warning, fontWeight: 500,
          }}>
            La consulta no se está grabando. Presiona Reanudar para continuar.
          </div>
        )}

        {/* Main controls */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 16, marginBottom: 28,
        }}>
          {recordingState === "recording" ? (
            <button onClick={pauseRecording} style={{
              width: 60, height: 60, borderRadius: 16, border: `1.5px solid ${tokens.border}`,
              background: tokens.surface, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s",
            }}>
              <Pause size={26} color={tokens.textPrimary} />
            </button>
          ) : (
            <button onClick={resumeRecording} style={{
              width: 60, height: 60, borderRadius: 16, border: `1.5px solid ${tokens.primary}`,
              background: tokens.primarySoft, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s",
            }}>
              <Play size={26} color={tokens.primary} />
            </button>
          )}
          <button onClick={stopRecording} style={{
            width: 60, height: 60, borderRadius: 16, border: "none",
            background: tokens.danger, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 16px ${tokens.danger}30`,
          }}>
            <Square size={22} color="#fff" fill="#fff" />
          </button>
        </div>

        {/* Add quick note */}
        <div style={{ flex: 1 }}>
          {!showQuickNote ? (
            <button onClick={() => setShowQuickNote(true)} style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              border: `1.5px dashed ${tokens.borderStrong}`,
              background: "transparent", cursor: "pointer",
              fontSize: 14, fontWeight: 500, color: tokens.textTertiary,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all .15s",
            }}>
              <Edit3 size={16} /> Agregar nota rápida
            </button>
          ) : (
            <div style={{
              padding: 14, borderRadius: 12, border: `1.5px solid ${tokens.primary}30`,
              background: tokens.primarySoft + "40",
            }}>
              <textarea
                value={quickNoteText}
                onChange={(e) => setQuickNoteText(e.target.value)}
                placeholder="Paciente menciona síntomas desde hace 3 días..."
                autoFocus
                style={{
                  width: "100%", minHeight: 60, padding: 10, borderRadius: 8,
                  border: `1px solid ${tokens.border}`, fontSize: 14,
                  outline: "none", boxSizing: "border-box", resize: "none",
                  background: tokens.surface, fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={addQuickNote} disabled={!quickNoteText.trim()} style={{
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: quickNoteText.trim() ? tokens.primary : tokens.bgSubtle,
                  color: quickNoteText.trim() ? "#fff" : tokens.textPlaceholder,
                  cursor: quickNoteText.trim() ? "pointer" : "not-allowed",
                  fontSize: 13, fontWeight: 600,
                }}>
                  Guardar nota
                </button>
                <button onClick={() => { setShowQuickNote(false); setQuickNoteText(""); }} style={{
                  padding: "8px 16px", borderRadius: 8,
                  border: `1px solid ${tokens.border}`, background: tokens.surface,
                  cursor: "pointer", fontSize: 13, fontWeight: 500, color: tokens.textTertiary,
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Saved quick notes count */}
          {quickNotes.length > 0 && !showQuickNote && (
            <div style={{
              marginTop: 10, fontSize: 13, color: tokens.textPlaceholder,
              textAlign: "center",
            }}>
              {quickNotes.length} nota{quickNotes.length > 1 ? "s" : ""} agregada{quickNotes.length > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Visit context preview if provided */}
        {visitContext && (
          <div style={{
            marginTop: 20, padding: "12px 16px", borderRadius: 12,
            background: tokens.surfaceMuted, border: `1px solid ${tokens.border}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: tokens.textPlaceholder, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".04em" }}>
              Contexto de la consulta
            </div>
            <div style={{ fontSize: 13, color: tokens.textTertiary, lineHeight: 1.5 }}>
              {visitContext.length > 120 ? visitContext.slice(0, 120) + "..." : visitContext}
            </div>
          </div>
        )}

        {/* Safety note */}
        <div style={{
          marginTop: 20, textAlign: "center", fontSize: 12,
          color: tokens.textPlaceholder, padding: "0 20px",
        }}>
          <Shield size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
          Los borradores generados por IA deben ser revisados antes de su uso.
        </div>
      </div>
    );
  };

  // Upload Audio
  const UploadScreen = () => {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState(null);
    return (
      <div style={{
        maxWidth: 560, margin: "0 auto",
        padding: isMobile ? "28px 20px 120px" : "48px 24px",
      }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: tokens.textPrimary, margin: "0 0 8px" }}>
          Upload Audio
        </h1>
        <p style={{ fontSize: 15, color: tokens.textTertiary, margin: "0 0 28px" }}>
          Sube una grabación existente para generar documentación.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile({ name: "consultation_recording.mp3" }); }}
          onClick={() => setFile({ name: "consultation_recording.mp3" })}
          style={{
            border: `2px dashed ${dragOver ? tokens.primary : tokens.borderStrong}`,
            borderRadius: 16, padding: "48px 24px", textAlign: "center",
            cursor: "pointer", marginBottom: 20,
            background: dragOver ? tokens.primarySoft : tokens.surfaceMuted,
            transition: "all .2s ease",
          }}
        >
          {file ? (
            <>
              <CheckCircle size={36} color={tokens.success} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: tokens.textPrimary, margin: "0 0 4px" }}>{file.name}</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{
                background: "none", border: "none", color: tokens.danger, cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 8,
              }}>
                Remove
              </button>
            </>
          ) : (
            <>
              <Upload size={36} color={tokens.textPlaceholder} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: tokens.textPrimary, margin: "0 0 4px" }}>
                Arrastra un archivo de audio aquí o haz clic para buscar
              </p>
              <p style={{ fontSize: 13, color: tokens.textPlaceholder, margin: 0 }}>MP3, WAV, M4A</p>
            </>
          )}
        </div>

        <div style={{
          background: tokens.surfaceMuted, borderRadius: 14, padding: 16, marginBottom: 24,
        }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textTertiary, display: "block", marginBottom: 8 }}>
            Contexto adicional <span style={{ fontWeight: 400, color: tokens.textPlaceholder }}>(opcional)</span>
          </label>
          <textarea placeholder="Agrega edad del paciente, motivo de consulta, especialidad, diagnóstico o contexto adicional..." style={{
            width: "100%", minHeight: 80, padding: 12, borderRadius: 10,
            border: `1.5px solid ${tokens.border}`, fontSize: 14,
            outline: "none", boxSizing: "border-box", resize: "vertical",
            background: tokens.surface, fontFamily: "inherit",
          }} />
        </div>

        <button onClick={startProcessing} disabled={!file} style={{
          width: "100%", padding: 15, borderRadius: 14, border: "none",
          background: file ? tokens.primary : tokens.bgSubtle,
          color: file ? "#fff" : tokens.textPlaceholder,
          cursor: file ? "pointer" : "not-allowed",
          fontSize: 15, fontWeight: 700,
        }}>
          Generate Documentation
        </button>
      </div>
    );
  };

  // Paste Clinical Context
  const PasteScreen = () => (
    <div style={{
      maxWidth: 620, margin: "0 auto",
      padding: isMobile ? "28px 20px 120px" : "48px 24px",
    }}>
      <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: tokens.textPrimary, margin: "0 0 8px" }}>
        Paste Clinical Context
      </h1>
      <p style={{ fontSize: 15, color: tokens.textTertiary, margin: "0 0 28px" }}>
        Pega tus notas de consulta, síntomas o transcripción para generar documentación estructurada.
      </p>

      <textarea
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        placeholder="Pega notas de consulta, HPI, síntomas, transcripción o contexto clínico..."
        style={{
          width: "100%", minHeight: 180, padding: 16, borderRadius: 14,
          border: `1.5px solid ${tokens.borderStrong}`, fontSize: 15,
          outline: "none", boxSizing: "border-box", resize: "vertical",
          background: tokens.surface, fontFamily: "inherit", lineHeight: 1.6,
        }}
      />

      {pasteText.length > 0 && pasteText.length < 50 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
          borderRadius: 10, background: tokens.warningSoft, marginTop: 12,
          fontSize: 13, color: tokens.warning, fontWeight: 500,
        }}>
          <AlertCircle size={16} /> El contexto es breve. La nota generada podría ser limitada.
        </div>
      )}

      <div style={{ marginTop: 20, marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textTertiary, display: "block", marginBottom: 10 }}>
          Generate
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { key: "transcript", label: "Transcripción" },
            { key: "summary", label: "Resumen" },
            { key: "note", label: "Nota Clínica" },
            { key: "instructions", label: "Indicaciones Paciente" },
          ].map(o => {
            const sel = selectedOutputs.includes(o.key);
            return (
              <button key={o.key} onClick={() => {
                setSelectedOutputs(prev =>
                  sel ? prev.filter(k => k !== o.key) : [...prev, o.key]
                );
              }} style={{
                padding: "8px 16px", borderRadius: 10,
                border: `1.5px solid ${sel ? tokens.primary : tokens.border}`,
                background: sel ? tokens.primarySoft : tokens.surface,
                color: sel ? tokens.primary : tokens.textTertiary,
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                transition: "all .15s",
              }}>
                {sel && <Check size={14} style={{ marginRight: 4, verticalAlign: -2 }} />}
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={startProcessing} disabled={!pasteText} style={{
        width: "100%", padding: 15, borderRadius: 14, border: "none",
        background: pasteText ? tokens.primary : tokens.bgSubtle,
        color: pasteText ? "#fff" : tokens.textPlaceholder,
        cursor: pasteText ? "pointer" : "not-allowed",
        fontSize: 15, fontWeight: 700,
      }}>
        Generate Documentation
      </button>
    </div>
  );

  // Processing Screen
  const ProcessingScreen = () => {
    const steps = [
      "Transcribiendo consulta",
      "Creando resumen clínico",
      "Estructurando nota clínica",
      "Redactando indicaciones para el paciente",
    ];
    return (
      <div style={{
        maxWidth: 480, margin: "0 auto",
        padding: isMobile ? "60px 20px" : "100px 24px",
        textAlign: "center",
      }}>
        <div style={{ marginBottom: 32 }}>
          <Loader2 size={44} color={tokens.primary} style={{ animation: "spin 1.2s linear infinite" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: tokens.textPrimary, margin: "0 0 8px" }}>
          Generando documentación clínica
        </h2>
        <p style={{ fontSize: 15, color: tokens.textTertiary, margin: "0 0 40px" }}>
          Tus borradores clínicos se están preparando.
        </p>
        <div style={{ textAlign: "left", maxWidth: 320, margin: "0 auto" }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
              borderBottom: i < steps.length - 1 ? `1px solid ${tokens.border}` : "none",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: i < processingStep ? tokens.successSoft
                  : i === processingStep ? tokens.primarySoft : tokens.bgSubtle,
              }}>
                {i < processingStep ? (
                  <Check size={14} color={tokens.success} />
                ) : i === processingStep ? (
                  <Loader2 size={14} color={tokens.primary} style={{ animation: "spin 1.2s linear infinite" }} />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: tokens.borderStrong }} />
                )}
              </div>
              <span style={{
                fontSize: 14, fontWeight: i <= processingStep ? 600 : 400,
                color: i <= processingStep ? tokens.textPrimary : tokens.textPlaceholder,
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Generated Documentation / Results
  const ResultsScreen = () => {
    const tabs = [
      { key: "transcript", label: "Transcripción", icon: Volume2 },
      { key: "summary", label: "Resumen", icon: FileText },
      { key: "note", label: "Nota Clínica", icon: ClipboardList },
      { key: "instructions", label: "Indicaciones Paciente", icon: Heart },
    ];

    const docContent = {
      transcript: (
        <div style={{ lineHeight: 1.8, fontSize: 15 }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontWeight: 700, color: tokens.primary, fontSize: 13, textTransform: "uppercase", letterSpacing: ".05em" }}>Médico</span>
            <p style={{ margin: "4px 0 0", color: tokens.textPrimary }}>
              Buenos días. ¿Qué lo trae por aquí hoy?
            </p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontWeight: 700, color: tokens.success, fontSize: 13, textTransform: "uppercase", letterSpacing: ".05em" }}>Paciente</span>
            <p style={{ margin: "4px 0 0", color: tokens.textPrimary }}>
              He tenido una tos persistente y fiebre baja por unos tres días. Empezó con dolor de garganta y ahora me siento bastante congestionado.
            </p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontWeight: 700, color: tokens.primary, fontSize: 13, textTransform: "uppercase", letterSpacing: ".05em" }}>Médico</span>
            <p style={{ margin: "4px 0 0", color: tokens.textPrimary }}>
              ¿Alguna dificultad para respirar, dolor de pecho o falta de aire?
            </p>
          </div>
          <div>
            <span style={{ fontWeight: 700, color: tokens.success, fontSize: 13, textTransform: "uppercase", letterSpacing: ".05em" }}>Paciente</span>
            <p style={{ margin: "4px 0 0", color: tokens.textPrimary }}>
              No, nada de eso. Solo la tos y la congestión. También tengo algunos dolores corporales leves.
            </p>
          </div>
        </div>
      ),
      summary: (
        <div style={{ fontSize: 15, lineHeight: 1.7 }}>
          {[
            { title: "Motivo de Consulta", text: "Tos persistente y fiebre baja por 3 días." },
            { title: "Historia Relevante", text: "Inicio con dolor de garganta, progresó a congestión nasal. Niega dificultad respiratoria, dolor de pecho o falta de aire. Refiere dolores corporales leves." },
            { title: "Síntomas", text: "Tos (productiva), fiebre (baja), congestión nasal, dolor de garganta (mejorando), dolores corporales (leves)." },
            { title: "Evaluación", text: "Presentation consistent with acute upper respiratory infection, likely viral etiology." },
            { title: "Plan Discutido", text: "Manejo sintomático con reposo, líquidos y antipiréticos de venta libre. Regresar si los síntomas empeoran o persisten más de 7-10 días." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: tokens.primary, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: ".04em" }}>
                {s.title}
              </h4>
              <p style={{ margin: 0, color: tokens.textPrimary }}>{s.text}</p>
            </div>
          ))}
        </div>
      ),
      note: (
        <div style={{ fontSize: 15, lineHeight: 1.7 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 8, background: tokens.bgSubtle,
            fontSize: 12, fontWeight: 600, color: tokens.textTertiary, marginBottom: 20,
          }}>
            Formato: SOAP
          </div>
          {[
            { title: "Subjetivo", text: "Paciente se presenta con historia de 3 días de tos persistente, fiebre baja y congestión nasal. Refiere dolor de garganta inicial que está mejorando. Confirma dolores corporales leves. Niega dificultad respiratoria, dolor de pecho o falta de aire." },
            { title: "Objetivo", text: (
              <span style={{ color: tokens.warning, fontStyle: "italic" }}>
                Signos vitales no proporcionados. Examen físico no documentado.
              </span>
            )},
            { title: "Evaluación", text: "Infección aguda de vías respiratorias superiores, probablemente viral. Sin signos de sobreinfección bacteriana según los síntomas reportados por el paciente." },
            { title: "Plan", text: "1. Manejo sintomático: reposo, hidratación adecuada, antipiréticos de venta libre (paracetamol o ibuprofeno) según necesidad para fiebre y dolores corporales.\n2. Descongestionante y antitusígeno de venta libre según necesidad.\n3. Precauciones de retorno: empeoramiento de síntomas, fiebre alta (>38.5°C), dificultad respiratoria, síntomas que persistan más de 10 días.\n4. Seguimiento según necesidad o en 7-10 días si no hay mejoría." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: tokens.primary, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: ".04em" }}>
                {s.title}
              </h4>
              <p style={{ margin: 0, color: tokens.textPrimary, whiteSpace: "pre-line" }}>{s.text}</p>
            </div>
          ))}
        </div>
      ),
      instructions: (
        <div style={{ fontSize: 15, lineHeight: 1.7 }}>
          {[
            { title: "Qué Está Pasando", text: "Tiene un resfriado común o infección de vías respiratorias superiores. Es causada por un virus y generalmente mejora por sí sola en 7 a 10 días." },
            { title: "Qué Debe Hacer", text: "• Descanse lo suficiente.\n• Tome muchos líquidos — agua, caldo o té caliente.\n• Puede tomar paracetamol o ibuprofeno para la fiebre y los dolores corporales.\n• Use un descongestionante de venta libre para la congestión.\n• Un antitusígeno puede ayudar si la tos no lo deja dormir." },
            { title: "Señales de Alarma — Llame o Regrese Si", text: "• Su fiebre sube por encima de 38.5°C.\n• Desarrolla dificultad para respirar o falta de aire.\n• Sus síntomas empeoran en lugar de mejorar después de 5 días.\n• Desarrolla dolor de cabeza severo, dolor facial o secreción nasal con color." },
            { title: "Seguimiento", text: "No necesita seguimiento a menos que sus síntomas persistan más de 10 días o experimente alguna de las señales de alarma mencionadas." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: tokens.primary, margin: "0 0 6px" }}>
                {s.title}
              </h4>
              <p style={{ margin: 0, color: tokens.textPrimary, whiteSpace: "pre-line" }}>{s.text}</p>
            </div>
          ))}
        </div>
      ),
    };

    const quickPrompts = [
      "Más corto", "Convertir a SOAP", "Traducir a inglés",
      "Quitar suposiciones", "Más formal", "Agregar plan de seguimiento",
    ];

    return (
      <div style={{
        maxWidth: isMobile ? "100%" : 900, margin: "0 auto",
        padding: isMobile ? "0 0 140px" : "24px 24px 80px",
      }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? "20px 20px 16px" : "0 0 20px",
          display: "flex", flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
          gap: 12,
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: tokens.textPrimary, margin: "0 0 6px" }}>
              Visit Documentation
            </h1>
            <StatusBadge status="ready for review" />
          </div>
          <button onClick={() => { showToast("Consulta marcada como revisada"); }} style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: tokens.success, color: "#fff", cursor: "pointer",
            fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
          }}>
            <Check size={16} /> Mark as Reviewed
          </button>
        </div>

        {/* Safety Note */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 12,
          background: tokens.warningSoft, margin: isMobile ? "0 20px 16px" : "0 0 20px",
          fontSize: 13, color: tokens.warning, fontWeight: 500,
        }}>
          <Shield size={16} /> Borrador generado por IA. Revisa y aprueba antes de usar.
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, overflowX: "auto",
          padding: isMobile ? "0 20px 16px" : "0 0 20px",
          borderBottom: `1px solid ${tokens.border}`,
        }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: "10px 16px", borderRadius: "10px 10px 0 0",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: activeTab === t.key ? tokens.primarySoft : "transparent",
              color: activeTab === t.key ? tokens.primary : tokens.textPlaceholder,
              display: "flex", alignItems: "center", gap: 6,
              whiteSpace: "nowrap", transition: "all .15s",
              borderBottom: activeTab === t.key ? `2px solid ${tokens.primary}` : "2px solid transparent",
            }}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* Document Content */}
        <div style={{
          padding: isMobile ? "20px" : "28px",
          background: tokens.surface,
          border: isMobile ? "none" : `1px solid ${tokens.border}`,
          borderRadius: isMobile ? 0 : 16,
          marginTop: isMobile ? 0 : 0,
        }}>
          {/* Actions */}
          <div style={{
            display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap",
          }}>
            {[
              { icon: Copy, label: "Copiar", action: () => showToast("Copiado al portapapeles") },
              { icon: Edit3, label: "Editar", action: () => setEditingDoc(!editingDoc) },
              { icon: RefreshCw, label: "Regenerar", action: () => showToast("Regenerando...") },
            ].map((a, i) => (
              <button key={i} onClick={a.action} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                border: `1px solid ${tokens.border}`, background: tokens.surface,
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                color: tokens.textTertiary, transition: "all .15s",
              }}>
                <a.icon size={14} /> {a.label}
              </button>
            ))}
          </div>

          {docContent[activeTab]}
        </div>

        {/* AI Command Bar */}
        <div style={{
          position: "fixed", bottom: isMobile ? 60 : 24,
          left: isMobile ? 0 : "50%",
          transform: isMobile ? "none" : "translateX(-50%)",
          width: isMobile ? "100%" : "min(680px, calc(100% - 320px))",
          padding: isMobile ? "12px 16px" : "0",
          background: isMobile ? tokens.surface : "transparent",
          borderTop: isMobile ? `1px solid ${tokens.border}` : "none",
          zIndex: 80,
        }}>
          <div style={{
            display: "flex", flexWrap: "nowrap", gap: 6,
            overflowX: "auto", paddingBottom: 8,
            WebkitOverflowScrolling: "touch",
          }}>
            {quickPrompts.map((p, i) => (
              <button key={i} onClick={() => showToast("Procesando...")} style={{
                padding: "6px 12px", borderRadius: 8, whiteSpace: "nowrap",
                border: `1px solid ${tokens.border}`, background: tokens.surface,
                cursor: "pointer", fontSize: 12, fontWeight: 500,
                color: tokens.textTertiary, flexShrink: 0,
              }}>
                {p}
              </button>
            ))}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 6px 6px 16px", borderRadius: 14,
            border: `1.5px solid ${tokens.borderStrong}`,
            background: tokens.surface,
            boxShadow: isMobile ? "none" : "0 4px 24px rgba(0,0,0,.08)",
          }}>
            <Bot size={18} color={tokens.textPlaceholder} />
            <input
              placeholder="Pide a la IA que edite o mejore este borrador..."
              style={{
                flex: 1, border: "none", outline: "none", fontSize: 14,
                color: tokens.textPrimary, background: "transparent",
              }}
            />
            <button style={{
              width: 36, height: 36, borderRadius: 10, border: "none",
              background: tokens.primary, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Visits List
  const VisitsScreen = () => (
    <div style={{
      maxWidth: 700, margin: "0 auto",
      padding: isMobile ? "28px 20px 120px" : "48px 24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: tokens.textPrimary, margin: 0 }}>Consultas</h1>
        <button onClick={() => setScreen("startVisit")} style={{
          padding: "10px 18px", borderRadius: 10, border: "none",
          background: tokens.primary, color: "#fff", cursor: "pointer",
          fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
        }}>
          <Plus size={16} /> Nueva Consulta
        </button>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", borderRadius: 12,
        border: `1.5px solid ${tokens.border}`, background: tokens.surface,
        marginBottom: 20,
      }}>
        <Search size={18} color={tokens.textPlaceholder} />
        <input
          value={visitSearch}
          onChange={(e) => setVisitSearch(e.target.value)}
          placeholder="Buscar consultas..."
          style={{
            flex: 1, border: "none", outline: "none", fontSize: 14,
            color: tokens.textPrimary, background: "transparent",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sampleVisits.map(v => (
          <VisitCard key={v.id} visit={v} onClick={() => setScreen("results")} />
        ))}
      </div>
    </div>
  );

  // Settings
  const SettingsScreen = () => (
    <div style={{
      maxWidth: 600, margin: "0 auto",
      padding: isMobile ? "28px 20px 120px" : "48px 24px",
    }}>
      <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: tokens.textPrimary, margin: "0 0 28px" }}>Ajustes</h1>

      {[
        {
          title: "Cuenta", items: [
            { label: "Nombre", value: "Dr. García" },
            { label: "Correo", value: "dr.garcia@clinic.com" },
          ]
        },
        {
          title: "Preferencias Clínicas", items: [
            { label: "Formato de nota predeterminado", value: "SOAP" },
            { label: "Idioma predeterminado", value: "Español" },
            { label: "Idioma de indicaciones", value: "Español" },
            { label: "Especialidad", value: "Internal Medicine" },
          ]
        },
        {
          title: "Seguridad", items: [
            { label: "Mostrar recordatorios de revisión", value: "Activado" },
          ]
        },
      ].map((section, si) => (
        <div key={si} style={{ marginBottom: 28 }}>
          <h3 style={{
            fontSize: 13, fontWeight: 700, color: tokens.textMuted,
            textTransform: "uppercase", letterSpacing: ".06em",
            margin: "0 0 12px", padding: "0 4px",
          }}>
            {section.title}
          </h3>
          <div style={{
            background: tokens.surface, borderRadius: 14,
            border: `1px solid ${tokens.border}`, overflow: "hidden",
          }}>
            {section.items.map((item, ii) => (
              <div key={ii} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 18px",
                borderBottom: ii < section.items.length - 1 ? `1px solid ${tokens.border}` : "none",
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: tokens.textPrimary }}>{item.label}</span>
                <span style={{ fontSize: 14, color: tokens.textTertiary }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <button style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px",
          borderRadius: 12, border: `1px solid ${tokens.border}`,
          background: tokens.surface, cursor: "pointer", width: "100%",
          fontSize: 14, fontWeight: 500, color: tokens.textTertiary, marginBottom: 10,
        }}>
          <Download size={16} /> Export data
        </button>
        <button style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px",
          borderRadius: 12, border: `1px solid ${tokens.danger}20`,
          background: tokens.dangerSoft, cursor: "pointer", width: "100%",
          fontSize: 14, fontWeight: 500, color: tokens.danger,
        }}>
          <Trash2 size={16} /> Delete account
        </button>
      </div>
    </div>
  );

  // ─── Screen Router ───
  const renderScreen = () => {
    switch (screen) {
      case "public": return <PublicWorkspace />;
      case "home": return <HomeScreen />;
      case "startVisit": return <StartVisitScreen />;
      case "record": return <RecordScreen />;
      case "upload": return <UploadScreen />;
      case "paste": return <PasteScreen />;
      case "processing": return <ProcessingScreen />;
      case "results": return <ResultsScreen />;
      case "visits": return <VisitsScreen />;
      case "settings": return <SettingsScreen />;
      default: return <PublicWorkspace />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, sans-serif; }
        body { background: ${tokens.bg}; -webkit-font-smoothing: antialiased; }
        input::placeholder, textarea::placeholder { color: ${tokens.textPlaceholder}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${tokens.borderStrong}; border-radius: 3px; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: tokens.bg }}>
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar />}

        {/* Main Content */}
        <div style={{
          flex: 1,
          marginLeft: isMobile ? 0 : sidebarWidth,
          transition: "margin-left .25s ease",
          minHeight: "100vh",
        }}>
          {isMobile && <MobileHeader />}
          {renderScreen()}
        </div>

        {/* Mobile Bottom Nav */}
        {isMobile && <MobileNav />}
      </div>

      <AuthModal />
      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
    </>
  );
}
