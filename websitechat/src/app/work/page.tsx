export default function Work() {
  return (
    <div className="min-h-[calc(100dvh-6rem)] h-[calc(100dvh-6rem)] p-8 flex flex-col items-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">My Work</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Automated CAD Modeling</h2>
          <div className="text-sm text-gray-500 mb-3">Geiger @ Herman Miller</div>
          <p className="text-gray-600">
            Led the development of automated CAD modeling systems, streamlining the product design process
            and reducing modeling time by 40%. Implemented advanced parametric design techniques and
            created custom automation scripts.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Manufacturing Optimization</h2>
          <div className="text-sm text-gray-500 mb-3">Herman Miller</div>
          <p className="text-gray-600">
            Spearheaded manufacturing process optimization initiatives, resulting in a 25% reduction in
            production time. Implemented lean manufacturing principles and developed innovative tooling solutions.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Product Innovation</h2>
          <div className="text-sm text-gray-500 mb-3">Newell Brands</div>
          <p className="text-gray-600">
            Led cross-functional teams in developing innovative consumer products. Successfully launched
            multiple product lines, managing the entire process from concept to manufacturing.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Technical Leadership</h2>
          <div className="text-sm text-gray-500 mb-3">Various Companies</div>
          <p className="text-gray-600">
            Demonstrated technical leadership across organizations, mentoring junior engineers and
            driving adoption of new technologies and methodologies in product development.
          </p>
        </div>
      </div>
    </div>
  );
}
