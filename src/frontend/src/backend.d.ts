import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ProductId = bigint;
export interface Order {
    customerPrincipal: Principal;
    address: string;
    timestamp: bigint;
    items: Array<[Product, Quantity]>;
    phoneNumber: string;
    totalPrice: number;
}
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price: number;
}
export type Quantity = bigint;
export interface backendInterface {
    addToCart(productId: ProductId, quantity: Quantity): Promise<void>;
    createOrder(phoneNumber: string, address: string, items: Array<[Product, Quantity]>): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCartContents(): Promise<Array<[Product, Quantity]>>;
    getProduct(productId: ProductId): Promise<Product>;
    updateProductPrice(productId: ProductId, newPrice: number): Promise<void>;
    verifyAdminPassword(password: string): Promise<boolean>;
}
