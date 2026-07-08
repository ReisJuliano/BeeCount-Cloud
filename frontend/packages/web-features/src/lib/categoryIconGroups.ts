/**
 * 分类图标分组 —— 跟 app 端 `lib/pages/category/icon_picker_page.dart` 对齐。
 *
 * 每个 item 的 `key` 是 **stored 值**(app DB 的 `categories.icon` 字段),
 * web 渲染时用 `resolveMaterialIconName` 走 FLUTTER_RENAMES 映射拿到真正的
 * Material Symbols 名;app 端读这个 key 走 `category_service.getCategoryIcon`
 * switch 拿 IconData。两端 stored 值完全一致,跨端兼容。
 *
 * 维护:动这个文件之前先看 app 端 icon_picker_page.dart 是不是也改了,两边
 * 必须同步。新增图标项必须保证 key 在 categoryIconMap.ts 的 KNOWN_NAMES 或
 * FLUTTER_RENAMES 里有定义,否则 web 渲染会 fallback 到 'category' 字面图标。
 */

export type CategoryIconItem = {
  /** stored 值,跟 app categories.icon 字段对齐 */
  key: string
  /** 中文显示标签(picker grid 单元格底部的小字) */
  label: string
}

export type CategoryIconGroup = {
  /** i18n key,用 t() 翻译 group tab 的标题 */
  labelKey: string
  icons: CategoryIconItem[]
}

