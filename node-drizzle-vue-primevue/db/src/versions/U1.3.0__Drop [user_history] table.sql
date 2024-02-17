-----------------------------
-- Autor: Bruno Monteiro
-- Data: 23/12/2023
-----------------------------
-- Descrição: 
--  - Script de desfazimento da versão 1.3.0
--  - Apaga a tabela user_history
--
-- Objetos Impactados:
--  - Tabela: user_history
-----------------------------

drop table public.user_history;
