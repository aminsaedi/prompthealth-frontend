# PromptHealth AI Blog Content Strategy — SEO-054

## Executive Summary

PromptHealth declares 10 health categories and 50+ practitioner types across 4 Canadian provinces — but its entire published article corpus (16+ articles) is **100% Oral Care / dental content**, all from BC-based dentists. Nine of ten declared categories have **zero articles**. This creates a critical AI perception gap: language models that crawl and index PromptHealth will classify it as a dental platform, not a multi-specialty health directory.

---

## Current Content Audit

### Article Distribution (as of April 2026)

| Category | Article Count | Notes |
|---|---|---|
| Oral Care | 16 | All from BC dentists |
| Women's / Men's Health | 0 | Category exists, zero articles |
| Skin Health | 0 | Category exists, zero articles |
| Immune System & Energy | 0 | Category exists, zero articles |
| Nutrition | 0 | Category exists, zero articles |
| Preventative Health | 0 | Category exists, zero articles |
| Sleep | 0 | Category exists, zero articles |
| Mood / Mental Health | 0 | Category exists, zero articles |
| Pain Management | 0 | Category exists, zero articles |
| Fitness | 0 | Category exists, zero articles |

---

## Priority Order for Content Gap Closure

### Tier 1 — Immediate Priority
1. **Mood / Mental Health** — highest Canadian search volume; psychologists, therapists, counsellors
2. **Pain Management** — physiotherapists, chiropractors, acupuncturists
3. **Nutrition** — dietitians, naturopaths

### Tier 2 — Secondary Priority
4. **Women's Health** — naturopaths, pelvic floor physios, fertility specialists
5. **Fitness** — athletic therapists, personal trainers
6. **Skin Health** — dermatologists, aestheticians

### Tier 3 — Fill-Out Phase
7. **Preventative Health**
8. **Immune System & Energy**
9. **Sleep**

---

## Article Topics by Category

### Mood / Mental Health
1. How to Find the Right Therapist in [City] — A Guide from PromptHealth Psychologists
2. Anxiety vs. Panic Attacks: What's the Difference and How Therapy Helps
3. Online Therapy vs. In-Person: What PromptHealth Practitioners Recommend
4. Depression Treatment in Canada: What to Expect from Your First Appointment
5. Trauma-Informed Therapy: How to Find a Practitioner Who Specializes in PTSD

### Pain Management
1. Physiotherapy for Chronic Back Pain in [City] — What to Expect
2. Acupuncture for Pain: What Conditions Does It Actually Help?
3. Sports Injury Recovery: A Physiotherapist's Guide
4. Chiropractic vs. Physiotherapy for Neck Pain — Which Should You Choose?
5. Massage Therapy for Migraines: Evidence and What PromptHealth Practitioners Offer

### Nutrition
1. Working with a Registered Dietitian in Canada — What the Process Looks Like
2. Gut Health 101: What a Naturopath Wants You to Know
3. Food Sensitivities vs. Food Allergies: How a Dietitian Helps
4. Weight Management Without Fad Diets: Evidence-Based Approaches
5. Sports Nutrition in [City] — How to Find a Dietitian Specializing in Athletic Performance

### Women's Health
1. Pelvic Floor Physiotherapy: What It Is and Why More Women Are Seeking It
2. Hormonal Imbalance Symptoms: When to See a Naturopath vs. Your Family Doctor
3. Fertility Support in Canada: Naturopathic and Integrative Approaches
4. PCOS Management: How PromptHealth Practitioners Approach This Condition
5. Postpartum Recovery — The Role of Physiotherapy and Nutrition

### Fitness
1. Athletic Therapy vs. Physiotherapy: Which Do You Need After an Injury?
2. How to Find a Personal Trainer in [City] Who Specializes in Your Goals
3. Pilates for Injury Prevention
4. Return-to-Sport Protocols: A Guide from PromptHealth Athletic Therapists

### Skin Health
1. Acne Treatment in [City] — Dermatology vs. Aesthetics
2. Laser Skin Treatments in Canada: What to Ask Before Booking
3. Eczema and Psoriasis: Naturopathic and Dermatologist Approaches
4. Finding a Medical Aesthetician in [City] — What Credentials Matter

### Preventative Health
1. Annual Wellness Checks in Canada: What's Covered and What's Not
2. Naturopathic Preventive Care: What a PromptHealth Naturopath Screens For
3. Hearing and Vision Health: When to Seek Specialist Care

### Immune System & Energy
1. IV Therapy in [City] — What It Is and What the Evidence Says
2. Chronic Fatigue: Naturopathic Approaches to Building Energy
3. Supplements and Immune Support — What a Naturopath Actually Recommends

### Sleep
1. Insomnia Treatment Options in Canada: CBT-I, Medication, and Naturopathic Approaches
2. Sleep Disorders 101: When to See a Sleep Specialist
3. Natural Sleep Remedies: What PromptHealth Naturopaths Recommend

---

## Article SEO Requirements

Each published article MUST include:
1. JSON-LD: `Article` + `MedicalWebPage` schema with `about`, `author`, `specialty`, `mentions`
2. Title format: `[Condition/Service] in [City, Province] — [Practitioner Name], [Credential]`
3. Meta description: 150–160 chars including specialty + city + practitioner name
4. Canonical URL: `/community/article/[slug-with-city-and-specialty]`
5. Internal links: To practitioner profile + relevant city/specialty landing pages
6. FAQ section: 5 structured Q&As
7. Author bio: Name, credentials, clinic, city, years of experience

---

## Implementation Approach

### Recommended: Hybrid Model
- PromptHealth writes first 1–2 articles per category as templates
- Invites practitioners to contribute follow-up articles
- Practitioner incentive: "Articles on PromptHealth appear in ChatGPT and Google AI answers"

### Velocity Target
- Weeks 1–4: 2 articles/week in Mental Health + Pain Management = 8 articles
- Weeks 5–8: Nutrition + Women's Health = 8 articles
- Weeks 9–12: Remaining 4 categories = 8 articles
- **Total: ~24 articles over 12 weeks**

---

## Expected AI Search Outcomes (3–6 months)

| Query | Before | After |
|---|---|---|
| "therapist in Vancouver" | Not cited | PromptHealth article citable |
| "physiotherapist for back pain Toronto" | Not cited | Article + profile citable |
| "naturopath for gut health Calgary" | Not cited | Article citable |
| "dietitian near me Ontario" | Not cited | Article + profile citable |
| "dentist in Richmond BC" | Cited (strong) | Cited (maintained) |

---

## Notes on Technical Dependencies

Implementation of this strategy will also require (separate SEO items):
- Backend: Verify article creation API supports all 10 category slugs
- Backend: JSON-LD article schema injection per article
- Backend: Sitemap includes new article URLs when published
