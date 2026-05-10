import { useState, useEffect } from 'react';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://mrt.viewdns.net';

/* ────────────────────────── Navbar ─────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '16px 24px',
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.25rem', fontWeight: 800 }}>
        <span style={{ fontSize: '1.8rem' }}>🏍️</span>
        <span>Moto<span className="gradient-text">Taxi</span></span>
      </div>
      <div style={{ display: 'flex', gap: 32, fontSize: '0.9rem' }}>
        {[
          { name: 'Inicio', href: '#inicio' },
          { name: 'Características', href: '#caracteristicas' },
          { name: 'Cómo funciona', href: '#como-funciona' },
          { name: 'Equipo', href: '#equipo' }
        ].map(item => (
          <a key={item.name} href={item.href}
            style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'var(--text-2)'}
          >{item.name}</a>
        ))}
      </div>
      <a href="https://expo.dev/accounts/mrt04/projects/mobile/builds/f6e14eff-2997-4bcf-8839-38db2abec004" target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
        Descargar APK 📱
      </a>
    </nav>
  );
}

/* ────────────────────────── Hero ───────────────────────── */
function Hero() {
  return (
    <section id="inicio" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,107,53,0.15) 0%, transparent 70%)',
      paddingTop: 100 }}>
      <div className="container" style={{ textAlign: 'center' }}>
        {/* Badge */}
        <div className="animate-fadeUp" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <span className="badge">🚀 Plataforma Multiplataforma de Microservicios</span>
        </div>

        {/* Título */}
        <h1 className="section-title animate-fadeUp delay-100" style={{ marginBottom: 24 }}>
          Transporte Inteligente<br />
          <span className="gradient-text">Para Todos</span>
        </h1>

        <p className="animate-fadeUp delay-200" style={{
          fontSize: '1.2rem', color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 48px'
        }}>
          Conectamos pasajeros con conductores de mototaxi en tiempo real.
          Disponible en web, Android y tablet con seguimiento GPS y pagos digitales.
        </p>

        {/* CTA */}
        <div className="animate-fadeUp delay-300" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://expo.dev/accounts/mrt04/projects/mobile/builds/f6e14eff-2997-4bcf-8839-38db2abec004" target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
            📱 Descargar APK
          </a>
          <a href="#caracteristicas" className="btn-outline" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
            Ver características
          </a>
        </div>

        {/* Stats */}
        <div className="animate-fadeUp delay-400" style={{
          display: 'flex', gap: 48, justifyContent: 'center', marginTop: 80,
          flexWrap: 'wrap'
        }}>
          {[
            { n: '5', label: 'Microservicios' },
            { n: '5', label: 'Bases de datos' },
            { n: '3', label: 'Plataformas' },
            { n: '∞', label: 'Escalabilidad' }
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--orange)' }}>{n}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Floating moto emoji */}
        <div className="animate-float" style={{ fontSize: '5rem', marginTop: 60 }}>🏍️</div>
      </div>
    </section>
  );
}

/* ────────────────────────── Features ──────────────────── */
const features = [
  { icon: '🔐', title: 'Auth con JWT', desc: 'Autenticación centralizada con tokens seguros. Registro y login para pasajeros y conductores.' },
  { icon: '🗺️', title: 'Tracking GPS', desc: 'Seguimiento en tiempo real con WebSockets (Socket.io). Comparte tu ubicación al instante.' },
  { icon: '💳', title: 'Pagos Digitales', desc: 'Wallet digital, tarjetas y efectivo. Historial de transacciones completo.' },
  { icon: '⭐', title: 'Calificaciones', desc: 'Sistema de ratings con MongoDB. Califica a conductores y pasajeros post-viaje.' },
  { icon: '💬', title: 'Chat en Viaje', desc: 'Mensajería integrada entre pasajero y conductor durante el viaje.' },
  { icon: '🆘', title: 'Botón de Emergencia', desc: 'Alerta de emergencia instantánea con notificación a contactos de seguridad.' },
];

