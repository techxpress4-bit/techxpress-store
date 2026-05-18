"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem, Product, AbonnementOption } from "@/lib/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAdded: Product | null;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; optionAbonnement?: AbonnementOption }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "UPDATE_OPTION"; productId: string; optionAbonnement: AbonnementOption }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_MODAL"; product: Product }
  | { type: "CLOSE_MODAL" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) =>
          i.product._id === action.product._id &&
          i.optionAbonnement === action.optionAbonnement
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product._id === action.product._id &&
            i.optionAbonnement === action.optionAbonnement
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.product,
            quantity: 1,
            optionAbonnement: action.optionAbonnement,
          },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product._id !== action.productId),
      };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product._id !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product._id === action.productId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    case "UPDATE_OPTION":
      return {
        ...state,
        items: state.items.map((i) =>
          i.product._id === action.productId
            ? { ...i, optionAbonnement: action.optionAbonnement }
            : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "OPEN_MODAL":
      return { ...state, isOpen: true, lastAdded: action.product };
    case "CLOSE_MODAL":
      return { ...state, isOpen: false };
    case "HYDRATE":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  lastAdded: null,
};

interface CartContextValue extends CartState {
  addItem: (product: Product, optionAbonnement?: AbonnementOption) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateOption: (productId: string, optionAbonnement: AbonnementOption) => void;
  clearCart: () => void;
  openModal: (product: Product) => void;
  closeModal: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tx-cart");
      if (stored) {
        dispatch({ type: "HYDRATE", items: JSON.parse(stored) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("tx-cart", JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback(
    (product: Product, optionAbonnement?: AbonnementOption) =>
      dispatch({ type: "ADD_ITEM", product, optionAbonnement }),
    []
  );
  const removeItem = useCallback(
    (productId: string) => dispatch({ type: "REMOVE_ITEM", productId }),
    []
  );
  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
    []
  );
  const updateOption = useCallback(
    (productId: string, optionAbonnement: AbonnementOption) =>
      dispatch({ type: "UPDATE_OPTION", productId, optionAbonnement }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const openModal = useCallback(
    (product: Product) => dispatch({ type: "OPEN_MODAL", product }),
    []
  );
  const closeModal = useCallback(() => dispatch({ type: "CLOSE_MODAL" }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => {
    const unitPrice =
      i.optionAbonnement === "box-abonnement" && i.product.prixAbonnement
        ? i.product.prixAbonnement
        : i.product.prix;
    return sum + unitPrice * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        updateOption,
        clearCart,
        openModal,
        closeModal,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
