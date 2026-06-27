// src/modules/shared/ui/constants/elementColors

import { Element } from "@shared/contracts/character/value-types";

export const elementColors = {
    [Element.Pyro]:   { main: '#EF7A35', light: '#F5A97C', dark: '#A24107' },
    [Element.Hydro]:  { main: '#4CC2F1', light: '#93DAF7', dark: '#0888BA' },
    [Element.Electro]:{ main: '#AF8CE5', light: '#DACAF3', dark: '#6926D1' },
    [Element.Cryo]:   { main: '#9FD6E3', light: '#DAEFF4', dark: '#39B2CF' },
    [Element.Anemo]:  { main: '#74C2A8', light: '#A9D9C9', dark: '#34886C' },
    [Element.Geo]:    { main: '#FAB632', light: '#FCD17D', dark: '#B27500' },
    [Element.Dendro]: { main: '#A5C83B', light: '#C0D977', dark: '#5A6F1A' },
    [Element.None]:   { main: '#555555', light: '#999999', dark: '#111111' },
} as const;
