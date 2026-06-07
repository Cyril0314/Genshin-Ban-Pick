// src/modules/shared/ui/context/characterHoverWrapperContext.ts

import { defineComponent, inject, provide, type Component, type InjectionKey } from 'vue';

export const CharacterHoverWrapperKey: InjectionKey<Component> = Symbol('CharacterHoverWrapper');

const Passthrough = defineComponent({
    name: 'CharacterHoverPassthrough',
    props: {
        characterKey: { type: String, required: true },
        disabled: { type: Boolean, default: false },
    },
    setup(_, { slots }) {
        return () => slots.default?.();
    },
});

export function provideCharacterHoverWrapper(component: Component) {
    provide(CharacterHoverWrapperKey, component);
}

export function useCharacterHoverWrapper(): Component {
    return inject(CharacterHoverWrapperKey, Passthrough);
}
