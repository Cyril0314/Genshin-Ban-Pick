// src/modules/shared/ui/composables/useCharacterAvatarWrapper.ts

import { defineComponent, inject, provide, type Component, type InjectionKey } from 'vue';

export const CharacterAvatarWrapperKey: InjectionKey<Component> = Symbol('CharacterAvatarWrapper');

const Passthrough = defineComponent({
    name: 'CharacterAvatarPassthrough',
    props: {
        characterKey: { type: String, required: true },
        disabled: { type: Boolean, default: false },
    },
    setup(_, { slots }) {
        return () => slots.default?.();
    },
});

export function provideCharacterAvatarWrapper(component: Component) {
    provide(CharacterAvatarWrapperKey, component);
}

export function useCharacterAvatarWrapper(): Component {
    return inject(CharacterAvatarWrapperKey, Passthrough);
}
