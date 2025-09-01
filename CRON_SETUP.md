# Tweet Generator Cron Job Setup with Agenda

This document explains the automated tweet generation system that runs every hour using **Agenda** job scheduling to create tweets for users based on their Reddit content preferences.

## Overview

The system uses **Agenda** (a MongoDB-based job scheduling library) to manage recurring tasks. The components work together to:
1. Query the database for users who need tweets generated
2. Fetch their voice profiles and subreddit preferences
3. Get random Reddit posts from their chosen subreddits
4. Generate tweets using Gemini AI based on the Reddit content
5. Schedule the generated tweets according to user preferences

## Why Agenda?

- **Persistent job storage**: Jobs are stored in MongoDB and survive app restarts
- **Distributed processing**: Multiple app instances can share the same job queue
- **Job monitoring**: Built-in job status tracking and failure handling
- **Flexible scheduling**: Support for complex cron patterns and one-time jobs

## Architecture

### Core Components

1. **Reddit Client** (`lib/services/external/reddit.client.ts`)
   - Fetches posts from Reddit's public JSON API
   - Supports all sort types: best, hot, new, top, rising
   - Handles rate limiting and error recovery
   - Filters posts to only include those with content

2. **Gemini Tweet Generator** (`lib/services/gemini.client.ts`)
   - Uses Google's Gemini AI to generate tweets
   - Takes user's voice profile into account
   - Generates tweets based on Reddit post content
   - Ensures tweets are under 280 characters

3. **Tweet Generator Cron** (`lib/services/tweet-generator-cron.ts`)
   - Main Agenda job logic
   - Uses Agenda to schedule jobs every hour
   - Processes all users who need tweets
   - Creates scheduled posts in the database
   - Handles job persistence and recovery

4. **Cron Manager** (`lib/services/cron-manager.ts`)
   - Manages the lifecycle of Agenda jobs
   - Handles initialization and shutdown
   - Provides status information
   - Manages Agenda instance

## How It Works

### 1. User Eligibility Check

The system identifies users who need tweets by checking:
- ✅ Has an active schedule policy (`SchedulePolicy.isActive = true`)
- ✅ Has enabled subreddit sources (`UserSubreddit.isEnabled = true`)
- ✅ Has a voice profile configured (`VoiceProfile` exists)
- ✅ Has connected X/Twitter account
- ✅ Hasn't reached daily tweet limit (based on `SchedulePolicy.postsPerDay`)

### 2. Content Fetching

For each eligible user:
- Randomly selects 3 subreddits from their enabled sources
- Fetches 3 posts from each subreddit using random sort types
- Only includes posts with `selftext` content (no image-only posts)

### 3. Tweet Generation

- Sends Reddit post content to Gemini AI along with user's voice profile
- Gemini generates tweets that match the user's tone, style, and preferences
- Generated tweets are validated and trimmed to 280 characters

### 4. Scheduling

- Creates `Draft` entries with status `APPROVED`
- Creates `ScheduledPost` entries with calculated schedule times
- Uses user's preferred posting times if configured
- Falls back to spreading posts throughout the day

## API Endpoints

### Get Cron Job Status
```http
GET /api/cron/tweet-generator
```

Returns:
```json
{
  "success": true,
  "data": {
    "isRunning": false,
    "isScheduled": true,
    "lastRun": {
      "usersProcessed": 5,
      "tweetsGenerated": 12,
      "errors": [],
      "startTime": "2025-01-01T12:00:00.000Z",
      "endTime": "2025-01-01T12:02:15.000Z"
    }
  }
}
```

### Control Cron Job
```http
POST /api/cron/tweet-generator
Content-Type: application/json

{
  "action": "start" | "stop" | "run"
}
```

- `start`: Start the hourly cron schedule
- `stop`: Stop the hourly cron schedule  
- `run`: Execute the job immediately (for testing)

### System Initialization
```http
GET /api/system/init
```

Initializes the cron system and returns status.

## Database Schema Updates

The system uses existing database tables:

- **Users**: Must have `SchedulePolicy`, `VoiceProfile`, and `UserSubreddit` entries
- **SourceItem**: Stores Reddit posts as source material
- **Draft**: Generated tweet content
- **ScheduledPost**: Scheduled tweets ready for posting

