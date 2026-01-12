# Leila's Day - Project Context

## Overview
Infant management agent that watches, learns, and tells you what to do next. Zero overhead, one-tap logging, auto-generated insights.

## UX Review (Jan 2026)

### What Failed (v1)
- No onboarding - user lands on empty confusing screen
- Abstract labels ("log", "next up") - developer-speak
- No feedback - tap button, nothing visible happens
- No visual hierarchy - everything equal weight
- No state visibility - is baby sleeping? when was last feed?

### Dieter Rams Critique
> "The product doesn't talk. Minimalism hid the function. We have decoration disguised as simplicity."

### New Design Principle
**"One Glance, One Tap"** - The app answers ONE question: "What should I do next?"

---

## Key Decisions (v2 Redesign)

### Design Philosophy
- **Function first** - Every element serves a clear purpose
- **Human language** - "she's been awake 1h 40m" not "awake time"
- **Hero Card** - ONE prominent action dominates the screen
- **Progressive disclosure** - Agent learns, reveals patterns over time
- Colors: #FAFAFA (background), #1A1A1A (text), #8B9A7D (accent)
- Typography: Inter, two weights only
- Lowercase everything, no emojis

### Three Tabs
| Tab | Purpose |
|-----|---------|
| **now** | Hero card with THE action + coming up |
| **history** | Day-by-day timeline, swipe between days |
| **patterns** | Auto-generated insights, averages, typical day |

### Agent Behavior
- Day 1-2: "keep logging, learning your patterns..."
- Day 3: First pattern insights appear
- Day 7+: Full patterns dashboard with "your typical day"
- Zero configuration - agent does all the work

---

## Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Storage:** localStorage (Supabase later for cloud sync)
- **PWA:** Installable, works offline
- **Port:** 3003

---

## File Structure (v2)
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Now tab (hero card)
│   ├── onboarding/page.tsx   # First-run setup
│   ├── history/page.tsx      # Day-by-day timeline
│   └── patterns/page.tsx     # Auto-generated insights
├── components/
│   ├── HeroCard.tsx          # The ONE action
│   ├── ComingUp.tsx          # Secondary predictions
│   ├── QuickLog.tsx          # Compact action buttons
│   ├── TabNav.tsx            # now/history/patterns
│   ├── Timeline.tsx          # Day's events
│   ├── Toast.tsx             # Feedback confirmations
│   └── DailySummary.tsx
├── lib/
│   ├── storage.ts            # localStorage wrapper
│   ├── humanize.ts           # Natural language
│   ├── predictions.ts        # What's next engine
│   ├── patterns.ts           # Pattern detection
│   ├── wake-windows.ts       # Age-based defaults
│   └── types.ts
```

---

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
```

---

## GitHub
- Repo: https://github.com/midokabbara/leilas-day
- Local: /Users/midokabbara/leilas-day

## Full Spec
See: /Users/midokabbara/.claude/plans/woolly-sauteeing-abelson.md
