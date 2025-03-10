export default function About() {
  const companies = [

    {
      name: "Cisco",
      logo: "/Cisco.png",
      period: "2024 - 2024"
    },
    {
      name: "Herman Miller",
      logo: "/HermanMiller.png",
      period: "2019 - 2023"
    },
    {
        name: "Newell Brands",
        logo: "/NewellBrands.png",
        period: "2015 - 2019"
      }
    // Add more companies as needed
  ];

  return (
    <div className="min-h-[calc(100dvh-6rem)] h-[calc(100dvh-6rem)] p-8 bg-gray-50 overflow-hidden">
      <div className="max-w-4xl w-full mx-auto h-full">
        <div className="flex flex-col md:flex-row gap-8 h-full">
          <div className="md:sticky md:top-8 h-fit">
            <div className="w-60 h-100 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
              <img
                src="/Headshot.jpg"
                alt="Russell Apple"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            <div className="prose max-w-2xl text-left">
              <h1 className="text-3xl font-bold mb-6">Russell Apple</h1>
              <p>
              Product development engineer with 10 years of experience driving innovation in manufacturing and 
              consumer products at companies like Cisco, Herman Miller, and Newell Brands. Proven track record of 
              leading complex technical projects, from automated CAD modeling to production optimization, while 
              collaborating across engineering and business teams. 
              </p>
              <p>
              Currently pursuing my MBA at Georgia Tech's 
              Scheller College of Business (Class of 2025), with a focus on Strategy & Innovation and 
              Management of Information Resources. Passionate about leveraging my mechanical engineering 
              background and business acumen to drive product strategy and technological innovation. 
              Open to discussing product management, strategy, and technical leadership roles.
              </p>
            </div>
            
            <div className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">Previous Companies</h2>
              <div className="grid grid-cols-1 gap-4">
                {companies.map((company, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4"
                  >
                    <div className="w-60 h-16 flex-shrink-0">
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{company.name}</h3>
                      <p className="text-gray-600">{company.period}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
