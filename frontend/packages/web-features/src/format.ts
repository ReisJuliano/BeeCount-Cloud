import type { ReadLedger } from '@beecount/api-client'

/**
 * 解析用户输入的金额字符串,同时接受「.」和「,」作为小数分隔符
 * (pt-BR 等语言习惯用逗号,`Number("10,50")` 原生会得到 NaN)。
 * 只替换最后一个逗号,避免误伤千分位逗号(如粘贴 "1,234" 场景)。
 */
export function parseAmountInput(input: string | null | undefined): number {
  const trimmed = (input || '').toString().trim()
  if (!trimmed) return 0
  const normalized = trimmed.replace(/,(\d{1,2})$/, '.$1')
  const n = Number(normalized)
  return Number.isNaN(n) ? 0 : n
}

export function formatAmountCny(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return `CNY ${value.toFixed(2)}`
}

/**
 * 紧凑金额格式化（对齐 mobile `utils/format_utils.dart#formatBalance`）。
 *
 * - 中文环境：< 1 万保留两位；≥ 1 万按 1-2 位小数折算成 "X.X万"。
 *   万字单位由 `wanUnit` 指定 —— zh-CN「万」/ zh-TW「萬」,默认「万」。
 * - 其他环境：≥ 100 万折算 M、≥ 1 万折算 k，< 1 万保留两位(跟中文档位对齐 —— 之前
 *   ≥ 1 千就折算,导致 1450 这类日常金额（房租等）也被压成 "1.5k",精度损失太明显)。
 * - currencyCode 传 null 时不带币种符号（BankCardTile 独立展示 currency pill，
 *   不想在金额字符串里再重复一次）。
 */
export function formatBalanceCompact(
  value: number | null | undefined,
  currencyCode?: string | null,
  opts?: { chinese?: boolean; wanUnit?: string }
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  const chinese = opts?.chinese ?? true
  const absVal = Math.abs(value)
  const symbol = currencyCode ? currencySymbol(currencyCode) : ''
  const sign = value >= 0 ? symbol : `-${symbol}`

  const trimZero = (s: string) => s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')

  if (chinese) {
    if (absVal < 10000) return `${sign}${absVal.toFixed(2)}`
    const wan = absVal / 10000
    const r1 = Number(wan.toFixed(1))
    const err1 = Math.abs(r1 * 10000 - absVal)
    const threshold = wan >= 10 ? 100 : 50
    const formatted = err1 > threshold ? wan.toFixed(2) : wan.toFixed(1)
    return `${sign}${trimZero(formatted)}${opts?.wanUnit ?? '万'}`
  }

  if (absVal >= 1_000_000) {
    const m = absVal / 1_000_000
    const r1 = Number(m.toFixed(1))
    const formatted = Math.abs(r1 * 1_000_000 - absVal) > 1000 ? m.toFixed(2) : m.toFixed(1)
    return `${sign}${trimZero(formatted)}M`
  }
  if (absVal >= 10000) {
    const k = absVal / 1000
    const r1 = Number(k.toFixed(1))
    const formatted = Math.abs(r1 * 1000 - absVal) > 100 ? k.toFixed(2) : k.toFixed(1)
    return `${sign}${trimZero(formatted)}k`
  }
  return `${sign}${absVal.toFixed(2)}`
}

/**
 * 紧凑「轴刻度」数字格式化 —— 图表 Y 轴 / 日历格这类不带币种、且小数值要求取整
 * 的场景。和 `formatBalanceCompact` 的区别:小于缩写阈值时直接取整(轴刻度不需要
 * 跟金额一样保留 .00)。
 *
 * - 中文环境(`chinese: true`):≥ 1 万 → "X.X<wanUnit>",单位文案由调用方传入
 *   (zh-CN 用「万」、zh-TW 用「萬」,默认「万」)。
 * - 英文环境(`chinese: false`):≥ 100 万 → "X.XM"、≥ 1 千 → "X.Xk",否则取整 ——
 *   符合英文区习惯,不再出现「万」。
 */
export function formatCompactTick(
  value: number,
  opts: { chinese: boolean; wanUnit?: string }
): string {
  const abs = Math.abs(value)
  if (opts.chinese) {
    if (abs < 10000) return value.toFixed(0)
    return `${(value / 10000).toFixed(1)}${opts.wanUnit ?? '万'}`
  }
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toFixed(0)
}

function currencySymbol(code: string): string {
  switch (code.toUpperCase()) {
    case 'CNY':
      return '¥'
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    case 'JPY':
      return '¥'
    case 'HKD':
      return 'HK$'
    case 'GBP':
      return '£'
    default:
      return ''
  }
}

export function formatIsoDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

export function formatLedgerLabel(ledger: ReadLedger, roleLabel: string): string {
  return `${ledger.ledger_name} [${roleLabel}]`
}
