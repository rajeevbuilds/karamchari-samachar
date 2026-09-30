import { redirect } from 'next/navigation';

// There is no calculators index of its own — the Calculators section page
// lists every tool.
export default function CalculatorsIndexPage() {
  redirect('/section/calculators');
}
