import path from 'path'
import { Logger, FileSystem as fs } from 'zos-lib'

const log = new Logger('Truffle')

const Truffle = {
  config() {
    try {
      const TruffleConfig = require('truffle-config')
      return TruffleConfig.detect({ logger: console })
    } catch (error) {
      if (error.message === 'Could not find suitable configuration file.') {
        throw Error('Could not find truffle.js config file, remember to initialize your project running "zos init".')
      } else {
        throw Error('Could not load truffle.js config file.\n' + error);
      }
    }
  },

  async compile(config = undefined) {
    log.info("Compiling contracts")
    config = config || this.config()
    config.all = true
    const TruffleCompile = require('truffle-workflow-compile')

    return new Promise((resolve, reject) => {
      TruffleCompile.compile(config, (error, abstractions, paths) => {
        if (error) reject(error)
        else resolve(abstractions, paths)
      })
    })
  },

  init(root = process.cwd()) {
    this._initContractsDir(root)
    this._initMigrationsDir(root)
    this._initTruffleConfig(root)
  },

  _initContractsDir(root) {
    const contractsDir = `${root}/contracts`
    this._initDir(contractsDir)
  },

  _initMigrationsDir(root) {
    const migrationsDir = `${root}/migrations`
    this._initDir(migrationsDir);
  },

  _initTruffleConfig(root) {
    const truffleFile = `${root}/truffle.js`
    const truffleConfigFile = `${root}/truffle-config.js`
    if (!fs.exists(truffleFile) && !fs.exists(truffleConfigFile)) {
      const blueprint = path.resolve(__dirname, './blueprint.truffle.js')
      fs.copy(blueprint, truffleConfigFile)
    }
  },

  _initDir(dir) {
    if (!fs.exists(dir)) {
      fs.createDir(dir)
      fs.write(`${dir}/.gitkeep`, '')
    }
  },
}

export default Truffle
