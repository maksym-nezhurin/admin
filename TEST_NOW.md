# 🧪 ТЕСТУВАННЯ ЗАРАЗ - Покрокові інструкції

## 🎯 Мета: Знайти чому WebSocket не підключається

---

## Крок 1️⃣: Перезавантаж сторінку

1. Натисни **Ctrl+Shift+R** (hard reload)
2. Відкрий консоль браузера **F12**
3. Очисти консоль (кнопка 🗑️ або Ctrl+L)

---

## Крок 2️⃣: Шукай перші логи

При завантаженні сторінки ти **МАЄ** побачити:

```
🚀 ScrapperProvider mounted
   taskProgressEnabled: true
   userId: YOUR_USER_ID

🔌 Socket subscriptions useEffect triggered
   taskProgressEnabled: true
   userId: YOUR_USER_ID
   
✅ Task progress is ENABLED, subscribing to updates...
📌 New task progress subscription added
   Total subscriptions: 1
```

### ❌ Якщо НЕ бачиш цих логів:
- ScrapperProvider не монтується → проблема в роутінгу
- taskProgressEnabled: false → хтось вимикає його

---

## Крок 3️⃣: Створи нову задачу

Натисни кнопку **"Start Request"** / **"Почати скрапінг"**

### Ти **МАЄ** побачити:

```
🎬 onHandleStart called
   taskProgressEnabled: true
   
📡 Calling API /start with params: {...}

📦 API Response: {task_id: "...", status: "...", websocket_url: "..."}
   Task ID: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws

➕ Adding task to requests list: abc-123
✅ Task added to requests list

🔍 Checking if should auto-connect...
   taskProgressEnabled: true
   
✅ Task progress is enabled, proceeding with connection...

🚀 Starting new scraping task: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws
   
🔌 Connecting to task progress: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws
```

### ❌ Якщо бачиш:

```javascript
❌ Task progress is DISABLED - not connecting to WebSocket
```
→ **taskProgressEnabled = false** - перевір чому!

### ❌ Якщо бачиш:

```javascript
❌ No websocket_url in API response!
⚠️ Using fallback WebSocket URL: ws://...
```
→ Backend не повертає `websocket_url`, але fallback спрацює

---

## Крок 4️⃣: Перевір підключення

Після спроби підключення **МАЄ** бути:

```
✅ Task Progress WebSocket connected
   Task ID: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws
   Ready State: 1

📨 Task progress message received RAW: {"type":"connected",...}
```

### ❌ Якщо НЕ бачиш підключення:

1. **Перевір Network tab:**
   - Відкрий вкладку **Network**
   - Фільтр: **WS** (WebSocket)
   - Має бути з'єднання зі статусом **101 Switching Protocols**
   - Якщо червоне - backend не відповідає

2. **Перевір backend:**
   - Backend запущений?
   - Порт правильний? (8001)
   - Backend має endpoint `/progress/{taskId}/ws`?

---

## Крок 5️⃣: Перевір Auto-connect

Якщо ти створив задачу, але не підключився вручну, **МАЄ** спрацювати auto-connect:

```
🔧 Auto-connect effect triggered
   taskProgressEnabled: true
   requests.length: 1
   activeSubscriptions.size: 0
   
✅ Task progress enabled, checking for in-progress tasks...

📊 Found in-progress tasks to connect: 1
   Task IDs: ["abc-123"]
   Task statuses: [{id: "abc-123", status: "enqueued"}]
   
🔄 Auto-connecting to task progress for task: abc-123
```

### ❌ Якщо бачиш:

```javascript
ℹ️ No in-progress tasks found, nothing to connect
```
→ Задача має статус 'finished' або 'failed', або вже підключена

---

## 🐛 Типові проблеми

### Проблема 1: Взагалі немає логів про підключення

**Причина:** `taskProgressEnabled = false`

**Де перевірити:**
1. Консоль при завантаженні: `taskProgressEnabled: false`
2. UI: Switcher "Real-time progress" вимкнений

**Рішення:** Увімкни switcher!

---

### Проблема 2: Логи є, але WebSocket не створюється

**Причина:** Помилка в `connectToTaskProgress()`

**Шукай:**
```javascript
❌ Invalid WebSocket URL: undefined
```
→ URL не передається правильно

**Або:**
```javascript
❌ Failed to connect to task progress WebSocket: Error: ...
```
→ Дивись деталі помилки

---

### Проблема 3: WebSocket підключається, але статус не 1

```
Ready State: 0  ← Connecting (нормально, почекай)
Ready State: 1  ← Open (OK!)
Ready State: 2  ← Closing (backend закриває з'єднання)
Ready State: 3  ← Closed (backend не відповідає)
```

**Якщо Ready State = 3:**
→ Backend закрив з'єднання або не відповідає

---

### Проблема 4: Backend відповідає 404

**Network tab показує:**
```
ws://localhost:8001/progress/abc-123/ws
Status: 404 Not Found
```

**Причина:** Backend не має цього endpoint'а

**Перевір backend:**
```javascript
// Має бути щось типу:
fastify.get('/progress/:taskId/ws', { websocket: true }, (socket, req) => {
  // ...
});
```

---

## 📋 Checklist перед тим як писати мені

Зроби screenshot або скопіюй консольні логи:

- [ ] ✅ Логи при завантаженні (ScrapperProvider mounted)
- [ ] ✅ Логи при створенні задачі (onHandleStart called)
- [ ] ✅ API Response (має бути task_id і websocket_url)
- [ ] ✅ Спроба підключення (Connecting to task progress)
- [ ] ✅ Результат підключення (connected або error)
- [ ] ✅ Network tab - WS фільтр (screenshot)
- [ ] ✅ Backend логи (що там пишеться?)

---

## 🎯 Швидкий тест без UI

Якщо хочеш перевірити чи backend взагалі працює:

**Відкрий:** http://localhost:3000/test-websocket.html

1. Натисни **"1️⃣ Test API"**
2. Натисни **"2️⃣ Connect WebSocket"**

Якщо тут працює → проблема у React інтеграції  
Якщо тут НЕ працює → проблема у backend

---

**Тепер спробуй і покажи мені що ти бачиш у консолі! 🔍**

Особливо важливо:
- Чи є лог "🚀 ScrapperProvider mounted"?
- Чи є лог "🎬 onHandleStart called"?
- Чи є лог "🔌 Connecting to task progress"?
