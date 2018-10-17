const fs = require('fs');
const _ = require('lodash');

module.exports = class TypescriptConfigDumpPlugin {
	constructor(options = {}) {
		this.outputPath = options.outputPath ? options.outputPath : './';
		this.name = options.name ? options.name : 'tsconfig.dump';
	}

	apply(compiler) {
		let tsLoader = this.findTsLoader(compiler.options);

		if (tsLoader) {
			this.options = tsLoader.options;
			this.dumpTsConfig();
		}
	}

	findTsLoader(webpackOptions) {
		const rules = webpackOptions.module.rules;
		let tsLoader;
		_.forEach(rules, rule => {
			if (rule.oneOf) {
				_.forEach(rule.oneOf, ext => {
					const tsLoaderSearcher = _.find(ext.use, loader => _.includes(loader.loader, 'ts-loader'));
					if (tsLoaderSearcher) {
						tsLoader = tsLoaderSearcher;
						return false;
					}
				});
				if (tsLoader) {
					return false;
				}
			}
		});

		return tsLoader;
    }

	dumpTsConfig() {
		const repoConfig = this.options.configFile ? require(this.options.configFile) : {};
		const loaderConfig = this.options.compilerOptions ? {compilerOptions: this.options.compilerOptions} : {};
		const dumpCfg = _.merge({}, repoConfig, loaderConfig);

		if (!fs.existsSync(this.outputPath)) {
			try {
				fs.mkdirSync(this.outputPath);
			} catch (err) {
				console.warn('Could not create cache folder:', err);
				return;
			}
		}
		try {
			fs.writeFileSync(`${this.outputPath}/${this.name}`, JSON.stringify(dumpCfg));
		} catch (err) {
			console.warn('Could not create dump file:', err);
		}
	}
};