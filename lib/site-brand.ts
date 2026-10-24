export const isWdc = process.env.NEXT_PUBLIC_SITE_BRAND === 'wdc';
export const siteBrand = {
  name: isWdc ? 'WDC Learn' : 'The Archive',
  description: isWdc
    ? 'The World Debate Collective study library. IB resources, SAT practice, and competition maths.'
    : 'IB resources, SAT practice, and competition maths. Pick what you need and get back to studying.',
  url: isWdc ? 'https://prep.worlddebatecollective.org' : 'https://ibstuff28.vercel.app',
};

// Public fallback while the custom Namecheap DNS record is awaiting access.
export const learnUrl = 'https://worlddebatecollective-prep.web.app/';
