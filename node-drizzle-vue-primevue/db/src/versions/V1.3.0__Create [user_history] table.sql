-----------------------------
-- Autor: Bruno Monteiro
-- Data: 23/12/2023
-----------------------------
-- Descrição: 
--  - Cria a tabela de histórico de usuários
--
-- Objetos Impactados:
--  - Tabela: user_history
-----------------------------

CREATE TABLE public.user_history (
	user_history_id serial4 NOT NULL, -- User history id
	user_id int4 NOT NULL, -- Target user
	operator_id int4 NOT NULL, -- User operator
	created_at timestamp NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text), -- When it happened
	"event" varchar(64) NOT NULL, -- Event name
	"data" jsonb NULL, -- New record data (event data)
	CONSTRAINT user_history_pk PRIMARY KEY (user_history_id)
);
CREATE INDEX user_history_event_idx ON public.user_history USING btree (event);
CREATE INDEX user_history_operator_idx ON public.user_history USING btree (operator_id);
CREATE INDEX user_history_user_id_idx ON public.user_history USING btree (user_id);

COMMENT ON TABLE public.user_history IS 'Table for recording the history of operations in system user records';

-- Column comments

COMMENT ON COLUMN public.user_history.user_history_id IS 'User history id';
COMMENT ON COLUMN public.user_history.user_id IS 'Target user';
COMMENT ON COLUMN public.user_history.operator_id IS 'User operator';
COMMENT ON COLUMN public.user_history.created_at IS 'When it happened';
COMMENT ON COLUMN public.user_history."event" IS 'Event name';
COMMENT ON COLUMN public.user_history."data" IS 'New record data (event data)';


-- public.user_history foreign keys

ALTER TABLE public.user_history ADD CONSTRAINT operator_user_fk FOREIGN KEY (operator_id) REFERENCES public."user"(user_id);
ALTER TABLE public.user_history ADD CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES public."user"(user_id);