<p align="center">
  <img src="./app/views/assets/images/logo.png" width="200"/>
  <h3 align="center">Yosoro</h3>
  <p align="center">Beautiful Cloud Drive Markdown NoteBook Desktop App</p>
  <p align="center">
    <img src="https://img.shields.io/badge/platform-masOS%20%7C%20Linux%20%7C%20Windows-lightgrey.svg?style=flat-square" />
  </p>
  <p align="center">
    <img src="https://img.shields.io/github/release/iceend/yosoro.svg?style=flat-square" />
    <img src="https://img.shields.io/travis/IceEnd/Yosoro.svg?style=flat-square">
    <img src="https://img.shields.io/github/license/IceEnd/Yosoro.svg?style=flat-square" />
  </p>
  <p align="center">
    <img src="https://img.shields.io/github/downloads/IceEnd/Yosoro/total.svg?style=flat-square">
  </p>
</p>

## Download

The latest version of Yosoro for macOS, linux and Windows is available [here](https://github.com/IceEnd/Yosoro/releases).

**macOS 10.9+, Windows 7+ & Linux are supported.**

## Features

- Management notes
- Support **Latex** math formulas.
- File synchronization(OneDrive is supported)
- Image upload (GitHub is supported)
- Export notes as markdown or html or pdf
- Post article(Supports Medium)

You can read [Wiki](https://github.com/IceEnd/Yosoro/wiki) & [CHANGELOG](./CHANGELOG.md) to get more information.

## Theme

<p align="center">Mysterious `Dark`:high_brightness: and cute `Light`:crescent_moon:</p>

| Dark :crescent_moon:| Light :high_brightness: |
|:-------:|:-----:|
| ![](https://raw.githubusercontent.com/IceEnd/Yosoro-Img/img/yosoro/2018-10-20.22.38.48-image.png) | ![](https://raw.githubusercontent.com/IceEnd/Yosoro-Img/img/yosoro/2018-10-20.22.39.33-image.png) |

## Demo

### Write

![2018-09-24.14.00.53-write.gif](https://raw.githubusercontent.com/IceEnd/Yosoro-Img/img/yosoro/2018-09-24.14.00.53-write.gif)

### LaTeX

The editor converts LaTeX equations in double-dollars `$$`: $$ax^2+bx+c=0$$. All equations are rendered as block equations. If you need inline ones, you can add the prefix `\inline`: $$x_{1,2} = {-b\pm\sqrt{b^2 - 4ac} \over 2a}$$. But it is a good practice to place big equations on separate lines:

```
$$
x_{1,2} = {-b\pm\sqrt{b^2 - 4ac} \over 2a}.
$$
```
```
$$
|\vec{A}|=\sqrt{A_x^2 + A_y^2 + A_z^2}.
$$
```

```
$$
T^{\mu\nu}=\begin{pmatrix}
\varepsilon&0&0&0\\
0&\varepsilon/3&0&0\\
0&0&\varepsilon/3&0\\
0&0&0&\varepsilon/3
\end{pmatrix}
$$
```

Example:

![2018-09-29.10.17.27-image.png](https://raw.githubusercontent.com/IceEnd/Yosoro-Img/img/yosoro/2018-09-29.10.17.27-image.png)

### Upload Image

Drag the image into the editor or use the shortcut `ctrl+v` to upload the image.

![image](https://raw.githubusercontent.com/IceEnd/Yosoro-Img/img/yosoro/2018-07-27.00.47.27-image.gif)

### File Syncing

![sync](https://t1.picb.cc/uploads/2018/05/13/2vBRbs.gif)

## Shortcuts

[Shortcuts Wiki](https://github.com/IceEnd/Yosoro/wiki/Shortcuts)


## Screenshots

### macOS

![screenshot-osx](https://raw.githubusercontent.com/IceEnd/Yosoro-Img/img/yosoro/2018-09-23.19.10.55-image.png)

### Windows

![screenshot-window](https://raw.githubusercontent.com/IceEnd/Yosoro-Img/img/yosoro/2018-10-05.11.19.18-image.png)

### linux

![screenshot-linux](https://raw.githubusercontent.com/IceEnd/Yosoro-Img/img/yosoro/2018-07-27.00.22.40-linux.png)

## Contributing Guide

### Install

```shell
yarn
```

The installation failed in `Windows`, can try this command:

```shell
yarn --ignore-paltform
```

### Dev Tools Extension

```shell
cp ./config/devconfig.example.json ./config/devconfig.json
```

Edit `./config/devconfig.json`, add Chrome extensions, for example:

```json
{
    "extensions": [
        "/Users/xxx/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.15.3_0",
        "/Users/xxx/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.4.0_0"
    ]
}
```

### Run Main Process

```shell
npm run dev:main
```

### Run Renderer Process

```shell
npm run dev:renderer
```

### Build

```shell
npm run build:all|main|renderer
```

### Package

```
npm run packager:mac|win|win:64|linux
```

## Contributors

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/11556339?v=4" width="100px;"/><br /><sub><b>Alchemy</b></sub>](https://www.coolecho.net)<br />[💻](https://github.com/IceEnd/Yosoro/commits?author=IceEnd "Code") [🎨](#design-IceEnd "Design") [📖](https://github.com/IceEnd/Yosoro/commits?author=IceEnd "Documentation") [⚠️](https://github.com/IceEnd/Yosoro/commits?author=IceEnd "Tests") | [<img src="https://avatars3.githubusercontent.com/u/8283616?v=4" width="100px;"/><br /><sub><b>Jirawat Boonkumnerd</b></sub>](http://ntsd.github.io)<br />[💻](https://github.com/IceEnd/Yosoro/commits?author=ntsd "Code") | [<img src="https://avatars2.githubusercontent.com/u/32113014?v=4" width="100px;"/><br /><sub><b>Austin Leath</b></sub>](https://www.austinleath.com)<br />[📖](https://github.com/IceEnd/Yosoro/commits?author=AustinLeath "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/8417583?v=4" width="100px;"/><br /><sub><b>Hermes Gjini</b></sub>](http://afractal.me)<br />[📖](https://github.com/IceEnd/Yosoro/commits?author=afractal "Documentation") |
| :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

GPL-3.0 © [Alchemy](./LICENSE)
