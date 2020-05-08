import fs, { promises as fsPromises } from 'fs'
import path from 'path'
import { IYokeCache } from '@yokejs/core-cache'

const Config = ({
  configDirectory,
  cache,
  cacheKey = 'yoke:config',
}: {
  configDirectory: string
  cache?: IYokeCache
  cacheKey?: string
}) => {
  /**
   * Load and return a merged config object from the files in the given configDirectory.
   *
   * The config is cached if cache is provided.
   */
  const load = async (): Promise<{ [key: string]: any }> => {
    if (cache) {
      try {
        const cachedConfig = await cache.get(cacheKey)

        if (cachedConfig) {
          return cachedConfig
        }
      } catch (e) {}
    }

    if (!fs.existsSync(configDirectory)) {
      throw new Error(`Config directory "${configDirectory}" does not exist.`)
    }

    const config = await readConfigPath(configDirectory)

    if (cache) {
      await cache.set(cacheKey, config)
    }

    return config
  }

  return {
    /**
     * Return a config value for the given key or the entire config if not provided.
     *
     * Supports dot notation by default.
     */
    get: async (
      key?: string,
      defaultValue?: any,
      separator: string = '.',
    ): Promise<{ [key: string]: any } | any> => {
      const config = await load()

      if (!key) {
        return config
      }

      let keyExists = false
      const value = key.split(separator).reduce((o, i: string) => {
        if (!!o && i in o) {
          keyExists = true
          // @ts-ignore
          return o[i]
        }

        return null
      }, config)

      if (keyExists) {
        return value
      }

      if (defaultValue) {
        return defaultValue
      }

      return null
    },

    /**
     * Flushes the config from the cache.
     */
    flush: async (): Promise<void> => {
      if (cache) {
        await cache?.flush()
      }
    },
  }
}

/**
 * Recursively read all config files in the given configDirectory and return a merged config object.
 */
const readConfigPath = async (
  configDirectory: string,
  dirName?: string,
): Promise<{ [key: string]: any }> => {
  let files

  try {
    files = await fsPromises.readdir(path.resolve(configDirectory), {
      withFileTypes: true,
    })
  } catch (e) {
    throw new Error(
      `Unable to read config directory "${configDirectory}". ${e.message}`,
    )
  }

  return files.reduce(async (carry, file) => {
    const previous = await carry

    if (file.isDirectory()) {
      return {
        ...previous,
        ...(await readConfigPath(`${configDirectory}/${file.name}`, file.name)),
      }
    }

    let fileConfig

    try {
      fileConfig = await import(`${configDirectory}/${file.name}`)
    } catch (e) {
      throw new Error(
        `Unable to dynamically import "${configDirectory}/${file.name}". ${e.message}`,
      )
    }

    const fileKey = path.basename(file.name, '.js')
    const newConfig = dirName
      ? { [dirName]: { [fileKey]: fileConfig.default } }
      : { [fileKey]: fileConfig.default }

    return { ...previous, ...newConfig }
  }, Promise.resolve({}))
}

export default Config
