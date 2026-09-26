# LOCKHABIT Media Operating System

Status: source of truth for Journal/media product, editorial voice, community, membership, newsletters, sourcing, and future blog requests.

This document intentionally survives future visual redesigns. UX can change; the media mechanics, trust rules, data contracts, and audience strategy should remain unless the owner explicitly changes them.

## North star

LOCKHABIT is not a soap company with a corporate blog.

The Journal should become a living wellness/lifestyle media destination with a pulse: useful enough to search, entertaining enough to revisit, human enough to follow, and trusted enough to cite. Commerce is present but should rarely be the reason an article exists.

The ideal outcome is that someone says, “I read this thing on LOCKHABIT,” even when the story was not about soap.

## What we borrow from successful media businesses

We borrow mechanics, not subject matter or visual identity.

- Frequent freshness cues: latest, timestamps, trending, what everyone is talking about.
- Recurring franchises that readers recognize immediately.
- Named creators with voices and specialties instead of a faceless “staff” byline.
- A mix of timely stories, evergreen search utility, and entertainment.
- Community loops: reactions, questions, comments, polls, shares, saves, author follows.
- Newsletter products with a clear promise rather than generic marketing signup.
- Editorial-to-commerce bridges only when the product genuinely fits the story.
- Multi-format readiness: article, audio/read-aloud, short video, social clips, newsletter, and future podcast/video.
- Strong internal linking so one story naturally leads to the next.
- A homepage that feels alive rather than a perfectly repeated card grid.

## LOCKHABIT translation

The media brand lives inside the same resort/vacation world as the storefront.

Visual language:
- warm cream paper
- coral red
- seafoam/aqua
- sunshine yellow
- dark ink/green
- retro resort/postcard cues
- hand-drawn marks, tape, notes, stamps, waves, palms, sun motifs
- premium photography mixed with imperfect editorial details
- controlled chaos on the surface, disciplined information architecture underneath

Avoid:
- generic beige wellness
- sterile SaaS cards
- perfectly symmetric corporate grids
- every section using the same card
- fake medical authority
- fake reviews
- fake scarcity
- forced product placement

## Consumer-facing media architecture

Primary media labels may evolve, but the conceptual jobs remain:

- Latest: what changed recently.
- Bathhouse: body, skin, shower, soap, routines.
- Sleep Desk: nighttime routines, sleep environment, winding down.
- Ingredients: ingredient education and evidence.
- We Tried It: first-person experiments and trend tests.
- Good Stuff: editorial recommendations and useful finds.
- Travel Brain: travel, leisure, escape, hotel/bathroom inspiration.
- Ask LOCKHABIT: reader questions and community prompts.

Three editorial lanes should always exist in the CMS/data model:

1. RIGHT NOW
   Trends, timely experiments, reactions, new studies, seasonal stories.

2. HELP ME
   Evergreen, searchable guides that solve a real reader problem.

3. ENTERTAIN ME
   Personality, humor, quizzes, first-person tests, travel, culture, odd internet wellness behavior.

## Recurring franchises

Recurring franchises create memory and habit. Initial library:

- WE TRIED IT
  “We tried it so your bathroom did not have to.”

- IS THIS ACTUALLY GOOD FOR YOU?
  Evidence-aware explanation of a trending claim.

- FROM THE BATHHOUSE
  Skin/body/shower guidance.

- ASK LOCKHABIT
  Reader questions, polls, and selected community answers.

- GOOD STUFF WE FOUND
  Clearly labeled editorial picks. Outside paid links must be disclosed adjacent to the link.

- THE MORNING SHOWER
  Newsletter/digest product.

- WHAT EVERYONE’S TALKING ABOUT
  Primary timely homepage story.

- WHAT’S BLOWING UP
  Ranked fast-rising stories or discussions.

- LATEST FROM THE RESORT
  Reverse-chronological feed.

New franchises are welcome, but do not delete recognizable winners simply to make the layout look new.

## Creator/personality model

The Journal should support named creators with:
- display name
- slug
- photo/avatar
- specialty
- short personality line
- biography
- latest stories
- social links where appropriate
- follow capability
- future video/audio appearances

