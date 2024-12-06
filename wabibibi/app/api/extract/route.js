import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    // 获取微信文章内容
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // 提取文章内容
    const content = $('#js_content').text();
    
    // 简单的段落处理
    const paragraphs = content
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    return NextResponse.json({ content: paragraphs });
  } catch (error) {
    return NextResponse.json(
      { error: '无法提取文章内容' },
      { status: 500 }
    );
  }
}
