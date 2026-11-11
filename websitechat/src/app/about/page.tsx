export default function About() {
  const companies = [
    {
      name: "Cisco",
      logo: "/Cisco.png",
      period: "Summer 2024"
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
    <div className="pt-6">
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
                I&apos;m a derivatives analyst at a regional bank. I got here the long way around: about ten
                years as a mechanical and product engineer at places like Herman Miller and Newell Brands, then
                an MBA at Georgia Tech, then a jump into finance.
              </p>
              <p className="text-sm md:text-base">
                Outside of work I&apos;m a dad, a serial home-improvement tinkerer (currently building cabinets
                for the pantry and mudroom), and an amateur photographer. I bike most places and will happily talk
                your ear off about bike lanes, transit, and making Atlanta more walkable. Georgia Tech football
                fan, which this year mostly means being disappointed.
              </p>
            </div>
            
            <div className="space-y-4 mt-6 md:mt-8">
              <h2 className="text-xl md:text-2xl font-semibold">Before This</h2>
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