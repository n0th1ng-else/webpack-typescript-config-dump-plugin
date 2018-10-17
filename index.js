const fs = require('fs');
const _ = require('lodash');
const weblog = require('webpack-log');

const log = weblog({ name: 'wtcd' })

module.exports = class TypescriptConfigDumpPlugin {
	constructor(options = {}) {
		this.outputPath = options.outputPath ? options.outputPath : './';
		this.name = options.name ? options.name : 'tsconfig.dump';
	}

	apply(compiler) {
		this.findTsLoader(compiler.options);
		this.dumpTsConfig();
	}

	findTsLoader(webpackOptions) {
		const rules = webpackOptions.module.rules;

		_.forEach(rules, rule => {
			if (!rule.oneOf) {
				const loader = this.tryTogGetLoader(rule);
				if (loader) {
					this.loader = loader;
					return false;
				}
			} else {
				_.forEach(rule.oneOf, ext => {
					const loader = this.tryTogGetLoader(ext);
					if (loader) {
						this.loader = loader;
						return false;
					}
				});
				if (this.loader) {
					return false;
				}
			}
		});
	}

	tryTogGetLoader(rule) {
		const checker = new RegExp(rule.test);
		if (checker.test('.ts')) {
			return _.find(rule.use, ld => {
				return ['ts-loader', 'awesome-typescript-loader'].includes(ld.loader);
			});
		}
	}

	dumpTsConfig() {
		const configFile = _.get(this.loader, ['options', 'configFile'], './tsconfig.json');
		const compilerOptions = _.get(this.loader, ['options', 'compilerOptions']);

		if (!compilerOptions) {
			return;
		}

		let repoConfig;
		try {
			repoConfig = require(configFile);
		} catch(e) {
			log.warn("can't load tsconfig", configFile);
			repoConfig = {};
		}

		const dumpCfg = _.merge({}, repoConfig, compilerOptions);

		if (!fs.existsSync(this.outputPath)) {
			try {
				fs.mkdirSync(this.outputPath);
			} catch (err) {
				log.warn('Could not create cache folder:', err);
				return;
			}
		}
		try {
			fs.writeFileSync(`${this.outputPath}/${this.name}`, JSON.stringify(dumpCfg));
		} catch (err) {
			log.warn('Could not create dump file:', err);
		}
	}
};