-----------------------------
-- Autor: Bruno Monteiro
-- Data: 23/12/2023
-----------------------------
-- Descrição: 
--  - Cria a tabela User
--
-- Objetos Impactados:
--  - Tabela: User
---------------------------

CREATE TABLE public."user" (
	user_id serial4 NOT NULL, -- User id
	"name" varchar(32) NOT NULL, -- User name
	username varchar(32) NOT NULL, -- Username
	"password" varchar(256) NOT NULL, -- User password hash
	active bool NOT NULL DEFAULT true, -- User activation status
	avatar varchar(512) NULL, -- User avatar (image url)
	cover varchar(512) NULL, -- User page cover (image url)
	email varchar(128) NOT NULL, -- User email
	password_recovery_token varchar(256) NULL, -- Password recovery token
	otp_secret varchar(32) NULL, -- OTP secret
	otp_uri varchar(256) NULL, -- OTP uri
	otp_enabled bool NOT NULL DEFAULT false,
	otp_verified bool NOT NULL DEFAULT false, -- OTP verification flag
	CONSTRAINT user_pk PRIMARY KEY (user_id),
	CONSTRAINT username_un UNIQUE (username),
	CONSTRAINT email_un UNIQUE (email)
);

COMMENT ON TABLE public."user" IS 'Table for registering system users';

COMMENT ON COLUMN public."user".user_id IS 'User id';
COMMENT ON COLUMN public."user"."name" IS 'User name';
COMMENT ON COLUMN public."user".username IS 'Username';
COMMENT ON COLUMN public."user"."password" IS 'User password hash';
COMMENT ON COLUMN public."user".active IS 'User activation status';
COMMENT ON COLUMN public."user".avatar IS 'User avatar (image url)';
COMMENT ON COLUMN public."user".cover IS 'User page cover (image url)';
COMMENT ON COLUMN public."user".email IS 'User email';
COMMENT ON COLUMN public."user".password_recovery_token IS 'Password recovery token';
COMMENT ON COLUMN public."user".otp_secret IS 'OTP secret';
COMMENT ON COLUMN public."user".otp_uri IS 'OTP uri';
COMMENT ON COLUMN public."user".otp_verified IS 'OTP verification flag';