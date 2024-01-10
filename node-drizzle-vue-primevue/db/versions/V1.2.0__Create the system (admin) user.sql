-----------------------------
-- Autor: Bruno Monteiro
-- Data: 23/12/2023
-----------------------------
-- Descrição: 
--  - Cria o usuário do sistema (adminstrador)
--
-- Objetos Impactados:
--  - Tabela: User
-----------------------------

INSERT INTO public."user" ("name", username, email, "password", active, avatar, cover, password_recovery_token, otp_secret, otp_uri, otp_enabled, otp_verified) 
VALUES(
	'System', --name
	'system', --username
	'system@email.com', --email
	'$2b$10$.U3sRzBr0Rd0ZN5MJI8VB.7FRF6yxbibvlXttyWpBGGuAhapqfqMa', --password - [open password]: 22LMQ4v$8PzK3TgkawBqiPeA
	true, --active
	'https://avatar.iran.liara.run/public/99', --avatar
	'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80', --cover
	NULL, --password_recovery_token
	NULL, --otp_secret
	NULL, --otp_uri
	false, --otp_enabled
	false --otp_verified
);