Example editorial personas used for design:
- Maya — Skin & Ingredients — “Will read an ingredient label for fun.”
- Chris — Wellness Experiments — “Will apparently try anything once.”
- Jules — Travel & Good Living — “Professionally avoids bad vacations.”

These are design placeholders until real contributors are assigned. Never present fictional staff as real people on production.

## Article contract

Every real article should be able to store:
- title
- excerpt/dek
- slug
- author and author slug
- category
- editorial lane
- franchise
- published time
- reviewed time
- reading time
- hero image + accurate alt text
- body blocks
- references/sources
- related LOCKHABIT products
- outside recommendations with disclosure type
- related articles
- SEO title/description
- whether audio/read-aloud is enabled
- whether comments are allowed
- featured/trending metadata

For health/wellness/ingredient stories, the editorial structure should support:
- short answer
- what it is
- traditional or common use, clearly described as such
- what research actually studied
- supportive evidence
- mixed or negative evidence
- limitations
- rinse-off vs leave-on distinction when relevant
- safety notes
- sources/further reading

## Source and trust rules

The Journal is source-forward.

Prefer:
- government and public-health resources
- PubMed/NLM-indexed research
- peer-reviewed journals
- universities and academic medical centers
- recognized professional organizations
- original manufacturer documentation when discussing a product specification
- high-quality primary reporting for non-medical culture/trend stories

Rules:
- Source type is not endorsement.
- Do not turn preliminary research into a certainty.
- Do not hide mixed or negative evidence.
- Distinguish an ingredient studied in a leave-on product from the same ingredient in rinse-off soap.
- Never claim LOCKHABIT products diagnose, treat, cure, or prevent a disease unless legally supportable and intentionally approved.
- Natural does not automatically mean safe, effective, or superior.
- Every factual wellness claim that materially affects a reader’s decision should be traceable to a source.
- Public article pages should retain a visible “Sources and further reading” section.
- Design/sample copy must never be mistaken for published factual advice.

## Community infrastructure

The codebase should be ready for:
- accounts
- profile/display name
- comments and replies
- moderation states
- reactions
- bookmarks/saves
- shares
- author follows
- newsletter preferences
- read-aloud preference
- supporter status
- 10% member entitlement
- future notifications

Comments are built but globally OFF by default. Turning them on should be a settings change, not a rebuild.

Comment moderation states:
- pending
- approved
- hidden
- spam

Initial moderation policy:
- new comments enter pending
- no medical misinformation presented as fact
- no harassment, doxxing, spam, scams, or unsafe instructions
- disagreement is allowed
- criticism of LOCKHABIT is allowed if it follows community rules
- moderation actions are owner-visible

## Quick account model

A reader account is optional.

Preferred low-friction auth:
- email magic link / one-time email authentication
- no forced password for normal readers
- owner/creator access remains separate and role-aware

A free reader account gets:
- lifetime 10% LOCKHABIT member discount
- newsletter/digest controls
- reactions
- saves/bookmarks
- author follows
- comment participation when comments are enabled
- saved read-aloud speed preference

The 10% member benefit is the same canonical 10% benefit as the reusable Check-In offer. It must NOT stack with itself to create 20%. If another legitimate reward is explicitly stackable, that rule remains separate.

## Newsletter strategy

Do not optimize for number of sends. Optimize for “I am glad I opened this.”

Default recommendation:
- one daily digest at most
- up to five meaningful items inside that digest
- no requirement to publish five items
- if only one thing is worth sending, send one
- if nothing is worth sending, send nothing

Reader preferences should support:
- Daily digest
- Important only
- Weekly
- Off

THE MORNING SHOWER promise:
“Five minutes of useful nonsense for a better day.”

Possible digest ingredients:
- one thing worth knowing
- one body/skin tip
- one ingredient being investigated
- one ridiculous/fun internet thing
- one thing that may improve the day

Email sending remains gated until unsubscribe, consent, deliverability, and production QA are verified.

## Optional supporter subscription

Editorial access stays free.

