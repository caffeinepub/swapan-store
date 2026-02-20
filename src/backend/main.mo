import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

actor {
  public type ProductId = Nat;
  public type Quantity = Nat;
  public type CartId = Principal;
  public type Update = ?Text;

  public type Product = {
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

  public type ProductInput = {
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
  };

  public type Order = {
    customerPrincipal : Principal;
    phoneNumber : Text;
    address : Text;
    items : [(Product, Quantity)];
    totalPrice : Float;
    timestamp : Int;
  };

  var nextProductId = 1;
  var products = Map.empty<ProductId, Product>();
  let carts = Map.empty<CartId, Map.Map<ProductId, Quantity>>();
  var orders = List.empty<Order>();

  // Get a product by ID
  public query ({ caller }) func getProduct(productId : ProductId) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // get current nextProductId for frontend
  public query ({ caller }) func getNextProductId() : async ProductId {
    nextProductId;
  };

  // Get all products
  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Add product to cart
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

  // Remove a product from a cart
  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        if (not cart.containsKey(productId)) {
          Runtime.trap("Product not found in cart");
        };
        cart.remove(productId);
        carts.add(caller, cart); // Explicitly save updated cart
      };
    };
  };

  // Get cart contents
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

  // Update product price
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

  // Verify admin password
  public query ({ caller }) func verifyAdminPassword(password : Text) : async Bool {
    password == "anugou9995";
  };

  // Create order
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

  // Remove expired orders from the list
  func removeExpiredOrders() {
    let currentTime = Time.now();
    orders := orders.filter(
      func(order) {
        let elapsedTime = currentTime - order.timestamp;
        elapsedTime < 48 * 60 * 60 * 1_000_000_000; // 48 hours in nanoseconds
      }
    );
  };

  // Get all orders
  public query ({ caller }) func getAllOrders() : async [Order] {
    removeExpiredOrders();
    orders.toArray();
  };

  // *** NEW: Create Product ***
  public shared ({ caller }) func createProduct(
    name : Text, description : Text, price : Float, category : Text, imageUrl : Text
  ) : async ProductId {
    // Validate data
    if (name == "" or description == "" or category == "") { Runtime.trap("Name, description, and category cannot be empty") };
    if (price <= 0.0) { Runtime.trap("Price must be a positive number") };

    let productId = nextProductId;
    let newProduct : Product = {
      id = productId;
      name;
      description;
      price;
      category;
      imageUrl;
    };

    products.add(productId, newProduct);
    nextProductId += 1;

    productId; // Return the new product ID
  };

  // *** NEW: Create Multiple Products ***
  public shared ({ caller }) func createMultipleProducts(productsInput : [ProductInput]) : async () {
    for (productInput in productsInput.values()) {
      // Validate product input
      if (productInput.name == "" or productInput.description == "" or productInput.category == "") {
        Runtime.trap("Name, description, and category cannot be empty");
      };
      if (productInput.price <= 0.0) {
        Runtime.trap("Price must be a positive number");
      };

      let productId = nextProductId;
      let product : Product = {
        productInput with id = productId;
      };

      products.add(productId, product);
      nextProductId += 1;
    };
  };

  // *** NEW: Update Product (general, not just price) ***
  public shared ({ caller }) func updateProduct(
    productId : ProductId,
    name : Update,
    description : Update,
    price : ?Float,
    category : Update,
    imageUrl : Update,
  ) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          id = productId;
          name = switch (name) { case (null) { product.name }; case (?n) { n } };
          description = switch (description) { case (null) { product.description }; case (?d) { d } };
          price = switch (price) {
            case (null) { product.price };
            case (?p) {
              if (p <= 0.0) { Runtime.trap("Price must be a positive number") };
              p;
            };
          };
          category = switch (category) {
            case (null) { product.category };
            case (?c) { if (c == "") { Runtime.trap("Category cannot be empty") } else { c } };
          };
          imageUrl = switch (imageUrl) { case (null) { product.imageUrl }; case (?i) { i } };
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  // Add product directly to internal map
  public shared ({ caller }) func addProductDirectly(product : Product) : async () {
    products.add(product.id, product);
  };

  // Unsafe method for demo
  public shared ({ caller }) func incrementNextProductId(incrementBy : Nat) : async () {
    nextProductId += incrementBy;
  };

  // *** NEW: Delete Product ***
  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    products.remove(productId);
  };
};

