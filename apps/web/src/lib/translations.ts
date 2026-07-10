/** Convierte slug de categoría (electricidad) a clave legacy (ELECTRICIDAD). */
export function categorySlugToKey(slug?: string | null): string {
  if (!slug?.trim()) return '';
  return slug.trim().toUpperCase().replace(/-/g, '_');
}

export function translateStatus(status?: string | null): string {
  if (!status) return 'Desconocido';

  const statusMap: Record<string, string> = {
    PENDING: 'Pendiente',
    NEGOTIATION: 'En negociación',
    ACCEPTED: 'Aceptada',
    IN_PROGRESS: 'En proceso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    EXPIRED: 'Expirada',
  };
  return statusMap[status] ?? status;
}

export function translateCategory(category?: string | null): string {
  if (!category?.trim()) return 'Servicio';

  const normalized = category.trim().toUpperCase();
  const categoryMap: Record<string, string> = {
    ELECTRICIDAD: 'Electricidad',
    PLOMERIA: 'Plomería',
    LIMPIEZA: 'Limpieza',
    CARPINTERIA: 'Carpintería',
    PINTURA: 'Pintura',
    JARDINERIA: 'Jardinería',
    CERRAJERIA: 'Cerrajería',
    AIRE_ACONDICIONADO: 'Aire acondicionado',
    OTHER: 'Otro servicio',
    OTRO_SERVICIO: 'Otro servicio',
  };

  if (categoryMap[normalized]) return categoryMap[normalized];

  // Nombre legible desde slug o clave con guiones bajos
  if (normalized.includes('_')) {
    return normalized.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return category.trim();
}

export function translateRole(role?: string | null): string {
  if (!role) return 'Usuario';

  const roleMap: Record<string, string> = {
    ADMIN: 'Administrador',
    CLIENT: 'Cliente',
    PROVIDER: 'Proveedor',
    SUPPORT: 'Soporte',
  };
  return roleMap[role] ?? role;
}
