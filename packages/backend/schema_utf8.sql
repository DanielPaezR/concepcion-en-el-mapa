--
-- PostgreSQL database dump
--

\restrict VrDGgx0KdnrzPHPyv1drKdQeFsgXChgoaX0kpfHm5tzB8eBHGk7zNe4j2hrc9K9

-- Dumped from database version 17.5
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bancos_preguntas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bancos_preguntas (
    id integer NOT NULL,
    pregunta text NOT NULL,
    respuesta text NOT NULL,
    tipo character varying(50) DEFAULT 'pregunta'::character varying,
    dificultad integer DEFAULT 1,
    activo boolean DEFAULT true
);


--
-- Name: bancos_preguntas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bancos_preguntas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bancos_preguntas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bancos_preguntas_id_seq OWNED BY public.bancos_preguntas.id;


--
-- Name: bancos_ubicaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bancos_ubicaciones (
    id integer NOT NULL,
    nombre character varying(200),
    latitud numeric(10,8) NOT NULL,
    longitud numeric(11,8) NOT NULL,
    radio integer DEFAULT 50,
    activo boolean DEFAULT true
);


--
-- Name: bancos_ubicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bancos_ubicaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bancos_ubicaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bancos_ubicaciones_id_seq OWNED BY public.bancos_ubicaciones.id;


--
-- Name: codigos_descuento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.codigos_descuento (
    id integer NOT NULL,
    comercio_id integer,
    usuario_id integer,
    codigo character varying(50) NOT NULL,
    usado boolean DEFAULT false,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion timestamp without time zone,
    fecha_uso timestamp without time zone
);


--
-- Name: codigos_descuento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.codigos_descuento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: codigos_descuento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.codigos_descuento_id_seq OWNED BY public.codigos_descuento.id;


