export const lightTheme = {
  background: '#F5FAFF',
  card: '#FFFFFF',
  cardSecondary: '#F8FBFF',

  primary: '#1261D6',
  primaryLight: '#EAF4FF',

  text: '#142B55',
  textSecondary: '#7188A4',
  textMuted: '#8BA2BD',

  border: '#E5EEF7',

  inputBackground: '#FFFFFF',
  inputBorder: '#DCE8F4',

  success: '#19B77A',
  warning: '#F2B632',
  danger: '#D94B5B',

  tabBar: '#FFFFFF',
  tabInactive: '#8BA2BD',

  motivationBackground: '#FFF8E8',
  motivationText: '#72521B',
  motivationSecondary: '#8A7041',

  logoutBackground: '#FFF0F2',
  logoutBorder: '#F7D9DE',

  shadow: '#142B55',
};

export const darkTheme = {
  background: '#07152F',
  card: '#101F3A',
  cardSecondary: '#142743',

  primary: '#2F8BFF',
  primaryLight: '#173A69',

  text: '#FFFFFF',
  textSecondary: '#B8C7DD',
  textMuted: '#8194B0',

  border: '#203555',

  inputBackground: '#101F3A',
  inputBorder: '#29405F',

  success: '#24D994',
  warning: '#FFD34E',
  danger: '#FF6475',

  tabBar: '#091832',
  tabInactive: '#8194B0',

  motivationBackground: '#172E50',
  motivationText: '#FFFFFF',
  motivationSecondary: '#AFC2DC',

  logoutBackground: '#351D28',
  logoutBorder: '#5A2B39',

  shadow: '#000000',
};

export type AppTheme =
  | typeof lightTheme
  | typeof darkTheme;