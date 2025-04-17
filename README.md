
```
Genshin-Ban-Pick
├─ .DS_Store
├─ README.md
├─ backend
│  ├─ banPickFlow.js
│  ├─ character
│  │  └─ characters.json
│  ├─ constants
│  │  └─ constants.js
│  ├─ index.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ characters.js
│  │  ├─ record.js
│  │  └─ room.js
│  ├─ socketController.js
│  └─ upload-node-modules.sh
└─ genshin-ban-pick
   ├─ .editorconfig
   ├─ .prettierrc.json
   ├─ README.md
   ├─ env.d.ts
   ├─ eslint.config.ts
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  ├─ favicon.ico
   │  └─ wish.png
   ├─ src
   │  ├─ App.vue
   │  ├─ assets
   │  │  ├─ base.css
   │  │  ├─ images
   │  │  │  ├─ background
   │  │  │  │  ├─ 4.7.jpg
   │  │  │  │  ├─ 4.8.jpg
   │  │  │  │  ├─ 5.1.png
   │  │  │  │  ├─ 5.3.jpg
   │  │  │  │  ├─ 5.5.jpg
   │  │  │  │  ├─ Tier.png
   │  │  │  │  ├─ background.jpg
   │  │  │  │  ├─ wallpaper.png
   │  │  │  │  ├─ wallpaper2.png
   │  │  │  │  └─ wallpaper3.png
   │  │  │  ├─ calendar
   │  │  │  │  ├─ Calendar_April.png
   │  │  │  │  ├─ Calendar_August.png
   │  │  │  │  ├─ Calendar_December.png
   │  │  │  │  ├─ Calendar_January.png
   │  │  │  │  ├─ Calendar_July.png
   │  │  │  │  ├─ Calendar_June.png
   │  │  │  │  ├─ Calendar_March.png
   │  │  │  │  ├─ Calendar_May.jpg
   │  │  │  │  ├─ Calendar_November.png
   │  │  │  │  ├─ Calendar_October.png
   │  │  │  │  └─ Calendar_September.png
   │  │  │  ├─ profile
   │  │  │  │  ├─ Albedo_Profile.webp
   │  │  │  │  ├─ Alhaitham_Profile.webp
   │  │  │  │  ├─ Amber_Profile.webp
   │  │  │  │  ├─ AratakiItto_Profile.webp
   │  │  │  │  ├─ Arlecchino_Profile.webp
   │  │  │  │  ├─ Baizhu_Profile.webp
   │  │  │  │  ├─ Barbara_Profile.webp
   │  │  │  │  ├─ Beidou_Profile.webp
   │  │  │  │  ├─ Bennett_Profile.webp
   │  │  │  │  ├─ Candace_Profile.webp
   │  │  │  │  ├─ Charlotte_Profile.webp
   │  │  │  │  ├─ Chasca_Profile.webp
   │  │  │  │  ├─ Chevreuse_Profile.webp
   │  │  │  │  ├─ Chiori_Profile.webp
   │  │  │  │  ├─ Chongyun_Profile.webp
   │  │  │  │  ├─ Citlali_Profile.webp
   │  │  │  │  ├─ Clorinde_Profile.webp
   │  │  │  │  ├─ Collei_Profile.webp
   │  │  │  │  ├─ Cyno_Profile.webp
   │  │  │  │  ├─ Dehya_Profile.webp
   │  │  │  │  ├─ Diluc_Profile.webp
   │  │  │  │  ├─ Diona_Profile.webp
   │  │  │  │  ├─ Dori_Profile.webp
   │  │  │  │  ├─ Emilie_Profile.webp
   │  │  │  │  ├─ Eula_Profile.webp
   │  │  │  │  ├─ Faruzan_Profile.webp
   │  │  │  │  ├─ Fischl_Profile.webp
   │  │  │  │  ├─ Freminet_Profile.webp
   │  │  │  │  ├─ Furina_Profile.webp
   │  │  │  │  ├─ Gaming_Profile.webp
   │  │  │  │  ├─ Ganyu_Profile.webp
   │  │  │  │  ├─ Gorou_Profile.webp
   │  │  │  │  ├─ HuTao_Profile.webp
   │  │  │  │  ├─ Iansan_Profile.webp
   │  │  │  │  ├─ Jean_Profile.webp
   │  │  │  │  ├─ Kachina_Profile.webp
   │  │  │  │  ├─ KaedeharaKazuha_Profile.webp
   │  │  │  │  ├─ Kaeya_Profile.webp
   │  │  │  │  ├─ KamisatoAyaka_Profile.webp
   │  │  │  │  ├─ KamisatoAyato_Profile.webp
   │  │  │  │  ├─ Kaveh_Profile.webp
   │  │  │  │  ├─ Keqing_Profile.webp
   │  │  │  │  ├─ Kinich_Profile.webp
   │  │  │  │  ├─ Kirara_Profile.webp
   │  │  │  │  ├─ Klee_Profile.webp
   │  │  │  │  ├─ KujouSara_Profile.webp
   │  │  │  │  ├─ KukiShinobu_Profile.webp
   │  │  │  │  ├─ LanYan_Profile.webp
   │  │  │  │  ├─ Layla_Profile.webp
   │  │  │  │  ├─ Lisa_Profile.webp
   │  │  │  │  ├─ Lynette_Profile.webp
   │  │  │  │  ├─ Lyney_Profile.webp
   │  │  │  │  ├─ Mavuika_Profile.webp
   │  │  │  │  ├─ Mika_Profile.webp
   │  │  │  │  ├─ Mona_Profile.webp
   │  │  │  │  ├─ Mualani_Profile.webp
   │  │  │  │  ├─ Nahida_Profile.webp
   │  │  │  │  ├─ Navia_Profile.webp
   │  │  │  │  ├─ Neuvillette_Profile.webp
   │  │  │  │  ├─ Nilou_Profile.webp
   │  │  │  │  ├─ Ningguang_Profile.webp
   │  │  │  │  ├─ Noelle_Profile.webp
   │  │  │  │  ├─ Ororon_Profile.webp
   │  │  │  │  ├─ Qiqi_Profile.webp
   │  │  │  │  ├─ RaidenShogun_Profile.webp
   │  │  │  │  ├─ Razor_Profile.webp
   │  │  │  │  ├─ Rosaria_Profile.webp
   │  │  │  │  ├─ SangonomiyaKokomi_Profile.webp
   │  │  │  │  ├─ Sayu_Profile.webp
   │  │  │  │  ├─ Sethos_Profile.webp
   │  │  │  │  ├─ Shenhe_Profile.webp
   │  │  │  │  ├─ ShikanoinHeizou_Profile.webp
   │  │  │  │  ├─ Sigewinne_Profile.webp
   │  │  │  │  ├─ Sucrose_Profile.webp
   │  │  │  │  ├─ Tartaglia_Profile.webp
   │  │  │  │  ├─ Thoma_Profile.webp
   │  │  │  │  ├─ Tighnari_Profile.webp
   │  │  │  │  ├─ Traveler_Profile.webp
   │  │  │  │  ├─ Varesa_Profile.webp
   │  │  │  │  ├─ Venti_Profile.webp
   │  │  │  │  ├─ Wanderer_Profile.webp
   │  │  │  │  ├─ Wriothesley_Profile.webp
   │  │  │  │  ├─ Xiangling_Profile.webp
   │  │  │  │  ├─ Xianyun_Profile.webp
   │  │  │  │  ├─ Xiao_Profile.webp
   │  │  │  │  ├─ Xilonen_Profile.webp
   │  │  │  │  ├─ Xingqiu_Profile.webp
   │  │  │  │  ├─ Xinyan_Profile.webp
   │  │  │  │  ├─ YaeMiko_Profile.webp
   │  │  │  │  ├─ Yanfei_Profile.webp
   │  │  │  │  ├─ Yaoyao_Profile.webp
   │  │  │  │  ├─ Yelan_Profile.webp
   │  │  │  │  ├─ Yoimiya_Profile.webp
   │  │  │  │  ├─ YumemizukiMizuki_Profile.webp
   │  │  │  │  ├─ YunJin_Profile.webp
   │  │  │  │  └─ Zhongli_Profile.webp
   │  │  │  └─ wish
   │  │  │     ├─ Albedo_Wish.png
   │  │  │     ├─ Alhaitham_Wish.png
   │  │  │     ├─ Amber_Wish.png
   │  │  │     ├─ AratakiItto_Wish.png
   │  │  │     ├─ Arlecchino_Wish.png
   │  │  │     ├─ Baizhu_Wish.png
   │  │  │     ├─ Barbara_Wish.png
   │  │  │     ├─ Beidou_Wish.png
   │  │  │     ├─ Bennett_Wish.png
   │  │  │     ├─ Candace_Wish.png
   │  │  │     ├─ Charlotte_Wish.png
   │  │  │     ├─ Chasca_Wish.png
   │  │  │     ├─ Chevreuse_Wish.png
   │  │  │     ├─ Chiori_Wish.png
   │  │  │     ├─ Chongyun_Wish.png
   │  │  │     ├─ Citlali_Wish.png
   │  │  │     ├─ Clorinde_Wish.png
   │  │  │     ├─ Collei_Wish.png
   │  │  │     ├─ Cyno_Wish.png
   │  │  │     ├─ Dehya_Wish.png
   │  │  │     ├─ Diluc_Wish.png
   │  │  │     ├─ Diona_Wish.png
   │  │  │     ├─ Dori_Wish.png
   │  │  │     ├─ Emilie_Wish.png
   │  │  │     ├─ Eula_Wish.png
   │  │  │     ├─ Faruzan_Wish.png
   │  │  │     ├─ Fischl_Wish.png
   │  │  │     ├─ Freminet_Wish.png
   │  │  │     ├─ Furina_Wish.png
   │  │  │     ├─ Gaming_Wish.png
   │  │  │     ├─ Ganyu_Wish.png
   │  │  │     ├─ Gorou_Wish.png
   │  │  │     ├─ HuTao_Wish.png
   │  │  │     ├─ Iansan_Wish.png
   │  │  │     ├─ Jean_Wish.png
   │  │  │     ├─ Kachina_Wish.png
   │  │  │     ├─ KaedeharaKazuha_Wish.png
   │  │  │     ├─ Kaeya_Wish.png
   │  │  │     ├─ KamisatoAyaka_Wish.png
   │  │  │     ├─ KamisatoAyato_Wish.png
   │  │  │     ├─ Kaveh_Wish.png
   │  │  │     ├─ Keqing_Wish.png
   │  │  │     ├─ Kinich_Wish.png
   │  │  │     ├─ Kirara_Wish.png
   │  │  │     ├─ Klee_Wish.png
   │  │  │     ├─ KujouSara_Wish.png
   │  │  │     ├─ KukiShinobu_Wish.png
   │  │  │     ├─ LanYan_Wish.png
   │  │  │     ├─ Layla_Wish.png
   │  │  │     ├─ Lisa_Wish.png
   │  │  │     ├─ Lynette_Wish.png
   │  │  │     ├─ Lyney_Wish.png
   │  │  │     ├─ Mavuika_Wish.png
   │  │  │     ├─ Mika_Wish.png
   │  │  │     ├─ Mona_Wish.png
   │  │  │     ├─ Mualani_Wish.png
   │  │  │     ├─ Nahida_Wish.png
   │  │  │     ├─ Navia_Wish.png
   │  │  │     ├─ Neuvillette_Wish.png
   │  │  │     ├─ Nilou_Wish.png
   │  │  │     ├─ Ningguang_Wish.png
   │  │  │     ├─ Noelle_Wish.png
   │  │  │     ├─ Ororon_Wish.png
   │  │  │     ├─ Qiqi_Wish.png
   │  │  │     ├─ RaidenShogun_Wish.png
   │  │  │     ├─ Razor_Wish.png
   │  │  │     ├─ Rosaria_Wish.png
   │  │  │     ├─ SangonomiyaKokomi_Wish.png
   │  │  │     ├─ Sayu_Wish.png
   │  │  │     ├─ Sethos_Wish.png
   │  │  │     ├─ Shenhe_Wish.png
   │  │  │     ├─ ShikanoinHeizou_Wish.png
   │  │  │     ├─ Sigewinne_Wish.png
   │  │  │     ├─ Sucrose_Wish.png
   │  │  │     ├─ Tartaglia_Wish.png
   │  │  │     ├─ Thoma_Wish.png
   │  │  │     ├─ Tighnari_Wish.png
   │  │  │     ├─ Traveler_Wish.png
   │  │  │     ├─ Varesa_Wish.png
   │  │  │     ├─ Venti_Wish.png
   │  │  │     ├─ Wanderer_Wish.png
   │  │  │     ├─ Wriothesley_Wish.png
   │  │  │     ├─ Xiangling_Wish.png
   │  │  │     ├─ Xianyun_Wish.png
   │  │  │     ├─ Xiao_Wish.png
   │  │  │     ├─ Xilonen_Wish.png
   │  │  │     ├─ Xingqiu_Wish.png
   │  │  │     ├─ Xinyan_Wish.png
   │  │  │     ├─ YaeMiko_Wish.png
   │  │  │     ├─ Yanfei_Wish.png
   │  │  │     ├─ Yaoyao_Wish.png
   │  │  │     ├─ Yelan_Wish.png
   │  │  │     ├─ Yoimiya_Wish.png
   │  │  │     ├─ YumemizukiMizuki_Wish.png
   │  │  │     ├─ YunJin_Wish.png
   │  │  │     └─ Zhongli_Wish.png
   │  │  ├─ logo.svg
   │  │  └─ main.css
   │  ├─ components
   │  │  ├─ HelloWorld.vue
   │  │  ├─ TheWelcome.vue
   │  │  ├─ WelcomeItem.vue
   │  │  └─ icons
   │  │     ├─ IconCommunity.vue
   │  │     ├─ IconDocumentation.vue
   │  │     ├─ IconEcosystem.vue
   │  │     ├─ IconSupport.vue
   │  │     └─ IconTooling.vue
   │  ├─ composables
   │  │  └─ useFilteredCharacters.ts
   │  ├─ features
   │  │  ├─ BanPick
   │  │  │  ├─ BanPickBoard.vue
   │  │  │  ├─ components
   │  │  │  │  ├─ BanZone.vue
   │  │  │  │  ├─ DropZone.vue
   │  │  │  │  ├─ PickZone.vue
   │  │  │  │  ├─ StepIndicator.vue
   │  │  │  │  ├─ ToolBar.vue
   │  │  │  │  └─ UtilityZone.vue
   │  │  │  └─ composables
   │  │  │     ├─ useBanPickImageSync.ts
   │  │  │     ├─ useBanPickOrder.ts
   │  │  │     ├─ useBanPickStep.ts
   │  │  │     └─ useRandomizeImage.ts
   │  │  ├─ CharacterSelector
   │  │  │  ├─ CharacterSelector.vue
   │  │  │  └─ composables
   │  │  │     ├─ useCharacterFilter.ts
   │  │  │     └─ useSelectorOptions.ts
   │  │  ├─ ChatRoom
   │  │  │  ├─ ChatRoom.vue
   │  │  │  └─ composables
   │  │  │     └─ useChat.ts
   │  │  ├─ ImageOptions
   │  │  │  └─ ImageOptions.vue
   │  │  ├─ Tactical
   │  │  │  ├─ TacticalBoard.vue
   │  │  │  ├─ TacticalBoardPanel.vue
   │  │  │  ├─ TacticalCell.vue
   │  │  │  ├─ TacticalPool.vue
   │  │  │  └─ composables
   │  │  │     └─ useTacticalBoardSync.ts
   │  │  └─ Team
   │  │     ├─ TeamInfo.vue
   │  │     └─ composables
   │  │        └─ useTeamInfoSync.ts
   │  ├─ main.ts
   │  ├─ network
   │  │  ├─ SocketProvider.ts
   │  │  ├─ characterService.ts
   │  │  ├─ roomService.ts
   │  │  ├─ socket.ts
   │  │  └─ useSocket.ts
   │  ├─ router
   │  │  └─ index.ts
   │  ├─ stores
   │  │  └─ counter.ts
   │  ├─ types
   │  │  ├─ CharacterInfo.ts
   │  │  └─ RoomSetting.ts
   │  ├─ utils
   │  │  └─ imageRegistry.ts
   │  └─ views
   │     ├─ AboutView.vue
   │     ├─ BanPickView.vue
   │     └─ HomeView.vue
   ├─ tsconfig.app.json
   ├─ tsconfig.json
   ├─ tsconfig.node.json
   ├─ upload-node-modules.sh
   └─ vite.config.ts

```