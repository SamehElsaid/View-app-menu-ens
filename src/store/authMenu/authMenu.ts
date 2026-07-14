import { MenuItem, MenuInfo, MenuCustomizations, Category, Delivery, MenuBranch } from "@/types/menu";
import { Ad } from "@/types/Ad";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { MenuCatalogMeta } from "@/types/menuCatalog";
import { mergeMenuItemsById } from "@/lib/menuItemNormalize";
import { sortMenuItemsForDisplay } from "@/lib/menuCategoryOrder";

export type DistanceDeliveryContext = {
  branchId: number;
  lat: number;
  lng: number;
  areaNameAr?: string;
  areaNameEn?: string;
};

export type DeliveryContextState = {
  /** User dismissed delivery modal (browse-only mode) */
  browseOnly: boolean;
  distance: DistanceDeliveryContext | null;
  governorateId: number | null;
};

const initialDeliveryContext: DeliveryContextState = {
  browseOnly: false,
  distance: null,
  governorateId: null,
};

type MenuState = {
  menu: MenuItem[] | null;
  menuInfo: MenuInfo | null;
  theme: string | null;
  ads: Ad[] | null;
  menuCustomizations: MenuCustomizations | null;
  categories: Category[] | null;
  delivery: Delivery | null;
  branches: MenuBranch[];
  catalog: MenuCatalogMeta | null;
  /** In-memory delivery location; resets on page refresh */
  deliveryContext: DeliveryContextState;
  /** true once UseDispatchMenu has finished its first dispatch cycle */
  menuLoaded: boolean;
};
const initialState: MenuState = {
  menu: null,
  menuInfo: null,
  theme: null,
  ads: null,
  menuCustomizations: null,
  categories: null,
  delivery: null,
  branches: [],
  catalog: null,
  deliveryContext: initialDeliveryContext,
  menuLoaded: false,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    SET_ACTIVE_MENU: (state, action: PayloadAction<MenuItem[]>) => {
      state.menu = action.payload;
    },
    SET_MENU_INFO: (state, action: PayloadAction<MenuInfo>) => {
      state.menuInfo = action.payload;
      state.theme = action.payload.theme;
    },
    SET_ADS: (state, action: PayloadAction<Ad[]>) => {
      state.ads = action.payload;
    },
    SET_THEME: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    SET_MENU_CUSTOMIZATIONS: (
      state,
      action: PayloadAction<MenuCustomizations>
    ) => {
      state.menuCustomizations = action.payload;
    },
    SET_CATEGORIES: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    SET_CATALOG_META: (state, action: PayloadAction<MenuCatalogMeta | null>) => {
      state.catalog = action.payload;
    },
    APPEND_MENU_ITEMS: (state, action: PayloadAction<MenuItem[]>) => {
      if (!action.payload.length) return;
      const merged = mergeMenuItemsById(state.menu ?? [], action.payload);
      state.menu = sortMenuItemsForDisplay(merged, state.categories ?? undefined);
    },
    SET_DELIVERY: (state, action: PayloadAction<Delivery | null>) => {
      state.delivery = action.payload;
    },
    SET_BRANCHES: (state, action: PayloadAction<MenuBranch[]>) => {
      state.branches = action.payload;
    },
    SET_DELIVERY_DISTANCE: (
      state,
      action: PayloadAction<DistanceDeliveryContext>,
    ) => {
      state.deliveryContext = {
        browseOnly: false,
        distance: action.payload,
        governorateId: null,
      };
    },
    SET_DELIVERY_GOVERNORATE: (state, action: PayloadAction<number>) => {
      state.deliveryContext = {
        browseOnly: false,
        distance: null,
        governorateId: action.payload,
      };
    },
    SET_DELIVERY_BROWSE_ONLY: (state) => {
      state.deliveryContext = {
        browseOnly: true,
        distance: null,
        governorateId: null,
      };
    },
    /** Reset delivery session (e.g. table QR mode takes over). */
    CLEAR_DELIVERY_CONTEXT: (state) => {
      state.deliveryContext = initialDeliveryContext;
    },
    REMOVE_MENU: (state) => {
      state.menu = null;
      state.menuInfo = null;
      state.theme = null;
      state.ads = null;
      state.menuCustomizations = null;
      state.categories = null;
      state.delivery = null;
      state.branches = [];
      state.catalog = null;
      state.deliveryContext = initialDeliveryContext;
      state.menuLoaded = false;
    },
    SET_MENU_LOADED: (state, action: PayloadAction<boolean>) => {
      state.menuLoaded = action.payload;
    },
  },
});

export const {
  SET_ACTIVE_MENU,
  SET_MENU_INFO,
  SET_ADS,
  SET_THEME,
  SET_MENU_CUSTOMIZATIONS,
  SET_CATEGORIES,
  SET_CATALOG_META,
  APPEND_MENU_ITEMS,
  SET_DELIVERY,
  SET_BRANCHES,
  SET_DELIVERY_DISTANCE,
  SET_DELIVERY_GOVERNORATE,
  SET_DELIVERY_BROWSE_ONLY,
  CLEAR_DELIVERY_CONTEXT,
  REMOVE_MENU,
  SET_MENU_LOADED,
} = menuSlice.actions;

export default menuSlice.reducer;
