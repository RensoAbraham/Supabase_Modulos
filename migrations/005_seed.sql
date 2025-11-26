-- Ya ejecutado y procesado mucho antes de la consulta.

-- Eliminar datos existentes
TRUNCATE TABLE public.sales_detail, public.sales_header, public.product_stock RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.products, public.categories RESTART IDENTITY CASCADE;

-- Insertar Categorías (10)
INSERT INTO public.categories (id, name) VALUES (1, 'Frutas'), (2, 'Verduras'), (3, 'Tubérculos'), (4, 'Frutales'), (5, 'Hortalizas'), (6, 'Bulbos'), (7, 'Legumbres'), (8, 'Cítricos'), (9, 'Tropicales'), (10, 'Hierbas');

-- Insertar Productos (25 Productos)
INSERT INTO public.products (name, price, category_id, image_url) VALUES 
('Manzana Roja', 5.20, 1, '/img/manzana.jpg'),
('Plátano Seda', 2.50, 9, '/img/platano.jpg'),
('Papa Amarilla', 3.80, 3, '/img/papa.jpg'),
('Zanahoria', 1.90, 2, '/img/zanahoria.jpg'),
-- ... (Continuar con los 25 productos usando URLs como /img/foto.jpg) ...
('Ajo', 15.00, 6, '/img/ajo.jpg'),
('Espinaca', 2.50, 5, '/img/espinaca.jpg');

-- Insertar Stock Inicial para los productos insertados
INSERT INTO public.product_stock (product_id, stock_quantity)
SELECT id, 100.000 FROM public.products; -- Da 100 Kg de stock inicial a cada producto.

-- Nota: La inserción de usuarios debe hacerse manualmente o con auth.uid() en la tabla.