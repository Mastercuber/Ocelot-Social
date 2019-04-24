import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()
let client
let variables

beforeEach(async () => {
  await factory.create('User', {
    email: 'test@example.org',
    password: '1234'
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('CreateComment', () => {
  const mutation = `
    mutation($postId: ID, $content: String!) {
      CreateComment(postId: $postId, content: $content) {
        id
        content
      }
    }
  `
  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      variables = {
        postId: 'p1',
        content: 'I\'m not authorised to comment'
      }
      client = new GraphQLClient(host)
      await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated', () => {
    let headers
    beforeEach(async () => {
      headers = await login({ email: 'test@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
    })

    it('creates a post', async () => {
      variables = {
        postId: 'p1',
        content: 'I\'m authorised to comment'
      }
      const expected = {
        CreateComment: {
          content: 'I\'m authorised to comment'
        }
      }

      await expect(client.request(mutation, variables)).resolves.toMatchObject(expected)
    })
  })
})
