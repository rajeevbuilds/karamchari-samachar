// Redirects to the login page if the session cookie has expired mid-session,
// instead of leaving the admin stuck looking at a silently failed request.
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }
  return res;
}
