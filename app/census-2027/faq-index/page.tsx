import { redirect } from 'next/navigation';

// Merged into /census-2027/faq (single FAQ page, no duplicate questions).
// Kept as a redirect so any existing link/bookmark to this URL still works.
export default function CensusFaqIndexRedirect() {
  redirect('/census-2027/faq');
}
