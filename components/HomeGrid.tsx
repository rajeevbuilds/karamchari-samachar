import type { Circular } from '@/lib/data';
import CircularsShowcase from './CircularsShowcase';
import SidebarWidgets from './SidebarWidgets';

export default function HomeGrid({ circulars }: { circulars: Circular[] }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div>
        <CircularsShowcase circulars={circulars} heading="Latest Circulars" viewAllHref="/circulars" />
      </div>
      <SidebarWidgets circulars={circulars} />
    </div>
  );
}
