// src/components/ScraperView.jsx
import React, { useState, useEffect } from 'react';
import { Copy, Terminal, Shield, MousePointer, ScanLine } from 'lucide-react'; // 补全图标

export const ScraperView = () => {
  const [mode, setMode] = useState('selenium');
  const [config, setConfig] = useState({
    loginUrl: "https://bikawebapp.com",
    targetUrl: "https://bikawebapp.com/favourite",
    targetUrlToken: "https://bikawebapp.com/favourite",
    cookie: "",
    navLogic: "click",
    clickSelector: ".comic-card",
    hrefSelector: "a",
    waitTime: 2,
    // [新增] 补全原版选择器默认值
    container: ".comic-card",
    title: ".comic-card__overlay-title",
    author: ".comic-card__author-name",
    img: ".comic-card__cover-img",
    tags: ".hero-category-tag, .tag"
  });

  const [generatedCode, setGeneratedCode] = useState('');

// 实时更新生成的 Python 代码
  useEffect(() => {
    const { loginUrl, targetUrl, targetUrlToken, cookie, navLogic, clickSelector, hrefSelector, waitTime, container, title, author, img, tags } = config;
    
    let py = "";
    
    if (mode === 'token') {
        // COOKIE 直接请求代码
        py = `import requests
import os
import re
import time
from bs4 import BeautifulSoup
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

TARGET_URL = "${targetUrlToken}"
OUTPUT_DIR = "outputs"
HEADERS = {"User-Agent": "Mozilla/5.0...", "Cookie": r"""${cookie}""".strip()}

def clean_filename(text):
    return re.sub(r'[<>:"/\\\\|?*\\n\\r\\t]', '', text).strip()

def get_tags_from_url(url):
    try:
        if not url.startswith('http'): url = 'https://bikawebapp.com' + url
        res = requests.get(url, headers=HEADERS, verify=False, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        raw_tags = [t.get_text(strip=True) for t in soup.select("${tags}")]
        cleaned_tags = []
        seen = set()
        for t in raw_tags:
            ct = clean_filename(t)
            if ct and ct not in seen:
                cleaned_tags.append(ct)
                seen.add(ct)
        return cleaned_tags
    except Exception as e:
        print(f"Tag error: {e}")
        return []

def run():
    if not os.path.exists(OUTPUT_DIR): os.makedirs(OUTPUT_DIR)
    print("开始抓取...")
    try:
        res = requests.get(TARGET_URL, headers=HEADERS, verify=False)
        soup = BeautifulSoup(res.text, 'html.parser')
        items = soup.select("${container}")
        print(f"找到 {len(items)} 个项目")
        for item in items:
            try:
                title = item.select_one("${title}").get_text(strip=True)
                author = item.select_one("${author}").get_text(strip=True)
                img_el = item.select_one("${img}")
                if not img_el: continue
                img_src = img_el.get('src')
                if img_src and not img_src.startswith('http'): img_src = 'https://bikawebapp.com' + img_src
                tags = []
                link_el = item.select_one("a")
                if link_el and link_el.get('href'):
                    print(f"正在获取详情: {title}")
                    tags = get_tags_from_url(link_el.get('href'))
                    time.sleep(0.5)
                tag_str = "-".join(tags)
                fname = f"{clean_filename(title)}_{clean_filename(author)}"
                if tag_str: fname += f"_{tag_str}"
                fname += ".jpg"
                print(f"下载: {fname}")
                img_res = requests.get(img_src, headers=HEADERS, verify=False)
                with open(os.path.join(OUTPUT_DIR, fname), 'wb') as f:
                    f.write(img_res.content)
            except Exception as e:
                print(f"Item error: {e}")
    except Exception as e:
        print(f"Main error: {e}")

if __name__ == "__main__":
    run()`;
    } else {
        // SELENIUM 交互代码
        py = `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import os
import requests
import re
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

LOGIN_URL = "${loginUrl}"
TARGET_URL = "${targetUrl}"
OUTPUT_DIR = "outputs"

SEL_CONTAINER = "${container}"
SEL_TITLE = "${title}"
SEL_AUTHOR = "${author}"
SEL_IMG = "${img}"
SEL_TAGS = "${tags}"
NAV_LOGIC = "${navLogic}"
SEL_CLICK = "${clickSelector}"
WAIT_TIME = ${waitTime}

def clean_filename(text):
    return re.sub(r'[<>:"/\\\\|?*\\n\\r\\t]', '', text).strip()

def run_selenium():
    if not os.path.exists(OUTPUT_DIR): os.makedirs(OUTPUT_DIR)
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    try:
        driver.get(LOGIN_URL)
        print(">>> 请在浏览器中手动完成登录 <<<")
        input(">>> 登录完成后，请按回车键继续... <<<")
        driver.get(TARGET_URL)
        time.sleep(3)
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height: break
            last_height = new_height
        total_items = len(driver.find_elements(By.CSS_SELECTOR, SEL_CONTAINER))
        print(f"找到 {total_items} 个项目，开始处理...")
        session = requests.Session()
        for cookie in driver.get_cookies():
            session.cookies.set(cookie['name'], cookie['value'])
        headers = {"User-Agent": driver.execute_script("return navigator.userAgent;")}
        for i in range(total_items):
            try:
                print(f"\\n正在处理第 {i+1}/{total_items} 个...")
                items = driver.find_elements(By.CSS_SELECTOR, SEL_CONTAINER)
                if i >= len(items): break
                current_item = items[i]
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", current_item)
                time.sleep(0.5)
                title = current_item.find_element(By.CSS_SELECTOR, SEL_TITLE).text
                author = current_item.find_element(By.CSS_SELECTOR, SEL_AUTHOR).text
                img_src = ""
                try:
                    img_elem = current_item.find_element(By.CSS_SELECTOR, SEL_IMG)
                    img_src = img_elem.get_attribute('src')
                except: pass
                tags = []
                if NAV_LOGIC == 'click':
                    try:
                        click_target = None
                        if not SEL_CLICK or SEL_CLICK.strip() == SEL_CONTAINER:
                            click_target = current_item
                        else:
                            click_target = current_item.find_element(By.CSS_SELECTOR, SEL_CLICK)
                        click_target.click()
                        time.sleep(WAIT_TIME)
                        tag_elems = driver.find_elements(By.CSS_SELECTOR, SEL_TAGS)
                        raw_tags_list = [t.text.strip() for t in tag_elems]
                        seen = set()
                        for t in raw_tags_list:
                            ct = clean_filename(t)
                            if ct and ct not in seen:
                                tags.append(ct)
                                seen.add(ct)
                        print(f"获取到 Tags: {tags}")
                        driver.back()
                        time.sleep(WAIT_TIME)
                    except Exception as e:
                        print(f"进入详情页失败: {e}")
                        if len(driver.find_elements(By.CSS_SELECTOR, SEL_CONTAINER)) == 0:
                            driver.back()
                            time.sleep(WAIT_TIME)
                else:
                    try:
                        link_elem = current_item.find_element(By.CSS_SELECTOR, "a")
                        link = link_elem.get_attribute('href')
                        if link:
                            if not link.startswith('http'): link = 'https://bikawebapp.com' + link
                            res = session.get(link, headers=headers, verify=False)
                            if res.status_code == 200:
                                from bs4 import BeautifulSoup
                                soup = BeautifulSoup(res.text, 'html.parser')
                                raw_tags_list = [t.get_text(strip=True) for t in soup.select(SEL_TAGS)]
                                seen = set()
                                for t in raw_tags_list:
                                    ct = clean_filename(t)
                                    if ct and ct not in seen:
                                        tags.append(ct)
                                        seen.add(ct)
                                print(f"后台获取 Tags: {tags}")
                    except Exception as e:
                        print(f"Href 模式失败: {e}")
                if img_src:
                    safe_title = clean_filename(title)
                    safe_author = clean_filename(author)
                    tag_str = "-".join(tags)
                    filename = f"{safe_title}_{safe_author}"
                    if tag_str: filename += f"_{tag_str}"
                    filename += ".jpg"
                    try:
                        ir = session.get(img_src, headers=headers, verify=False, timeout=15)
                        if ir.status_code == 200:
                            with open(os.path.join(OUTPUT_DIR, filename), "wb") as f:
                                f.write(ir.content)
                            print(f"保存成功: {filename}")
                        else:
                            print(f"图片下载失败 {ir.status_code}")
                    except Exception as e:
                        print(f"下载异常: {e}")
            except Exception as e:
                print(f"Item Loop Error: {e}")
                continue
    except Exception as e:
        print(f"Global Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    run_selenium()`;
    }
    setGeneratedCode(py);
  }, [config, mode]);
  const handleChange = (e) => {
    const { id, value } = e.target;
    setConfig(prev => ({ ...prev, [id]: value }));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert("代码已复制！");
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* 左侧配置区 */}
      <div className="lg:col-span-5 space-y-6 h-[80vh] overflow-y-auto pr-2">
        {/* ... (Header 和 模式切换按钮保持不变) ... */}
        <h2 className="font-serif text-3xl mb-3 dark:text-white flex items-center gap-2">
            <Terminal /> 漫画爬虫配置
        </h2>
        <div className="bg-gray-100 dark:bg-neutral-900 rounded-lg p-1 flex mb-4">
            <button onClick={() => setMode('selenium')} className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${mode === 'selenium' ? 'bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>Selenium 交互</button>
            <button onClick={() => setMode('token')} className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${mode === 'token' ? 'bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>Cookie 请求</button>
        </div>

        <div className="space-y-4">
            {/* 1. 登录与地址 (保持不变) */}
            <div className="space-y-3 p-4 border border-gray-200 dark:border-neutral-800 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2 flex items-center gap-1"><Shield size={12}/> 访问与登录</h3>
                <label className="block"><span className="text-xs font-bold text-gray-400">登录页地址</span><input id="loginUrl" value={config.loginUrl} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none" type="text"/></label>
                <label className="block"><span className="text-xs font-bold text-gray-400">列表页地址</span><input id="targetUrl" value={config.targetUrl} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none" type="text"/></label>
            </div>

            {/* 2. 详情页进入逻辑 (增加 waitTime) */}
            {mode === 'selenium' && (
                <div className="space-y-3 p-4 border border-gray-200 dark:border-neutral-800 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-2 flex items-center gap-1"><MousePointer size={12}/> 详情页逻辑</h3>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="navLogic" checked={config.navLogic === 'click'} onChange={() => setConfig(prev => ({...prev, navLogic: 'click'}))} />
                            <span className="text-xs font-bold dark:text-gray-200">模拟点击</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="navLogic" checked={config.navLogic === 'href'} onChange={() => setConfig(prev => ({...prev, navLogic: 'href'}))} />
                            <span className="text-xs font-bold dark:text-gray-200">提取链接</span>
                        </label>
                    </div>
                    {config.navLogic === 'click' ? (
                        <>
                            <label className="block"><span className="text-xs font-bold text-gray-400">点击选择器</span><input id="clickSelector" value={config.clickSelector} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none" type="text"/></label>
                            {/* [修复] 添加等待时间输入 */}
                            <label className="block mt-2"><span className="text-xs font-bold text-gray-400">跳转等待时间 (秒)</span><input id="waitTime" value={config.waitTime} onChange={handleChange} className="w-20 mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none" type="number"/></label>
                        </>
                    ) : (
                        <label className="block"><span className="text-xs font-bold text-gray-400">链接选择器 (a)</span><input id="hrefSelector" value={config.hrefSelector} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none" type="text"/></label>
                    )}
                </div>
            )}

            {/* 3. [修复] 元素提取选择器 (补全缺失部分) */}
            <div className="space-y-3 p-4 border border-gray-200 dark:border-neutral-800 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-500 mb-2 flex items-center gap-1"><ScanLine size={12}/> 元素提取</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="block"><span className="text-xs font-bold text-gray-400">列表容器</span><input id="container" value={config.container} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-green-500 transition-colors" type="text"/></label></div>
                    <label className="block"><span className="text-xs font-bold text-gray-400">标题</span><input id="title" value={config.title} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-green-500 transition-colors" type="text"/></label>
                    <label className="block"><span className="text-xs font-bold text-gray-400">作者</span><input id="author" value={config.author} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-green-500 transition-colors" type="text"/></label>
                    <div className="col-span-2"><label className="block"><span className="text-xs font-bold text-gray-400">封面图片</span><input id="img" value={config.img} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-green-500 transition-colors" type="text"/></label></div>
                    <div className="col-span-2"><label className="block"><span className="text-xs font-bold text-gray-400">详情页标签</span><input id="tags" value={config.tags} onChange={handleChange} className="w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-green-500 transition-colors" type="text"/></label></div>
                </div>
            </div>
        </div>
      </div>

      {/* 右侧代码区 (保持不变) */}
      <div className="lg:col-span-7 flex flex-col h-[80vh]">
        <div className="flex items-center justify-between pb-2 mb-2">
            <span className="font-mono text-sm text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>spider.py</span>
            <button onClick={copyCode} className="bg-black dark:bg-white text-white dark:text-black px-4 py-1 rounded text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1">
                <Copy size={12}/> 复制代码
            </button>
        </div>
        <div className="relative flex-grow bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
            <div className="absolute inset-0 overflow-auto p-5 scrollbar-thin">
                <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-all">{generatedCode}</pre>
            </div>
        </div>
      </div>
    </div>
  );
};