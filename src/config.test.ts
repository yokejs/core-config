import Config from './config'
import path from "path"
import FileSystemCache from '@yokejs/core-cache/lib/file-system-cache'
import CoreCache from '@yokejs/core-cache/lib/core-cache'
import {promises as fsPromises} from 'fs'

describe('Config', () => {
  const configDirectory = path.resolve(__dirname, '../__tests__/support/config')
  const cacheDirectory = path.resolve(__dirname, '../__tests__/support/cache')
  const fileSystemCache = FileSystemCache({directory: cacheDirectory, core: CoreCache()})
  const config = Config({configDirectory, cache: fileSystemCache})

  const expectedConfig = {
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
  }

  afterEach(() => {
    return fileSystemCache.flush()
  })

  describe('get', () => {
    it('returns the full config if no key is provided', async () => {
      expect.assertions(1)

      expect(await config.get()).toEqual(
        expectedConfig
      )
    })

    it('returns the specific config value if key provided', async () => {
      expect.assertions(1)

      expect(await config.get('cache.redis.default')).toEqual({
        "host": "127.0.0.1",
        "port": 6379
      })
    })

    it('returns null if the key provided does not exist', async () => {
      expect.assertions(1)

      expect(await config.get('some.key.which.does.not.exist')).toBeNull()
    })
  })

  describe('load', () => {
    it('throws an error if the config path cannot be found', async () => {
      expect.assertions(1)

      try {
        await Config({configDirectory: 'some/path/which/does/not/exist/config'}).load()
      } catch (e) {
        expect(e.message).toEqual('Config directory "some/path/which/does/not/exist/config" does not exist.')
      }
    })

    it('returns a merged config by recursively loading files starting at the given configDirectory', async () => {
      expect.assertions(1)

      expect(await config.load()).toEqual(expectedConfig)
    })

    it('saves the loaded config to cache if cache provided', async () => {
      expect.assertions(2)

      expect(await Config({configDirectory, cache: fileSystemCache}).load()).toEqual(
        expectedConfig
      )

      expect(await fileSystemCache.get('yoke:config')).toEqual(expectedConfig)
    })
  })

  describe('reload', () => {
    it('flushes the config from cache and reloads', async () => {
      await config.load()

      expect(await config.get()).toEqual(expectedConfig)

      try {
        await fsPromises.unlink(`${configDirectory}/new.js`)
      } catch (e) {

      }

      await fsPromises.writeFile(`${configDirectory}/new.js`, `
        module.exports = {
          config: "value"
        }
      `)

      expect(await config.reload()).toEqual({
        ...expectedConfig, ...{
          "new": {
            "config": "value"
          }
        }
      })

      await fsPromises.unlink(`${configDirectory}/new.js`)
    })
  })
})
