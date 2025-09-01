import axios, { AxiosResponse } from 'axios'

export interface RedditPost {
  id: string
  title: string
  author: string
  url: string
  score: number
  numComments: number
  createdUtc: number
  subreddit: string
  selftext?: string
  isNsfw: boolean
}

export interface RedditResponse {
  posts: RedditPost[]
  after?: string
  before?: string
}

export interface RedditApiPost {
  data: {
    id: string
    title: string
    author: string
    url: string
    score: number
    num_comments: number
    created_utc: number
    subreddit: string
    selftext?: string
    over_18: boolean
    subreddit_name_prefixed: string
  }
}

export interface RedditApiResponse {
  data: {
    children: RedditApiPost[]
    after?: string
    before?: string
  }
}

export type RedditSortType = 'best' | 'hot' | 'new' | 'top' | 'rising'

export class RedditClient {
  private baseUrl = 'https://www.reddit.com'
  private userAgent = 'sub2x-bot/1.0.0'

  private async makeRequest(url: string): Promise<AxiosResponse<RedditApiResponse>> {
    try {
      const response = await axios.get<RedditApiResponse>(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000, // 10 second timeout
      })
      return response
    } catch (error) {
      console.error('Reddit API request failed:', error)
      throw new Error(`Failed to fetch from Reddit: ${error}`)
    }
  }

  private parseRedditPost(post: RedditApiPost): RedditPost {
    return {
      id: post.data.id,
      title: post.data.title,
      author: post.data.author,
      url: post.data.url,
      score: post.data.score,
      numComments: post.data.num_comments,
      createdUtc: post.data.created_utc,
      subreddit: post.data.subreddit,
      selftext: post.data.selftext || '',
      isNsfw: post.data.over_18,
    }
  }

  async fetchPosts(
    subreddit: string, 
    sort: RedditSortType = 'hot', 
    limit: number = 3
  ): Promise<RedditResponse> {
    const url = `${this.baseUrl}/r/${subreddit}/${sort}.json?limit=${limit}`
    
    try {
      const response = await this.makeRequest(url)
      
      const posts = response.data.data.children
        .filter(post => post.data.selftext && post.data.selftext.trim().length > 0) // Only posts with content
        .map(post => this.parseRedditPost(post))

      return {
        posts,
        after: response.data.data.after,
        before: response.data.data.before,
      }
    } catch (error) {
      console.error(`Failed to fetch ${sort} posts from r/${subreddit}:`, error)
      throw error
    }
  }

  async fetchTop(subreddit: string, limit: number = 3): Promise<RedditResponse> {
    return this.fetchPosts(subreddit, 'top', limit)
  }

  async fetchHot(subreddit: string, limit: number = 3): Promise<RedditResponse> {
    return this.fetchPosts(subreddit, 'hot', limit)
  }

  async fetchNew(subreddit: string, limit: number = 3): Promise<RedditResponse> {
    return this.fetchPosts(subreddit, 'new', limit)
  }

  async fetchBest(subreddit: string, limit: number = 3): Promise<RedditResponse> {
    return this.fetchPosts(subreddit, 'best', limit)
  }

  async fetchRising(subreddit: string, limit: number = 3): Promise<RedditResponse> {
    return this.fetchPosts(subreddit, 'rising', limit)
  }

  async getRandomPosts(subreddits: string[], count: number = 3): Promise<RedditPost[]> {
    const sortTypes: RedditSortType[] = ['best', 'hot', 'new', 'top', 'rising']
    const allPosts: RedditPost[] = []

    // Randomly select 3 subreddits
    const selectedSubreddits = subreddits
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(3, subreddits.length))

    for (const subreddit of selectedSubreddits) {
      try {
        // Randomly select a sort type
        const randomSort = sortTypes[Math.floor(Math.random() * sortTypes.length)]
        const response = await this.fetchPosts(subreddit, randomSort, count)
        allPosts.push(...response.posts)
      } catch (error) {
        console.warn(`Failed to fetch posts from r/${subreddit}:`, error)
        // Continue with other subreddits even if one fails
      }
    }

    return allPosts
  }

  async getSubredditInfo(subreddit: string): Promise<{
    name: string
    title: string
    description: string
    subscribers: number
    nsfw: boolean
  }> {
    const url = `${this.baseUrl}/r/${subreddit}/about.json`
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      })

      const data = response.data.data
      return {
        name: data.display_name,
        title: data.title,
        description: data.public_description || data.description || '',
        subscribers: data.subscribers,
        nsfw: data.over18,
      }
    } catch (error) {
      console.error(`Failed to fetch subreddit info for r/${subreddit}:`, error)
      throw new Error(`Failed to fetch subreddit info: ${error}`)
    }
  }
}

export const redditClient = new RedditClient()
