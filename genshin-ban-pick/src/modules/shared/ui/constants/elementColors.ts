// src/modules/shared/ui/constants/elementColors

import { Element } from "@shared/contracts/character/value-types";

export const elementColors = {
    [Element.Pyro]:   { main: '#FF6A35', light: '#FF9B6E', dark: '#CC4015' },
    [Element.Hydro]:  { main: '#2FA7FF', light: '#78CCFF', dark: '#0069BF' },
    [Element.Electro]:{ main: '#AB47BC', light: '#D080D8', dark: '#6A1B9A' },
    [Element.Cryo]:   { main: '#76E3FF', light: '#B5F2FF', dark: '#35B8E0' },
    [Element.Anemo]:  { main: '#3DD9A9', light: '#80EAC7', dark: '#149D7A' },
    [Element.Geo]:    { main: '#D9B145', light: '#F2D574', dark: '#A67C1D' },
    [Element.Dendro]: { main: '#8DC73F', light: '#B8E67A', dark: '#5F8E1F' },
    [Element.None]:   { main: '#555555', light: '#999999', dark: '#111111' },
} as const;
