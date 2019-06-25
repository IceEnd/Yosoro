import light from 'Assets/scss/theme/light.theme.css';
import dark from 'Assets/scss/theme/dark.theme.css';

export default function setThemeMode(theme) {
  const ID = '#yosoro-theme-color';
  let themeStyleEle = document.getElementById(ID);
  if (!themeStyleEle) {
    themeStyleEle = document.createElement('style');
    themeStyleEle.id = ID;
    document.head.appendChild(themeStyleEle);
  }

  let css;

  switch (theme) {
    case 'light':
      css = light;
      break;
    case 'dark':
      css = dark;
      break;
    default:
      css = '';
      break;
  }

  if (document.body.className !== theme) {
    document.body.className = theme;
  }

  themeStyleEle.innerHTML = css;
}
