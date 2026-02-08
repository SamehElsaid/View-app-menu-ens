import { MenuItem, MenuInfo } from "@/types/menu";
import { Ad } from "@/types/Ad";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type MenuState = {
  menu: MenuItem[] | null;
  menuInfo: MenuInfo | null;
  theme: string | null;
  ads: Ad[] | null;
};
const initialState: MenuState = {
  menu: null,
  menuInfo: null,
  theme: null,
  ads: null,
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
    REMOVE_MENU: (state) => {
      state.menu = null;
      state.menuInfo = null;
      state.theme = null;
      state.ads = null;
    },
  },
});

export const {
  SET_ACTIVE_MENU,
  SET_MENU_INFO,
  SET_ADS,
  SET_THEME,
  REMOVE_MENU,
} = menuSlice.actions;

export default menuSlice.reducer;
