# Voice Profile API Documentation

The Voice Profile API allows users to create, manage, and generate voice profiles based on their X (Twitter) writing style. The voice profile captures the user's tone, style, vocabulary, and personality traits to generate consistent content.

## Base URL
```
/api/voice-profile
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get Voice Profile
Retrieve the user's existing voice profile.

**Endpoint:** `GET /api/voice-profile`

**Request:**
- No request body required
- Requires authentication

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "clxxxxx",
    "rules": {
      "tone": "professional",
      "style": "informative",
      "length": "medium",
      "hashtags": true,
      "mentions": false,
      "emojis": true,
      "vocabulary": ["innovative", "strategic", "growth"],
      "topics": ["technology", "business", "startups"],
      "sentenceStructure": "Mix of statements and questions, often uses lists",
      "engagement": "Engages with trending topics in tech and business",
      "personality": ["analytical", "forward-thinking", "collaborative"]
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `404` - Voice profile not found
- `401` - Unauthorized (invalid or missing token)
- `500` - Server error

---

### 2. Generate Voice Profile from Images
Create or update a voice profile by analyzing X profile screenshots.

**Endpoint:** `POST /api/voice-profile`

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `images`
- Upload 1-10 image files (JPEG, PNG, or WebP)

**Request Example:**
```javascript
const formData = new FormData();
formData.append('images', file1); // Screenshot 1
formData.append('images', file2); // Screenshot 2
formData.append('images', file3); // Screenshot 3

