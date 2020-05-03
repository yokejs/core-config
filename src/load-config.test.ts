import loadConfig from './load-config'
import path from 'path'

describe('loadConfig', () => {
  it('throws an error if the config path cannot be found', async () => {
    expect.assertions(1)

    try {
      await loadConfig('some/path/which/does/not/exist/config')
    } catch (e) {
      expect(e.message).toEqual('Config directory "some/path/which/does/not/exist/config" does not exist.')
    }
  })

  it('returns a merged config by recursively loading files starting at the given configPath', async () => {
    expect.assertions(1)

    expect(await loadConfig(path.resolve(__dirname, '../__tests__/config'))).toEqual({
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
})
