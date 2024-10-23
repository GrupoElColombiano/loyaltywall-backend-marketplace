export interface Buy {
    moneyAmount: number;
    pointsAmount: number;
    data: User
}

interface User {
    id_user: string | null;
    names: string;
    email: string;
    lastName: string;
    phone: string;
    cedula: string;
    typo_de_documento: string;
    region: string;
    city: string;
    address: string;
    referenceAddress: string;
    zipCode: string;
    total: number;
    products: any[]; // You can replace `any[]` with a more specific type if needed
}