# 🔍 Покращений Debug - WebSocket Connection Tracking

## ✅ Що було додано:

### 1. Детальніші логи при блокуванні повторних підключень

```javascript
⏭️ Preventing duplicate connection attempt for task: abc-123
   Time since last attempt: 1202 ms
   Previous WebSocket URL: ws://localhost:8001/progress/abc-123/ws
   Current activeConnections: ["abc-123"]
   Current WebSocket state: 1  // 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
```

**Що це означає:**
- Якщо `WebSocket state: 1` → підключення вже є, все OK!
- Якщо `WebSocket state: 0` → все ще підключається
- Якщо `WebSocket state: 3` → підключення закрите, треба retry

### 2. Автоматичний retry після невдалого підключення

```javascript
// При помилці:
❌ Task Progress WebSocket error
🔄 Clearing connection tracking after error for task: abc-123

// При timeout:
⏰ Task progress WebSocket connection timeout for task: abc-123
🔄 Clearing connection tracking after timeout for task: abc-123
```

**Результат:** Можна спробувати підключитись знову!

### 3. Smart detection вже підключених WebSocket

```javascript
// Якщо WebSocket вже відкритий:
⏭️ Preventing duplicate connection attempt...
   Current WebSocket state: 1
✅ WebSocket already connected for this task, returning true
```

**Результат:** Не блокує якщо вже підключено!

### 4. Детальніші логи створення WebSocket

```javascript
🔗 Creating new WebSocket connection...
   URL: ws://localhost:8001/progress/abc-123/ws
   Task ID: abc-123
✅ WebSocket object created, state: 0
   0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
```

### 5. Автоматичне очищення tracking після успішного підключення

```javascript
✅ Task progress WebSocket connected for task: abc-123
   Connection successful after 127 ms
📊 Active connections: ["abc-123"]

// Через 10 секунд:
🔄 Resetting connection tracking for task: abc-123
```

---

## 🧪 ТЕСТУВАННЯ ЗАРАЗ

### Крок 1: Перезавантаж сторінку
```
Ctrl+Shift+R
F12 (відкрий консоль)
Очисти консоль (🗑️)
```

### Крок 2: Подивись що відбувається

#### A) Якщо задача вже є (in-progress):

```javascript
🔧 Auto-connect effect triggered
📊 Found in-progress tasks to connect: 1

// Якщо вже підключались раніше:
⏭️ Preventing duplicate connection attempt for task: abc-123
   Time since last attempt: 1202 ms
   Current WebSocket state: 3  ← ЗАКРИТИЙ!

// Має очиститись tracking і спробувати знову через 10 сек
```

#### B) Якщо створюєш нову задачу:

```javascript
🎬 onHandleStart called
📡 Calling API /start...

📦 API Response: {...}
🔗 Creating new WebSocket connection...
   URL: ws://localhost:8001/progress/abc-123/ws
   Task ID: abc-123
✅ WebSocket object created, state: 0

// Через кілька мілісекунд:
✅ Task progress WebSocket connected for task: abc-123
   Connection successful after 127 ms
📊 Active connections: ["abc-123"]

📨 Task progress message received RAW: {"type":"connected",...}
```

#### C) Якщо WebSocket не може підключитись:

```javascript
🔗 Creating new WebSocket connection...
❌ Task Progress WebSocket error: [error details]
   Task ID: abc-123
   WebSocket URL: ws://localhost:8001/progress/abc-123/ws
🔄 Clearing connection tracking after error
```

**Тепер можна спробувати знову!**

---

## 🎯 Діагностика по WebSocket state:

| State | Значення | Що робити |
|-------|----------|-----------|
| 0 | CONNECTING | Почекай 1-2 секунди |
| 1 | OPEN | ✅ Все працює! |
| 2 | CLOSING | Backend закриває з'єднання |
| 3 | CLOSED | ❌ Не підключено. Перевір backend |

---

## 🔍 Що шукати в консолі:

### ✅ Успішний сценарій:
```
1. 🔗 Creating new WebSocket connection...
2. ✅ WebSocket object created, state: 0
3. ✅ Task progress WebSocket connected (state: 1)
4. 📨 Task progress message received RAW
5. 🎯 ITEM PARSED!
```

### ❌ Проблемний сценарій А (Backend не відповідає):
```
1. 🔗 Creating new WebSocket connection...
2. ✅ WebSocket object created, state: 0
3. ⏰ Task progress WebSocket connection timeout
4. 🔄 Clearing connection tracking after timeout
```

**Рішення:** Перевір що backend запущений і має endpoint `/progress/{taskId}/ws`

### ❌ Проблемний сценарій Б (Дубль підключення з мертвим WebSocket):
```
1. ⏭️ Preventing duplicate connection attempt
2.    Current WebSocket state: 3  ← CLOSED!
```

**Рішення:** Почекай 10 секунд, tracking очиститься автоматично

### ❌ Проблемний сценарій В (Backend відхиляє з'єднання):
```
1. 🔗 Creating new WebSocket connection...
2. ❌ Task Progress WebSocket error
3. 🔄 Clearing connection tracking after error
```

**Рішення:** Перевір backend логи - можливо CORS, auth, або неправильний endpoint

---

## 📊 Network Tab Debug

1. Відкрий **Network** tab в DevTools
2. Фільтр: **WS**
3. Має бути:

```
ws://localhost:8001/progress/abc-123/ws
Status: 101 Switching Protocols  ✅

Messages tab:
  ↑ (sent)     (none - native WS doesn't send initial message)
  ↓ (received) {"type":"connected",...}
  ↓ (received) {"type":"item:parsed",...}
  ↓ (received) {"type":"task:progress",...}
```

**Якщо Status 404:**
→ Backend не має endpoint `/progress/{taskId}/ws`

**Якщо Status 403:**
→ CORS або auth проблема

**Якщо немає Messages:**
→ WebSocket підключений, але backend не відправляє події

---

## 🐛 Швидка діагностика

Скопіюй це в консоль браузера:

```javascript
// Перевір стан WebSocket service
const socketService = require('../services/socketService').getSocketService();
console.log('Active connections:', Array.from(socketService.activeConnections || []));
console.log('Last task ID:', socketService.lastConnectionTaskId);
console.log('Last attempt:', new Date(socketService.lastConnectionAttemptTime));
console.log('WebSocket state:', socketService.taskProgressWs?.readyState);
```

---

**Спробуй зараз і покажи що бачиш! 🚀**

Особливо важливо:
1. Чи з'являється "🔗 Creating new WebSocket connection"?
2. Яка WebSocket state (0, 1, 2, чи 3)?
3. Чи з'являється "✅ Task progress WebSocket connected"?
4. Чи є "📨 Task progress message received"?
