export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendiente',
    'NEGOTIATION': 'En negociación',
    'ACCEPTED': 'Aceptada',
    'IN_PROGRESS': 'En proceso',
    'COMPLETED': 'Completada',
    'CANCELLED': 'Cancelada',
    'EXPIRED': 'Expirada',
  };
  return statusMap[status] || status;
}

export function translateCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'ELECTRICIDAD': 'Electricidad',
    'PLOMERIA': 'Plomería',
    'LIMPIEZA': 'Limpieza',
    'CARPINTERIA': 'Carpintería',
    'PINTURA': 'Pintura',
    'JARDINERIA': 'Jardinería',
    'CERRAJERIA': 'Cerrajería',
    'AIRE_ACONDICIONADO': 'Aire acondicionado',
    'OTHER': 'Otro servicio',
  };
  return categoryMap[category] || category.replace('_', ' ');
}

export function translateRole(role: string): string {
  const roleMap: Record<string, string> = {
    'ADMIN': 'Administrador',
    'CLIENT': 'Cliente',
    'PROVIDER': 'Proveedor',
  };
  return roleMap[role] || role;
}
