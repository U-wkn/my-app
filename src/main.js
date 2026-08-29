import './style.css'

const initialItems = ['焼肉', '寿司', 'カレー', 'ラーメン', 'パスタ', 'ハンバーガー']
const palette = ['#ee9aae', '#f1c18b', '#c9b5f1', '#9abfe8', '#a5d0a8', '#efcf7d']

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-mark">✦</div>
      <h1>ルーレットアプリ</h1>
    </header>

    <main class="layout">
      <aside class="panel left-panel">
        <div class="panel-header">項目を追加</div>

        <div class="add-form">
          <input id="itemInput" type="text" placeholder="例：焼肉、寿司、ラーメンなど" />
          <button id="addButton" class="primary-button">追加</button>
        </div>

        <div class="list-header-row">
          <div id="listCount" class="list-count">項目一覧 (6件)</div>
          <button id="resetButton" class="secondary-button small-button" type="button">リセット</button>
        </div>

        <ul id="itemList" class="item-list"></ul>

        <button id="spinButton" class="action-button" type="button">▶ ルーレットを回す</button>
      </aside>

      <section class="panel right-panel">
        <div class="roulette-wrap">
          <div class="pointer" aria-hidden="true"></div>
          <div id="rouletteWheel" class="roulette-wheel" aria-label="ルーレット">
            <div id="rouletteLabels" class="wheel-labels" aria-hidden="true"></div>
          </div>
          <div class="wheel-center" aria-hidden="true"></div>
        </div>

        <div class="result-box">
          <div class="result-label" id="resultLabel">結果</div>
          <div class="result-value" id="resultValue">焼肉</div>
        </div>

        <div class="bottom-actions">
          <button id="spinAgainButton" class="action-button alt" type="button">↻ もう一度回す</button>
          <button id="clearButton" class="secondary-button" type="button">リセット</button>
        </div>
      </section>
    </main>
  </div>
`

const items = [...initialItems]
const itemInput = document.querySelector('#itemInput')
const addButton = document.querySelector('#addButton')
const itemList = document.querySelector('#itemList')
const listCount = document.querySelector('#listCount')
const spinButton = document.querySelector('#spinButton')
const spinAgainButton = document.querySelector('#spinAgainButton')
const resultLabel = document.querySelector('#resultLabel')
const resultValue = document.querySelector('#resultValue')
const rouletteWheel = document.querySelector('#rouletteWheel')
const rouletteLabels = document.querySelector('#rouletteLabels')
const resetButton = document.querySelector('#resetButton')
const clearButton = document.querySelector('#clearButton')

function renderList() {
  itemList.innerHTML = ''
  listCount.textContent = `項目一覧 (${items.length}件)`

  items.forEach((item, index) => {
    const li = document.createElement('li')
    li.className = 'item-row'

    const left = document.createElement('div')
    left.className = 'item-main'

    const dot = document.createElement('span')
    dot.className = 'item-dot'
    dot.style.background = palette[index % palette.length]

    const text = document.createElement('span')
    text.className = 'item-text'
    text.textContent = item

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'delete-button'
    deleteButton.setAttribute('aria-label', `${item}を削除`)
    deleteButton.innerHTML = '🗑'
    deleteButton.addEventListener('click', () => {
      items.splice(index, 1)
      if (items.length < 2) {
        resultValue.textContent = '項目を追加してください'
      }
      renderList()
      renderWheel()
    })

    left.append(dot, text)
    li.append(left, deleteButton)
    itemList.appendChild(li)
  })
}

function renderWheel() {
  const angleStep = 360 / items.length
  const gradientStops = items
    .map((_, index) => {
      const start = index * angleStep
      const end = (index + 1) * angleStep
      return `${palette[index % palette.length]} ${start}deg ${end}deg`
    })
    .join(', ')

  rouletteWheel.style.background = `conic-gradient(${gradientStops})`

  rouletteLabels.innerHTML = ''

  items.forEach((item, index) => {
    const label = document.createElement('div')
    label.className = 'wheel-label'
    label.textContent = item
    const angle = (index + 0.5) * angleStep
    label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-170px) rotate(${-angle}deg)`
    rouletteLabels.appendChild(label)
  })
}

function setResultValue(item) {
  resultValue.textContent = item
}

function addItem() {
  const value = itemInput.value.trim()
  if (!value) return

  if (items.length >= 10) return

  items.push(value)
  itemInput.value = ''
  renderList()
  renderWheel()
}

function spinRoulette() {
  if (items.length < 2) {
    resultValue.textContent = '項目を追加してください'
    return
  }

  const randomIndex = Math.floor(Math.random() * items.length)
  const currentRotation = Number(rouletteWheel.dataset.rotation || 0)
  const segmentAngle = 360 / items.length
  const targetCenterAngle = (randomIndex + 0.5) * segmentAngle
  const additionalTurns = 6
  const targetRotation = currentRotation + additionalTurns * 360 + (360 - targetCenterAngle)

  rouletteWheel.style.transition = 'transform 4.5s cubic-bezier(0.16, 0.8, 0.2, 1)'
  rouletteWheel.style.transform = `rotate(${targetRotation}deg)`
  rouletteWheel.dataset.rotation = String(targetRotation)

  resultLabel.style.display = 'none'
  resultValue.textContent = ''

  spinButton.disabled = true
  spinAgainButton.disabled = true

  setTimeout(() => {
    setResultValue(items[randomIndex])
    resultLabel.style.display = 'block'
    spinButton.disabled = false
    spinAgainButton.disabled = false
  }, 4500)
}

function resetAll() {
  items.length = 0
  initialItems.forEach((item) => items.push(item))
  resultLabel.style.display = 'block'
  setResultValue('焼肉')
  renderList()
  renderWheel()
}

addButton.addEventListener('click', addItem)
itemInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') addItem()
})
spinButton.addEventListener('click', spinRoulette)
spinAgainButton.addEventListener('click', spinRoulette)
resetButton.addEventListener('click', resetAll)
clearButton.addEventListener('click', resetAll)

renderList()
renderWheel()
setResultValue('焼肉')
resultLabel.style.display = 'block'