export interface IShoppingCar {
    id: number;
    isActive: boolean;
    userId: string;
    products: IShoppingCarProduct[];
}

interface IShoppingCarProduct {
    id: number;
    price: number;
    points: number;
    quantity: number;
    name: string;
    description: string;
    image: string;
    isPaidWithPoints: boolean;
}