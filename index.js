const fs = require('fs');
const util = require('util');
const forEach = require('lodash').forEach;
const find = require('lodash').find;
const get = require('lodash').get;
const merge = require('lodash').merge;
const weblog = require('webpack-log');

const log = weblog({ name: 'wtcd' });

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

		forEach(rules, rule => {
			if (!rule.oneOf) {
				const loader = this.tryTogGetLoader(rule);
				if (loader) {
					this.loader = loader;
					return false;
				}
			} else {
				forEach(rule.oneOf, ext => {
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
			return find(rule.use, ld => {
				const resolvedByName = ['ts-loader', 'awesome-typescript-loader'].includes(ld.loader);
				const tsFullPath = ld.loader && ld.loader.indexOf('ts-loader') > -1;
				const atsFullPath = ld.loader && ld.loader.indexOf('awesome-typescript-loader') > -1;
				return resolvedByName || tsFullPath || atsFullPath;
			});
		}
	}

	dumpTsConfig() {
		const configFile = get(this.loader, ['options', 'configFile'], './tsconfig.json');
		const compilerOptions = get(this.loader, ['options', 'compilerOptions']);

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

		const dumpCfg = merge({}, repoConfig, compilerOptions);

		if (!fs.existsSync(this.outputPath)) {
			try {
				fs.mkdirSync(this.outputPath);
			} catch (err) {
				log.warn('Could not create cache folder:', err);
				return;
			}
		}
		try {
			const dump = util.inspect(dumpCfg, { depth: 10 });
			fs.writeFileSync(`${this.outputPath}/${this.name}`, dump);
		} catch (err) {
			log.warn('Could not create dump file:', err);
		}
	}
};