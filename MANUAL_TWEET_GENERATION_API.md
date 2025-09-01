# Manual Tweet Generation API

This document explains the manual tweet generation API endpoint that allows users to generate tweets on-demand from the UI.

## Endpoint

```
POST /api/tweets/generate
```

## Authentication

This endpoint requires user authentication via NextAuth session. The user must be logged in.

## Request

### Headers
```
Content-Type: application/json
Authorization: Required (via session cookie)
```

### Body
```json
{}
```
*No request body parameters required - the API uses the current authenticated user's settings.*

## Response

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "tweetsGenerated": 2,
    "tweets": [
      {
        "id": "clx123456789",
        "text": "Just discovered this amazing productivity tip from r/productivity! 🚀 Sometimes the simplest changes make the biggest difference.",
        "scheduledFor": "2025-01-01T15:00:00.000Z",
        "sourcePost": {
          "title": "Simple productivity hack that changed my life",
          "subreddit": "productivity"
        }
      },
      {
        "id": "clx987654321",
        "text": "The tech industry keeps evolving, but the fundamentals remain the same. Focus on solving real problems. #TechWisdom",
        "scheduledFor": "2025-01-01T18:00:00.000Z",
        "sourcePost": {
          "title": "What I learned after 10 years in tech",
          "subreddit": "programming"
        }
      }
    ]
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

#### 404 User Not Found
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

#### 400 Schedule Not Active
```json
{
  "success": false,
  "error": "Tweet generation is not enabled. Please set up your posting schedule first.",
  "code": "SCHEDULE_NOT_ACTIVE"
}
```

#### 400 Voice Profile Missing
```json
{
  "success": false,
  "error": "Voice profile not found. Please complete your onboarding to create a voice profile.",
  "code": "VOICE_PROFILE_MISSING"
}
```

#### 400 No Sources
```json
{
  "success": false,
  "error": "No subreddit sources configured. Please add some subreddits to generate content from.",
  "code": "NO_SOURCES"
}
```

#### 400 No X Account
```json
{
  "success": false,
  "error": "No X (Twitter) account connected. Please connect your X account first.",
  "code": "NO_X_ACCOUNT"
}
```

#### 409 Daily Limit Reached
```json
{
  "success": false,
  "error": "You have already generated your daily limit of 3 tweet(s). Your next tweets will be generated tomorrow.",
  "code": "DAILY_LIMIT_REACHED"
}
```

#### 400 No Reddit Content
```json
{
  "success": false,
  "error": "No Reddit posts found from your selected subreddits. Please try again later.",
  "code": "NO_REDDIT_CONTENT"
}
```

#### 500 Tweet Generation Failed
```json
{
  "success": false,
  "error": "Failed to generate tweets. Please try again later.",
  "code": "TWEET_GENERATION_FAILED"
}
```

## Validation Checks

The API performs the following sanity checks before generating tweets:

### 1. **User Authentication**
- Verifies the user has a valid session
- Retrieves user from database

### 2. **Schedule Policy Check**
- Ensures user has an active `SchedulePolicy` with `isActive: true`
- Checks `postsPerDay` setting to determine daily limit

### 3. **Voice Profile Check**
- Verifies user has completed onboarding and has a `VoiceProfile`
- Required for generating tweets that match user's style

### 4. **Subreddit Sources Check**
- Ensures user has at least one enabled subreddit source
- Required for fetching Reddit content

### 5. **Connected Account Check**
- Verifies user has connected their X (Twitter) account
- Required for posting tweets

### 6. **Daily Limit Check**
- Counts existing scheduled/posted tweets for today
- Compares against user's `postsPerDay` setting
- Prevents generating more tweets than allowed

## How It Works

### 1. **Content Fetching**
- Randomly selects up to 3 subreddits from user's enabled sources
- Fetches posts using random sort types (best, hot, new, top, rising)
- Only includes posts with text content (`selftext`)

### 2. **Tweet Generation**
- Uses Gemini AI with user's voice profile
- Generates tweets matching user's tone, style, and preferences
- Ensures tweets are under 280 characters

### 3. **Scheduling**
- Creates `Draft` entries with `APPROVED` status
- Creates `ScheduledPost` entries with calculated times
- Uses user's preferred posting times if configured
- Falls back to spreading posts throughout the day

### 4. **Source Tracking**
- Creates or updates `SourceItem` entries for Reddit posts
- Links generated tweets to their source material
- Stores metadata about generation process

## Usage Examples

### Frontend Integration

```javascript
// React component example
const generateTweets = async () => {
  try {
    const response = await fetch('/api/tweets/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookie
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`Generated ${result.data.tweetsGenerated} tweets!`);
      // Update UI to show success
      setTweets(result.data.tweets);
    } else {
      // Handle specific error cases
      switch (result.code) {
        case 'DAILY_LIMIT_REACHED':
          showError('Daily tweet limit reached');
          break;
        case 'VOICE_PROFILE_MISSING':
          redirectToOnboarding();
          break;
        default:
          showError(result.error);
      }
    }
  } catch (error) {
    console.error('Failed to generate tweets:', error);
    showError('Something went wrong. Please try again.');
  }
};

// Button component
<button 
  onClick={generateTweets}
  disabled={isGenerating}
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
>
  {isGenerating ? 'Generating...' : 'Generate Tweets'}
</button>
```

### cURL Example

```bash
# Note: This requires a valid session cookie
curl -X POST http://localhost:3001/api/tweets/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_session_token" \
  -d '{}'
```

## Rate Limiting

The API is naturally rate-limited by:
- **Daily limits**: Users can only generate up to their `postsPerDay` setting
- **Reddit API**: Limited by Reddit's public API rate limits
- **Gemini API**: Limited by Google's API quotas

## Error Handling

The API includes comprehensive error handling:
- **Graceful degradation**: Continues if some subreddits fail
- **Detailed error messages**: Specific guidance for each error type
- **Proper HTTP status codes**: RESTful error responses
- **Logging**: All errors are logged for debugging

## Security Considerations

- **Authentication required**: Only authenticated users can generate tweets
- **User isolation**: Users can only generate tweets for their own account
- **Input validation**: All inputs are validated and sanitized
- **Rate limiting**: Natural rate limiting via daily limits

## Monitoring

The API logs:
- Tweet generation attempts
- Success/failure rates
- Error details
- User activity

## Integration with Cron System

This manual API reuses the same logic as the automated cron system:
- Same Reddit content fetching
- Same Gemini AI generation
- Same scheduling logic
- Same database operations

The only differences:
- Manual trigger vs. scheduled
- Immediate user feedback
- Authentication required
- Single user processing
