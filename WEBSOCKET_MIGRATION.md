# 🚀 WebSocket Migration Guide

## ✅ Що було зроблено

Оновлено архітектуру WebSocket для підтримки нового task-specific API (v2).

### Основні зміни:

#### 1. **socketService.ts**
- ✅ Метод `connectToTaskProgress` тепер приймає готовий `websocketUrl` замість `baseUrl + taskId`
- ✅ Додано обробку нових типів подій:
  - `connected` - підтвердження підключення
  - `item:parsed` - відскрепане оголошення (з красивими логами в консолі!)
  - `task:progress` - прогрес задачі
  - `task:completed` - завершення задачі
- ✅ Додано збереження `websocketUrl` для автоматичного reconnect
- ✅ Видалено застарілий метод `getTaskProgressWebSocketUrl`

#### 2. **scrapper.ts**
- ✅ Оновлено сигнатуру `connectToTaskProgress(websocketUrl, taskId)`
- ✅ Додано логування для відлагодження

#### 3. **Компоненти**
- ✅ **ScrapperNavigation.tsx** - використовує `websocket_url` з API response
- ✅ **ScrapperRequestList.tsx** - отримує `websocket_url` через `getTaskDetails()`
- ✅ **ScrapperItem.tsx** - отримує `websocket_url` від `refreshScrapperItemDetails()`

#### 4. **ScrapperContext.tsx**
- ✅ Оновлено типи та методи для роботи з `websocketUrl`
- ✅ Автоматичне підключення до in-progress tasks

#### 5. **Новий хук useTaskWebSocket**
- ✅ Створено зручний хук для використання в компонентах
- ✅ Автоматична підписка на події
- ✅ Автоматичне очищення при unmount

---

## 📡 Як це працює зараз

### 1. Створення нової задачі

```typescript
// POST /start/urls
const response = await scrapperServices.createScrapperRequest(params);
const { task_id, websocket_url } = response;

// Підключення до WebSocket
await connectToTaskProgress(websocket_url, task_id);
```

### 2. Підключення до існуючої задачі

```typescript
// GET /progress/{taskId}
const taskDetails = await scrapperServices.getTaskDetails(taskId);
const { websocket_url } = taskDetails;

// Підключення до WebSocket
await connectToTaskProgress(websocket_url, taskId);
```

### 3. Використання хука (опціонально)

```tsx
import { useTaskWebSocket } from '../hooks/useTaskWebSocket';

function MyComponent() {
  const [taskData, setTaskData] = useState(null);
  const { items, progress, status } = useTaskWebSocket(taskData);

  const startTask = async () => {
    const response = await fetch('/start/urls', { ... });
    const data = await response.json();
    
    setTaskData({
      taskId: data.task_id,
      websocketUrl: data.websocket_url
    });
  };

  return (
    <div>
      <button onClick={startTask}>Start</button>
      <div>Progress: {progress.percent}%</div>
      <div>Items: {items.length}</div>
    </div>
  );
}
```

---

## 📊 Консольні логи

### При підключенні:
```
🔌 Connecting to task progress WebSocket: ws://localhost:8001/progress/abc-123/ws
✅ WebSocket connected: Connected to task abc-123
```

### При парсингу оголошення:
```
🎯 ITEM PARSED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Kia Sportage 2024
💰 Price: $27600
📍 Year: 2024 | Mileage: 50000 km
📞 Phone: (063) 061 71 83
🏢 Seller: AutoHouse Kyiv
   Active ads: 11 | Total ads: 150
🔗 URL: https://auto.ria.com/auto_kia_sportage_39453238.html
   VIN: U5YPV81DBRL257240
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### При прогресі:
```
📊 Progress: 5/10 (50%)
```

### При завершенні:
```
✅ TASK COMPLETED!
   Task ID: abc-123
   Items processed: 10
```

---

## 🔄 Структура подій WebSocket

### `connected`
```json
{
  "type": "connected",
  "taskId": "abc-123",
  "message": "Connected to task abc-123",
  "timestamp": 1771065704322
}
```

### `item:parsed`
```json
{
  "type": "item:parsed",
  "taskId": "abc-123",
  "item": {
    "id": 42,
    "title": "Kia Sportage 2024",
    "price": "27600",
    "year": "2024",
    "mileage": "50000",
    "phone": "(063) 061 71 83",
    "sellerName": "AutoHouse Kyiv",
    "activeAds": "11",
    "totalAds": "150",
    "url": "https://auto.ria.com/...",
    "vin": "U5YPV81DBRL257240"
  },
  "timestamp": 1771065704500
}
```

### `task:progress`
```json
{
  "type": "task:progress",
  "taskId": "abc-123",
  "total": 10,
  "processed": 5,
  "percent": 50,
  "status": "running",
  "timestamp": 1771065704600
}
```

### `task:completed`
```json
{
  "type": "task:completed",
  "taskId": "abc-123",
  "itemsProcessed": 10,
  "timestamp": 1771065705000
}
```

---

## 🧪 Як тестувати

1. **Запусти скрапер сервер:**
   ```bash
   cd scraper
   npm start
   ```

2. **Запусти admin панель:**
   ```bash
   npm run dev
   ```

3. **Відкрий консоль браузера** (F12)

4. **Створи нову задачу скрапінгу** через інтерфейс

5. **Спостерігай за логами в консолі:**
   - Підключення до WebSocket
   - Real-time оновлення прогресу
   - Красиві логи відскрепаних оголошень! 🎉

---

## 🐛 Troubleshooting

### Проблема: WebSocket не підключається
**Рішення:** Перевір, що:
1. Скрапер сервер запущений
2. URL правильний (має бути `ws://` або `wss://`)
3. В консолі немає помилок CORS

### Проблема: Не бачу логів в консолі
**Рішення:** Перевір, що:
1. Real-time progress увімкнений (switcher в UI)
2. WebSocket підключений (статус має бути 🟢 Live)
3. Консоль браузера відкрита

### Проблема: Помилка "No WebSocket URL available"
**Рішення:** 
- Переконайся, що API повертає `websocket_url` в response
- Перевір версію backend API (має бути v2)

---

## 📝 TODO (опціонально)

- [ ] Додати retry логіку при помилках підключення
- [ ] Додати візуальні нотифікації при парсингу (toast)
- [ ] Створити окремий компонент для відображення real-time логів
- [ ] Додати можливість фільтрації логів по типу події

---

**Готово! 🎉 Тепер ти маєш повністю робочу інтеграцію з новим WebSocket API!**
