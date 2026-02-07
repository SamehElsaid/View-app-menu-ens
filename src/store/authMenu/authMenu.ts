import { MenuItem } from "@/types/menu";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type MenuState = {
  menu: MenuItem[] | null;
};
const initialState: MenuState = {
  menu: null,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    SET_ACTIVE_MENU: (state, action: PayloadAction<MenuItem[]>) => {
      state.menu = action.payload;
    },
    REMOVE_MENU: (state) => {
      state.menu = null;
    },
  },
});

export const { SET_ACTIVE_MENU, REMOVE_MENU } = menuSlice.actions;

export default menuSlice.reducer;