## Environment Variables

Required environment variables:
```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash  # or gemini-1.5-pro

# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# MongoDB for Agenda (Job Scheduling)
MONGODB_URL=mongodb://localhost:27017/sub2x-jobs
# OR
MONGO_URL=mongodb://localhost:27017/sub2x-jobs

# If MongoDB is not available, the system will fall back to in-memory job storage
# (not recommended for production)
```

**Important**: Agenda requires MongoDB for persistent job storage. If you don't have MongoDB available, the system will use in-memory storage, but jobs won't persist across app restarts.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install agenda axios
```

### 2. MongoDB Setup
You have several options for MongoDB:

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community  # macOS
# or follow official installation guide for your OS

# Start MongoDB
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string

**Option C: Docker MongoDB**
```bash
docker run --name sub2x-mongo -p 27017:27017 -d mongo:latest
```

### 3. Environment Setup
Create a `.env` file with the required variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_postgresql_connection_string
MONGODB_URL=mongodb://localhost:27017/sub2x-jobs
```

### 4. Start the Application
The Agenda-based cron job will automatically start when the Next.js application starts:

```bash
npm run dev
# or
npm run build && npm start
```

### 5. Verify Setup
Check that the Agenda job is running:
```bash
curl http://localhost:3000/api/cron/tweet-generator
```

Expected response:
```json
{
  "success": true,
  "data": {
    "isRunning": false,
    "isScheduled": true,
    "lastRun": null,
    "agendaStats": {
      "totalJobs": 1,
      "runningJobs": 0,
      "scheduledJobs": 1,
      "nextRun": "2025-01-01T13:00:00.000Z"
    }
  }
}
```

### 6. Manual Testing
Trigger a manual run for testing:
```bash
curl -X POST http://localhost:3000/api/cron/tweet-generator \
  -H "Content-Type: application/json" \
  -d '{"action": "run"}'
```

### 7. Monitor Jobs
You can also check your MongoDB database to see the Agenda jobs:
```bash
# Connect to MongoDB
mongo sub2x-jobs

# View jobs
db.agendaJobs.find().pretty()
```

## Configuration

### User Schedule Policy
Users can configure their posting preferences:
```typescript
{
  postsPerDay: 1,           // Number of tweets per day (default: 1)
  preferredTimes: ["09:00", "18:00"], // Preferred posting times
  timeZone: "UTC",          // User's timezone
  isActive: true            // Enable/disable auto-generation
}
```

### Voice Profile
The system uses the user's voice profile to generate authentic-sounding tweets that match their style.

## Monitoring

### Logs
The system provides detailed logging:
- Job start/completion times
- Users processed
- Tweets generated
- Errors encountered

### Error Handling
- Individual user failures don't stop the entire job
- Reddit API failures are handled gracefully
- Gemini API failures are logged and retried
- Database errors are caught and reported

## Troubleshooting

### Common Issues

1. **No tweets generated**: Check if users have valid voice profiles and enabled subreddits
2. **Reddit API failures**: Verify network connectivity and check Reddit's status
3. **Gemini API failures**: Ensure API key is valid and has sufficient quota
4. **Scheduling issues**: Check user's preferred times and timezone settings

### Debug Mode
To run a manual job and see detailed output:
```bash
curl -X POST http://localhost:3000/api/cron/tweet-generator \
  -H "Content-Type: application/json" \
  -d '{"action": "run"}'
```

## Security Considerations

- Reddit API calls use public endpoints (no authentication required)
- Gemini API key should be kept secure
- Rate limiting is implemented for external API calls
- Generated content is filtered for safety

## Performance

- Processes users in sequence to avoid overwhelming external APIs
- Uses connection pooling for database operations
- Implements timeouts for external API calls
- Graceful error handling prevents system crashes

## Future Enhancements

Potential improvements:
1. Add Redis for job queuing and distributed processing
2. Implement more sophisticated content filtering
3. Add user notification system for generated tweets
4. Support for multiple social media platforms
5. Advanced analytics and reporting
