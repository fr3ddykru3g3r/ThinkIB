export const isWdc = process.env.NEXT_PUBLIC_SITE_BRAND === 'wdc';
export const siteBrand = {
  name: isWdc ? 'WDC Learn' : 'The Archive',
  description: isWdc
    ? 'The World Debate Collective study library. IB resources, SAT practice, and competition maths.'
    : 'IB resources, SAT practice, and competition maths. Pick what you need and get back to studying.',
  url: isWdc ? 'https://learn.worlddebatecollective.org' : 'https://ibstuff28.vercel.app',
};

// Verified custom Firebase Hosting domain.
export const learnUrl = 'https://learn.worlddebatecollective.org/';
