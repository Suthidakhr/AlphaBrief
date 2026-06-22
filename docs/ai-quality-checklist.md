# AI Quality Checklist

**Reference:** NFR-AI02 — Manual spot-check process for sentiment classification accuracy.

**Launch gate:** This checklist must be completed and pass before public launch.

---

## Purpose

The AI analysis pipeline uses Claude to classify news sentiment as `bullish`, `bearish`, or `neutral`. This checklist defines the manual spot-check process to verify that the pipeline's sentiment output is sufficiently accurate before exposing it to retail investors.

**Target:** Fewer than 15% incorrect sentiment tags on a random 20-item sample.

---

## When to Run

- Before every public launch or significant system prompt change
- After updating `backend/app/ai/prompts.py`
- After changing the Claude model version used in n8n
- At any point when sentiment accuracy is questioned

---

## Step 1: Sample Selection

1. Query the live ASK API for all news items with `ai_analysis` populated:
   ```
   GET /news?limit=50
   ```
2. From the returned list, select **20 items at random** using any random selection method (e.g., random number generator, dice rolls, spreadsheet `=RAND()`).
3. Record the 20 selected `id` values in the **Results Table** below.

---

## Step 2: Sentiment Verification

For each of the 20 selected articles:

1. Read the original article at `source_url`.
2. Read the AI-generated `summary` from `GET /news/{id}`.
3. Judge the article's expected sentiment independently — without looking at the AI-assigned sentiment — based on:
   - Does the news suggest positive market impact → `bullish`
   - Does the news suggest negative market impact → `bearish`
   - Is the impact unclear or mixed → `neutral`
4. Compare your expected sentiment to the AI-assigned `sentiment` field.
5. Mark the result as **Correct** or **Incorrect** in the Results Table.

> **Note:** When in doubt between `neutral` and another sentiment, prefer `neutral`. Only mark Incorrect if the AI sentiment is clearly wrong (e.g., AI says `bullish` but the article is unambiguously negative news).

---

## Step 3: Error Rate Calculation

Count the number of incorrect classifications and apply this formula:

```
error_rate = (incorrect_count / 20) × 100
```

| Incorrect Count | Error Rate | Result |
|----------------|------------|--------|
| 0 | 0% | ✅ Pass |
| 1 | 5% | ✅ Pass |
| 2 | 10% | ✅ Pass |
| 3 | 15% | ⛔ Fail — prompt review required |
| 4+ | ≥20% | ⛔ Fail — prompt review required |

---

## Step 4: Launch Gate Decision

- **Error rate < 15%:** Approved for public launch. Record the result below.
- **Error rate ≥ 15%:** **DO NOT launch.** Review `backend/app/ai/prompts.py` and identify which constraint is being violated. Update the prompt, commit the change, re-run the pipeline on a new batch, and repeat this checklist.

---

## Step 5: Results Record

Complete this table after each spot-check run. Commit the updated file.

### Run History

| Date | Claude Model | Sample Size | Incorrect | Error Rate | Pass/Fail | Reviewer |
|------|-------------|-------------|-----------|------------|-----------|----------|
| _(fill in)_ | _(e.g., claude-opus-4-8)_ | 20 | _(count)_ | _(%)_ | _(Pass/Fail)_ | _(name)_ |

### Detailed Results (most recent run)

| # | Article ID | Headline (brief) | Expected Sentiment | AI Sentiment | Correct? |
|---|-----------|------------------|--------------------|--------------|----------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |
| 9 | | | | | |
| 10 | | | | | |
| 11 | | | | | |
| 12 | | | | | |
| 13 | | | | | |
| 14 | | | | | |
| 15 | | | | | |
| 16 | | | | | |
| 17 | | | | | |
| 18 | | | | | |
| 19 | | | | | |
| 20 | | | | | |

**Total incorrect:** ___  
**Error rate:** ___%  
**Decision:** Pass / Fail

---

## Prompt Review Checklist (if error rate ≥ 15%)

If the spot-check fails, review `backend/app/ai/prompts.py` against these criteria:

- [ ] Does the prompt define all three sentiment values (`bullish`, `bearish`, `neutral`) with clear examples?
- [ ] Does it instruct Claude to default to `neutral` for ambiguous or mixed news?
- [ ] Is the output format specified clearly enough that Claude outputs valid JSON every time?
- [ ] Are there examples of articles that should be `neutral` vs `bearish`?
- [ ] After updating the prompt, commit the change and request a new spot-check run before launch.
