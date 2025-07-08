import { Galaxy, Star } from '../astro';

/**
 * Iterates over all stars in the simulation.
 * @param func - A function to call for each star.
 */
export const allStars = (
  galaxies: Galaxy[],
  func: (star: Star, galaxy: Galaxy, index: number) => void,
) => {
  for (const galaxy of galaxies) {
    for (let i = 0; i < galaxy.stars.length; i++) {
      func(galaxy.stars[i], galaxy, i);
    }
  }
};

/**
 * Counts the total number of stars in the simulation.
 * @param galaxies - The galaxies to count stars in.
 * @returns The total number of stars.
 */
export const starCount = (galaxies: Galaxy[]) => {
  return galaxies.reduce((acc, galaxy) => acc + galaxy.stars.length, 0);
};
