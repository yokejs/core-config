import Config from './config'
import path from 'path'
import Cache, { FileSystemCache } from '@yokejs/core-cache'
import { promises as fsPromises } from 'fs'

describe('Config', () => {
  const configDirectory = path.resolve(__dirname, '../__tests__/support/config')
  const cacheDirectory = path.resolve(__dirname, '../__tests__/support/cache')
  const cache = Cache(
    FileSystemCache({
      directory: cacheDirectory,
    }),
  )

  const config = Config({ configDirectory, cache })

  const expectedConfig = {
    cache: {
      redis: {
        cluster: true,
        default: {
          host: '127.0.0.1',
          port: 6379,
        },
      },
    },
    app: {
      name: 'My application',
      env: 'local',
    },
    database: {
      connections: {
        default: {
          driver: 'pg',
          database: 'my-database',
          username: 'my-username',
          password: 'my-password',
          port: 5229,
        },
      },
    },
  }

  afterEach(() => {
    return cache.flush()
  })

  describe('get', () => {
    it('returns the full config if no key is provided', async () => {
      expect.assertions(1)

      expect(await config.get()).toEqual(expectedConfig)
    })

    it('returns the specific config value if key provided', async () => {
      expect.assertions(1)

      expect(await config.get('cache.redis.default')).toEqual({
        host: '127.0.0.1',
        port: 6379,
      })
    })

    it('returns null if the key provided does not exist', async () => {
      expect.assertions(1)

      expect(await config.get('some.key.which.does.not.exist')).toBeNull()
    })

    it('returns the default value if the key provided does not exist', async () => {
      expect.assertions(1)

      expect(
        await config.get('some.key.which.does.not.exist', 'defaultValue'),
      ).toEqual('defaultValue')
    })
  })

  describe('flush', () => {
    it('flushes the config from the cache', async () => {
      expect(await config.get()).toEqual(expectedConfig)

      try {
        await fsPromises.unlink(`${configDirectory}/new.js`)
      } catch (e) {}

      await fsPromises.writeFile(
        `${configDirectory}/new.js`,
        `
        module.exports = {
          config: "value"
        }
      `,
      )

      expect(await config.get()).toEqual(expectedConfig)

      await config.flush()

      expect(await config.get()).toEqual({
        ...expectedConfig,
        ...{ new: { config: 'value' } },
      })

      await fsPromises.unlink(`${configDirectory}/new.js`)
    })
  })
})
