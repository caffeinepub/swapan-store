import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price: number;
}
export interface ProductInput {
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price: number;
}
export type ProductId = bigint;
export interface Order {
    customerPrincipal: Principal;
    address: string;
    timestamp: bigint;
    items: Array<[Product, Quantity]>;
    phoneNumber: string;
    totalPrice: number;
}
export type Update = string | null;
export type Quantity = bigint;
export interface backendInterface {
    addProductDirectly(product: Product): Promise<void>;
    addToCart(productId: ProductId, quantity: Quantity): Promise<void>;
    createMultipleProducts(productsInput: Array<ProductInput>): Promise<void>;
    createOrder(phoneNumber: string, address: string, items: Array<[Product, Quantity]>): Promise<void>;
    createProduct(name: string, description: string, price: number, category: string, imageUrl: string): Promise<ProductId>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCartContents(): Promise<Array<[Product, Quantity]>>;
    getNextProductId(): Promise<ProductId>;
    getProduct(productId: ProductId): Promise<Product>;
    incrementNextProductId(incrementBy: bigint): Promise<void>;
    removeFromCart(productId: ProductId): Promise<void>;
    updateProduct(productId: ProductId, name: Update, description: Update, price: number | null, category: Update, imageUrl: Update): Promise<void>;
    updateProductPrice(productId: ProductId, newPrice: number): Promise<void>;
    verifyAdminPassword(password: string): Promise<boolean>;
}
