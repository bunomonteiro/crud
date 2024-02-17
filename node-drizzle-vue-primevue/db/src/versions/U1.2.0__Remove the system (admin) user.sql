-----------------------------
-- Autor: Bruno Monteiro
-- Data: 23/12/2023
-----------------------------
-- Descrição: 
--  - Script de desfazimento da versão 1.2.0
--  - Apaga o usuário do sistema (adminstrador)
--
-- Objetos Impactados:
--  - Tabela: User
-----------------------------

DELETE FROM public."user" WHERE username='system';
