# 🚀 Vercel Setup для Admin App (Monorepo)

## ⚠️ Важливо: Root Directory налаштовується в Vercel Dashboard

`rootDirectory` не підтримується в `vercel.json`. Потрібно налаштувати вручну в Dashboard.

## 📋 Кроки налаштування в Vercel Dashboard:

### 1. Відкрийте Vercel Dashboard
- Перейдіть на https://vercel.com/dashboard
- Відкрийте ваш проект або створіть новий

### 2. Налаштуйте Project Settings

**Settings → General → Root Directory:**
```
apps/admin
```

**Settings → General → Build & Development Settings:**
```
Framework Preset: Vite
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

### 3. Environment Variables (якщо потрібно)
**Settings → Environment Variables:**
```
API_BASE_URL=your-api-url
```

## 🔧 Альтернатива: vercel.json без rootDirectory

Поточний `vercel.json` налаштований правильно, але `rootDirectory` потрібно встановити в Dashboard.

## ✅ Перевірка після налаштування:

1. **Deploy** → перевірте логи build
2. Шукайте рядки з `[copy-locales]` в логах
3. Перевірте, чи переклади копіюються успішно

## 🐛 Якщо build все ще не працює:

1. Перевірте, чи `Root Directory` встановлено на `apps/admin` в Dashboard
2. Перевірте логи - чи встановлюється `@reelo/i18n`
3. Перевірте, чи доступний GitHub репозиторій `reelo-i18n`
