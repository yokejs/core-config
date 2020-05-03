import path from 'path'
import {promises as fsPromises} from 'fs'

const loadConfig = async (configPath?: string) => {
  const root = require.main?.filename || './'

  const resolveConfigPath = configPath || `${path.dirname(root)}/config`

  let files

  try {
    files = await fsPromises.readdir(resolveConfigPath, {withFileTypes: true})
  } catch (e) {
    throw new Error('Cannot find config directory')
  }

  const config = await files.reduce(async (carry,file) => {
    if(file.isDirectory()) {
      return carry
    }

    const fileConfig = await import(`${resolveConfigPath}/${file.name}`)
    const fileKey = path.basename(file.name, '.js')
    const previous = await carry

    return {...previous, ...{[fileKey]: fileConfig.default}}
  }, Promise.resolve({}))

  return config
}

export default loadConfig
