import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function About() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-12">PROGEN에 대해</h1>

        <div className="space-y-12">
          {/* Vision */}
          <section>
            <h2 className="text-3xl font-semibold text-white mb-4">우리의 비전</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              PROGEN은 단순한 교육 플랫폼을 넘어, 실제 프로젝트를 통해 개발자들이
              성장하는 생태계를 만드는 것을 목표로 합니다. 우리는 이론과 실전의 간격을
              좁히고, 함께 배우고 성장하는 커뮤니티를 지향합니다.
            </p>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-3xl font-semibold text-white mb-8">우리의 특징</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-500 mb-3">
                  실전 프로젝트
                </h3>
                <p className="text-slate-300">
                  이론 학습을 넘어 실제 프로젝트에 참여하며 실무 경험을 쌓아보세요.
                </p>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-500 mb-3">
                  전문가 멘토링
                </h3>
                <p className="text-slate-300">
                  경험 많은 멘토들의 피드백과 지도를 통해 더 빠르게 성장하세요.
                </p>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-500 mb-3">
                  네트워킹
                </h3>
                <p className="text-slate-300">
                  같은 꿈을 가진 개발자들과 만나 네트워크를 확장하세요.
                </p>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-500 mb-3">
                  커뮤니티
                </h3>
                <p className="text-slate-300">
                  함께 성장하는 커뮤니티 문화 속에서 지속적인 동기부여를 얻으세요.
                </p>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="text-3xl font-semibold text-white mb-8">1기 일정</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-purple-500 font-semibold">3월</div>
                <div className="text-slate-300">크루 지원 및 선발</div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-purple-500 font-semibold">4월</div>
                <div className="text-slate-300">오리엔테이션 및 팀 구성</div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-purple-500 font-semibold">5-8월</div>
                <div className="text-slate-300">프로젝트 진행 및 멘토링</div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-purple-500 font-semibold">9월</div>
                <div className="text-slate-300">최종 발표 및 피드백</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
