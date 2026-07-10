import { categorySlugToKey, translateCategory } from './translations';

export type ProviderCategoryFields = {
  serviceName?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  customServiceName?: string | null;
  /** Campo legacy; puede no venir en respuestas actuales de la API */
  category?: string | null;
};

/** Etiqueta visible de categoría/servicio del proveedor. */
export function getProviderCategoryLabel(provider: ProviderCategoryFields): string {
  if (provider.serviceName?.trim()) return provider.serviceName.trim();
  if (provider.customServiceName?.trim()) return provider.customServiceName.trim();
  if (provider.categoryName?.trim()) return provider.categoryName.trim();
  if (provider.category?.trim()) return translateCategory(provider.category);
  if (provider.categorySlug?.trim()) {
    return translateCategory(categorySlugToKey(provider.categorySlug));
  }
  return 'Servicio';
}

/** Clave para iconos/filtros legacy (ELECTRICIDAD, PLOMERIA, …). */
export function getProviderCategoryKey(provider: ProviderCategoryFields): string {
  if (provider.category?.trim()) return provider.category.trim().toUpperCase();
  if (provider.categorySlug?.trim()) return categorySlugToKey(provider.categorySlug);
  return '';
}
