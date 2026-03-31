import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PROGEN - 강의노트',
  robots: { index: false, follow: false },
}

const DOCS_DIR = path.join(process.cwd(), 'content/docs')

interface DocMeta {
  slug: string
  title: string
  description: string
  date: string
  order: number
}

function getAllDocs(): DocMeta[] {
  if (!fs.existsSync(DOCS_DIR)) return []
  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.mdx'))
  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(DOCS_DIR, filename), 'utf-8')
      const { data } = matter(raw)
      return {
        slug: filename.replace(/\.mdx$/, ''),
        title: data.title ?? filename,
        description: data.description ?? '',
        date: data.date ?? '',
        order: data.order ?? 99,
      }
    })
    .sort((a, b) => a.order - b.order)
}

function getDoc(slug: string): { meta: DocMeta; content: string } | null {
  const filePath = path.join(DOCS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    meta: {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      date: data.date ?? '',
      order: data.order ?? 99,
    },
    content,
  }
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const docs = getAllDocs()

  // 목록 페이지 (/docs)
  if (!slug || slug.length === 0) {
    return (
      <main className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">강의노트</h1>
            <p className="text-slate-400">세미나 자료를 복습하세요.</p>
          </div>

          {docs.length === 0 ? (
            <div className="text-center py-24 text-slate-500">아직 등록된 강의노트가 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="block bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-600 transition-colors group"
                >
                  <h2 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors mb-1">
                    {doc.title}
                  </h2>
                  {doc.description && (
                    <p className="text-slate-400 text-sm mb-2">{doc.description}</p>
                  )}
                  {doc.date && (
                    <p className="text-slate-600 text-xs">{doc.date}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </main>
    )
  }

  // 개별 문서 페이지
  const docSlug = slug.join('/')
  const doc = getDoc(docSlug)
  if (!doc) notFound()

  const currentIndex = docs.findIndex((d) => d.slug === docSlug)
  const prev = currentIndex > 0 ? docs[currentIndex - 1] : null
  const next = currentIndex < docs.length - 1 ? docs[currentIndex + 1] : null

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 뒤로 가기 */}
        <Link href="/docs" className="inline-flex items-center gap-1 text-slate-500 hover:text-white text-sm mb-8 transition-colors">
          ← 강의노트 목록
        </Link>

        {/* 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{doc.meta.title}</h1>
          {doc.meta.date && (
            <p className="text-slate-500 text-sm">{doc.meta.date}</p>
          )}
        </div>

        {/* MDX 본문 */}
        <article className="prose prose-invert prose-purple max-w-none
          prose-headings:text-white
          prose-p:text-slate-300
          prose-a:text-purple-400
          prose-strong:text-white
          prose-code:text-purple-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
          prose-li:text-slate-300
          prose-hr:border-slate-700
        ">
          <MDXRemote source={doc.content} />
        </article>

        {/* 이전/다음 */}
        {(prev || next) && (
          <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between gap-4">
            {prev ? (
              <Link href={`/docs/${prev.slug}`} className="group flex-1 bg-slate-800 rounded-lg p-4 hover:border-purple-600 border border-slate-700 transition-colors">
                <p className="text-slate-500 text-xs mb-1">← 이전</p>
                <p className="text-white text-sm font-medium group-hover:text-purple-300 transition-colors">{prev.title}</p>
              </Link>
            ) : <div className="flex-1" />}
            {next ? (
              <Link href={`/docs/${next.slug}`} className="group flex-1 bg-slate-800 rounded-lg p-4 hover:border-purple-600 border border-slate-700 transition-colors text-right">
                <p className="text-slate-500 text-xs mb-1">다음 →</p>
                <p className="text-white text-sm font-medium group-hover:text-purple-300 transition-colors">{next.title}</p>
              </Link>
            ) : <div className="flex-1" />}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}

export async function generateStaticParams() {
  const docs = getAllDocs()
  return [
    { slug: undefined },
    ...docs.map((doc) => ({ slug: [doc.slug] })),
  ]
}
