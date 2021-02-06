import weblog from "webpack-log";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { inspect } from "util";
import { merge, get, find, forEach } from "lodash";

const log = weblog({ name: "wtcd" });

interface PluginOptions {
  outputPath?: string;
  name?: string;
}

export class TypescriptConfigDumpPlugin {
  private readonly outputPath: string;
  private readonly name: string;
  private loader;

  constructor(options: PluginOptions = {}) {
    this.outputPath = options.outputPath ? options.outputPath : "./";
    this.name = options.name ? options.name : "tsconfig.dump";
  }

  public apply(compiler: any): void {
    this.findTsLoader(compiler.options);
    this.dumpTsConfig();
  }

  private findTsLoader(webpackOptions) {
    const rules = webpackOptions.module.rules;

    forEach(rules, (rule) => {
      if (!rule.oneOf) {
        const loader = this.tryTogGetLoader(rule);
        if (loader) {
          this.loader = loader;
          return false;
        }
      } else {
        forEach(rule.oneOf, (ext) => {
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

  private tryTogGetLoader(rule) {
    const checker = new RegExp(rule.test);
    if (checker.test(".ts")) {
      return find(rule.use, (ld) => {
        const resolvedByName = [
          "ts-loader",
          "awesome-typescript-loader",
        ].includes(ld.loader);
        const tsFullPath = ld.loader && ld.loader.indexOf("ts-loader") > -1;
        const atsFullPath =
          ld.loader && ld.loader.indexOf("awesome-typescript-loader") > -1;
        return resolvedByName || tsFullPath || atsFullPath;
      });
    }
  }

  private dumpTsConfig(): void {
    const configFile = get(
      this.loader,
      ["options", "configFile"],
      "../../../tsconfig.json"
    );
    const compilerOptions = get(
      this.loader,
      ["options", "compilerOptions"],
      {}
    );

    let repoConfig;
    try {
      repoConfig = require(configFile);
    } catch (e) {
      log.warn("can't load tsconfig", configFile);
      repoConfig = {};
    }

    const dumpCfg = merge({}, repoConfig, compilerOptions);

    if (!existsSync(this.outputPath)) {
      try {
        mkdirSync(this.outputPath);
      } catch (err) {
        log.warn("Could not create cache folder:", err);
        return;
      }
    }
    try {
      const dump = inspect(dumpCfg, { depth: 10 });
      writeFileSync(`${this.outputPath}/${this.name}`, dump);
    } catch (err) {
      log.warn("Could not create dump file:", err);
    }
  }
}
