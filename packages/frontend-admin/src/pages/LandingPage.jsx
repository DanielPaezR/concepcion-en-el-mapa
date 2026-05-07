// pages/LandingPage.jsx (frontend-admin)
// Estética: Institucional refinado · Editorial oscuro · Autoridad pública · Elegante
// Fuentes: Syne (titulares) + DM Sans (cuerpo)

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Users, Calendar, BarChart3, MapPin, Award,
  Bell, CheckCircle, Settings, MessageSquare, Star,
  Clock, ChevronRight, Crown, ArrowRight, Lock
} from 'lucide-react';

/* ─────────────────────────────────────────────
   TOKENS DE DISEÑO
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --col-night:    #0F1117;
    --col-dark:     #161B22;
    --col-card:     #1C2230;
    --col-border:   rgba(255,255,255,0.07);
    --col-gov:      #1E5C8A;
    --col-gov-lt:   #2A7BBF;
    --col-gold:     #C89B3C;
    --col-gold-lt:  #E0B84E;
    --col-muted:    rgba(255,255,255,0.45);
    --col-text:     rgba(255,255,255,0.88);
    --col-success:  #2ECC71;
    --col-white:    #FFFFFF;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--col-night);
    color: var(--col-text);
    font-family: 'DM Sans', sans-serif;
  }

  .land-admin { min-height: 100vh; background: var(--col-night); overflow-x: hidden; }

  /* ── NAV ── */
  .adm-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 2.5rem;
    background: rgba(15, 17, 23, 0.9);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--col-border);
  }
  .adm-nav-brand {
    display: flex; align-items: center; gap: 0.75rem;
    text-decoration: none;
  }
  .adm-nav-badge {
    background: var(--col-gov); color: white;
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem;
  }
  .adm-nav-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem; font-weight: 600; color: var(--col-text);
  }
  .adm-nav-title span { color: var(--col-muted); font-weight: 400; }
  .adm-nav-cta {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: var(--col-gov); color: white;
    padding: 0.5rem 1.2rem; border-radius: 8px;
    font-size: 0.85rem; font-weight: 500;
    text-decoration: none; transition: background 0.2s;
  }
  .adm-nav-cta:hover { background: var(--col-gov-lt); }

  /* ── HERO ── */
  .adm-hero {
    min-height: 100vh; position: relative;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 8rem 2rem 5rem;
    overflow: hidden;
  }
  .adm-hero-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30, 92, 138, 0.25) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 100%, rgba(200, 155, 60, 0.12) 0%, transparent 50%),
      var(--col-night);
  }
  .adm-hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%);
  }

  .adm-hero-inner {
    position: relative; z-index: 1;
    text-align: center; max-width: 860px;
  }

  .adm-hero-tag {
    display: inline-flex; align-items: center; gap: 0.6rem;
    background: rgba(30, 92, 138, 0.2);
    border: 1px solid rgba(30, 92, 138, 0.4);
    color: #7EC8E3; font-size: 0.75rem; font-weight: 500;
    padding: 0.4rem 1rem; border-radius: 50px; margin-bottom: 2rem;
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .adm-hero-tag-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #7EC8E3;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .adm-hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.8rem, 6.5vw, 5.5rem);
    font-weight: 800; line-height: 1.05; color: var(--col-white);
    margin-bottom: 0.3rem; letter-spacing: -0.02em;
  }
  .adm-hero-title-accent {
    background: linear-gradient(90deg, var(--col-gov-lt), var(--col-gold-lt));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
  }
  .adm-hero-sub {
    font-size: 1.1rem; color: var(--col-muted);
    line-height: 1.7; max-width: 540px; margin: 1.2rem auto 2.5rem;
    font-weight: 300;
  }
  .adm-hero-actions {
    display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
  }
  .adm-btn-primary {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--col-gov); color: white;
    padding: 0.85rem 2rem; border-radius: 10px;
    font-size: 1rem; font-weight: 600;
    text-decoration: none; transition: all 0.25s;
    box-shadow: 0 0 24px rgba(30, 92, 138, 0.4);
  }
  .adm-btn-primary:hover {
    background: var(--col-gov-lt);
    box-shadow: 0 0 36px rgba(30, 92, 138, 0.6);
    transform: translateY(-2px);
  }
  .adm-btn-ghost {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: transparent; color: var(--col-muted);
    padding: 0.85rem 2rem; border-radius: 10px;
    font-size: 1rem; font-weight: 400;
    text-decoration: none;
    border: 1px solid var(--col-border);
    transition: all 0.25s;
  }
  .adm-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: var(--col-text); }

  /* ── LAYOUT HELPERS ── */
  .adm-section { padding: 6rem 2rem; }
  .adm-section-alt { padding: 6rem 2rem; background: var(--col-dark); }
  .adm-container { max-width: 1180px; margin: 0 auto; }

  .adm-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.14em; color: #7EC8E3; margin-bottom: 0.8rem;
  }
  .adm-eyebrow-line { width: 24px; height: 1px; background: #7EC8E3; }
  .adm-eyebrow-gold { color: var(--col-gold-lt); }
  .adm-eyebrow-line-gold { background: var(--col-gold-lt); }

  .adm-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.9rem, 3.5vw, 2.8rem); font-weight: 700;
    color: var(--col-white); line-height: 1.15; max-width: 600px;
    letter-spacing: -0.015em;
  }
  .adm-title em {
    font-style: normal;
    background: linear-gradient(90deg, var(--col-gov-lt), #7EC8E3);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .adm-title-gold em {
    background: linear-gradient(90deg, var(--col-gold), var(--col-gold-lt));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .adm-desc {
    font-size: 1rem; color: var(--col-muted); line-height: 1.7;
    max-width: 500px; margin-top: 0.8rem; font-weight: 300;
  }

  /* ── ROL CARDS ── */
  .roles-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 1.5rem; margin-top: 3.5rem;
  }
  @media (max-width: 768px) { .roles-grid { grid-template-columns: 1fr; } }

  .role-card {
    background: var(--col-card); border-radius: 20px;
    border: 1px solid var(--col-border);
    padding: 2.5rem; transition: all 0.3s; position: relative; overflow: hidden;
  }
  .role-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    transition: opacity 0.3s;
  }
  .role-card-admin::before { background: linear-gradient(90deg, var(--col-gold), var(--col-gov)); }
  .role-card-guide::before { background: linear-gradient(90deg, #2ECC71, #1AA068); }
  .role-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-4px); }

  .role-icon {
    width: 60px; height: 60px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.5rem;
  }
  .role-icon-admin { background: rgba(200, 155, 60, 0.12); color: var(--col-gold-lt); }
  .role-icon-guide { background: rgba(46, 204, 113, 0.12); color: #2ECC71; }

  .role-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.35rem; font-weight: 700; color: var(--col-white);
    margin-bottom: 0.5rem;
  }
  .role-desc { font-size: 0.9rem; color: var(--col-muted); line-height: 1.6; margin-bottom: 1.8rem; }

  .role-features { display: flex; flex-direction: column; gap: 0.55rem; }
  .role-feature {
    display: flex; align-items: flex-start; gap: 0.6rem;
    font-size: 0.87rem; color: rgba(255,255,255,0.65);
  }
  .role-feature-dot {
    width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px; font-size: 0.55rem;
  }
  .role-feature-dot-admin { background: rgba(200, 155, 60, 0.15); color: var(--col-gold-lt); }
  .role-feature-dot-guide { background: rgba(46, 204, 113, 0.12); color: #2ECC71; }

  /* ── FEATURES GRID ── */
  .adm-features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: var(--col-border); border-radius: 20px;
    overflow: hidden; margin-top: 3.5rem;
    border: 1px solid var(--col-border);
  }
  @media (max-width: 900px) { .adm-features-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) { .adm-features-grid { grid-template-columns: 1fr; } }

  .adm-feature-cell {
    background: var(--col-card); padding: 2rem;
    transition: background 0.25s; cursor: default;
  }
  .adm-feature-cell:hover { background: rgba(30, 92, 138, 0.12); }

  .adm-feature-num {
    font-family: 'Syne', sans-serif;
    font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.2);
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.2rem;
  }
  .adm-feature-icon {
    color: var(--col-gov-lt); margin-bottom: 0.8rem;
  }
  .adm-feature-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 600; color: var(--col-white);
    margin-bottom: 0.4rem;
  }
  .adm-feature-desc { font-size: 0.85rem; color: var(--col-muted); line-height: 1.6; }

  /* ── GUIDE FEATURES ── */
  .guide-features-row {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem; margin-top: 3rem;
  }
  @media (max-width: 900px) { .guide-features-row { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 500px) { .guide-features-row { grid-template-columns: 1fr; } }

  .guide-feature-card {
    padding: 1.8rem; border-radius: 16px;
    background: var(--col-card); border: 1px solid var(--col-border);
    transition: border-color 0.25s;
  }
  .guide-feature-card:hover { border-color: rgba(46, 204, 113, 0.25); }

  .guide-feature-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(46, 204, 113, 0.1); color: #2ECC71;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1rem;
  }
  .guide-feature-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem; font-weight: 600; color: var(--col-white); margin-bottom: 0.4rem;
  }
  .guide-feature-desc { font-size: 0.83rem; color: var(--col-muted); line-height: 1.55; }

  /* ── CREDENCIALES ── */
  .creds-section { padding: 4rem 2rem; }
  .creds-container { max-width: 760px; margin: 0 auto; }
  .creds-card {
    background: var(--col-card); border-radius: 20px;
    border: 1px solid rgba(200, 155, 60, 0.2);
    padding: 2.5rem;
  }
  .creds-header {
    display: flex; align-items: center; gap: 0.75rem;
    margin-bottom: 1.8rem;
  }
  .creds-header-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: rgba(200, 155, 60, 0.12); color: var(--col-gold-lt);
    display: flex; align-items: center; justify-content: center;
  }
  .creds-header-text {
    font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 600; color: var(--col-white);
  }
  .creds-header-sub { font-size: 0.8rem; color: var(--col-muted); }
  .creds-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 540px) { .creds-grid { grid-template-columns: 1fr; } }

  .cred-item {
    background: rgba(255,255,255,0.03); border-radius: 12px;
    padding: 1.2rem 1.5rem; border: 1px solid var(--col-border);
  }
  .cred-role {
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; margin-bottom: 0.75rem;
  }
  .cred-role-admin { color: var(--col-gold-lt); }
  .cred-role-guide { color: #2ECC71; }
  .cred-field { display: flex; flex-direction: column; gap: 0.35rem; }
  .cred-label { font-size: 0.7rem; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.1em; }
  .cred-value { font-size: 0.88rem; color: rgba(255,255,255,0.75); font-family: 'DM Mono', monospace; }

  /* ── CTA ── */
  .adm-cta-section { padding: 5rem 2rem 7rem; }
  .adm-cta-card {
    background: var(--col-card);
    border: 1px solid rgba(30, 92, 138, 0.3);
    border-radius: 24px; padding: 5rem 3rem;
    text-align: center; position: relative; overflow: hidden;
    max-width: 780px; margin: 0 auto;
  }
  .adm-cta-glow {
    position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
    width: 400px; height: 300px;
    background: radial-gradient(ellipse, rgba(30, 92, 138, 0.35) 0%, transparent 70%);
    pointer-events: none;
  }
  .adm-cta-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    font-weight: 700; color: var(--col-white);
    position: relative; z-index: 1; margin-bottom: 0.8rem;
  }
  .adm-cta-desc {
    font-size: 1rem; color: var(--col-muted);
    max-width: 420px; margin: 0 auto 2.2rem; line-height: 1.7; font-weight: 300;
    position: relative; z-index: 1;
  }

  /* ── FOOTER ── */
  .adm-footer {
    background: var(--col-dark);
    border-top: 1px solid var(--col-border);
    padding: 2rem; text-align: center;
  }
  .adm-footer-brand {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem; color: rgba(255,255,255,0.5); margin-bottom: 0.3rem;
  }
  .adm-footer-copy { font-size: 0.78rem; color: rgba(255,255,255,0.2); }
  .adm-footer-divider {
    width: 40px; height: 1px; background: var(--col-border); margin: 0.8rem auto;
  }
  .adm-footer-gov {
    font-size: 0.7rem; color: rgba(255,255,255,0.15);
    text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.4rem;
  }

  /* ── RESPONSIVE NAV ── */
  @media (max-width: 600px) {
    .adm-nav { padding: 1rem 1.2rem; }
    .adm-cta-card { padding: 3rem 1.5rem; }
  }
