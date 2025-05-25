export interface ICar {
  _id: string,
  ownerId: string,
  complectation: string,
  engine: number,
  model: string,
  type: string,
  price: number,
  year: number,
  mileage: string | number,
  description: string;
}