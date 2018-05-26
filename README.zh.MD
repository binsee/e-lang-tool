# 易语言工具

这个工具可以读取或更新 [易语言](http://www.dywt.com.cn/) 代码文件中的项目信息.

## 安装与使用

**安装:**

```sh
$ npm i e-lang-tool
```

**使用:**

```sh
Usage: etool [options] <efile>

Read and Write project info for e lang code file.

Options:

  -V, --version                     output the version number
  -o, --out-json [file]             json file to write
  -s, --save-to-file [file]         file to write to
  -w, --write                       save new value to e lang file
  -n, --name <value>                change project name
  -d, --description <value>         change project description
  -a, --author <value>              change project author
  -M, --major <n>                   change major version number
  -m, --minor <n>                   change minor version number
  -p, --patch <n>                   change patch version number
  -d, --date <n>                    change date version number
  -v, --project-version <ver>       change project version number
  -f, --project-full-version <ver>  change full version number
  -h, --help                        output usage information

Examples:

> show project info:

  $ etool file.e

> output project info to json file:

  $ etool -o package.json file.e
  $ etool -o package.json file.ec

> update project info:

  $ etool -w -n "test project" file.e
  $ etool -w -n "test project" -v 1.1.0 file.e
  $ etool -w -n "test project" -v 1.1.0 -s new-file.e file.e
```

## 作者

[Binsee](http://github.com/binsee)
![binsee](https://avatars3.githubusercontent.com/u/5285894?s=160)

## CHANGELOG

[Changelog](./CHANGELOG.md)


## 许可证

MIT