/** 支出类目分组(8 组,每组 8-10 个图标) */
export const EXPENSE_ICON_GROUPS: readonly CategoryIconGroup[] = [
  {
    labelKey: 'categories.iconGroup.dining',
    icons: [
      { key: 'restaurant', label: 'Restaurante' },
      { key: 'local_dining', label: 'Refeição' },
      { key: 'fastfood', label: 'Fast food' },
      { key: 'local_cafe', label: 'Café' },
      { key: 'local_bar', label: 'Bar' },
      { key: 'cake', label: 'Bolo' },
      { key: 'local_pizza', label: 'Pizza' },
      { key: 'icecream', label: 'Sorvete' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.transport',
    icons: [
      { key: 'directions_car', label: 'Carro' },
      { key: 'directions_bus', label: 'Ônibus' },
      { key: 'directions_subway', label: 'Metrô' },
      { key: 'local_taxi', label: 'Táxi' },
      { key: 'flight', label: 'Avião' },
      { key: 'train', label: 'Trem' },
      { key: 'directions_bike', label: 'Bicicleta' },
      { key: 'directions_walk', label: 'A pé' },
      { key: 'local_gas_station', label: 'Combustível' },
      { key: 'local_parking', label: 'Estacionamento' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.shopping',
    icons: [
      { key: 'shopping_cart', label: 'Carrinho' },
      { key: 'shopping_bag', label: 'Sacola' },
      { key: 'store', label: 'Loja' },
      { key: 'local_mall', label: 'Shopping' },
      { key: 'local_grocery_store', label: 'Mercado' },
      { key: 'checkroom', label: 'Roupas' },
      { key: 'watch', label: 'Relógio' },
      { key: 'diamond', label: 'Joias' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.entertainment',
    icons: [
      { key: 'movie', label: 'Cinema' },
      { key: 'music_note', label: 'Música' },
      { key: 'sports_esports', label: 'Jogos' },
      { key: 'sports_soccer', label: 'Futebol' },
      { key: 'sports_basketball', label: 'Basquete' },
      { key: 'theater_comedy', label: 'Diversão' },
      { key: 'camera_alt', label: 'Fotografia' },
      { key: 'palette', label: 'Arte' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.life',
    icons: [
      { key: 'home', label: 'Casa' },
      { key: 'local_laundry_service', label: 'Lavanderia' },
      { key: 'cleaning_services', label: 'Limpeza' },
      { key: 'plumbing', label: 'Encanamento' },
      { key: 'electrical_services', label: 'Eletricista' },
      { key: 'handyman', label: 'Manutenção' },
      { key: 'pets', label: 'Pets' },
      { key: 'child_care', label: 'Mãe e bebê' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.health',
    icons: [
      { key: 'local_hospital', label: 'Hospital' },
      { key: 'medical_services', label: 'Médico' },
      { key: 'local_pharmacy', label: 'Farmácia' },
      { key: 'fitness_center', label: 'Academia' },
      { key: 'spa', label: 'Estética' },
      { key: 'psychology', label: 'Psicologia' },
      // app 用 'face' 但 FLUTTER_RENAMES 里 face_retouching → face,这里直接用
      // face 跟 app 行为对齐
      { key: 'face', label: 'Cuidados com a pele' },
      { key: 'content_cut', label: 'Cabeleireiro' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.education',
    icons: [
      { key: 'school', label: 'Escola' },
      { key: 'library_books', label: 'Livros' },
      { key: 'computer', label: 'Computador' },
      { key: 'phone', label: 'Telefonia' },
      { key: 'language', label: 'Idiomas' },
      { key: 'science', label: 'Ciência' },
      { key: 'calculate', label: 'Cálculo' },
      { key: 'brush', label: 'Desenho' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.other',
    icons: [
      { key: 'business', label: 'Negócios' },
      { key: 'work', label: 'Trabalho' },
      { key: 'flash_on', label: 'Água e luz' },
      { key: 'wifi', label: 'Internet' },
      { key: 'phone_android', label: 'Celular' },
      { key: 'smoking_rooms', label: 'Fumo e bebida' },
      { key: 'favorite', label: 'Doação' },
      { key: 'category', label: 'Outros' },
    ],
  },
] as const

/** 收入类目分组(4 组) */
export const INCOME_ICON_GROUPS: readonly CategoryIconGroup[] = [
  {
    labelKey: 'categories.iconGroup.workIncome',
    icons: [
      { key: 'work', label: 'Salário' },
      { key: 'business_center', label: 'Negócios' },
      { key: 'engineering', label: 'Técnico' },
      { key: 'design_services', label: 'Design' },
      { key: 'agriculture', label: 'Agricultura' },
      { key: 'construction', label: 'Construção' },
      { key: 'local_shipping', label: 'Logística' },
      { key: 'restaurant_menu', label: 'Alimentação' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.finance',
    icons: [
      { key: 'account_balance', label: 'Banco' },
      { key: 'savings', label: 'Poupança' },
      { key: 'trending_up', label: 'Investimento' },
      { key: 'paid', label: 'Juros' },
      { key: 'currency_exchange', label: 'Câmbio' },
      { key: 'wallet', label: 'Carteira' },
      { key: 'credit_card', label: 'Cartão de crédito' },
      { key: 'account_balance_wallet', label: 'Saldo' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.reward',
    icons: [
      { key: 'card_giftcard', label: 'Presente em dinheiro' },
      { key: 'redeem', label: 'Bônus' },
      { key: 'emoji_events', label: 'Prêmio' },
      { key: 'star', label: 'Avaliação' },
      { key: 'grade', label: 'Nível' },
      { key: 'loyalty', label: 'Pontos' },
      { key: 'volunteer_activism', label: 'Presente' },
      { key: 'celebration', label: 'Comemoração' },
    ],
  },
  {
    labelKey: 'categories.iconGroup.other',
    icons: [
      { key: 'receipt_long', label: 'Reembolso' },
      // app 用 'part_time' stored,FLUTTER_RENAMES 映射到 schedule。这里
      // 保留 'part_time' 以跟 app stored 值一致,渲染走 resolveMaterialIconName
      { key: 'part_time', label: 'Bico' },
      { key: 'undo', label: 'Estorno' },
      // 同理 app 用 'money' → attach_money
      { key: 'money', label: 'Dinheiro' },
      { key: 'apartment', label: 'Aluguel' },
      { key: 'handshake', label: 'Parceria' },
      { key: 'category', label: 'Outros' },
      { key: 'help', label: 'Sem categoria' },
    ],
  },
] as const

/** 拍平后的所有 stored 值集合,搜索时用。 */
export const ALL_GROUPED_ICON_KEYS: readonly string[] = Object.freeze(
  Array.from(
    new Set([
      ...EXPENSE_ICON_GROUPS.flatMap((g) => g.icons.map((i) => i.key)),
      ...INCOME_ICON_GROUPS.flatMap((g) => g.icons.map((i) => i.key)),
    ]),
  ),
)

/** 按 kind 取分组数据 */
export function getIconGroupsByKind(
  kind: 'expense' | 'income' | string,
): readonly CategoryIconGroup[] {
  return kind === 'income' ? INCOME_ICON_GROUPS : EXPENSE_ICON_GROUPS
}
