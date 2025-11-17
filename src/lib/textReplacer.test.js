import { describe, it, expect } from 'vitest'
import {
  replaceText,
  validateRules,
  DEFAULT_RULES,
} from './textReplacer'

describe('textReplacer', () => {
  describe('replaceText', () => {
    it('應該執行單個替換規則', () => {
      const text = 'Hello, World!'
      const rules = [{ from: ',', to: '，' }]
      const result = replaceText(text, rules)

      expect(result).toBe('Hello， World!')
    })

    it('應該執行多個替換規則', () => {
      const text = 'Hello, World! How are you?'
      const rules = [
        { from: ',', to: '，' },
        { from: '!', to: '！' },
        { from: '?', to: '？' },
      ]
      const result = replaceText(text, rules)

      expect(result).toBe('Hello， World！ How are you？')
    })

    it('應該處理全局替換（多次出現）', () => {
      const text = 'apple, orange, banana, grape'
      const rules = [{ from: ',', to: '|' }]
      const result = replaceText(text, rules)

      expect(result).toBe('apple| orange| banana| grape')
      // 確認所有逗號都被替換
      expect(result).not.toContain(',')
    })

    it('應該處理連字號轉項目符號', () => {
      const text = '- Item 1\n- Item 2\n- Item 3'
      const rules = [{ from: '-', to: '•' }]
      const result = replaceText(text, rules)

      expect(result).toBe('• Item 1\n• Item 2\n• Item 3')
    })

    it('應該處理空字串', () => {
      const rules = [{ from: 'a', to: 'b' }]
      expect(replaceText('', rules)).toBe('')
    })

    it('應該處理空規則', () => {
      const text = 'Hello, World!'
      expect(replaceText(text, [])).toBe(text)
    })

    it('應該處理 null 或 undefined 文字', () => {
      const rules = [{ from: 'a', to: 'b' }]
      expect(replaceText(null, rules)).toBe(null)
      expect(replaceText(undefined, rules)).toBe(undefined)
    })

    it('應該處理 null 或 undefined 規則', () => {
      const text = 'Hello, World!'
      expect(replaceText(text, null)).toBe(text)
      expect(replaceText(text, undefined)).toBe(text)
    })

    it('應該按順序執行規則', () => {
      const text = 'abc'
      const rules = [
        { from: 'a', to: 'x' },
        { from: 'b', to: 'y' },
        { from: 'c', to: 'z' },
      ]
      const result = replaceText(text, rules)

      expect(result).toBe('xyz')
    })

    it('應該處理規則的連鎖效應', () => {
      const text = 'a'
      const rules = [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ]
      const result = replaceText(text, rules)

      // 第一個規則將 'a' 變成 'b'
      // 第二個規則將 'b' 變成 'c'
      expect(result).toBe('c')
    })

    it('應該處理空白字元的替換', () => {
      const text = 'Hello World'
      const rules = [{ from: ' ', to: '_' }]
      const result = replaceText(text, rules)

      expect(result).toBe('Hello_World')
    })

    it('應該處理換行符的替換', () => {
      const text = 'Line1\nLine2'
      const rules = [{ from: '\n', to: ' | ' }]
      const result = replaceText(text, rules)

      expect(result).toBe('Line1 | Line2')
    })

    it('應該處理特殊字元', () => {
      const text = '(Hello) {Test}'
      const rules = [
        { from: '(', to: '（' },
        { from: ')', to: '）' },
      ]
      const result = replaceText(text, rules)

      expect(result).toBe('（Hello） {Test}')
    })

    it('應該處理正則表達式特殊字元的轉義', () => {
      const text = 'Price: $100'
      const rules = [{ from: '$', to: 'NT$' }]
      const result = replaceText(text, rules)

      expect(result).toBe('Price: NT$100')
    })

    it('應該處理點號（.）的替換', () => {
      const text = 'file.txt'
      const rules = [{ from: '.', to: '_' }]
      const result = replaceText(text, rules)

      // 點號在正則表達式中是特殊字元，應該被正確轉義
      expect(result).toBe('file_txt')
    })

    it('應該處理星號（*）的替換', () => {
      const text = '2 * 3 = 6'
      const rules = [{ from: '*', to: '×' }]
      const result = replaceText(text, rules)

      expect(result).toBe('2 × 3 = 6')
    })

    it('應該處理 to 為空字串（刪除）', () => {
      const text = 'Hello, World!'
      const rules = [{ from: ',', to: '' }]
      const result = replaceText(text, rules)

      expect(result).toBe('Hello World!')
    })

    it('應該忽略缺少 from 的規則', () => {
      const text = 'Hello, World!'
      const rules = [
        { from: '', to: 'x' }, // 應該被忽略
        { from: ',', to: '，' },
      ]
      const result = replaceText(text, rules)

      expect(result).toBe('Hello， World!')
    })

    it('應該處理 to 為 undefined 的情況', () => {
      const text = 'Hello, World!'
      const rules = [
        { from: ',', to: undefined }, // 應該被忽略
        { from: '!', to: '！' },
      ]
      const result = replaceText(text, rules)

      // 第一個規則被忽略，只有第二個被執行
      expect(result).toBe('Hello, World！')
    })
  })

  describe('validateRules', () => {
    it('應該驗證有效的規則', () => {
      const rules = [
        { from: 'a', to: 'b' },
        { from: 'c', to: 'd' },
      ]
      const result = validateRules(rules)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('應該檢測缺少 from 欄位', () => {
      const rules = [
        { to: 'b' },
      ]
      const result = validateRules(rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('規則 1: 缺少 "from" 欄位')
    })

    it('應該檢測缺少 to 欄位', () => {
      const rules = [
        { from: 'a' },
      ]
      const result = validateRules(rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('規則 1: 缺少 "to" 欄位')
    })

    it('應該檢測多個規則的錯誤', () => {
      const rules = [
        { from: 'a', to: 'b' }, // 正確
        { to: 'c' }, // 缺少 from
        { from: 'd' }, // 缺少 to
        { from: '', to: 'e' }, // from 為空
      ]
      const result = validateRules(rules)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('應該處理空陣列', () => {
      const result = validateRules([])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('應該處理非陣列輸入', () => {
      const result = validateRules('not an array')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('規則必須是陣列')
    })

    it('應該處理 null', () => {
      const result = validateRules(null)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('規則必須是陣列')
    })

    it('應該處理 undefined', () => {
      const result = validateRules(undefined)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('規則必須是陣列')
    })

    it('應該允許 to 為空字串', () => {
      const rules = [
        { from: 'a', to: '' },
      ]
      const result = validateRules(rules)

      // to 為空字串是有效的（表示刪除）
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('應該檢測 from 為空字串', () => {
      const rules = [
        { from: '', to: 'b' },
      ]
      const result = validateRules(rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('規則 1: 缺少 "from" 欄位')
    })
  })

  describe('DEFAULT_RULES', () => {
    it('應該包含預設規則', () => {
      expect(DEFAULT_RULES).toBeDefined()
      expect(Array.isArray(DEFAULT_RULES)).toBe(true)
      expect(DEFAULT_RULES.length).toBeGreaterThan(0)
    })

    it('應該包含逗號轉換規則', () => {
      const commaRule = DEFAULT_RULES.find(rule => rule.from === ',')
      expect(commaRule).toBeDefined()
      expect(commaRule.to).toBe('，')
    })

    it('應該包含句號轉換規則', () => {
      const periodRule = DEFAULT_RULES.find(rule => rule.from === '.')
      expect(periodRule).toBeDefined()
      expect(periodRule.to).toBe('。')
    })

    it('應該包含驚嘆號轉換規則', () => {
      const exclamationRule = DEFAULT_RULES.find(rule => rule.from === '!')
      expect(exclamationRule).toBeDefined()
      expect(exclamationRule.to).toBe('！')
    })

    it('應該包含問號轉換規則', () => {
      const questionRule = DEFAULT_RULES.find(rule => rule.from === '?')
      expect(questionRule).toBeDefined()
      expect(questionRule.to).toBe('？')
    })

    it('應該包含連字號轉項目符號規則', () => {
      const dashRule = DEFAULT_RULES.find(rule => rule.from === '-')
      expect(dashRule).toBeDefined()
      expect(dashRule.to).toBe('•')
    })

    it('所有預設規則應該是有效的', () => {
      const result = validateRules(DEFAULT_RULES)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('整合測試', () => {
    it('應該使用預設規則轉換文字', () => {
      const text = 'Hello, World! How are you? I am fine.'
      const result = replaceText(text, DEFAULT_RULES)

      expect(result).toBe('Hello， World！ How are you？ I am fine。')
    })

    it('應該處理項目列表', () => {
      const text = '- First item\n- Second item\n- Third item'
      const result = replaceText(text, DEFAULT_RULES)

      expect(result).toContain('•')
      expect(result).not.toContain('-')
    })

    it('應該處理混合標點符號', () => {
      const text = 'Title.\n\n- Point 1, important!\n- Point 2, very important?\n- Point 3.'
      const result = replaceText(text, DEFAULT_RULES)

      expect(result).toContain('，')
      expect(result).toContain('。')
      expect(result).toContain('！')
      expect(result).toContain('？')
      expect(result).toContain('•')
    })

    it('應該處理複雜的 Markdown 轉換', () => {
      const markdown = `# Title.

Introduction, with comma.

- Item 1, description!
- Item 2, another description?
- Item 3.

Conclusion!`

      const result = replaceText(markdown, DEFAULT_RULES)

      // 檢查所有轉換
      expect(result).toContain('。')
      expect(result).toContain('，')
      expect(result).toContain('•')
      expect(result).toContain('！')
      expect(result).toContain('？')

      // 確認原始字元被替換
      expect(result).not.toContain('.')
      expect(result).not.toContain(',')
      expect(result).not.toContain('-')
      expect(result).not.toContain('!')
      expect(result).not.toContain('?')
    })

    it('應該處理自訂規則組合', () => {
      const text = 'convert THIS and THAT to lowercase'
      const customRules = [
        { from: 'THIS', to: 'this' },
        { from: 'THAT', to: 'that' },
      ]
      const result = replaceText(text, customRules)

      expect(result).toBe('convert this and that to lowercase')
    })

    it('應該處理表情符號替換', () => {
      const text = 'I am :) happy :('
      const emojiRules = [
        { from: ':)', to: '😊' },
        { from: ':(', to: '😢' },
      ]
      const result = replaceText(text, emojiRules)

      expect(result).toBe('I am 😊 happy 😢')
    })
  })
})
