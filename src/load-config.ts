import path from 'path'
import {promises as fsPromises} from 'fs'
import fs from 'fs'
import {IYokeCache} from '@yokejs/core-cache/lib/cache-manager'

/**
 * Recursively loads config files from the given path and returns the config object.
 */
const loadConfig = async (configPath: string, cache?: IYokeCache): Promise<{ [key: string]: any }> => {
  if (cache) {
    try {
      // TODO: Allow this to be configurable
      const cachedConfig = await cache.get('yoke.config')

      if (cachedConfig) {
        return cachedConfig
      }
    } catch (e) {

    }
  }

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config directory "${configPath}" does not exist.`)
  }

  const config = await readConfigPath(configPath)

  if (cache) {
    await cache.set('yoke.cache', config)
  }

  return config
}

const readConfigPath = async (configPath: string, dirName?: string): Promise<{ [key: string]: any }> => {
  let files

  try {
    files = await fsPromises.readdir(configPath, {withFileTypes: true})
  } catch (e) {
    throw new Error(`Unable to read config directory "${configPath}". ${e.message}`)
  }

  return files.reduce(async (carry, file) => {
    const previous = await carry

    if (file.isDirectory()) {
      return {...previous, ...await readConfigPath(`${configPath}/${file.name}`, file.name)}
    }

    let fileConfig

    try {
      fileConfig = await import(`${configPath}/${file.name}`)
    } catch (e) {
      throw new Error(`Unable to dynamically import "${configPath}/${file.name}". ${e.message}`)
    }

    const fileKey = path.basename(file.name, '.js')
    const newConfig = dirName ? {[dirName]: {[fileKey]: fileConfig.default}} : {[fileKey]: fileConfig.default}

    return {...previous, ...newConfig}
  }, Promise.resolve({}))
}

export default loadConfig
