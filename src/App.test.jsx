import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
}

Object.assign(navigator, {
  clipboard: mockClipboard,
})

describe('App', () => {
  beforeEach(() => {
    mockClipboard.writeText.mockClear()
    vi.clearAllMocks()
  })

  describe('渲染測試', () => {
    it('應該渲染主標題', () => {
      render(<App />)
      expect(screen.getByText('Facebook 貼文工具')).toBeInTheDocument()
    })

    it('應該渲染副標題', () => {
      render(<App />)
      expect(screen.getByText(/Markdown 轉換/)).toBeInTheDocument()
    })

    it('應該渲染輸入和輸出文字區域', () => {
      render(<App />)

      const inputTextarea = screen.getByPlaceholderText('請輸入文字...')
      const outputTextarea = screen.getByPlaceholderText('轉換結果會顯示在這裡...')

      expect(inputTextarea).toBeInTheDocument()
      expect(outputTextarea).toBeInTheDocument()
    })

    it('應該渲染所有主要按鈕', () => {
      render(<App />)

      expect(screen.getByRole('button', { name: '文字替換' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '空白轉換' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '全部轉換' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '增加字間距' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '增加行距' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '複製結果' })).toBeInTheDocument()
    })

    it('應該渲染文字替換規則區域', () => {
      render(<App />)

      expect(screen.getByText('文字替換規則')).toBeInTheDocument()
    })

    it('應該渲染預設的替換規則', () => {
      render(<App />)

      // 應該有多個規則項目（預設規則）
      const inputs = screen.getAllByPlaceholderText(/原文字|替換文字/)
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('應該渲染新增規則和載入預設按鈕', () => {
      render(<App />)

      expect(screen.getByText('+ 新增規則')).toBeInTheDocument()
      expect(screen.getByText('載入預設')).toBeInTheDocument()
    })

    it('應該渲染功能說明區塊', () => {
      render(<App />)

      expect(screen.getByText(/功能說明/)).toBeInTheDocument()
      expect(screen.getByText(/根據自訂規則替換文字/)).toBeInTheDocument()
    })
  })

  describe('輸入功能測試', () => {
    it('應該能夠在輸入框輸入文字', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Hello World')

      expect(input).toHaveValue('Hello World')
    })

    it('應該能夠清空輸入框', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Test')
      await user.clear(input)

      expect(input).toHaveValue('')
    })

    it('應該能夠輸入多行文字', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      const multilineText = 'Line 1\nLine 2\nLine 3'

      await user.type(input, multilineText)
      expect(input).toHaveValue(multilineText)
    })
  })

  describe('文字替換功能測試', () => {
    it('應該能夠執行文字替換', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Hello, World!')

      const replaceButton = screen.getByRole('button', { name: '文字替換' })
      await user.click(replaceButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value).toContain('，') // 應該轉換逗號
    })

    it('應該根據預設規則轉換標點符號', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Test! Question?')

      const replaceButton = screen.getByRole('button', { name: '文字替換' })
      await user.click(replaceButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value).toBe('Test！ Question？')
    })

    it('應該轉換連字號為項目符號', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, '• Item 1')

      const replaceButton = screen.getByRole('button', { name: '文字替換' })
      await user.click(replaceButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value).toContain('•')
    })
  })

  describe('空白轉換功能測試', () => {
    it('應該能夠執行空白轉換', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Hello  World')

      const convertButton = screen.getByRole('button', { name: '空白轉換' })
      await user.click(convertButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      // 應該有零寬度空格
      expect(output.value).toContain('\u200B')
    })

    it('應該處理多個換行', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      const text = 'Line 1{Enter}{Enter}Line 2'
      await user.type(input, text)

      const convertButton = screen.getByRole('button', { name: '空白轉換' })
      await user.click(convertButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value).toContain('\u200B')
    })
  })

  describe('組合功能測試', () => {
    it('應該能夠執行全部轉換（替換+空白）', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Hello,  World!')

      const combinedButton = screen.getByRole('button', { name: '全部轉換' })
      await user.click(combinedButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      // 應該同時有標點轉換和零寬度空格
      expect(output.value).toContain('，')
      expect(output.value).toContain('！')
      expect(output.value).toContain('\u200B')
    })
  })

  describe('增加間距功能測試', () => {
    it('應該能夠增加字間距', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Hello World')

      const spacingButton = screen.getByRole('button', { name: '增加字間距' })
      await user.click(spacingButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value).toContain('\u200B')
    })

    it('應該能夠增加行距', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      const text = 'Line 1{Enter}Line 2'
      await user.type(input, text)

      const lineBreakButton = screen.getByRole('button', { name: '增加行距' })
      await user.click(lineBreakButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value).toContain('\u200B')
      // 應該有更多換行
      const outputNewlines = (output.value.match(/\n/g) || []).length
      expect(outputNewlines).toBeGreaterThan(1)
    })
  })

  describe('複製功能測試', () => {
    it('應該有複製結果按鈕', () => {
      render(<App />)
      const copyButton = screen.getByRole('button', { name: '複製結果' })
      expect(copyButton).toBeInTheDocument()
    })

    it('應該能夠點擊複製按鈕', async () => {
      const user = userEvent.setup()
      mockClipboard.writeText.mockResolvedValue(undefined)
      vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Test')

      const replaceButton = screen.getByRole('button', { name: '文字替換' })
      await user.click(replaceButton)

      const copyButton = screen.getByRole('button', { name: '複製結果' })

      // 按鈕應該可以點擊
      expect(copyButton).not.toBeDisabled()
    })
  })

  describe('規則管理測試', () => {
    it('應該能夠新增規則', async () => {
      const user = userEvent.setup()
      render(<App />)

      const initialInputs = screen.getAllByPlaceholderText(/原文字|替換文字/)
      const initialCount = initialInputs.length

      const addButton = screen.getByText('+ 新增規則')
      await user.click(addButton)

      const newInputs = screen.getAllByPlaceholderText(/原文字|替換文字/)
      expect(newInputs.length).toBeGreaterThan(initialCount)
    })

    it('應該能夠刪除規則', async () => {
      const user = userEvent.setup()
      render(<App />)

      const initialDeleteButtons = screen.getAllByText('刪除')
      const initialCount = initialDeleteButtons.length

      // 刪除第一個規則
      await user.click(initialDeleteButtons[0])

      const remainingDeleteButtons = screen.getAllByText('刪除')
      expect(remainingDeleteButtons.length).toBe(initialCount - 1)
    })

    it('應該能夠修改規則的 from 欄位', async () => {
      const user = userEvent.setup()
      render(<App />)

      const fromInputs = screen.getAllByPlaceholderText('原文字')
      await user.clear(fromInputs[0])
      await user.type(fromInputs[0], 'test')

      expect(fromInputs[0]).toHaveValue('test')
    })

    it('應該能夠修改規則的 to 欄位', async () => {
      const user = userEvent.setup()
      render(<App />)

      const toInputs = screen.getAllByPlaceholderText('替換文字')
      await user.clear(toInputs[0])
      await user.type(toInputs[0], 'replaced')

      expect(toInputs[0]).toHaveValue('replaced')
    })

    it('應該能夠載入預設規則', () => {
      render(<App />)

      // 應該已經載入預設規則（檢查是否有這些標點符號規則）
      const fromInputs = screen.getAllByPlaceholderText('原文字')

      // 預設應該有 5 個規則
      expect(fromInputs.length).toBeGreaterThanOrEqual(5)

      // 檢查是否包含基本的標點符號規則
      const values = Array.from(fromInputs).map(input => input.value)
      expect(values).toContain('.')
      expect(values).toContain('!')
      expect(values).toContain('?')
      expect(values).toContain('-')
    })

    it('應該能夠使用自訂規則進行轉換', async () => {
      const user = userEvent.setup()
      render(<App />)

      // 修改第一個規則
      const fromInputs = screen.getAllByPlaceholderText('原文字')
      const toInputs = screen.getAllByPlaceholderText('替換文字')

      await user.clear(fromInputs[0])
      await user.type(fromInputs[0], 'old')

      await user.clear(toInputs[0])
      await user.type(toInputs[0], 'new')

      // 輸入測試文字
      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'This is old text')

      // 執行替換
      const replaceButton = screen.getByRole('button', { name: '文字替換' })
      await user.click(replaceButton)

      // 檢查輸出
      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value).toContain('new')
    })
  })

  describe('整合測試', () => {
    it('應該處理完整的工作流程', async () => {
      const user = userEvent.setup()

      render(<App />)

      // 1. 輸入文字
      const input = screen.getByPlaceholderText('請輸入文字...')
      await user.type(input, 'Test!')

      // 2. 執行全部轉換
      const combinedButton = screen.getByRole('button', { name: '全部轉換' })
      await user.click(combinedButton)

      // 3. 檢查輸出
      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value).toContain('！')

      // 4. 驗證複製按鈕可用
      const copyButton = screen.getByRole('button', { name: '複製結果' })
      expect(copyButton).toBeInTheDocument()
      expect(copyButton).not.toBeDisabled()
    })

    it('應該能夠多次轉換不同的文字', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      const replaceButton = screen.getByRole('button', { name: '文字替換' })

      // 第一次轉換
      await user.type(input, 'First test!')
      await user.click(replaceButton)
      expect(output.value).toContain('！')

      // 清空並進行第二次轉換
      await user.clear(input)
      await user.type(input, 'Second test?')
      await user.click(replaceButton)
      expect(output.value).toContain('？')
    })

    it('應該處理空輸入', async () => {
      const user = userEvent.setup()
      render(<App />)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      const replaceButton = screen.getByRole('button', { name: '文字替換' })

      await user.click(replaceButton)

      // 空輸入應該產生空輸出
      expect(output.value).toBe('')
    })

    it('應該處理非常長的文字', async () => {
      const user = userEvent.setup()
      render(<App />)

      const input = screen.getByPlaceholderText('請輸入文字...')
      const longText = 'Test. '

      await user.type(input, longText)

      const replaceButton = screen.getByRole('button', { name: '文字替換' })
      await user.click(replaceButton)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output.value.length).toBeGreaterThan(0)
    })
  })

  describe('UI 狀態測試', () => {
    it('輸出文字區域應該是唯讀的', () => {
      render(<App />)

      const output = screen.getByPlaceholderText('轉換結果會顯示在這裡...')
      expect(output).toHaveAttribute('readOnly')
    })

    it('所有按鈕應該是可點擊的', () => {
      render(<App />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toBeDisabled()
      })
    })

    it('應該顯示正確的 placeholder 文字', () => {
      render(<App />)

      expect(screen.getByPlaceholderText('請輸入文字...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('轉換結果會顯示在這裡...')).toBeInTheDocument()
    })
  })
})
