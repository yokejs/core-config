import loadConfig from './load-config'
import * as path from 'path'

/**
 * Returns the config value for the given key, supporting dot notation.
 *
 * The full config is returned if no key is provided.
 */
const getConfig = async (key?: string, separator = '.'): Promise<{ [key: string]: any }> => {
  // TODO: Load config from cache
  const configPath = path.resolve(__dirname, '../__tests__/config')
  const config = await loadConfig(configPath)

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

export default getConfig
