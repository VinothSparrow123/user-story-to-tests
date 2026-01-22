import { GenerateRequest, GenerateResponse, JiraCredentials, JiraStory, JiraStoryDetails } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export async function generateTests(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating tests:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function connectJira(credentials: JiraCredentials): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || 'Failed to connect to Jira')
    }
  } catch (error) {
    console.error('Error connecting to Jira:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function getJiraProjects(): Promise<JiraProject[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/projects`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || 'Failed to fetch Jira projects')
    }

    const data: JiraProject[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Jira projects:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function getJiraSprints(projectKey: string): Promise<JiraSprint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/sprints/${projectKey}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || 'Failed to fetch Jira sprints')
    }

    const data: JiraSprint[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Jira sprints:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function getJiraStories(sprintId: string): Promise<JiraStory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/stories?sprint=${encodeURIComponent(sprintId)}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || 'Failed to fetch Jira stories')
    }

    const data: JiraStory[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Jira stories:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function getJiraStoryDetails(id: string): Promise<JiraStoryDetails> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/story/${id}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || 'Failed to fetch Jira story details')
    }

    const data: JiraStoryDetails = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Jira story details:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}