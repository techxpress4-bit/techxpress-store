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

function makeCartKey(productId: string, variantKey?: string, option?: AbonnementOption) {
  return `${productId}:${variantKey ?? ""}:${option ?? ""}`;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAdded: Product | null;
  lastAddedVariantNom?: string;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; optionAbonnement?: AbonnementOption; variantKey?: string; variantNom?: string; variantPrix?: number }
  | { type: "REMOVE_ITEM"; cartKey: string }
  | { type: "UPDATE_QUANTITY"; cartKey: string; quantity: number }
  | { type: "UPDATE_OPTION"; cartKey: string; optionAbonnement: AbonnementOption }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_MODAL"; product: Product; variantNom?: string }
  | { type: "CLOSE_MODAL" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const cartKey = makeCartKey(action.product._id, action.variantKey, action.optionAbonnement);
      const existing = state.items.find((i) => i.cartKey === cartKey);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            cartKey,
            product: action.product,
            quantity: 1,
            optionAbonnement: action.optionAbonnement,
            variantKey: action.variantKey,
            variantNom: action.variantNom,
            variantPrix: action.variantPrix,
          },
        ],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.cartKey !== action.cartKey) };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.cartKey !== action.cartKey) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartKey === action.cartKey ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "UPDATE_OPTION":
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartKey === action.cartKey ? { ...i, optionAbonnement: action.optionAbonnement } : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "OPEN_MODAL":
      return { ...state, isOpen: true, lastAdded: action.product, lastAddedVariantNom: action.variantNom };
    case "CLOSE_MODAL":
      return { ...state, isOpen: false };
    case "HYDRATE":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

const initialState: CartState = { items: [], isOpen: false, lastAdded: null };

interface CartContextValue extends CartState {
  addItem: (product: Product, optionAbonnement?: AbonnementOption, variantKey?: string, variantNom?: string, variantPrix?: number) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  updateOption: (cartKey: string, optionAbonnement: AbonnementOption) => void;
  clearCart: () => void;
  openModal: (product: Product, variantNom?: string) => void;
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
      if (stored) dispatch({ type: "HYDRATE", items: JSON.parse(stored) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("tx-cart", JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback(
    (product: Product, optionAbonnement?: AbonnementOption, variantKey?: string, variantNom?: string, variantPrix?: number) =>
      dispatch({ type: "ADD_ITEM", product, optionAbonnement, variantKey, variantNom, variantPrix }),
    []
  );
  const removeItem = useCallback(
    (cartKey: string) => dispatch({ type: "REMOVE_ITEM", cartKey }),
    []
  );
  const updateQuantity = useCallback(
    (cartKey: string, quantity: number) => dispatch({ type: "UPDATE_QUANTITY", cartKey, quantity }),
    []
  );
  const updateOption = useCallback(
    (cartKey: string, optionAbonnement: AbonnementOption) =>
      dispatch({ type: "UPDATE_OPTION", cartKey, optionAbonnement }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const openModal = useCallback(
    (product: Product, variantNom?: string) => dispatch({ type: "OPEN_MODAL", product, variantNom }),
    []
  );
  const closeModal = useCallback(() => dispatch({ type: "CLOSE_MODAL" }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => {
    let unitPrice: number;
    if (i.variantPrix !== undefined) {
      unitPrice = i.variantPrix;
    } else {
      const today = new Date().toISOString().split("T")[0];
      const promoActive =
        !!i.product.prixPromo &&
        i.product.prixPromo < i.product.prix &&
        (!i.product.dateFinPromo || i.product.dateFinPromo >= today);
      const prixBase = promoActive ? i.product.prixPromo! : i.product.prix;
      unitPrice =
        i.optionAbonnement === "box-abonnement" && i.product.prixAvecAbonnement
          ? i.product.prixAvecAbonnement
          : prixBase;
    }
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