--
-- Name: comentarios_fotos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comentarios_fotos (
    id integer NOT NULL,
    foto_id integer,
    usuario_id integer,
    comentario text NOT NULL,
    fecha_comentario timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comentarios_fotos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comentarios_fotos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comentarios_fotos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comentarios_fotos_id_seq OWNED BY public.comentarios_fotos.id;


--
-- Name: comercios_partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comercios_partners (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    direccion character varying(500),
    telefono character varying(20),
    logo_url character varying(500),
    latitud numeric(10,8),
    longitud numeric(11,8),
    descuento_ofertado integer DEFAULT 10,
    activo boolean DEFAULT true,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comercios_partners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comercios_partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comercios_partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comercios_partners_id_seq OWNED BY public.comercios_partners.id;


--
-- Name: descubrimientos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.descubrimientos (
    id integer NOT NULL,
    usuario_id integer,
    lugar_id integer,
    fecha_descubrimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: descubrimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.descubrimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: descubrimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.descubrimientos_id_seq OWNED BY public.descubrimientos.id;


--
-- Name: encuestas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encuestas (
    id integer NOT NULL,
    reserva_id integer,
    calificacion_guia integer,
    calificacion_experiencia integer,
    comentarios text,
    sugerencias text,
    origen_turista character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT encuestas_calificacion_experiencia_check CHECK (((calificacion_experiencia >= 1) AND (calificacion_experiencia <= 5))),
    CONSTRAINT encuestas_calificacion_guia_check CHECK (((calificacion_guia >= 1) AND (calificacion_guia <= 5)))
);


--
-- Name: encuestas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.encuestas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: encuestas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.encuestas_id_seq OWNED BY public.encuestas.id;


--
-- Name: escaneos_qr; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escaneos_qr (
    id integer NOT NULL,
    usuario_id integer,
    session_id character varying(255),
    user_agent text,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: escaneos_qr_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.escaneos_qr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: escaneos_qr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.escaneos_qr_id_seq OWNED BY public.escaneos_qr.id;


--
-- Name: estadisticas_eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estadisticas_eventos (
    usuario_id integer NOT NULL,
    total_completados integer DEFAULT 0,
    racha_actual integer DEFAULT 0,
    racha_maxima integer DEFAULT 0,
    ultimo_evento timestamp without time zone
);


--
-- Name: eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eventos (
    id integer NOT NULL,
    lugar_id integer,
    titulo character varying(255) NOT NULL,
    descripcion text,
    fecha_inicio timestamp without time zone NOT NULL,
    fecha_fin timestamp without time zone,
    precio numeric(10,2),
    max_participantes integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: eventos_diarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eventos_diarios (
    id integer NOT NULL,
    pregunta_id integer,
    ubicacion_id integer,
    titulo character varying(200),
    xp_recompensa integer DEFAULT 50,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion timestamp without time zone,
    activo boolean DEFAULT true
);


--
-- Name: eventos_diarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eventos_diarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eventos_diarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eventos_diarios_id_seq OWNED BY public.eventos_diarios.id;


--
-- Name: eventos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eventos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eventos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eventos_id_seq OWNED BY public.eventos.id;


--
-- Name: eventos_temporales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eventos_temporales (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    fecha_inicio timestamp without time zone NOT NULL,
    fecha_fin timestamp without time zone NOT NULL,
    insignia_nombre character varying(100),
    insignia_icono character varying(50),
    activo boolean DEFAULT true
);


--
-- Name: eventos_temporales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eventos_temporales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eventos_temporales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eventos_temporales_id_seq OWNED BY public.eventos_temporales.id;


--
-- Name: galeria_fotos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.galeria_fotos (
    id integer NOT NULL,
    usuario_id integer,
    lugar_especial_id integer,
    imagen_url character varying(500) NOT NULL,
    mensaje text,
    likes integer DEFAULT 0,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado character varying(20) DEFAULT 'activo'::character varying
);


--
-- Name: galeria_fotos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.galeria_fotos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: galeria_fotos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.galeria_fotos_id_seq OWNED BY public.galeria_fotos.id;


--
-- Name: guardianes_anclados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guardianes_anclados (
    id integer NOT NULL,
    usuario_id integer,
    latitud numeric(10,8) NOT NULL,
    longitud numeric(11,8) NOT NULL,
    mensaje text,
    fecha_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_fin timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '60 days'::interval),
    activo boolean DEFAULT true
);


--
-- Name: guardianes_anclados_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.guardianes_anclados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: guardianes_anclados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.guardianes_anclados_id_seq OWNED BY public.guardianes_anclados.id;


--
-- Name: guias_conectados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guias_conectados (
    guia_id integer NOT NULL,
    ultima_actividad timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    disponible boolean DEFAULT true,
    socket_id character varying(255)
);


--
-- Name: insignias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insignias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    imagen_url character varying(500),
    nivel_requerido integer,
    lugares_requeridos integer,
    tipo character varying(50) DEFAULT 'exploracion'::character varying
);


--
-- Name: insignias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.insignias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: insignias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.insignias_id_seq OWNED BY public.insignias.id;


--
-- Name: lugares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lugares (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    tipo character varying(50) NOT NULL,
    latitud numeric(10,8) NOT NULL,
    longitud numeric(11,8) NOT NULL,
    direccion character varying(500),
    imagen_url character varying(500),
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    horario character varying(255) DEFAULT '9:00 AM - 5:00 PM'::character varying,
    CONSTRAINT lugares_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['historico'::character varying, 'natural'::character varying, 'cultural'::character varying, 'gastronomico'::character varying, 'evento'::character varying])::text[])))
);


--
-- Name: lugares_especiales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lugares_especiales (
    id integer NOT NULL,
    nombre character varying(255) DEFAULT 'Lugar Secreto del Explorador'::character varying NOT NULL,
    descripcion text,
    latitud numeric(10,8) NOT NULL,
    longitud numeric(11,8) NOT NULL,
    direccion character varying(500),
    imagen_url character varying(500),
    nivel_requerido integer DEFAULT 5,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: lugares_especiales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lugares_especiales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lugares_especiales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lugares_especiales_id_seq OWNED BY public.lugares_especiales.id;


--
-- Name: lugares_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lugares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lugares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lugares_id_seq OWNED BY public.lugares.id;


--
-- Name: metricas_acceso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metricas_acceso (
    id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    lugar_id integer,
    usuario_id integer,
    user_agent text,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT metricas_acceso_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['qr_escaneado'::character varying, 'vista_lugar'::character varying, 'click_guia'::character varying])::text[])))
);


--
-- Name: metricas_acceso_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.metricas_acceso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: metricas_acceso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.metricas_acceso_id_seq OWNED BY public.metricas_acceso.id;


