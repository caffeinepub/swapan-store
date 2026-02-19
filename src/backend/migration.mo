import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
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

  type OldActor = {
    products : Map.Map<ProductId, Product>;
    carts : Map.Map<CartId, Map.Map<ProductId, Quantity>>;
  };

  type Order = {
    customerPrincipal : Principal;
    phoneNumber : Text;
    address : Text;
    items : [(Product, Quantity)];
    totalPrice : Float;
    timestamp : Int;
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
    carts : Map.Map<CartId, Map.Map<ProductId, Quantity>>;
    orders : List.List<Order>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      orders = List.empty<Order>();
    };
  };
};
