const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/extract', async (req, res) => {
    try {
        const { url } = req.body;
        
        // 添加请求头模拟浏览器访问
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://mp.weixin.qq.com/'
            },
            timeout: 10000 // 10秒超时
        });

        // 检查响应内容类型
        if (!response.data || typeof response.data !== 'string') {
            throw new Error('无效的响应内容');
        }

        const $ = cheerio.load(response.data);
        
        // 检查是否找到内容区域
        const contentArea = $('#js_content');
        if (contentArea.length === 0) {
            throw new Error('未找到文章内容，可能是链接无效或文章已被删除');
        }

        const content = contentArea
            .find('*')
            .map((i, el) => {
                const $el = $(el);
                if ($el.contents().length === 1 && $el.contents()[0].type === 'text') {
                    const text = $el.text().trim();
                    if (text) {
                        const style = $el.attr('style') || '';
                        const marginBottom = style.match(/margin-bottom:\s*(\d+)px/);
                        
                        if (marginBottom && parseInt(marginBottom[1]) >= 20) {
                            return text + '\n\n';
                        } else {
                            return text + '\n';
                        }
                    }
                }
                return '';
            })
            .get()
            .join('')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        if (!content) {
            throw new Error('未能提取到文章内容');
        }
        
        res.json({
            success: true,
            content: content
        });
    } catch (error) {
        console.error('Error details:', error);
        let errorMessage = '提取失败，请检查链接是否正确';
        
        if (error.response) {
            if (error.response.status === 404) {
                errorMessage = '文章不存在或已被删除';
            } else if (error.response.status === 403) {
                errorMessage = '访问被拒绝，可能需要登录或链接已过期';
            }
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = '请求超时，请稍后重试';
        }

        res.status(200).json({
            success: false,
            message: errorMessage
        });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`You can access the app at http://localhost:${port}`);
});