import loadConfig from './load-config'
import path from 'path'
import FileSystemCache from '@yokejs/core-cache/lib/file-system-cache'

describe('loadConfig', () => {
  const configDirectory = path.resolve(__dirname, '../__tests__/support/config')
  const cacheDirectory = path.resolve(__dirname, '../__tests__/support/cache')
  const fileSystemCache = FileSystemCache({directory: cacheDirectory})

  // afterEach(() => {
  //   return fileSystemCache.flush()
  // })

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

    expect(await loadConfig(path.resolve(__dirname, '../__tests__/support/config'))).toEqual({
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

  it('saves the loaded config to cache if cache provided', async () => {
    expect.assertions(1)

    expect(await loadConfig(configDirectory, fileSystemCache)).toEqual({
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
