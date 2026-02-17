# 📝 WebSocket Refactoring Changelog

## 🗓️ Feb 14, 2026

### ✨ Нові можливості

1. **Task-specific WebSocket API (v2)**
   - Кожна задача тепер має свій власний WebSocket endpoint
   - Автоматична фільтрація подій по задачі
   - Простіше підключення - один URL містить всю інформацію

2. **Покращені консольні логи**
   - 🎯 Красиві логи для відскрепаних оголошень
   - 📊 Інформативні повідомлення про прогрес
   - ✅ Чіткі індикатори підключення/відключення

3. **Новий хук `useTaskWebSocket`**
   - Зручний хук для використання в React компонентах
   - Автоматична підписка на події
   - Автоматичне очищення ресурсів

---

### 🔄 Змінені файли

#### `src/services/socketService.ts`
- **Змінено:** `connectToTaskProgress(websocketUrl, taskId)` - тепер приймає готовий URL
- **Додано:** Обробка подій: `connected`, `item:parsed`, `task:progress`, `task:completed`
- **Додано:** Збереження `lastWebsocketUrl` для reconnect
- **Видалено:** `getTaskProgressWebSocketUrl()` - більше не потрібен

#### `src/services/scrapper.ts`
- **Змінено:** `connectToTaskProgress(websocketUrl, taskId)` - оновлена сигнатура

#### `src/components/Scrapper/ScrapperNavigation.tsx`
- **Змінено:** Використовує `websocket_url` з API response
- **Додано:** Логування при створенні нової задачі

#### `src/components/Scrapper/ScrapperRequestList.tsx`
- **Змінено:** Отримує `websocket_url` через `getTaskDetails()`
- **Додано:** Перевірка наявності `websocket_url`

#### `src/pages/ScrapperItem.tsx`
- **Змінено:** Використовує `websocket_url` від `refreshScrapperItemDetails()`
- **Додано:** Логування при refresh задачі

#### `src/contexts/ScrapperContext.tsx`
- **Змінено:** Типи та методи для роботи з `websocketUrl`
- **Змінено:** Автоматичне підключення отримує URL через API

#### `src/hooks/useTaskWebSocket.ts` *(NEW)*
- **Додано:** Новий хук для зручної роботи з WebSocket

---

### 🐛 Виправлені проблеми

1. **Reconnect після втрати зв'язку** - тепер використовує збережений URL
2. **Дублювання підключень** - покращена логіка rate limiting
3. **Відсутність WebSocket URL** - додано перевірки та warning

---

### 🔧 Технічні деталі

#### До рефакторингу:
```typescript
// Генерували URL самі
const wsUrl = `ws://${baseUrl}/progress/${taskId}/ws`;
await connectToTaskProgress(baseUrl, taskId);
```

#### Після рефакторингу:
```typescript
// Використовуємо URL від API
const { websocket_url } = response;
await connectToTaskProgress(websocket_url, taskId);
```

#### Нові типи подій:
- `connected` → початок підключення
- `item:parsed` → відскрепано оголошення
- `task:progress` → оновлення прогресу
- `task:completed` → задача завершена

---

### 📋 Breaking Changes

⚠️ **Оновлення API required!**

Backend має повертати `websocket_url` у відповідях:

```typescript
// POST /start/urls
{
  "task_id": "abc-123",
  "status": "enqueued",
  "websocket_url": "ws://localhost:8001/progress/abc-123/ws", // ← NEW
  ...
}

// GET /progress/{taskId}
{
  "task_id": "abc-123",
  "status": "running",
  "websocket_url": "ws://localhost:8001/progress/abc-123/ws", // ← NEW
  ...
}
```

---

### 🚀 Міграція

Якщо ти оновлюєш існуючий код:

1. Переконайся, що backend повертає `websocket_url`
2. Оновлення на frontend сумісні backwards (fallback на старий метод)
3. Перевір логи в консолі - має бути `websocket_url`
4. Увімкни real-time progress і спостерігай за красивими логами! 🎉

---

### 📚 Документація

- [WEBSOCKET_MIGRATION.md](./WEBSOCKET_MIGRATION.md) - повний гайд по міграції
- [Твоя документація API](../path/to/api/docs) - оригінальна документація з Node.js

---

**Автор:** Cursor AI Assistant  
**Дата:** Feb 14, 2026  
**Версія:** 2.0.0
