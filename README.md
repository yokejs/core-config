# [Yoke.js Config](https://github.com/yokejs/core-config)

Yoke.js Config is a simple Node.js filesystem config manager.

It supports an optional [Yoke.js Cache](https://github.com/yokejs/core-cache)
 driver for improved performance.

It uses dot notation for fetching deeply nested values.

## Installation

`$ yarn add "@yokejs/core-config"`
or
`$ npm install "@yokejs/core-config"`

## Usage

### Setting up your config files

A config file is simply an exported JavaScript object like the following:

```
// config/app.js
module.exports = {
    name: "My application",
    env: "local",
}
```

Files are placed in a base config directory and you can
 have as many nested folders and files as you like.

Here's an example Yoke.js Config file structure:

```
--config
----cache
------redis.js
----app.js
----database.js
```

You can view a full example [here](/example) with config keys and values.

### Initialising the config with the filesystem cache (recommended)

```
import CoreCache, {FileSystemCache} from '@yokejs/core-cache'
import Config from '@yokejs/core-config'

const configDirectory = path.resolve(__dirname, './config')
const cacheDirectory = path.resolve(__dirname, './cache')

const fileSystemCache = FileSystemCache({
  directory: cacheDirectory,
  core: CoreCache(),
});

const config = Config({ configDirectory, cache: fileSystemCache })
```

### Initialising the config without caching

```
import Config from '@yokejs/core-config'

const configDirectory = path.resolve(__dirname, './config')

const config = Config({ configDirectory })
```

### Fetching the entire config

```
// Initialise the config as instructed above

...

const entireConfig = await config.get()

console.log(JSON.stringify(entireConfig))

```

Outputs:

```
{
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
```

### Fetching a single config value

```
// Initialise the config as instructed above

...
const appName = await config.get('app.name')

console.log(appName)
// Outputs: My application
```

### Fetching a single config value and falling back to a default value

```
// Initialise the config as instructed above

...
const appName = await config.get('a.key.that.does.not.exist', 'My application')

console.log(appName)
// Outputs: My application
```

### Invalidating the config cache

```
// Initialise the config as instructed above

...

await config.flush()
```

## License

Yoke.js Config is open-sourced software licensed under the
[MIT](https://opensource.org/licenses/MIT) License.
