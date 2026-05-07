// pages/LandingPage.jsx (frontend-turista)
// Estética: Natural/orgánico · Tierra colombiana · Selva antioqueña · Magazine editorial
// Fuentes: Playfair Display (titulares) + DM Sans (cuerpo)

import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Map, Shield, Camera, Trophy, Star, Zap,
  Users, Calendar, ChevronRight, Compass,
  Award, Sparkles, Heart, Crown, ArrowDown,
  MapPin, Mountain, TreePine
} from 'lucide-react';

/* ─────────────────────────────────────────────
   TOKENS DE DISEÑO
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --col-tierra:   #7C5C3A;
    --col-selva:    #2D5A27;
    --col-musgo:    #4A7C59;
    --col-miel:     #C8893A;
    --col-arena:    #F5EDD8;
    --col-noche:    #1A1F14;
    --col-niebla:   #E8F0E4;
    --col-blanco:   #FDFAF4;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--col-blanco);
    color: var(--col-noche);
    font-family: 'DM Sans', sans-serif;
  }

  .land-turista {
    min-height: 100vh;
    background: var(--col-blanco);
    overflow-x: hidden;
  }

  /* ── Navbar ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.2rem 2.5rem;
    backdrop-filter: blur(16px);
    background: rgba(253, 250, 244, 0.85);
    border-bottom: 1px solid rgba(124, 92, 58, 0.12);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 0.6rem;
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 600;
    color: var(--col-selva); text-decoration: none;
  }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--col-miel); }
  .nav-cta {
    background: var(--col-selva); color: white;
    padding: 0.55rem 1.4rem; border-radius: 50px;
    font-size: 0.875rem; font-weight: 500;
    text-decoration: none; transition: background 0.2s;
  }
  .nav-cta:hover { background: var(--col-musgo); }

  /* ── Hero ── */
  .hero {
    position: relative; min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 7rem 2rem 5rem;
    background: linear-gradient(160deg, #1A2A14 0%, #2D5A27 45%, #3D7A4A 100%);
    overflow: hidden;
  }
  .hero-grain {
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E");
    opacity: 0.5; pointer-events: none;
  }
  .hero-circles {
    position: absolute; inset: 0; pointer-events: none;
  }
  .hero-circle {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .hero-circle-1 { width: 600px; height: 600px; top: -150px; right: -150px; }
  .hero-circle-2 { width: 400px; height: 400px; bottom: -100px; left: -100px; }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.15);
    color: #B8D4B0; font-size: 0.8rem; font-weight: 500;
    padding: 0.4rem 1rem; border-radius: 50px; margin-bottom: 1.8rem;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--col-miel); }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(3rem, 7vw, 6rem);
    font-weight: 800; line-height: 1.05;
    color: white; text-align: center;
    max-width: 900px; margin-bottom: 0.5rem;
  }
  .hero-title-em {
    font-style: italic; color: #A8D5A2;
    display: block;
  }
  .hero-sub {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: rgba(255,255,255,0.65);
    text-align: center; max-width: 560px;
    line-height: 1.7; margin: 1.2rem 0 2.5rem;
    font-weight: 300;
  }
  .hero-actions {
    display: flex; gap: 1rem; flex-wrap: wrap;
    justify-content: center; margin-bottom: 4rem;
  }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--col-miel); color: white;
    padding: 0.85rem 2rem; border-radius: 50px;
    font-size: 1rem; font-weight: 600;
    text-decoration: none; transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(200, 137, 58, 0.4);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(200, 137, 58, 0.5); }
  .btn-ghost {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: transparent; color: rgba(255,255,255,0.75);
    padding: 0.85rem 2rem; border-radius: 50px;
    font-size: 1rem; font-weight: 400;
    text-decoration: none; border: 1px solid rgba(255,255,255,0.2);
    transition: all 0.25s;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.08); color: white; }

  .hero-stats {
    display: flex; gap: 2.5rem; flex-wrap: wrap;
    justify-content: center;
  }
  .hero-stat {
    text-align: center;
  }
  .hero-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem; font-weight: 700; color: #A8D5A2;
    line-height: 1;
  }
  .hero-stat-label {
    font-size: 0.78rem; color: rgba(255,255,255,0.45);
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-top: 0.25rem;
  }

  .hero-scroll {
    position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
    color: rgba(255,255,255,0.35); font-size: 0.7rem;
    letter-spacing: 0.15em; text-transform: uppercase;
    animation: bounce 2s ease-in-out infinite;
  }
  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(6px); }
  }

  /* ── Separador orgánico ── */
  .wave-divider svg { display: block; }

  /* ── Sección Features ── */
  .section { padding: 6rem 2rem; }
  .section-sm { padding: 4rem 2rem; }
  .container { max-width: 1180px; margin: 0 auto; }

  .section-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.14em; color: var(--col-musgo);
    margin-bottom: 0.8rem;
  }
  .section-eyebrow-line {
    width: 28px; height: 1px; background: var(--col-musgo);
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3rem); font-weight: 700;
    color: var(--col-noche); line-height: 1.15;
    max-width: 640px;
  }
  .section-title em { font-style: italic; color: var(--col-musgo); }
  .section-desc {
    font-size: 1.05rem; color: #5A6354; line-height: 1.7;
    max-width: 520px; margin-top: 0.8rem; font-weight: 300;
  }

  /* ── Features Grid ── */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem; margin-top: 3.5rem;
  }
  .feature-card {
    background: white; border-radius: 20px; padding: 2rem;
    border: 1px solid rgba(74, 124, 89, 0.1);
    transition: all 0.3s; cursor: default;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; background: linear-gradient(90deg, var(--col-selva), var(--col-miel));
    transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(45, 90, 39, 0.1); border-color: rgba(74, 124, 89, 0.2); }
  .feature-card:hover::before { transform: scaleX(1); }

  .feature-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--col-niebla); color: var(--col-musgo);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.2rem;
  }
  .feature-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem; font-weight: 600; color: var(--col-noche);
    margin-bottom: 0.5rem;
  }
  .feature-desc { font-size: 0.9rem; color: #6B7566; line-height: 1.6; }

  /* ── Niveles Horizontal Timeline ── */
  .levels-section {
    background: var(--col-noche);
    padding: 6rem 2rem; position: relative; overflow: hidden;
  }
  .levels-section::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 20% 50%, rgba(45, 90, 39, 0.3) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 50%, rgba(200, 137, 58, 0.15) 0%, transparent 60%);
  }
  .levels-section .container { position: relative; z-index: 1; }
  .levels-section .section-title { color: white; }
  .levels-section .section-desc { color: rgba(255,255,255,0.5); }
  .levels-section .section-eyebrow { color: #A8D5A2; }
  .levels-section .section-eyebrow-line { background: #A8D5A2; }

  .levels-track {
    position: relative; margin-top: 3.5rem;
    display: flex; gap: 0; overflow-x: auto; padding-bottom: 1rem;
  }
  .levels-track::-webkit-scrollbar { height: 4px; }
  .levels-track::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 2px; }
  .levels-track::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

  .level-item {
    flex: 1; min-width: 180px; position: relative;
    padding: 0 1rem; text-align: center;
  }
  .level-item::before {
    content: ''; position: absolute; top: 28px; left: 50%; right: -50%;
    height: 2px; background: rgba(255,255,255,0.1);
  }
  .level-item:last-child::before { display: none; }

  .level-node {
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem; font-size: 1.6rem;
    position: relative; z-index: 1;
    transition: transform 0.3s;
  }
  .level-item:hover .level-node { transform: scale(1.15); }

  .level-name {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem; font-weight: 600; color: white; margin-bottom: 0.3rem;
  }
  .level-desc { font-size: 0.75rem; color: rgba(255,255,255,0.4); line-height: 1.4; }
  .level-num {
    display: inline-block; margin-top: 0.5rem;
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; opacity: 0.5; color: white;
  }

  /* ── Insignias ── */
  .badges-section {
    background: var(--col-arena); padding: 6rem 2rem;
  }
  .badges-grid {
    display: flex; flex-wrap: wrap; gap: 1rem;
    margin-top: 3rem; justify-content: center;
  }
  .badge-pill {
    display: flex; align-items: center; gap: 0.65rem;
    background: white; border-radius: 50px;
    padding: 0.65rem 1.2rem;
    border: 1px solid rgba(124, 92, 58, 0.12);
    transition: all 0.25s; cursor: default;
  }
  .badge-pill:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(124, 92, 58, 0.15);
    border-color: var(--col-tierra);
  }
  .badge-emoji { font-size: 1.4rem; }
  .badge-info {}
  .badge-name { font-size: 0.9rem; font-weight: 600; color: var(--col-noche); }
  .badge-req { font-size: 0.75rem; color: #8A7A6A; }

  /* ── CTA Final ── */
  .cta-section { padding: 6rem 2rem; }
  .cta-card {
    background: linear-gradient(135deg, var(--col-selva) 0%, #1A3A17 100%);
    border-radius: 28px; padding: 5rem 3rem;
    text-align: center; position: relative; overflow: hidden;
  }
  .cta-card::before {
    content: ''; position: absolute;
    width: 500px; height: 500px; border-radius: 50%;
    background: rgba(200, 137, 58, 0.1);
    top: -200px; right: -150px; pointer-events: none;
  }
  .cta-card::after {
    content: ''; position: absolute;
    width: 300px; height: 300px; border-radius: 50%;
    background: rgba(255,255,255,0.03);
    bottom: -100px; left: -80px; pointer-events: none;
  }
  .cta-eyebrow { color: #A8D5A2; }
  .cta-eyebrow-line { background: #A8D5A2; }
  .cta-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 700;
    color: white; max-width: 600px; margin: 0.5rem auto 1rem;
    position: relative; z-index: 1;
  }
  .cta-desc {
    color: rgba(255,255,255,0.55); max-width: 480px;
    margin: 0 auto 2.5rem; line-height: 1.7; font-weight: 300;
    position: relative; z-index: 1;
  }

  /* ── Footer ── */
  .footer {
    background: var(--col-noche); color: rgba(255,255,255,0.4);
    padding: 2.5rem 2rem; text-align: center;
    font-size: 0.82rem; line-height: 1.8;
  }
  .footer-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1rem; color: rgba(255,255,255,0.65);
    margin-bottom: 0.4rem;
  }
  .footer-divider {
    width: 40px; height: 1px; background: rgba(255,255,255,0.1);
    margin: 0.8rem auto;
  }
  .footer-alcaldia {
    font-size: 0.75rem; color: rgba(255,255,255,0.25);
    text-transform: uppercase; letter-spacing: 0.1em;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .nav { padding: 1rem 1.5rem; }
    .hero-stats { gap: 1.5rem; }
    .features-grid { grid-template-columns: 1fr; }
    .cta-card { padding: 3rem 1.5rem; }
  }
`;

const features = [
  { icon: <Map size={22} />, title: 'Mapa Interactivo', description: 'Explora los puntos turísticos de Concepción con marcadores personalizados y descubre qué hay cerca de ti.' },
  { icon: <Compass size={22} />, title: 'Descubrimiento Automático', description: 'Acércate a un lugar y desbloquéalo automáticamente. Cada visita te acerca más a nuevos niveles.' },
  { icon: <Shield size={22} />, title: 'Guardianes del Mapa', description: 'Ancla un guardián en tus lugares favoritos para protegerlos y reclamarlos como propios.' },
  { icon: <Camera size={22} />, title: 'Galería de Recuerdos', description: 'Sube fotos, acumula insignias y comparte tus momentos más memorables del municipio.' },
  { icon: <Calendar size={22} />, title: 'Eventos y Retos Diarios', description: 'Misiones, preguntas y retos especiales cada día que te dan XP extra y recompensas únicas.' },
  { icon: <Trophy size={22} />, title: 'Sistema de Logros', description: 'Más de 20 insignias por descubrir, explorar, participar y convertirte en una leyenda local.' }
];

const levels = [
  { nivel: 1, emoji: '🌱', nombre: 'Principiante', desc: 'Primeros pasos en Concepción', color: '#4A7C59', bg: 'rgba(74, 124, 89, 0.2)' },
  { nivel: 2, emoji: '⭐', nombre: 'Explorador', desc: 'Ya conoces los primeros lugares', color: '#3B7FC4', bg: 'rgba(59, 127, 196, 0.2)' },
  { nivel: 3, emoji: '⚡', nombre: 'Aventurero', desc: 'Viajero experimentado', color: '#6B4FBB', bg: 'rgba(107, 79, 187, 0.2)' },
  { nivel: 4, emoji: '🛡️', nombre: 'Guardián', desc: 'Proteges los tesoros del pueblo', color: '#C8893A', bg: 'rgba(200, 137, 58, 0.2)' },
  { nivel: 5, emoji: '👑', nombre: 'Leyenda', desc: 'Has conquistado Concepción', color: '#C84A3A', bg: 'rgba(200, 74, 58, 0.2)' }
];

const badges = [
  { emoji: '🗺️', name: 'Curioso Viajero', req: 'Descubre 5 lugares' },
  { emoji: '📷', name: 'Fotógrafo', req: 'Sube 3 fotos' },
  { emoji: '🎯', name: 'Primer Evento', req: 'Completa un evento' },
  { emoji: '🛡️', name: 'Primer Guardián', req: 'Ancla tu primer guardián' },
  { emoji: '⭐', name: 'Explorador Estrella', req: 'Alcanza nivel 5' },
  { emoji: '👑', name: 'Leyenda', req: 'Alcanza nivel 20' },
  { emoji: '🏔️', name: 'Montañero', req: 'Visita 3 lugares naturales' },
  { emoji: '🌿', name: 'Amigo del Medio Ambiente', req: 'Completa 5 retos eco' },
  { emoji: '🎖️', name: 'Veterano', req: 'Regresa 10 días seguidos' }
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

export default function LandingPage() {
  return (
    <>
      <style>{CSS}</style>
      <div className="land-turista">

        {/* ── NAV ── */}
        <nav className="nav">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-dot" />
            Concepción en el Mapa
          </Link>
          <Link to="/mapa" className="nav-cta">Comenzar aventura →</Link>
        </nav>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-grain" />
          <div className="hero-circles">
            <div className="hero-circle hero-circle-1" />
            <div className="hero-circle hero-circle-2" />
          </div>

          <motion.div
            initial="hidden" animate="show" variants={stagger}
            style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
          >
            <motion.div variants={fadeUp}>
              <span className="hero-badge">
                <span className="hero-badge-dot" />
                Municipio de Concepción · Antioquia · Colombia
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="hero-title">
              Descubre cada rincón
              <em className="hero-title-em">del corazón de Antioquia</em>
            </motion.h1>

            <motion.p variants={fadeUp} className="hero-sub">
              Una experiencia turística gamificada que te invita a explorar, 
              coleccionar recuerdos y convertirte en parte de la historia de Concepción.
            </motion.p>

            <motion.div variants={fadeUp} className="hero-actions">
              <Link to="/mapa" className="btn-primary">
                Comenzar aventura <ChevronRight size={18} />
              </Link>
              <a href="#como-funciona" className="btn-ghost">
                ¿Cómo funciona?
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="hero-stats">
              {[
                { num: '8+', label: 'Lugares turísticos' },
                { num: '20+', label: 'Insignias' },
                { num: '5', label: 'Niveles' },
                { num: '4', label: 'Tipos de eventos' }
              ].map((s, i) => (
                <div key={i} className="hero-stat">
                  <div className="hero-stat-num">{s.num}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className="hero-scroll">
            <ArrowDown size={14} />
            explorar
          </div>
        </section>

        {/* ── WAVE ── */}
        <div style={{ background: '#1A1F14', marginBottom: '-2px' }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M0 80 C360 0 1080 0 1440 80 L1440 80 L0 80Z" fill="#FDFAF4" />
          </svg>
        </div>

        {/* ── FEATURES ── */}
        <section id="como-funciona" className="section">
          <div className="container">
            <motion.div
              initial="hidden" whileInView="show" variants={stagger} viewport={{ once: true }}
            >
              <motion.div variants={fadeUp}>
                <span className="section-eyebrow">
                  <span className="section-eyebrow-line" />
                  Funcionalidades
                </span>
                <h2 className="section-title">
                  Todo lo que necesitas para <em>explorar Concepción</em>
                </h2>
                <p className="section-desc">
                  Tecnología y gamificación al servicio del turismo local. Cada visita, 
                  un logro. Cada lugar, una historia.
                </p>
              </motion.div>

              <div className="features-grid">
                {features.map((f, i) => (
                  <motion.div key={i} variants={fadeUp} className="feature-card">
                    <div className="feature-icon">{f.icon}</div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.description}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── NIVELES ── */}
        <section className="levels-section">
          <div className="container">
            <motion.div initial="hidden" whileInView="show" variants={stagger} viewport={{ once: true }}>
              <motion.div variants={fadeUp}>
                <span className="section-eyebrow cta-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#A8D5A2', marginBottom: '0.8rem' }}>
                  <span style={{ width: 28, height: 1, background: '#A8D5A2', display: 'inline-block' }} />
                  Progresión
                </span>
                <h2 className="section-title" style={{ color: 'white' }}>
                  Cada lugar te acerca a la <em style={{ color: '#A8D5A2' }}>leyenda</em>
                </h2>
                <p className="section-desc" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Sube de nivel descubriendo lugares, completando eventos y protegiendo el patrimonio del municipio.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="levels-track">
                {levels.map((lv, i) => (
                  <div key={i} className="level-item">
                    <div
                      className="level-node"
                      style={{ background: lv.bg, border: `2px solid ${lv.color}` }}
                    >
                      {lv.emoji}
                    </div>
                    <div className="level-name">{lv.nombre}</div>
                    <div className="level-desc">{lv.desc}</div>
                    <span className="level-num">Niv. {lv.nivel}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── INSIGNIAS ── */}
        <section className="badges-section">
          <div className="container">
            <motion.div initial="hidden" whileInView="show" variants={stagger} viewport={{ once: true }}>
              <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <span className="section-eyebrow" style={{ justifyContent: 'center' }}>
                  <span className="section-eyebrow-line" />
                  Logros
                  <span className="section-eyebrow-line" />
                </span>
                <h2 className="section-title" style={{ textAlign: 'center', margin: '0 auto' }}>
                  Insignias que <em>cuentan tu historia</em>
                </h2>
                <p className="section-desc" style={{ textAlign: 'center', margin: '0.8rem auto 0' }}>
                  Cada reto completado, cada lugar visitado y cada evento ganado deja una huella en tu perfil.
                </p>
              </motion.div>

              <div className="badges-grid">
                {badges.map((b, i) => (
                  <motion.div key={i} variants={fadeUp} className="badge-pill">
                    <span className="badge-emoji">{b.emoji}</span>
                    <div className="badge-info">
                      <div className="badge-name">{b.name}</div>
                      <div className="badge-req">{b.req}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="cta-card">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#A8D5A2', marginBottom: '0.8rem', position: 'relative', zIndex: 1 }}>
                  <span style={{ width: 28, height: 1, background: '#A8D5A2', display: 'inline-block' }} />
                  Listo para empezar
                  <span style={{ width: 28, height: 1, background: '#A8D5A2', display: 'inline-block' }} />
                </span>
                <h2 className="cta-title">
                  ¿Listo para vivir Concepción por dentro?
                </h2>
                <p className="cta-desc">
                  Explora el municipio como nunca antes. Descubre lugares, gana experiencia 
                  y conviértete en una leyenda de Concepción, Antioquia.
                </p>
                <Link to="/mapa" className="btn-primary" style={{ position: 'relative', zIndex: 1 }}>
                  Comenzar ahora <Sparkles size={17} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-logo">Concepción en el Mapa</div>
          <div className="footer-divider" />
          <div>© 2026 · Municipio de Concepción, Antioquia · Colombia</div>
          <div className="footer-alcaldia" style={{ marginTop: '0.4rem' }}>
            Alcaldía de Concepción · Una experiencia turística gamificada
          </div>
        </footer>

      </div>
    </>
  );
}