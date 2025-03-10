export default function Blog() {
  return (
    <div className="min-h-[calc(100dvh-6rem)] h-[calc(100dvh-6rem)] p-8 flex flex-col items-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="space-y-8 max-w-2xl w-full">
        <article className="prose bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-semibold mb-2">The Future of Automated CAD in Product Development</h2>
          <p className="text-gray-500 mb-4">March 5, 2024</p>
          <p>
            As we advance in the era of AI and automation, the role of CAD systems in product development is
            evolving rapidly. Drawing from my experience at Geiger, I explore how automated modeling systems
            are revolutionizing the way we approach product design and engineering.
          </p>
          <a href="#" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">Read more →</a>
        </article>
        <article className="prose bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-semibold mb-2">Lean Manufacturing in the Digital Age</h2>
          <p className="text-gray-500 mb-4">February 20, 2024</p>
          <p>
            Reflecting on my time at Herman Miller, I discuss how traditional lean manufacturing principles
            are being enhanced by digital technologies. Learn about the intersection of time-tested
            methodologies and modern innovations in production optimization.
          </p>
          <a href="#" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">Read more →</a>
        </article>
        <article className="prose bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-semibold mb-2">MBA Insights: Technology Strategy in Manufacturing</h2>
          <p className="text-gray-500 mb-4">February 1, 2024</p>
          <p>
            Currently pursuing my MBA at Georgia Tech, I share insights on how business strategy and
            technological innovation intersect in modern manufacturing. Exploring cases from my experience
            and current studies in Strategy & Innovation.
          </p>
          <a href="#" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">Read more →</a>
        </article>
      </div>
    </div>
  );
}
