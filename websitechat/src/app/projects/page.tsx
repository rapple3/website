import ProjectSheet, { Project } from '@/components/ProjectSheet';

// Add a project by adding an entry here. To show a photo, put the file in
// /public and set `image: "/your-photo.jpg"`.
const projects: Project[] = [
  {
    title: 'Pantry cabinets',
    category: 'Woodwork',
    status: 'In progress',
    tone: 'meh',
    summary: 'Built-in cabinets for the pantry, because store-bought would have been too easy.',
    details: 'Custom built-in cabinets for the pantry. Photos and the full build story will show up here once there is more cabinet than sawdust.',
  },
  {
    title: 'Mudroom cabinets',
    category: 'Woodwork',
    status: 'In progress',
    tone: 'meh',
    summary: 'A place for shoes, bags and everything else that currently lives on the floor.',
    details: 'Built-ins for the mudroom, running in parallel with the pantry because apparently one project at a time is not enough.',
  },
  {
    title: 'This website',
    category: 'Software',
    status: 'Never done',
    tone: 'good',
    summary: 'A personal site with an AI version of me on the front page. What could go wrong.',
    details: 'Started life as a job-search portfolio. Now it is a place for projects, notes and a chatbot that answers questions as me, with roughly my level of sarcasm.',
  },
  {
    title: 'Airline chatbot',
    category: 'Software',
    status: 'Shipped',
    tone: 'good',
    summary: 'An AI customer service agent for a simulated airline, built for my Georgia Tech MBA.',
    details: 'A class project exploring how AI could handle airline customer service: finding and booking flights, changes, cancellations, and knowing when to hand off to a human. There is a longer write-up in Notes.',
    link: { href: 'https://bolt-airline.vercel.app/', label: 'Try the demo' },
  },
];

export default function Projects() {
  return (
    <div>
      <p className="label mb-2 text-ink/60">Sheet 1 of 1 · Not to scale</p>
      <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Projects</h1>
      <p className="mt-3 mb-8 max-w-2xl text-lg text-ink/80">
        Things I&apos;m building, have built, or have confidently started.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <ProjectSheet key={project.title} project={project} number={index + 1} />
        ))}
      </div>
    </div>
  );
}
