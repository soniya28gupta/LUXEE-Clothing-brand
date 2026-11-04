import { NextRequest } from 'next/server';

export type AppRole = 'admin' | 'staff' | 'customer' | 'unknown';

export function getRequestRole(request: NextRequest): AppRole {
  const candidates = [
    request.headers.get('x-user-role'),
    request.headers.get('x-user-name'),
    request.headers.get('x-user-email')
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const value = candidate.trim().toLowerCase();
    if (!value) continue;
    if (value.includes('admin')) return 'admin';
    if (value.includes('staff')) return 'staff';
    if (value.includes('customer')) return 'customer';
  }

  return 'unknown';
}

export function isAllowed(request: NextRequest, allowedRoles: AppRole[]): boolean {
  const role = getRequestRole(request);
  if (role === 'unknown') return false;
  return allowedRoles.includes(role);
}