Supporting LOCKHABIT is voluntary and should be explained plainly and playfully. No guilt wall, no fake scarcity, no content punishment.

Recommended launch choices:
- $3/month — default supporter
- $5/month — extra-support option

Do not launch $1/month as the primary card subscription because fixed payment fees consume too much of a $1 charge.

Suggested tone:
“Everything here is free. If you feel like helping us keep the lights on (and the imaginary resort pool warm), you can throw in a few bucks a month. Seriously — you do not have to.”

Free and paid reader accounts receive the same 10% member discount. Payment is support, not a disguised paywall.

Support checkout must be separately identified from product orders so subscription events never become storefront orders.

## Read aloud

Every eligible article should have browser-based read-aloud controls:
- Normal / 1x
- 1.5x
- 2x
- play/pause
- stop

Use accessible controls and gracefully hide/disable when speech synthesis is unavailable.

Future server-generated audio may replace browser speech, but the article UI contract should remain.

## Sharing

Article pages should support:
- native share where available
- copy link
- future channel-specific sharing
- anonymous aggregate share-event measurement without storing unnecessary PII

## Analytics events

Reserve consistent events:
- journal_view
- journal_article_view
- journal_search
- journal_category_filter
- journal_reaction
- journal_comment_submit
- journal_comment_approved
- journal_share
- journal_bookmark
- journal_author_follow
- journal_audio_start
- journal_audio_pause
- journal_audio_complete
- journal_join_started
- journal_join_completed
- journal_newsletter_preference
- journal_support_checkout_started
- journal_support_started
- journal_support_cancelled
- journal_product_click
- journal_affiliate_click

Do not duplicate Stripe purchase events.

## Editorial-to-commerce rule

Most editorial should exist because it is genuinely interesting, useful, or entertaining.

A useful target is that the large majority of stories do not require a LOCKHABIT sale CTA.

When commerce belongs:
- relate the product naturally to the story
- clearly identify LOCKHABIT-owned products
- label outside paid/affiliate links
- do not disguise an ad as independent research
- never let payout determine the conclusion

## Homepage behavior at scale

The page should not become a wall of identical cards.

Use:
- one dominant hero
- small fast items
- ranked trending list
- mixed image/text rows
- recurring-franchise visual identities
- creator modules
- community questions
- newsletter product
- latest feed

The site should remain usable with 3 stories and with 3,000 stories. Data architecture should support server pagination, search, categories, recency, featured ranking, and trending scoring.

## Feature gates

Keep these independently switchable:
- public Journal launch
- comments
- supporter checkout
- digest sending
- reactions
- author follows
- account signup if emergency shutdown is needed

A disabled feature should fail closed and preserve data.

## “Write a blog” operating instruction

When the owner says “write a blog,” “write an article,” or similar without overriding instructions:

1. Choose or ask for the topic.
2. Classify it as RIGHT NOW, HELP ME, or ENTERTAIN ME.
3. Choose an existing franchise when it fits.
4. Write in LOCKHABIT voice: smart, curious, warm, funny, self-aware.
5. Research factual claims before publication.
6. Include strong sources and acknowledge uncertainty.
7. Never invent experts, studies, reviews, customer experiences, or product claims.
8. Add a short answer early for search/AI readability when appropriate.
9. Include related stories and products only when relevant.
10. Produce newsletter/social derivatives after the article, not instead of the article.
11. Preserve the resort personality without making every sentence a joke.
12. Make the headline human and clickable without deceptive clickbait.
13. Leave the reader with something useful even if they never buy anything.

## Launch sequence

1. Keep current production storefront untouched.
2. Build media/community infrastructure on a feature branch.
3. Apply additive database migrations only after review.
4. Keep comments disabled initially.
5. Keep supporter checkout disabled until Stripe TEST verification passes.
6. Seed only real, sourced articles.
7. Verify account signup, preferences, audio, reactions, share, moderation, and mobile UX.
8. Verify unsubscribe/deliverability before automated digest sending.
9. Publish Journal only when the existing editorial launch gate is satisfied.
10. Merge/deploy exact reviewed SHA only after CI and preview QA.
