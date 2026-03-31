'use client'

import { useState, useEffect } from 'react'

interface Member {
  id: string
  name: string
  phone: string
  school: string
  grade: string
  checked_in_at?: string
}

interface MembersTableProps {
  onDataLoaded?: (members: Member[]) => void
}

export function MembersTable({ onDataLoaded }: MembersTableProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.data || [])
        onDataLoaded?.(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-400">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <div className="mb-4">
        <input
          type="text"
          placeholder="이름 또는 연락처로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-2 text-slate-400">이름</th>
              <th className="text-left py-3 px-2 text-slate-400">연락처</th>
              <th className="text-left py-3 px-2 text-slate-400">학교</th>
              <th className="text-left py-3 px-2 text-slate-400">학년</th>
              <th className="text-left py-3 px-2 text-slate-400">출석</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr
                key={member.id}
                className="border-b border-slate-700 hover:bg-slate-700"
              >
                <td className="py-3 px-2 text-white">{member.name}</td>
                <td className="py-3 px-2 text-slate-300">{member.phone}</td>
                <td className="py-3 px-2 text-slate-300">{member.school}</td>
                <td className="py-3 px-2 text-slate-300">{member.grade}</td>
                <td className="py-3 px-2">
                  {member.checked_in_at ? (
                    <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs">
                      ✓
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
                      -
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-slate-400 text-sm">
        총 {filteredMembers.length}명 / {members.length}명
      </div>
    </div>
  )
}
