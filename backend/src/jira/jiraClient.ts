import axios from 'axios'

export interface JiraProject {
  id: string
  key: string
  name: string
}

export interface JiraSprint {
  id: string
  name: string
  state: string
}

export interface JiraStory {
  id: string
  title: string
}

export interface JiraStoryDetails {
  title: string
  description: string
  acceptanceCriteria: string
}

export class JiraClient {
  private baseUrl: string
  private auth: string

  constructor(baseUrl: string, email: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.auth = Buffer.from(`${email}:${token}`).toString('base64')
  }

  async getProjects(): Promise<JiraProject[]> {
    const url = `${this.baseUrl}/rest/api/3/project`

    console.log('=== Fetching Jira Projects ===')
    console.log('API URL:', url)
    console.log('Base URL:', this.baseUrl)
    console.log('Auth Header (first 20 chars):', `Basic ${this.auth.substring(0, 20)}...`)

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Accept': 'application/json'
        }
      })

      console.log('Jira API response status:', response.status)
      console.log('Number of projects found:', response.data?.length || 0)

      return response.data.map((project: any) => ({
        id: project.id,
        key: project.key,
        name: project.name
      }))
    } catch (error: any) {
      console.error('=== Error fetching Jira projects ===')
      console.error('Error message:', error.message)
      
      if (error.response) {
        console.error('HTTP Status:', error.response.status)
        console.error('Status Text:', error.response.statusText)
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2))
        
        if (error.response.status === 401) {
          throw new Error('Authentication failed. Check your Jira email and API token.')
        } else if (error.response.status === 403) {
          throw new Error('Access denied. Your Jira user does not have permission to access projects.')
        } else if (error.response.status === 404) {
          throw new Error('Jira API endpoint not found. Check your Jira base URL.')
        }
      } else if (error.request) {
        console.error('No response received:', error.request)
        throw new Error('No response from Jira server. Check your network connection and Jira base URL.')
      }
      
      throw new Error(`Failed to fetch projects from Jira: ${error.message}`)
    }
  }

  async getSprints(projectKey: string): Promise<JiraSprint[]> {
    try {
      // First get the board ID for the project
      const boardUrl = `${this.baseUrl}/rest/agile/1.0/board`
      const boardResponse = await axios.get(boardUrl, {
        params: { projectKeyOrId: projectKey },
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Accept': 'application/json'
        }
      })

      if (!boardResponse.data.values || boardResponse.data.values.length === 0) {
        throw new Error('No boards found for this project')
      }

      const boardId = boardResponse.data.values[0].id

      // Now get sprints for this board
      const sprintUrl = `${this.baseUrl}/rest/agile/1.0/board/${boardId}/sprint`
      const sprintResponse = await axios.get(sprintUrl, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Accept': 'application/json'
        }
      })

      return sprintResponse.data.values.map((sprint: any) => ({
        id: sprint.id.toString(),
        name: sprint.name,
        state: sprint.state
      }))
    } catch (error) {
      console.error('Error fetching Jira sprints:', error)
      throw new Error('Failed to fetch sprints from Jira')
    }
  }

  async getStories(sprintId: string): Promise<JiraStory[]> {
    const jql = `sprint = ${sprintId} AND issuetype = Story ORDER BY created DESC`

    const url = `${this.baseUrl}/rest/api/3/search/jql`
    const requestBody = {
      jql: jql,
      fields: ['summary', 'key'],
      maxResults: 100
    }

    console.log('Fetching Jira stories with JQL:', jql)
    console.log('API URL:', url)
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      console.log('Jira API response status:', response.status)
      console.log('Number of issues found:', response.data.issues?.length || 0)

      return response.data.issues.map((issue: any) => ({
        id: issue.key,
        title: issue.fields.summary
      }))
    } catch (error: any) {
      console.error('Error fetching Jira stories:', error.message)
      if (error.response) {
        console.error('Jira API error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        })
      }
      throw new Error(`Failed to fetch stories from Jira: ${error.message}`)
    }
  }

  async getStoryDetails(id: string): Promise<JiraStoryDetails> {
    const url = `${this.baseUrl}/rest/api/3/issue/${id}`
    const params = {
      fields: 'summary,description,customfield_10020' // customfield_10020 is typically acceptance criteria
    }

    try {
      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Accept': 'application/json'
        }
      })

      const issue = response.data
      const description = issue.fields.description?.content?.[0]?.content?.[0]?.text || ''
      const acceptanceCriteria = issue.fields.customfield_10020 || ''

      return {
        title: issue.fields.summary,
        description: description,
        acceptanceCriteria: acceptanceCriteria
      }
    } catch (error) {
      console.error('Error fetching Jira story details:', error)
      throw new Error('Failed to fetch story details from Jira')
    }
  }
}