export default function Gallery() {
  const projects = [
    {
      title: "CAD Automation System",
      description: "Advanced parametric design system developed at Geiger",
      image: "/project-cad.jpg",
      tags: ["Automation", "CAD", "Python"]
    },
    {
      title: "Manufacturing Process Flow",
      description: "Optimized production line layout at Herman Miller",
      image: "/project-manufacturing.jpg",
      tags: ["Lean", "Process Design", "Optimization"]
    },
    {
      title: "Product Design Innovation",
      description: "Consumer product development at Newell Brands",
      image: "/project-product.jpg",
      tags: ["Design", "Innovation", "Consumer Products"]
    },
    {
      title: "Technical Documentation",
      description: "Comprehensive system documentation and guides",
      image: "/project-docs.jpg",
      tags: ["Documentation", "Technical Writing"]
    },
    {
      title: "Team Leadership",
      description: "Leading cross-functional engineering teams",
      image: "/project-leadership.jpg",
      tags: ["Leadership", "Team Management"]
    },
    {
      title: "Innovation Workshop",
      description: "Facilitating innovation sessions and workshops",
      image: "/project-workshop.jpg",
      tags: ["Innovation", "Facilitation"]
    }
  ];

  return (
    <div className="min-h-[calc(100dvh-6rem)] h-[calc(100dvh-6rem)] p-8 flex flex-col items-center bg-gray-50">
      <div className="max-w-6xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-2">Project Gallery</h1>
        <p className="text-gray-600 mb-8">A showcase of my engineering and product development work</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  [Project Visual]
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
