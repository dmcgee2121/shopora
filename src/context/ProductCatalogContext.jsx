import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { products as seedProducts } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { idsMatch, normalizeId } from '../utils/idUtils';
import { normalizeProductFromSupabase, productToSupabasePayload } from '../utils/productMappers';

// Demo-only catalog state lives in localStorage for now and will later move to backend services.
const ProductCatalogContext = createContext(null);
const CATALOG_KEY = 'shopora_product_catalog_v1';
const CATALOG_READ_TIMEOUT_MS = 10000;
const CATALOG_SOURCE = {
  LOCAL: 'local',
  SUPABASE: 'supabase',
  FALLBACK: 'fallback',
  EMPTY: 'empty',
};
const CATALOG_LOAD_STATE = {
  LOADING: 'loading',
  LOADED_SUPABASE: 'loaded-supabase',
  LOADED_FALLBACK: 'loaded-fallback',
  FALLBACK_AFTER_ERROR: 'fallback-after-error',
  EMPTY: 'empty',
};

function normalizeProduct(product) {
  const safeProduct = product && typeof product === 'object' ? product : {};
  const images = Array.isArray(safeProduct.images) && safeProduct.images.length ? safeProduct.images : [];
  const primaryImage = safeProduct.image ?? images[0] ?? '';

  return {
    ...safeProduct,
    id: normalizeId(safeProduct.id),
    image: primaryImage,
    images: images.length ? images : primaryImage ? [primaryImage] : [],
    salePrice: safeProduct.salePrice ? Number(safeProduct.salePrice) : null,
    price: Number(safeProduct.price ?? 0),
    rating: Number(safeProduct.rating ?? 0),
    reviewCount: Number(safeProduct.reviewCount ?? 0),
    stockCount: Number(safeProduct.stockCount ?? 0),
    sizes: Array.isArray(safeProduct.sizes) ? safeProduct.sizes : [],
    colors: Array.isArray(safeProduct.colors) ? safeProduct.colors : [],
    details: Array.isArray(safeProduct.details) ? safeProduct.details : [],
    isNew: Boolean(safeProduct.isNew),
    isSale: Boolean(safeProduct.isSale),
    brand: safeProduct.brand ?? 'ShopOra',
    sku: safeProduct.sku ?? '',
    material: safeProduct.material ?? '',
    care: safeProduct.care ?? '',
    fit: safeProduct.fit ?? '',
    shippingNote: safeProduct.shippingNote ?? '',
    returnNote: safeProduct.returnNote ?? '',
  };
}

function readCatalog() {
  if (typeof window === 'undefined') return seedProducts.map(normalizeProduct);

  try {
    const raw = window.localStorage.getItem(CATALOG_KEY);
    if (!raw) return seedProducts.map(normalizeProduct);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeProduct) : seedProducts.map(normalizeProduct);
  } catch {
    return seedProducts.map(normalizeProduct);
  }
}

function writeCatalog(products) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CATALOG_KEY, JSON.stringify(products));
}

function warnCatalogFallback(reason, details = {}) {
  if (!import.meta.env.DEV) return;
  console.warn('ShopOra catalog fallback:', { reason, ...details });
}

function createProductId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `local-prod-${stamp}-${random}`;
}

function groupImagesByProductId(rows = []) {
  return rows.reduce((map, row) => {
    const productId = normalizeId(row?.product_id);
    if (!productId) return map;

    const current = map.get(productId) ?? [];
    current.push(row);
    map.set(productId, current);
    return map;
  }, new Map());
}

function getCleanErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;
  if (typeof error === 'string') return error;
  if (error.name === 'AbortError') return 'Supabase catalog request timed out.';
  return error.message ?? fallbackMessage;
}

function createLocalProduct(product) {
  return normalizeProduct({
    ...(product && typeof product === 'object' ? product : {}),
    id: product?.id ?? createProductId(),
    images:
      Array.isArray(product?.images) && product.images.length ? product.images : product?.image ? [product.image] : [],
  });
}

function createMutationError(error) {
  return new Error(
    getCleanErrorMessage(
      error,
      'Unable to update the catalog right now. If Supabase is configured, check table permissions and RLS.',
    ),
  );
}

function normalizeCatalogFromLocalStorage() {
  return readCatalog();
}

function getCatalogLoadState(catalogSource, isCatalogLoading, catalogError) {
  if (isCatalogLoading) return CATALOG_LOAD_STATE.LOADING;
  if (catalogSource === CATALOG_SOURCE.SUPABASE) return CATALOG_LOAD_STATE.LOADED_SUPABASE;
  if (catalogSource === CATALOG_SOURCE.FALLBACK && catalogError) return CATALOG_LOAD_STATE.FALLBACK_AFTER_ERROR;
  if (catalogSource === CATALOG_SOURCE.EMPTY) return CATALOG_LOAD_STATE.EMPTY;
  return CATALOG_LOAD_STATE.LOADED_FALLBACK;
}

