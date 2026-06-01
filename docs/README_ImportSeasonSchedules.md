// uri: /nfl-schedule/nfl-schedule

curl -X POST http://localhost:5000/api/imports/nfl-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "seasonYear": 2026,
    "seasonType": 2,
    "week": 1,
    "source": "ESPN",
    "dryRun": false
  }'

  // Full Season loader
  for week in {1..18}; do
  curl -X POST http://localhost:5000/api/imports/nfl-schedule \
    -H "Content-Type: application/json" \
    -d "{
      \"seasonYear\": 2026,
      \"seasonType\": 2,
      \"week\": $week,
      \"source\": \"ESPN\",
      \"dryRun\": false
    }"

Expected response should be something like:

{
  "jobId": 123,
  "type": "IMPORT_NFL_SCHEDULE",
  "status": "pending"
}

Then run the job if your flow queues first:

curl -X POST http://localhost:5000/api/jobs/123/run

Then inspect status/logs:

curl http://localhost:5000/api/jobs/123
curl http://localhost:5000/api/jobs/123/logs


https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events?season=2026&seasontypes=2&week=1






Run a full regular-season load

Once you confirm the correct payload field name, regular season is:

seasonType = 2
weeks = 1 through 18

Example using year:

for week in {1..18}; do
  echo "Importing NFL schedule: 2026 regular season week $week"

  curl -X POST http://localhost:5000/api/imports/nfl-schedule \
    -H "Content-Type: application/json" \
    -d "{
      \"year\": 2026,
      \"seasonType\": 2,
      \"week\": $week
    }"

  echo ""
done

Preseason:

for week in {1..4}; do
  curl -X POST http://localhost:5000/api/imports/nfl-schedule \
    -H "Content-Type: application/json" \
    -d "{
      \"year\": 2026,
      \"seasonType\": 1,
      \"week\": $week
    }"
done

Postseason:

for week in {1..5}; do
  curl -X POST http://localhost:5000/api/imports/nfl-schedule \
    -H "Content-Type: application/json" \
    -d "{
      \"year\": 2026,
      \"seasonType\": 3,
      \"week\": $week
    }"
done
Verify it loaded

After running the import, check your local DB.

Depending on your table names:

SELECT *
FROM Game
WHERE season = 2026
ORDER BY week, gameDate;

or:

SELECT *
FROM Game
WHERE seasonYear = 2026
ORDER BY week, scheduledAt;

Also check job logs if the import is queued:

curl http://localhost:5000/api/jobs

Then inspect a specific job if returned:

curl http://localhost:5000/api/jobs/1
curl http://localhost:5000/api/jobs/1/logs
My read of your grep results

You do not need /api/schedules/upcomingSchedule for the import procedure. That route exists, but it looks like the older read/preview route.

For actual local loading, use:

POST /api/imports/nfl-schedule

That is the DPA-style ingestion endpoint.