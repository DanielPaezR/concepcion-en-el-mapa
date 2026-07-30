// pages/LandingPage.jsx
// WABOT x CONCEPCIÓN — PREMIUM EDITION
// Estética: Cinemática / Turismo Gamificado / Glassmorphism / Fantasy Map UI

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Sparkles,
  Compass,
  Shield,
  Camera,
  Trophy,
  Calendar,
  ArrowDown,
  Crown,
  Zap,
  MapPin,
  Stars,
  Mountain,
  Trees,
  Flame,
  Gem
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

:root{
  --gold:#F6C453;
  --gold-soft:#FFD978;
  --dark:#070B11;
  --dark-2:#0D131D;
  --blue:#0EA5E9;
  --blue-soft:#38BDF8;
  --green:#22C55E;
  --red:#FF4D6D;
  --text:#E8EEF8;
  --muted:#95A4BD;
  --card:rgba(255,255,255,0.05);
  --stroke:rgba(255,255,255,0.08);
}

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

html{
  scroll-behavior:smooth;
}

body{
  background:var(--dark);
  color:white;
  font-family:'Inter',sans-serif;
  overflow-x:hidden;
}

.land{
  position:relative;
  overflow:hidden;
  background:
    radial-gradient(circle at top left, rgba(14,165,233,.12), transparent 30%),
    radial-gradient(circle at bottom right, rgba(246,196,83,.12), transparent 30%),
    linear-gradient(to bottom, #06090F 0%, #09111B 100%);
}

/* ───────────────── NAVBAR ───────────────── */

.nav{
  position:fixed;
  top:0;
  left:0;
  right:0;
  z-index:100;
  padding:1rem 2rem;

  display:flex;
  align-items:center;
  justify-content:space-between;

  backdrop-filter:blur(16px);
  background:rgba(7,11,17,.55);
  border-bottom:1px solid rgba(255,255,255,.05);
}

.logo{
  display:flex;
  align-items:center;
  gap:.8rem;
  text-decoration:none;
  color:white;
}

.logo-icon{
  width:42px;
  height:42px;
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;

  background:linear-gradient(135deg,var(--gold),#FFB800);
  color:black;
  box-shadow:0 0 25px rgba(246,196,83,.35);
}

.logo-text{
  display:flex;
  flex-direction:column;
  line-height:1;
}

.logo-title{
  font-family:'Cinzel',serif;
  font-weight:800;
  font-size:1rem;
  letter-spacing:.06em;
}

.logo-sub{
  font-size:.72rem;
  color:var(--muted);
}

.nav-actions{
  display:flex;
  align-items:center;
  gap:1rem;
}

.nav-link{
  color:var(--muted);
  text-decoration:none;
  font-size:.92rem;
  transition:.2s;
}

.nav-link:hover{
  color:white;
}

.nav-btn{
  padding:.8rem 1.4rem;
  border-radius:999px;
  background:linear-gradient(135deg,var(--gold),#FFB800);
  color:black;
  font-weight:700;
  text-decoration:none;
  box-shadow:0 10px 35px rgba(246,196,83,.25);
  transition:.25s;
}

.nav-btn:hover{
  transform:translateY(-2px) scale(1.03);
}

/* ───────────────── HERO ───────────────── */

.hero{
  position:relative;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:9rem 2rem 6rem;
}

.hero::before{
  content:'';
  position:absolute;
  inset:0;

  background:
    linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,.65)),
    url('/mapa.png');

  background-size:cover;
  background-position:center;
  opacity:.23;
  filter:contrast(1.1) brightness(.8);
}

.hero-grid{
  position:absolute;
  inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);

  background-size:80px 80px;
  mask-image:radial-gradient(circle at center, black, transparent 90%);
}

.hero-content{
  position:relative;
  z-index:2;
  max-width:1100px;
  width:100%;
}

.hero-badge{
  display:inline-flex;
  align-items:center;
  gap:.6rem;

  padding:.6rem 1rem;
  border-radius:999px;

  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.08);

  color:#D9E6F7;
  font-size:.78rem;
  letter-spacing:.12em;
  text-transform:uppercase;
  margin-bottom:2rem;

  backdrop-filter:blur(10px);
}

.hero-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:var(--gold);
  box-shadow:0 0 14px var(--gold);
}

.hero-title{
  font-family:'Cinzel',serif;
  font-size:clamp(3rem,7vw,6.8rem);
  line-height:.95;
  font-weight:900;
  letter-spacing:-.04em;

  max-width:1000px;
}