--
-- Name: notificaciones_guardian; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificaciones_guardian (
    id integer NOT NULL,
    guardian_id integer,
    visitante_id integer,
    mensaje text,
    leida boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notificaciones_guardian_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notificaciones_guardian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificaciones_guardian_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notificaciones_guardian_id_seq OWNED BY public.notificaciones_guardian.id;


--
-- Name: perfiles_guardian; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.perfiles_guardian (
    usuario_id integer NOT NULL,
    nombre_publico character varying(100),
    ciudad_origen character varying(100),
    foto_perfil_url character varying(500),
    biografia text,
    visible boolean DEFAULT true,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: progreso_eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progreso_eventos (
    id integer NOT NULL,
    usuario_id integer,
    evento_id integer,
    completado boolean DEFAULT false,
    fecha_completado timestamp without time zone
);


--
-- Name: progreso_eventos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.progreso_eventos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progreso_eventos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.progreso_eventos_id_seq OWNED BY public.progreso_eventos.id;


--
-- Name: reservas_guia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservas_guia (
    id integer NOT NULL,
    turista_id integer,
    guia_id integer,
    lugar_id integer,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_encuentro timestamp without time zone NOT NULL,
    numero_personas integer NOT NULL,
    intereses text,
    punto_encuentro character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reservas_guia_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'confirmada'::character varying, 'completada'::character varying, 'cancelada'::character varying])::text[]))),
    CONSTRAINT reservas_guia_numero_personas_check CHECK ((numero_personas > 0))
);


--
-- Name: reservas_guia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservas_guia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reservas_guia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reservas_guia_id_seq OWNED BY public.reservas_guia.id;


--
-- Name: reservas_temporales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservas_temporales (
    id integer NOT NULL,
    reserva_id integer,
    guia_id integer,
    expira timestamp without time zone DEFAULT (now() + '00:02:00'::interval)
);


--
-- Name: reservas_temporales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservas_temporales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reservas_temporales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reservas_temporales_id_seq OWNED BY public.reservas_temporales.id;


