import loadConfig from './load-config'
import * as path from 'path'
import {IYokeCache} from '@yokejs/core-cache/lib/cache-manager'

/**
 * Returns the config value for the given key, supporting dot notation.
 *
 * The full config is returned if no key is provided.
 */
const getConfig = async (key?: string, separator = '.', cache?: IYokeCache): Promise<{ [key: string]: any }> => {
  const configPath = path.resolve(__dirname, '../__tests__/support/config')
  const config = await loadConfig(configPath, cache)

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
