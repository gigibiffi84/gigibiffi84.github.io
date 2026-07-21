---
title: "reactjsday 2025 in pillole #3 — State management: ogni stato al suo posto"
description: "Local, global e server state: dare a ogni stato lo scope giusto, evitare il prop drilling e smettere di abusare di useEffect"
date: 2026-07-19T10:10:00+02:00
tags: ["pillole", "reactjsday", "react", "state-management", "architettura"]
lang: it
translationKey: "reactjsday-2025-pillole-3-state-management"
headerImage: "/images/reactjsday-2025-pillole-3-state-management/header.jpg"
---

Terza pillola dal **reactjsday 2025**, e siamo su uno dei temi eterni di React: **lo state management**. O meglio: dare a ogni stato lo *scope* che merita.

#### La pillola

Il framing del talk è semplice e sano. Gli stati sono di tre tipi, e ognuno ha i suoi problemi e le sue soluzioni:

- **Local state** — il nemico è il *prop drilling*: proprietà passate giù per quattro livelli di componenti che non le usano. Soluzioni: `useContext`, oppure — spesso meglio — un **redesign dei componenti**.
- **Global state** — il nemico è lo *state bloat*, il mega-store che sa tutto di tutti. Soluzione: **slice di stato con context più piccoli** e mirati.
- **Server state** — il nemico sono i dati stantii. E qui la strada è tracciata: **TanStack Query** e si vive meglio.

Il secondo asse è la distinzione **Smart Components vs Presentation (dumb) Components**. Un esempio del pattern che il talk bollava come da evitare:

```jsx
// ❌ 10+ props, una per campo, una callback per campo
function UserProfile({ name, email, avatar, bio, location,
                       onNameChange, onEmailChange, onBioChange }) {
  return <input value={name} onChange={onNameChange} /> /* ... */
}
```

E la versione sana: il componente smart possiede lo stato e lo aggiorna per chiave, il componente di presentazione riceve i dati e **non ha stato interno** — al massimo stato *derivato* dalle props:

```jsx
// ✓ lo smart component possiede lo stato
function UserProfile({ userId }) {
  const [profile, setProfile] = useState(initialProfile)
  const updateField = (field, value) =>
    setProfile(prev => ({ ...prev, [field]: value }))
  return <input value={profile.name}
                onChange={(e) => updateField('name', e.target.value)} />
}
```

La regola d'oro sui presentation component: **niente `useEffect` per "sincronizzare" lo stato con le props** — lo stato di un componente di presentazione si *deriva* dalle props, punto. E se la logica di derivazione cresce troppo, è il segnale che il componente va spezzato.

#### Il takeaway

Prima di chiedersi "quale libreria di state management?", chiedersi "**di che scope è questo stato?**". La metà dei problemi di stato in React sono in realtà problemi di design dei componenti.

---

*Prossima pillola: modularizzare per scalare a 15+ team.*
