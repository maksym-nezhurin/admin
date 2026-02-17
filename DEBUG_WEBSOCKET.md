# 🐛 WebSocket Debug Checklist

## 🔍 Крок 1: Перевір Backend

### 1.1 Backend повертає `websocket_url`?

```bash
curl -X POST http://localhost:8001/start/urls \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test",
    "urls": ["https://auto.ria.com/auto_kia_sportage_39453238.html"],
    "market": "autoria"
  }'
```

**Очікуваний результат:**
```json
{
  "task_id": "abc-123",
  "status": "enqueued",
  "websocket_url": "ws://localhost:8001/progress/abc-123/ws"  ← МАЄ БУТИ!
}
```

❌ **Якщо НЕ МАЄ `websocket_url`** → backend не оновлений!

---

## 🔍 Крок 2: Тест WebSocket (простий HTML)

1. Відкрий файл:
   ```
   http://localhost:3000/test-websocket.html
   ```

2. Натисни **"1️⃣ Test API"** → має створити задачу і отримати `websocket_url`

3. Натисни **"2️⃣ Connect WebSocket"** → має підключитись

4. Спостерігай за логами:
   - ✅ `WebSocket CONNECTED!` - підключення успішне
   - ✅ `🟢 connected: Connected to task abc-123` - backend підтвердив
   - ✅ `📊 Progress: 1/4 (25%)` - прогрес оновлюється
   - ✅ `🎯 ITEM PARSED!` - елементи парсяться

❌ **Якщо помилки** → дивись в консоль браузера та backend логи

---

## 🔍 Крок 3: Перевір Frontend

### 3.1 Відкрий консоль браузера (F12)

### 3.2 Створи нову задачу через UI

**Шукай в консолі:**

```
🚀 Starting new scraping task: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws
🔌 Connecting to task progress: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws
```

❌ **Якщо не бачиш** → `taskProgressEnabled` вимкнений або WebSocket URL відсутній

### 3.3 Перевір підписки

**Шукай в консолі:**

```
📌 New task progress subscription added
   Total subscriptions: 1
```

❌ **Якщо 0 subscriptions** → ScrapperContext не підписується!

### 3.4 Перевір підключення

**Шукай в консолі:**

```
✅ Task Progress WebSocket connected
   Task ID: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws
   Ready State: 1
```

❌ **Якщо Ready State не 1** → з'єднання не встановлено

### 3.5 Перевір повідомлення

**Коли backend відправляє події, шукай:**

```
📨 Task progress message received RAW: {"type":"item:parsed",...}
📈 notifyTaskProgressCallbacks called
   Data: {...}
   Active callbacks: 1
🔄 Calling task progress callback...
✅ Callback executed successfully
```

❌ **Якщо не бачиш** → події не доходять або не обробляються

---

## 🔍 Крок 4: Перевір Real-time Progress

### 4.1 В UI має бути switcher "Real-time progress"

```
┌─────────────────────────────────┐
│ Tasks List                      │
│ Real-time progress  ☑️ 🟢 Live │
└─────────────────────────────────┘
```

❌ **Якщо вимкнений** → увімкни!

### 4.2 Статус має бути 🟢 Live

```
🟢 Live        ← OK!
🟡 Connecting  ← Підключається...
⚪ Offline     ← НЕ підключений!
```

---

## 🐛 Типові проблеми

### Проблема 1: Backend не повертає `websocket_url`

**Причина:** Backend не оновлений до нової версії

**Рішення:**
1. Перевір код backend'а - має бути:
   ```javascript
   return {
     task_id,
     status: 'enqueued',
     websocket_url: `ws://${req.hostname}/progress/${task_id}/ws`
   };
   ```

2. Перезапусти backend:
   ```bash
   cd scraper
   npm start
   ```

---

### Проблема 2: WebSocket підключається, але повідомлень немає

**Причина:** Callbacks не зареєстровані

**Перевір:**
```javascript
// В консолі має бути:
📌 New task progress subscription added
   Total subscriptions: 1  ← має бути > 0
```

**Рішення:**
- Перевір що `taskProgressEnabled = true`
- Перевір що useEffect в ScrapperContext виконується

---

### Проблема 3: Backend відправляє події, але frontend не отримує

**Причина:** Невірний формат події або backend все ще використовує Socket.IO

**Перевір backend логи:**
```javascript
// ❌ СТАРИЙ формат (Socket.IO):
[socket.io] broadcast item:parsed

// ✅ НОВИЙ формат (Native WS):
[ws] Sent to ws://localhost:8001/progress/abc-123/ws: {"type":"item:parsed",...}
```

**Рішення:**
- Переконайся що backend використовує native WebSocket, НЕ Socket.IO
- Перевір формат подій - має бути JSON з полем `type`

---

### Проблема 4: "No WebSocket URL available"

**Причина:** API не повертає `websocket_url`

**Перевір:**
```bash
curl http://localhost:8001/progress/YOUR_TASK_ID
```

**Має повернути:**
```json
{
  "task_id": "abc-123",
  "status": "running",
  "websocket_url": "ws://localhost:8001/progress/abc-123/ws"  ← МАЄ БУТИ!
}
```

---

## 🎯 Quick Test

Виконай це в консолі браузера:

```javascript
// 1. Перевір чи є сервіс
const service = window.__socketService__;
console.log('Socket service:', service);

// 2. Підключись вручну
const testWs = new WebSocket('ws://localhost:8001/progress/TEST_TASK_ID/ws');

testWs.onopen = () => console.log('✅ CONNECTED!');
testWs.onmessage = (e) => console.log('📨 MESSAGE:', e.data);
testWs.onerror = (e) => console.error('❌ ERROR:', e);

// 3. Почекай 5 секунд і подивись на логи
```

---

## 📞 Якщо нічого не працює

1. **Перезапусти backend:**
   ```bash
   cd scraper
   npm start
   ```

2. **Перезапусти frontend:**
   ```bash
   npm run dev
   ```

3. **Очисти кеш браузера** (Ctrl+Shift+R)

4. **Перевір CORS** - має бути дозволено для `ws://`

5. **Відкрий Network tab** в DevTools:
   - Фільтр: `WS`
   - Подивись чи є WebSocket підключення
   - Перевір Messages tab

---

**Гарного debugging! 🐛🔍**