export function ProductCatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(() => normalizeCatalogFromLocalStorage());
  const [catalogSource, setCatalogSource] = useState(CATALOG_SOURCE.LOCAL);
  const [isCatalogLoading, setIsCatalogLoading] = useState(Boolean(isSupabaseConfigured && supabase));
  const [catalogError, setCatalogError] = useState('');
  const [isCatalogSaving, setIsCatalogSaving] = useState(false);
  const [catalogMutationError, setCatalogMutationError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (catalogSource === CATALOG_SOURCE.EMPTY) return;
    writeCatalog(catalog);
  }, [catalog, catalogSource]);

  const clearCatalogMutationError = useCallback(() => {
    setCatalogMutationError('');
  }, []);

  const setSavingState = useCallback((saving) => {
    if (mountedRef.current) {
      setIsCatalogSaving(saving);
    }
  }, []);

  const setMutationError = useCallback((error) => {
    if (mountedRef.current) {
      setCatalogMutationError(createMutationError(error).message);
    }
  }, []);

  const loadLocalCatalog = useCallback(() => {
    const nextCatalog = normalizeCatalogFromLocalStorage();
    setCatalog(nextCatalog);
    setCatalogSource(nextCatalog.length ? CATALOG_SOURCE.LOCAL : CATALOG_SOURCE.EMPTY);
    setCatalogError('');
    setIsCatalogLoading(false);
    return nextCatalog;
  }, []);

  const refreshProducts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      return loadLocalCatalog();
    }

    setIsCatalogLoading(true);
    let timeoutId;

    try {
      const readPromise = Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('product_images').select('*').order('sort_order', { ascending: true }),
      ]);
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Supabase catalog request timed out.')), CATALOG_READ_TIMEOUT_MS);
      });

      const [{ data: productsData, error: productsError }, { data: imagesData, error: imagesError }] =
        await Promise.race([readPromise, timeoutPromise]);
      clearTimeout(timeoutId);

      if (productsError) throw productsError;
      if (imagesError) throw imagesError;
      if (!Array.isArray(productsData)) {
        throw new Error('The live catalog returned an unexpected product response.');
      }
      if (imagesData != null && !Array.isArray(imagesData)) {
        throw new Error('The live catalog returned an unexpected image response.');
      }

      const imagesByProductId = groupImagesByProductId(imagesData ?? []);
      const nextCatalog = (productsData ?? [])
        .map((row) => normalizeProductFromSupabase(row, imagesByProductId.get(normalizeId(row.id)) ?? []))
        .filter(Boolean);

      if (!nextCatalog.length) {
        const fallbackCatalog = normalizeCatalogFromLocalStorage();

        if (fallbackCatalog.length) {
          warnCatalogFallback('live-catalog-empty', {
            fallbackCount: fallbackCatalog.length,
          });

          if (mountedRef.current) {
            setCatalog(fallbackCatalog);
            setCatalogSource(CATALOG_SOURCE.FALLBACK);
            setCatalogError('');
            setIsCatalogLoading(false);
          }

          return fallbackCatalog;
        }

        if (mountedRef.current) {
          setCatalog([]);
          setCatalogSource(CATALOG_SOURCE.EMPTY);
          setCatalogError('');
          setIsCatalogLoading(false);
        }

        return [];
      }

      if (mountedRef.current) {
        setCatalog(nextCatalog);
        setCatalogSource(CATALOG_SOURCE.SUPABASE);
        setCatalogError('');
        setIsCatalogLoading(false);
      }

      return nextCatalog;
    } catch (error) {
      if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
      const nextCatalog = normalizeCatalogFromLocalStorage();
      const message = getCleanErrorMessage(error, 'Live catalog unavailable.');

      warnCatalogFallback('live-catalog-read-failed', {
        fallbackCount: nextCatalog.length,
        message,
      });

      if (mountedRef.current) {
        setCatalog(nextCatalog);
        setCatalogSource(nextCatalog.length ? CATALOG_SOURCE.FALLBACK : CATALOG_SOURCE.EMPTY);
        setCatalogError(nextCatalog.length ? message : 'No catalog products are available.');
        setIsCatalogLoading(false);
      }

      return nextCatalog;
    }
  }, [loadLocalCatalog]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      loadLocalCatalog();
      return undefined;
    }

    void refreshProducts();
    return undefined;
  }, [loadLocalCatalog, refreshProducts]);

  const usingSupabase = catalogSource === CATALOG_SOURCE.SUPABASE && Boolean(supabase);
  const catalogLoadState = getCatalogLoadState(catalogSource, isCatalogLoading, catalogError);

  const runMutation = useCallback(
    async (mutation) => {
      setSavingState(true);
      clearCatalogMutationError();

      try {
        const result = await mutation();
        setSavingState(false);
        return result;
      } catch (error) {
        setSavingState(false);
        const cleanError = createMutationError(error);
        setMutationError(cleanError);
        throw cleanError;
      }
    },
    [clearCatalogMutationError, setMutationError, setSavingState],
  );

  const addProduct = useCallback(
    (product) => {
      return runMutation(async () => {
        if (!usingSupabase) {
          const nextProduct = createLocalProduct(product);
          setCatalog((current) => [nextProduct, ...current]);
          return nextProduct;
        }

        const draftProduct = createLocalProduct(product);
        const { product: productPayload } = productToSupabasePayload(draftProduct, draftProduct.id);
        const { data: insertedProduct, error: insertError } = await supabase
          .from('products')
          .insert(productPayload)
          .select('*')
          .single();

        if (insertError) throw insertError;

        const draftImages = Array.isArray(draftProduct.images) ? draftProduct.images : [];
        if (draftImages.length) {
          const imageRows = draftImages.map((imageUrl, index) => ({
            product_id: normalizeId(insertedProduct.id),
            image_url: imageUrl,
            sort_order: index,
          }));
          const { error: imagesError } = await supabase.from('product_images').insert(imageRows);
          if (imagesError) throw imagesError;
        }

        await refreshProducts();
        return insertedProduct;
      });
    },
    [refreshProducts, runMutation, usingSupabase],
  );

  const updateProduct = useCallback(
    (id, updates) => {
      return runMutation(async () => {
        if (!usingSupabase) {
          setCatalog((current) => {
            const nextCatalog = current.map((product) =>
              idsMatch(product.id, id) ? normalizeProduct({ ...product, ...updates, id }) : product,
            );
            return nextCatalog;
          });
          return true;
        }

        const currentProduct = catalog.find((product) => idsMatch(product.id, id));
        if (!currentProduct) {
          throw new Error('The product could not be found.');
        }

        const nextProduct = createLocalProduct({ ...currentProduct, ...updates, id: currentProduct.id });
        const { product: productPayload } = productToSupabasePayload(nextProduct, nextProduct.id);

        const { error: updateError } = await supabase.from('products').update(productPayload).eq('id', currentProduct.id);
        if (updateError) throw updateError;

        const { error: deleteImagesError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', currentProduct.id);
        if (deleteImagesError) throw deleteImagesError;

        const imageRows = Array.isArray(nextProduct.images)
          ? nextProduct.images.map((imageUrl, index) => ({
              product_id: currentProduct.id,
              image_url: imageUrl,
              sort_order: index,
            }))
          : [];

        if (imageRows.length) {
          const { error: insertImagesError } = await supabase.from('product_images').insert(imageRows);
          if (insertImagesError) throw insertImagesError;
        }

        await refreshProducts();
        return true;
      });
    },
    [catalog, refreshProducts, runMutation, usingSupabase],
  );

  const deleteProduct = useCallback(
    (id) => {
      return runMutation(async () => {
        if (!usingSupabase) {
          setCatalog((current) => current.filter((product) => !idsMatch(product.id, id)));
          return true;
        }

        const { error } = await supabase.from('products').delete().eq('id', normalizeId(id));
        if (error) throw error;

        await refreshProducts();
        return true;
      });
    },
    [refreshProducts, runMutation, usingSupabase],
  );

  const resetCatalog = useCallback(() => {
    if (usingSupabase) {
      const message = 'Reset catalog is available for local demo mode only.';
      setMutationError(new Error(message));
      return false;
    }

    return runMutation(() => {
      const nextCatalog = seedProducts.map(normalizeProduct);
      setCatalog(nextCatalog);
      setCatalogSource(nextCatalog.length ? CATALOG_SOURCE.LOCAL : CATALOG_SOURCE.EMPTY);
      setCatalogError('');
      return nextCatalog;
    });
  }, [runMutation, setMutationError, usingSupabase]);

  const value = useMemo(
    () => ({
      products: catalog,
      catalogSource,
      catalogLoadState,
      isCatalogLoading,
      catalogError,
      isCatalogSaving,
      catalogMutationError,
      clearCatalogMutationError,
      refreshProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      resetCatalog,
    }),
    [
      catalog,
      catalogSource,
      catalogLoadState,
      isCatalogLoading,
      catalogError,
      isCatalogSaving,
      catalogMutationError,
      clearCatalogMutationError,
      refreshProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      resetCatalog,
    ],
  );

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    throw new Error('useProductCatalog must be used within a ProductCatalogProvider');
  }
  return context;
}
