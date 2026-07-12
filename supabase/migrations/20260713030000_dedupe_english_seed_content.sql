-- Two overlapping seed migrations inserted the same english content twice
-- (35 quotes with only 32 distinct texts, 18 listening with 17 distinct
-- titles). Keep the earliest row of each duplicate group.
DELETE FROM public.english_quotes a
USING public.english_quotes b
WHERE a.quote_text = b.quote_text
  AND a.created_at > b.created_at;

DELETE FROM public.english_listening a
USING public.english_listening b
WHERE a.title = b.title
  AND a.created_at > b.created_at;