--
-- Name: usuario_insignias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario_insignias (
    id integer NOT NULL,
    usuario_id integer,
    insignia_id integer,
    fecha_obtenida timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: usuario_insignias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_insignias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_insignias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_insignias_id_seq OWNED BY public.usuario_insignias.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    nombre character varying(255) NOT NULL,
    telefono character varying(20),
    rol character varying(20) DEFAULT 'turista'::character varying NOT NULL,
    password_hash character varying(255),
    estudiante_id integer,
    disponible boolean DEFAULT true,
    calificacion_promedio numeric(3,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    session_id character varying(255),
    anonimo boolean DEFAULT false,
    ultima_conexion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    xp_total integer DEFAULT 0,
    nivel integer DEFAULT 1,
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['turista'::character varying, 'guia'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: usuarios_insignias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios_insignias (
    id integer NOT NULL,
    usuario_id integer,
    insignia_id integer,
    fecha_obtenida timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: usuarios_insignias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_insignias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_insignias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_insignias_id_seq OWNED BY public.usuarios_insignias.id;


--
-- Name: bancos_preguntas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bancos_preguntas ALTER COLUMN id SET DEFAULT nextval('public.bancos_preguntas_id_seq'::regclass);


--
-- Name: bancos_ubicaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bancos_ubicaciones ALTER COLUMN id SET DEFAULT nextval('public.bancos_ubicaciones_id_seq'::regclass);


--
-- Name: codigos_descuento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_descuento ALTER COLUMN id SET DEFAULT nextval('public.codigos_descuento_id_seq'::regclass);


--
-- Name: comentarios_fotos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios_fotos ALTER COLUMN id SET DEFAULT nextval('public.comentarios_fotos_id_seq'::regclass);


--
-- Name: comercios_partners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comercios_partners ALTER COLUMN id SET DEFAULT nextval('public.comercios_partners_id_seq'::regclass);


--
-- Name: descubrimientos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.descubrimientos ALTER COLUMN id SET DEFAULT nextval('public.descubrimientos_id_seq'::regclass);


--
-- Name: encuestas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuestas ALTER COLUMN id SET DEFAULT nextval('public.encuestas_id_seq'::regclass);


--
-- Name: escaneos_qr id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escaneos_qr ALTER COLUMN id SET DEFAULT nextval('public.escaneos_qr_id_seq'::regclass);


--
-- Name: eventos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos ALTER COLUMN id SET DEFAULT nextval('public.eventos_id_seq'::regclass);


--
-- Name: eventos_diarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_diarios ALTER COLUMN id SET DEFAULT nextval('public.eventos_diarios_id_seq'::regclass);


--
-- Name: eventos_temporales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_temporales ALTER COLUMN id SET DEFAULT nextval('public.eventos_temporales_id_seq'::regclass);


--
-- Name: galeria_fotos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galeria_fotos ALTER COLUMN id SET DEFAULT nextval('public.galeria_fotos_id_seq'::regclass);


--
-- Name: guardianes_anclados id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guardianes_anclados ALTER COLUMN id SET DEFAULT nextval('public.guardianes_anclados_id_seq'::regclass);


--
-- Name: insignias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insignias ALTER COLUMN id SET DEFAULT nextval('public.insignias_id_seq'::regclass);


--
-- Name: lugares id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares ALTER COLUMN id SET DEFAULT nextval('public.lugares_id_seq'::regclass);


--
-- Name: lugares_especiales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares_especiales ALTER COLUMN id SET DEFAULT nextval('public.lugares_especiales_id_seq'::regclass);


--
-- Name: metricas_acceso id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metricas_acceso ALTER COLUMN id SET DEFAULT nextval('public.metricas_acceso_id_seq'::regclass);


--
-- Name: notificaciones_guardian id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones_guardian ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_guardian_id_seq'::regclass);


--
-- Name: progreso_eventos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso_eventos ALTER COLUMN id SET DEFAULT nextval('public.progreso_eventos_id_seq'::regclass);


--
-- Name: reservas_guia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas_guia ALTER COLUMN id SET DEFAULT nextval('public.reservas_guia_id_seq'::regclass);


--
-- Name: reservas_temporales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas_temporales ALTER COLUMN id SET DEFAULT nextval('public.reservas_temporales_id_seq'::regclass);


--
-- Name: usuario_insignias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_insignias ALTER COLUMN id SET DEFAULT nextval('public.usuario_insignias_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: usuarios_insignias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_insignias ALTER COLUMN id SET DEFAULT nextval('public.usuarios_insignias_id_seq'::regclass);


--
-- Name: bancos_preguntas bancos_preguntas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bancos_preguntas
    ADD CONSTRAINT bancos_preguntas_pkey PRIMARY KEY (id);


--
-- Name: bancos_ubicaciones bancos_ubicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bancos_ubicaciones
    ADD CONSTRAINT bancos_ubicaciones_pkey PRIMARY KEY (id);


--
-- Name: codigos_descuento codigos_descuento_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_descuento
    ADD CONSTRAINT codigos_descuento_codigo_key UNIQUE (codigo);


--
-- Name: codigos_descuento codigos_descuento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_descuento
    ADD CONSTRAINT codigos_descuento_pkey PRIMARY KEY (id);


--
-- Name: comentarios_fotos comentarios_fotos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios_fotos
    ADD CONSTRAINT comentarios_fotos_pkey PRIMARY KEY (id);


--
-- Name: comercios_partners comercios_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comercios_partners
    ADD CONSTRAINT comercios_partners_pkey PRIMARY KEY (id);


--
-- Name: descubrimientos descubrimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.descubrimientos
    ADD CONSTRAINT descubrimientos_pkey PRIMARY KEY (id);


--
-- Name: descubrimientos descubrimientos_usuario_id_lugar_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.descubrimientos
    ADD CONSTRAINT descubrimientos_usuario_id_lugar_id_key UNIQUE (usuario_id, lugar_id);


--
-- Name: encuestas encuestas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuestas
    ADD CONSTRAINT encuestas_pkey PRIMARY KEY (id);


--
-- Name: escaneos_qr escaneos_qr_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escaneos_qr
    ADD CONSTRAINT escaneos_qr_pkey PRIMARY KEY (id);


--
-- Name: estadisticas_eventos estadisticas_eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estadisticas_eventos
    ADD CONSTRAINT estadisticas_eventos_pkey PRIMARY KEY (usuario_id);


--
-- Name: eventos_diarios eventos_diarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_diarios
    ADD CONSTRAINT eventos_diarios_pkey PRIMARY KEY (id);


--
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id);


--
-- Name: eventos_temporales eventos_temporales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_temporales
    ADD CONSTRAINT eventos_temporales_pkey PRIMARY KEY (id);


--
-- Name: galeria_fotos galeria_fotos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galeria_fotos
    ADD CONSTRAINT galeria_fotos_pkey PRIMARY KEY (id);


--
-- Name: guardianes_anclados guardianes_anclados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guardianes_anclados
    ADD CONSTRAINT guardianes_anclados_pkey PRIMARY KEY (id);


--
-- Name: guias_conectados guias_conectados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guias_conectados
    ADD CONSTRAINT guias_conectados_pkey PRIMARY KEY (guia_id);


--
-- Name: insignias insignias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insignias
    ADD CONSTRAINT insignias_pkey PRIMARY KEY (id);


--
-- Name: lugares_especiales lugares_especiales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares_especiales
    ADD CONSTRAINT lugares_especiales_pkey PRIMARY KEY (id);


--
-- Name: lugares lugares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares
    ADD CONSTRAINT lugares_pkey PRIMARY KEY (id);


--
-- Name: metricas_acceso metricas_acceso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metricas_acceso
    ADD CONSTRAINT metricas_acceso_pkey PRIMARY KEY (id);


--
-- Name: notificaciones_guardian notificaciones_guardian_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones_guardian
    ADD CONSTRAINT notificaciones_guardian_pkey PRIMARY KEY (id);


--
-- Name: perfiles_guardian perfiles_guardian_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfiles_guardian
    ADD CONSTRAINT perfiles_guardian_pkey PRIMARY KEY (usuario_id);


--
-- Name: progreso_eventos progreso_eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso_eventos
    ADD CONSTRAINT progreso_eventos_pkey PRIMARY KEY (id);


--
-- Name: progreso_eventos progreso_eventos_usuario_id_evento_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso_eventos
    ADD CONSTRAINT progreso_eventos_usuario_id_evento_id_key UNIQUE (usuario_id, evento_id);


--
-- Name: reservas_guia reservas_guia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas_guia
    ADD CONSTRAINT reservas_guia_pkey PRIMARY KEY (id);


--
-- Name: reservas_temporales reservas_temporales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas_temporales
    ADD CONSTRAINT reservas_temporales_pkey PRIMARY KEY (id);


--
-- Name: usuario_insignias usuario_insignias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_insignias
    ADD CONSTRAINT usuario_insignias_pkey PRIMARY KEY (id);


--
-- Name: usuario_insignias usuario_insignias_usuario_id_insignia_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_insignias
    ADD CONSTRAINT usuario_insignias_usuario_id_insignia_id_key UNIQUE (usuario_id, insignia_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios_insignias usuarios_insignias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_insignias
    ADD CONSTRAINT usuarios_insignias_pkey PRIMARY KEY (id);


--
-- Name: usuarios_insignias usuarios_insignias_usuario_id_insignia_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_insignias
    ADD CONSTRAINT usuarios_insignias_usuario_id_insignia_id_key UNIQUE (usuario_id, insignia_id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_session_id_key UNIQUE (session_id);


--
-- Name: idx_descubrimientos_lugar; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_descubrimientos_lugar ON public.descubrimientos USING btree (lugar_id);


--
-- Name: idx_descubrimientos_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_descubrimientos_usuario ON public.descubrimientos USING btree (usuario_id);


--
-- Name: idx_escaneos_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escaneos_fecha ON public.escaneos_qr USING btree (created_at);


--
-- Name: idx_escaneos_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escaneos_session ON public.escaneos_qr USING btree (session_id);


--
-- Name: idx_usuarios_anonimo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_anonimo ON public.usuarios USING btree (anonimo);


--
-- Name: idx_usuarios_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_session_id ON public.usuarios USING btree (session_id);


--
-- Name: codigos_descuento codigos_descuento_comercio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_descuento
    ADD CONSTRAINT codigos_descuento_comercio_id_fkey FOREIGN KEY (comercio_id) REFERENCES public.comercios_partners(id) ON DELETE CASCADE;


--
-- Name: codigos_descuento codigos_descuento_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_descuento
    ADD CONSTRAINT codigos_descuento_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: comentarios_fotos comentarios_fotos_foto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios_fotos
    ADD CONSTRAINT comentarios_fotos_foto_id_fkey FOREIGN KEY (foto_id) REFERENCES public.galeria_fotos(id) ON DELETE CASCADE;


--
-- Name: comentarios_fotos comentarios_fotos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios_fotos
    ADD CONSTRAINT comentarios_fotos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: descubrimientos descubrimientos_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.descubrimientos
    ADD CONSTRAINT descubrimientos_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares(id) ON DELETE CASCADE;


--
-- Name: descubrimientos descubrimientos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.descubrimientos
    ADD CONSTRAINT descubrimientos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: encuestas encuestas_reserva_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuestas
    ADD CONSTRAINT encuestas_reserva_id_fkey FOREIGN KEY (reserva_id) REFERENCES public.reservas_guia(id);


--
-- Name: escaneos_qr escaneos_qr_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escaneos_qr
    ADD CONSTRAINT escaneos_qr_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: estadisticas_eventos estadisticas_eventos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estadisticas_eventos
    ADD CONSTRAINT estadisticas_eventos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: eventos_diarios eventos_diarios_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_diarios
    ADD CONSTRAINT eventos_diarios_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.bancos_preguntas(id);


--
-- Name: eventos_diarios eventos_diarios_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_diarios
    ADD CONSTRAINT eventos_diarios_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES public.bancos_ubicaciones(id);


--
-- Name: eventos eventos_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares(id) ON DELETE CASCADE;


--
-- Name: galeria_fotos galeria_fotos_lugar_especial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galeria_fotos
    ADD CONSTRAINT galeria_fotos_lugar_especial_id_fkey FOREIGN KEY (lugar_especial_id) REFERENCES public.lugares_especiales(id) ON DELETE CASCADE;


--
-- Name: galeria_fotos galeria_fotos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galeria_fotos
    ADD CONSTRAINT galeria_fotos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: guardianes_anclados guardianes_anclados_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guardianes_anclados
    ADD CONSTRAINT guardianes_anclados_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: guias_conectados guias_conectados_guia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guias_conectados
    ADD CONSTRAINT guias_conectados_guia_id_fkey FOREIGN KEY (guia_id) REFERENCES public.usuarios(id);


--
-- Name: metricas_acceso metricas_acceso_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metricas_acceso
    ADD CONSTRAINT metricas_acceso_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares(id);


--
-- Name: metricas_acceso metricas_acceso_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metricas_acceso
    ADD CONSTRAINT metricas_acceso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: notificaciones_guardian notificaciones_guardian_guardian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones_guardian
    ADD CONSTRAINT notificaciones_guardian_guardian_id_fkey FOREIGN KEY (guardian_id) REFERENCES public.guardianes_anclados(id) ON DELETE CASCADE;


--
-- Name: notificaciones_guardian notificaciones_guardian_visitante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones_guardian
    ADD CONSTRAINT notificaciones_guardian_visitante_id_fkey FOREIGN KEY (visitante_id) REFERENCES public.usuarios(id);


--
-- Name: perfiles_guardian perfiles_guardian_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfiles_guardian
    ADD CONSTRAINT perfiles_guardian_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: progreso_eventos progreso_eventos_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso_eventos
    ADD CONSTRAINT progreso_eventos_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos_diarios(id);


--
-- Name: progreso_eventos progreso_eventos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso_eventos
    ADD CONSTRAINT progreso_eventos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: reservas_guia reservas_guia_guia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas_guia
    ADD CONSTRAINT reservas_guia_guia_id_fkey FOREIGN KEY (guia_id) REFERENCES public.usuarios(id);


--
-- Name: reservas_guia reservas_guia_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas_guia
    ADD CONSTRAINT reservas_guia_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares(id);


--
-- Name: reservas_guia reservas_guia_turista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas_guia
    ADD CONSTRAINT reservas_guia_turista_id_fkey FOREIGN KEY (turista_id) REFERENCES public.usuarios(id);


--
-- Name: usuario_insignias usuario_insignias_insignia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_insignias
    ADD CONSTRAINT usuario_insignias_insignia_id_fkey FOREIGN KEY (insignia_id) REFERENCES public.insignias(id) ON DELETE CASCADE;


--
-- Name: usuario_insignias usuario_insignias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_insignias
    ADD CONSTRAINT usuario_insignias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: usuarios_insignias usuarios_insignias_insignia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_insignias
    ADD CONSTRAINT usuarios_insignias_insignia_id_fkey FOREIGN KEY (insignia_id) REFERENCES public.insignias(id) ON DELETE CASCADE;


--
-- Name: usuarios_insignias usuarios_insignias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_insignias
    ADD CONSTRAINT usuarios_insignias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict VrDGgx0KdnrzPHPyv1drKdQeFsgXChgoaX0kpfHm5tzB8eBHGk7zNe4j2hrc9K9