function Features() {
  return (
    <section id="caracteristicas" style={{ background: 'var(--bg-card)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="badge" style={{ marginBottom: 20 }}>✨ Características</span>
          <h2 className="section-title">Todo lo que necesitas<br /><span className="gradient-text">en una sola app</span></h2>
          <p className="section-sub" style={{ margin: '16px auto 0' }}>
            Funcionalidades completas para pasajeros y conductores, construidas sobre arquitectura hexagonal.
          </p>
        </div>
        <div className="grid-3">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="glass-card" style={{ padding: 32 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 20 }}>{icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>{title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── Arquitectura ───────────────── */
const services = [
  { color: '#FF6B35', icon: '🔐', name: 'auth-service',     port: ':3001', db: 'MySQL',   desc: 'JWT, registro, login, perfiles' },
  { color: '#3B82F6', icon: '🚗', name: 'rides-service',    port: ':3002', db: 'MySQL',   desc: 'CRUD de viajes y estados' },
  { color: '#8B5CF6', icon: '⭐', name: 'ratings-service',  port: ':3003', db: 'MongoDB', desc: 'Calificaciones NoSQL' },
  { color: '#10B981', icon: '📍', name: 'tracking-service', port: ':3004', db: 'Redis',   desc: 'GPS tiempo real + chat' },
  { color: '#F59E0B', icon: '💳', name: 'payments-service', port: ':3005', db: 'MySQL',   desc: 'Wallet y transacciones' },
];

function Architecture() {
  return (
    <section id="como-funciona">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="badge" style={{ marginBottom: 20 }}>🏗️ Arquitectura</span>
          <h2 className="section-title">Microservicios Independientes<br /><span className="gradient-text">Bases de Datos Autónomas</span></h2>
          <p className="section-sub" style={{ margin: '16px auto 0' }}>
            Arquitectura hexagonal (Ports &amp; Adapters). Cada servicio tiene su propia base de datos — MySQL, MongoDB y Redis.
          </p>
        </div>

        {/* API Gateway */}
        <div style={{
          textAlign: 'center', padding: '20px 40px', marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05))',
          border: '1px solid rgba(255,107,53,0.4)',
          borderRadius: 'var(--radius)', maxWidth: 400, margin: '0 auto 48px'
        }}>
          <div style={{ fontSize: '1.8rem' }}>🔀</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: 8 }}>API Gateway :3000</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: 4 }}>HTTPS · JWT · Rate Limiting · Swagger</div>
        </div>

        {/* Microservicios */}
        <div className="grid-3" style={{ gap: 20 }}>
          {services.map(({ color, icon, name, port, db, desc }) => (
            <div key={name} className="glass-card" style={{ padding: 28, borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace', color }}>{name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 12 }}>{port}</div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: 16 }}>{desc}</p>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                background: `${color}20`, color, border: `1px solid ${color}40`
              }}>{db}</span>
            </div>
          ))}
        </div>

        {/* Clientes */}
        <div style={{ marginTop: 64, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 24 }}>CLIENTES</div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '💻', label: 'Landing Page', sub: 'Vercel', color: '#FF6B35' },
              { icon: '🖥️', label: 'Dashboard App', sub: 'AWS S3 + CloudFront', color: '#3B82F6' },
              { icon: '📱', label: 'App Android', sub: 'Capacitor APK', color: '#10B981' },
            ].map(({ icon, label, sub, color }) => (
              <div key={label} style={{
                padding: '20px 32px', borderRadius: 'var(--radius)',
                border: `1px solid ${color}40`, background: `${color}08`,
                textAlign: 'center', minWidth: 160
              }}>
                <div style={{ fontSize: '2rem' }}>{icon}</div>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── Tech Stack ─────────────────── */
const techs = [
  { icon: '⚛️', name: 'React + Vite',    cat: 'Frontend' },
  { icon: '📱', name: 'Capacitor',        cat: 'Mobile' },
  { icon: '🟩', name: 'Node.js Express',  cat: 'Backend' },
  { icon: '🐋', name: 'Docker + ECS',     cat: 'DevOps' },
  { icon: '🗄️', name: 'MySQL',            cat: 'SQL DB' },
  { icon: '🍃', name: 'MongoDB',          cat: 'NoSQL DB' },
  { icon: '⚡', name: 'Redis',            cat: 'Cache DB' },
  { icon: '☁️', name: 'AWS',             cat: 'Cloud' },
];

function TechStack() {
  return (
    <section style={{ background: 'var(--bg-card)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="section-title">Stack <span className="gradient-text">Tecnológico</span></h2>
        </div>
        <div className="grid-4">
          {techs.map(({ icon, name, cat }) => (
            <div key={name} className="glass-card" style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--orange)', marginTop: 4 }}>{cat}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── Equipo ─────────────────────── */
function Team() {
  return (
    <section id="equipo" style={{ background: 'var(--bg)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="badge" style={{ marginBottom: 20 }}>🎓 Desarrollo</span>
          <h2 className="section-title">El Equipo <span className="gradient-text">UNACH</span></h2>
        </div>
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-1)', lineHeight: 1.8, marginBottom: 24 }}>
            Proyecto elaborado por los estudiantes:<br/>
            <strong style={{ color: 'var(--orange)' }}>Diego, Anuar, Pablo, Jesus</strong>
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--text-2)' }}>
            Estudiantes de la <strong>UNACH</strong><br/>
            Proyecto de la materia <strong>Taller 4</strong><br/>
            Impartida por el profe <strong>GUTIÉRREZ ALFARO LUIS, DR</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── CTA Final ──────────────────── */
function CTA() {
  return (
    <section style={{
      background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,107,53,0.12) 0%, transparent 70%)',
      textAlign: 'center'
    }}>
      <div className="container">
        <div style={{ fontSize: '4rem', marginBottom: 24 }} className="animate-float">🏍️</div>
        <h2 className="section-title">¿Listo para probarla?</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', marginBottom: 40, maxWidth: 480, margin: '16px auto 40px' }}>
          Descarga el archivo APK e instálalo en tu dispositivo Android para probar el sistema completo en tiempo real.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://expo.dev/accounts/mrt04/projects/mobile/builds/f6e14eff-2997-4bcf-8839-38db2abec004" target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: '1.1rem', padding: '18px 40px' }}>
            ⬇️ Descargar App
          </a>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── Footer ─────────────────────── */
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '40px 24px',
      textAlign: 'center',
      color: 'var(--text-3)',
      fontSize: '0.85rem'
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>🏍️ <strong style={{ color: 'var(--text-1)' }}>MotoTaxi</strong></div>
      <div>Arquitectura de Microservicios · Hexagonal Pattern · AWS · Docker</div>
      <div style={{ marginTop: 8 }}>
        <a href="https://github.com" style={{ color: 'var(--orange)', textDecoration: 'none' }}>GitHub</a>
        {' · '}
        <a href={`${APP_URL}/docs`} style={{ color: 'var(--orange)', textDecoration: 'none' }}>API Docs</a>
      </div>
      <div style={{ marginTop: 16, color: 'var(--text-3)' }}>
        © {new Date().getFullYear()} MotoTaxi — Desarrollado con ❤️ para transporte seguro
      </div>
    </footer>
  );
}

/* ────────────────────────── App Principal ──────────────── */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Architecture />
        <TechStack />
        <Team />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
