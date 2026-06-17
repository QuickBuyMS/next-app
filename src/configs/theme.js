/**
 * Theme configuration — adapted from mobile theme.ts
 * Removed require() image references (use CSS/public assets on web)
 */

const themeOne = {
  colors: {
    white: '#fff',
    black: '#000',
    border: '#f0f0f0',
    cardBorder: '#E5E5E5',
    cardSurface: '#F8F9FB',
    primaryButtonActive: '#F97B20',
    primaryButtonActive2: '#53B175',
    primaryButtonInactive: '#B9B9B9',
    verifySuccess: '#11B594',
    verifySuccessBg: '#D8FFEB',
    verifyPending: '#F97B20',
    verifyPendingBg: '#FFF4EB',
    error: '#F44336',
    labelColor: '#215991',
    itemLabel: '#fff',
    text: '#333333',
    titleText: '#181725',
    secondaryText: '#5F6266',
    mutedText: '#7C7C7C',
    modalBackdrop: 'rgba(0,0,0,0.4)',
    mintBreeze: '#8fe4d7',
    sandybeige: '#e5e1c6',
    sunnyLemon: '#fcf1a6',
    cardGradientStart: '#4E43E4',
    cardGradientEnd: '#A35FF1',
    cyanTeal: '#2b8fa4',
    goldenAmber: '#e6b036',
    darkCaramelBrown: '#523500',
    darkBrown: '#463822',
    redeemButtonBlue: '#2563EB',
    midnightNavy: '#0d1b34',
    leafGreen: '#53b175',
    lightGrey: '#F2F3F2',
    gold: '#FFC107',
    lightGray: '#eee',
    mediumGray: '#9E9E9E',
    midnightBlue: '#1E3A8A',
    slateLavender: '#6d6b80',
  },
  fonts: {
    regular: "'Inter', sans-serif",
    bold: "'Poppins', sans-serif",
  },
};

const theme = themeOne;
export default theme;
