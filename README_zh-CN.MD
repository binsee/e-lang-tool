# 易语言工具

这个工具可以读取或更新 [易语言](http://www.dywt.com.cn/) 代码文件中的项目信息.

## 安装与使用

**安装:**

```sh
$ npm i e-lang-tool
```

**使用:**

```sh
Usage: eTool [options] <efile>

Read and Write project info for e lang code file.

Options:

  -V, --version                         output the version number
  -i, --input-json [file]               json file to read
  -o, --out-json [file]                 json file to write
  -s, --save-to-file [file]             E lang file to write to
  -w, --write                           save new value to e lang file
  -f, --read-json-fields [field, ...]   read fields from input json file
  -F, --write-json-fields [field, ...]  write fields to out json file
  -n, --name <value>                    change project name
  -d, --description <value>             change project description
  -a, --author <value>                  change project author
  -M, --major <n>                       change major version number
  -m, --minor <n>                       change minor version number
  -p, --patch <n>                       change patch version number
  -d, --date <n>                        change date version number
  -v, --ver <ver>                       change project version number
  -f, --full-version <ver>              change full version number
  -h, --help                            output usage information

Examples:

> show project info:

  $ eTool file.e

> output project info to json:

  $ eTool -o package.json file.e
  $ eTool -o package.json -F version,name,author file.ec

> update project info:

  $ eTool -w -n "test project" -v 1.1.0 file.e
  $ eTool -w -n "test project" -v 1.1.0 -s new-file.e file.e
  $ eTool -w -i ./info.json -f version -s new-file.e file.e
```

## 作者

[Binsee](http://github.com/binsee)
![binsee](https://avatars3.githubusercontent.com/u/5285894?s=160)

## CHANGELOG

[Changelog](./CHANGELOG.md)


## 许可证

MIT
