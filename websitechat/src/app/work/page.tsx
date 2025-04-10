import WorkItemSheet, { WorkItem } from '@/components/WorkItemSheet';

// Sample work item data (extracted from original divs)
const workItems: WorkItem[] = [
  {
    title: 'Automated CAD Modeling',
    context: 'Geiger @ Herman Miller',
    description: 'Led the development of automated CAD modeling systems, streamlining the product design process and reducing modeling time by 40%. Implemented advanced parametric design techniques and created custom automation scripts.'
  },
  {
    title: 'Manufacturing Optimization',
    context: 'Herman Miller',
    description: 'Spearheaded manufacturing process optimization initiatives, resulting in a 25% reduction in production time. Implemented lean manufacturing principles and developed innovative tooling solutions.'
  },
  {
    title: 'Product Innovation',
    context: 'Newell Brands',
    description: 'Led cross-functional teams in developing innovative consumer products. Successfully launched multiple product lines, managing the entire process from concept to manufacturing.'
  },
  {
    title: 'Technical Leadership',
    context: 'Various Companies',
    description: 'Demonstrated technical leadership across organizations, mentoring junior engineers and driving adoption of new technologies and methodologies in product development.'
  }
];

export default function Work() {
  return (
    <div className="min-h-screen pt-24 pb-8 px-4 md:px-8 flex flex-col items-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">My Work</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {workItems.map((item, index) => (
          <WorkItemSheet key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
