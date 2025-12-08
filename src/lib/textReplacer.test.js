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
      const commaRule = DEFAULT_RULES.find(rule => rule.from === ', ')
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

  describe('preserveUrls 和 preserveEmails 選項', () => {
    it('應該保護網址中的點號不被替換', () => {
      const text = 'Visit https://example.com for more info.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveUrls: true })

      expect(result).toBe('Visit https://example.com for more info。')
    })

    it('應該保護多個網址', () => {
      const text = 'Check https://google.com and https://github.com/user/repo for details.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveUrls: true })

      expect(result).toBe('Check https://google.com and https://github.com/user/repo for details。')
    })

    it('應該保護 www 開頭的網址', () => {
      const text = 'Visit www.example.com for more info.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveUrls: true })

      expect(result).toBe('Visit www.example.com for more info。')
    })

    it('應該保護 email 中的點號和符號不被替換', () => {
      const text = 'Contact me at test@example.com for questions.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveEmails: true })

      expect(result).toBe('Contact me at test@example.com for questions。')
    })

    it('應該同時保護網址和 email', () => {
      const text = 'Visit https://example.com or email test@example.com for help.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveUrls: true, preserveEmails: true })

      expect(result).toBe('Visit https://example.com or email test@example.com for help。')
    })

    it('應該處理複雜的網址（含路徑和參數）', () => {
      const text = 'Link: https://example.com/path/to/page.html?query=1&foo=bar. Done.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveUrls: true })

      expect(result).toBe('Link: https://example.com/path/to/page.html?query=1&foo=bar。 Done。')
    })

    it('應該處理多個 email', () => {
      const text = 'Email john.doe@company.com or jane.smith@example.org for info.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveEmails: true })

      expect(result).toBe('Email john.doe@company.com or jane.smith@example.org for info。')
    })

    it('不啟用選項時應該正常替換所有符號', () => {
      const text = 'Visit https://example.com for info.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules)

      expect(result).toBe('Visit https://example。com for info。')
    })

    it('應該處理網址中的連字號', () => {
      const text = 'Visit https://my-site.example.com. Thanks!'
      const rules = [
        { from: '.', to: '。' },
        { from: '-', to: '•' },
      ]
      const result = replaceText(text, rules, { preserveUrls: true })

      expect(result).toBe('Visit https://my-site.example.com。 Thanks!')
    })

    it('應該使用預設規則時保護網址和 email', () => {
      const text = 'Check https://example.com, and email test@mail.com!'
      const result = replaceText(text, DEFAULT_RULES, { preserveUrls: true, preserveEmails: true })

      expect(result).toContain('https://example.com')
      expect(result).toContain('test@mail.com')
      expect(result).toContain('，') // ", " 被轉換成 "，"
      expect(result).toContain('！')
    })

    it('應該處理沒有協議的網址 (僅有 www)', () => {
      const text = 'Go to www.google.com.tw for search.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveUrls: true })

      expect(result).toBe('Go to www.google.com.tw for search。')
    })

    it('應該處理 ftp 協議的網址', () => {
      const text = 'Download from ftp://files.example.com/file.zip today.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveUrls: true })

      expect(result).toBe('Download from ftp://files.example.com/file.zip today。')
    })

    it('preserveUrls: false 時不應保護網址', () => {
      const text = 'Visit https://example.com for info.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveUrls: false })

      expect(result).toBe('Visit https://example。com for info。')
    })

    it('preserveEmails: false 時不應保護 email', () => {
      const text = 'Email test@example.com for info.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveEmails: false })

      expect(result).toBe('Email test@example。com for info。')
    })

    it('應該保護千分位數字格式', () => {
      const text = 'The price is 30,000 dollars.'
      const rules = [{ from: ', ', to: '，' }]
      const result = replaceText(text, rules, { preserveNumbers: true })

      expect(result).toBe('The price is 30,000 dollars.')
    })

    it('應該保護多個千分位數字', () => {
      const text = 'From 1,000 to 1,000,000 items.'
      const rules = [{ from: ', ', to: '，' }]
      const result = replaceText(text, rules, { preserveNumbers: true })

      expect(result).toContain('1,000')
      expect(result).toContain('1,000,000')
    })

    it('應該保護小數點數字', () => {
      const text = 'Pi is approximately 3.14.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveNumbers: true })

      expect(result).toBe('Pi is approximately 3.14。')
    })

    it('應該保護百分比數字', () => {
      const text = 'Growth rate is 99.9%.'
      const rules = [{ from: '.', to: '。' }]
      const result = replaceText(text, rules, { preserveNumbers: true })

      expect(result).toBe('Growth rate is 99.9%。')
    })

    it('應該保護帶貨幣符號的數字', () => {
      const text = 'Total cost is $1,234.56.'
      const rules = [
        { from: ', ', to: '，' },
        { from: '.', to: '。' },
      ]
      const result = replaceText(text, rules, { preserveNumbers: true })

      expect(result).toContain('$1,234.56')
      expect(result).toContain('。')
    })

    it('不啟用 preserveNumbers 時應該正常替換數字中的符號', () => {
      const text = 'The price is 30,000 dollars.'
      const rules = [{ from: ',', to: '，' }]
      const result = replaceText(text, rules, { preserveNumbers: false })

      expect(result).toBe('The price is 30，000 dollars.')
    })

    it('應該同時保護網址、email 和數字', () => {
      const text = 'Visit https://example.com, email test@mail.com, and pay $1,000.00!'
      const rules = [
        { from: ', ', to: '，' },
        { from: '.', to: '。' },
        { from: '!', to: '！' },
      ]
      const result = replaceText(text, rules, {
        preserveUrls: true,
        preserveEmails: true,
        preserveNumbers: true
      })

      expect(result).toContain('https://example.com')
      expect(result).toContain('test@mail.com')
      expect(result).toContain('$1,000.00')
      expect(result).toContain('！')
    })
  })

  describe('整合測試', () => {
    it('應該使用預設規則轉換文字', () => {
      const text = 'Hello, World! How are you? I am fine.'
      const result = replaceText(text, DEFAULT_RULES)

      // DEFAULT_RULES 的逗號規則是 ", " (逗號+空白) 轉成 "，"
      expect(result).toBe('Hello，World！ How are you？ I am fine。')
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
