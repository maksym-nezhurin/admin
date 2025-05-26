export interface ICar {
  id: string,
  ownerId: string,
  brand: string,
  complectation: string,
  engine: number,
  model: string,
  type: string,
  price: number,
  year: number,
  mileage: string | number,
  description: string;
  color?: string;
}

export type ICarFormModel = Omit<ICar, 'id' | 'ownerId'>