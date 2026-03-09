export default async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, university, major, phone, year } = req.body;

  // 필수값 검증
  if (!name || !university || !major || !phone || !year) {
    return res.status(400).json({ error: '모든 항목을 입력해주세요.' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_ID },
        properties: {
          '이름':     { title: [{ text: { content: name } }] },
          '대학교':   { rich_text: [{ text: { content: university } }] },
          '학과':     { rich_text: [{ text: { content: major } }] },
          '연락처':   { phone_number: phone },
          '학번':     { select: { name: year } },
          '신청일시': { date: { start: new Date().toISOString() } },
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Notion API error:', err);
      return res.status(500).json({ error: '노션 저장 실패' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
