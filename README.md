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

const cacheDirectory = './config'

const fileSystemCache = FileSystemCache({
  directory: cacheDirectory,
  core: CoreCache(),
});

const config = Config({ configDirectory, cache: fileSystemCache })
```

### Initialising the config without caching

```
import Config from '@yokejs/core-config'

const cacheDirectory = './config'

const config = Config({ configDirectory })
```

### Fetching the entire config

```
// Initialise the config as instructed above

...

const entireConfig = await config.get()
```

### Fetching a single config value

```
// Initialise the config as instructed above

...

const appName = await config.get('app.name')
```

## License

Yoke.js Cache is open-sourced software licensed under the
[MIT](https://opensource.org/licenses/MIT) License.
