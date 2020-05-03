import path from 'path'
import {promises as fsPromises} from 'fs'
import fs from 'fs'

/**
 * Recursively loads config files from the given path and returns the config object.
 *
 * @param configPath
 */
const loadConfig = async (configPath: string): Promise<{[key: string]: any}> => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config directory "${configPath}" does not exist.`)
  }

  return readConfigPath(configPath)
}

const readConfigPath = async (configPath: string, dirName?: string): Promise<{}> => {
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
