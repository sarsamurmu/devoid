const toggleSwitch = document.querySelector('#themeSwitch');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
  document.documentElement.setAttribute('zust-theme', currentTheme);
  if (currentTheme === 'dark') toggleSwitch.checked = true;
}

toggleSwitch.addEventListener('change', (e) => {
  if (e.target.checked) {
    document.documentElement.setAttribute('zust-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('zust-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
});
