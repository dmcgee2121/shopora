-- Generated from src/data/products.js
-- Rerun `npm run generate:supabase-seed` when the mock catalog changes.

BEGIN;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('21348290-c27b-44dc-8562-916c92da98ff', 'Linen Blend Blazer', 'Ora Atelier', 'women', 'Blazers', 128, NULL, 'A softly tailored blazer with an easy drape and clean, versatile lines.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['XS', 'S', 'M', 'L']::text[], ARRAY['Oat', 'Sand']::text[], 4.8, 128, 7, TRUE, FALSE, 'WBL-1001', '55% linen, 45% rayon', 'Dry clean only. Steam lightly between wears.', 'Relaxed tailored fit', ARRAY['Single-breasted front', 'Light shoulder structure', 'Hip-length silhouette']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'WBL-1001');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'WBL-1001'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('5db7ca7c-89a1-49ad-aa3b-3a8c66333d3a', 'Pleated Midi Skirt', 'Ora Atelier', 'women', 'Bottoms', 74, NULL, 'A fluid pleated skirt designed for easy movement and day-to-night styling.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['XS', 'S', 'M', 'L', 'XL']::text[], ARRAY['Ivory', 'Taupe']::text[], 4.7, 84, 12, TRUE, FALSE, 'WSK-1002', '100% polyester', 'Machine wash cold on gentle cycle. Hang dry.', 'A-line fit', ARRAY['Soft pleats throughout', 'Elastic back waistband', 'Midi length']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'WSK-1002');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'WSK-1002'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('92e02feb-ca32-46dc-b9e5-1b201eac44db', 'Textured Knit Top', 'Ora Atelier', 'women', 'Tops', 48, 36, 'A refined knit top with a soft handfeel and polished everyday shape.', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['XS', 'S', 'M', 'L']::text[], ARRAY['Cream', 'Mocha']::text[], 4.6, 96, 18, FALSE, TRUE, 'WTP-1003', '60% cotton, 40% viscose', 'Machine wash cold. Lay flat to dry.', 'Regular fit', ARRAY['Textured knit finish', 'Easy crew neckline', 'Sits at the hip']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'WTP-1003');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'WTP-1003'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('ccf3588d-39e8-43ec-8159-40972e460aa6', 'Everyday Trench Coat', 'North & Main', 'women', 'Outerwear', 164, NULL, 'A lightweight trench with a timeless silhouette and soft structure.', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['S', 'M', 'L', 'XL']::text[], ARRAY['Taupe', 'Stone']::text[], 4.9, 52, 6, FALSE, FALSE, 'WOT-1004', 'Shell: 100% cotton', 'Dry clean recommended.', 'Relaxed fit', ARRAY['Self-tie waist belt', 'Button-front closure', 'Storm flap detail']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'WOT-1004');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'WOT-1004'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('f9b1d602-9b6b-430e-a245-6074211cfc18', 'Floral Midi Dress', 'Ora Atelier', 'women', 'Dresses', 96, 72, 'An easy midi dress with subtle print, soft movement, and a flattering fit.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['XS', 'S', 'M', 'L']::text[], ARRAY['Petal', 'Cream']::text[], 4.7, 142, 5, TRUE, TRUE, 'WDR-1005', '100% polyester', 'Machine wash cold. Line dry.', 'Relaxed fit', ARRAY['Flutter sleeves', 'Hidden side zip', 'Flowing midi skirt']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'WDR-1005');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'WDR-1005'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('8508a3bc-45e7-440e-b0a9-23297fbb572c', 'Wide Leg Trousers', 'North & Main', 'women', 'Bottoms', 88, NULL, 'Sharp, comfortable trousers with a modern wide-leg cut and smooth finish.', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['XS', 'S', 'M', 'L']::text[], ARRAY['Stone', 'Black']::text[], 4.5, 63, 13, FALSE, FALSE, 'WTR-1006', '68% polyester, 28% rayon, 4% spandex', 'Machine wash cold. Hang to dry.', 'Wide leg fit', ARRAY['Flat front', 'Side pockets', 'Full-length hem']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'WTR-1006');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'WTR-1006'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('498c29b0-9070-485a-9aaa-90cc5e833bbf', 'Performance Polo', 'Bridge & Co.', 'men', 'Tops', 54, NULL, 'A polished polo with breathable comfort and a clean athletic fit.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[], ARRAY['Heather Gray', 'Navy']::text[], 4.6, 74, 9, TRUE, FALSE, 'MTP-2001', '92% polyester, 8% spandex', 'Machine wash cold. Tumble dry low.', 'Regular fit', ARRAY['Breathable knit', 'Three-button placket', 'Short sleeve']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'MTP-2001');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'MTP-2001'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('bcb40560-95dc-4de1-9179-472f49b798cf', 'Modern Chino Pants', 'Bridge & Co.', 'men', 'Bottoms', 68, 54, 'A refined chino with a tailored leg and versatile all-day comfort.', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['30', '32', '34', '36', '38']::text[], ARRAY['Khaki', 'Olive']::text[], 4.7, 109, 11, FALSE, TRUE, 'MBT-2002', '98% cotton, 2% elastane', 'Machine wash cold. Hang dry.', 'Slim tapered fit', ARRAY['Flat front style', 'Hidden coin pocket', 'Tapered leg']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'MBT-2002');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'MBT-2002'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('0c4a5d0b-9247-42a3-b737-39ce8a8fdce3', 'Textured Overshirt', 'Bridge & Co.', 'men', 'Outerwear', 92, NULL, 'An easy layering overshirt with a soft texture and structured collar.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['S', 'M', 'L', 'XL']::text[], ARRAY['Camel', 'Charcoal']::text[], 4.5, 45, 4, TRUE, FALSE, 'MOT-2003', '100% cotton', 'Machine wash cold. Line dry.', 'Relaxed fit', ARRAY['Button front', 'Dual chest pockets', 'Layer-friendly weight']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'MOT-2003');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'MOT-2003'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('17d91940-ad4d-46b1-9b1b-4ce13fe05aab', 'Classic Oxford Shirt', 'Bridge & Co.', 'men', 'Shirts', 76, NULL, 'A crisp button-up that works under tailoring or on its own.', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[], ARRAY['White', 'Blue']::text[], 4.8, 88, 14, FALSE, FALSE, 'MSH-2004', '100% cotton', 'Machine wash warm. Tumble dry low.', 'Regular fit', ARRAY['Button-down collar', 'Single chest pocket', 'Rounded hem']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'MSH-2004');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'MSH-2004'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('c92d262d-78bf-4c64-b64d-d3a714f78af8', 'Tailored Blazer', 'Bridge & Co.', 'men', 'Blazers', 178, 139, 'A sharp tailored blazer that elevates workwear and special occasions.', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['38', '40', '42', '44']::text[], ARRAY['Charcoal', 'Navy']::text[], 4.9, 61, 8, FALSE, TRUE, 'MBL-2005', 'Shell: 70% polyester, 30% rayon', 'Dry clean only.', 'Tailored fit', ARRAY['Notched lapel', 'Two-button closure', 'Smooth lining']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'MBL-2005');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'MBL-2005'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('b587c556-efb4-4e99-b973-c828e927b279', 'Court Sneaker', 'Ora Shoes', 'shoes', 'Sneakers', 64, NULL, 'A clean everyday sneaker with a cushioned feel and timeless profile.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['7', '8', '9', '10', '11', '12']::text[], ARRAY['Cream', 'White']::text[], 4.8, 154, 10, TRUE, FALSE, 'SSH-3001', 'Leather upper, rubber sole', 'Spot clean with a soft cloth.', 'True to size', ARRAY['Cushioned footbed', 'Low profile sole', 'Lace-up front']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'SSH-3001');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'SSH-3001'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('9fe98f14-a4d6-4247-b14e-b84ffb5d7b32', 'Leather Loafer', 'Ora Shoes', 'shoes', 'Loafers', 118, 89, 'A polished loafer made to pair with tailored looks and denim alike.', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['7', '8', '9', '10', '11']::text[], ARRAY['Brown', 'Black']::text[], 4.7, 92, 5, FALSE, TRUE, 'SSL-3002', 'Leather upper, synthetic lining', 'Spot clean with leather conditioner.', 'True to size', ARRAY['Stacked heel', 'Apron toe', 'Slip-on design']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'SSL-3002');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'SSL-3002'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('e517fd59-d837-4d72-85cc-c3e97db24d3b', 'Ankle Boot', 'Ora Shoes', 'shoes', 'Boots', 138, NULL, 'A versatile ankle boot with a smooth finish and stable heel.', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['6', '7', '8', '9', '10']::text[], ARRAY['Chestnut', 'Black']::text[], 4.6, 77, 9, FALSE, FALSE, 'SBO-3003', 'Leather upper, rubber outsole', 'Spot clean with a soft cloth.', 'True to size', ARRAY['Inside zipper', 'Stacked heel', 'Rounded toe']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'SBO-3003');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'SBO-3003'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('9eaed9a4-f508-49f6-9c7f-f4b9975f2ae1', 'Minimal Heel', 'Ora Shoes', 'shoes', 'Heels', 96, 74, 'A sleek low heel with a balanced shape and occasion-ready polish.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['6', '7', '8', '9', '10']::text[], ARRAY['Nude', 'Black']::text[], 4.5, 58, 6, TRUE, TRUE, 'SHE-3004', 'Synthetic upper, rubber sole', 'Spot clean only.', 'True to size', ARRAY['Low block heel', 'Squared vamp', 'Comfort padded footbed']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'SHE-3004');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'SHE-3004'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('0e86e7e7-8b08-4af0-b3a4-3488bb363ef0', 'Structured Tote', 'Ora Accessories', 'accessories', 'Bags', 88, NULL, 'A refined carryall with enough room for the day''s essentials.', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['One Size']::text[], ARRAY['Tan', 'Black']::text[], 4.8, 71, 11, TRUE, FALSE, 'ATB-4001', 'Faux leather', 'Wipe clean with a damp cloth.', 'One size', ARRAY['Top handles', 'Interior pocket', 'Structured silhouette']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'ATB-4001');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1522312346375-2346c10df2e0?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'ATB-4001'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('b8b7d054-4a82-4174-b1d9-a35752012b4d', 'Chain Link Belt', 'Ora Accessories', 'accessories', 'Belts', 42, 32, 'A versatile belt with a subtle metal finish and elevated styling.', 'https://images.unsplash.com/photo-1522312346375-2346c10df2e0?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['S', 'M', 'L']::text[], ARRAY['Gold', 'Silver']::text[], 4.6, 46, 15, FALSE, TRUE, 'ABL-4002', 'Faux leather, alloy hardware', 'Wipe clean with a soft cloth.', 'Adjustable fit', ARRAY['Adjustable fit', 'Metal chain detail', 'Polished finish']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'ABL-4002');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1522312346375-2346c10df2e0?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'ABL-4002'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('143c0111-12f2-40bd-bf5f-bce39c35e3b2', 'Pearl Hoop Earrings', 'Ora Accessories', 'accessories', 'Jewelry', 36, NULL, 'A delicate jewelry piece designed for everyday wear and gifting.', 'https://images.unsplash.com/photo-1522312346375-2346c10df2e0?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['One Size']::text[], ARRAY['Pearl']::text[], 4.7, 31, 19, FALSE, FALSE, 'AJW-4003', 'Gold-tone metal, imitation pearl', 'Store in a dry place. Avoid contact with water and fragrance.', 'One size', ARRAY['Lightweight design', 'Pearl accent', 'Hinged closure']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AJW-4003');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1522312346375-2346c10df2e0?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'AJW-4003'
ORDER BY img.sort_order;

INSERT INTO public.products (id, name, brand, department, category, price, sale_price, description, image, sizes, colors, rating, review_count, stock_count, is_new, is_sale, sku, material, care, fit, details, shipping_note, return_note)
VALUES ('a71c4bad-7bf0-428f-b55e-f6337e9a5abd', 'Sunglass Set', 'Ora Accessories', 'accessories', 'Sunglasses', 54, 41, 'Easy, polished sunglasses with a modern frame and soft finish.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&h=1125&q=80', ARRAY['One Size']::text[], ARRAY['Tortoise', 'Black']::text[], 4.5, 24, 8, TRUE, TRUE, 'ASG-4004', 'Acetate frame, polycarbonate lenses', 'Store in case and clean lenses with a microfiber cloth.', 'One size', ARRAY['UV protection', 'Lightweight frame', 'Includes protective pouch']::text[], 'Ships within 1-2 business days.', 'Returns accepted within 30 days in original condition.')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  department = EXCLUDED.department,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  material = EXCLUDED.material,
  care = EXCLUDED.care,
  fit = EXCLUDED.fit,
  details = EXCLUDED.details,
  shipping_note = EXCLUDED.shipping_note,
  return_note = EXCLUDED.return_note;

DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'ASG-4004');

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, img.image_url, img.sort_order
FROM public.products p
JOIN (VALUES
    (0, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&h=1125&q=80'),
    (1, 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&h=1125&q=80'),
    (2, 'https://images.unsplash.com/photo-1522312346375-2346c10df2e0?auto=format&fit=crop&w=900&h=1125&q=80')
) AS img(sort_order, image_url) ON TRUE
WHERE p.sku = 'ASG-4004'
ORDER BY img.sort_order;

COMMIT;
