# Админка Хайке — запуск в прод

1. В Supabase-базе проекта Vercel `heike-schaub` выполнить SQL из `supabase/migrations/0001_init.sql` (Supabase → SQL Editor → вставить → Run).
2. В Vercel (Project → Settings → Environment Variables) должны быть переменные ниже. `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` подставляет интеграция Supabase сама; остальное — из локального файла `.env.vercel` (кнопка «Import .env»).
3. Redeploy. Список и описание — в `.env.example`.

| Переменная | Откуда взять |
|---|---|
| `SUPABASE_URL` | `https://utwfirqifdzvxmtbvdxy.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** (секретный, только на сервере!) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `CONTACT_EMAIL_FROM` | адрес на подтверждённом в Resend домене, например `Heike Schaub <kontakt@домен>` |
| `CONTACT_EMAIL_TO` | куда приходят уведомления (по умолчанию Schaub-heike@gmx.de) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | стартовый логин; после первого входа меняются в админке («Zugang») |
| `ADMIN_GATE_KEY` | секретное слово для приватной ссылки |
| `ADMIN_GATE_SECRET`, `SESSION_SECRET` | длинные случайные строки (`openssl rand -base64 48`) |
| `NEXT_PUBLIC_SITE_URL` | адрес сайта, например `https://www.домен.de` |

## Как Хайке заходит
Один раз открыть `https://<сайт>/admin?key=<ADMIN_GATE_KEY>` и сохранить как закладку
(тот же адрес виден в админке на вкладке «Zugang»). Без `?key=` адрес `/admin` отвечает 404.
Потом — почта и пароль.

## Что где
- `/admin` — обзор · `/admin/briefe` — сообщения · `/admin/blog` — блог · `/admin/fragen` — письмо с 7 вопросами · `/admin/zugang` — доступ
- Публично: `/blog`, `/blog/<slug>`, `/blog/feed.xml`, `/sitemap.xml`; блок «Aktuelles» на главной появляется, когда есть опубликованные записи.
