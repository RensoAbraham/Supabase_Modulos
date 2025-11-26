-- Creación de las tablas base (Mínimo requerido)
CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    role text NOT NULL, -- La restricción CHECK se añade en 002
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);
-- Nota: La FK a auth.users se añade en 002 para evitar problemas de orden

CREATE TABLE public.categories (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    name text NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.products (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    name text NOT NULL,
    price numeric(10, 2), -- Usamos NUMERIC para precisión
    category_id bigint,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE public.sales_header (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    user_id uuid NOT NULL,
    total numeric(10, 2),
    payment_method text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sales_header_pkey PRIMARY KEY (id)
);

CREATE TABLE public.sales_detail (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    sale_id bigint,
    product_id bigint,
    quantity numeric(10, 3), -- Para peso (Kg)
    unit_price numeric(10, 2),
    subtotal numeric(10, 2),
    CONSTRAINT sales_detail_pkey PRIMARY KEY (id)
);

CREATE TABLE public.cash_movements (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    user_id uuid NOT NULL,
    type text,
    amount numeric(10, 2),
    note character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cash_movements_pkey PRIMARY KEY (id)
);

CREATE TABLE product_stock (
    product_id bigint NOT NULL,
    stock_quantity numeric(10, 3) NOT NULL DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    CONSTRAINT product_stock_pkey PRIMARY KEY (product_id)
);