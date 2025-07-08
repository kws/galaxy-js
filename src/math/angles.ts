export const TWO_PI = Math.PI * 2;

export const randomAngle = () => {
  return Math.random() * TWO_PI;
};

export const randomAngleInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};
