// tailwind.config.js updates
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'team-primary': 'var(--team-primary)',
        'team-secondary': 'var(--team-secondary)',
        'team-accent': 'var(--team-accent)',
      },
      backgroundColor: {
        'team-primary': 'var(--team-primary)',
        'team-secondary': 'var(--team-secondary)',
        'team-accent': 'var(--team-accent)',
      },
      textColor: {
        'team-primary': 'var(--team-primary)',
        'team-secondary': 'var(--team-secondary)',
        'team-accent': 'var(--team-accent)',
      },
      borderColor: {
        'team-primary': 'var(--team-primary)',
        'team-secondary': 'var(--team-secondary)',
        'team-accent': 'var(--team-accent)',
      },
    },
  },
  plugins: [],
};