fetch('/api/voice-profile', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  },
  body: formData
});
```

**Response (Success - Profile Created):**
```json
{
  "ok": true,
  "data": {
    "id": "clxxxxx",
    "rules": {
      "tone": "casual",
      "style": "conversational",
      "length": "short",
      "hashtags": true,
      "mentions": true,
      "emojis": true,
      "vocabulary": ["awesome", "excited", "building", "community"],
      "topics": ["web development", "AI", "entrepreneurship"],
      "sentenceStructure": "Short, punchy sentences with frequent questions",
      "engagement": "Actively engages with tech community, shares personal experiences",
      "personality": ["enthusiastic", "helpful", "transparent"]
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Voice profile created successfully."
}
```

**Response (Success - Profile Updated):**
```json
{
  "ok": true,
  "data": {
    "id": "clxxxxx",
    "rules": {
      // Updated voice profile rules
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  },
  "message": "Voice profile updated successfully."
}
```

**Error Responses:**
```json
// No files provided
{
  "ok": false,
  "error": {
    "code": "NO_FILES_PROVIDED",
    "message": "No images provided. Please upload 1-10 images."
  }
}

// Invalid image count
{
  "ok": false,
  "error": {
    "code": "INVALID_IMAGE_COUNT",
    "message": "Please provide between 1 and 10 images."
  }
}

// Invalid file type
{
  "ok": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "All files must be images (JPEG, PNG, or WebP)."
  }
}

// Image parsing failed
{
  "ok": false,
  "error": {
    "code": "IMAGE_PARSING_FAILED",
    "message": "Failed to parse tweets from images."
  }
}

// Voice profile generation failed
{
  "ok": false,
  "error": {
    "code": "VOICE_PROFILE_GENERATION_FAILED",
    "message": "Failed to generate voice profile from tweets."
  }
}
```

---

### 3. Update Voice Profile
Update an existing voice profile with new rules.

**Endpoint:** `PUT /api/voice-profile`

**Request:**
```json
{
  "rules": {
    "tone": "professional",
    "style": "educational",
    "length": "long",
    "hashtags": false,
    "mentions": true,
    "emojis": false,
    "vocabulary": ["insights", "analysis", "research"],
    "topics": ["data science", "machine learning"],
    "sentenceStructure": "Detailed explanations with supporting data",
    "engagement": "Shares research findings and educational content",
    "personality": ["analytical", "thorough", "educational"]
  }
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "clxxxxx",
    "rules": {
      // Updated rules
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T15:45:00Z"
  }
}
```

**Error Responses:**
- `400` - Invalid rules object or validation errors
- `404` - Voice profile not found
- `401` - Unauthorized
- `500` - Server error

---

### 4. Delete Voice Profile
Delete the user's voice profile.

**Endpoint:** `DELETE /api/voice-profile`

**Request:**
- No request body required
- Requires authentication

**Response:**
- `204` - No content (successful deletion)

**Error Responses:**
- `404` - Voice profile not found
- `401` - Unauthorized
- `500` - Server error

---

## Voice Profile Rules Schema

The `rules` object contains the following fields:

### Core Fields (Required)
- **`tone`** (string): Overall writing tone
  - Possible values: `"professional"`, `"casual"`, `"friendly"`, `"formal"`, `"humorous"`
  - Example: `"casual"`

- **`style`** (string): Writing style preference
  - Possible values: `"informative"`, `"entertaining"`, `"persuasive"`, `"educational"`, `"conversational"`
  - Example: `"conversational"`

- **`length`** (string): Typical content length
  - Possible values: `"short"`, `"medium"`, `"long"`
  - Example: `"medium"`

### Usage Preferences (Optional)
- **`hashtags`** (boolean): Whether to use hashtags frequently
  - Example: `true`

- **`mentions`** (boolean): Whether to mention other users frequently
  - Example: `false`

- **`emojis`** (boolean): Whether to use emojis in content
  - Example: `true`

### Advanced Analysis (Optional)
- **`vocabulary`** (array of strings): Distinctive words or phrases used
  - Example: `["innovative", "game-changer", "excited"]`

- **`topics`** (array of strings): Main topics or themes discussed
  - Example: `["AI", "startups", "productivity"]`

- **`sentenceStructure`** (string): Description of how content is typically structured
  - Example: `"Short sentences with questions to engage audience"`

- **`engagement`** (string): How the user engages with topics and trends
  - Example: `"Shares personal experiences and asks for community input"`

- **`personality`** (array of strings): Key personality traits evident in writing
  - Example: `["enthusiastic", "helpful", "authentic"]`

---

## Integration Examples

### React/JavaScript Example
```javascript
// Get voice profile
const getVoiceProfile = async () => {
  try {
    const response = await fetch('/api/voice-profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    if (data.ok) {
      console.log('Voice profile:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Generate voice profile from images
const generateVoiceProfile = async (imageFiles) => {
  const formData = new FormData();
  
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  try {
    const response = await fetch('/api/voice-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('Generated profile:', data.data);
      console.log('Message:', data.message);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Update voice profile
const updateVoiceProfile = async (newRules) => {
  try {
    const response = await fetch('/api/voice-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rules: newRules })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('Updated profile:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### File Upload Component Example
```jsx
import React, { useState } from 'react';

const VoiceProfileGenerator = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file count
    if (selectedFiles.length > 10) {
      alert('Please select maximum 10 images');
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = selectedFiles.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Please select only JPEG, PNG, or WebP images');
      return;
    }
    
    setFiles(selectedFiles);
  };

  const generateProfile = async () => {
    if (files.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/voice-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.ok) {
        setResult(data.data);
        alert(data.message);
      } else {
        alert(`Error: ${data.error.message}`);
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Generate Voice Profile</h2>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
      />
      <p>Selected: {files.length} files (max 10)</p>
      
      <button 
        onClick={generateProfile} 
        disabled={loading || files.length === 0}
      >
        {loading ? 'Generating...' : 'Generate Voice Profile'}
      </button>
      
      {result && (
        <div>
          <h3>Generated Voice Profile</h3>
          <pre>{JSON.stringify(result.rules, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default VoiceProfileGenerator;
```

---

## Error Handling Best Practices

1. **Always check the `ok` field** in responses to determine success/failure
2. **Handle specific error codes** for better user experience
3. **Implement proper loading states** during file uploads
4. **Validate files on the frontend** before uploading to reduce server load
5. **Show progress indicators** for long-running operations
6. **Implement retry logic** for network failures

---

## Notes

- The voice profile generation process uses AI (Gemini) to analyze uploaded images
- Images should be clear screenshots of X (Twitter) profiles showing tweet content
- The system extracts tweet text from images and analyzes writing patterns
- Generated profiles can be further customized using the update endpoint
- All endpoints require valid JWT authentication with `xid` claim
