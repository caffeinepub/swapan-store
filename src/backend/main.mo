import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Migration "migration";

(with migration = Migration.run)
actor {
  type ProductId = Nat;
  type Quantity = Nat;
  type CartId = Principal;

  type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  type Order = {
    customerPrincipal : Principal;
    phoneNumber : Text;
    address : Text;
    items : [(Product, Quantity)];
    totalPrice : Float;
    timestamp : Int;
  };

  let productJson = [
    (
      1,
      "Turmeric Powder",
      "Premium quality turmeric powder",
      2.5,
      "Indian Masalas",
      "https://example.com/images/turmeric.jpg",
    ),
    (
      2,
      "Cumin Powder",
      "100% pure cumin powder",
      3.0,
      "Indian Masalas",
      "https://example.com/images/cumin.jpg",
    ),
    (
      3,
      "Garam Masala",
      "Authentic garam masala blend",
      4.0,
      "Indian Masalas",
      "https://example.com/images/garammasala.jpg",
    ),
    (
      4,
      "Red Chili Powder",
      "Spicy red chili powder",
      2.8,
      "Indian Masalas",
      "https://example.com/images/redchili.jpg",
    ),
    (
      5,
      "Basmati Rice",
      "Long grain basmati rice",
      10.0,
      "Groceries",
      "https://example.com/images/rice.jpg",
    ),
    (
      6,
      "Yellow Lentils",
      "Premium yellow lentils",
      6.0,
      "Groceries",
      "https://example.com/images/lentils.jpg",
    ),
    (
      7,
      "Wheat Flour",
      "High quality wheat flour",
      5.5,
      "Groceries",
      "https://example.com/images/flour.jpg",
    ),
    (
      8,
      "Chickpeas",
      "Best quality chickpeas",
      4.5,
      "Groceries",
      "https://example.com/images/chickpeas.jpg",
    ),
    (
      9,
      "Mustard Oil",
      "Pure cold-pressed mustard oil",
      8.0,
      "Food Oils",
      "https://example.com/images/mustardoil.jpg",
    ),
    (
      10,
      "Coconut Oil",
      "Virgin coconut oil",
      7.5,
      "Food Oils",
      "https://example.com/images/coconutoil.jpg",
    ),
    (
      11,
      "Sunflower Oil",
      "High quality sunflower oil",
      6.8,
      "Food Oils",
      "https://example.com/images/sunfloweroil.jpg",
    ),
    (
      12,
      "Sesame Oil",
      "Premium sesame oil",
      9.0,
      "Food Oils",
      "https://example.com/images/sesameoil.jpg",
    ),
  ];

  let products = Map.fromIter<Nat, Product>(
    productJson.values().map(
      func((id, name, description, price, category, imageUrl)) {
        (
          id,
          {
            id;
            name;
            description;
            price;
            category;
            imageUrl;
          },
        );
      }
    )
  );

  let carts = Map.empty<CartId, Map.Map<ProductId, Quantity>>();
  let orders = List.empty<Order>();

  public query ({ caller }) func getProduct(productId : ProductId) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Quantity) : async () {
    if (not products.containsKey(productId)) {
      Runtime.trap("Product does not exist");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Map.empty<ProductId, Quantity>() };
      case (?cart) { cart };
    };

    let currentQuantity = switch (cart.get(productId)) {
      case (null) { 0 };
      case (?qty) { qty };
    };
    cart.add(productId, currentQuantity + quantity);

    carts.add(caller, cart);
  };

  public query ({ caller }) func getCartContents() : async [(Product, Quantity)] {
    let cart = switch (carts.get(caller)) {
      case (null) {
        Map.empty<ProductId, Quantity>();
      };
      case (?cart) { cart };
    };
    let productsWithQuantities = List.empty<(Product, Quantity)>();

    for ((productId, quantity) in cart.entries()) {
      let product = switch (products.get(productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?product) { product };
      };
      productsWithQuantities.add((product, quantity));
    };

    productsWithQuantities.toArray();
  };

  public shared ({ caller }) func updateProductPrice(productId : ProductId, newPrice : Float) : async () {
    if (newPrice <= 0) {
      Runtime.trap("Price must be a positive number");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          product with price = newPrice;
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  public query ({ caller }) func verifyAdminPassword(password : Text) : async Bool {
    password == "anugou9995";
  };

  public shared ({ caller }) func createOrder(phoneNumber : Text, address : Text, items : [(Product, Quantity)]) : async () {
    let totalPrice = items.foldLeft(0.0, func(acc, (product, quantity)) { acc + (product.price * quantity.toFloat()) });
    let newOrder : Order = {
      customerPrincipal = caller;
      phoneNumber;
      address;
      items;
      totalPrice;
      timestamp = Time.now();
    };
    orders.add(newOrder);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.toArray();
  };
};
