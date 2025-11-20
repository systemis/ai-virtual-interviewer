# Supabase Database Setup for Interview Storage

This guide explains how to set up the Supabase database to store interview data and feedback.

## Overview

The interview system now automatically saves completed interviews to Supabase, including:
- Interview configuration (job role, experience level, interview type)
- Full conversation history (all messages between interviewer and user)
- AI-generated feedback with scores
- Completion timestamp

## Database Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://pmpmrefqhcpjvnxculna.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration Script

1. Open the file `supabase_migration.sql` in this directory
2. Copy the entire SQL script
3. Paste it into the Supabase SQL Editor
4. Click **Run** to execute the script

The script will create:
- **`interviews` table** with all required columns and constraints
- **Indexes** for optimized query performance
- **Row Level Security (RLS)** policies to protect user data
- **Statistics view** for analytics (optional)

### Step 3: Verify the Setup

After running the migration, verify the table was created:

1. Go to **Table Editor** in Supabase
2. You should see the `interviews` table
3. Click on it to view the schema

## Database Schema

### `interviews` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to auth.users (nullable for anonymous) |
| `job_role` | TEXT | Target job position |
| `experience_level` | TEXT | Junior, Mid-level, or Senior |
| `interview_type` | TEXT | Behavioral, Technical, or System Design |
| `conversation` | JSONB | Full chat history as JSON |
| `feedback` | JSONB | AI feedback object with scores and recommendations |
| `overall_score` | INTEGER | Overall score (1-10) |
| `communication_score` | INTEGER | Communication score (1-10) |
| `technical_score` | INTEGER | Technical score (1-10) |
| `question_count` | INTEGER | Number of questions asked |
| `completed_at` | TIMESTAMPTZ | When interview was completed |
| `created_at` | TIMESTAMPTZ | When record was created (auto) |

## Security (Row Level Security)

The database is configured with RLS policies:

- ✅ **Authenticated users** can only view, insert, update, and delete their own interviews
- ✅ User data is automatically isolated by `user_id`
- ✅ Prevents unauthorized access to other users' interview data

### Optional: Enable Anonymous Interview Storage

If you want to allow non-authenticated users to save interviews, uncomment the following policies in the migration script:

```sql
CREATE POLICY "Anonymous users can insert interviews"
  ON interviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anonymous users can view interviews without user_id"
  ON interviews
  FOR SELECT
  USING (user_id IS NULL);
```

## How It Works

### Automatic Storage

When an interview ends (either by completing all questions or user requesting early termination), the system automatically:

1. Generates AI feedback
2. Saves the complete interview data to Supabase
3. Transitions to the feedback screen

### Code Integration

The storage happens in three places:

1. **User requests to end interview early** (`useInterview.ts:166-174`)
   ```typescript
   await saveInterviewToSupabase({
     jobRole,
     experience,
     interviewType,
     messages: finalMessages,
     feedback: feedbackData,
     questionCount: currentQuestionIndex + 1,
   });
   ```

2. **All questions completed naturally** (`useInterview.ts:244-252`)
   ```typescript
   await saveInterviewToSupabase({
     jobRole,
     experience,
     interviewType,
     messages: finalMessages,
     feedback: feedbackData,
     questionCount: questions.length,
   });
   ```

3. **Manual "View Feedback" button** (`InterviewApp.tsx:168-176`)
   ```typescript
   await saveInterviewToSupabase({
     jobRole,
     experience,
     interviewType,
     messages,
     feedback: feedbackData,
     questionCount,
   });
   ```

## API Functions

The following functions are available in `app/lib/supabase/interview-service.ts`:

### `saveInterviewToSupabase(params)`
Saves interview data to Supabase. Returns the saved record or null on error.

### `getUserInterviews()`
Retrieves all interviews for the currently authenticated user.

### `getInterviewById(id)`
Retrieves a specific interview by ID.

### `deleteInterview(id)`
Deletes an interview by ID.

## Example Usage

### Fetching User's Interview History

```typescript
import { getUserInterviews } from './lib/supabase/interview-service';

// Get all interviews for current user
const interviews = await getUserInterviews();

console.log(`You have completed ${interviews.length} interviews`);
interviews.forEach(interview => {
  console.log(`${interview.job_role} - Score: ${interview.overall_score}/10`);
});
```

### Retrieving a Specific Interview

```typescript
import { getInterviewById } from './lib/supabase/interview-service';

const interview = await getInterviewById('uuid-here');
if (interview) {
  console.log('Conversation:', interview.conversation);
  console.log('Feedback:', interview.feedback);
}
```

## Querying the Database

### View All Interviews (in Supabase Dashboard)

```sql
SELECT
  job_role,
  experience_level,
  overall_score,
  completed_at
FROM interviews
ORDER BY completed_at DESC;
```

### Get User Statistics

```sql
SELECT * FROM interview_statistics
WHERE user_id = 'your-user-id';
```

### Find High-Scoring Interviews

```sql
SELECT
  job_role,
  overall_score,
  communication_score,
  technical_score
FROM interviews
WHERE overall_score >= 8
ORDER BY overall_score DESC;
```

## Testing

To test the integration:

1. Complete an interview (either all questions or request early end)
2. Wait for feedback screen to appear
3. Go to Supabase Table Editor
4. Check the `interviews` table - you should see a new record
5. Verify the JSON fields contain your conversation and feedback

## Troubleshooting

### Data Not Saving

1. **Check browser console** for error messages
2. **Verify Supabase connection**: Make sure `.env.local` has correct credentials
3. **Check RLS policies**: Ensure your user has permission to insert
4. **Look at Supabase logs**: Go to Logs section in Supabase dashboard

### Permission Errors

If you get permission errors:
- Verify the migration script ran successfully
- Check that RLS policies were created
- Ensure user is authenticated (or enable anonymous policies)

## Next Steps

- Build an interview history dashboard
- Add analytics and progress tracking
- Export interviews to PDF
- Compare scores across multiple interviews
- Add search and filter functionality

---

**Questions or Issues?**
Check the console logs for detailed error messages or review the Supabase logs in your dashboard.
