import loadConfig from './load-config'
import path from 'path'

describe('loadConfig',  () => {
  it('throws an error if the config path cannot be found', async () => {
    expect.assertions(1)

    try {
      await loadConfig()
    } catch (e) {
      expect(e.message).toEqual('Cannot find config directory')
    }
  })

  it('returns a merged config', async () => {
    expect.assertions(1)

    expect(await loadConfig(path.resolve(__dirname,'../config'))).toEqual({
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
