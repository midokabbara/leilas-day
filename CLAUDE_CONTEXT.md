# Leila's Day - Project Context

## Overview
Infant management app for tracking sleep, feed, diaper, play, meds, and pumping with predictive "what's next" scheduling.

## Key Decisions

### Design Philosophy
- **Dieter Rams minimalism** - calm, purposeful, invisible
- Lowercase everything, no emojis in UI
- Colors: #FAFAFA (background), #1A1A1A (text), #8B9A7D (accent - soft sage)
- Typography: Inter, two weights only (regular + medium)
- 8px spacing grid

### Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **PWA:** Installable, works offline

### Dev Server Port
- **Use port 3003** (3000, 3001, 3002, 5173 are occupied)

### Core Features (MVP)
1. One-tap event logging (sleep, feed, diaper, play, meds, pump)
2. "What's next" predictions based on age + patterns
3. Dashboard with predictions + quick log buttons
4. History view (timeline)
5. Google sign-in auth
6. PWA installable

### Event Types
| Event | Data |
|-------|------|
| Sleep | start/end toggle, auto-duration |
| Feed | type (bottle/breast/solid), amount, side for breast |
| Diaper | wet/dirty/both |
| Play | start/end toggle, auto-duration |
| Meds | preset meds, one-tap log, next dose time |
| Pump | start/end toggle, amount, side |

### Age-Based Defaults (before pattern learning)
- 0-3 months: Feed every 2-3h, wake windows 45-90min
- 3-6 months: Feed every 3-4h, wake windows 1.5-2.5h
- 6-12 months: Feed every 4h, wake windows 2-3.5h

## File Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard
│   ├── history/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── NextUp.tsx            # Predictions display
│   ├── EventButton.tsx
│   ├── QuickEntry/
│   ├── Timeline.tsx
│   └── DailySummary.tsx
├── lib/
│   ├── supabase.ts
│   ├── predictions.ts
│   ├── wake-windows.ts
│   ├── hooks/
│   └── types.ts
```

## Database Schema
```sql
babies (id, user_id, name, birth_date, created_at)

events (
  id, baby_id,
  type: 'sleep'|'feed'|'diaper'|'play'|'meds'|'pump',
  started_at, ended_at,
  metadata: jsonb,
  created_at
)

medications (id, baby_id, name, dose, frequency_hours)
```

## GitHub
- Repo: https://github.com/midokabbara/leilas-day
- Local: /Users/midokabbara/leilas-day

## Full Spec
See: /Users/midokabbara/.claude/plans/woolly-sauteeing-abelson.md
