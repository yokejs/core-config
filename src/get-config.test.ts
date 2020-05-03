import getConfig from './get-config'

describe('getConfig', () => {
  it('returns the full config if no key is provided', async () => {
    expect.assertions(1)

    expect(await getConfig()).toEqual({
      cache: {
        "redis": {
          "cluster": true,
          "default": {
            "host": "127.0.0.1",
            "port": 6379
          }
        }
      },
      app: {
        name: "My application",
        env: "local",
      },
      database: {
        connections: {
          default: {
            "driver": "pg",
            "database": "my-database",
            "username": "my-username",
            "password": "my-password",
            "port": 5229
          }
        }
      }
    })
  })

  it('returns the specific config value if key provided', async () => {
    expect.assertions(1)

    expect(await getConfig('cache.redis.default')).toEqual({
      "host": "127.0.0.1",
      "port": 6379
    })
  })

  it('returns null if the key provided does not exist', async () => {
    expect.assertions(1)

    expect(await getConfig('some.key.which.does.not.exist')).toBeNull()
  })
})
