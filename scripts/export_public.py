from pathlib import Path
import re, shutil, yaml

VAULT = Path(r'D:\个人\27秋招填报个人知识库')
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'content'
# Public whitelist: interview knowledge only. Personalized/private interview-defense notes are excluded.
INCLUDE = [
    'wiki/interview/AI应用开发岗位STAR故事库.md',
    'wiki/interview/XMagital面试防御清单.md',
    'wiki/interview/XMagital项目叙事脚本.md',
    'wiki/interview/XMagital项目数据口径.md',
    'wiki/interview/XMagital项目面试速查卡.md',
    'wiki/interview/团队协作与职责边界.md',
    'wiki/interview/央国企研究所项目面试问答.md',
    'wiki/interview/科研院所面试专项.md',
    'wiki/interview/护城河与不可替代性.md',
    'wiki/interview/高频问答库.md',
    'wiki/projects/千言·AI智能助手后端系统.md',
]
EXCLUDED_LINKS = {
    'index','log','AGENTS','SCHEMA','自我介绍与核心竞争力','动机与稳定性话术',
    '科研院所投递记录','家庭与政审','证明材料索引','个人基础信息','身份与联系方式',
    '教育背景','工作与实习经历','荣誉证书与干部经历','求职意向','技能栈','项目经历',
}
PHONE = re.compile(r'(?<!\d)1[3-9]\d{9}(?!\d)')
EMAIL = re.compile(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}')
PATH = re.compile(r'(?:(?:[A-Za-z]:[\\/])|(?:/c/Users/)|(?:/d/))[^\n`)]*', re.I)
PRIVATE = re.compile(r'(?im)^.*(?:女朋友|未婚妻|婚姻状况|单身|家庭成员|证明人|手机号|联系方式|身份证|户口|政审|投递记录|已投递|面试复盘|社招外包|离职原因).*$\n?')


def scrub(text: str) -> str:
    text = re.sub(r'^---[\s\S]*?---\s*', '', text, count=1)
    text = text.replace('王振东', '候选人')
    text = PHONE.sub('[联系方式已脱敏]', text)
    text = EMAIL.sub('[邮箱已脱敏]', text)
    text = PATH.sub('[本地路径已隐藏]', text)
    text = re.sub(r'https://[^\s)]+feishu\.cn[^\s)]*', '[私有文档链接已隐藏]', text)
    text = PRIVATE.sub('', text)
    # Remove wikilinks to private/unpublished pages; keep display text.
    def link(m):
        name, label = m.group(1).strip(), m.group(2)
        if name in EXCLUDED_LINKS:
            return label or name
        # Keep publishable Obsidian links intact. The site builder owns the
        # final category-aware URL mapping.
        return f'[[{name}|{label}]]' if label else f'[[{name}]]'
    text = re.sub(r'\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]', link, text)
    # Remove source/local metadata lines and malformed Markdown links left by
    # redaction so they cannot become broken public links.
    text = re.sub(r'(?im)^\s*(?:source_url|source|项目地址|原始资料)\s*[:：|].*$', '', text)
    text = re.sub(r'\[[^\]]+\]\(http\[本地路径已隐藏\]\)', '[相关私有链接已隐藏]', text)
    return text.strip() + '\n'


def slug(name: str) -> str:
    return name.replace(' ', '-').replace('/', '-')

OUT.mkdir(parents=True, exist_ok=True)
for p in OUT.glob('*.md'):
    p.unlink()
manifest=[]
for rel in INCLUDE:
    src=VAULT / rel
    if not src.exists():
        raise FileNotFoundError(src)
    dst=OUT / src.name
    dst.write_text(scrub(src.read_text(encoding='utf-8', errors='ignore')), encoding='utf-8')
    manifest.append(src.name)
# Public memorization cards are curated separately from the private vault.
EXTRA = ROOT / 'public-extra'
for src in sorted(EXTRA.glob('*.md')):
    dst = OUT / src.name
    dst.write_text(scrub(src.read_text(encoding='utf-8', errors='ignore')), encoding='utf-8')
    manifest.append(src.name)
(OUT/'index.md').write_text('# 央国企 / 科研院所面试知识库\n\n项目表达、技术总结、结构化面试和研究所求职方法。\n',encoding='utf-8')
(ROOT/'publish-manifest.yaml').write_text('include:\n' + ''.join(f'  - {x}\n' for x in INCLUDE) + 'extra_public_cards:\n' + ''.join(f'  - {x.name}\n' for x in sorted(EXTRA.glob('*.md'))) + '\nexclude:\n  - personal_information\n  - contact_and_family\n  - private_interview_defense\n  - configs_and_local_paths\n',encoding='utf-8')
print('exported',len(manifest),'pages')
for x in manifest: print(x)