`;

const adminFeatures = [
  { icon: <MapPin size={22} />, title: 'Gestión de Lugares', desc: 'CRUD completo de puntos turísticos con mapa interactivo y categorización.' },
  { icon: <Calendar size={22} />, title: 'Eventos y Retos', desc: 'Crea eventos diarios, preguntas, pistas y retos con XP configurable.' },
  { icon: <BarChart3 size={22} />, title: 'Dashboard de Métricas', desc: 'Estadísticas en tiempo real: visitantes, lugares más populares y tendencias.' },
  { icon: <Users size={22} />, title: 'Gestión de Guías', desc: 'Administra perfiles, calificaciones y disponibilidad de guías turísticos.' },
  { icon: <Bell size={22} />, title: 'Notificaciones', desc: 'Envía alertas y novedades segmentadas a los turistas registrados.' },
  { icon: <Award size={22} />, title: 'Insignias y Logros', desc: 'Configura las insignias, requisitos y recompensas del sistema gamificado.' }
];

const guideFeatures = [
  { icon: <CheckCircle size={20} />, title: 'Gestión de Reservas', desc: 'Visualiza y administra solicitudes de guianza asignadas a tu perfil.' },
  { icon: <Clock size={20} />, title: 'Disponibilidad', desc: 'Activa o desactiva tu disponibilidad en tiempo real para recibir solicitudes.' },
  { icon: <Star size={20} />, title: 'Calificaciones', desc: 'Consulta valoraciones y comentarios de los turistas que has acompañado.' },
  { icon: <MessageSquare size={20} />, title: 'Comunicación', desc: 'Notificaciones instantáneas cuando un turista solicita tus servicios.' }
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

export default function LandingPage() {
  return (
    <>
      <style>{CSS}</style>
      <div className="land-admin">

        {/* ── NAV ── */}
        <nav className="adm-nav">
          <Link to="/" className="adm-nav-brand">
            <div className="adm-nav-badge">⚙</div>
            <div>
              <div className="adm-nav-title">
                Concepción en el Mapa <span>· Admin</span>
              </div>
            </div>
          </Link>
          <Link to="/login" className="adm-nav-cta">
            <Lock size={14} /> Acceder
          </Link>
        </nav>

        {/* ── HERO ── */}
        <section className="adm-hero">
          <div className="adm-hero-bg" />
          <div className="adm-hero-grid" />

          <motion.div
            className="adm-hero-inner"
            initial="hidden" animate="show" variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <span className="adm-hero-tag">
                <span className="adm-hero-tag-dot" />
                Plataforma administrativa · Concepción, Antioquia
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="adm-hero-title">
              Panel de Control
              <span className="adm-hero-title-accent">Turístico Municipal</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="adm-hero-sub">
              Herramienta de gestión para administradores y guías turísticos del 
              municipio de Concepción. Gestiona lugares, eventos, usuarios y métricas 
              desde un solo lugar.
            </motion.p>

            <motion.div variants={fadeUp} className="adm-hero-actions">
              <Link to="/login" className="adm-btn-primary">
                Acceder al panel <ArrowRight size={17} />
              </Link>
              <a href="#perfiles" className="adm-btn-ghost">
                Ver perfiles de acceso
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ── PERFILES DE ACCESO ── */}
        <section id="perfiles" className="adm-section">
          <div className="adm-container">
            <motion.div initial="hidden" whileInView="show" variants={stagger} viewport={{ once: true }}>
              <motion.div variants={fadeUp}>
                <span className="adm-eyebrow adm-eyebrow-gold">
                  <span className="adm-eyebrow-line adm-eyebrow-line-gold" />
                  Perfiles de acceso
                </span>
                <h2 className="adm-title adm-title-gold">
                  Dos roles, un solo <em>ecosistema</em>
                </h2>
                <p className="adm-desc">
                  La plataforma cuenta con perfiles diferenciados según las responsabilidades 
                  de cada usuario dentro del ecosistema turístico de Concepción.
                </p>
              </motion.div>

              <div className="roles-grid">
                {/* Admin Card */}
                <motion.div variants={fadeUp} className="role-card role-card-admin">
                  <div className="role-icon role-icon-admin">
                    <Crown size={26} />
                  </div>
                  <div className="role-name">Administrador</div>
                  <div className="role-desc">
                    Control total sobre la plataforma turística. Gestión de lugares, 
                    eventos, usuarios y métricas en tiempo real.
                  </div>
                  <div className="role-features">
                    {[
                      'CRUD completo de lugares turísticos',
                      'Creación de eventos y retos diarios',
                      'Dashboard con métricas en tiempo real',
                      'Gestión de guías y calificaciones',
                      'Configuración de insignias y logros',
                      'Reportes exportables (PDF / Excel)'
                    ].map((f, i) => (
                      <div key={i} className="role-feature">
                        <span className="role-feature-dot role-feature-dot-admin">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Guide Card */}
                <motion.div variants={fadeUp} className="role-card role-card-guide">
                  <div className="role-icon role-icon-guide">
                    <Shield size={26} />
                  </div>
                  <div className="role-name">Guía Turístico</div>
                  <div className="role-desc">
                    Herramientas para acompañar a los turistas, gestionar reservas 
                    y controlar la disponibilidad en tiempo real.
                  </div>
                  <div className="role-features">
                    {[
                      'Ver reservas asignadas (hoy / próximas)',
                      'Confirmar o cancelar solicitudes',
                      'Activar disponibilidad en tiempo real',
                      'Consultar calificaciones recibidas',
                      'Notificaciones de nuevas solicitudes',
                      'Historial de recorridos realizados'
                    ].map((f, i) => (
                      <div key={i} className="role-feature">
                        <span className="role-feature-dot role-feature-dot-guide">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── ADMIN FEATURES ── */}
        <section className="adm-section-alt">
          <div className="adm-container">
            <motion.div initial="hidden" whileInView="show" variants={stagger} viewport={{ once: true }}>
              <motion.div variants={fadeUp}>
                <span className="adm-eyebrow">
                  <span className="adm-eyebrow-line" />
                  Módulos del administrador
                </span>
                <h2 className="adm-title">
                  Gestión completa de la <em>plataforma turística</em>
                </h2>
                <p className="adm-desc">
                  Todas las herramientas que necesita la Alcaldía para operar y 
                  hacer crecer la experiencia turística del municipio.
                </p>
              </motion.div>

              <div className="adm-features-grid">
                {adminFeatures.map((f, i) => (
                  <motion.div key={i} variants={fadeUp} className="adm-feature-cell">
                    <div className="adm-feature-num">0{i + 1}</div>
                    <div className="adm-feature-icon">{f.icon}</div>
                    <div className="adm-feature-title">{f.title}</div>
                    <div className="adm-feature-desc">{f.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── GUIDE FEATURES ── */}
        <section className="adm-section">
          <div className="adm-container">
            <motion.div initial="hidden" whileInView="show" variants={stagger} viewport={{ once: true }}>
              <motion.div variants={fadeUp}>
                <span className="adm-eyebrow" style={{ color: '#2ECC71' }}>
                  <span className="adm-eyebrow-line" style={{ background: '#2ECC71' }} />
                  Módulos del guía
                </span>
                <h2 className="adm-title">
                  Diseñado para el <em style={{
                    background: 'linear-gradient(90deg, #2ECC71, #1AA068)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                  }}>mejor servicio</em>
                </h2>
                <p className="adm-desc">
                  Herramientas pensadas para que los guías brinden una experiencia 
                  memorable a cada turista que visita Concepción.
                </p>
              </motion.div>

              <div className="guide-features-row">
                {guideFeatures.map((f, i) => (
                  <motion.div key={i} variants={fadeUp} className="guide-feature-card">
                    <div className="guide-feature-icon">{f.icon}</div>
                    <div className="guide-feature-title">{f.title}</div>
                    <div className="guide-feature-desc">{f.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CREDENCIALES DE PRUEBA ── */}
        <section className="creds-section">
          <div className="creds-container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="creds-card"
            >
              <div className="creds-header">
                <div className="creds-header-icon"><Lock size={18} /></div>
                <div>
                  <div className="creds-header-text">Credenciales de acceso demo</div>
                  <div className="creds-header-sub">Solo para entorno de desarrollo</div>
                </div>
              </div>
              <div className="creds-grid">
                <div className="cred-item">
                  <div className="cred-role cred-role-admin">👑 Administrador</div>
                  <div className="cred-field">
                    <div>
                      <div className="cred-label">Email</div>
                      <div className="cred-value">admin@concepcion.cl</div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <div className="cred-label">Contraseña</div>
                      <div className="cred-value">admin123</div>
                    </div>
                  </div>
                </div>
                <div className="cred-item">
                  <div className="cred-role cred-role-guide">🛡️ Guía Turístico</div>
                  <div className="cred-field">
                    <div>
                      <div className="cred-label">Email</div>
                      <div className="cred-value">guia1@concepcion.cl</div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <div className="cred-label">Contraseña</div>
                      <div className="cred-value">admin123</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="adm-cta-section">
          <div className="adm-container">
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="adm-cta-card">
                <div className="adm-cta-glow" />
                <span className="adm-eyebrow" style={{ justifyContent: 'center', display: 'inline-flex', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                  <span className="adm-eyebrow-line" /> Acceso al sistema <span className="adm-eyebrow-line" />
                </span>
                <h2 className="adm-cta-title">¿Ya tienes una cuenta?</h2>
                <p className="adm-cta-desc">
                  Accede al panel de control para gestionar la plataforma turística 
                  de Concepción, Antioquia.
                </p>
                <Link to="/login" className="adm-btn-primary" style={{ position: 'relative', zIndex: 1 }}>
                  Iniciar sesión <ArrowRight size={17} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="adm-footer">
          <div className="adm-footer-brand">Concepción en el Mapa · Panel de Administración</div>
          <div className="adm-footer-divider" />
          <div className="adm-footer-copy">© 2026 · Municipio de Concepción, Antioquia · Colombia</div>
          <div className="adm-footer-gov">Alcaldía de Concepción · Plataforma de Gestión Turística</div>
        </footer>

      </div>
    </>
  );
}