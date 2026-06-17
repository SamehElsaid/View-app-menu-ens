import { MenuItem, MenuInfo, MenuCustomizations, Category, Delivery } from "@/types/menu";
import { Ad } from "@/types/Ad";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type MenuState = {
  menu: MenuItem[] | null;
  menuInfo: MenuInfo | null;
  theme: string | null;
  ads: Ad[] | null;
  menuCustomizations: MenuCustomizations | null;
  categories: Category[] | null;
  delivery: Delivery | null;
};
const initialState: MenuState = {
  menu: null,
  menuInfo: null,
  theme: null,
  ads: null,
  menuCustomizations: null,
  categories: null,
  delivery: null,
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
    SET_DELIVERY: (state, action: PayloadAction<Delivery | null>) => {
      state.delivery = action.payload;
    },
    REMOVE_MENU: (state) => {
      state.menu = null;
      state.menuInfo = null;
      state.theme = null;
      state.ads = null;
      state.menuCustomizations = null;
      state.categories = null;
      state.delivery = null;
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
  SET_DELIVERY,
  REMOVE_MENU,
} = menuSlice.actions;

export default menuSlice.reducer;