.hero-title span{
  display:block;
  background:linear-gradient(to bottom,#fff,#C8D7E8);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

.hero-title em{
  display:block;
  font-style:normal;

  background:linear-gradient(135deg,var(--gold),#FFE39A);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

.hero-sub{
  max-width:720px;
  margin-top:2rem;

  font-size:1.1rem;
  line-height:1.9;
  color:var(--muted);
}

.hero-actions{
  margin-top:2.6rem;

  display:flex;
  gap:1rem;
  flex-wrap:wrap;
}

.btn-main{
  display:inline-flex;
  align-items:center;
  gap:.7rem;

  padding:1rem 1.7rem;
  border-radius:999px;

  background:linear-gradient(135deg,var(--gold),#FFB800);
  color:black;

  font-weight:800;
  text-decoration:none;

  transition:.25s;
  box-shadow:0 14px 40px rgba(246,196,83,.3);
}

.btn-main:hover{
  transform:translateY(-2px);
}

.btn-ghost{
  display:inline-flex;
  align-items:center;
  gap:.7rem;

  padding:1rem 1.6rem;
  border-radius:999px;

  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);

  color:white;
  text-decoration:none;

  backdrop-filter:blur(12px);
}

.hero-cards{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:1rem;

  margin-top:4rem;
}

.stat-card{
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.07);

  padding:1.3rem;
  border-radius:24px;

  backdrop-filter:blur(18px);

  transition:.3s;
}

.stat-card:hover{
  transform:translateY(-5px);
  border-color:rgba(246,196,83,.25);
  box-shadow:0 20px 50px rgba(0,0,0,.35);
}

.stat-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:.9rem;
}

.stat-icon{
  width:44px;
  height:44px;
  border-radius:14px;

  display:flex;
  align-items:center;
  justify-content:center;

  background:rgba(255,255,255,.05);
  color:var(--gold);
}

.stat-number{
  font-size:2rem;
  font-weight:800;
}

.stat-label{
  color:var(--muted);
  font-size:.9rem;
}

/* ───────────────── SECTION ───────────────── */

.section{
  position:relative;
  padding:7rem 2rem;
}

.container{
  max-width:1200px;
  margin:auto;
}

.section-head{
  text-align:center;
  max-width:760px;
  margin:0 auto 4rem;
}

.section-tag{
  display:inline-flex;
  align-items:center;
  gap:.6rem;

  color:var(--gold);
  font-size:.8rem;
  text-transform:uppercase;
  letter-spacing:.15em;

  margin-bottom:1rem;
}

.section-title{
  font-family:'Cinzel',serif;
  font-size:clamp(2rem,5vw,4rem);
  line-height:1.1;
}

.section-title span{
  color:var(--gold);
}

.section-desc{
  margin-top:1.2rem;
  line-height:1.9;
  color:var(--muted);
  font-size:1.05rem;
}

/* ───────────────── FEATURES ───────────────── */

.features{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:1.4rem;
}

.feature{
  position:relative;
  overflow:hidden;

  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);

  padding:2rem;
  border-radius:28px;

  transition:.35s;
}

.feature::before{
  content:'';
  position:absolute;
  inset:0;

  background:linear-gradient(
    135deg,
    rgba(246,196,83,.08),
    transparent 60%
  );

  opacity:0;
  transition:.35s;
}

.feature:hover{
  transform:translateY(-7px);
  border-color:rgba(246,196,83,.2);
}

.feature:hover::before{
  opacity:1;
}

.feature-icon{
  width:60px;
  height:60px;

  display:flex;
  align-items:center;
  justify-content:center;

  border-radius:18px;

  background:rgba(255,255,255,.05);
  color:var(--gold);

  margin-bottom:1.4rem;
}

.feature h3{
  font-size:1.2rem;
  margin-bottom:.8rem;
}

.feature p{
  color:var(--muted);
  line-height:1.8;
}

/* ───────────────── LEVELS ───────────────── */

.levels{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
  gap:1.3rem;
}

.level{
  position:relative;

  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);

  border-radius:30px;
  padding:2rem;

  text-align:center;

  overflow:hidden;
}

.level::before{
  content:'';
  position:absolute;
  inset:0;

  background:
    radial-gradient(circle at top, rgba(255,255,255,.08), transparent 60%);
}

.level-emoji{
  font-size:3rem;
  margin-bottom:1rem;
}

.level h3{
  font-size:1.3rem;
  margin-bottom:.5rem;
}

