const svgOptions = `stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`

export const enum Shape {
    Ram = `<path ${svgOptions} d=" M 2.25 10.995 L 2.25 14.655 C 2.25 15.635 3.26 16.435 5.69 16.435 L 20.69 16.435 C 20.69 16.435 21.75 15.635 21.75 14.655 L 21.75 10.995 M 11.41 19.425 L 18.18 19.425 C 19.2 19.425 20.03 18.895 20.03 18.125 L 20.03 16.435 M 3.97 16.395 L 3.97 18.135 C 3.97 18.855 4.8 19.435 5.82 19.435 L 9.1 19.435 M 2.25 7.555 L 2.25 6.345 C 2.25 5.365 3.26 4.565 4.5 4.565 L 19.5 4.565 C 20.74 4.565 21.75 5.365 21.75 6.345 L 21.75 7.555 M 2.25 7.555 C 3.2 7.555 3.97 8.325 3.97 9.275 C 3.97 10.225 3.2 10.995 2.25 10.995 M 21.75 10.995 C 20.8 10.995 20.03 10.225 20.03 9.275 C 20.03 8.325 20.8 7.555 21.75 7.555 M 9.1 19.425 L 9.1 16.435 L 11.4 16.435 L 11.4 19.425 M 8.74 12.375 L 5.86 12.375 L 5.86 6.845 L 8.74 6.845 L 8.74 12.375 Z  M 13.44 12.375 L 10.56 12.375 L 10.56 6.845 L 13.44 6.845 L 13.44 12.375 Z  M 18.14 12.375 L 15.26 12.375 L 15.26 6.845 L 18.14 6.845 L 18.14 12.375 Z " />`,
    Sticker = `<path ${svgOptions} d=" M 12 21 C 7.03 21 3 16.97 3 12 C 3 7.03 7.03 3 12 3 C 16.97 3 21 7.03 21 12 M 21 12 C 16.03 12 12 16.03 12 21 M 18.89 12 C 18.89 8.19 15.8 5.11 12 5.11 C 8.2 5.11 5.11 8.2 5.11 12 C 5.11 15.8 8.2 18.89 12 18.89 M 10 11.74 C 10 14.54 14 14.54 14 11.74 M 10 9.54 L 10 9.43 M 14 9.43 L 14 9.54 M 12 21 L 21 12" />`,
    CPU = `<path ${svgOptions} d="M8.25 3V4.5M4.5 8.25H3M21 8.25H19.5M4.5 12H3M21 12H19.5M4.5 15.75H3M21 15.75H19.5M8.25 19.5V21M12 3V4.5M12 19.5V21M15.75 3V4.5M15.75 19.5V21M6.75 19.5H17.25C18.4926 19.5 19.5 18.4926 19.5 17.25V6.75C19.5 5.50736 18.4926 4.5 17.25 4.5H6.75C5.50736 4.5 4.5 5.50736 4.5 6.75V17.25C4.5 18.4926 5.50736 19.5 6.75 19.5ZM7.5 7.5H16.5V16.5H7.5V7.5Z" />`,
    LightningBolt = `<path ${svgOptions} d="M3.75 13.5L14.25 2.25L12 10.5H20.25L9.75 21.75L12 13.5H3.75Z" />`,
    Gif = `<path ${svgOptions} d="M12.75 8.25V15.75M18.75 8.25H15.75V12M15.75 12V15.75M15.75 12H18M9.75 9.34835C8.72056 7.88388 7.05152 7.88388 6.02208 9.34835C4.99264 10.8128 4.99264 13.1872 6.02208 14.6517C7.05152 16.1161 8.72056 16.1161 9.75 14.6517V12H8.25M4.5 19.5H19.5C20.7426 19.5 21.75 18.4926 21.75 17.25V6.75C21.75 5.50736 20.7426 4.5 19.5 4.5H4.5C3.25736 4.5 2.25 5.50736 2.25 6.75V17.25C2.25 18.4926 3.25736 19.5 4.5 19.5Z" />`,
    Relay = `<path ${svgOptions} d="M12 21C16.1926 21 19.7156 18.1332 20.7157 14.2529M12 21C7.80742 21 4.28442 18.1332 3.2843 14.2529M12 21C14.4853 21 16.5 16.9706 16.5 12C16.5 7.02944 14.4853 3 12 3M12 21C9.51472 21 7.5 16.9706 7.5 12C7.5 7.02944 9.51472 3 12 3M12 3C15.3652 3 18.299 4.84694 19.8431 7.58245M12 3C8.63481 3 5.70099 4.84694 4.15692 7.58245M19.8431 7.58245C17.7397 9.40039 14.9983 10.5 12 10.5C9.00172 10.5 6.26027 9.40039 4.15692 7.58245M19.8431 7.58245C20.5797 8.88743 21 10.3946 21 12C21 12.778 20.9013 13.5329 20.7157 14.2529M20.7157 14.2529C18.1334 15.6847 15.1619 16.5 12 16.5C8.8381 16.5 5.86662 15.6847 3.2843 14.2529M3.2843 14.2529C3.09871 13.5329 3 12.778 3 12C3 10.3946 3.42032 8.88743 4.15692 7.58245"/>`,
    Inventory = `<path ${svgOptions} d=" M 20.805 20.125 L 3.195 20.125 C 2.645 20.125 2.195 19.675 2.195 19.125 L 2.195 6.865 C 2.195 5.205 3.535 3.865 5.195 3.865 L 18.805 3.865 C 20.465 3.865 21.805 5.205 21.805 6.865 L 21.805 19.125 C 21.805 19.675 21.355 20.125 20.805 20.125 Z  M 12.535 8.405 L 11.475 8.405 C 10.835 8.405 10.325 8.925 10.325 9.555 L 10.325 10.985 C 10.325 11.625 10.845 12.135 11.475 12.135 L 12.535 12.135 C 13.175 12.135 13.685 11.615 13.685 10.985 L 13.685 9.555 C 13.685 8.915 13.165 8.405 12.535 8.405 Z  M 13.685 10.125 L 21.805 10.125 M 2.195 10.125 L 10.325 10.125 M 8.875 6.285 L 8.875 3.865 L 5.745 3.865 L 5.745 6.285 C 5.745 6.835 6.195 7.285 6.745 7.285 L 7.875 7.285 C 8.425 7.285 8.875 6.835 8.875 6.285 Z  M 18.265 6.285 L 18.265 3.865 L 15.135 3.865 L 15.135 6.285 C 15.135 6.835 15.585 7.285 16.135 7.285 L 17.265 7.285 C 17.815 7.285 18.265 6.835 18.265 6.285 Z  M 15.125 14.185 L 15.125 20.135 L 18.255 20.135 L 18.255 14.185 C 18.255 13.635 17.805 13.185 17.255 13.185 L 16.125 13.185 C 15.575 13.185 15.125 13.635 15.125 14.185 Z  M 5.745 14.185 L 5.745 20.135 L 8.875 20.135 L 8.875 14.185 C 8.875 13.635 8.425 13.185 7.875 13.185 L 6.745 13.185 C 6.195 13.185 5.745 13.635 5.745 14.185 Z "/>`,
    Starlight = `<path ${svgOptions} fill="currentColor" stroke="none" d=" M 9.61 15.725 L 9.61 15.725 C 9.61 15.725 7.49 16.485 7.49 16.485 L 8.24 14.355 L 6.93 13.115 L 1.99 11.975 L 2 11.975 C 2 11.975 2 11.975 2 11.975 L 6.93 10.835 L 7.89 10.605 L 7.44 11.505 L 9.66 13.725 L 9.6 15.735 L 9.61 15.725 Z  M 10.25 9.665 L 12.47 7.445 L 13.37 7.895 L 13.14 6.935 L 12 2.005 L 12 2.005 C 12 2.005 12 2.005 12 2.005 L 10.86 6.945 L 9.62 8.255 L 7.49 7.505 L 8.25 9.625 L 8.25 9.625 C 8.25 9.625 10.26 9.685 10.26 9.685 L 10.25 9.665 Z  M 14.05 9.975 L 15.75 9.605 L 16.5 7.485 L 14.38 8.245 L 14.37 8.245 C 14.37 8.245 14.39 8.245 14.39 8.245 L 14.02 9.945 L 14.05 9.975 Z  M 21.98 11.995 L 21.99 11.995 C 21.99 11.995 20.63 11.685 20.63 11.685 L 17.07 10.865 L 17.07 10.865 C 17.07 10.865 16.1 10.635 16.1 10.635 L 16.56 11.515 L 15.88 12.185 L 12.07 15.995 L 11.52 16.555 L 10.62 16.105 L 10.86 17.035 L 12 21.995 L 12.47 19.935 L 13.13 17.075 L 14.39 15.745 L 16.52 16.495 L 15.76 14.375 L 17.09 13.115 L 20.43 12.345 L 22.01 11.985 L 21.99 11.985 L 21.98 11.995 Z  M 14.39 8.245 L 14.02 9.955 L 15.76 9.615 L 16.5 7.475 L 14.39 8.245 Z  M 13.31 12.025 L 11.96 10.675 L 10.61 12.025 L 11.96 13.375 L 13.31 12.025 Z "/>`,
    Headphones = `<path ${svgOptions} d=" M 9.834 18.288 C 8.445 19.059 6.965 19.321 5.794 18.502 C 5.224 18.103 4.61 14.664 5.019 14.103 C 5.858 12.932 7.287 12.661 8.858 12.879 C 9.688 12.988 10.524 17.917 9.834 18.298 L 9.834 18.288 Z  M 14.174 18.283 C 15.565 19.051 17.045 19.31 18.214 18.488 C 18.784 18.088 19.39 14.647 18.979 14.087 C 18.138 12.918 16.707 12.65 15.138 12.872 C 14.308 12.983 13.484 17.914 14.174 18.293 L 14.174 18.283 Z  M 18.486 11.498 C 18.48 6.048 15.979 4.991 11.979 4.995 C 7.979 5 5.49 6.053 5.496 11.503"/>`,
    Construction = `<path ${svgOptions} fill="currentColor" stroke="none" d=" M 10.896 6.808 C 12.097 6.829 13.072 5.85 13.046 4.65 C 13.023 3.513 12.103 2.599 10.968 2.58 C 9.768 2.559 8.793 3.538 8.818 4.738 C 8.842 5.875 9.761 6.789 10.896 6.808 L 10.896 6.808 Z  M 8.532 15.264 C 8.532 15.264 5.99 14.029 4.977 13.795 C 4.756 13.745 4.535 13.878 4.477 14.095 C 4.167 15.241 2.9 19.465 2.515 20.862 C 2.442 21.13 2.643 21.395 2.923 21.394 L 3.664 21.393 C 3.834 21.392 3.986 21.291 4.051 21.133 C 4.476 20.109 5.717 16.344 5.906 16.343 C 7.326 16.332 8.523 18.163 8.478 18.713 C 8.42 19.391 8.034 20.209 7.732 20.759 C 7.579 21.039 7.782 21.384 8.102 21.384 L 8.951 21.382 C 9.098 21.382 9.237 21.303 9.312 21.175 C 10.076 19.885 10.329 19.088 10.331 18.61 C 10.337 17.423 9.175 15.56 8.532 15.264 L 8.532 15.264 Z  M 21.413 20.454 L 17.856 13.755 C 17.28 12.76 16.083 13.468 15.51 14.465 L 13.98 16.618 L 13.165 15.851 C 13.182 15.75 13.182 15.63 13.158 15.493 C 12.894 13.975 11.724 8.783 10.873 7.951 C 10.846 7.924 10.814 7.901 10.779 7.884 L 8.148 6.498 C 8.015 6.426 7.866 6.395 7.714 6.402 C 6.798 6.448 4.712 6.757 4.043 6.86 C 3.91 6.881 3.795 6.963 3.732 7.081 C 3.516 7.499 2.907 8.525 2.57 9.326 C 2.436 9.642 2.508 10.008 2.753 10.25 L 3.206 10.615 L 4.777 11.823 C 4.916 11.93 4.976 12.113 4.924 12.282 C 4.785 12.722 4.909 12.402 4.857 12.608 C 4.805 12.817 4.917 13.033 5.121 13.107 C 5.842 13.368 7.768 14.377 8.51 14.586 C 8.718 14.645 8.682 14.432 8.762 14.232 L 8.679 14.123 L 13.306 17.651 L 11.47 20.789 C 11.308 21.07 11.511 21.421 11.835 21.42 L 20.868 21.402 C 21.354 21.401 21.658 20.874 21.413 20.454 L 21.413 20.454 Z  M 6.279 8.769 C 6.077 9.142 5.893 9.576 5.654 10.196 C 5.547 10.476 5.19 10.555 4.972 10.349 L 4.131 9.561 C 4.088 9.525 4.443 8.756 4.661 8.349 C 4.736 8.208 4.884 8.123 5.044 8.127 L 5.922 8.151 C 6.233 8.156 6.428 8.493 6.279 8.769 L 6.279 8.769 L 6.279 8.769 Z  M 9.19 12.835 L 9.752 11.442 C 9.899 11.074 10.427 11.094 10.546 11.472 C 10.851 12.455 11.281 13.939 11.738 14.934 L 9.19 12.835 L 9.19 12.835 Z " />`,
    Eyedropper = `<path ${svgOptions} d="m15 11.25 1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 1 0-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25 12.75 9" />`,
    Lock = `<path ${svgOptions} d="M16.5 10.5V6.75C16.5 4.26472 14.4853 2.25 12 2.25C9.51472 2.25 7.5 4.26472 7.5 6.75V10.5M6.75 21.75H17.25C18.4926 21.75 19.5 20.7426 19.5 19.5V12.75C19.5 11.5074 18.4926 10.5 17.25 10.5H6.75C5.50736 10.5 4.5 11.5074 4.5 12.75V19.5C4.5 20.7426 5.50736 21.75 6.75 21.75Z"/>`,
    ArrowsOut = `<path ${svgOptions} d="M3.75 3.75V8.25M3.75 3.75H8.25M3.75 3.75L9 9M3.75 20.25V15.75M3.75 20.25H8.25M3.75 20.25L9 15M20.25 3.75L15.75 3.75M20.25 3.75V8.25M20.25 3.75L15 9M20.25 20.25H15.75M20.25 20.25V15.75M20.25 20.25L15 15"/>`,
    Share = `<path ${svgOptions} d="M7.21721 10.9071C6.83295 10.2169 6.096 9.75 5.25 9.75C4.00736 9.75 3 10.7574 3 12C3 13.2426 4.00736 14.25 5.25 14.25C6.096 14.25 6.83295 13.7831 7.21721 13.0929M7.21721 10.9071C7.39737 11.2307 7.5 11.6034 7.5 12C7.5 12.3966 7.39737 12.7693 7.21721 13.0929M7.21721 10.9071L16.7828 5.5929M7.21721 13.0929L16.7828 18.4071M16.7828 18.4071C16.6026 18.7307 16.5 19.1034 16.5 19.5C16.5 20.7426 17.5074 21.75 18.75 21.75C19.9926 21.75 21 20.7426 21 19.5C21 18.2574 19.9926 17.25 18.75 17.25C17.904 17.25 17.1671 17.7169 16.7828 18.4071ZM16.7828 5.5929C17.1671 6.28309 17.904 6.75 18.75 6.75C19.9926 6.75 21 5.74264 21 4.5C21 3.25736 19.9926 2.25 18.75 2.25C17.5074 2.25 16.5 3.25736 16.5 4.5C16.5 4.89664 16.6026 5.26931 16.7828 5.5929Z"/>`,
    Brush = `<path ${svgOptions} d="M9.53086 16.1224C9.08517 15.0243 8.00801 14.25 6.75 14.25C5.09315 14.25 3.75 15.5931 3.75 17.25C3.75 18.4926 2.74262 19.5 1.49998 19.5C1.44928 19.5 1.39898 19.4983 1.34912 19.495C2.12648 20.8428 3.58229 21.75 5.24998 21.75C7.72821 21.75 9.73854 19.7467 9.74993 17.2711C9.74998 17.2641 9.75 17.2571 9.75 17.25C9.75 16.8512 9.67217 16.4705 9.53086 16.1224ZM9.53086 16.1224C10.7252 15.7153 11.8612 15.1705 12.9175 14.5028M7.875 14.4769C8.2823 13.2797 8.8281 12.1411 9.49724 11.0825M12.9175 14.5028C14.798 13.3141 16.4259 11.7362 17.6806 9.85406L21.5566 4.04006C21.6827 3.85093 21.75 3.6287 21.75 3.40139C21.75 2.76549 21.2345 2.25 20.5986 2.25C20.3713 2.25 20.1491 2.31729 19.9599 2.44338L14.1459 6.31937C12.2638 7.57413 10.6859 9.20204 9.49724 11.0825M12.9175 14.5028C12.2396 12.9833 11.0167 11.7604 9.49724 11.0825"/>`,
    Tree = `<path ${svgOptions} d="M10 2c.552 0 1 .448 1 1v4c0 .552-.448 1-1 1H8v2h5V9c0-.552.448-1 1-1h6c.552 0 1 .448 1 1v4c0 .552-.448 1-1 1h-6c-.552 0-1-.448-1-1v-1H8v6h5v-1c0-.552.448-1 1-1h6c.552 0 1 .448 1 1v4c0 .552-.448 1-1 1h-6c-.552 0-1-.448-1-1v-1H7c-.552 0-1-.448-1-1V8H4c-.552 0-1-.448-1-1V3c0-.552.448-1 1-1h6zm9 16h-4v2h4v-2zm0-8h-4v2h4v-2zM9 4H5v2h4V4z"/>`,
    Clock = `<path ${svgOptions} d="M12 6V12H16.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>`,
    Image = `<path ${svgOptions} fill="currentColor" d="M20 4H4c-1.1 0-1.9.9-1.9 1.9v14.2c0 1 .8 1.9 1.9 1.9h16c1 0 1.9-.8 1.9-1.9V5.9c0-1-.9-1.9-1.9-1.9zM5 7.5h3.2c.5 0 .8.3.8.8v7.4c0 .5-.3.8-.8.8H5c-.5 0-.8-.3-.8-.8V8.3c0-.5.3-.8.8-.8zm5 5h8c.6 0 1 .4 1 1s-.4 1-1 1h-8c-.6 0-1-.4-1-1s.4-1 1-1z"/>`,
    Gift = `<path ${svgOptions} d="M21 11.25V19.5C21 20.3284 20.3284 21 19.5 21H5.25C4.42157 21 3.75 20.3284 3.75 19.5V11.25M12 4.875C12 3.42525 10.8247 2.25 9.375 2.25C7.92525 2.25 6.75 3.42525 6.75 4.875C6.75 6.32475 7.92525 7.5 9.375 7.5C10.1095 7.5 12 7.5 12 7.5M12 4.875C12 5.59024 12 7.5 12 7.5M12 4.875C12 3.42525 13.1753 2.25 14.625 2.25C16.0747 2.25 17.25 3.42525 17.25 4.875C17.25 6.32475 16.0747 7.5 14.625 7.5C13.8905 7.5 12 7.5 12 7.5M12 7.5V21M3.375 11.25H21.375C21.9963 11.25 22.5 10.7463 22.5 10.125V8.625C22.5 8.00368 21.9963 7.5 21.375 7.5H3.375C2.75368 7.5 2.25 8.00368 2.25 8.625V10.125C2.25 10.7463 2.75368 11.25 3.375 11.25Z"/>`,
    ArrowUp = `<path ${svgOptions} d="M4.5 10.5L12 3M12 3L19.5 10.5M12 3V21"/>`,
    ArrowDown = `<path ${svgOptions} d="M19.5 13.5L12 21M12 21L4.5 13.5M12 21L12 3"/>`,
    ArrowsUpDown = `<path ${svgOptions} d="M3 7.5L7.5 3M7.5 3L12 7.5M7.5 3V16.5M21 16.5L16.5 21M16.5 21L12 16.5M16.5 21L16.5 7.5"/>`,
    ArrowsLeftRight = `<path ${svgOptions} d="M7.5 21L3 16.5M3 16.5L7.5 12M3 16.5H16.5M16.5 3L21 7.5M21 7.5L16.5 12M21 7.5L7.5 7.5"/>`,
    FolderPlus = `<path ${svgOptions} d="M12 10.5V16.5M15 13.5H9M13.0607 6.31066L10.9393 4.18934C10.658 3.90804 10.2765 3.75 9.87868 3.75H4.5C3.25736 3.75 2.25 4.75736 2.25 6V18C2.25 19.2426 3.25736 20.25 4.5 20.25H19.5C20.7426 20.25 21.75 19.2426 21.75 18V9C21.75 7.75736 20.7426 6.75 19.5 6.75H14.1213C13.7235 6.75 13.342 6.59197 13.0607 6.31066Z"/>`,
    UserBlock = `<path ${svgOptions} d="M 15.295 6.05 C 15.295 6.48 15.205 6.91 15.045 7.31 C 14.875 7.71 14.635 8.07 14.335 8.38 C 14.025 8.69 13.665 8.93 13.265 9.09 C 12.865 9.26 12.435 9.34 12.005 9.34 C 11.575 9.34 11.145 9.25 10.745 9.09 C 10.345 8.92 9.985 8.68 9.675 8.38 C 9.365 8.07 9.125 7.71 8.965 7.31 C 8.795 6.91 8.715 6.48 8.715 6.05 C 8.715 5.18 9.065 4.34 9.685 3.72 C 10.305 3.1 11.145 2.75 12.015 2.75 C 12.885 2.75 13.725 3.1 14.345 3.72 C 14.965 4.34 15.315 5.18 15.315 6.05 L 15.315 6.05 L 15.295 6.05 Z  M 16.575 19.44 C 15.125 20.03 13.575 20.34 12.005 20.34 C 9.725 20.34 7.595 19.71 5.775 18.62 L 5.775 18.62 C 5.775 18.62 5.775 18.51 5.775 18.51 C 5.775 16.86 6.435 15.27 7.595 14.11 C 8.225 13.48 8.975 13 9.785 12.69 M 12.395 12.3 C 13.905 12.4 15.325 13.04 16.395 14.11 C 17.465 15.18 18.105 16.6 18.205 18.1 M 19.715 19.72 C 21.765 17.67 22.915 14.9 22.915 12 C 22.915 9.1 21.765 6.33 19.715 4.28 C 17.665 2.23 14.895 1.08 11.995 1.08 C 9.095 1.08 6.325 2.23 4.285 4.28 M 19.725 19.72 C 17.675 21.77 14.905 22.92 12.005 22.92 C 9.105 22.92 6.335 21.77 4.285 19.72 C 2.235 17.67 1.085 14.9 1.085 12 C 1.085 9.1 2.235 6.32 4.285 4.28 M 19.725 19.72 L 4.285 4.28"/>`,
    UserPlus = `<path ${svgOptions} d="M19 7.5V10.5M19 10.5V13.5M19 10.5H22M19 10.5H16M13.75 6.375C13.75 8.23896 12.239 9.75 10.375 9.75C8.51104 9.75 7 8.23896 7 6.375C7 4.51104 8.51104 3 10.375 3C12.239 3 13.75 4.51104 13.75 6.375ZM4.00092 19.2343C4.00031 19.198 4 19.1615 4 19.125C4 15.6042 6.85418 12.75 10.375 12.75C13.8958 12.75 16.75 15.6042 16.75 19.125V19.1276C16.75 19.1632 16.7497 19.1988 16.7491 19.2343C14.8874 20.3552 12.7065 21 10.375 21C8.04353 21 5.86264 20.3552 4.00092 19.2343Z" />`,
    UserMinus = `<path ${svgOptions} d="M22 10.5H16M13.75 6.375C13.75 8.23896 12.239 9.75 10.375 9.75C8.51104 9.75 7 8.23896 7 6.375C7 4.51104 8.51104 3 10.375 3C12.239 3 13.75 4.51104 13.75 6.375ZM4.00092 19.2343C4.00031 19.198 4 19.1615 4 19.125C4 15.6042 6.85418 12.75 10.375 12.75C13.8958 12.75 16.75 15.6042 16.75 19.125V19.1276C16.75 19.1632 16.7497 19.1988 16.7491 19.2343C14.8874 20.3552 12.7065 21 10.375 21C8.04353 21 5.86264 20.3552 4.00092 19.2343Z"/>`,
    NoSymbol = `<path ${svgOptions} d="M18.364 18.364C21.8787 14.8492 21.8787 9.15076 18.364 5.63604C14.8492 2.12132 9.15076 2.12132 5.63604 5.63604M18.364 18.364C14.8492 21.8787 9.15076 21.8787 5.63604 18.364C2.12132 14.8492 2.12132 9.15076 5.63604 5.63604M18.364 18.364L5.63604 5.63604"/>`,
    UTurn = `<path ${svgOptions} d="M9 15L3 9M3 9L9 3M3 9H15C18.3137 9 21 11.6863 21 15C21 18.3137 18.3137 21 15 21H12"/>`,
    Code = `<path ${svgOptions} d="M17.25 6.75L22.5 12L17.25 17.25M6.75 17.25L1.5 12L6.75 6.75M14.25 3.75L9.75 20.25"/>`,
    Globe = `<path ${svgOptions} d="M12 21C16.1926 21 19.7156 18.1332 20.7157 14.2529M12 21C7.80742 21 4.28442 18.1332 3.2843 14.2529M12 21C14.4853 21 16.5 16.9706 16.5 12C16.5 7.02944 14.4853 3 12 3M12 21C9.51472 21 7.5 16.9706 7.5 12C7.5 7.02944 9.51472 3 12 3M12 3C15.3652 3 18.299 4.84694 19.8431 7.58245M12 3C8.63481 3 5.70099 4.84694 4.15692 7.58245M19.8431 7.58245C17.7397 9.40039 14.9983 10.5 12 10.5C9.00172 10.5 6.26027 9.40039 4.15692 7.58245M19.8431 7.58245C20.5797 8.88743 21 10.3946 21 12C21 12.778 20.9013 13.5329 20.7157 14.2529M20.7157 14.2529C18.1334 15.6847 15.1619 16.5 12 16.5C8.8381 16.5 5.86662 15.6847 3.2843 14.2529M3.2843 14.2529C3.09871 13.5329 3 12.778 3 12C3 10.3946 3.42032 8.88743 4.15692 7.58245"/>`,
    Document = `<path ${svgOptions} d="M19.5 14.25V11.625C19.5 9.76104 17.989 8.25 16.125 8.25H14.625C14.0037 8.25 13.5 7.74632 13.5 7.125V5.625C13.5 3.76104 11.989 2.25 10.125 2.25H8.25M10.5 2.25H5.625C5.00368 2.25 4.5 2.75368 4.5 3.375V20.625C4.5 21.2463 5.00368 21.75 5.625 21.75H18.375C18.9963 21.75 19.5 21.2463 19.5 20.625V11.25C19.5 6.27944 15.4706 2.25 10.5 2.25Z"/>`,
    Info = `<path ${svgOptions} d="M11.25 11.25L11.2915 11.2293C11.8646 10.9427 12.5099 11.4603 12.3545 12.082L11.6455 14.918C11.4901 15.5397 12.1354 16.0573 12.7085 15.7707L12.75 15.75M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM12 8.25H12.0075V8.2575H12V8.25Z"/>`,
    BellAlert = `<path ${svgOptions} d="M14.8569 17.0817C16.7514 16.857 18.5783 16.4116 20.3111 15.7719C18.8743 14.177 17.9998 12.0656 17.9998 9.75V9.04919C17.9999 9.03281 18 9.01641 18 9C18 5.68629 15.3137 3 12 3C8.6863 3 6.00001 5.68629 6.00001 9L5.99982 9.75C5.99982 12.0656 5.12529 14.177 3.68849 15.7719C5.42142 16.4116 7.24845 16.857 9.14315 17.0818M14.8569 17.0817C13.92 17.1928 12.9666 17.25 11.9998 17.25C11.0332 17.25 10.0799 17.1929 9.14315 17.0818M14.8569 17.0817C14.9498 17.3711 15 17.6797 15 18C15 19.6569 13.6569 21 12 21C10.3432 21 9.00001 19.6569 9.00001 18C9.00001 17.6797 9.0502 17.3712 9.14315 17.0818M3.12445 7.5C3.41173 5.78764 4.18254 4.23924 5.29169 3M18.7083 3C19.8175 4.23924 20.5883 5.78764 20.8756 7.5" />`,
    Moon = `<path ${svgOptions} d="M21.7519 15.0019C20.597 15.4839 19.3296 15.75 18 15.75C12.6152 15.75 8.25 11.3848 8.25 5.99999C8.25 4.67039 8.51614 3.40296 8.99806 2.24805C5.47566 3.71785 3 7.19481 3 11.25C3 16.6348 7.36522 21 12.75 21C16.8052 21 20.2821 18.5243 21.7519 15.0019Z"/>`,
    FolderOpen = `<path ${svgOptions} d="M3.75002 9.77602C3.86206 9.7589 3.97701 9.75 4.0943 9.75H19.9058C20.023 9.75 20.138 9.7589 20.25 9.77602M3.75002 9.77602C2.55402 9.9588 1.68986 11.0788 1.86691 12.3182L2.72405 18.3182C2.8824 19.4267 3.83173 20.25 4.95144 20.25H19.0486C20.1683 20.25 21.1176 19.4267 21.276 18.3182L22.1331 12.3182C22.3102 11.0788 21.446 9.9588 20.25 9.77602M3.75002 9.77602V6C3.75002 4.75736 4.75738 3.75 6.00002 3.75H9.8787C10.2765 3.75 10.6581 3.90804 10.9394 4.18934L13.0607 6.31066C13.342 6.59197 13.7235 6.75 14.1213 6.75H18C19.2427 6.75 20.25 7.75736 20.25 9V9.77602"/>`,
    Clipboard = `<path ${svgOptions} d="M15.6657 3.88789C15.3991 2.94272 14.5305 2.25 13.5 2.25H10.5C9.46954 2.25 8.60087 2.94272 8.33426 3.88789M15.6657 3.88789C15.7206 4.0825 15.75 4.28782 15.75 4.5V4.5C15.75 4.91421 15.4142 5.25 15 5.25H9C8.58579 5.25 8.25 4.91421 8.25 4.5V4.5C8.25 4.28782 8.27937 4.0825 8.33426 3.88789M15.6657 3.88789C16.3119 3.93668 16.9545 3.99828 17.5933 4.07241C18.6939 4.20014 19.5 5.149 19.5 6.25699V19.5C19.5 20.7426 18.4926 21.75 17.25 21.75H6.75C5.50736 21.75 4.5 20.7426 4.5 19.5V6.25699C4.5 5.149 5.30608 4.20014 6.40668 4.07241C7.04547 3.99828 7.68808 3.93668 8.33426 3.88789"/>`,
    EyeSlash = `<path ${svgOptions} d="M3.9799 8.22257C3.05679 9.31382 2.35239 10.596 1.93433 12.0015C3.22562 16.338 7.24308 19.5 11.9991 19.5C12.9916 19.5 13.952 19.3623 14.8622 19.1049M6.2276 6.22763C7.88385 5.13558 9.86768 4.5 11.9999 4.5C16.7559 4.5 20.7734 7.66205 22.0647 11.9985C21.3528 14.3919 19.8105 16.4277 17.772 17.772M6.2276 6.22763L2.99997 3M6.2276 6.22763L9.87865 9.87868M17.772 17.772L21 21M17.772 17.772L14.1213 14.1213M14.1213 14.1213C14.6642 13.5784 15 12.8284 15 12C15 10.3431 13.6568 9 12 9C11.1715 9 10.4215 9.33579 9.87865 9.87868M14.1213 14.1213L9.87865 9.87868"/>`,
    Eye = `<path ${svgOptions} d="M2.03556 12.3224C1.96648 12.1151 1.96642 11.8907 2.03538 11.6834C3.42374 7.50972 7.3608 4.5 12.0008 4.5C16.6387 4.5 20.5742 7.50692 21.9643 11.6776C22.0334 11.8849 22.0335 12.1093 21.9645 12.3166C20.5762 16.4903 16.6391 19.5 11.9991 19.5C7.36121 19.5 3.42565 16.4931 2.03556 12.3224Z"/><path ${svgOptions} d="M15 12C15 13.6569 13.6569 15 12 15C10.3432 15 9.00001 13.6569 9.00001 12C9.00001 10.3431 10.3432 9 12 9C13.6569 9 15 10.3431 15 12Z"/>`,
    Circle = `<path ${svgOptions} d="m11.67,1.92C6.28,1.92,1.92,6.28,1.92,11.67s4.36,9.75,9.75,9.75,9.75-4.36,9.75-9.75S17.05,1.92,11.67,1.92Z"/>`,
    Hashtag = `<path ${svgOptions} d="M5.25 8.25H20.25M3.75 15.75H18.75M16.95 2.25L13.05 21.75M10.9503 2.25L7.05029 21.75"/>`,
    Minus = `<path ${svgOptions} d="M19.5 12L4.5 12"/>`,
    Heart = `<path ${svgOptions} d="M21 8.25C21 5.76472 18.9013 3.75 16.3125 3.75C14.3769 3.75 12.7153 4.87628 12 6.48342C11.2847 4.87628 9.62312 3.75 7.6875 3.75C5.09867 3.75 3 5.76472 3 8.25C3 15.4706 12 20.25 12 20.25C12 20.25 21 15.4706 21 8.25Z"/>`,
    HeartSlash = `<path ${svgOptions} d=" M 8.745 18.04 C 8.745 18.04 8.795 18.08 8.815 18.1 C 10.545 19.48 11.995 20.25 11.995 20.25 C 11.995 20.25 20.995 15.47 20.995 8.25 C 20.995 7.83 20.935 7.43 20.825 7.04 C 20.825 7.03 20.825 7.01 20.815 7 M 19.595 5.04 C 19.595 5.04 19.565 5.01 19.545 4.99 C 18.705 4.22 17.565 3.75 16.315 3.75 C 14.375 3.75 12.715 4.88 12.005 6.48 C 11.285 4.87 9.625 3.75 7.695 3.75 C 5.105 3.75 3.005 5.76 3.005 8.25 C 3.005 11.57 4.905 14.37 6.955 16.43 C 6.995 16.47 7.015 16.49 7.065 16.54 M 4.945 18.48 L 20.995 3.75"/>`,
    VideoCamera = `<path ${svgOptions} d="M15.75 10.5L20.4697 5.78033C20.9421 5.30786 21.75 5.64248 21.75 6.31066V17.6893C21.75 18.3575 20.9421 18.6921 20.4697 18.2197L15.75 13.5M4.5 18.75H13.5C14.7426 18.75 15.75 17.7426 15.75 16.5V7.5C15.75 6.25736 14.7426 5.25 13.5 5.25H4.5C3.25736 5.25 2.25 6.25736 2.25 7.5V16.5C2.25 17.7426 3.25736 18.75 4.5 18.75Z" stroke-width="1.5" stroke-linecap="round"/>`,
    PhoneCall = `<path ${svgOptions} d=" M 1.905 7.105 C 1.905 15.385 8.625 22.105 16.905 22.105 L 19.155 22.105 C 20.395 22.105 21.405 21.095 21.405 19.855 L 21.405 18.485 C 21.405 17.965 21.055 17.515 20.555 17.395 L 16.135 16.285 C 15.695 16.175 15.235 16.335 14.965 16.705 L 13.995 17.995 C 13.715 18.375 13.225 18.535 12.785 18.375 C 9.475 17.165 6.855 14.535 5.645 11.235 C 5.485 10.795 5.645 10.305 6.025 10.025 L 7.315 9.055 C 7.675 8.785 7.845 8.325 7.735 7.885 L 6.625 3.465 C 6.495 2.965 6.045 2.615 5.535 2.615 L 4.165 2.615 C 2.925 2.615 1.915 3.625 1.915 4.865 L 1.915 7.115 L 1.905 7.105 Z  M 14.145 5.895 C 16.145 6.285 17.705 7.845 18.095 9.845 M 14.145 1.895 C 18.325 2.355 21.625 5.655 22.095 9.835"/>`,
    SendCoin = `<path ${svgOptions} d="M6 6L8 4M8 4L6 2M8 4H6C3.79086 4 2 5.79086 2 8M18 18L16 20M16 20L18 22M16 20H18C20.2091 20 22 18.2091 22 16M10.189 6.5C10.8551 3.91216 13.2042 2 16 2C19.3137 2 22 4.68629 22 8C22 10.7957 20.0879 13.1449 17.5001 13.811M14 16C14 19.3137 11.3137 22 8 22C4.68629 22 2 19.3137 2 16C2 12.6863 4.68629 10 8 10C11.3137 10 14 12.6863 14 16Z"/>`,
    Smile = `<path ${svgOptions} d="M15.182 15.182C13.4246 16.9393 10.5754 16.9393 8.81802 15.182M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM9.75 9.75C9.75 10.1642 9.58211 10.5 9.375 10.5C9.16789 10.5 9 10.1642 9 9.75C9 9.33579 9.16789 9 9.375 9C9.58211 9 9.75 9.33579 9.75 9.75ZM9.375 9.75H9.3825V9.765H9.375V9.75ZM15 9.75C15 10.1642 14.8321 10.5 14.625 10.5C14.4179 10.5 14.25 10.1642 14.25 9.75C14.25 9.33579 14.4179 9 14.625 9C14.8321 9 15 9.33579 15 9.75ZM14.625 9.75H14.6325V9.765H14.625V9.75Z"/>`,
    Plus = `<path ${svgOptions} d="M12 4.5V19.5M19.5 12L4.5 12"/>`,
    Profile = `<path ${svgOptions} d="M17.9815 18.7248C16.6121 16.9175 14.4424 15.75 12 15.75C9.55761 15.75 7.38789 16.9175 6.01846 18.7248M17.9815 18.7248C19.8335 17.0763 21 14.6744 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 14.6744 4.1665 17.0763 6.01846 18.7248M17.9815 18.7248C16.3915 20.1401 14.2962 21 12 21C9.70383 21 7.60851 20.1401 6.01846 18.7248M15 9.75C15 11.4069 13.6569 12.75 12 12.75C10.3431 12.75 9 11.4069 9 9.75C9 8.09315 10.3431 6.75 12 6.75C13.6569 6.75 15 8.09315 15 9.75Z"/>`,
    Keybind = `<path ${svgOptions} d=" M 2.5 5.665 C 2.5 3.915 3.92 2.495 5.67 2.495 L 18.34 2.495 C 20.09 2.495 21.51 3.915 21.51 5.665 L 21.51 18.335 C 21.51 20.085 20.09 21.505 18.34 21.505 L 5.66 21.505 C 3.91 21.505 2.49 20.085 2.49 18.335 L 2.49 5.665 L 2.5 5.665 Z  M 13.14 9.055 L 13.14 14.975 M 10.88 9.055 L 8.61 9.055 L 8.61 12.015 M 8.61 12.015 L 8.61 14.975 M 8.61 12.015 L 10.31 12.015 M 15.41 9.055 L 15.41 14.975 M 13.14 9.055 L 15.41 14.975"/>`,
    Speaker = `<path ${svgOptions} d=" M 6.75 8.25 L 11.47 3.53 C 11.94 3.06 12.75 3.39 12.75 4.06 L 12.75 19.94 C 12.75 20.61 11.94 20.94 11.47 20.47 L 6.75 15.75 L 4.51 15.75 C 3.63 15.75 2.81 15.24 2.57 14.4 C 2.36 13.64 2.25 12.83 2.25 12 C 2.25 11.17 2.36 10.37 2.57 9.6 C 2.8 8.75 3.63 8.25 4.51 8.25 L 6.75 8.25 Z "/>`,
    SpeakerWaveMax = `<path ${svgOptions} d="M19.114 5.63591C22.6287 9.15063 22.6287 14.8491 19.114 18.3638M16.4626 8.28765C18.5129 10.3379 18.5129 13.662 16.4626 15.7123M6.75 8.24993L11.4697 3.53026C11.9421 3.05778 12.75 3.39241 12.75 4.06059V19.9393C12.75 20.6074 11.9421 20.9421 11.4697 20.4696L6.75 15.7499H4.50905C3.62971 15.7499 2.8059 15.2435 2.57237 14.3957C2.36224 13.6329 2.25 12.8295 2.25 11.9999C2.25 11.1703 2.36224 10.367 2.57237 9.60416C2.8059 8.7564 3.62971 8.24993 4.50905 8.24993H6.75Z"/>`,
    SpeakerWave = `<path ${svgOptions} d=" M 16.46 8.29 C 18.51 10.34 18.51 13.66 16.46 15.71 M 6.75 8.25 L 11.47 3.53 C 11.94 3.06 12.75 3.39 12.75 4.06 L 12.75 19.94 C 12.75 20.61 11.94 20.94 11.47 20.47 L 6.75 15.75 L 4.51 15.75 C 3.63 15.75 2.81 15.24 2.57 14.4 C 2.36 13.64 2.25 12.83 2.25 12 C 2.25 11.17 2.36 10.37 2.57 9.6 C 2.8 8.75 3.63 8.25 4.51 8.25 L 6.75 8.25 Z "/>`,
    Preferences = `<path ${svgOptions} d="M4.50073 11.9993C4.50073 16.1414 7.8586 19.4993 12.0007 19.4993C16.1429 19.4993 19.5007 16.1414 19.5007 11.9993M4.50073 11.9993C4.50073 7.85712 7.8586 4.49925 12.0007 4.49925C16.1429 4.49926 19.5007 7.85712 19.5007 11.9993M4.50073 11.9993L3.00073 11.9993M19.5007 11.9993L21.0007 11.9993M19.5007 11.9993L12.0007 11.9993M3.54329 15.0774L4.95283 14.5644M19.0482 9.43411L20.4578 8.92108M5.1062 17.785L6.25527 16.8208M17.7459 7.17897L18.895 6.21479M7.50064 19.7943L8.25064 18.4952M15.7506 5.50484L16.5006 4.2058M10.4378 20.8633L10.6983 19.386M13.303 4.61393L13.5635 3.13672M13.5635 20.8633L13.303 19.3861M10.6983 4.61397L10.4378 3.13676M16.5007 19.7941L15.7507 18.4951M7.50068 4.20565L12.0007 11.9993M18.8952 17.7843L17.7461 16.8202M6.25542 7.17835L5.10635 6.21417M20.458 15.0776L19.0485 14.5646M4.95308 9.43426L3.54354 8.92123M12.0007 11.9993L8.25073 18.4944"/>`,
    HeadphoneSlash = `<path ${svgOptions} d=" M 9.86 18.29 C 8.47 19.06 6.99 19.32 5.82 18.5 C 5.25 18.1 4.64 14.66 5.05 14.1 C 5.89 12.93 7.32 12.66 8.89 12.88 C 9.72 12.99 10.55 17.92 9.86 18.3 L 9.86 18.29 Z  M 18.9 16.84 C 19.15 15.73 19.25 14.42 19.01 14.09 C 18.17 12.92 16.74 12.65 15.17 12.87 C 15.12 12.87 15.07 12.9 15.01 12.95 M 14.01 16.19 C 13.89 17.22 13.92 18.13 14.2 18.29 C 15.07 18.77 15.97 19.06 16.81 19 M 5.96 8.25 C 5.67 9.25 5.54 9.96 5.54 11.5 M 18.52 11.49 C 18.52 6.04 16.03 4.99 12.02 4.99 C 10.4 4.99 9.02 5.13 7.86 5.79 M 5.06 3 L 21 18.94"/>`,
    MicrophoneSlash = `<path ${svgOptions} d=" M 17.13 15.87 C 17.69 14.96 18 13.89 18 12.75 L 18 11.25 M 12 18.75 C 13.08 18.75 14.1 18.46 14.97 17.96 M 12 18.75 C 8.69 18.75 6 16.06 6 12.75 L 6 11.25 M 12 18.75 L 12 22.5 M 8.25 22.5 L 15.75 22.5 M 9 7.75 L 9 4.5 C 9 2.84 10.34 1.5 12 1.5 C 13.66 1.5 15 2.84 15 4.5 L 15 12.75 C 15 13.05 14.96 13.34 14.87 13.62 M 12.68 15.67 C 12.46 15.72 12.23 15.75 12 15.75 C 10.34 15.75 9 14.41 9 12.75 L 9 11.99 M 19.5 18.25 L 5 3.75"/>`,
    Microphone = `<path ${svgOptions} d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z"/>`,
    Stream = `<path ${svgOptions} d=" M 14.465 10.28 L 21.775 2.98 M 21.775 2.98 L 18.775 2.98 M 21.775 2.98 L 21.775 5.98 M 20.225 9.02 L 20.225 18.77 C 20.225 19.37 19.985 19.94 19.565 20.36 C 19.145 20.78 18.575 21.02 17.975 21.02 L 4.475 21.02 C 3.875 21.02 3.305 20.78 2.885 20.36 C 2.465 19.94 2.225 19.37 2.225 18.77 L 2.225 9.02 M 20.225 7.76 L 20.225 9.02 M 16.925 4.52 L 4.475 4.52 C 3.875 4.52 3.305 4.76 2.885 5.18 C 2.465 5.6 2.225 6.17 2.225 6.77 L 2.225 9.02 M 18.765 9.02 L 20.225 9.02 M 2.225 9.02 L 12.585 9.02 M 4.475 6.78 L 4.475 6.78 C 4.475 6.78 4.475 6.78 4.475 6.78 L 4.475 6.78 Z  M 6.725 6.78 L 6.725 6.78 C 6.725 6.78 6.725 6.78 6.725 6.78 L 6.725 6.78 Z  M 8.975 6.78 L 8.975 6.78 C 8.975 6.78 8.975 6.78 8.975 6.78 L 8.975 6.78 Z "/>`,
    PhoneXMark = `<path ${svgOptions} d="M15.75 3.75L18 6M18 6L20.25 8.25M18 6L20.25 3.75M18 6L15.75 8.25M17.25 21.75C8.96573 21.75 2.25 15.0343 2.25 6.75V4.5C2.25 3.25736 3.25736 2.25 4.5 2.25H5.87163C6.38785 2.25 6.83783 2.60133 6.96304 3.10215L8.06883 7.52533C8.17861 7.96445 8.01453 8.4266 7.65242 8.69818L6.3588 9.6684C5.98336 9.94998 5.81734 10.437 5.97876 10.8777C7.19015 14.1846 9.81539 16.8098 13.1223 18.0212C13.563 18.1827 14.05 18.0166 14.3316 17.6412L15.3018 16.3476C15.5734 15.9855 16.0355 15.8214 16.4747 15.9312L20.8979 17.037C21.3987 17.1622 21.75 17.6121 21.75 18.1284V19.5C21.75 20.7426 20.7426 21.75 19.5 21.75H17.25Z"/>`,
    ArrowRight = `<path ${svgOptions} d="M13.5 4.5L21 12M21 12L13.5 19.5M21 12H3"/>`,
    ArrowLeft = `<path ${svgOptions} d="M10.5 19.5L3 12M3 12L10.5 4.5M3 12H21"/>`,
    Beaker = `<path ${svgOptions} d="M9.75001 3.10408V8.81802C9.75001 9.41476 9.51295 9.98705 9.091 10.409L5.00001 14.5M9.75001 3.10408C9.49886 3.12743 9.24884 3.15465 9.00001 3.18568M9.75001 3.10408C10.4908 3.03521 11.2413 3 12 3C12.7587 3 13.5093 3.03521 14.25 3.10408M14.25 3.10408V8.81802C14.25 9.41476 14.4871 9.98705 14.909 10.409L19.8 15.3M14.25 3.10408C14.5011 3.12743 14.7512 3.15465 15 3.18568M19.8 15.3L18.2299 15.6925C16.1457 16.2136 13.9216 15.9608 12 15C10.0784 14.0392 7.85435 13.7864 5.7701 14.3075L5.00001 14.5M19.8 15.3L21.2022 16.7022C22.4341 17.9341 21.8527 20.0202 20.1354 20.3134C17.4911 20.7649 14.773 21 12 21C9.227 21 6.50891 20.7649 3.86459 20.3134C2.14728 20.0202 1.56591 17.9341 2.7978 16.7022L5.00001 14.5"/>`,
    XMark = `<path ${svgOptions} d="M6 18L18 6M6 6L18 18"/>`,
    Download = `<path ${svgOptions} d="M3 16.5V18.75C3 19.9926 4.00736 21 5.25 21H18.75C19.9926 21 21 19.9926 21 18.75V16.5M16.5 12L12 16.5M12 16.5L7.5 12M12 16.5V3"/>`,
    CheckMark = `<path ${svgOptions} d="M4.5 12.75L10.5 18.75L19.5 5.25"/>`,
    ChatBubble = `<path ${svgOptions} d="M7.5 8.25H16.5M7.5 11.25H12M2.25 12.7593C2.25 14.3604 3.37341 15.754 4.95746 15.987C6.08596 16.1529 7.22724 16.2796 8.37985 16.3655C8.73004 16.3916 9.05017 16.5753 9.24496 16.8674L12 21L14.755 16.8675C14.9498 16.5753 15.2699 16.3917 15.6201 16.3656C16.7727 16.2796 17.914 16.153 19.0425 15.9871C20.6266 15.7542 21.75 14.3606 21.75 12.7595V6.74056C21.75 5.13946 20.6266 3.74583 19.0425 3.51293C16.744 3.17501 14.3926 3 12.0003 3C9.60776 3 7.25612 3.17504 4.95747 3.51302C3.37342 3.74593 2.25 5.13956 2.25 6.74064V12.7593Z"/>`,
    ChevronsUp = `<path ${svgOptions} d="M4.5 12.75L12 5.25L19.5 12.75M4.5 18.75L12 11.25L19.5 18.75"/>`,
    ChevronsDown = `<path ${svgOptions} d="M19.5 5.25L12 12.75L4.5 5.25M19.5 11.25L12 18.75L4.5 11.25"/>`,
    ChevronDown = `<path ${svgOptions} d="M19.5 8.25L12 15.75L4.5 8.25"/>`,
    ChevronRight = `<path ${svgOptions} d="M8.25 4.5L15.75 12L8.25 19.5"/></svg>`,
    ChevronLeft = `<path ${svgOptions} d="M15.75 19.5L8.25 12L15.75 4.5"/>`,
    Refresh = `<path ${svgOptions} d="M16.0228 9.34841H21.0154V9.34663M2.98413 19.6444V14.6517M2.98413 14.6517L7.97677 14.6517M2.98413 14.6517L6.16502 17.8347C7.15555 18.8271 8.41261 19.58 9.86436 19.969C14.2654 21.1483 18.7892 18.5364 19.9685 14.1353M4.03073 9.86484C5.21 5.46374 9.73377 2.85194 14.1349 4.03121C15.5866 4.4202 16.8437 5.17312 17.8342 6.1655L21.0154 9.34663M21.0154 4.3558V9.34663"/>`,
    Coins = `<path ${svgOptions} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />`,
    Folder = `<path ${svgOptions} d="M2.25 12.75V12C2.25 10.7574 3.25736 9.75 4.5 9.75H19.5C20.7426 9.75 21.75 10.7574 21.75 12V12.75M13.0607 6.31066L10.9393 4.18934C10.658 3.90804 10.2765 3.75 9.87868 3.75H4.5C3.25736 3.75 2.25 4.75736 2.25 6V18C2.25 19.2426 3.25736 20.25 4.5 20.25H19.5C20.7426 20.25 21.75 19.2426 21.75 18V9C21.75 7.75736 20.7426 6.75 19.5 6.75H14.1213C13.7235 6.75 13.342 6.59197 13.0607 6.31066Z"/>`,
    Users = `<path ${svgOptions} d="M15 19.1276C15.8329 19.37 16.7138 19.5 17.625 19.5C19.1037 19.5 20.5025 19.1576 21.7464 18.5478C21.7488 18.4905 21.75 18.4329 21.75 18.375C21.75 16.0968 19.9031 14.25 17.625 14.25C16.2069 14.25 14.956 14.9655 14.2136 16.0552M15 19.1276V19.125C15 18.0121 14.7148 16.9658 14.2136 16.0552M15 19.1276C15 19.1632 14.9997 19.1988 14.9991 19.2343C13.1374 20.3552 10.9565 21 8.625 21C6.29353 21 4.11264 20.3552 2.25092 19.2343C2.25031 19.198 2.25 19.1615 2.25 19.125C2.25 15.6042 5.10418 12.75 8.625 12.75C11.0329 12.75 13.129 14.085 14.2136 16.0552M12 6.375C12 8.23896 10.489 9.75 8.625 9.75C6.76104 9.75 5.25 8.23896 5.25 6.375C5.25 4.51104 6.76104 3 8.625 3C10.489 3 12 4.51104 12 6.375ZM20.25 8.625C20.25 10.0747 19.0747 11.25 17.625 11.25C16.1753 11.25 15 10.0747 15 8.625C15 7.17525 16.1753 6 17.625 6C19.0747 6 20.25 7.17525 20.25 8.625Z"/>`,
    Cog = `<path ${svgOptions} d="M4.50073 11.9993C4.50073 16.1414 7.8586 19.4993 12.0007 19.4993C16.1429 19.4993 19.5007 16.1414 19.5007 11.9993M4.50073 11.9993C4.50073 7.85712 7.8586 4.49925 12.0007 4.49925C16.1429 4.49926 19.5007 7.85712 19.5007 11.9993M4.50073 11.9993L3.00073 11.9993M19.5007 11.9993L21.0007 11.9993M19.5007 11.9993L12.0007 11.9993M3.54329 15.0774L4.95283 14.5644M19.0482 9.43411L20.4578 8.92108M5.1062 17.785L6.25527 16.8208M17.7459 7.17897L18.895 6.21479M7.50064 19.7943L8.25064 18.4952M15.7506 5.50484L16.5006 4.2058M10.4378 20.8633L10.6983 19.386M13.303 4.61393L13.5635 3.13672M13.5635 20.8633L13.303 19.3861M10.6983 4.61397L10.4378 3.13676M16.5007 19.7941L15.7507 18.4951M7.50068 4.20565L12.0007 11.9993M18.8952 17.7843L17.7461 16.8202M6.25542 7.17835L5.10635 6.21417M20.458 15.0776L19.0485 14.5646M4.95308 9.43426L3.54354 8.92123M12.0007 11.9993L8.25073 18.4944"/>`,
    Wallet = `<path ${svgOptions} d="M21 12C21 10.7574 19.9926 9.75 18.75 9.75H15C15 11.4069 13.6569 12.75 12 12.75C10.3431 12.75 9 11.4069 9 9.75H5.25C4.00736 9.75 3 10.7574 3 12M21 12V18C21 19.2426 19.9926 20.25 18.75 20.25H5.25C4.00736 20.25 3 19.2426 3 18V12M21 12V9M3 12V9M21 9C21 7.75736 19.9926 6.75 18.75 6.75H5.25C4.00736 6.75 3 7.75736 3 9M21 9V6C21 4.75736 19.9926 3.75 18.75 3.75H5.25C4.00736 3.75 3 4.75736 3 6V9"/>`,
    Search = `<path ${svgOptions} d="M21 21L15.8033 15.8033M15.8033 15.8033C17.1605 14.4461 18 12.5711 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C12.5711 18 14.4461 17.1605 15.8033 15.8033Z"/>`,
    Sidebar = `<path ${svgOptions} d=" M 5 3 L 19 3 C 20.1 3 21 3.9 21 5 L 21 19 C 21 20.1 20.1 21 19 21 L 5 21 C 3.9 21 3 20.1 3 19 L 3 5 C 3 3.9 3.9 3 5 3 Z  M 9 3 L 9 21"/>`,
    Shop = `<path ${svgOptions} d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path ${svgOptions} d="M16 10a4 4 0 0 1-8 0"></path>`,
    ChatPlus = `<path ${svgOptions} d=" M 7.19 8.92 L 16.19 8.92 M 7.19 11.92 L 11.69 11.92 M 15.91 3.85 C 14.51 3.73 13.1 3.67 11.69 3.67 C 9.3 3.67 6.95 3.84 4.65 4.18 C 3.07 4.41 1.94 5.81 1.94 7.41 L 1.94 13.43 L 1.94 13.43 C 1.94 15.03 3.06 16.42 4.65 16.66 C 5.78 16.83 6.92 16.95 8.07 17.04 C 8.42 17.07 8.74 17.25 8.93 17.54 L 11.69 21.67 L 14.45 17.54 C 14.55 17.4 14.67 17.28 14.82 17.19 C 14.97 17.1 15.14 17.05 15.31 17.04 C 16.46 16.95 17.6 16.83 18.73 16.66 C 20.31 16.43 21.44 15.03 21.44 13.43 L 21.44 8.56 M 18.06 2.33 L 18.06 6.33 M 18.06 6.33 L 18.06 10.33 M 18.06 6.33 L 22.06 6.33 M 18.06 6.33 L 14.06 6.33"/>`,
    Pencil = `<path ${svgOptions} d="M16.8617 4.48667L18.5492 2.79917C19.2814 2.06694 20.4686 2.06694 21.2008 2.79917C21.9331 3.53141 21.9331 4.71859 21.2008 5.45083L6.83218 19.8195C6.30351 20.3481 5.65144 20.7368 4.93489 20.9502L2.25 21.75L3.04978 19.0651C3.26323 18.3486 3.65185 17.6965 4.18052 17.1678L16.8617 4.48667ZM16.8617 4.48667L19.5 7.12499"/>`,
    Trash = `<path ${svgOptions} d="M14.7404 9L14.3942 18M9.60577 18L9.25962 9M19.2276 5.79057C19.5696 5.84221 19.9104 5.89747 20.25 5.95629M19.2276 5.79057L18.1598 19.6726C18.0696 20.8448 17.0921 21.75 15.9164 21.75H8.08357C6.90786 21.75 5.93037 20.8448 5.8402 19.6726L4.77235 5.79057M19.2276 5.79057C18.0812 5.61744 16.9215 5.48485 15.75 5.39432M3.75 5.95629C4.08957 5.89747 4.43037 5.84221 4.77235 5.79057M4.77235 5.79057C5.91878 5.61744 7.07849 5.48485 8.25 5.39432M15.75 5.39432V4.47819C15.75 3.29882 14.8393 2.31423 13.6606 2.27652C13.1092 2.25889 12.5556 2.25 12 2.25C11.4444 2.25 10.8908 2.25889 10.3394 2.27652C9.16065 2.31423 8.25 3.29882 8.25 4.47819V5.39432M15.75 5.39432C14.5126 5.2987 13.262 5.25 12 5.25C10.738 5.25 9.48744 5.2987 8.25 5.39432"/>`,
    ArrowRightCircle = `<path ${svgOptions} d="M12.75 15L15.75 12M15.75 12L12.75 9M15.75 12L8.25 12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>`,
    ArrowPath = `<path ${svgOptions} d="M16.0228 9.34841H21.0154V9.34663M2.98413 19.6444V14.6517M2.98413 14.6517L7.97677 14.6517M2.98413 14.6517L6.16502 17.8347C7.15555 18.8271 8.41261 19.58 9.86436 19.969C14.2654 21.1483 18.7892 18.5364 19.9685 14.1353M4.03073 9.86484C5.21 5.46374 9.73377 2.85194 14.1349 4.03121C15.5866 4.4202 16.8437 5.17312 17.8342 6.1655L21.0154 9.34663M21.0154 4.3558V9.34663"/>`,
}
