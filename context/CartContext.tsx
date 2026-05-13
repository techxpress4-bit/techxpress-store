"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product, AbonnementOption } from "@/lib/types";
import { getItemPrice } from "@/lib/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAdded: CartItem | null;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; optionAbonnement?: AbonnementOption }
  | { type: "REMOVE_ITEM"; productId: string; optionAbonnement?: AbonnementOption }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number; optionAbonnement?: AbonnementOption }
  | { type: "UPDATE_OPTION"; productId: string; fromOption?: AbonnementOption; toOption: AbonnementOption }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_MODAL"; item: CartItem }
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
          { product: action.product, quantity: 1, optionAbonnement: action.optionAbonnement },
        ],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) =>
            !(i.product._id === action.productId &&
              i.optionAbonnement === action.optionAbonnement)
        ),
      };

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) =>
              !(i.product._id === action.productId &&
                i.optionAbonnement === action.optionAbonnement)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product._id === action.productId &&
          i.optionAbonnement === action.optionAbonnement
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }

    case "UPDATE_OPTION": {
      const source = state.items.find(
        (i) =>
          i.product._id === action.productId &&
          i.optionAbonnement === action.fromOption
      );
      const target = state.items.find(
        (i) =>
          i.product._id === action.productId &&
          i.optionAbonnement === action.toOption
      );
      if (target && source) {
        // Target option already exists → merge quantity, remove source
        return {
          ...state,
          items: state.items
            .filter(
              (i) =>
                !(i.product._id === action.productId &&
                  i.optionAbonnement === action.fromOption)
            )
            .map((i) =>
              i.product._id === action.productId &&
              i.optionAbonnement === action.toOption
                ? { ...i, quantity: i.quantity + (source.quantity) }
                : i
            ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product._id === action.productId &&
          i.optionAbonnement === action.fromOption
            ? { ...i, optionAbonnement: action.toOption }
            : i
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "OPEN_MODAL":
      return { ...state, isOpen: true, lastAdded: action.item };

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
  hydrated: boolean;
  addItem: (product: Product, optionAbonnement?: AbonnementOption) => void;
  removeItem: (productId: string, optionAbonnement?: AbonnementOption) => void;
  updateQuantity: (productId: string, quantity: number, optionAbonnement?: AbonnementOption) => void;
  updateOption: (productId: string, fromOption: AbonnementOption | undefined, toOption: AbonnementOption) => void;
  clearCart: () => void;
  openModal: (item: CartItem) => void;
  closeModal: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tx-cart");
      if (stored) dispatch({ type: "HYDRATE", items: JSON.parse(stored) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("tx-cart", JSON.stringify(state.items));
    }
  }, [state.items, hydrated]);

  const addItem = useCallback(
    (product: Product, optionAbonnement?: AbonnementOption) =>
      dispatch({ type: "ADD_ITEM", product, optionAbonnement }),
    []
  );
  const removeItem = useCallback(
    (productId: string, optionAbonnement?: AbonnementOption) =>
      dispatch({ type: "REMOVE_ITEM", productId, optionAbonnement }),
    []
  );
  const updateQuantity = useCallback(
    (productId: string, quantity: number, optionAbonnement?: AbonnementOption) =>
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity, optionAbonnement }),
    []
  );
  const updateOption = useCallback(
    (productId: string, fromOption: AbonnementOption | undefined, toOption: AbonnementOption) =>
      dispatch({ type: "UPDATE_OPTION", productId, fromOption, toOption }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const openModal = useCallback(
    (item: CartItem) => dispatch({ type: "OPEN_MODAL", item }),
    []
  );
  const closeModal = useCallback(() => dispatch({ type: "CLOSE_MODAL" }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, i) => sum + getItemPrice(i) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        ...state,
        hydrated,
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
