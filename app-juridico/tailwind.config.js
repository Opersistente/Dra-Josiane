/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#f8fafc',
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    900: '#0c4a6e',
                },
                priority: {
                    urgente: '#ef4444',
                    hoje: '#f97316',
                    alta: '#eab308',
                    media: '#3b82f6',
                    baixa: '#64748b'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            }
        },
    },
    plugins: [],
}
