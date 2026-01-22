import express from 'express'
import { JiraClient } from '../jira/jiraClient'

export const jiraRouter = express.Router()

let jiraClient: JiraClient | null = null

jiraRouter.post('/connect', (req: express.Request, res: express.Response): void => {
  try {
    const { baseUrl, email, token } = req.body

    if (!baseUrl || !email || !token) {
      res.status(400).json({ error: 'Base URL, email, and token are required' })
      return
    }

    jiraClient = new JiraClient(baseUrl, email, token)
    res.json({ success: true, message: 'Connected to Jira successfully' })
  } catch (error) {
    console.error('Error connecting to Jira:', error)
    res.status(500).json({ error: 'Failed to connect to Jira' })
  }
})

jiraRouter.get('/projects', async (req: express.Request, res: express.Response): Promise<void> => {
  if (!jiraClient) {
    res.status(400).json({ error: 'Not connected to Jira. Please connect first.' })
    return
  }

  try {
    const projects = await jiraClient.getProjects()
    res.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects from Jira' })
  }
})

jiraRouter.get('/sprints/:projectKey', async (req: express.Request, res: express.Response): Promise<void> => {
  if (!jiraClient) {
    res.status(400).json({ error: 'Not connected to Jira. Please connect first.' })
    return
  }

  try {
    const { projectKey } = req.params
    const sprints = await jiraClient.getSprints(projectKey)
    res.json(sprints)
  } catch (error) {
    console.error('Error fetching sprints:', error)
    res.status(500).json({ error: 'Failed to fetch sprints from Jira' })
  }
})

jiraRouter.get('/stories', async (req: express.Request, res: express.Response): Promise<void> => {
  if (!jiraClient) {
    res.status(400).json({ error: 'Not connected to Jira. Please connect first.' })
    return
  }

  try {
    const { sprint } = req.query
    if (!sprint) {
      res.status(400).json({ error: 'Sprint ID is required' })
      return
    }
    const stories = await jiraClient.getStories(sprint as string)
    res.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    res.status(500).json({ error: 'Failed to fetch stories from Jira' })
  }
})

jiraRouter.get('/story/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  if (!jiraClient) {
    res.status(400).json({ error: 'Not connected to Jira. Please connect first.' })
    return
  }

  try {
    const { id } = req.params
    const details = await jiraClient.getStoryDetails(id)
    res.json(details)
  } catch (error) {
    console.error('Error fetching story details:', error)
    res.status(500).json({ error: 'Failed to fetch story details from Jira' })
  }
})