.level p{
  color:var(--muted);
  line-height:1.6;
}

.level-badge{
  margin-top:1rem;
  display:inline-block;

  padding:.45rem .9rem;
  border-radius:999px;

  background:rgba(246,196,83,.1);
  color:var(--gold);

  font-size:.75rem;
  font-weight:700;
}

/* ───────────────── CTA ───────────────── */

.cta{
  position:relative;
  overflow:hidden;

  background:
    radial-gradient(circle at top right, rgba(246,196,83,.18), transparent 30%),
    linear-gradient(135deg,#0D131D,#09111B);

  border:1px solid rgba(255,255,255,.06);

  padding:5rem 2rem;
  border-radius:40px;

  text-align:center;
}

.cta h2{
  font-family:'Cinzel',serif;
  font-size:clamp(2rem,5vw,4rem);
  max-width:800px;
  margin:auto;
}

.cta p{
  max-width:650px;
  margin:1.4rem auto 2.5rem;
  color:var(--muted);
  line-height:1.9;
}

/* ───────────────── FOOTER ───────────────── */

.footer{
  padding:3rem 2rem;
  text-align:center;
  color:var(--muted);
  border-top:1px solid rgba(255,255,255,.06);
  margin-top:5rem;
}

/* ───────────────── RESPONSIVE ───────────────── */

@media(max-width:900px){

  .hero-cards{
    grid-template-columns:1fr 1fr;
  }

}

@media(max-width:700px){

  .nav{
    padding:1rem;
  }

  .nav-link{
    display:none;
  }

  .hero{
    padding-top:8rem;
  }

  .hero-cards{
    grid-template-columns:1fr;
  }

  .hero-actions{
    flex-direction:column;
  }

  .btn-main,
  .btn-ghost{
    width:100%;
    justify-content:center;
  }

}
`;

/* ───────────────── DATA ───────────────── */

const features = [
  {
    icon:<Compass size={26} />,
    title:'Mapa interactivo',
    desc:'Explora Concepción como si estuvieras dentro de un videojuego. Descubre puntos ocultos y secretos del municipio.'
  },
  {
    icon:<Shield size={26} />,
    title:'Guardianes del mapa',
    desc:'Protege lugares emblemáticos y conviértete en un guardián reconocido dentro de la comunidad.'
  },
  {
    icon:<Camera size={26} />,
    title:'Galería social',
    desc:'Sube fotos, comparte experiencias y deja recuerdos vivos dentro de cada lugar turístico.'
  },
  {
    icon:<Calendar size={26} />,
    title:'Eventos y retos',
    desc:'Participa en dinámicas, trivias y desafíos diarios que te darán XP y recompensas únicas.'
  },
  {
    icon:<Trophy size={26} />,
    title:'Sistema de logros',
    desc:'Desbloquea insignias especiales y demuestra quién es el verdadero explorador de Concepción.'
  },
  {
    icon:<Zap size={26} />,
    title:'Experiencia gamificada',
    desc:'Cada paso suma experiencia. Sube de nivel y conviértete en una leyenda local.'
  }
];

const levels = [
  {emoji:'🌱',title:'Principiante',desc:'Tus primeros pasos dentro de la aventura.',badge:'Nivel 1'},
  {emoji:'⭐',title:'Explorador',desc:'Ya comienzas a descubrir lugares ocultos.',badge:'Nivel 5'},
  {emoji:'⚡',title:'Aventurero',desc:'La experiencia comienza a sentirse épica.',badge:'Nivel 10'},
  {emoji:'🛡️',title:'Guardián',desc:'Proteges y conquistas lugares del municipio.',badge:'Nivel 20'},
  {emoji:'👑',title:'Leyenda',desc:'Eres parte de la historia de Concepción.',badge:'Nivel Máximo'}
];

/* ───────────────── COMPONENT ───────────────── */

export default function LandingPage(){

  return(
    <>
      <style>{CSS}</style>

      <div className="land">

        {/* NAV */}
        <nav className="nav">

          <Link to="/landing" className="logo">
            <div className="logo-icon">
              <MapPin size={20}/>
            </div>

            <div className="logo-text">
              <span className="logo-title">Concepción</span>
              <span className="logo-sub">En el mapa</span>
            </div>
          </Link>

          <div className="nav-actions">
            <a href="#features" className="nav-link">Funcionalidades</a>
            <a href="#niveles" className="nav-link">Niveles</a>
            <a href="#comenzar" className="nav-btn">
              Comenzar aventura
            </a>
          </div>

        </nav>

        {/* HERO */}
        <section className="hero">

          <div className="hero-grid"/>

          <div className="hero-content">

            <motion.div
              initial={{opacity:0,y:30}}
              animate={{opacity:1,y:0}}
              transition={{duration:.7}}
            >

              <div className="hero-badge">
                <div className="hero-dot"/>
                Antioquia · Colombia · Turismo Gamificado
              </div>

              <h1 className="hero-title">
                <span>Explora.</span>
                <em>Descubre.</em>
                <span>Conquista Concepción.</span>
              </h1>

              <p className="hero-sub">
                Una experiencia inmersiva donde el turismo, la exploración y la gamificación se unen para transformar cada rincón del municipio en una aventura épica.
              </p>

              <div className="hero-actions">

                <Link to="/" className="btn-main">
                  Comenzar ahora
                  <ChevronRight size={18}/>
                </Link>

                <a href="#features" className="btn-ghost">
                  Ver funcionalidades
                </a>

              </div>

              <div className="hero-cards">

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon">
                      <Mountain size={20}/>
                    </div>
                  </div>

                  <div className="stat-number">8+</div>
                  <div className="stat-label">Lugares turísticos</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon">
                      <Gem size={20}/>
                    </div>
                  </div>

                  <div className="stat-number">20+</div>
                  <div className="stat-label">Insignias</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon">
                      <Flame size={20}/>
                    </div>
                  </div>

                  <div className="stat-number">5</div>
                  <div className="stat-label">Niveles épicos</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon">
                      <Stars size={20}/>
                    </div>
                  </div>

                  <div className="stat-number">∞</div>
                  <div className="stat-label">Aventuras</div>
                </div>

              </div>

            </motion.div>

          </div>

        </section>

        {/* FEATURES */}
        <section id="features" className="section">

          <div className="container">

            <div className="section-head">

              <div className="section-tag">
                <Sparkles size={14}/>
                Funcionalidades
              </div>

              <h2 className="section-title">
                Turismo convertido en <span>videojuego</span>
              </h2>

              <p className="section-desc">
                Descubre una experiencia moderna e inmersiva diseñada para que cada visitante viva Concepción de una forma completamente diferente.
              </p>

            </div>

            <div className="features">

              {features.map((f,i)=>(
                <motion.div
                  key={i}
                  className="feature"
                  initial={{opacity:0,y:40}}
                  whileInView={{opacity:1,y:0}}
                  transition={{duration:.45,delay:i*.05}}
                  viewport={{once:true}}
                >

                  <div className="feature-icon">
                    {f.icon}
                  </div>

                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>

                </motion.div>
              ))}

            </div>

          </div>

        </section>

        {/* LEVELS */}
        <section id="niveles" className="section">

          <div className="container">

            <div className="section-head">

              <div className="section-tag">
                <Crown size={14}/>
                Progresión
              </div>

              <h2 className="section-title">
                Conviértete en una <span>leyenda</span>
              </h2>

              <p className="section-desc">
                Sube de nivel, desbloquea insignias y deja tu marca dentro del mapa turístico de Concepción.
              </p>

            </div>

            <div className="levels">

              {levels.map((lv,i)=>(
                <motion.div
                  key={i}
                  className="level"
                  initial={{opacity:0,y:40}}
                  whileInView={{opacity:1,y:0}}
                  transition={{duration:.45,delay:i*.08}}
                  viewport={{once:true}}
                >

                  <div className="level-emoji">
                    {lv.emoji}
                  </div>

                  <h3>{lv.title}</h3>

                  <p>{lv.desc}</p>

                  <div className="level-badge">
                    {lv.badge}
                  </div>

                </motion.div>
              ))}

            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="section">

          <div className="container">

            <div id="comenzar" className="cta">

              <h2>
                ¿Listo para descubrir Concepción como nunca antes?
              </h2>

              <p>
                Explora lugares, gana experiencia, participa en eventos y conviértete en parte viva de la historia del municipio.
              </p>

              <Link to="/" className="btn-main">
                Entrar a la experiencia
                <Sparkles size={18}/>
              </Link>

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="footer">

          <div style={{
            fontFamily:'Cinzel',
            fontSize:'1.1rem',
            marginBottom:'.5rem',
            color:'white'
          }}>
            Concepción en el mapa
          </div>

          <div>
            © 2026 · Municipio de Concepción · Antioquia · Colombia
          </div>

        </footer>

      </div>
    </>
  );
}