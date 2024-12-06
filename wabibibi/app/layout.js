export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head>
        <title>微信文章提取器</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
} 