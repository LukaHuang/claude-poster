import { useState, useEffect } from 'react'
import { convertWhitespace, addSpacingAfterSpaces, addExtraLineBreaks } from './lib/whitespaceConverter'
import { replaceText, DEFAULT_RULES } from './lib/textReplacer'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [replacementRules, setReplacementRules] = useState(DEFAULT_RULES)
  const [showCopiedMsg, setShowCopiedMsg] = useState(false)

  // 轉換選項
  const [enableTextReplace, setEnableTextReplace] = useState(true)
  const [enableWhitespace, setEnableWhitespace] = useState(false)
  const [enableSpacing, setEnableSpacing] = useState(false)
  const [enableLineBreaks, setEnableLineBreaks] = useState(false)

  // 複製到剪貼簿
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowCopiedMsg(true)
      setTimeout(() => setShowCopiedMsg(false), 2000)
    } catch (err) {
      alert('複製失敗，請手動複製')
    }
  }

  // 自動執行轉換
  const performConversion = (text) => {
    let result = text

    if (enableTextReplace) {
      result = replaceText(result, replacementRules)
    }
    if (enableWhitespace) {
      result = convertWhitespace(result)
    }
    if (enableSpacing) {
      result = addSpacingAfterSpaces(result)
    }
    if (enableLineBreaks) {
      result = addExtraLineBreaks(result)
    }

    return result
  }

  // 當輸入改變或選項改變時，自動轉換
  useEffect(() => {
    if (inputText) {
      const result = performConversion(inputText)
      setOutputText(result)

      // 自動複製到剪貼簿
      if (result && result !== inputText) {
        copyToClipboard(result)
      }
    } else {
      setOutputText('')
    }
  }, [inputText, enableTextReplace, enableWhitespace, enableSpacing, enableLineBreaks, replacementRules])

  // 處理貼上事件
  const handlePaste = async (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    setInputText(pastedText)
  }

  // 功能 1: 空白字元轉換
  const handleWhitespaceConvert = () => {
    const converted = convertWhitespace(inputText)
    setOutputText(converted)
  }

  const handleAddSpacing = () => {
    const converted = addSpacingAfterSpaces(inputText)
    setOutputText(converted)
  }

  const handleAddLineBreaks = () => {
    const converted = addExtraLineBreaks(inputText)
    setOutputText(converted)
  }

  // 功能 2: 文字替換
  const handleTextReplace = () => {
    const replaced = replaceText(inputText, replacementRules)
    setOutputText(replaced)
  }

  // 組合功能：先替換文字，再轉換空白
  const handleCombined = () => {
    let result = replaceText(inputText, replacementRules)
    result = convertWhitespace(result)
    setOutputText(result)
  }

  // 新增規則
  const addRule = () => {
    setReplacementRules([...replacementRules, { from: '', to: '' }])
  }

  // 刪除規則
  const removeRule = (index) => {
    const newRules = replacementRules.filter((_, i) => i !== index)
    setReplacementRules(newRules)
  }

  // 更新規則
  const updateRule = (index, field, value) => {
    const newRules = [...replacementRules]
    newRules[index][field] = value
    setReplacementRules(newRules)
  }

  // 載入預設規則
  const loadDefaultRules = () => {
    setReplacementRules(DEFAULT_RULES)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - 野獸派風格 */}
        <header className="container-brutalist p-6 md:p-8 bg-brutalist-red">
          <h1 className="title-brutalist text-brutalist-white border-brutalist-white">
            FB POSTER
          </h1>
          <p className="mt-4 text-lg md:text-xl font-bold text-brutalist-white uppercase">
            文字處理 × 格式轉換 × 一鍵完成
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左欄：輸入區 */}
          <div className="space-y-6">
            {/* 輸入框 */}
            <div className="container-brutalist p-6 bg-brutalist-white">
              <h2 className="text-2xl font-bold uppercase mb-4 border-b-4 border-brutalist-black pb-2">
                📝 輸入文字
              </h2>
              <textarea
                id="input"
                className="input-brutalist min-h-[300px] resize-y"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onPaste={handlePaste}
                placeholder="貼上文字即可自動轉換並複製..."
              />
            </div>

            {/* 規則設定 */}
            <div className="container-brutalist p-6 bg-brutalist-blue">
              <h2 className="text-2xl font-bold uppercase mb-4 text-brutalist-white border-b-4 border-brutalist-white pb-2">
                ⚙️ 替換規則
              </h2>
              <div className="space-y-3">
                {replacementRules.map((rule, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="input-brutalist flex-1 p-2 text-sm"
                      placeholder="原文字"
                      value={rule.from}
                      onChange={(e) => updateRule(index, 'from', e.target.value)}
                    />
                    <span className="text-2xl font-bold text-brutalist-white">→</span>
                    <input
                      type="text"
                      className="input-brutalist flex-1 p-2 text-sm"
                      placeholder="替換文字"
                      value={rule.to}
                      onChange={(e) => updateRule(index, 'to', e.target.value)}
                    />
                    <button
                      className="btn-brutalist-danger text-sm px-4 py-2"
                      onClick={() => removeRule(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn-brutalist-secondary flex-1" onClick={addRule}>
                  + 新增
                </button>
                <button className="btn-brutalist text-sm" onClick={loadDefaultRules}>
                  載入預設
                </button>
              </div>
            </div>
          </div>

          {/* 右欄：輸出區 */}
          <div className="space-y-6">
            {/* 輸出框 */}
            <div className="container-brutalist p-6 bg-brutalist-white relative">
              <div className="flex justify-between items-center mb-4 border-b-4 border-brutalist-black pb-2">
                <h2 className="text-2xl font-bold uppercase">
                  ✨ 轉換結果
                </h2>
                {showCopiedMsg && (
                  <span className="text-lg font-bold text-brutalist-green uppercase animate-pulse">
                    ✓ 已複製！
                  </span>
                )}
              </div>
              <textarea
                id="output"
                className="input-brutalist min-h-[300px] resize-y bg-gray-50"
                value={outputText}
                readOnly
                placeholder="轉換結果會自動顯示並複製..."
              />
            </div>

            {/* 轉換選項 */}
            <div className="container-brutalist p-6 bg-brutalist-green">
              <h2 className="text-2xl font-bold uppercase mb-4 border-b-4 border-brutalist-black pb-2">
                🚀 轉換選項
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border-4 border-brutalist-black hover:translate-x-1 hover:translate-y-1 transition-transform">
                  <input
                    type="checkbox"
                    className="checkbox-brutalist"
                    checked={enableTextReplace}
                    onChange={(e) => setEnableTextReplace(e.target.checked)}
                  />
                  <span className="text-lg font-bold uppercase">文字替換</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border-4 border-brutalist-black hover:translate-x-1 hover:translate-y-1 transition-transform">
                  <input
                    type="checkbox"
                    className="checkbox-brutalist"
                    checked={enableWhitespace}
                    onChange={(e) => setEnableWhitespace(e.target.checked)}
                  />
                  <span className="text-lg font-bold uppercase">空白轉換</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border-4 border-brutalist-black hover:translate-x-1 hover:translate-y-1 transition-transform">
                  <input
                    type="checkbox"
                    className="checkbox-brutalist"
                    checked={enableSpacing}
                    onChange={(e) => setEnableSpacing(e.target.checked)}
                  />
                  <span className="text-lg font-bold uppercase">字間距+</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border-4 border-brutalist-black hover:translate-x-1 hover:translate-y-1 transition-transform">
                  <input
                    type="checkbox"
                    className="checkbox-brutalist"
                    checked={enableLineBreaks}
                    onChange={(e) => setEnableLineBreaks(e.target.checked)}
                  />
                  <span className="text-lg font-bold uppercase">行距+</span>
                </label>
              </div>
            </div>

            {/* 說明 */}
            <div className="container-brutalist p-6 bg-brutalist-yellow border-brutalist-black">
              <h3 className="text-xl font-bold uppercase mb-3">💡 使用說明</h3>
              <div className="space-y-2 font-mono text-sm">
                <p>→ 貼上文字即自動轉換並複製</p>
                <p>→ 勾選需要的轉換功能</p>
                <p>→ 支援多種轉換同時進行</p>
                <p>→ 轉換完成後自動複製</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Copyright */}
        <footer className="container-brutalist p-4 bg-brutalist-black text-center">
          <p className="font-mono text-brutalist-white uppercase tracking-wide">
            © 2025 @LukaHuang - All Rights Reserved
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
