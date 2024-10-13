--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Homebrew)
-- Dumped by pg_dump version 14.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_percentage(); Type: FUNCTION; Schema: public; Owner: cfsbc
--

CREATE FUNCTION public.update_percentage() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only update if the score or test_id has changed
  IF NEW.score IS DISTINCT FROM OLD.score OR NEW.test_id IS DISTINCT FROM OLD.test_id THEN
    UPDATE user_test_results
    SET percentage = NEW.score::NUMERIC / (
        SELECT total_questions FROM tests WHERE tests.id = NEW.test_id
      ) * 100
    WHERE user_id = NEW.user_id
      AND test_id = NEW.test_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_percentage() OWNER TO cfsbc;

--
-- Name: update_total_questions(); Type: FUNCTION; Schema: public; Owner: cfsbc
--

CREATE FUNCTION public.update_total_questions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update the total_questions field in the tests table
    UPDATE tests
    SET total_questions = (
        SELECT COUNT(*) FROM questions WHERE test_id = NEW.test_id
    )
    WHERE id = NEW.test_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_total_questions() OWNER TO cfsbc;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: failed_questions; Type: TABLE; Schema: public; Owner: cfsbc
--

CREATE TABLE public.failed_questions (
    id integer NOT NULL,
    user_test_result_id integer,
    question_id integer,
    selected_answer text
);


ALTER TABLE public.failed_questions OWNER TO cfsbc;

--
-- Name: failed_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: cfsbc
--

CREATE SEQUENCE public.failed_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.failed_questions_id_seq OWNER TO cfsbc;

--
-- Name: failed_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cfsbc
--

ALTER SEQUENCE public.failed_questions_id_seq OWNED BY public.failed_questions.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: cfsbc
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    test_id integer,
    question_text text NOT NULL,
    answers json NOT NULL,
    correct_answer character varying(255) NOT NULL
);


ALTER TABLE public.questions OWNER TO cfsbc;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: cfsbc
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.questions_id_seq OWNER TO cfsbc;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cfsbc
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: test_results; Type: TABLE; Schema: public; Owner: cfsbc
--

CREATE TABLE public.test_results (
    id integer NOT NULL,
    user_id integer,
    test_type character varying(100) NOT NULL,
    score integer NOT NULL,
    passed boolean NOT NULL,
    completed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.test_results OWNER TO cfsbc;

--
-- Name: test_results_id_seq; Type: SEQUENCE; Schema: public; Owner: cfsbc
--

CREATE SEQUENCE public.test_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.test_results_id_seq OWNER TO cfsbc;

--
-- Name: test_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cfsbc
--

ALTER SEQUENCE public.test_results_id_seq OWNED BY public.test_results.id;


--
-- Name: tests; Type: TABLE; Schema: public; Owner: cfsbc
--

CREATE TABLE public.tests (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    display_order integer,
    total_questions integer DEFAULT 0
);


ALTER TABLE public.tests OWNER TO cfsbc;

--
-- Name: tests_id_seq; Type: SEQUENCE; Schema: public; Owner: cfsbc
--

CREATE SEQUENCE public.tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tests_id_seq OWNER TO cfsbc;

--
-- Name: tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cfsbc
--

ALTER SEQUENCE public.tests_id_seq OWNED BY public.tests.id;


--
-- Name: user_test_results; Type: TABLE; Schema: public; Owner: cfsbc
--

CREATE TABLE public.user_test_results (
    id integer NOT NULL,
    user_id integer,
    test_id integer,
    score integer NOT NULL,
    answers json NOT NULL,
    completed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    attempt_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    percentage numeric(5,2),
    time_spent integer,
    passed boolean,
    CONSTRAINT check_percentage_range CHECK (((percentage >= (0)::numeric) AND (percentage <= (100)::numeric)))
);


ALTER TABLE public.user_test_results OWNER TO cfsbc;

--
-- Name: user_test_results_id_seq; Type: SEQUENCE; Schema: public; Owner: cfsbc
--

CREATE SEQUENCE public.user_test_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_test_results_id_seq OWNER TO cfsbc;

--
-- Name: user_test_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cfsbc
--

ALTER SEQUENCE public.user_test_results_id_seq OWNED BY public.user_test_results.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: cfsbc
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    student_id character varying(20) NOT NULL,
    pin_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    is_admin boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO cfsbc;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: cfsbc
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO cfsbc;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cfsbc
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: failed_questions id; Type: DEFAULT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.failed_questions ALTER COLUMN id SET DEFAULT nextval('public.failed_questions_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: test_results id; Type: DEFAULT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.test_results ALTER COLUMN id SET DEFAULT nextval('public.test_results_id_seq'::regclass);


--
-- Name: tests id; Type: DEFAULT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.tests ALTER COLUMN id SET DEFAULT nextval('public.tests_id_seq'::regclass);


--
-- Name: user_test_results id; Type: DEFAULT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.user_test_results ALTER COLUMN id SET DEFAULT nextval('public.user_test_results_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: failed_questions failed_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.failed_questions
    ADD CONSTRAINT failed_questions_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: test_results test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_pkey PRIMARY KEY (id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: user_test_results user_test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.user_test_results
    ADD CONSTRAINT user_test_results_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_student_id_key; Type: CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_student_id_key UNIQUE (student_id);


--
-- Name: idx_student_id; Type: INDEX; Schema: public; Owner: cfsbc
--

CREATE INDEX idx_student_id ON public.users USING btree (student_id);


--
-- Name: idx_user_test_results; Type: INDEX; Schema: public; Owner: cfsbc
--

CREATE INDEX idx_user_test_results ON public.test_results USING btree (user_id);


--
-- Name: questions after_question_delete; Type: TRIGGER; Schema: public; Owner: cfsbc
--

CREATE TRIGGER after_question_delete AFTER DELETE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_total_questions();


--
-- Name: questions after_question_insert; Type: TRIGGER; Schema: public; Owner: cfsbc
--

CREATE TRIGGER after_question_insert AFTER INSERT ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_total_questions();


--
-- Name: user_test_results after_user_test_results_insert; Type: TRIGGER; Schema: public; Owner: cfsbc
--

CREATE TRIGGER after_user_test_results_insert AFTER INSERT OR UPDATE ON public.user_test_results FOR EACH ROW EXECUTE FUNCTION public.update_percentage();


--
-- Name: user_test_results calculate_percentage; Type: TRIGGER; Schema: public; Owner: cfsbc
--

CREATE TRIGGER calculate_percentage AFTER INSERT OR UPDATE ON public.user_test_results FOR EACH ROW EXECUTE FUNCTION public.update_percentage();


--
-- Name: failed_questions failed_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.failed_questions
    ADD CONSTRAINT failed_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: failed_questions failed_questions_user_test_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.failed_questions
    ADD CONSTRAINT failed_questions_user_test_result_id_fkey FOREIGN KEY (user_test_result_id) REFERENCES public.user_test_results(id);


--
-- Name: questions questions_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id);


--
-- Name: test_results test_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_test_results user_test_results_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.user_test_results
    ADD CONSTRAINT user_test_results_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id);


--
-- Name: user_test_results user_test_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cfsbc
--

ALTER TABLE ONLY public.user_test_results
    ADD CONSTRAINT user_test_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

