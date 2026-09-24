import { loginAction } from '../actions';

export const metadata = {
  title: 'Admin Login',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink mb-6">Admin Login</h1>
      <form action={loginAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="password" className="block text-sm text-ink/70 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
        </div>
        {error && <p className="text-sm text-red-600">Incorrect password. Try again.</p>}
        <button
          type="submit"
          className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
