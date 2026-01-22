export interface GenerateRequest {
  storyTitle: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string
}

export interface TestCase {
  id: string
  title: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
}

export interface GenerateResponse {
  cases: TestCase[]
  model?: string
  promptTokens: number
  completionTokens: number
}

export interface JiraCredentials {
  baseUrl: string
  email: string
  token: string
}

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