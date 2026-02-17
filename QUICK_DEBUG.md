# 🚀 Швидкий Debug WebSocket

## 📋 Швидкі кроки для вирішення проблеми

### 1️⃣ Відкрий консоль браузера (F12)

Тепер з'явилось БАГАТО логів, які допоможуть знайти проблему! 🔍

---

### 2️⃣ Створи нову задачу через UI

**Шукай в консолі:**

```javascript
// Крок 1: API Response
📦 API Response: {task_id: "...", status: "...", websocket_url: "ws://..."}
   Task ID: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws

// ❌ Якщо бачиш це:
❌ No websocket_url in API response!
⚠️ Using fallback WebSocket URL: ws://localhost:8001/progress/abc-123/ws
// → Backend не повертає websocket_url, але fallback спрацює!

// Крок 2: Підписка
📌 New task progress subscription added
   Total subscriptions: 1

// Крок 3: Підключення
🔌 Connecting to task progress WebSocket: ws://localhost:8001/progress/abc-123/ws
✅ Task Progress WebSocket connected
   Task ID: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws
   Ready State: 1

// Крок 4: Отримання повідомлень
📨 Task progress message received RAW: {"type":"connected",...}
📈 notifyTaskProgressCallbacks called
   Active callbacks: 1
🔄 Calling task progress callback...
✅ Callback executed successfully
```

---

### 3️⃣ Простий тест (без UI)

Відкрий: **http://localhost:3000/test-websocket.html**

1. Натисни **"1️⃣ Test API"**
2. Натисни **"2️⃣ Connect WebSocket"**
3. Спостерігай за логами

✅ **Якщо тут працює** → проблема у frontend інтеграції  
❌ **Якщо тут НЕ працює** → проблема у backend

---

### 4️⃣ Перевір Real-time Progress

У твоєму UI має бути:

```
┌────────────────────────────────┐
│ Tasks List                     │
│ Real-time progress ☑️ 🟢 Live  │
└────────────────────────────────┘
```

❌ **Якщо ☐ (не вибрано)** → увімкни switcher!  
❌ **Якщо 🔴 Offline** → WebSocket не підключений

---

## 🐛 Що робити якщо не працює?

### Варіант 1: Бачиш "⚠️ Using fallback WebSocket URL"

**Це означає:** Backend не повертає `websocket_url` в API response

**Що робити:**
1. Перевір backend код - має повертати:
   ```javascript
   {
     task_id: "abc-123",
     status: "enqueued",
     websocket_url: `ws://${host}/progress/${task_id}/ws`  // ← додай це
   }
   ```

2. Перезапусти backend

3. Frontend буде працювати з fallback, але краще виправити backend

---

### Варіант 2: Бачиш "Active callbacks: 0"

**Це означає:** Ніхто не підписаний на події

**Що робити:**
1. Перевір що Real-time progress увімкнений (switcher)
2. Подивись в ScrapperContext useEffect - може є помилка
3. Перезавантаж сторінку

---

### Варіант 3: НЕ бачиш "📨 Task progress message received RAW"

**Це означає:** Backend не відправляє повідомлення або WebSocket не підключений

**Перевір:**
1. WebSocket підключений? Має бути "Ready State: 1"
2. Backend відправляє події? Подивись в backend логи
3. CORS налаштований для WebSocket?

**Backend має логувати:**
```javascript
[ws] Client connected to /progress/abc-123/ws
[ws] Sending message: {"type":"item:parsed",...}
```

❌ **НЕ має бути:**
```javascript
[socket.io] broadcast item:parsed  // ← ЦЕ СТАРИЙ ФОРМАТ!
```

---

### Варіант 4: Backend відправляє, але frontend не обробляє

**Перевір формат події:**

```javascript
// ✅ ПРАВИЛЬНИЙ формат:
{
  "type": "item:parsed",    // ← МАЄ бути поле "type"!
  "taskId": "abc-123",
  "item": {...}
}

// ❌ НЕПРАВИЛЬНИЙ:
{
  "event": "item:parsed",   // ← НЕ "event", а "type"!
  "data": {...}
}
```

---

## 🔧 Debug команди

### В консолі браузера:

```javascript
// 1. Перевір сервіс
const socketService = require('../services/socketService').getSocketService();
console.log('Callbacks:', socketService);

// 2. Підключись вручну
const testWs = new WebSocket('ws://localhost:8001/progress/TEST/ws');
testWs.onopen = () => console.log('✅ OK');
testWs.onmessage = (e) => console.log('📨', e.data);
testWs.onerror = (e) => console.error('❌', e);

// 3. Перевір Network tab (WS filter)
// Має бути WebSocket connection зі статусом 101
```

---

## 📞 Все ще не працює?

1. **Покажи мені консольні логи** - скопіюй все що бачиш
2. **Покажи backend логи** - що там пишеться?
3. **Покажи Network tab (WS)** - чи є WebSocket connection?

---

## ✅ Коли все працює

Ти побачиш в консолі красиві логи:

```
🎯 ITEM PARSED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Kia Sportage 2024
💰 Price: $27600
📍 Year: 2024 | Mileage: 50000 km
📞 Phone: (063) 061 71 83
🏢 Seller: AutoHouse Kyiv
   Active ads: 11 | Total ads: 150
🔗 URL: https://auto.ria.com/...
   VIN: U5YPV81DBRL257240
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Progress: 1/4 (25%)
```

**🎉 Насолоджуйся real-time оновленнями!**

---

**Файли для debug:**
- `test-websocket.html` - простий HTML тест
- `DEBUG_WEBSOCKET.md` - детальний checklist
- Консоль браузера - головний інструмент! 🔍
