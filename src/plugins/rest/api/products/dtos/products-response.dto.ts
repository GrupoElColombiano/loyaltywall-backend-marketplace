export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    points: number;
    isInFavorite: boolean;
    isPaidWithPoints: boolean;
}

export interface FavoriteResponse extends ProductResponse {
    stock: number;
}