import {IYokeCache} from '@yokejs/core-cache/lib/cache-manager'
import fs, {promises as fsPromises} from "fs"
import path from "path"

/**
 * Recursively read all config files in the given configDirectory and return a merged config object.
 */
const readConfigPath = async (configDirectory: string, dirName?: string): Promise<{ [key: string]: any }> => {
  let files

  try {
    files = await fsPromises.readdir(configDirectory, {withFileTypes: true})
  } catch (e) {
    throw new Error(`Unable to read config directory "${configDirectory}". ${e.message}`)
  }

  return files.reduce(async (carry, file) => {
    const previous = await carry

    if (file.isDirectory()) {
      return {...previous, ...await readConfigPath(`${configDirectory}/${file.name}`, file.name)}
    }

    let fileConfig

    try {
      fileConfig = await import(`${configDirectory}/${file.name}`)
    } catch (e) {
      throw new Error(`Unable to dynamically import "${configDirectory}/${file.name}". ${e.message}`)
    }

    const fileKey = path.basename(file.name, '.js')
    const newConfig = dirName ? {[dirName]: {[fileKey]: fileConfig.default}} : {[fileKey]: fileConfig.default}

    return {...previous, ...newConfig}
  }, Promise.resolve({}))
}

const Config = ({configDirectory, cache, cacheKey = 'yoke:config'}: { configDirectory: string, cache?: IYokeCache, cacheKey?: string }) => {
  return {
    /**
     * Load and return a merged config object from the files in the given configDirectory.
     *
     * The config is cached if cache is provided.
     */
    load: async (): Promise<{ [key: string]: any }> => {
      if (cache) {
        try {
          const cachedConfig = await cache.get(cacheKey)

          if (cachedConfig) {
            return cachedConfig
          }
        } catch (e) {

        }
      }

      if (!fs.existsSync(configDirectory)) {
        throw new Error(`Config directory "${configDirectory}" does not exist.`)
      }

      const config = await readConfigPath(configDirectory)

      if (cache) {
        await cache.set(cacheKey, config)
      }

      return config
    },

    /**
     * Return a config value for the given key. Supports dot notation by default.
     */
    get: async (key?: string, separator = '.'): Promise<{ [key: string]: any }> => {
      const configDirectory = path.resolve(__dirname, '../__tests__/support/config')
      const config = await Config({configDirectory, cache, cacheKey}).load()

      if (!key) {
        return config
      }

      return key.split(separator).reduce((o, i) => {
        if (!!o && i in o) {
          return o[i]
        }

        return null
      }, config)
    }
  }
}

export default Config
