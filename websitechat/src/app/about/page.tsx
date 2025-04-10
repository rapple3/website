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
    <div className="min-h-[calc(100dvh-6rem)] p-4 md:p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Profile image - remove h-fit to allow stretching, keep width and sticky */}
          <div className="flex justify-center md:justify-start md:sticky md:top-8 w-40 md:w-60 flex-shrink-0">
            {/* Use w-full, remove fixed height, change rounded-full to rounded-lg */}
            <div className="w-full overflow-hidden flex-shrink-0 bg-gray-200 rounded-lg">
              <img
                src="/Headshot_small.jpg"
                alt="Russell Apple"
                // Ensure h-full so the image fills the stretched container
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Content section */}
          <div className="flex-grow">
            <div className="prose max-w-full text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center md:text-left">Russell Apple</h1>
              <p className="text-sm md:text-base">
                Product development engineer with 10 years of experience driving innovation in manufacturing and 
                consumer products at companies like Cisco, Herman Miller, and Newell Brands. Proven track record of 
                leading complex technical projects, from automated CAD modeling to production optimization, while 
                collaborating across engineering and business teams.
              </p>
              <p className="text-sm md:text-base">
                Currently pursuing my MBA at Georgia Tech's 
                Scheller College of Business (Class of 2025), with a focus on Strategy & Innovation and 
                Management of Information Resources. Passionate about leveraging my mechanical engineering 
                background and business acumen to drive product strategy and technological innovation. 
                Open to discussing product management, strategy, and technical leadership roles.
              </p>
            </div>
            
            <div className="space-y-4 mt-6 md:mt-8">
              <h2 className="text-xl md:text-2xl font-semibold">Previous Companies</h2>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {companies.map((company, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-4 md:p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-2 md:gap-4"
                  >
                    <div className="w-40 md:w-60 h-12 md:h-16 flex-shrink-0">
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center sm:text-left mt-2 sm:mt-0">
                      <h3 className="text-lg md:text-xl font-medium">{company.name}</h3>
                      <p className="text-gray-600 text-sm md:text-base">{company.period}</p>
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