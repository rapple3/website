export default function About() {
  const companies = [
    { name: "Cisco", logo: "/Cisco.png", period: "Summer 2024" },
    { name: "Herman Miller", logo: "/HermanMiller.png", period: "2019 - 2023" },
    { name: "Newell Brands", logo: "/NewellBrands.png", period: "2015 - 2019" },
  ];

  // The "spec sheet". Edit freely.
  const specs = [
    ["Day job", "Derivatives analyst"],
    ["Previous model", "Mechanical engineer"],
    ["Primary transport", "Bicycle"],
    ["Current build", "Pantry + mudroom cabinets"],
    ["Crew", "Young kids"],
    ["Sleep", "Limited"],
    ["Team", "Georgia Tech (it's been a year)"],
    ["Strong opinions", "Bike lanes, transit, stroads"],
  ];

  return (
    <div className="grid gap-8 md:grid-cols-[16rem_minmax(0,1fr)] items-start">
      <div className="w-48 md:w-full mx-auto md:sticky md:top-28">
        <div className="rounded-xl border-2 border-ink shadow-hard overflow-hidden bg-white">
          <img src="/Headshot_small.jpg" alt="Russell Apple" className="w-full object-cover" />
          <p className="label text-center py-2 border-t-2 border-ink">Fig. 1: The author</p>
        </div>
      </div>

      <div>
        <p className="label mb-2 text-ink/60">About</p>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Russell Apple</h1>

        <div className="mt-5 space-y-4 text-lg text-ink/85 max-w-2xl">
          <p>
            I&apos;m a derivatives analyst at a regional bank. I got here the long way around: about ten
            years as a mechanical and product engineer at places like Herman Miller and Newell Brands, then
            an MBA at Georgia Tech, then a jump into finance.
          </p>
          <p>
            Outside of work I&apos;m a dad, a serial home-improvement tinkerer (currently building cabinets
            for the pantry and mudroom), and an amateur photographer. I bike most places and will happily talk
            your ear off about bike lanes, transit, and making Atlanta more walkable. Georgia Tech football
            fan, which this year mostly means being disappointed.
          </p>
        </div>

        <h2 className="font-display font-bold text-2xl mt-10 mb-3">Spec sheet</h2>
        <dl className="rounded-xl border-2 border-ink bg-white shadow-hard overflow-hidden divide-y-2 divide-ink/10">
          {specs.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-4 py-2.5">
              <dt className="label text-ink/60 self-center">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <h2 className="font-display font-bold text-2xl mt-10 mb-3">Previous stops</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {companies.map((company) => (
            <li key={company.name} className="rounded-xl border-2 border-ink bg-white p-4 flex flex-col items-center text-center">
              <div className="w-full h-12">
                <img src={company.logo} alt={`${company.name} logo`} className="w-full h-full object-contain" />
              </div>
              <p className="font-medium mt-3">{company.name}</p>
              <p className="label text-ink/60">{company.period}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
