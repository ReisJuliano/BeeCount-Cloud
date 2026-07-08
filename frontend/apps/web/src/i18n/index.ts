import type { LocaleDictionaries } from '@beecount/ui'

import en from './en'
import zhCN from './zh-CN'
import zhTW from './zh-TW'
import ptBR from './pt-BR'

export const dictionaries: LocaleDictionaries = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'pt-BR': ptBR
}

export type TranslationKey = keyof typeof en
